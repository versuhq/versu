import { logger } from "../utils/logger.js";
import {
  renderChangesForModules,
  renderRootChanges,
} from "../changelog/index.js";
import { ModuleChangeResult } from "./version-applier.js";
import { Commit } from "conventional-commits-parser";
import { ReleaseChangesConfig } from "../config/types.js";

export type ChangesRendererOptions = {
  render: boolean;
  repoRoot: string;
  dryRun: boolean;
  multiModule: boolean;
  filename: string;
  config?: ReleaseChangesConfig;
  provider?: string;
};

export class ChangesRenderer {
  constructor(private readonly options: ChangesRendererOptions) {}

  async render(
    moduleResults: ModuleChangeResult[],
    moduleCommits: Map<string, { commits: Commit[]; lastTag: string | null }>,
  ): Promise<string[]> {
    if (!this.options.render) {
      logger.info("Rendering disabled, skipping");
      return [];
    }

    if (moduleResults.length === 0) {
      logger.info("No modules with declared versions, skipping rendering");
      return [];
    }

    if (moduleResults.length > 1 && !this.options.multiModule) {
      throw new Error(
        "Multi-module rendering disabled but multiple modules being processed",
      );
    }

    logger.info("Rendering changes");

    // Generate individual module changes
    const renderedPaths = await renderChangesForModules(
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
        "Multi-module changes generation enabled, generating root changes",
      );

      // Generate root changes
      const rootChangesPath = await renderRootChanges(
        moduleResults,
        async (moduleId) =>
          moduleCommits.get(moduleId) || { commits: [], lastTag: null },
        this.options.repoRoot,
        this.options.dryRun,
        this.options.filename,
        this.options.config?.root,
        this.options.provider,
      );

      if (rootChangesPath) {
        renderedPaths.push(rootChangesPath);
      }
    }

    logger.info("Changes generation completed", {
      fileCount: renderedPaths.length,
    });
    return renderedPaths;
  }
}
