import { Command } from "@oclif/core";
import { OclifLogger } from "../../logger.js";
import {
  initLogger,
  logger,
  pluginManager,
} from "@versu/core";

export default class List extends Command {
  static override description = "List plugins for VERSU";

  static override examples = [
    "<%= config.bin %> <%= command.id %>",
  ];

  async run(): Promise<void> {
    await this.parse(List);

    initLogger(new OclifLogger(this));

    try {
      const result = await pluginManager.list();
      
      logger.info("Installed plugins:");
      result.forEach((plugin) => {
        logger.info(`- ${plugin.name} (${plugin.global ? "global" : "local"})`);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Command failed", { error: errorMessage });
    }
  }
}
