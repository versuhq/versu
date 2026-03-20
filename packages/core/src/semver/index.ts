import * as semver from "semver";
import { SemVer } from "semver";
import { PrereleaseBumpType, StableBumpType, Version } from "./types.js";
import { Commit } from "conventional-commits-parser";
import { VersuConfigWithDefaults } from "../config/types.js";
import { getBumpTypeForCommit } from "../config/index.js";

/**
 * Parses a semantic version string into a Version object.
 * @param versionString - The version string to parse (e.g., '1.2.3', '2.0.0-beta.1')
 * @returns A parsed Version object with structured version components
 * @throws {Error} If the version string is invalid or cannot be parsed
 */
export function parseSemVer(versionString: string): Version {
  return parseSemVerInternal(versionString);
}

/**
 * Parses a semantic version string and returns a SemVer object.
 *
 * @param versionString - The semantic version string to parse (e.g., "1.2.3", "2.0.0-beta.1")
 * @returns A parsed SemVer object containing the version components
 * @throws {Error} When the provided version string is not a valid semantic version
 *
 * @internal
 */
function parseSemVerInternal(versionString: string): SemVer {
  const parsed = semver.parse(versionString);

  if (!parsed) {
    throw new Error(`Invalid semantic version: ${versionString}`);
  }

  return parsed;
}

/**
 * Converts a Version object to its string representation.
 * @param version - The Version object to format
 * @returns The version as a string, preserving all components including build metadata
 */
export function formatSemVer(version: Version): string {
  return version.raw;
}

/**
 * Compares two semantic versions following SemVer precedence rules.
 * @param a - The first version to compare
 * @param b - The second version to compare
 * @returns `-1` if a < b, `0` if a === b, `1` if a > b
 */
export function compareSemVer(a: Version, b: Version): number {
  return semver.compare(a.raw, b.raw);
}

/**
 * Increments a semantic version based on the specified bump type.
 * @param version - The version to bump
 * @param bumpType - The type of version increment to apply
 * @returns A new Version object with the incremented version
 * @throws {Error} If the version cannot be bumped with the specified type
 */
export function bumpSemVer(
  version: Version,
  bumpType: StableBumpType | PrereleaseBumpType | "none",
  prereleaseId?: string,
): Version {
  if (bumpType === "none") {
    return version;
  }

  let bumpedVersionString: string | null = null;

  if (prereleaseId) {
    bumpedVersionString = semver.inc(version.raw, bumpType, prereleaseId);
  } else {
    bumpedVersionString = semver.inc(version.raw, bumpType);
  }

  if (!bumpedVersionString) {
    throw new Error(
      `Failed to bump version ${version.version} with type ${bumpType}`,
    );
  }

  return parseSemVer(bumpedVersionString);
}

/**
 * Determines the highest priority bump type from an array.
 * Priority: major > minor > patch > none.
 * @param bumpTypes - Array of bump types to evaluate
 * @returns The bump type with highest priority
 */
export function maxBumpType(
  bumpTypes: (StableBumpType | PrereleaseBumpType | "none")[],
): StableBumpType | PrereleaseBumpType | "none" {
  const priority = {
    none: 0,
    prerelease: 1,
    prepatch: 2,
    preminor: 3,
    premajor: 4,
    patch: 5,
    minor: 6,
    major: 7,
  };

  return bumpTypes.reduce(
    (max, current) => {
      return priority[current] > priority[max] ? current : max;
    },
    "none" as StableBumpType | PrereleaseBumpType | "none",
  );
}

/**
 * Validates whether a string is a valid semantic version.
 * @param versionString - The version string to validate
 * @returns True if valid semantic version, false otherwise
 */
export function isValidVersionString(versionString: string): boolean {
  return semver.valid(versionString) !== null;
}

/**
 * Creates an initial semantic version (0.0.0) for new modules or projects.
 * @returns A Version object representing version 0.0.0
 */
export function createInitialVersion(): Version {
  return new SemVer("0.0.0");
}

/**
 * Adds build metadata to a semantic version.
 * Build metadata is appended with a '+' sign and doesn't affect version precedence.
 * @param version - The version to add metadata to
 * @param buildMetadata - The build metadata string to append
 * @returns A new Version object with the build metadata appended
 */
export function addBuildMetadata(
  version: Version,
  buildMetadata: string,
): Version {
  // Use the existing version string and append build metadata
  // Get version without build metadata
  const baseVersionString = parseSemVerInternal(version.raw).format();
  const newVersionString = `${baseVersionString}+${buildMetadata}`;

  return parseSemVer(newVersionString);
}

/**
 * Generates a timestamp-based prerelease identifier in format `{baseId}.{YYYYMMDD}.{HHMM}`.
 * Creates unique, sortable prerelease identifiers using UTC timestamps.
 * @param baseId - The base identifier for the prerelease (e.g., 'alpha', 'beta', 'rc')
 * @param timestamp - Optional timestamp to use; defaults to current date/time
 * @returns A prerelease identifier string (e.g., 'alpha.20230515.1430')
 */
export function generateTimestampPrereleaseId(
  baseId: string,
  timestamp?: Date,
): string {
  const date = timestamp || new Date();

  // Format: YYYYMMDD (using UTC to ensure consistency across timezones)
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const dateString = `${year}${month}${day}`;

  // Format: HHMM (using UTC to ensure consistency across timezones)
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const timeString = `${hours}${minutes}`;

  return `${baseId}.${dateString}.${timeString}`;
}

export function isReleaseVersion(version: Version | string): boolean {
  if (typeof version === "string") {
    const parsed = semver.parse(version);
    if (!parsed) return false;
    version = parsed;
  }

  // A release version has no prerelease identifiers
  return version.prerelease.length === 0;
}

/**
 * Calculates the overall semantic version bump type from a collection of commits.
 * Returns the highest bump type: major > minor > patch > none.
 * @param commits - Array of commit information to analyze
 * @param config - Configuration containing commit type mappings
 * @returns The highest BumpType required across all commits
 */
export function calculateBumpFromCommits(
  commits: Commit[],
  config: VersuConfigWithDefaults,
  prerelease: boolean,
): StableBumpType | PrereleaseBumpType | "none" {
  // Analyze each commit and determine its version impact
  const bumpTypes = commits.map((commit) =>
    getBumpTypeForCommit(commit, config, prerelease),
  );

  // Return the highest bump type required across all commits
  // If no meaningful commits found, returns 'none'
  return maxBumpType(bumpTypes);
}
