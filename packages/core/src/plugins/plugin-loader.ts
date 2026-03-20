import * as path from "path";
import { exists } from "../utils/file.js";
import { logger } from "../utils/logger.js";
import {
  ConfigurationValidatorFactory,
  type ConfigurationValidator,
} from "../services/configuration-validator.js";
import { findPackagesInNodeModules, getCandidateRoots } from "../utils/node.js";
import { getPluginPath } from "../utils/plugins.js";
import { PluginContract, PluginLoader } from "./types.js";
import { pluginContractSchema } from "./schema.js";
import { PLUGIN_PATTERNS } from "./constants.js";

class DefaultPluginLoader implements PluginLoader {
  private readonly pluginsMap: Map<string, PluginContract> = new Map();

  constructor(
    private readonly pluginValidator: ConfigurationValidator<PluginContract>,
  ) {}

  get plugins(): PluginContract[] {
    return Array.from(this.pluginsMap.values());
  }

  private async detect(): Promise<void> {
    logger.info("Loading all plugins from node_modules");

    const candidateRoots = await getCandidateRoots();

    const loadedPluginIds = new Set<string>();
    const loadedPluginPaths = new Map<string, string>();

    for (const root of candidateRoots) {
      const plugins = await findPackagesInNodeModules(root, PLUGIN_PATTERNS);
      for (const plugin of plugins) {
        if (loadedPluginIds.has(plugin.name)) {
          logger.warning("Plugin already loaded, skipping duplicate", {
            pluginName: plugin.name,
            from: loadedPluginPaths.get(plugin.name),
          });
        } else {
          const loaded = await this.loadPluginFromPath(plugin.path);
          if (loaded) {
            loadedPluginIds.add(plugin.name);
            loadedPluginPaths.set(plugin.name, plugin.path);
          }
        }
      }
    }
  }

  /**
   * 2. Load ONLY the plugins specified in the whitelist
   * @param pluginNames List of package names (e.g. ['my-plugin-alpha', '@scope/my-plugin-beta'])
   */
  public async load(pluginNames: string[]): Promise<void> {
    if (pluginNames.length === 0) {
      logger.info(
        "No plugins specified for loading, defaulting to auto-detect",
      );
      return await this.detect();
    }

    logger.info("Loading plugins", { count: pluginNames.length });

    logger.debug("Plugin loading configuration", { pluginNames });

    const candidateRoots = await getCandidateRoots();

    for (const pluginName of pluginNames) {
      const pluginPath = await getPluginPath(candidateRoots, pluginName);
      if (pluginPath) {
        await this.loadPluginFromPath(pluginPath);
      } else {
        logger.error("Plugin could not be found", { pluginName });
      }
    }
  }

  /**
   * 3. Dynamically require the plugin
   */
  private async loadPluginFromPath(absolutePath: string): Promise<boolean> {
    try {
      logger.info("Attempting to load plugin");
      logger.debug("Loading plugin", { path: absolutePath });

      // Dynamic require using the absolute path
      // For directory imports, we need to resolve to the main entry point
      const pluginEntryPoint = path.join(absolutePath, "dist/index.js");
      const importPath = (await exists(pluginEntryPoint))
        ? pluginEntryPoint
        : absolutePath;
      const rawModule = await import(importPath);

      const plugin = this.pluginValidator.validate(rawModule.default);

      const isAlreadyLoaded = this.pluginsMap.has(plugin.id);

      if (isAlreadyLoaded) {
        logger.warning("Plugin already loaded, skipping duplicate", {
          pluginId: plugin.id,
          path: absolutePath,
        });
        return false;
      }

      this.pluginsMap.set(plugin.id, plugin);

      logger.info(`Plugin loaded`, {
        name: plugin.name,
        id: plugin.id,
        version: plugin.version,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error("Failed to load plugin", {
        path: absolutePath,
        error: errorMessage,
      });
    }
    return true;
  }
}

export const pluginLoader = new DefaultPluginLoader(
  ConfigurationValidatorFactory.create<PluginContract>(pluginContractSchema),
);
