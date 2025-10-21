import { Config } from '../config/index.js';
import { CommitInfo } from '../git/index.js';
import { BumpType } from '../semver/index.js';
/**
 * Calculates the overall semantic version bump type from a collection of commits.
 * Returns the highest bump type: major > minor > patch > none.
 * @param commits - Array of commit information to analyze
 * @param config - Configuration containing commit type mappings
 * @returns The highest BumpType required across all commits
 */
export declare function calculateBumpFromCommits(commits: CommitInfo[], config: Config): BumpType;
//# sourceMappingURL=commits.d.ts.map