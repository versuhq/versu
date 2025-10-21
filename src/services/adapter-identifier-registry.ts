import { AdapterIdentifier } from './adapter-identifier.js';

/**
 * Registry for managing and discovering adapter identifiers.
 * Provides automatic project adapter detection, fast lookup by ID, and discovery of supported adapters.
 */
export class AdapterIdentifierRegistry {
  /**
   * Internal map of adapter identifiers keyed by their unique ID.
   */
  private readonly identifiers: ReadonlyMap<string, AdapterIdentifier>;
  
  /**
   * Cached array of all supported adapter IDs.
   */
  private readonly supportedAdapters: string[];

  /**
   * Creates a new adapter identifier registry.
   * @param identifiers - Array of adapter identifiers to register
   */
  constructor(identifiers: AdapterIdentifier[]) {
    this.identifiers = new Map(identifiers.map(id => [id.metadata.id, id]));
    this.supportedAdapters = Array.from(this.identifiers.keys());
  }

  /**
   * Automatically identifies which adapter can handle the specified project.
   * @param projectRoot - The absolute path to the root directory of the project to analyze
   * @returns A promise that resolves to the first matching adapter, or `null` if no adapter can handle the project
   */
  async identify(projectRoot: string): Promise<AdapterIdentifier | null> {
    for (const [_, identifier] of this.identifiers) {
      try {
        const result = await identifier.accept(projectRoot);
        if (result) {
          return identifier;
        }
      } catch (error) {
        // Continue to the next identifier if this one fails
        // This ensures robustness - one faulty adapter won't break discovery
        continue;
      }
    }
    
    return null;
  }

  /**
   * Retrieves a specific adapter identifier by its unique ID.
   * @param id - The unique identifier of the adapter to retrieve
   * @returns The adapter if found, or `null` if not registered
   */
  getIdentifierById(id: string): AdapterIdentifier | null {
    return this.identifiers.get(id) || null;
  }

  /**
   * Returns a list of all supported adapter IDs in this registry.
   * @returns An array of adapter ID strings
   */
  getSupportedAdapters(): string[] {
    return this.supportedAdapters;
  }
}
