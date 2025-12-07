import { logger } from "../utils/logger.js";
import { ModuleChangeResult } from "./version-applier.js";
import {
  addChangedFiles,
  commitChanges,
  pushCommits,
  hasChangesToCommit,
  createTag,
  pushTags,
} from "../git/index.js";

export type GitOperationsOptions = {
  pushChanges: boolean;
  pushTags: boolean;
  repoRoot: string;
  dryRun: boolean;
  isTemporaryVersion: boolean;
};

export class GitOperations {
  constructor(private readonly options: GitOperationsOptions) {}

  async commitAndPushChanges(
    moduleChangeResults: ModuleChangeResult[],
  ): Promise<void> {
    if (!this.options.pushChanges) {
      logger.info(
        "📦 Skipping commit and push (disabled by push-changes input)",
      );
      return;
    }

    if (this.options.dryRun) {
      const commitMessage = this.createCommitMessage(moduleChangeResults);
      logger.info(`📦 Dry run mode - would commit and push: ${commitMessage}`);
      return;
    }

    logger.info("📦 Committing and pushing changes...");

    try {
      // Add all changed files to staging area
      await addChangedFiles({ cwd: this.options.repoRoot });

      // Check if there are any changes to commit
      const hasChanges = await hasChangesToCommit({
        cwd: this.options.repoRoot,
      });

      if (hasChanges) {
        // Create commit message
        const commitMessage = this.createCommitMessage(moduleChangeResults);

        // Commit changes
        await commitChanges(commitMessage, { cwd: this.options.repoRoot });
        logger.info(`  Committed changes: ${commitMessage}`);

        // Push commits to remote
        await pushCommits({ cwd: this.options.repoRoot });
        logger.info("  Pushed commits to remote");
      } else {
        logger.info("  No changes to commit");
      }
    } catch (error) {
      logger.warning(`Failed to commit and push changes: ${error}`);
      // Continue execution - don't fail the entire process if git operations fail
    }
  }

  async createAndPushTags(
    moduleChangeResults: ModuleChangeResult[],
  ): Promise<string[]> {
    const createdTags: string[] = [];

    if (this.options.isTemporaryVersion) {
      logger.info(
        "🏷️ Skipping tag creation and push (temporary version enabled)",
      );
      return createdTags;
    }

    const disabledBy = [
      this.options.dryRun && "dry-run",
      !this.options.pushTags && "push-tags",
      !this.options.pushChanges && "push-changes",
    ]
      .filter(Boolean)
      .join(", ");

    logger.info("🔍 Filtering modules with declared versions...");

    const modulesWithDeclaredVersions = moduleChangeResults.filter(
      (change) => change.declaredVersion,
    );

    if (disabledBy) {
      logger.info(
        `🏷️ Skipping tag creation and push (disabled by ${disabledBy} input(s))`,
      );

      for (const change of modulesWithDeclaredVersions) {
        const tagName = `${change.name}@${change.to}`;
        createdTags.push(tagName);
        logger.info(`  Would create tag: ${tagName}`);
      }

      return createdTags;
    }

    logger.info("🏷️ Creating tags...");
    for (const change of modulesWithDeclaredVersions) {
      const tagName = `${change.name}@${change.to}`;
      const message = `Release ${change.name} v${change.to}`;

      createTag(tagName, message, { cwd: this.options.repoRoot });
      createdTags.push(tagName);
      logger.info(`  Created tag: ${tagName}`);
    }

    // Push tags
    logger.info("📤 Pushing tags...");
    pushTags({ cwd: this.options.repoRoot });
    logger.info(`✅ Pushed ${createdTags.length} tags to remote`);

    return createdTags;
  }

  private createCommitMessage(
    moduleChangeResults: ModuleChangeResult[],
  ): string {
    const moduleNames = moduleChangeResults.map((change) => change.name);

    return moduleNames.length === 1
      ? `chore(release): ${moduleNames[0]} ${moduleChangeResults[0].to}`
      : `chore(release): update ${moduleNames.length} modules`;
  }
}
