import { Module, ProjectInformation } from "../adapters/project-information.js";

/**
 * Registry for managing module hierarchy and metadata.
 *
 * @remarks
 * Wraps {@link ProjectInformation} with a clean API for querying module data.
 * Provides fast O(1) lookup by module ID.
 */
export class ModuleRegistry {
  /**
   * Creates a new ModuleRegistry.
   *
   * @param projectInformation - Complete project structure with all discovered modules
   */
  constructor(private readonly projectInformation: ProjectInformation) {}

  /**
   * Gets all module IDs in the project.
   *
   * @returns Array of module ID strings
   */
  getModuleIds(): string[] {
    return this.projectInformation.moduleIds;
  }

  /**
   * Retrieves module information by ID.
   *
   * @param moduleId - Module identifier (e.g., `':'`, `':core'`)
   * @returns Module object with metadata
   * @throws {Error} If module ID doesn't exist
   */
  getModule(moduleId: string): Module {
    const projectInfo = this.projectInformation.modules.get(moduleId);
    if (!projectInfo) {
      throw new Error(`Module ${moduleId} not found`);
    }
    return projectInfo;
  }

  /**
   * Checks if a module with the given ID exists.
   *
   * @param moduleId - Module identifier to check
   * @returns `true` if module exists, `false` otherwise
   */
  hasModule(moduleId: string): boolean {
    return this.projectInformation.modules.has(moduleId);
  }

  /**
   * Gets all modules as a readonly map.
   *
   * @returns Readonly map of module ID to {@link Module}
   */
  getModules(): ReadonlyMap<string, Module> {
    return this.projectInformation.modules;
  }
}
