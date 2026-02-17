import { logger } from "./logger.js";
import * as path from "path";
import { exists } from "./file.js";
import { installPackage } from "./node.js";

export async function getPluginPath(
  candidateRoots: string[],
  pluginName: string,
): Promise<string | undefined> {
  for (const root of candidateRoots) {
    const pluginPath = path.join(root, pluginName);
    if (await exists(pluginPath)) {
      return pluginPath;
    }
  }
}

export async function getPluginPathAutoInstall(
  candidateRoots: string[],
  pluginName: string,
  installIfMissing: boolean,
): Promise<string | undefined> {
  const pluginPath = await getPluginPath(candidateRoots, pluginName);
  if (pluginPath) {
    return pluginPath;
  }

  if (!installIfMissing) {
    logger.error("Plugin not found and installation is disabled", {
      pluginName,
    });
    return undefined;
  }

  logger.warning("Plugin not found, attempting installation", { pluginName });
  const installed = await installPackage(pluginName, true).then(
    () => true,
    (error) => {
      logger.error("Failed to install plugin", { pluginName, error });
      return false;
    },
  );

  if (installed) {
    return await getPluginPath(candidateRoots, pluginName);
  }
}
