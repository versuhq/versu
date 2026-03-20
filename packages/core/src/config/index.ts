import { PrereleaseBumpType, StableBumpType } from "../semver/types.js";
import { Commit } from "conventional-commits-parser";
import { isBreakingCommit } from "../git/index.js";
import { VersuConfig, VersuConfigWithDefaults } from "./types.js";

/**
 * Determines the bump type for a commit based on its type and breaking change flag.
 * @param commit - The commit to evaluate
 * @param config - Configuration containing commit type mappings
 * @returns The bump type to apply ('major', 'minor', 'patch', or 'none')
 */
export function getBumpTypeForCommit(
  commit: Commit,
  config: VersuConfigWithDefaults,
  prerelease: boolean,
): StableBumpType | PrereleaseBumpType | "none" {
  const key = prerelease ? "prerelease" : "stable";

  const isBreaking = isBreakingCommit(commit);
  if (isBreaking) {
    return config.versioning.breakingChange[key];
  }

  if (!commit.type) {
    return config.versioning.unknownCommitType[key];
  }

  const configuredBump = config.versioning.commitTypes[commit.type]?.[key];

  return configuredBump || config.versioning.unknownCommitType[key];
}

/**
 * Determines how a module should be bumped when one of its dependencies changes.
 * Uses dependency cascade rules from configuration to propagate version changes.
 * @param dependencyBumpType - The bump type applied to the dependency
 * @param config - Configuration containing dependency cascade rules
 * @param prerelease - Whether the bump is a prerelease or stable release
 * @returns The bump type to apply to the dependent module
 */
export function getDependencyBumpType(
  dependencyBumpType: StableBumpType | PrereleaseBumpType,
  config: VersuConfigWithDefaults,
  prerelease: boolean,
): StableBumpType | PrereleaseBumpType | "none" {
  const key = prerelease ? "prerelease" : "stable";
  const rules = config.versioning.cascadeRules[key];
  if (typeof rules === "string" && rules === "match") {
    return dependencyBumpType;
  }

  return rules?.[dependencyBumpType as keyof typeof rules] || "none";
}

/**
 * Retrieves adapter-specific configuration from the main config object.
 * @param config - The main configuration object
 * @param adapterName - The name of the adapter configuration to retrieve
 * @returns The adapter-specific configuration, or undefined if not present
 */
export function getAdapterConfig<T extends keyof VersuConfig>(
  config: VersuConfig,
  adapterName: T,
): VersuConfig[T] {
  return config[adapterName];
}
