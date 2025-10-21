import { ModuleSystemFactory } from "../services/module-system-factory.js";
/**
 * Creates the appropriate module system factory for a given adapter.
 * @param adapterName - The identifier of the build system adapter (e.g., 'gradle', 'maven', 'npm')
 * @param repoRoot - The absolute path to the repository root directory
 * @returns A ModuleSystemFactory instance configured for the specified adapter
 * @throws {Error} If the adapter name is not recognized or supported
 */
export declare function createModuleSystemFactory(adapterName: string, repoRoot: string): ModuleSystemFactory;
//# sourceMappingURL=module-system-factory.d.ts.map