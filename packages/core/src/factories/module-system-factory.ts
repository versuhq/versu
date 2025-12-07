import { ModuleSystemFactory } from "../services/module-system-factory.js";
import { GradleModuleSystemFactory } from "../adapters/gradle/services/gradle-module-system-factory.js";
import { GRADLE_ID } from "../adapters/gradle/constants.js";

/**
 * Creates the appropriate module system factory for a given adapter.
 * @param adapterName - The identifier of the build system adapter (e.g., 'gradle', 'maven', 'npm')
 * @param repoRoot - The absolute path to the repository root directory
 * @returns A ModuleSystemFactory instance configured for the specified adapter
 * @throws {Error} If the adapter name is not recognized or supported
 */
export function createModuleSystemFactory(
  adapterName: string,
  repoRoot: string,
): ModuleSystemFactory {
  // Normalize adapter name to lowercase for case-insensitive matching
  switch (adapterName.toLowerCase()) {
    case GRADLE_ID:
      return new GradleModuleSystemFactory(repoRoot);

    default:
      throw new Error(`Unsupported adapter: ${adapterName}`);
  }
}
