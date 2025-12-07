import { getBumpTypeForCommit, Config } from "../config/index.js";
import { CommitInfo } from "../git/index.js";
import { BumpType, maxBumpType } from "../semver/index.js";

/**
 * Calculates the overall semantic version bump type from a collection of commits.
 * Returns the highest bump type: major > minor > patch > none.
 * @param commits - Array of commit information to analyze
 * @param config - Configuration containing commit type mappings
 * @returns The highest BumpType required across all commits
 */
export function calculateBumpFromCommits(
  commits: CommitInfo[],
  config: Config,
): BumpType {
  // Collect bump types for all commits
  const bumpTypes: BumpType[] = [];

  // Analyze each commit and determine its version impact
  for (const commit of commits) {
    const bumpType = getBumpTypeForCommit(commit.type, commit.breaking, config);

    // Only include commits that require a version bump
    if (bumpType !== "none") {
      bumpTypes.push(bumpType);
    }
  }

  // Return the highest bump type required across all commits
  // If no meaningful commits found, returns 'none'
  return maxBumpType(bumpTypes);
}
