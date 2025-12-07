/** Gradle module identifier for the root project (':'). */
const ROOT_MODULE_ID = ':';

/** Property name for version configuration in gradle.properties ('version'). */
const VERSION = 'version';

/** Separator character used in Gradle module identifiers (':'). */
const MODULE_SEPARATOR = ':';

/** Separator character used in gradle.properties property names ('.'). */
const DOT_SEPARATOR = '.';

/** Regular expression to match and remove the '.version' suffix. */
const VERSION_REGEX = /\.version$/;

/**
 * Converts a gradle.properties version property name to a Gradle module ID.
 * @param propertyName - Version property name from gradle.properties
 * @returns Corresponding Gradle module ID
 */
export function versionPropertyNameToModuleId(propertyName: string): string {
  // Handle root project special case
  if (propertyName === VERSION) {
    return ROOT_MODULE_ID;
  }
  
  // Remove '.version' suffix
  const nameWithoutSuffix = propertyName.replace(VERSION_REGEX, '');
  
  // Convert dot-separated to colon-separated module path: "x.y" -> ":x:y"
  return `${ROOT_MODULE_ID}${nameWithoutSuffix.replaceAll(DOT_SEPARATOR, MODULE_SEPARATOR)}`;
}

/**
 * Converts a Gradle module ID to a gradle.properties version property name.
 * Uses only the last component of the module path (e.g., ':lib:core' → 'core.version').
 * @param moduleId - Gradle module ID (e.g., ':', ':app', ':lib:core')
 * @returns Corresponding property name for gradle.properties
 * @throws {Error} If the module ID is invalid or cannot be parsed
 */
export function moduleIdToVersionPropertyName(moduleId: string): string {
  // Handle root project special case
  if (moduleId === ROOT_MODULE_ID) {
    return VERSION;
  }

  // Split by module separator and get the last component (module name)
  const name = moduleId.split(MODULE_SEPARATOR).at(-1);
  
  // Validate that we got a valid module name
  if (!name) {
    throw new Error(`Invalid module ID: ${moduleId}`);
  }

  // Return property name: {name}.version
  return `${name}.${VERSION}`;
}
