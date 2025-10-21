import { getExecOutput, exec } from '@actions/exec';
import * as conventionalCommitsParser from 'conventional-commits-parser';
import * as core from '@actions/core';

/**
 * Represents a git tag with optional module and version information.
 * 
 * Tags can be either module-specific (e.g., 'module@1.0.0') or general (e.g., 'v1.0.0').
 */
export type GitTag = {
  /** The full tag name as it appears in git */
  readonly name: string;
  /** The git commit hash that this tag points to */
  readonly hash: string;
  /** The module name extracted from the tag (e.g., 'core' from 'core@1.0.0') */
  readonly module?: string;
  /** The version extracted from the tag (e.g., '1.0.0' from 'core@1.0.0' or 'v1.0.0') */
  readonly version?: string;
};

/**
 * Configuration options for git operations.
 */
export type GitOptions = {
  /** The working directory in which to execute git commands. Defaults to process.cwd() */
  readonly cwd?: string;
};

/**
 * Represents a parsed git commit with conventional commit information.
 * 
 * Commits are parsed using the Conventional Commits specification to extract
 * semantic versioning information like type, scope, and breaking changes.
 * 
 * @see https://www.conventionalcommits.org/
 */
export type CommitInfo = {
  /** The full SHA-1 hash of the commit */
  readonly hash: string;
  /** The commit type (e.g., 'feat', 'fix', 'docs', 'chore') */
  readonly type: string;
  /** Optional scope that provides additional context (e.g., 'api', 'core') */
  readonly scope?: string;
  /** The commit subject/message without type and scope */
  readonly subject: string;
  /** The full commit body text, if present */
  readonly body?: string;
  /** Whether this commit contains breaking changes (BREAKING CHANGE in footer) */
  readonly breaking: boolean;
  /** Optional module name if commit is module-specific */
  readonly module?: string;
};

/**
 * Retrieves all commits for a module since its last release tag.
 * 
 * This function finds the most recent tag for the specified module and retrieves
 * all commits from that tag to HEAD. For modules without tags, it returns all
 * commits in the repository. Child module paths can be excluded to prevent
 * commit overlap in parent-child relationships.
 * 
 * @param modulePath - Relative path to the module from repository root (e.g., 'core', 'api/v1', '.')
 * @param moduleName - Name of the module used for tag searching (e.g., 'core', 'api')
 * @param moduleType - Type of module: 'root' for root project, 'module' for submodules
 * @param options - Git operation options including working directory
 * @param excludePaths - Paths to exclude using git pathspec (e.g., child module paths)
 * 
 * @returns Promise resolving to an array of parsed commit information
 * 
 * @throws {Error} If git operations fail
 * 
 * @example
 * ```typescript
 * // Get commits for 'core' module excluding child modules
 * const commits = await getCommitsSinceLastTag(
 *   'core',
 *   'core',
 *   'module',
 *   { cwd: '/repo' },
 *   ['core/api', 'core/impl']
 * );
 * ```
 */
export async function getCommitsSinceLastTag(
  modulePath: string,
  moduleName: string,
  moduleType: 'root' | 'module',
  options: GitOptions = {},
  excludePaths: string[] = []
): Promise<CommitInfo[]> {
  const cwd = options.cwd || process.cwd();
  
  try {
    // Find the last tag for this module
    const lastTag = await getLastTagForModule(moduleName, moduleType, { cwd });
    
    // Get commits since that tag
    const range = lastTag ? `${lastTag}..HEAD` : '';
    return getCommitsInRange(range, modulePath, { cwd }, excludePaths);
  } catch (error) {
    // If no tags found, get all commits
    return getCommitsInRange('', modulePath, { cwd }, excludePaths);
  }
}

/**
 * Retrieves commits within a specific git range, with optional path filtering.
 * 
 * This function executes `git log` with the specified range and paths, using git's
 * native pathspec syntax for exclusions. The pathspec ':(exclude)path' syntax allows
 * efficient filtering at the git level rather than post-processing.
 * 
 * @param range - Git revision range (e.g., 'v1.0.0..HEAD', 'main..feature'). Empty string returns all commits
 * @param pathFilter - Path to filter commits by. Only commits touching this path are included
 * @param options - Git operation options including working directory
 * @param excludePaths - Paths to exclude using git pathspec ':(exclude)' syntax
 * 
 * @returns Promise resolving to an array of parsed commit information
 * 
 * @example
 * ```typescript
 * // Get commits in range for a path, excluding subdirectories
 * const commits = await getCommitsInRange(
 *   'v1.0.0..HEAD',
 *   'src/core',
 *   { cwd: '/repo' },
 *   ['src/core/api', 'src/core/impl']
 * );
 * // Equivalent to: git log v1.0.0..HEAD -- src/core :(exclude)src/core/api :(exclude)src/core/impl
 * ```
 */
export async function getCommitsInRange(
  range: string,
  pathFilter?: string,
  options: GitOptions = {},
  excludePaths: string[] = []
): Promise<CommitInfo[]> {
  const cwd = options.cwd || process.cwd();
  
  try {
    const args = ['log', '--format=%H%n%s%n%b%n---COMMIT-END---'];
    
    // Only add range if it's not empty
    if (range.trim()) {
      args.push(range);
    }
    
    // Add path filter if provided and not root
    if (pathFilter && pathFilter !== '.') {
      args.push('--', pathFilter);
    } else if (excludePaths.length > 0) {
      // For root path, we still need to add the pathspec separator
      args.push('--');
    }

    for (const excludePath of excludePaths) {
      if (excludePath && excludePath !== '.') {
        args.push(`:(exclude)${excludePath}`);
      }
    }
    
    const { stdout } = await getExecOutput('git', args, {
      cwd,
      silent: true
    });
    
    return parseGitLog(stdout);
  } catch (error) {
    core.warning(`Warning: Failed to get git commits: ${error}`);
    return [];
  }
}

/**
 * Parses raw git log output into structured CommitInfo objects.
 * 
 * This function processes git log output formatted with custom delimiters and
 * parses each commit using the Conventional Commits specification. Commits that
 * don't follow the convention are treated as 'unknown' type.
 * 
 * @param output - Raw output from git log command with custom format
 * 
 * @returns Array of parsed commit information objects
 * 
 * @example
 * ```typescript
 * const output = "abc123\nfeat: add feature\nbody text\n---COMMIT-END---";
 * const commits = parseGitLog(output);
 * // Returns: [{ hash: 'abc123', type: 'feat', subject: 'add feature', ... }]
 * ```
 * 
 * @private
 */
function parseGitLog(output: string): CommitInfo[] {
  if (!output.trim()) {
    return [];
  }
  
  const commits: CommitInfo[] = [];
  const commitBlocks = output.split('---COMMIT-END---').filter(block => block.trim());
  
  for (const block of commitBlocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;
    
    const hash = lines[0];
    const subject = lines[1];
    const body = lines.slice(2).join('\n').trim();
    
    try {
      const parsed = conventionalCommitsParser.sync(subject + '\n\n' + body);
      
      commits.push({
        hash,
        type: parsed.type || 'unknown',
        scope: parsed.scope || undefined,
        subject: parsed.subject || subject,
        body: body || undefined,
        breaking: parsed.notes?.some(note => note.title === 'BREAKING CHANGE') || false,
      });
    } catch (error) {
      // If parsing fails, treat as unknown commit type
      commits.push({
        hash,
        type: 'unknown',
        subject,
        body: body || undefined,
        breaking: false,
      });
    }
  }
  
  return commits;
}

/**
 * Finds the most recent git tag for a specific module.
 * 
 * This function searches for module-specific tags first (e.g., 'module@1.0.0'),
 * and falls back to general tags if none are found. For root modules, it skips
 * the module-specific search and goes directly to general tags.
 * 
 * @param moduleName - Name of the module to find tags for
 * @param moduleType - Type of module: 'root' for root project, 'module' for submodules
 * @param options - Git operation options including working directory
 * 
 * @returns Promise resolving to the tag name, or null if no tags exist
 * 
 * @example
 * ```typescript
 * // Find last tag for 'core' module
 * const tag = await getLastTagForModule('core', 'module', { cwd: '/repo' });
 * // Returns: 'core@1.2.3' or 'v1.2.3' or null
 * ```
 */
export async function getLastTagForModule(
  moduleName: string,
  moduleType: 'root' | 'module',
  options: GitOptions = {}
): Promise<string | null> {
  const cwd = options.cwd || process.cwd();
  
  try {
    // Try to find module-specific tags first (e.g., module@1.0.0)
    const moduleTagPattern = getModuleTagPattern(moduleName);
    
    // Only search for module-specific tags if it's not root
    if (moduleType !== 'root') {
      const { stdout } = await getExecOutput('git', ['tag', '-l', moduleTagPattern, '--sort=-version:refname'], {
        cwd,
        silent: true
      });
      
      if (stdout.trim()) {
        return stdout.trim().split('\n')[0];
      }
    }
    
    // Fallback to general tags
    try {
      const { stdout: fallbackOutput } = await getExecOutput('git', ['describe', '--tags', '--abbrev=0', 'HEAD'], {
        cwd,
        silent: true
      });
      
      return fallbackOutput.trim();
    } catch {
      // If no tags at all, return null
      return null;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves all git tags in the repository with their metadata.
 * 
 * This function fetches all tags and parses them to extract module names and
 * versions. Tags are returned with their full names, commit hashes, and parsed
 * module/version information when available.
 * 
 * @param options - Git operation options including working directory
 * 
 * @returns Promise resolving to an array of GitTag objects
 * 
 * @example
 * ```typescript
 * const tags = await getAllTags({ cwd: '/repo' });
 * // Returns: [
 * //   { name: 'core@1.0.0', hash: 'abc123', module: 'core', version: '1.0.0' },
 * //   { name: 'v2.0.0', hash: 'def456', version: '2.0.0' }
 * // ]
 * ```
 */
export async function getAllTags(options: GitOptions = {}): Promise<GitTag[]> {
  const cwd = options.cwd || process.cwd();
  
  try {
    const { stdout } = await getExecOutput('git', ['tag', '-l', '--format=%(refname:short) %(objectname)'], {
      cwd,
      silent: true
    });
    
    return stdout
      .trim()
      .split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => {
        const [name, hash] = line.split(' ');
        const { module, version } = parseTagName(name);
        
        return {
          name,
          hash,
          module,
          version,
        };
      });
  } catch (error) {
    return [];
  }
}

/**
 * Creates an annotated git tag at the current HEAD.
 * 
 * This function creates a git annotated tag (with -a flag) which includes
 * metadata like tagger name, date, and message. Annotated tags are preferred
 * for releases as they contain more information than lightweight tags.
 * 
 * @param tagName - Name for the new tag (e.g., 'v1.0.0', 'core@1.0.0')
 * @param message - Annotation message for the tag
 * @param options - Git operation options including working directory
 * 
 * @returns Promise that resolves when tag is created
 * 
 * @throws {Error} If tag creation fails (e.g., tag already exists, not a git repo)
 * 
 * @example
 * ```typescript
 * await createTag('v1.0.0', 'Release version 1.0.0', { cwd: '/repo' });
 * ```
 */
export async function createTag(
  tagName: string,
  message: string,
  options: GitOptions = {}
): Promise<void> {
  const cwd = options.cwd || process.cwd();
  
  try {
    await exec('git', ['tag', '-a', tagName, '-m', message], {
      cwd
    });
  } catch (error) {
    throw new Error(`Failed to create tag ${tagName}: ${error}`);
  }
}

/**
 * Pushes all local tags to the remote repository.
 * 
 * This function executes `git push --tags` to upload all tags that don't
 * already exist on the remote. Note that this only pushes tags, not commits.
 * 
 * @param options - Git operation options including working directory
 * 
 * @returns Promise that resolves when tags are pushed
 * 
 * @throws {Error} If push fails (e.g., no remote, authentication failure)
 * 
 * @example
 * ```typescript
 * await pushTags({ cwd: '/repo' });
 * ```
 */
export async function pushTags(options: GitOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  
  try {
    await exec('git', ['push', '--tags'], { cwd });
  } catch (error) {
    throw new Error(`Failed to push tags: ${error}`);
  }
}

/**
 * Generates a git tag search pattern for a specific module.
 * 
 * This function creates a glob pattern used to find all tags belonging to a module.
 * The pattern follows the format 'moduleName@*' to match tags like 'core@1.0.0'.
 * 
 * @param moduleName - Name of the module
 * 
 * @returns Glob pattern for matching module-specific tags
 * 
 * @example
 * ```typescript
 * getModuleTagPattern('core')  // Returns: 'core@*'
 * // Matches: 'core@1.0.0', 'core@2.1.0-alpha', etc.
 * ```
 * 
 * @private
 */
function getModuleTagPattern(moduleName: string): string {
  return `${moduleName}@*`;
}

/**
 * Parses a git tag name to extract module and version components.
 * 
 * This function handles multiple tag formats:
 * - Module-specific tags: 'module@1.0.0' → { module: 'module', version: '1.0.0' }
 * - Version-only tags: 'v1.0.0' or '1.0.0' → { version: '1.0.0' }
 * - Unrecognized formats → {}
 * 
 * @param tagName - The git tag name to parse
 * 
 * @returns Object containing extracted module and/or version, or empty object if unparseable
 * 
 * @example
 * ```typescript
 * parseTagName('core@1.0.0')  // { module: 'core', version: '1.0.0' }
 * parseTagName('v2.1.0')      // { version: '2.1.0' }
 * parseTagName('1.0.0')       // { version: '1.0.0' }
 * parseTagName('random-tag')  // {}
 * ```
 * 
 * @private
 */
function parseTagName(tagName: string): { module?: string; version?: string } {
  const match = tagName.match(/^(.+)@(.+)$/);
  
  if (match) {
    return {
      module: match[1],
      version: match[2],
    };
  }
  
  // Check if it's just a version
  const versionMatch = tagName.match(/^v?(\d+\.\d+\.\d+.*)$/);
  if (versionMatch) {
    return {
      version: versionMatch[1],
    };
  }
  
  return {};
}

/**
 * Checks if the git working directory has any uncommitted changes.
 * 
 * This function uses `git status --porcelain` to detect any modified, added,
 * deleted, or untracked files. A clean working directory returns true.
 * 
 * @param options - Git operation options including working directory
 * 
 * @returns Promise resolving to true if no changes exist, false otherwise
 * 
 * @example
 * ```typescript
 * const isClean = await isWorkingDirectoryClean({ cwd: '/repo' });
 * if (!isClean) {
 *   console.log('Please commit or stash your changes');
 * }
 * ```
 */
export async function isWorkingDirectoryClean(options: GitOptions = {}): Promise<boolean> {
  const cwd = options.cwd || process.cwd();
  
  try {
    const { stdout } = await getExecOutput('git', ['status', '--porcelain'], {
      cwd,
      silent: true
    });
    
    return stdout.trim() === '';
  } catch (error) {
    return false;
  }
}

/**
 * Retrieves the name of the currently checked out git branch.
 * 
 * This function executes `git branch --show-current` to get the active branch name.
 * In detached HEAD state, this will return an empty string.
 * 
 * @param options - Git operation options including working directory
 * 
 * @returns Promise resolving to the current branch name
 * 
 * @throws {Error} If git command fails (e.g., not a git repository)
 * 
 * @example
 * ```typescript
 * const branch = await getCurrentBranch({ cwd: '/repo' });
 * console.log(`Current branch: ${branch}`);  // "main" or "feature/new-feature"
 * ```
 */
export async function getCurrentBranch(options: GitOptions = {}): Promise<string> {
  const cwd = options.cwd || process.cwd();
  
  try {
    const { stdout } = await getExecOutput('git', ['branch', '--show-current'], {
      cwd,
      silent: true
    });
    
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get current branch: ${error}`);
  }
}

/**
 * Retrieves the abbreviated SHA-1 hash of the current HEAD commit.
 * 
 * This function returns the short (7-character) version of the commit hash,
 * which is useful for build metadata and user-facing displays.
 * 
 * @param options - Git operation options including working directory
 * 
 * @returns Promise resolving to the short commit SHA (e.g., 'abc1234')
 * 
 * @throws {Error} If git command fails (e.g., not a git repository)
 * 
 * @example
 * ```typescript
 * const sha = await getCurrentCommitShortSha({ cwd: '/repo' });
 * console.log(`Build metadata: +${sha}`);  // "Build metadata: +abc1234"
 * ```
 */
export async function getCurrentCommitShortSha(options: GitOptions = {}): Promise<string> {
  const cwd = options.cwd || process.cwd();
  
  try {
    const { stdout } = await getExecOutput('git', ['rev-parse', '--short', 'HEAD'], {
      cwd,
      silent: true
    });
    
    return stdout.trim();
  } catch (error) {
    throw new Error(`Failed to get current commit SHA: ${error}`);
  }
}

/**
 * Stages all changed files in the working directory for commit.
 * 
 * This function executes `git add .` to stage all modified, new, and deleted files.
 * Use with caution as it stages everything in the working directory.
 * 
 * @param options - Git operation options including working directory
 * 
 * @returns Promise that resolves when files are staged
 * 
 * @throws {Error} If git add command fails
 * 
 * @example
 * ```typescript
 * await addChangedFiles({ cwd: '/repo' });
 * // All changes are now staged for commit
 * ```
 */
export async function addChangedFiles(options: GitOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  
  try {
    await exec('git', ['add', '.'], { cwd });
  } catch (error) {
    throw new Error(`Failed to add changed files: ${error}`);
  }
}

/**
 * Creates a git commit with the specified message.
 * 
 * This function commits all currently staged changes with the provided message.
 * Files must be staged (via `git add`) before calling this function.
 * 
 * @param message - Commit message to use
 * @param options - Git operation options including working directory
 * 
 * @returns Promise that resolves when commit is created
 * 
 * @throws {Error} If commit fails (e.g., no staged changes, no git user configured)
 * 
 * @example
 * ```typescript
 * await commitChanges('chore: update versions', { cwd: '/repo' });
 * ```
 */
export async function commitChanges(message: string, options: GitOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  
  try {
    await exec('git', ['commit', '-m', message], { cwd });
  } catch (error) {
    throw new Error(`Failed to commit changes: ${error}`);
  }
}

/**
 * Pushes local commits to the remote repository.
 * 
 * This function executes `git push` to upload the current branch's commits
 * to its upstream remote branch.
 * 
 * @param options - Git operation options including working directory
 * 
 * @returns Promise that resolves when commits are pushed
 * 
 * @throws {Error} If push fails (e.g., no remote, authentication failure, rejected)
 * 
 * @example
 * ```typescript
 * await pushCommits({ cwd: '/repo' });
 * ```
 */
export async function pushCommits(options: GitOptions = {}): Promise<void> {
  const cwd = options.cwd || process.cwd();
  
  try {
    await exec('git', ['push'], { cwd });
  } catch (error) {
    throw new Error(`Failed to push commits: ${error}`);
  }
}

/**
 * Checks if there are any changes in the working directory or staging area.
 * 
 * This function uses `git status --porcelain` to detect both staged and unstaged
 * changes, including untracked files. Returns true if any changes exist.
 * 
 * @param options - Git operation options including working directory
 * 
 * @returns Promise resolving to true if changes exist, false if working directory is clean
 * 
 * @throws {Error} If git status command fails
 * 
 * @example
 * ```typescript
 * if (await hasChangesToCommit({ cwd: '/repo' })) {
 *   await commitChanges('Auto-commit changes');
 * }
 * ```
 */
export async function hasChangesToCommit(options: GitOptions = {}): Promise<boolean> {
  const cwd = options.cwd || process.cwd();
  
  try {
    const { stdout } = await getExecOutput('git', ['status', '--porcelain'], {
      cwd,
      silent: true
    });
    
    return stdout.trim().length > 0;
  } catch (error) {
    throw new Error(`Failed to check git status: ${error}`);
  }
}
