import { promises as fs } from "fs";
import { join } from "path";
import { ModuleChangeResult } from "../services/version-applier.js";
import {
  Context,
  Options,
  writeChangelogString,
} from "conventional-changelog-writer";
import { logger } from "../utils/logger.js";
import { Commit } from "conventional-commits-parser";
import { exists } from "../utils/file.js";
import {
  getCurrentRepoUrl,
  getModuleTagName,
  parseRepoUrl,
  parseTagName,
} from "../git/index.js";
import { isReleaseVersion } from "../semver/index.js";
import { ModuleReleaseChangesConfig } from "../config/types.js";
import { GitOptions } from "../git/types.js";
import Handlebars from "handlebars";

Handlebars.registerHelper("eq", (a, b) => a === b);
Handlebars.registerHelper("ne", (a, b) => a !== b);
Handlebars.registerHelper("and", (a, b) => a && b);
Handlebars.registerHelper("or", (a, b) => a || b);
Handlebars.registerHelper("not", (a) => !a);

/** Update or create changes file for a module. */
export async function updateRenderFile(
  content: string,
  filePath: string,
  prependPlaceholder: string,
): Promise<void> {
  let fileContent = content;
  if (await exists(filePath)) {
    logger.info("Updating existing changes", { path: filePath });
    // Try to read existing changes
    const existingContent = await fs.readFile(filePath, "utf8");
    const newContent = `${prependPlaceholder}\n\n${content.trimEnd()}`;

    fileContent = existingContent.replace(prependPlaceholder, newContent);
  }
  await fs.writeFile(filePath, fileContent, "utf8");
}

type ContextRepository = {
  repoUrl: string;
  host: string;
  owner: string;
  repository: string;
};

async function buildContextRepository(
  options: GitOptions = {},
): Promise<ContextRepository> {
  const repoUrl = await getCurrentRepoUrl(options);
  const { host, owner, repo } = parseRepoUrl(repoUrl);
  return {
    repoUrl: `https://${host}/${owner}/${repo}`,
    host: `https://${host}`,
    owner,
    repository: repo,
  };
}

/** Generate changes for multiple modules. */
export async function renderChangesForModules(
  moduleResults: ModuleChangeResult[],
  getCommitsForModule: (
    moduleId: string,
  ) => Promise<{ commits: Commit[]; lastTag: string | null }>,
  repoRoot: string,
  dryRun: boolean,
  filename: string,
  multiModule: boolean,
  config?: ModuleReleaseChangesConfig,
  provider?: string,
): Promise<string[]> {
  const renderedPaths: string[] = [];

  if (!config) {
    throw new Error(`Missing required changes rendering configuration`);
  }

  const prependPlaceholder = config?.context?.prependPlaceholder;

  if (!prependPlaceholder) {
    throw new Error(
      "Missing required changes rendering context property 'prependPlaceholder'",
    );
  }

  const contextRepository = await buildContextRepository({ cwd: repoRoot });

  for (const moduleResult of moduleResults) {
    if (moduleResult.type === "root" && multiModule) {
      logger.info(
        "Skipping root module for individual changes generation since multi-module changes enabled",
        { moduleId: moduleResult.id },
      );
      continue;
    }
    if (!moduleResult.declaredVersion) {
      logger.debug(
        "Module has no declared version, skipping changes generation",
        { moduleId: moduleResult.id },
      );
      continue;
    }

    const { commits, lastTag } = await getCommitsForModule(moduleResult.id);

    if (commits.length === 0) {
      logger.info("No commits found, skipping rendering changes", {
        moduleId: moduleResult.id,
      });
      continue;
    }

    const renderedPath = join(repoRoot, moduleResult.path, filename);

    let prepend = true;
    if (await exists(renderedPath)) {
      prepend = false;
    }

    const isRelease = isReleaseVersion(moduleResult.to);
    const version = isRelease ? moduleResult.to : undefined;
    const currentTag = isRelease
      ? `${moduleResult.name}@${moduleResult.to}`
      : undefined;
    const previousTag = lastTag || undefined;

    const changesContent = await writeChangelogString(
      commits,
      {
        version: version,
        previousTag: previousTag,
        currentTag: currentTag,
        linkCompare: previousTag && currentTag ? true : false,
        ...contextRepository,
        ...config?.context,
        prepend,
        provider,
      } as Context<Commit>,
      config?.options as Options<Commit>,
    );

    if (dryRun) {
      logger.info("Dry run enabled, skipping writing changes to file", {
        moduleId: moduleResult.id,
      });
      logger.debug("Generated changes content", { changesContent });
    } else {
      await updateRenderFile(changesContent, renderedPath, prependPlaceholder);
    }

    renderedPaths.push(renderedPath);
  }

  return renderedPaths;
}

export async function renderRootChanges(
  moduleResults: ModuleChangeResult[],
  getCommitsForModule: (
    moduleId: string,
  ) => Promise<{ commits: Commit[]; lastTag: string | null }>,
  repoRoot: string,
  dryRun: boolean,
  filename: string,
  config?: ModuleReleaseChangesConfig,
  provider?: string,
): Promise<string | undefined> {
  const moduleResult = moduleResults.find((result) => result.type === "root");

  if (!moduleResult) {
    logger.info("No root module found, skipping root changes generation");
    return;
  }

  if (!config) {
    throw new Error(`Missing required changes rendering configuration`);
  }

  logger.info("Loading root changes configuration");

  const prependPlaceholder = config?.context?.prependPlaceholder;

  if (!prependPlaceholder) {
    throw new Error(
      "Missing required changes rendering context property 'prependPlaceholder'",
    );
  }

  const contextRepository = await buildContextRepository({ cwd: repoRoot });

  const { commits, lastTag } = await getCommitsForModule(moduleResult.id);

  if (commits.length === 0) {
    logger.info("No commits found, skipping root changes", {
      moduleId: moduleResult.id,
    });
    return;
  }

  const renderedPath = join(repoRoot, moduleResult.path, filename);

  let prepend = true;
  if (await exists(renderedPath)) {
    prepend = false;
  }

  const isRelease = isReleaseVersion(moduleResult.to);
  const version = isRelease ? moduleResult.to : undefined;
  const currentTag = isRelease
    ? getModuleTagName(moduleResult.name, moduleResult.to)
    : undefined;
  const previousTag = lastTag || undefined;

  const changesContent = await writeChangelogString(
    commits,
    {
      moduleResults,
      version: version,
      previousTag: previousTag,
      previousTagVersion: previousTag
        ? parseTagName(previousTag).version
        : undefined,
      currentTag: currentTag,
      linkCompare: previousTag && currentTag ? true : false,
      ...contextRepository,
      ...config?.context,
      prepend,
      provider,
    } as Context<Commit>,
    config?.options as Options<Commit>,
  );

  if (dryRun) {
    logger.info("Dry run enabled, skipping writing root changes to file", {
      moduleId: moduleResult.id,
    });
    logger.debug("Generated root changes content", { changesContent });
  } else {
    await updateRenderFile(changesContent, renderedPath, prependPlaceholder);
  }

  return renderedPath;
}
