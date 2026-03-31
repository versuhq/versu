import type { Context, Options } from "conventional-changelog-writer";
import type { PrereleaseBumpType, StableBumpType } from "../semver/types.js";
import type { Commit } from "conventional-commits-parser";

export type CommitTypeConfig = {
  readonly stable: StableBumpType | "none";
  readonly prerelease: PrereleaseBumpType | "none";
};

export type VersuConfig = {
  readonly plugins?: string[];
  readonly versioning?: {
    readonly unknownCommitType?: CommitTypeConfig;
    readonly breakingChange?: CommitTypeConfig;
    readonly commitTypes?: Record<string, CommitTypeConfig>;
    readonly cascadeRules?: {
      readonly stable?:
        | "match"
        | Record<StableBumpType, StableBumpType | "none">;
      readonly prerelease?:
        | "match"
        | Record<PrereleaseBumpType, PrereleaseBumpType | "none">;
    };
  };
  readonly changelog?: ChangesConfig;
  readonly release?: ChangesConfig;
};

export type VersuConfigWithDefaults = Omit<
  Required<VersuConfig>,
  "changelog" | "release"
> & {
  readonly versioning: Required<VersuConfig["versioning"]>;
  readonly changelog?: ChangesConfig;
  readonly release?: ChangesConfig;
};

export type ModuleChangesConfig = {
  readonly context?: Context<Commit> & { prependPlaceholder: string };
  readonly options?: Options<Commit>;
};

export type ChangesConfig = {
  readonly root?: ModuleChangesConfig;
  readonly module?: ModuleChangesConfig;
};
