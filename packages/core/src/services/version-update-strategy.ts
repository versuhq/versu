/**
 * Strategy for writing version updates to build system-specific files.
 *
 * @remarks
 * Implementations handle version persistence for different build systems (Gradle, Maven, npm).
 * Created by {@link ModuleSystemFactory} and used by {@link VersionManager}.
 */
export interface VersionUpdateStrategy {
  /**
   * Writes version updates for multiple modules to build system configuration files.
   *
   * @param moduleVersions - Map of module ID to new version string
   * @returns Promise that resolves when all updates are written
   * @throws {Error} If build files cannot be found, are not writable, or I/O operations fail
   */
  writeVersionUpdates(moduleVersions: Map<string, string>): Promise<void>;
}
