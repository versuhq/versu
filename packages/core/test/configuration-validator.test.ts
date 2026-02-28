import { describe, it, expect } from "vitest";
import { ConfigurationValidator } from "../src/services/configuration-validator.js";
import { VersuConfig } from "../src/config/types.js";
import { configSchema } from "../src/config/schema.js";

describe("ConfigurationValidator", () => {
  const validator = new ConfigurationValidator<VersuConfig>(configSchema);

  it("should validate a valid configuration", () => {
    const config: VersuConfig = {
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
          docs: {
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

    expect(() => validator.validate(config)).not.toThrow();
  });

  it("should reject invalid defaultBump", () => {
    const config = {
      versioning: {
        unknownCommitType: {
          stable: "invalid",
          prerelease: "invalid",
        },
      },
    } as unknown as VersuConfig;

    expect(() => validator.validate(config)).toThrow(
      /Configuration validation failed/,
    );
  });

  it("should reject invalid commit type bump value", () => {
    const config = {
      versioning: {
        commitTypes: {
          feat: {
            stable: "invalid",
            prerelease: "invalid",
          },
        },
      },
    } as unknown as VersuConfig;

    expect(() => validator.validate(config)).toThrow(
      /Configuration validation failed/,
    );
  });

  it("should reject invalid dependency rules", () => {
    const config = {
      versioning: {
        cascadeRules: {
          stable: {
            major: "invalid",
          },
        },
      },
    } as unknown as VersuConfig;

    expect(() => validator.validate(config)).toThrow(
      /Configuration validation failed/,
    );
  });
});
