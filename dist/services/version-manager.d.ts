import { SemVer } from 'semver';
import { ModuleRegistry } from './module-registry.js';
import { VersionUpdateStrategy } from "./version-update-strategy.js";
/**
 * Manages version updates for modules with staged commits and batch persistence.
 *
 * @remarks
 * Implements a two-phase update strategy:
 * 1. Stage updates in memory via `updateVersion()`
 * 2. Persist all updates via `commit()`
 *
 * Uses {@link VersionUpdateStrategy} for build system-specific operations.
 * Validates modules against {@link ModuleRegistry}.
 */
export declare class VersionManager {
    private readonly hierarchyManager;
    private readonly strategy;
    /** Pending version updates awaiting commit (module ID → version string). */
    private readonly pendingUpdates;
    /**
     * Creates a new VersionManager.
     *
     * @param hierarchyManager - Module registry for validation
     * @param strategy - Build system-specific strategy for writing updates
     */
    constructor(hierarchyManager: ModuleRegistry, strategy: VersionUpdateStrategy);
    /**
     * Stages a version update for a module without persisting to files.
     *
     * @param moduleId - Module identifier (e.g., `':'`, `':core'`)
     * @param newVersion - New version as SemVer object or string
     * @throws {Error} If module ID doesn't exist in registry
     */
    updateVersion(moduleId: string, newVersion: SemVer | string): void;
    /**
     * Commits all pending version updates to build files in a single batch operation.
     *
     * @returns Promise that resolves when all updates are written
     * @throws {Error} If file operations fail (specific errors depend on strategy)
     */
    commit(): Promise<void>;
    /**
     * Returns a copy of all pending updates that haven't been committed.
     *
     * @returns Map of module ID to version string
     */
    getPendingUpdates(): Map<string, string>;
    /**
     * Checks whether there are any pending updates awaiting commit.
     *
     * @returns `true` if updates are staged, `false` otherwise
     */
    hasPendingUpdates(): boolean;
    /**
     * Clears all pending updates without committing them.
     *
     * @remarks
     * Use with caution - this operation cannot be undone.
     */
    clearPendingUpdates(): void;
}
//# sourceMappingURL=version-manager.d.ts.map