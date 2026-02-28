import { AdapterIdentifier } from "../services/adapter-identifier";
import { ModuleSystemFactory } from "../services/module-system-factory";

export type PluginContract = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  adapters: AdapterPluginContract[];
};

export type AdapterPluginContract = {
  id: string;
  adapterIdentifier: () => AdapterIdentifier;
  moduleSystemFactory: (repoRoot: string) => ModuleSystemFactory;
};
