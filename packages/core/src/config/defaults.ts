import { Commit } from "conventional-commits-parser";
import { VersuConfigWithDefaults } from "./types.js";
import { CommitGroup, Context } from "conventional-changelog-writer";
import { mainRootTemplate } from "./templates/main-root.js";
import { commitPartial } from "./templates/commit.js";
import { headerPartial } from "./templates/header.js";
import { footerPartial } from "./templates/footer.js";
import { mainModuleTemplate } from "./templates/main-module.js";
import { mainReleaseRootTemplate } from "./templates/main-release-root.js";
import { mainReleaseModuleTemplate } from "./templates/main-release-module.js";

const issueRegex = /\((\w+\s)?#([0-9]+)\)/;

const prependPlaceholder = "<!-- Next Version Placeholder -->";

function commitGroupsSort(a: CommitGroup<Commit>, b: CommitGroup<Commit>) {
  const order = [
    "✨ Features",
    "🐛 Bug Fixes",
    "📝 Documentation",
    "⚡️ Performance",
    "♻️ Refactor",
    "🎨 Styling",
    "✅ Testing",
    "🤖 Build",
    "🔁 CI",
    "📦 Chores",
    "⏪ Revert",
    "❓ Other",
  ];
  return order.indexOf(a.title || "") - order.indexOf(b.title || "");
}

function transform(commit: Commit, context: Context<Commit>) {
  const typeMap: Record<string, string> = {
    feat: "✨ Features",
    fix: "🐛 Bug Fixes",
    doc: "📝 Documentation",
    perf: "⚡️ Performance",
    refactor: "♻️ Refactor",
    style: "🎨 Styling",
    test: "✅ Testing",
    build: "🤖 Build",
    ci: "🔁 CI",
    chore: "📦 Chores",
    revert: "⏪ Revert",
  };

  const versuContext = context as Context<Commit> & { provider?: string };

  // 1. Create a patch for the commit to place modified properties
  const commitPatch = {} as Partial<Commit> & { shortHash?: string };

  // 2. Skip commits without a type (e.g., merge commits)
  if (!commit.type) return null;

  /**
   * 3. Map the type to a human-friendly title with an emoji,
   * defaulting to "Other" if unknown
   */
  commitPatch.type = typeMap[commit.type] || "❓ Other";

  /**
   * 4. Capitalize the first letter of the subject
   * and convert issue references like "(#123)" to "([#123](repoUrl/issues/123))"
   */
  if (commit.subject) {
    commitPatch.subject =
      commit.subject.charAt(0).toUpperCase() + commit.subject.slice(1);

    if (versuContext.provider === "github" && versuContext.repoUrl) {
      commitPatch.subject = commitPatch.subject.replace(
        issueRegex,
        `([#$2](${versuContext.repoUrl}/issues/$2))`,
      );
    }
  }

  // 5. Add a shortHash property for easier linking in templates
  if (typeof commit.hash === "string") {
    commitPatch.shortHash = commit.hash.substring(0, 7);
  }

  return commitPatch;
}

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
        stable: "patch",
        prerelease: "prepatch",
      },
      test: {
        stable: "patch",
        prerelease: "prepatch",
      },
      chore: {
        stable: "patch",
        prerelease: "prepatch",
      },
      style: {
        stable: "patch",
        prerelease: "prepatch",
      },
      ci: {
        stable: "patch",
        prerelease: "prepatch",
      },
      build: {
        stable: "patch",
        prerelease: "prepatch",
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
  changelog: {
    root: {
      // 1. CONTEXT: Global variables for the templates
      context: {
        prependPlaceholder,
      },

      // 2. OPTIONS: Logic and Templates
      options: {
        // How to group the commits (mapped in transform)
        groupBy: "type",

        // The order sections appear in the changelog
        commitGroupsSort,

        // Transform raw commit data into "Keep a Changelog" format
        transform,

        // HANDLEBARS TEMPLATES
        mainTemplate: mainRootTemplate,
        commitPartial,
        headerPartial,
        footerPartial,
      },
    },
    module: {
      // 1. CONTEXT: Global variables for the templates
      context: {
        prependPlaceholder,
      },

      // 2. OPTIONS: Logic and Templates
      options: {
        // How to group the commits (mapped in transform)
        groupBy: "type",

        // The order sections appear in the changelog
        commitGroupsSort,

        // Transform raw commit data into "Keep a Changelog" format
        transform,

        // HANDLEBARS TEMPLATES
        mainTemplate: mainModuleTemplate,
        commitPartial,
        headerPartial,
        footerPartial,
      },
    },
  },
  release: {
    root: {
      // 1. CONTEXT: Global variables for the templates
      context: {
        prependPlaceholder,
      },

      // 2. OPTIONS: Logic and Templates
      options: {
        // How to group the commits (mapped in transform)
        groupBy: "type",

        // The order sections appear in the changelog
        commitGroupsSort,

        // Transform raw commit data into "Keep a Changelog" format
        transform,

        // HANDLEBARS TEMPLATES
        mainTemplate: mainReleaseRootTemplate,
        commitPartial,
        headerPartial,
        footerPartial,
      },
    },
    module: {
      // 1. CONTEXT: Global variables for the templates
      context: {
        prependPlaceholder,
      },

      // 2. OPTIONS: Logic and Templates
      options: {
        // How to group the commits (mapped in transform)
        groupBy: "type",

        // The order sections appear in the changelog
        commitGroupsSort,

        // Transform raw commit data into "Keep a Changelog" format
        transform,

        // HANDLEBARS TEMPLATES
        mainTemplate: mainReleaseModuleTemplate,
        commitPartial,
        headerPartial,
        footerPartial,
      },
    },
  },
};
