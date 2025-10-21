import * as core from '@actions/core';
import { CommitInfo, getCommitsSinceLastTag } from '../git/index.js';
import { ModuleRegistry } from './module-registry.js';

/**
 * Analyzes git commits for each module in a monorepo to determine version changes.
 * 
 * This service is responsible for:
 * - Retrieving commits since the last release tag for each module
 * - Filtering out commits from child modules to prevent version bump duplication
 * - Organizing commits by module for version calculation
 * 
 * The analyzer ensures that parent modules don't incorrectly include commits from
 * their child modules by using git's native path exclusion feature.
 * 
 * @example
 * ```typescript
 * const analyzer = new CommitAnalyzer(moduleRegistry, '/path/to/repo');
 * const moduleCommits = await analyzer.analyzeCommitsSinceLastRelease();
 * // Returns: Map<moduleId, CommitInfo[]>
 * ```
 */
export class CommitAnalyzer {
  
  /**
   * Creates a new CommitAnalyzer instance.
   * 
   * @param moduleRegistry - Registry containing all discovered modules and their metadata
   * @param repoRoot - Absolute path to the repository root directory
   */
  constructor(
    private readonly moduleRegistry: ModuleRegistry,
    private readonly repoRoot: string
  ) {
  }

  /**
   * Analyzes commits since the last release for all modules in the repository.
   * 
   * This method:
   * 1. Iterates through all registered modules
   * 2. Identifies child modules that should be excluded from each parent's commit history
   * 3. Retrieves commits using git's native path exclusion to prevent overlap
   * 4. Returns a map of module IDs to their respective commits
   * 
   * The exclusion mechanism ensures that when a parent module like `core/` has child
   * modules like `core/api/` and `core/impl/`, commits to those child modules are
   * not counted towards the parent module's version calculation.
   * 
   * @returns A promise that resolves to a map where:
   *   - Key: Module ID (e.g., ':core', ':core:api')
   *   - Value: Array of parsed commit information since last release
   * 
   * @throws {Error} If git operations fail or repository is not accessible
   * 
   * @example
   * ```typescript
   * const moduleCommits = await analyzer.analyzeCommitsSinceLastRelease();
   * const coreCommits = moduleCommits.get(':core');
   * console.log(`Core module has ${coreCommits.length} commits`);
   * ```
   */
  async analyzeCommitsSinceLastRelease(): Promise<Map<string, CommitInfo[]>> {
    core.info('📝 Analyzing commits since last release...');
    
    const moduleCommits = new Map<string, CommitInfo[]>();

    for (const [projectId, projectInfo] of this.moduleRegistry.getModules()) {
      // Find child module paths to exclude from this module's commits
      const childModulePaths = this.findChildModulePaths(
        projectInfo.path,
        projectId
      );
      
      const commits = await getCommitsSinceLastTag(
        projectInfo.path, 
        projectInfo.name,
        projectInfo.type,
        { cwd: this.repoRoot },
        childModulePaths
      );
      
      moduleCommits.set(projectId, commits);
      
      if (childModulePaths.length > 0) {
        core.debug(`🔍 Module ${projectInfo.id} excludes ${childModulePaths.length} child module(s): ${childModulePaths.join(', ')}`);
      }
    }

    const totalCommits = Array.from(moduleCommits.values()).reduce((sum, commits) => sum + commits.length, 0);
    core.info(`📊 Analyzed ${totalCommits} commits across ${moduleCommits.size} modules`);
    
    return moduleCommits;
  }

  /**
   * Finds all child module paths for a given module to enable commit exclusion.
   * 
   * A child module is defined as any module whose path is a subdirectory of the
   * parent module's path. This is used to build exclusion lists for git log operations,
   * preventing parent modules from including commits that belong to their children.
   * 
   * @param modulePath - The file system path of the parent module (e.g., 'core', 'services/api')
   * @param moduleId - The unique identifier of the parent module (e.g., ':core', ':services:api')
   * 
   * @returns An array of child module paths that should be excluded when analyzing
   *   the parent module's commits. Returns empty array if no child modules exist.
   * 
   * @example
   * ```typescript
   * // For module 'core' with children 'core/api' and 'core/impl'
   * const children = findChildModulePaths('core', ':core');
   * // Returns: ['core/api', 'core/impl']
   * ```
   * 
   * @private
   */
  private findChildModulePaths(
    modulePath: string,
    moduleId: string,
  ): string[] {
    const childPaths: string[] = [];

    for (const [otherId, otherInfo] of this.moduleRegistry.getModules()) {
      if (otherId !== moduleId && this.isChildPath(otherInfo.path, modulePath)) {
        childPaths.push(otherInfo.path);
      }
    }
    
    return childPaths;
  }

  /**
   * Determines whether a given path represents a child subdirectory of a parent path.
   * 
   * This method uses simple string prefix matching to determine the parent-child
   * relationship. The root path '.' is treated specially as it's the parent of all
   * non-root paths.
   * 
   * @param childPath - The path to test (e.g., 'core/api', 'services/impl')
   * @param parentPath - The potential parent path (e.g., 'core', '.', 'services')
   * 
   * @returns `true` if childPath is a subdirectory of parentPath, `false` otherwise
   * 
   * @example
   * ```typescript
   * isChildPath('core/api', 'core')      // true
   * isChildPath('core/api/v1', 'core')   // true
   * isChildPath('core', 'core')          // false (same path)
   * isChildPath('other', 'core')         // false (not related)
   * isChildPath('core', '.')             // true (root is parent of all)
   * isChildPath('.', '.')                // false (root is not child of itself)
   * ```
   * 
   * @private
   */
  private isChildPath(childPath: string, parentPath: string): boolean {
    if (parentPath === '.') {
      return childPath !== '.';
    }
    
    // Check if child path starts with parent path followed by a separator
    return childPath.startsWith(parentPath + '/');
  }
}