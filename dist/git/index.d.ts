/**
 * Git operations module for VERSE version management.
 * Provides interfaces for commit analysis, tagging, and conventional commit parsing.
 * Supports monorepo and multi-module projects with module-specific tag management.
 */
/**
 * Represents a parsed git tag with extracted module and version metadata.
 * Supports module tags (moduleName@version) and general tags (v{version}).
 */
export type GitTag = {
    /** The full tag name as it appears in git (e.g., 'core@1.0.0', 'v2.0.0') */
    readonly name: string;
    /** The full SHA-1 commit hash that this tag points to */
    readonly hash: string;
    /**
     * The module name extracted from the tag (e.g., 'core' from 'core@1.0.0').
     * Undefined for general tags or unparseable tag names.
     */
    readonly module?: string;
    /**
     * The semantic version extracted from the tag (e.g., '1.0.0' from 'core@1.0.0' or 'v1.0.0').
     * Undefined for unparseable tag names.
     */
    readonly version?: string;
};
/**
 * Configuration options for executing git operations.
 * @property cwd - Working directory for git commands (defaults to process.cwd())
 */
export type GitOptions = {
    /**
     * The working directory in which to execute git commands.
     * Must be inside a git repository or a subdirectory of one.
     * Defaults to `process.cwd()` if not specified.
     */
    readonly cwd?: string;
};
/**
 * Represents a parsed git commit following the Conventional Commits specification.
 * Extracts type, scope, breaking changes, and descriptive content for version bumping.
 */
export type CommitInfo = {
    /** The full SHA-1 commit hash (40 hexadecimal characters) */
    readonly hash: string;
    /**
     * The commit type indicating the nature of the change.
     * Common values: 'feat', 'fix', 'docs', 'chore', 'refactor', 'test', 'unknown'.
     * Used to determine version bump strategy.
     */
    readonly type: string;
    /**
     * Optional scope providing additional context about what was changed.
     * Examples: 'api', 'core', 'ui', 'auth'.
     * Not used for version bumping but useful for changelog organization.
     */
    readonly scope?: string;
    /**
     * The commit subject line without type and scope prefix.
     * Should be a concise description of the change.
     */
    readonly subject: string;
    /**
     * The full commit body text, if present.
     * May contain detailed explanations, breaking change descriptions, and footer metadata.
     */
    readonly body?: string;
    /**
     * Whether this commit introduces breaking changes.
     * Detected from 'BREAKING CHANGE:' footer or '!' suffix in commit message.
     * When true, always triggers a major version bump.
     */
    readonly breaking: boolean;
    /**
     * Optional module name if the commit is specific to a module in a monorepo.
     * Not currently extracted by the parser but reserved for future use.
     */
    readonly module?: string;
};
/**
 * Retrieves all commits for a module since its last release tag.
 * Handles monorepo and single-repo scenarios with path filtering.
 * @param modulePath - Relative path to module from repository root (use '.' for root)
 * @param moduleName - Module name used for tag searching
 * @param moduleType - 'root' for general tags, 'module' for module-specific tags
 * @param options - Git operation options
 * @param excludePaths - Paths to exclude using git pathspec syntax
 * @returns Promise resolving to array of parsed commits (oldest to newest)
 */
export declare function getCommitsSinceLastTag(modulePath: string, moduleName: string, moduleType: 'root' | 'module', options?: GitOptions, excludePaths?: string[]): Promise<CommitInfo[]>;
/**
 * Retrieves commits within a specific git revision range with path filtering.
 * Uses git's native pathspec syntax for efficient filtering in monorepos.
 * @param range - Git revision range (e.g., 'tag1..tag2', 'tag..HEAD', or '' for all)
 * @param pathFilter - Optional path to filter commits (use '.' for root)
 * @param options - Git operation options
 * @param excludePaths - Paths to exclude using ':(exclude)path' syntax
 * @returns Promise resolving to array of parsed commits (oldest to newest)
 */
export declare function getCommitsInRange(range: string, pathFilter?: string, options?: GitOptions, excludePaths?: string[]): Promise<CommitInfo[]>;
/**
 * Finds the most recent git tag for a specific module with fallback to general tags.
 * Searches module-specific tags first (moduleName@*), then falls back to general tags.
 * @param moduleName - Module name for tag pattern construction
 * @param moduleType - 'root' skips module tags, 'module' tries module tags first
 * @param options - Git operation options
 * @returns Most recent tag name or null if no tags exist
 */
export declare function getLastTagForModule(moduleName: string, moduleType: 'root' | 'module', options?: GitOptions): Promise<string | null>;
/**
 * Retrieves all git tags in the repository with parsed metadata.
 * Returns array with tag name, commit hash, and parsed module/version information.
 * @param options - Git operation options
 * @returns Promise resolving to array of GitTag objects (empty array if no tags exist)
 */
export declare function getAllTags(options?: GitOptions): Promise<GitTag[]>;
/**
 * Creates an annotated git tag at the current HEAD commit.
 * Annotated tags include tagger metadata, date, message, and can be GPG signed.
 * @param tagName - The tag name (e.g., 'core@1.0.0' or 'v1.0.0'). Must not already exist
 * @param message - The annotation message for the tag
 * @param options - Git operation options
 * @returns Promise that resolves when the tag is successfully created
 * @throws {Error} If tag creation fails (tag exists, invalid name, etc.)
 */
export declare function createTag(tagName: string, message: string, options?: GitOptions): Promise<void>;
/**
 * Pushes all local tags to the configured remote repository.
 * Only pushes tags that don't exist on remote. Does NOT push commits.
 * @param options - Git operation options
 * @returns Promise that resolves when all tags are successfully pushed
 * @throws {Error} If push fails (no remote, authentication, network, conflicts, etc.)
 */
export declare function pushTags(options?: GitOptions): Promise<void>;
/**
 * Checks if the git working directory is clean (no uncommitted changes).
 * Uses `git status --porcelain` to detect modified, staged, deleted, or untracked files.
 * @param options - Git operation options
 * @returns Promise resolving to true if clean, false if there are changes or on error
 */
export declare function isWorkingDirectoryClean(options?: GitOptions): Promise<boolean>;
/**
 * Retrieves the name of the currently checked out git branch.
 *
 * This function returns the active branch name, which is useful for:
 * - Conditional logic based on branch (e.g., only release from 'main')
 * - CI/CD branch-specific workflows
 * - Logging and debugging
 * - Branch validation before operations
 *
 * Returns empty string if in detached HEAD state.
 * @param options - Git operation options
 * @returns Promise resolving to the current branch name (empty string if detached HEAD)
 * @throws {Error} If git command fails
 */
export declare function getCurrentBranch(options?: GitOptions): Promise<string>;
/**
 * Retrieves the abbreviated (short) SHA-1 hash of the current HEAD commit.
 *
 * This function returns a shortened version of the commit hash (typically 7 characters),
 * which is:
 * - Human-readable and easier to reference
 * - Suitable for build metadata in semantic versions
 * - Commonly used in CI/CD for build identification
 * - Still unique enough for most repositories
 *
 * The short SHA is git's default abbreviated format and balances uniqueness with brevity.
 *
 * @param options - Git operation options, primarily for specifying working directory.
 *
 * @returns Promise resolving to the abbreviated commit SHA.
 *          Typically 7 characters (e.g., 'abc1234').
 *          Length may vary based on repository size to ensure uniqueness.
 *
 * @throws {Error} If git command fails:
 *                 - Not in a git repository
 *                 - No commits exist (empty repository)
 *                 - Permissions issues
 */
export declare function getCurrentCommitShortSha(options?: GitOptions): Promise<string>;
/**
 * Stages all changed files in the working directory for the next commit.
 *
 * This function executes `git add .` which stages:
 * - All modified tracked files
 * - All new untracked files
 * - All deleted files
 *
 * **Warning**: This stages **everything** in the working directory. Use with caution
 * in interactive environments. For selective staging, use git commands directly.
 *
 * @param options - Git operation options, primarily for specifying working directory.
 *
 * @returns Promise that resolves when all files are successfully staged.
 *
 * @throws {Error} If git add command fails:
 *                 - Not in a git repository
 *                 - Permissions issues
 *                 - Invalid .gitignore patterns
 */
export declare function addChangedFiles(options?: GitOptions): Promise<void>;
/**
 * Creates a git commit with the specified message using currently staged changes.
 * Files must be staged first (via `git add`). Follows Conventional Commits format.
 * @param message - The commit message (e.g., 'feat: description', 'fix: description')
 * @param options - Git operation options
 * @returns Promise that resolves when commit is created
 * @throws {Error} If commit fails (no staged changes, no git user, empty message, etc.)
 */
export declare function commitChanges(message: string, options?: GitOptions): Promise<void>;
/**
 * Pushes local commits to the remote repository.
 *
 * This function uploads all commits from the current branch that don't exist
 * on the remote. It uses `git push` without arguments, which:
 * - Pushes the current branch to its configured upstream
 * - Only pushes commits (use `pushTags()` for tags)
 * - Requires network access and authentication
 *
 * @param options - Git operation options, primarily for specifying working directory.
 *
 * @returns Promise that resolves when commits are successfully pushed.
 *
 * @throws {Error} If push fails:
 *                 - No remote configured
 *                 - No upstream branch set
 *                 - Authentication failure
 *                 - Network issues
 *                 - Remote rejects (e.g., force push needed, protected branch)
 */
export declare function pushCommits(options?: GitOptions): Promise<void>;
/**
 * Checks if there are any changes in the working directory or staging area.
 *
 * This function is similar to `isWorkingDirectoryClean()` but returns the opposite
 * boolean value. It's useful when you want to check if there's work to commit.
 *
 * Uses `git status --porcelain` to detect:
 * - Modified tracked files
 * - New untracked files
 * - Deleted files
 * - Staged changes
 *
 * @param options - Git operation options, primarily for specifying working directory.
 *
 * @returns Promise resolving to:
 *          - `true`: There are changes (modified, staged, untracked files)
 *          - `false`: Working directory is clean OR git command failed
 *
 * @throws {Error} If git status command fails.
 *                 Unlike `isWorkingDirectoryClean()`, this function throws on errors.
 */
export declare function hasChangesToCommit(options?: GitOptions): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map