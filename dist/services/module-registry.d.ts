import { Module, ProjectInformation } from "../adapters/project-information.js";
/**
 * Registry for managing module hierarchy and metadata.
 *
 * @remarks
 * Wraps {@link ProjectInformation} with a clean API for querying module data.
 * Provides fast O(1) lookup by module ID.
 */
export declare class ModuleRegistry {
    private readonly projectInformation;
    /**
     * Creates a new ModuleRegistry.
     *
     * @param projectInformation - Complete project structure with all discovered modules
     */
    constructor(projectInformation: ProjectInformation);
    /**
     * Gets all module IDs in the project.
     *
     * @returns Array of module ID strings
     */
    getModuleIds(): string[];
    /**
     * Retrieves module information by ID.
     *
     * @param moduleId - Module identifier (e.g., `':'`, `':core'`)
     * @returns Module object with metadata
     * @throws {Error} If module ID doesn't exist
     */
    getModule(moduleId: string): Module;
    /**
     * Checks if a module with the given ID exists.
     *
     * @param moduleId - Module identifier to check
     * @returns `true` if module exists, `false` otherwise
     */
    hasModule(moduleId: string): boolean;
    /**
     * Gets all modules as a readonly map.
     *
     * @returns Readonly map of module ID to {@link Module}
     */
    getModules(): ReadonlyMap<string, Module>;
}
//# sourceMappingURL=module-registry.d.ts.map