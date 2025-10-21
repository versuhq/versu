import { CommitInfo } from '../git/index.js';
import { ModuleRegistry } from './module-registry.js';
/**
 * Analyzes git commits for each module, preventing double-counting in hierarchical structures.
 *
 * @remarks
 * Filters out child module commits from parent modules to ensure each commit is counted
 * only in the most specific module it affects.
 */
export declare class CommitAnalyzer {
    private readonly moduleRegistry;
    private readonly repoRoot;
    /**
     * Creates a new CommitAnalyzer.
     *
     * @param moduleRegistry - Registry with all discovered modules
     * @param repoRoot - Absolute path to repository root
     */
    constructor(moduleRegistry: ModuleRegistry, repoRoot: string);
    /**
     * Analyzes commits since the last release for all modules.
     *
     * @returns Map of module ID to array of {@link CommitInfo} objects
     * @throws {Error} If git operations fail
     */
    analyzeCommitsSinceLastRelease(): Promise<Map<string, CommitInfo[]>>;
    /**
     * Finds all child module paths for exclusion during commit analysis.
     *
     * @param modulePath - Parent module path
     * @param moduleId - Parent module ID
     * @returns Array of child module paths
     */
    private findChildModulePaths;
    /**
     * Checks if a path is a child subdirectory of a parent path.
     *
     * @param childPath - Path to test
     * @param parentPath - Potential parent path
     * @returns `true` if childPath is a subdirectory of parentPath
     */
    private isChildPath;
}
//# sourceMappingURL=commit-analyzer.d.ts.map