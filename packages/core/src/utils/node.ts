import { execa } from "execa";
import { logger } from "./logger.js";
import { exists } from "./file.js";

export async function getNodeModulesPath(
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
