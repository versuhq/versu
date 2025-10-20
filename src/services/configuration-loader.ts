import * as core from '@actions/core';
import { Config, DEFAULT_CONFIG } from '../config/index.js';
import { cosmiconfig } from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { exists } from '../utils/file.js';
import { join } from 'path';
import { ConfigurationValidator } from './configuration-validator.js';

export class ConfigurationLoader {

  constructor(private readonly configurationValidator: ConfigurationValidator) {}

  async load(configPath?: string, repoRoot?: string): Promise<Config> {    
    try {
      core.info(`🔍 Searching for VERSE configuration...`);
      
      const explorer = cosmiconfig('verse');

      let result;
      
      if (configPath && repoRoot) {
        // If specific config path provided, try to load it
        const fullPath = join(repoRoot, configPath);
        if (await exists(fullPath)) {
          result = await explorer.load(fullPath);
        } else {
          core.info(`Specified config file not found at ${configPath}, searching for config files...`);
          result = await explorer.search(repoRoot);
        }
      } else {
        // Search for config in standard locations
        const searchStart = repoRoot || process.cwd();
        result = await explorer.search(searchStart);
      }

      let config: Config;
      
      if (result?.config) {
        const configSource = result.filepath ? `from ${result.filepath}` : 'from package.json';
        core.info(`📋 Configuration loaded ${configSource}`);
        
        const userConfig = result.config;
        const validatedConfig = mergeConfig(DEFAULT_CONFIG, userConfig);
        this.configurationValidator.validate(validatedConfig);

        config = validatedConfig;
      } else {
        core.info(`No configuration found, using defaults`);
        config = DEFAULT_CONFIG;
      }

      core.info(`✅ Configuration loaded successfully`);

      return config;

    } catch (error) {
      throw new Error(`Failed to load configuration: ${error}`);
    }
  }
}

function mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
  return deepmerge(defaultConfig, userConfig, {
    // Custom merge for arrays - replace instead of concatenating
    arrayMerge: (target, source) => source,
  }) as Config;
}
