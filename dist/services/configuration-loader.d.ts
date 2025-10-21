import { Config } from '../config/index.js';
import { ConfigurationValidator } from './configuration-validator.js';
/**
 * Loads and merges VERSE configuration from various sources (.verserc, verse.config.js, package.json).
 * Uses cosmiconfig for auto-discovery and merges user config with defaults.
 */
export declare class ConfigurationLoader {
    private readonly configurationValidator;
    /**
     * Creates a new configuration loader.
     * @param configurationValidator - Validator to ensure configuration integrity
     */
    constructor(configurationValidator: ConfigurationValidator);
    /**
     * Loads and validates the VERSE configuration.
     * @param configPath - Optional relative path to a specific configuration file
     * @param repoRoot - Optional absolute path to the repository root directory
     * @returns A promise that resolves to the fully merged and validated configuration
     * @throws {Error} If configuration loading or validation fails
     */
    load(configPath?: string, repoRoot?: string): Promise<Config>;
}
//# sourceMappingURL=configuration-loader.d.ts.map