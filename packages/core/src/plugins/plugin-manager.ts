import {
  findPackagesInNodeModules,
  getCandidateRoots,
  installPackage,
  isGlobalPath,
  uninstallPackage,
} from "../utils/node.js";
import { PluginInformation, PluginManager } from "./types.js";
import { PLUGIN_PATTERNS } from "./constants.js";

class DefaultPluginManager implements PluginManager {
  async list(): Promise<PluginInformation[]> {
    const candidateRoots = await getCandidateRoots();

    const foundPlugins: PluginInformation[] = [];
    for (const root of candidateRoots) {
      const pluginsInRoot = await findPackagesInNodeModules(
        root,
        PLUGIN_PATTERNS,
      );
      const global = await isGlobalPath(root);
      pluginsInRoot.forEach((plugin) =>
        foundPlugins.push({ ...plugin, global }),
      );
    }

    return foundPlugins;
  }

  async install(pluginName: string, global: boolean = false): Promise<void> {
    installPackage(pluginName, global);
  }

  async uninstall(pluginName: string, global: boolean = false): Promise<void> {
    uninstallPackage(pluginName, global);
  }
}

export const pluginManager: PluginManager = new DefaultPluginManager();
