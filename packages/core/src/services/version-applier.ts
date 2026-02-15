import { logger } from "../utils/logger.js";
import { VersionManager } from "./version-manager.js";
import { BumpType, formatSemVer, isReleaseVersion } from "../semver/index.js";
import { ProcessedModuleChange } from "./version-bumper.js";
import { getModuleTagName } from "../git/index.js";

export type VersionApplierOptions = {
  dryRun: boolean;
};

export type ModuleChangeResult = {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly type: "module" | "root";
  readonly from: string;
  readonly to: string;
  readonly bumpType: BumpType;
  readonly declaredVersion: boolean;
  readonly isRelease: boolean;
  readonly tagName?: string;
};

export class VersionApplier {
  constructor(
    private readonly versionManager: VersionManager,
    private readonly options: VersionApplierOptions,
  ) {}

  async applyVersionChanges(
    processedModuleChanges: ProcessedModuleChange[],
  ): Promise<ModuleChangeResult[]> {
    if (processedModuleChanges.length === 0) {
      logger.info("All versions up to date");
      return [];
    }

    logger.info("Filtering modules with declared versions");

    const modulesWithDeclaredVersions = processedModuleChanges.filter(
      (change) => change.module.declaredVersion,
    );

    if (modulesWithDeclaredVersions.length === 0) {
      logger.info("All modules already have declared versions");
      return [];
    }

    this.logPlannedChanges(modulesWithDeclaredVersions);

    if (this.options.dryRun) {
      logger.info("Dry run enabled, skipping version file updates");
    } else {
      await this.stageVersions(modulesWithDeclaredVersions);
      await this.commitVersions();
    }

    // Create and return result objects
    return processedModuleChanges.map((change) => {
      const isRelease = isReleaseVersion(change.toVersion);
      return {
        id: change.module.id,
        name: change.module.name,
        path: change.module.path,
        type: change.module.type,
        from: formatSemVer(change.fromVersion),
        to: change.toVersion,
        bumpType: change.bumpType,
        declaredVersion: change.module.declaredVersion,
        tagName: isRelease
          ? getModuleTagName(change.module.name, change.toVersion)
          : undefined,
        isRelease: isRelease,
      };
    });
  }

  private logPlannedChanges(
    processedModuleChanges: ProcessedModuleChange[],
  ): void {
    logger.info(
      "Planning version updates",
      { moduleCount: processedModuleChanges.length }
    );
    for (const change of processedModuleChanges) {
      const from = formatSemVer(change.fromVersion);
      const to = change.toVersion;
      logger.debug(
        "Version update planned",
        { moduleId: change.module.id, from, to, bumpType: change.bumpType, reason: change.reason }
      );
    }
  }

  private async stageVersions(
    processedModuleChanges: ProcessedModuleChange[],
  ): Promise<void> {
    for (const change of processedModuleChanges) {
      // Use toVersion directly (now includes all transformations like Gradle snapshots)
      this.versionManager.updateVersion(change.module.id, change.toVersion);
      logger.debug("Version staged", { moduleId: change.module.id, version: change.toVersion });
    }
    logger.info("Staged new versions", { count: processedModuleChanges.length });
  }

  private async commitVersions(): Promise<void> {
    logger.info("Committing version updates to files");
    const pendingUpdatesCount = this.versionManager.getPendingUpdatesCount();
    await this.versionManager.commit();
    logger.info("Version updates committed", { updateCount: pendingUpdatesCount });
  }
}
