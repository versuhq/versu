import { AdapterIdentifier } from '../../../services/adapter-identifier.js';
/**
 * Adapter identifier for Gradle-based projects.
 * Detects Gradle projects by looking for gradle.properties, build.gradle(.kts), or settings.gradle(.kts) files.
 */
export declare class GradleAdapterIdentifier implements AdapterIdentifier {
    /** Metadata describing this Gradle adapter (id: 'gradle', supports snapshots). */
    readonly metadata: {
        id: string;
        capabilities: {
            supportsSnapshots: boolean;
        };
    };
    /**
     * Determines whether the specified project is a Gradle project.
     * @param projectRoot - Absolute path to the project root directory
     * @returns True if any Gradle-specific file is found in the project root
     */
    accept(projectRoot: string): Promise<boolean>;
}
//# sourceMappingURL=gradle-adapter-identifier.d.ts.map