import { logger } from "../utils/logger.js";
import {
  generateChangelogsForModules,
  generateRootChangelog,
} from "../changelog/index.js";
import { ModuleChangeResult } from "./version-applier.js";
import { CommitInfo } from "../git/index.js";

export type ChangelogGeneratorOptions = {
  generateChangelog: boolean;
  repoRoot: string;
  dryRun: boolean;
};

export class ChangelogGenerator {
  constructor(private readonly options: ChangelogGeneratorOptions) {}

  async generateChangelogs(
    moduleResults: ModuleChangeResult[],
    moduleCommits: Map<string, CommitInfo[]>,
  ): Promise<string[]> {
    if (!this.options.generateChangelog) {
      logger.info(
        "📚 Skipping changelog generation (disabled by generate-changelog input)",
      );
      return [];
    }

    logger.info("📚 Generating changelogs...");

    if (this.options.dryRun) {
      logger.info("🏃‍♂️ Dry run mode - changelogs will not be written to files");
      return [];
    }

    // Generate individual module changelogs
    const changelogPaths = await generateChangelogsForModules(
      moduleResults,
      async (moduleId) => moduleCommits.get(moduleId) || [],
      this.options.repoRoot,
    );

    // Generate root changelog
    const rootChangelogPath = await generateRootChangelog(
      moduleResults,
      this.options.repoRoot,
    );
    changelogPaths.push(rootChangelogPath);

    logger.info(`📝 Generated ${changelogPaths.length} changelog files`);
    return changelogPaths;
  }
}
