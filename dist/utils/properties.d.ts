/**
 * Updates or inserts a single property in a Java-style properties file.
 * @param propertiesPath - Path to the properties file
 * @param key - Property key to update or insert
 * @param value - Property value to set
 */
export declare function upsertProperty(propertiesPath: string, key: string, value: string): Promise<void>;
/**
 * Updates or inserts multiple properties in a Java-style properties file.
 * Updates existing properties in place, appends new ones to the end.
 * @param propertiesPath - Path to the properties file
 * @param properties - Map of property keys to values
 * @throws {Error} If file operations fail
 */
export declare function upsertProperties(propertiesPath: string, properties: Map<string, string>): Promise<void>;
//# sourceMappingURL=properties.d.ts.map