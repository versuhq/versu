import { SemVer } from 'semver';
/**
 * Semantic version bump types: major, minor, patch, or none.
 * Represents different ways a version can be incremented per Semantic Versioning 2.0.0.
 */
export type BumpType = 'major' | 'minor' | 'patch' | 'none';
/**
 * Parses a semantic version string into a SemVer object.
 * @param versionString - The version string to parse (e.g., '1.2.3', '2.0.0-beta.1')
 * @returns A parsed SemVer object with structured version components
 * @throws {Error} If the version string is invalid or cannot be parsed
 */
export declare function parseSemVer(versionString: string): SemVer;
/**
 * Converts a SemVer object to its string representation.
 * @param version - The SemVer object to format
 * @returns The version as a string, preserving all components including build metadata
 */
export declare function formatSemVer(version: SemVer): string;
/**
 * Compares two semantic versions following SemVer precedence rules.
 * @param a - The first version to compare
 * @param b - The second version to compare
 * @returns `-1` if a < b, `0` if a === b, `1` if a > b
 */
export declare function compareSemVer(a: SemVer, b: SemVer): number;
/**
 * Increments a semantic version based on the specified bump type.
 * @param version - The version to bump
 * @param bumpType - The type of version increment to apply
 * @returns A new SemVer object with the incremented version
 * @throws {Error} If the version cannot be bumped with the specified type
 */
export declare function bumpSemVer(version: SemVer, bumpType: BumpType): SemVer;
/**
 * Determines the bump type between two versions.
 * @param from - The starting version
 * @param to - The ending version
 * @returns The bump type that would transform 'from' into 'to'
 */
export declare function getBumpType(from: SemVer, to: SemVer): BumpType;
/**
 * Determines the highest priority bump type from an array.
 * Priority: major > minor > patch > none.
 * @param bumpTypes - Array of bump types to evaluate
 * @returns The bump type with highest priority
 */
export declare function maxBumpType(bumpTypes: BumpType[]): BumpType;
/**
 * Validates whether a string is a valid semantic version.
 * @param versionString - The version string to validate
 * @returns True if valid semantic version, false otherwise
 */
export declare function isValidVersionString(versionString: string): boolean;
/**
 * Creates an initial semantic version (0.0.0) for new modules or projects.
 * @returns A SemVer object representing version 0.0.0
 */
export declare function createInitialVersion(): SemVer;
/**
 * Bumps a version to a prerelease version.
 * @param version - The version to bump to prerelease
 * @param bumpType - The type of version bump to apply before adding prerelease identifier
 * @param prereleaseId - The prerelease identifier (e.g., 'alpha', 'beta', 'rc')
 * @returns A new SemVer object with the prerelease version
 * @throws {Error} If the bump operation fails
 */
export declare function bumpToPrerelease(version: SemVer, bumpType: BumpType, prereleaseId: string): SemVer;
/**
 * Adds build metadata to a semantic version.
 * Build metadata is appended with a '+' sign and doesn't affect version precedence.
 * @param version - The version to add metadata to
 * @param buildMetadata - The build metadata string to append
 * @returns A new SemVer object with the build metadata appended
 */
export declare function addBuildMetadata(version: SemVer, buildMetadata: string): SemVer;
/**
 * Generates a timestamp-based prerelease identifier in format `{baseId}.{YYYYMMDD}.{HHMM}`.
 * Creates unique, sortable prerelease identifiers using UTC timestamps.
 * @param baseId - The base identifier for the prerelease (e.g., 'alpha', 'beta', 'rc')
 * @param timestamp - Optional timestamp to use; defaults to current date/time
 * @returns A prerelease identifier string (e.g., 'alpha.20230515.1430')
 */
export declare function generateTimestampPrereleaseId(baseId: string, timestamp?: Date): string;
//# sourceMappingURL=index.d.ts.map