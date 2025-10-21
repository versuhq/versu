/**
 * Constructs an absolute path to a file within the GitHub Action directory.
 * @param relativePath - Path relative to the action's root directory
 * @returns Absolute path to the file on the GitHub Actions runner
 */
export declare function getGitHubActionPath(relativePath: string): string;
/**
 * Parses a string input as a boolean value for GitHub Actions inputs.
 * Returns true only if input equals 'true' (case-insensitive).
 * @param input - String value to parse
 * @returns True if input is 'true' (case-insensitive), false otherwise
 */
export declare function parseBooleanInput(input: string): boolean;
//# sourceMappingURL=actions.d.ts.map