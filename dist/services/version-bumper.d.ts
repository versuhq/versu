/**
 * Version Bumper Service for VERSE.
 * Implements core version calculation logic: analyzes commits, cascades changes through
 * dependencies, and applies versions with support for prereleases, metadata, and snapshots.
 */
import { Config } from '../config/index.js';
import { ModuleRegistry } from './module-registry.js';
import { BumpType } from '../semver/index.js';
import { CommitInfo } from '../git/index.js';
import { SemVer } from 'semver';
import { AdapterMetadata } from './adapter-identifier.js';
import { Module } from '../adapters/project-information.js';
/**
 * Configuration options for the version bumper service.
 */
export type VersionBumperOptions = {
    /** Whether to generate prerelease versions (e.g., 1.0.0-alpha.1). */
    prereleaseMode: boolean;
    /** Whether to bump versions of unchanged modules in prerelease mode. */
    bumpUnchanged: boolean;
    /** Whether to add build metadata (commit SHA) to versions. */
    addBuildMetadata: boolean;
    /** Whether to append -SNAPSHOT suffix for Gradle projects. */
    appendSnapshot: boolean;
    /** Adapter metadata providing project-specific capabilities. */
    adapter: AdapterMetadata;
    /** Whether to include timestamps in prerelease identifiers. */
    timestampVersions: boolean;
    /** Base prerelease identifier (e.g., 'alpha', 'beta', 'rc'). */
    prereleaseId: string;
    /** Absolute path to the repository root directory. */
    repoRoot: string;
    /** Project configuration including dependency bump rules. */
    config: Config;
};
/**
 * Final processed module version change result.
 * Represents a completed version calculation ready for application.
 */
export type ProcessedModuleChange = {
    /** The module with calculated version change. */
    readonly module: Module;
    /** Original semantic version before changes. */
    readonly fromVersion: SemVer;
    /** New calculated version string (e.g., '1.1.0', '1.1.0-alpha.1', '1.1.0-SNAPSHOT'). */
    readonly toVersion: string;
    /** Final bump type applied ('major', 'minor', 'patch', or 'none'). */
    readonly bumpType: BumpType;
    /** Reason for version change. */
    readonly reason: ChangeReason;
};
/**
 * Reason why a module's version is being changed.
 */
export type ChangeReason = 'commits' | 'dependency' | 'cascade' | 'prerelease-unchanged' | 'build-metadata' | 'gradle-snapshot';
/**
 * Service for calculating version bumps across modules.
 * Handles commit analysis, dependency cascade effects, and various versioning strategies
 * (regular, prerelease, snapshot).
 */
export declare class VersionBumper {
    private readonly moduleRegistry;
    private readonly options;
    /**
     * Creates a new VersionBumper instance.
     * @param moduleRegistry - Registry containing all modules and their interdependencies
     * @param options - Configuration options controlling version bump behavior
     */
    constructor(moduleRegistry: ModuleRegistry, options: VersionBumperOptions);
    /**
     * Calculates version bumps for all modules based on their commits.
     * Orchestrates a three-phase process: initial bumps (commit analysis), cascade effects (dependency propagation),
     * and version application (applying strategies like prerelease, timestamps, build metadata).
     * @param moduleCommits - Map of module IDs to their commits since last version
     * @returns Promise resolving to array of processed module changes (only modules that need updates)
     * @throws {Error} If git operations fail
     */
    calculateVersionBumps(moduleCommits: Map<string, CommitInfo[]>): Promise<ProcessedModuleChange[]>;
    /**
     * Calculates initial version bump types for all modules based on commits.
     *
     * This is Phase 1 of the version calculation process. It analyzes commits for each
     * module to determine the required version bump type using Conventional Commits
     * specification.
     *
     * The method creates a `ProcessingModuleChange` for **every** module in the registry,
     * not just those with commits. The `needsProcessing` flag determines which modules
     * will ultimately be updated.
     *
     * **Processing Decision Logic**:
     * - Module has commits requiring bump: `needsProcessing = true, reason = 'commits'`
     * - Prerelease mode with bumpUnchanged: `needsProcessing = true, reason = 'prerelease-unchanged'`
     * - Build metadata enabled: `needsProcessing = true, reason = 'build-metadata'`
     * - Otherwise: `needsProcessing = false, reason = 'unchanged'`
     *
     * @param moduleCommits - Map of module IDs to their commits since last version.
     *
     * @returns Array of processing module changes for all modules in the registry
     */
    private calculateInitialBumps;
    /**
     * Calculates cascade effects when modules change.
     *
     * This is Phase 2 of the version calculation process. It propagates version changes
     * through the module dependency graph, ensuring that when a module changes, all
     * modules that depend on it are also bumped appropriately.
     *
     * **Algorithm**: Uses a breadth-first traversal of the dependency graph:
     * 1. Start with all modules marked for processing (needsProcessing = true)
     * 2. For each module being processed, find all modules that depend on it
     * 3. Calculate required bump for dependents using dependency bump rules
     * 4. If dependent needs a higher bump, update it and add to processing queue
     * 5. Continue until no more cascades are needed
     *
     * **Complexity**: O(V + E) where V = number of modules, E = number of dependencies
     *
     * **In-Place Modification**: This method modifies the input array in place for
     * efficiency. The same array reference is returned with cascade effects applied.
     *
     * @param allModuleChanges - Array of all module changes (will be modified in place).
     *                          Should include all modules from calculateInitialBumps().
     *
     * @returns The same array with cascade effects applied
     */
    private calculateCascadeEffects;
    /**
     * Applies version calculations and transformations to all modules.
     *
     * This is Phase 3 (final) of the version calculation process. It takes modules
     * with calculated bump types and applies version transformations including:
     * - Semantic version bumping (major, minor, patch)
     * - Prerelease version generation
     * - Build metadata appending
     * - Snapshot suffix appending
     *
     * **Version Application Scenarios**:
     * 1. **Commits + Regular Mode**: Bump semantic version normally
     * 2. **Commits + Prerelease Mode**: Bump to prerelease version
     * 3. **No Commits + Prerelease + bumpUnchanged**: Force prerelease bump
     * 4. **Build Metadata Mode**: Append git SHA as metadata
     * 5. **Snapshot Mode**: Append -SNAPSHOT suffix
     *
     * @param processingModuleChanges - All module changes with calculated bump types
     *                                 from cascade effects phase.
     *
     * @param effectivePrereleaseId - Prerelease identifier to use (may include timestamp).
     *                               Example: 'alpha', 'alpha.20251021143022'
     *
     * @param shortSha - Optional git commit short SHA for build metadata.
     *                  Example: 'a1b2c3d'
     *
     * @returns Array of processed module changes ready for application (only modules with needsProcessing = true)
     */
    private applyVersionCalculations;
}
//# sourceMappingURL=version-bumper.d.ts.map