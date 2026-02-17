import { Args, Command, Flags } from "@oclif/core";
import { OclifLogger } from "../../logger.js";
import { initLogger, logger, pluginManager } from "@versu/core";

export default class Install extends Command {
  static override description = "Install plugins for VERSU";

  static override examples = [
    "<%= config.bin %> <%= command.id %> @versu/plugin-example",
    "<%= config.bin %> <%= command.id %> @scoped/versu-plugin-example",
    "<%= config.bin %> <%= command.id %> versu-plugin-example",
    "<%= config.bin %> <%= command.id %> @versu/plugin-example --global",
    "<%= config.bin %> <%= command.id %> @versu/plugin-example -g",
  ];

  static args = {
    name: Args.string({
      required: true,
      description: "Plugin name",
    }),
  };

  static override flags = {
    global: Flags.boolean({
      description: "Install the plugin globally instead of locally",
      default: false,
      char: "g",
    }),
  };

  async run(): Promise<void> {
    const { flags, args } = await this.parse(Install);

    initLogger(new OclifLogger(this));

    try {
      await pluginManager.install(args.name, flags.global);

      logger.info("Plugin installation completed", { pluginName: args.name, global: flags.global });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Command failed", { error: errorMessage });
    }
  }
}
