import { Config } from '../config/index.js';
import { ConfigurationValidator } from './configuration-validator.js';
export declare class ConfigurationLoader {
    private readonly configurationValidator;
    constructor(configurationValidator: ConfigurationValidator);
    load(configPath?: string, repoRoot?: string): Promise<Config>;
}
//# sourceMappingURL=configuration-loader.d.ts.map