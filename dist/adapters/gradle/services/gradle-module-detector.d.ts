import { ModuleDetector } from "../../../services/module-detector.js";
import { ModuleRegistry } from '../../../services/module-registry.js';
/**
 * Module detector for Gradle-based projects.
 * Executes Gradle to discover all modules and their dependencies, returning a ModuleRegistry.
 */
export declare class GradleModuleDetector implements ModuleDetector {
    readonly repoRoot: string;
    /** Absolute path to the repository root directory. */
    constructor(repoRoot: string);
    /**
     * Detects and catalogs all modules in the Gradle project.
     * @returns ModuleRegistry containing all discovered modules and their relationships
     * @throws {Error} If Gradle execution fails or project information cannot be parsed
     */
    detect(): Promise<ModuleRegistry>;
}
//# sourceMappingURL=gradle-module-detector.d.ts.map