import * as path from "path";
import { exists } from "../utils/file.js";
import { logger } from "../utils/logger.js";
import type { AdapterIdentifier } from "../services/adapter-identifier.js";
import type { ModuleSystemFactory } from "../services/module-system-factory.js";
import {
  ConfigurationValidator,
  ConfigurationValidatorFactory,
} from "../services/configuration-validator.js";
import {
  getNodeModulesPath,
  installPackage,
  uninstallPackage,
} from "../utils/node.js";
import { getPluginPath } from "../utils/plugins.js";
import fg from "fast-glob";
import { pluginContractSchema } from "./plugin-schema.js";

export type PluginContract = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  adapters: AdapterPluginContract[];
};

export type AdapterPluginContract = {
  id: string;
  adapterIdentifier: () => AdapterIdentifier;
  moduleSystemFactory: (repoRoot: string) => ModuleSystemFactory;
};

export interface PluginManager {
  list(): Promise<{ name: string; global: boolean }[]>;
  install(pluginName: string, global?: boolean): Promise<void>;
  uninstall(pluginName: string, global?: boolean): Promise<void>;
};

export interface PluginLoader extends PluginManager {
  plugins: PluginContract[];
  load(pluginNames: string[]): Promise<void>;
}

class DefaultPluginLoader implements PluginLoader {
  private readonly pluginsMap: Map<string, PluginContract> = new Map();

  private localNodeModulesPath?: string;
  private localNodeModulesPathInitialized = false;

  private globalNodeModulesPath?: string;
  private globalNodeModulesPathInitialized = false;

  constructor(
    private readonly pluginValidator: ConfigurationValidator<PluginContract>,
  ) {}

  get plugins(): PluginContract[] {
    return Array.from(this.pluginsMap.values());
  }

  private async initializeNodeModulesPaths() {
    if (!this.localNodeModulesPathInitialized) {
      this.localNodeModulesPath = await getNodeModulesPath(false);
      this.localNodeModulesPathInitialized = true;
    }
    if (!this.globalNodeModulesPathInitialized) {
      this.globalNodeModulesPath = await getNodeModulesPath(true);
      this.globalNodeModulesPathInitialized = true;
    }
  }

  private async getCandidateRoots(): Promise<string[]> {
    await this.initializeNodeModulesPaths();

    const candidateRoots = [
      this.localNodeModulesPath,
      this.globalNodeModulesPath,
    ].filter((root): root is string => !!root);

    if (candidateRoots.length === 0) {
      throw new Error("No node_modules paths available to search for plugins");
    }

    return candidateRoots;
  }

  async list(): Promise<{ name: string; global: boolean }[]> {
    const candidateRoots = await this.getCandidateRoots();

    const foundPlugins: { name: string; global: boolean }[] = [];
    for (const root of candidateRoots) {
      const pluginsInRoot = await this.findPluginsInNodeModules(root);
      const global = root === this.globalNodeModulesPath;
      pluginsInRoot.forEach((plugin) =>
        foundPlugins.push({ name: plugin, global }),
      );
    }

    return foundPlugins;
  }

  private async findPluginsInNodeModules(
    nodeModulesPath: string,
  ): Promise<string[]> {
    logger.debug("Searching for plugins in node_modules", { nodeModulesPath });

    const patterns = [
      `${nodeModulesPath}/versu-plugin-*/package.json`,
      `${nodeModulesPath}/@*/versu-plugin-*/package.json`,
      `${nodeModulesPath}/@versu/plugin-*/package.json`,
    ];
    const entries = await fg(patterns, { absolute: true });
    const plugins = entries
      .map((entry) => {
        const parts = entry.split(path.sep);
        const packageIndex =
          parts.findIndex((part) => part === "node_modules") + 1;
        if (packageIndex > 0 && packageIndex < parts.length) {
          return parts.slice(packageIndex, parts.length - 1).join(path.sep);
        }
      })
      .filter((name): name is string => !!name);
    return plugins;
  }

  async install(pluginName: string, global: boolean = false): Promise<void> {
    installPackage(pluginName, global);
  }

  async uninstall(pluginName: string, global: boolean = false): Promise<void> {
    uninstallPackage(pluginName, global);
  }

  /**
   * 2. Load ONLY the plugins specified in the whitelist
   * @param pluginNames List of package names (e.g. ['my-plugin-alpha', '@scope/my-plugin-beta'])
   */
  public async load(pluginNames: string[]) {
    logger.info("Loading plugins", { count: pluginNames.length });

    logger.debug("Plugin loading configuration", { pluginNames });

    const candidateRoots = await this.getCandidateRoots();

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
  private async loadPluginFromPath(absolutePath: string): Promise<void> {
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
        return;
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
  }
}

export const pluginLoader: PluginLoader = new DefaultPluginLoader(
  ConfigurationValidatorFactory.create<PluginContract>(pluginContractSchema),
);

export const pluginManager = pluginLoader as PluginManager;