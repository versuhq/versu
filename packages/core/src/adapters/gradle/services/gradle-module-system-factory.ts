import { ModuleSystemFactory } from "../../../services/module-system-factory.js";
import { ModuleDetector } from "../../../services/module-detector.js";
import { VersionUpdateStrategy } from "../../../services/version-update-strategy.js";
import { GradleModuleDetector } from './gradle-module-detector.js';
import { GradleVersionUpdateStrategy } from './gradle-version-update-strategy.js';
import { ModuleRegistry } from "../../../services/module-registry.js";

/**
 * Factory for creating Gradle-specific module system components.
 * Creates module detector and version update strategy instances.
 */
export class GradleModuleSystemFactory implements ModuleSystemFactory {
  /** Absolute path to the repository root directory. */
  constructor(private readonly repoRoot: string) {}
  
  /**
   * Creates a Gradle-specific module detector.
   * @param outputFile - Path to the output file for project information
   * @returns GradleModuleDetector instance configured with the repository root
   */
  createDetector(outputFile: string): ModuleDetector {
    return new GradleModuleDetector(this.repoRoot, outputFile);
  }
  
  /**
   * Creates a Gradle-specific version update strategy.
   * @param moduleRegistry - ModuleRegistry containing all detected modules
   * @returns GradleVersionUpdateStrategy instance configured with the repository root
   */
  createVersionUpdateStrategy(moduleRegistry: ModuleRegistry): VersionUpdateStrategy {
    return new GradleVersionUpdateStrategy(this.repoRoot, moduleRegistry);
  }
}
