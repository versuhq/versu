import { logger } from "../utils/logger.js";
import { getCommitsSinceLastTag } from "../git/index.js";
import { ModuleRegistry } from "./module-registry.js";
import { Commit } from "conventional-commits-parser";

/**
 * Analyzes git commits for each module, preventing double-counting in hierarchical structures.
 *
 * @remarks
 * Filters out child module commits from parent modules to ensure each commit is counted
 * only in the most specific module it affects.
 */
export class CommitAnalyzer {
  /**
   * Creates a new CommitAnalyzer.
   *
   * @param moduleRegistry - Registry with all discovered modules
   * @param repoRoot - Absolute path to repository root
   */
  constructor(
    private readonly moduleRegistry: ModuleRegistry,
    private readonly repoRoot: string,
  ) {}

  /**
   * Analyzes commits since the last release for all modules.
   *
   * @returns Map of module ID to array of {@link Commit} objects
   * @throws {Error} If git operations fail
   */
  async analyzeCommitsSinceLastRelease(): Promise<
    Map<string, { commits: Commit[]; lastTag: string | null }>
  > {
    logger.info("Analyzing commits since last release");

    const moduleCommits = new Map<
      string,
      { commits: Commit[]; lastTag: string | null }
    >();

    // Iterate through all registered modules
    for (const [projectId, projectInfo] of this.moduleRegistry.getModules()) {
      // Find child module paths to exclude from this module's commits
      // This prevents double-counting commits in the module hierarchy
      const childModulePaths = this.findChildModulePaths(
        projectInfo.path,
        projectId,
      );

      // Retrieve commits for this module, excluding child modules
      const { commits, lastTag } = await getCommitsSinceLastTag(
        projectInfo,
        { cwd: this.repoRoot },
        childModulePaths,
      );

      // Store commits for this module
      moduleCommits.set(projectId, { commits, lastTag });

      // Log exclusions for debugging
      if (childModulePaths.length > 0) {
        logger.debug("Module excludes child modules", {
          moduleId: projectInfo.id,
          childCount: childModulePaths.length,
          childPaths: childModulePaths,
        });
      }
    }

    // Calculate and log summary statistics
    const totalCommits = Array.from(moduleCommits.values()).reduce(
      (sum, info) => sum + info.commits.length,
      0,
    );
    logger.info("Commit analysis completed", {
      totalCommits,
      moduleCount: moduleCommits.size,
    });

    return moduleCommits;
  }

  /**
   * Finds all child module paths for exclusion during commit analysis.
   *
   * @param modulePath - Parent module path
   * @param moduleId - Parent module ID
   * @returns Array of child module paths
   */
  private findChildModulePaths(modulePath: string, moduleId: string): string[] {
    const childPaths: string[] = [];

    logger.debug("Finding child modules", { moduleId, modulePath });

    // Iterate through all modules to find children
    for (const [otherId, otherInfo] of this.moduleRegistry.getModules()) {
      // Skip the module itself
      if (
        otherId !== moduleId &&
        this.isChildPath(otherInfo.path, modulePath)
      ) {
        childPaths.push(otherInfo.path);
      }
    }

    logger.debug("Child modules found", {
      moduleId,
      childCount: childPaths.length,
      childPaths,
    });

    return childPaths;
  }

  /**
   * Checks if a path is a child subdirectory of a parent path.
   *
   * @param childPath - Path to test
   * @param parentPath - Potential parent path
   * @returns `true` if childPath is a subdirectory of parentPath
   */
  private isChildPath(childPath: string, parentPath: string): boolean {
    // Special handling for root path - it's the parent of all non-root paths
    if (parentPath === ".") {
      return childPath !== ".";
    }

    // Check if child path starts with parent path followed by a path separator
    // This ensures 'core/api' is a child of 'core', but 'core2' is not
    return childPath.startsWith(parentPath + "/");
  }
}
