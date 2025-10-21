import { AdapterMetadata } from './adapter-identifier.js';
import { AdapterIdentifierRegistry } from './adapter-identifier-registry.js';
/**
 * Configuration options for the adapter metadata provider.
 */
export type AdapterMetadataProviderOptions = {
    /**
     * Optional explicit adapter identifier. When provided, overrides auto-detection.
     */
    adapter?: string;
    /**
     * The absolute path to the repository root directory.
     */
    repoRoot: string;
};
/**
 * Provides adapter metadata with support for explicit specification and auto-detection.
 */
export declare class AdapterMetadataProvider {
    private readonly adapterIdentifierRegistry;
    private readonly options;
    /**
     * The normalized adapter ID from options, if provided.
     */
    private readonly adapterId;
    /**
     * Creates a new adapter metadata provider.
     * @param adapterIdentifierRegistry - The registry containing all available adapter identifiers
     * @param options - Configuration options for adapter resolution
     */
    constructor(adapterIdentifierRegistry: AdapterIdentifierRegistry, options: AdapterMetadataProviderOptions);
    /**
     * Retrieves the metadata for the resolved adapter.
     * @returns A promise that resolves to the adapter metadata
     * @throws {Error} If the specified adapter is not supported or no adapter can be auto-detected
     */
    getMetadata(): Promise<AdapterMetadata>;
    /**
     * Attempts to retrieve the explicitly specified adapter.
     * @returns A promise that resolves to the adapter if specified and found, or `null` if not specified
     * @throws {Error} If an adapter was specified but is not registered in the registry
     */
    private getSpecifiedAdapter;
    /**
     * Attempts to automatically detect the appropriate adapter for the project.
     * @returns A promise that resolves to the auto-detected adapter
     * @throws {Error} If no adapter could be detected for the project
     */
    private getAutoDetectedAdapter;
}
//# sourceMappingURL=adapter-metadata-provider.d.ts.map