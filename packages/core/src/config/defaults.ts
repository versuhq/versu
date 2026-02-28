import { VersuConfigWithDefaults } from "./types";

/**
 * Default configuration following Conventional Commits specification.
 * Maps common commit types to semantic version bumps and defines dependency cascade rules.
 */
export const DEFAULT_CONFIG: VersuConfigWithDefaults = {
  plugins: [],
  versioning: {
    breakingChange: {
      stable: "major",
      prerelease: "premajor",
    },
    unknownCommitType: {
      stable: "patch",
      prerelease: "prepatch",
    },
    commitTypes: {
      feat: {
        stable: "minor",
        prerelease: "preminor",
      },
      fix: {
        stable: "patch",
        prerelease: "prepatch",
      },
      perf: {
        stable: "patch",
        prerelease: "prepatch",
      },
      refactor: {
        stable: "patch",
        prerelease: "prepatch",
      },
      docs: {
        stable: "none",
        prerelease: "none",
      },
      test: {
        stable: "none",
        prerelease: "none",
      },
      chore: {
        stable: "none",
        prerelease: "none",
      },
      style: {
        stable: "none",
        prerelease: "none",
      },
      ci: {
        stable: "none",
        prerelease: "none",
      },
      build: {
        stable: "none",
        prerelease: "none",
      },
    },
    cascadeRules: {
      stable: {
        major: "major",
        minor: "minor",
        patch: "patch",
      },
      prerelease: {
        premajor: "premajor",
        preminor: "preminor",
        prepatch: "prepatch",
        prerelease: "prerelease",
      },
    },
  },
};
