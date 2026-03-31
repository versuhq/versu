// Core Versu exports - business logic without GitHub Actions dependency

// Configuration
export * from './config/index.js';
export type * from './config/types.js';

// Plugins
export type * from './plugins/types.js';
export { pluginManager } from './plugins/plugin-manager.js';

// Services
export { VersuRunner } from './services/versu-runner.js';
export type { RunnerOptions, RunnerResult } from './services/versu-runner.js';
export type { ModuleRegistry } from './services/module-registry.js';
export type { ModuleChangeResult } from './services/version-applier.js';
export type { AdapterIdentifier, AdapterMetadata } from './services/adapter-identifier.js';
export type { ModuleDetector } from './services/module-detector.js';
export type { VersionUpdateStrategy } from './services/version-update-strategy.js';

// Adapters
export type * from './adapters/project-information.js';

// Factories
export type { ModuleSystemFactory } from './services/module-system-factory.js';

// Git utilities
export * from './git/index.js';
export type * from './git/types.js';

// Semver utilities
export * from './semver/index.js';
export type * from './semver/types.js';

// Utilities
export * from './utils/index.js';
