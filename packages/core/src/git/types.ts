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
