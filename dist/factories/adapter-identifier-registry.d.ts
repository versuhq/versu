import { AdapterIdentifierRegistry } from "../services/adapter-identifier-registry.js";
/**
 * Creates and configures the global adapter identifier registry.
 *
 * @returns Configured {@link AdapterIdentifierRegistry} with all available adapters
 *
 * @remarks
 * Central point for registering all supported project adapters.
 * To add a new adapter, implement {@link AdapterIdentifier} and add it to the array.
 */
export declare function createAdapterIdentifierRegistry(): AdapterIdentifierRegistry;
//# sourceMappingURL=adapter-identifier-registry.d.ts.map