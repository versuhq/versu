import { join } from "path";

/** Base path where GitHub Actions are stored on the runner. @private */
const RUNNER_ACTIONS_PATH = "/home/runner/_work/_actions";

/**
 * Retrieves the GitHub Action repository identifier from environment variables.
 * @returns Action repository in 'owner/repo' format
 * @throws {Error} If GITHUB_ACTION_REPOSITORY environment variable is not set
 * @private
 */
function getGitHubActionRepository(): string {
  const repo = process.env.GITHUB_ACTION_REPOSITORY;
  if (!repo)
    throw new Error("GITHUB_ACTION_REPOSITORY environment variable is not set");
  return repo;
}

/**
 * Retrieves the GitHub Action ref from environment variables.
 * @returns Action ref (branch/tag/SHA), defaults to 'main' if not set
 * @private
 */
function getGitHubActionRef(): string {
  return process.env.GITHUB_ACTION_REF || "main";
}

/** Repository identifier for the currently executing GitHub Action. @private */
const GITHUB_ACTION_REPOSITORY = getGitHubActionRepository();

/** Git ref of the currently executing GitHub Action. @private */
const GITHUB_ACTION_REF = getGitHubActionRef();

/** Absolute path to the root directory of the currently executing GitHub Action. @private */
const ACTION_FILE_PATH = join(
  RUNNER_ACTIONS_PATH,
  GITHUB_ACTION_REPOSITORY,
  GITHUB_ACTION_REF,
);

/**
 * Constructs an absolute path to a file within the GitHub Action directory.
 * @param relativePath - Path relative to the action's root directory
 * @returns Absolute path to the file on the GitHub Actions runner
 */
export function getGitHubActionPath(relativePath: string): string {
  return join(ACTION_FILE_PATH, relativePath);
}

/**
 * Parses a string input as a boolean value for GitHub Actions inputs.
 * Returns true only if input equals 'true' (case-insensitive).
 * @param input - String value to parse
 * @returns True if input is 'true' (case-insensitive), false otherwise
 */
export function parseBooleanInput(input: string): boolean {
  return input.toLowerCase() === "true";
}
