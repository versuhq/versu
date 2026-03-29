<!-- markdownlint-disable MD041 -->

![versu](../../docs/assets/images/versu_4.png)

<!-- markdownlint-enable MD041 -->

# @versu/core - Core Library

The core business logic powering Versu. This package is completely framework-agnostic and can be integrated into any TypeScript/JavaScript project, CI/CD system, or custom tooling.

For comprehensive documentation, examples, and configuration options, please refer to the our website <https://versuhq.github.io/>.

## Installation

```bash
npm install @versu/core
```

## Quick Start

```typescript
import { VersuRunner, type RunnerOptions } from "@versu/core";

const options: RunnerOptions = {
  repoRoot: "/path/to/repository",
  // ...other options as needed
};

const runner = new VersuRunner(options);

const result = await runner.run();

console.log(`Bumped: ${result.bumped}`);
console.log(`Changed modules:`, result.changedModules);
console.log(`Created tags:`, result.createdTags);
```

## VersuRunner API

### Options

```typescript
type RunnerOptions = {
  // Required
  repoRoot: string; // Absolute path to repository root
  prereleaseMode: boolean; // Generate pre-release versions
  prereleaseId: string; // Pre-release identifier, e.g. 'alpha', 'beta', 'rc'
  bumpUnchanged: boolean; // Bump modules with no changes (prerelease mode only)
  addBuildMetadata: boolean; // Append short SHA as build metadata (+sha)
  timestampVersions: boolean; // Use timestamp-based pre-release identifiers
  appendSnapshot: boolean; // Append -SNAPSHOT suffix (Gradle only)
  createTags: boolean; // Create git tags for bumped modules
  generateChangelog: boolean; // Generate CHANGELOG.md files
  pushChanges: boolean; // Commit and push version changes to remote
  dryRun: boolean; // Preview changes without writing anything

  // Optional
  adapter?: string; // Language adapter ID (auto-detected if omitted)
  changelogFilename?: string; // Changelog filename (default: 'CHANGELOG.md')
  releaseNotesFilename?: string; // Release notes filename (default: 'RELEASE.md')
  fromRef?: string; // Git ref to use as the lower boundary for commit analysis
  provider?: string; // Version control provider name (auto-detected if omitted)
};
```

### Result

```typescript
type RunnerResult = {
  bumped: boolean; // Whether any version was updated
  discoveredModules: Array<Module>; // All modules found in the repository
  changedModules: Array<ModuleChangeResult>; // Modules whose version changed
  createdTags: string[]; // Git tags that were created
  changelogPaths: string[]; // Generated changelog file paths
  releaseNotesPaths: string[]; // Generated release notes file paths
};
```

## Configuration

Versu core uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for configuration loading and [Zod](https://github.com/colinhacks/zod) for validation.

You can provide configuration in any of the supported config files (e.g., `.versurc`, `versu.config.js`, etc.) or via `package.json` under the `versu` key. For the full list please refer to [cosmiconfig search places documentation](https://github.com/cosmiconfig/cosmiconfig?tab=readme-ov-file#searchplaces).

### Configuration Example

```json
{
  "versioning": {
    "breakingChange": {
      "stable": "major",
      "prerelease": "premajor"
    },
    "unknownCommitType": {
      "stable": "patch",
      "prerelease": "prepatch"
    },
    "commitTypes": {
      "feat": {
        "stable": "minor",
        "prerelease": "preminor"
      },
      "fix": {
        "stable": "patch",
        "prerelease": "prepatch"
      }
    },
    "cascadeRules": {
      "stable": {
        "major": "major",
        "minor": "minor",
        "patch": "patch"
      },
      "prerelease": {
        "major": "premajor",
        "minor": "preminor",
        "patch": "prepatch"
      }
    }
  },
  "changelog": {
    "root": {
      "context": {
        "prependPlaceholder": "<!-- Next Version Placeholder -->"
      }
    },
    "module": {
      "context": {
        "prependPlaceholder": "<!-- Next Version Placeholder -->"
      }
    }
  }
}
```

**Changelog & Release Notes Configuration:**

- `changelog.root` - Configuration for root-level CHANGELOG.md generation
- `changelog.module` - Configuration for per-module CHANGELOG.md generation
- `changelog.context.prependPlaceholder` - Placeholder string in changelog files where new entries are inserted
- `changelog.context.options` - Advanced changelog generation options (templates, grouping, sorting)

Release notes follows the same pattern under `release` key.

Versu uses [conventional-changelog-writer](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer) for changelog and release notes generation. You can pass any options supported by conventional-changelog-writer through the `options` field. For advanced customization with functions (like `transform`, `commitsGroupsSort`), use JavaScript configuration files (`.versurc.js` or `versu.config.js`).

## Adapters

Versu supports multiple language ecosystems through adapters. The core package includes a plugin system for adding new adapter support. In order to support additional ecosystems, you need to implement the required interfaces and register them as plugins.

### Creating Custom Adapters

To add support for new project types, create a plugin package that implements the adapter interfaces:

```typescript
import {
  AdapterIdentifier,
  type AdapterMetadata,
  ModuleDetector,
  type ProjectInformation,
  VersionUpdateStrategy,
  type ModuleRegistry,
  ModuleSystemFactory,
} from "@versu/core";

// 1. Adapter identifier for auto-detection
class MyAdapterIdentifier implements AdapterIdentifier {
  readonly metadata: AdapterMetadata = {
    id: "my-adapter",
    capabilities: { supportsSnapshots: false },
  };

  async accept(projectRoot: string): Promise<boolean> {
    // Check for adapter-specific files
    return await fileExists(path.join(projectRoot, "my-build-file"));
  }
}

// 2. Module detector for discovering project structure
class MyModuleDetector implements ModuleDetector {
  constructor(
    readonly repoRoot: string,
    readonly outputFile: string,
  ) {}

  async detect(): Promise<ProjectInformation> {
    // Discover and return modules and dependencies
    return {
      moduleIds: ["root", "module-a"],
      modules: [
        {
          id: "root",
          name: "root",
          path: this.repoRoot,
          type: "root",
          affectedModules: new Set(["module-a"]),
          version: "1.0.0",
          declaredVersion: false,
        },
        {
          id: "module-a",
          name: "module-a",
          path: join(this.repoRoot, "module-a"),
          type: "module",
          affectedModules: new Set([]),
          version: "2.0.0",
          declaredVersion: true,
        },
      ],
    };
  }
}

// 3. Version update strategy for applying changes
class MyVersionUpdateStrategy implements VersionUpdateStrategy {
  constructor(private readonly moduleRegistry: ModuleRegistry) {}

  async writeVersionUpdates(
    moduleVersions: Map<string, string>,
  ): Promise<void> {
    // Apply version changes to build files
    for (const [moduleId, newVersion] of moduleVersions) {
      // Update version in your project's format
    }
  }
}

// 4. Module system factory to tie it all together
class MyModuleSystemFactory implements ModuleSystemFactory {
  constructor(private readonly repoRoot: string) {}

  createDetector(outputFile: string): ModuleDetector {
    return new MyModuleDetector(this.repoRoot, outputFile);
  }

  createVersionUpdateStrategy(
    moduleRegistry: ModuleRegistry,
  ): VersionUpdateStrategy {
    return new MyVersionUpdateStrategy(moduleRegistry);
  }
}
```

Then create a plugin:

```typescript
import type { PluginContract } from "@versu/core";

const myPlugin: PluginContract = {
  id: "my-adapter",
  name: "My Adapter",
  description: "Support for my build system",
  version: "1.0.0",
  author: "Your Name",
  adapters: [
    {
      id: "my-adapter",
      adapterIdentifier: () => new MyAdapterIdentifier(),
      moduleSystemFactory: (repoRoot: string) =>
        new MyModuleSystemFactory(repoRoot),
    },
  ],
};

export default myPlugin;
```

See [@versu/plugin-gradle][plugin-gradle] for a complete implementation example.

## Development

### Building

```bash
# From monorepo root
npm run build

# Or from core package
cd packages/core
npm run build
```

### Testing

```bash
# From monorepo root
npm test

# Or from core package
cd packages/core
npm test
npm run test:coverage
```

### Publishing

```bash
npm publish --workspace packages/core --access public
```

## Related Packages

- **[@versu/cli](../cli)** - Command-line interface
- **[@versu/action](../action)** - GitHub Actions integration
- **[@versu/plugin-gradle][plugin-gradle]** - Gradle adapter plugin

## Requirements

- **Node.js**: >= 20
- **TypeScript**: >= 5.0 (if using TypeScript)

## License

MIT License - see [LICENSE](../../LICENSE) for details.

[plugin-gradle]: https://github.com/versuhq/plugin-gradle
