import { ModuleSystemFactory } from "../../../services/module-system-factory.js";
import { ModuleDetector } from "../../../services/module-detector.js";
import { VersionUpdateStrategy } from "../../../services/version-update-strategy.js";
/**
 * Factory for creating Gradle-specific module system components.
 * Creates module detector and version update strategy instances.
 */
export declare class GradleModuleSystemFactory implements ModuleSystemFactory {
    private readonly repoRoot;
    /** Absolute path to the repository root directory. */
    constructor(repoRoot: string);
    /**
     * Creates a Gradle-specific module detector.
     * @returns GradleModuleDetector instance configured with the repository root
     */
    createDetector(): ModuleDetector;
    /**
     * Creates a Gradle-specific version update strategy.
     * @returns GradleVersionUpdateStrategy instance configured with the repository root
     */
    createVersionUpdateStrategy(): VersionUpdateStrategy;
}
//# sourceMappingURL=gradle-module-system-factory.d.ts.map