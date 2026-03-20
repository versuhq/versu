import { AdapterIdentifier } from "../services/adapter-identifier.js";
import { ModuleSystemFactory } from "../services/module-system-factory.js";

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

export type PluginInformation = {
  readonly name: string;
  readonly path: string;
  readonly global: boolean;
};

export interface PluginLoader {
  get plugins(): PluginContract[];
  load(pluginNames: string[]): Promise<void>;
}

export interface PluginManager {
  list(): Promise<PluginInformation[]>;
  install(pluginName: string, global?: boolean): Promise<void>;
  uninstall(pluginName: string, global?: boolean): Promise<void>;
}
