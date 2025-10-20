import { BumpType } from '../semver/index.js';
export type Config = {
    readonly defaultBump: BumpType;
    readonly commitTypes: Record<string, BumpType | 'ignore'>;
    readonly dependencyRules: DependencyRules;
    readonly nodejs?: NodeJSConfig;
};
export type DependencyRules = {
    readonly onMajorOfDependency: BumpType;
    readonly onMinorOfDependency: BumpType;
    readonly onPatchOfDependency: BumpType;
};
export type NodeJSConfig = {
    readonly versionSource: ('package.json')[];
    readonly updatePackageLock: boolean;
};
export declare const DEFAULT_CONFIG: Config;
/**
 * Get bump type for a commit based on configuration
 */
export declare function getBumpTypeForCommit(commitType: string, isBreaking: boolean, config: Config): BumpType;
/**
 * Get bump type for a module when one of its dependencies changes
 */
export declare function getDependencyBumpType(dependencyBumpType: BumpType, config: Config): BumpType;
/**
 * Get adapter-specific configuration
 */
export declare function getAdapterConfig<T extends keyof Config>(config: Config, adapterName: T): Config[T];
//# sourceMappingURL=index.d.ts.map