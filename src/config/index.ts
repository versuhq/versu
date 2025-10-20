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

export const DEFAULT_CONFIG: Config = {
  defaultBump: 'patch',
  commitTypes: {
    feat: 'minor',
    fix: 'patch',
    perf: 'patch',
    refactor: 'patch',
    docs: 'ignore',
    test: 'ignore',
    chore: 'ignore',
    style: 'ignore',
    ci: 'ignore',
    build: 'ignore',
  },
  dependencyRules: {
    onMajorOfDependency: 'major',
    onMinorOfDependency: 'minor',
    onPatchOfDependency: 'patch',
  }
};

/**
 * Get bump type for a commit based on configuration
 */
export function getBumpTypeForCommit(
  commitType: string,
  isBreaking: boolean,
  config: Config
): BumpType {
  if (isBreaking) {
    return 'major';
  }
  
  const configuredBump = config.commitTypes[commitType];
  
  if (configuredBump === 'ignore') {
    return 'none';
  }
  
  return configuredBump || config.defaultBump;
}

/**
 * Get bump type for a module when one of its dependencies changes
 */
export function getDependencyBumpType(
  dependencyBumpType: BumpType,
  config: Config
): BumpType {
  const rules = config.dependencyRules;
  
  switch (dependencyBumpType) {
    case 'major':
      return rules.onMajorOfDependency;
    case 'minor':
      return rules.onMinorOfDependency;
    case 'patch':
      return rules.onPatchOfDependency;
    default:
      return 'none';
  }
}

/**
 * Get adapter-specific configuration
 */
export function getAdapterConfig<T extends keyof Config>(
  config: Config,
  adapterName: T
): Config[T] {
  return config[adapterName];
}
