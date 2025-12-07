/** Metadata describing an adapter's identity and capabilities. */
export type AdapterMetadata = {
  /** Unique identifier (e.g., 'gradle', 'maven', 'npm'). */
  readonly id: string;

  /** Features supported by this adapter. */
  readonly capabilities: AdapterCapabilities;
};

/** Feature capabilities of an adapter. */
export type AdapterCapabilities = {
  /** Whether the adapter supports snapshot versions (e.g., '1.0.0-SNAPSHOT'). */
  readonly supportsSnapshots: boolean;
};

/**
 * Interface for adapter identification and auto-discovery.
 *
 * @remarks
 * Implementations identify which adapter can handle a project by checking for
 * build-system-specific files (e.g., build.gradle, pom.xml, package.json).
 */
export interface AdapterIdentifier {
  /** Adapter metadata with ID and capabilities. */
  readonly metadata: AdapterMetadata;

  /**
   * Determines whether this adapter can handle the specified project.
   *
   * @param projectRoot - Absolute path to project root
   * @returns `true` if adapter can handle the project, `false` otherwise
   */
  accept(projectRoot: string): Promise<boolean>;
}
