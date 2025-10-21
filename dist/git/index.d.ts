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
export declare function getCommitsSinceLastTag(modulePath: string, moduleName: string, moduleType: 'root' | 'module', options?: GitOptions, excludePaths?: string[]): Promise<CommitInfo[]>;
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
export declare function getCommitsInRange(range: string, pathFilter?: string, options?: GitOptions, excludePaths?: string[]): Promise<CommitInfo[]>;
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
export declare function getLastTagForModule(moduleName: string, moduleType: 'root' | 'module', options?: GitOptions): Promise<string | null>;
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
export declare function getAllTags(options?: GitOptions): Promise<GitTag[]>;
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
export declare function createTag(tagName: string, message: string, options?: GitOptions): Promise<void>;
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
export declare function pushTags(options?: GitOptions): Promise<void>;
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
export declare function isWorkingDirectoryClean(options?: GitOptions): Promise<boolean>;
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
export declare function getCurrentBranch(options?: GitOptions): Promise<string>;
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
export declare function getCurrentCommitShortSha(options?: GitOptions): Promise<string>;
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
export declare function addChangedFiles(options?: GitOptions): Promise<void>;
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
export declare function commitChanges(message: string, options?: GitOptions): Promise<void>;
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
export declare function pushCommits(options?: GitOptions): Promise<void>;
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
export declare function hasChangesToCommit(options?: GitOptions): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map