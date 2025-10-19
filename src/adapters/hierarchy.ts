import { SemVer } from "semver";

/**
 * Common project hierarchy types used across different adapters
 * These types represent the generic structure of project dependencies
 * regardless of the specific build system (Gradle, Maven, etc.)
 */

/**
 * Represents a single project in the hierarchy with its dependencies
 */
export type RawModule = {
  /** Human-readable name of the project */
  readonly name: string;
  /** Path from repository root to the project directory */
  readonly path: string;
  /** List of subproject ids that are affected when this project changes */
  readonly affectedModules: string[];
  /** Version of the project */
  readonly version?: string;
  /** Project type indicating if it's the root project or a submodule */
  readonly type: 'module' | 'root';
  /** Whether the version is explicitly declared or inferred by inheritance */
  readonly declaredVersion: boolean;
};

/**
 * Complete project hierarchy dependencies structure
 * Keys are project paths (e.g., ":", ":base", ":spring:core" for Gradle)
 * Root project is represented by ":" or empty string
 */
export type RawProjectInformation = {
  readonly [id: string]: RawModule;
};
