import { logger } from "../utils/logger.js";
import {
  generateChangelogsForModules,
  generateRootChangelog,
} from "../changelog/index.js";
import { ModuleChangeResult } from "./version-applier.js";
import { Commit } from "conventional-commits-parser";
import { ChangelogConfig } from "../config/types.js";

export type ChangelogGeneratorOptions = {
  generateChangelog: boolean;
  repoRoot: string;
  dryRun: boolean;
  multiModule: boolean;
  filename: string;
  config?: ChangelogConfig;
  provider?: string;
};

export class ChangelogGenerator {
  constructor(private readonly options: ChangelogGeneratorOptions) {}

  async generateChangelogs(
    moduleResults: ModuleChangeResult[],
    moduleCommits: Map<string, { commits: Commit[]; lastTag: string | null }>,
  ): Promise<string[]> {
    if (!this.options.generateChangelog) {
      logger.info("Changelog generation disabled, skipping");
      return [];
    }

    if (moduleResults.length === 0) {
      logger.info(
        "No modules with declared versions, skipping changelog generation",
      );
      return [];
    }

    if (moduleResults.length > 1 && !this.options.multiModule) {
      throw new Error(
        "Multi-module changelog generation disabled but multiple modules being processed",
      );
    }

    logger.info("Generating changelogs");

    // Generate individual module changelogs
    const changelogPaths = await generateChangelogsForModules(
      moduleResults,
      async (moduleId) =>
        moduleCommits.get(moduleId) || { commits: [], lastTag: null },
      this.options.repoRoot,
      this.options.dryRun,
      this.options.filename,
      this.options.multiModule,
      this.options.config?.module,
      this.options.provider,
    );

    if (this.options.multiModule) {
      logger.info(
        "Multi-module changelog generation enabled, generating root changelog",
      );

      // Generate root changelog
      const rootChangelogPath = await generateRootChangelog(
        moduleResults,
        async (moduleId) =>
          moduleCommits.get(moduleId) || { commits: [], lastTag: null },
        this.options.repoRoot,
        this.options.dryRun,
        this.options.filename,
        this.options.config?.root,
        this.options.provider,
      );

      if (rootChangelogPath) {
        changelogPaths.push(rootChangelogPath);
      }
    }

    logger.info("Changelog generation completed", {
      fileCount: changelogPaths.length,
    });
    return changelogPaths;
  }
}
