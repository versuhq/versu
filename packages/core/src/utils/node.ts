import { execa } from "execa";
import { logger } from "./logger.js";
import { exists } from "./file.js";
import fg from "fast-glob";
import * as path from "path";

async function getNodeModulesPath(
  global: boolean,
): Promise<string | undefined> {
  logger.debug("Determining node_modules path", { global });

  const args = ["root"];
  if (global) {
    args.push("-g");
  }

  const { stdout } = await execa("npm", args, {
    encoding: "utf8",
  });
  const root = stdout.trim();

  logger.debug("npm root executed", { root, global });

  if (root && (await exists(root))) {
    logger.debug("node_modules path resolved", { path: root, global });
    return root;
  }
}

export async function installPackage(
  packageName: string,
  global: boolean,
): Promise<void> {
  logger.info("Installing package", { packageName, global });

  const args = ["install", packageName];
  if (global) {
    args.push("-g");
  }

  try {
    await execa("npm", args, {
      stdio: "inherit",
    });
    logger.info("Package installed successfully", { packageName, global });
  } catch (error) {
    logger.error("Failed to install package", { packageName, global, error });
    throw error;
  }
}

export async function uninstallPackage(
  packageName: string,
  global: boolean,
): Promise<void> {
  logger.info("Uninstalling package", { packageName, global });

  const args = ["uninstall", packageName];
  if (global) {
    args.push("-g");
  }

  try {
    await execa("npm", args, {
      stdio: "inherit",
    });
    logger.info("Package uninstalled successfully", { packageName, global });
  } catch (error) {
    logger.error("Failed to uninstall package", { packageName, global, error });
    throw error;
  }
}

export async function findPackagesInNodeModules(
  nodeModulesPath: string,
  patterns: readonly string[],
): Promise<{ name: string; path: string }[]> {
  logger.debug("Searching for packages in node_modules", { nodeModulesPath });

  const globPatterns = patterns.map(
    (pattern) => `${nodeModulesPath}/${pattern}/package.json`,
  );
  const entries = await fg(globPatterns, { absolute: true });
  const packages = entries
    .map((entry) => {
      const parts = entry.split(path.sep);
      const packageIndex =
        parts.findIndex((part) => part === "node_modules") + 1;
      if (packageIndex > 0 && packageIndex < parts.length) {
        return {
          name: parts.slice(packageIndex, parts.length - 1).join(path.sep),
          path: path.join(path.sep, ...parts.slice(0, parts.length - 1)),
        };
      }
    })
    .filter((pkg): pkg is { name: string; path: string } => !!pkg);
  return packages;
}

let localNodeModulesPathInitialized = false;
let globalNodeModulesPathInitialized = false;
let localNodeModulesPath: string | undefined;
let globalNodeModulesPath: string | undefined;

async function initializeNodeModulesPaths() {
  if (!localNodeModulesPathInitialized) {
    localNodeModulesPath = await getNodeModulesPath(false);
    localNodeModulesPathInitialized = true;
  }
  if (!globalNodeModulesPathInitialized) {
    globalNodeModulesPath = await getNodeModulesPath(true);
    globalNodeModulesPathInitialized = true;
  }
}

export async function getCandidateRoots(): Promise<string[]> {
  await initializeNodeModulesPaths();

  const candidateRoots = [localNodeModulesPath, globalNodeModulesPath].filter(
    (root): root is string => !!root,
  );

  if (candidateRoots.length === 0) {
    throw new Error("No node_modules paths available to search for plugins");
  }

  return candidateRoots;
}

export async function isGlobalPath(path: string): Promise<boolean> {
  await initializeNodeModulesPaths();
  return globalNodeModulesPath == path;
}
