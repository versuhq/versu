import { ModuleRegistry } from "./module-registry.js";
/**
 * Interface for detecting modules in a multi-module repository.
 *
 * @remarks
 * Transforms repository file structure into a structured {@link ModuleRegistry}.
 * Different implementations exist for different build systems (Gradle, Maven, npm).
 * Created by {@link ModuleSystemFactory}.
 */
export interface ModuleDetector {
    /**
     * The absolute path to the repository root directory.
     * Used for resolving module paths and executing build commands.
     */
    readonly repoRoot: string;
    /**
     * Detects all modules in the repository and returns a populated module registry.
     *
     * @returns Promise resolving to {@link ModuleRegistry} with all discovered modules
     * @throws {Error} If repository is invalid, build files are missing, or detection fails
     */
    detect(): Promise<ModuleRegistry>;
}
//# sourceMappingURL=module-detector.d.ts.map