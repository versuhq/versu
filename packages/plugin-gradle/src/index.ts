import { PluginContract } from "../../core/dist/plugins/plugin-loader.js";
import { GradleAdapterIdentifier } from "./services/gradle-adapter-identifier.js";
import { GradleModuleSystemFactory } from "./services/gradle-module-system-factory.js";
import { AUTHORS, VERSION } from "./utils/version.js";

const gradlePlugin: PluginContract = {
  id: "gradle",
  name: "Gradle",
  description:
    "Adapter plugin for Gradle build system. Provides support for detecting and updating versions in Gradle projects.",
  version: VERSION,
  author: AUTHORS,
  adapters: [
    {
      id: "gradle",
      adapterIdentifier: () => new GradleAdapterIdentifier(),
      moduleSystemFactory: (repoRoot: string) =>
        new GradleModuleSystemFactory(repoRoot),
    },
  ],
};

export default gradlePlugin;
