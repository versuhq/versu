import type { Commit } from "conventional-commits-parser";

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

  readonly parsed?: Commit;
};
