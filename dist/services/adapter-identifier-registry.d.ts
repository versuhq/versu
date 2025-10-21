import { AdapterIdentifier } from './adapter-identifier.js';
/**
 * Registry for managing and discovering adapter identifiers.
 * Provides automatic project adapter detection, fast lookup by ID, and discovery of supported adapters.
 */
export declare class AdapterIdentifierRegistry {
    /**
     * Internal map of adapter identifiers keyed by their unique ID.
     */
    private readonly identifiers;
    /**
     * Cached array of all supported adapter IDs.
     */
    private readonly supportedAdapters;
    /**
     * Creates a new adapter identifier registry.
     * @param identifiers - Array of adapter identifiers to register
     */
    constructor(identifiers: AdapterIdentifier[]);
    /**
     * Automatically identifies which adapter can handle the specified project.
     * @param projectRoot - The absolute path to the root directory of the project to analyze
     * @returns A promise that resolves to the first matching adapter, or `null` if no adapter can handle the project
     */
    identify(projectRoot: string): Promise<AdapterIdentifier | null>;
    /**
     * Retrieves a specific adapter identifier by its unique ID.
     * @param id - The unique identifier of the adapter to retrieve
     * @returns The adapter if found, or `null` if not registered
     */
    getIdentifierById(id: string): AdapterIdentifier | null;
    /**
     * Returns a list of all supported adapter IDs in this registry.
     * @returns An array of adapter ID strings
     */
    getSupportedAdapters(): string[];
}
//# sourceMappingURL=adapter-identifier-registry.d.ts.map