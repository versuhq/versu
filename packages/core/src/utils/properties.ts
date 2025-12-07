import { promises as fs } from "fs";
import { exists } from "./file.js";

/**
 * Updates or inserts a single property in a Java-style properties file.
 * @param propertiesPath - Path to the properties file
 * @param key - Property key to update or insert
 * @param value - Property value to set
 */
export async function upsertProperty(
  propertiesPath: string,
  key: string,
  value: string,
): Promise<void> {
  // Delegate to batch function with single-entry map
  await upsertProperties(propertiesPath, new Map([[key, value]]));
}

/**
 * Updates or inserts multiple properties in a Java-style properties file.
 * Updates existing properties in place, appends new ones to the end.
 * @param propertiesPath - Path to the properties file
 * @param properties - Map of property keys to values
 * @throws {Error} If file operations fail
 */
export async function upsertProperties(
  propertiesPath: string,
  properties: Map<string, string>,
): Promise<void> {
  // Early return for empty updates (optimization)
  if (properties.size === 0) {
    return; // Nothing to update
  }

  // Check if properties file already exists
  const propertiesExist = await exists(propertiesPath);

  let updatedContent: string;

  if (propertiesExist) {
    // File exists - read current content and update properties
    let content = await fs.readFile(propertiesPath, "utf8");

    // Process each property update
    for (const [key, value] of properties) {
      // Escape special regex characters in property key
      // This ensures keys like 'my.app.version' don't become regex patterns
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Match property lines: key=value or key:value (with optional whitespace)
      // Anchored to line start (^) and end ($) with multiline flag (m)
      const propertyRegex = new RegExp(`^${escapedKey}\\s*[=:]\\s*.*$`, "m");

      if (propertyRegex.test(content)) {
        // Property exists - replace the line with updated value
        content = content.replace(propertyRegex, `${key}=${value}`);
      } else {
        // Property doesn't exist - append to end of file
        // Add newline separator if file doesn't end with one
        const separator = content.endsWith("\n") ? "" : "\n";
        content = content + separator + `${key}=${value}\n`;
      }
    }

    updatedContent = content;
  } else {
    // File doesn't exist - create new properties content
    const lines: string[] = [];
    for (const [key, value] of properties) {
      lines.push(`${key}=${value}`);
    }
    updatedContent = lines.join("\n") + "\n";
  }

  // Write updated content to file (creates or overwrites)
  await fs.writeFile(propertiesPath, updatedContent, "utf8");
}
