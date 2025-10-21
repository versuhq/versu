/**
 * Converts a gradle.properties version property name to a Gradle module ID.
 * @param propertyName - Version property name from gradle.properties
 * @returns Corresponding Gradle module ID
 */
export declare function versionPropertyNameToModuleId(propertyName: string): string;
/**
 * Converts a Gradle module ID to a gradle.properties version property name.
 * Uses only the last component of the module path (e.g., ':lib:core' → 'core.version').
 * @param moduleId - Gradle module ID (e.g., ':', ':app', ':lib:core')
 * @returns Corresponding property name for gradle.properties
 * @throws {Error} If the module ID is invalid or cannot be parsed
 */
export declare function moduleIdToVersionPropertyName(moduleId: string): string;
//# sourceMappingURL=gradle-properties.d.ts.map