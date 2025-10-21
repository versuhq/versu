import { VersionUpdateStrategy } from "../../../services/version-update-strategy.js";
/**
 * Gradle-specific implementation for version update operations.
 * Updates module versions by modifying gradle.properties file.
 */
export declare class GradleVersionUpdateStrategy implements VersionUpdateStrategy {
    /** Absolute path to the gradle.properties file. */
    private readonly versionFilePath;
    /**
     * Creates a new Gradle version update strategy.
     * @param repoRoot - Absolute path to the repository root directory
     */
    constructor(repoRoot: string);
    /**
     * Writes version updates for multiple modules to gradle.properties.
     * @param moduleVersions - Map of module IDs to new version strings
     * @throws {Error} If the file cannot be read or written
     */
    writeVersionUpdates(moduleVersions: Map<string, string>): Promise<void>;
}
//# sourceMappingURL=gradle-version-update-strategy.d.ts.map