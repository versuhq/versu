export type StableBumpType = "major" | "minor" | "patch";

export type PrereleaseBumpType =
  | "prerelease"
  | "premajor"
  | "preminor"
  | "prepatch";

export type Version = {
  major: number;
  minor: number;
  patch: number;
  prerelease: ReadonlyArray<string | number>;
  build: ReadonlyArray<string>;
  raw: string; // Full version string with all metadata
  version: string; // Core version string (major.minor.patch-prerelease)
};
