import { ProjectInformation, RawProjectInformation } from '../project-information.js';
/**
 * Executes Gradle to collect raw project structure information.
 * Runs gradlew with init script to output JSON containing module hierarchy, versions, and dependencies.
 * @param projectRoot - Absolute path to the Gradle project root directory
 * @returns Promise resolving to raw project information as JSON
 * @throws {Error} If initialization script not found or Gradle execution fails
 */
export declare function getRawProjectInformation(projectRoot: string): Promise<RawProjectInformation>;
/**
 * Transforms raw project information into structured, queryable format.
 * Normalizes modules, identifies root, parses versions, and maps dependencies.
 * @param projectInformation - Raw project information from Gradle
 * @returns Structured ProjectInformation with normalized data
 * @throws {Error} If no root module found in hierarchy
 */
export declare function getProjectInformation(projectInformation: RawProjectInformation): ProjectInformation;
//# sourceMappingURL=gradle-project-information.d.ts.map