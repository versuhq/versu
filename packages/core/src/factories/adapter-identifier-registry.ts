import { GradleAdapterIdentifier } from "../adapters/gradle/services/gradle-adapter-identifier.js";
import { AdapterIdentifier } from "../services/adapter-identifier.js";
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
export function createAdapterIdentifierRegistry(): AdapterIdentifierRegistry {
  // Array of all registered adapter identifiers
  // Order matters: first matching adapter is selected during auto-detection
  const identifiers: AdapterIdentifier[] = [
    new GradleAdapterIdentifier(),

    // Add future adapter identifiers here as they are implemented:
    // new MavenAdapterIdentifier(),
    // new NodeJSAdapterIdentifier(),
    // new PythonAdapterIdentifier(),
  ];

  // Create and return the registry with all registered identifiers
  return new AdapterIdentifierRegistry(identifiers);
}
