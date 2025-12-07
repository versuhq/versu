# VERSE Monorepo

This is a monorepo structure for VERSE (Version Engine for Repo Semantic Evolution) containing three main packages:

## 📦 Packages

### 1. **@verse/core** (`packages/core`)
The core business logic that powers VERSE - completely independent of GitHub Actions or CLI frameworks.

**Features:**
- Semantic version calculation and management
- Multi-module project support
- Dependency cascade detection
- Conventional commits parsing
- Changelog generation
- Git operations (commits, tags, pushes)
- Adapter system for language/build system support (Gradle, etc.)
- Configuration loading and validation

**Dependencies:**
- `conventional-commits-parser` - For parsing commit messages
- `cosmiconfig` - For flexible configuration loading
- `zod` - For schema validation
- `semver` - For semantic versioning utilities
- `yaml` - For YAML config support

**Use this package when:**
- Building tools that need semantic versioning
- Integrating VERSE into other projects
- Running as a library in your own applications

### 2. **@verse/cli** (`packages/cli`)
Command-line interface for VERSE using [oclif](https://oclif.io/).

**Features:**
- `verse version` - Main command to calculate and apply version updates
- Full flag-based configuration matching the action inputs
- Human-friendly CLI output
- All features from core available through the command line

**Dependencies:**
- `@verse/core` - Core versioning engine
- `oclif` - CLI framework

**Use this package when:**
- You want to use VERSE locally or in custom CI/CD systems
- You need a standalone CLI tool for version management
- You want to integrate VERSE into non-GitHub workflows

### 3. **verse-action** (`packages/action`)
GitHub Actions wrapper for VERSE core.

**Features:**
- GitHub Actions integration
- Action inputs/outputs
- GitHub-specific functionality (API access, etc.)
- Automatic deployment to GitHub Actions Marketplace

**Dependencies:**
- `@verse/core` - Core versioning engine
- `@actions/core` - GitHub Actions toolkit
- `@actions/exec` - For executing shell commands
- `@actions/github` - For GitHub API access

**Use this package when:**
- Running VERSE as a GitHub Action in workflows
- You want automatic version management in GitHub

## 📂 Project Structure

```
verse-monorepo/
├── packages/
│   ├── core/              # Core library (reusable everywhere)
│   │   ├── src/
│   │   │   ├── adapters/          # Language/build system adapters
│   │   │   ├── changelog/         # Changelog generation
│   │   │   ├── config/            # Configuration loading
│   │   │   ├── factories/         # Adapter/module system factories
│   │   │   ├── git/               # Git operations
│   │   │   ├── semver/            # Semantic version utilities
│   │   │   ├── services/          # Core services
│   │   │   ├── utils/             # Shared utilities
│   │   │   └── index.ts           # Public API exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── cli/               # oclif CLI
│   │   ├── src/
│   │   │   ├── commands/          # CLI commands
│   │   │   └── index.ts           # CLI entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── action/            # GitHub Action
│       ├── src/
│       │   ├── action.ts          # Action entry point
│       │   ├── index.ts           # GitHub Actions entry
│       │   └── utils/
│       ├── action.yml
│       ├── rollup.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── package.json           # Monorepo root (workspaces)
├── tsconfig.base.json     # Shared TypeScript config
└── README.md
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Building All Packages

```bash
npm run build
```

### Building Individual Packages

```bash
npm run -w @verse/core build
npm run -w @verse/cli build
npm run -w verse-action build
```

### Running Tests

```bash
npm test                          # All tests
npm run test:coverage            # With coverage
npm run -w @verse/core test      # Specific package
```

### Linting & Formatting

```bash
npm run lint                      # Lint all packages
npm run format                    # Format all packages
```

## 🔄 Package Dependencies

- `@verse/cli` depends on `@verse/core`
- `verse-action` depends on `@verse/core`
- `@verse/core` has no internal dependencies (only external packages)

This ensures:
- ✅ Clean separation of concerns
- ✅ No circular dependencies
- ✅ Core can be used independently
- ✅ Easy to extend with new packages

## 📖 Development

### Adding a New Feature to Core

1. Add implementation to `packages/core/src/services/` or appropriate subdirectory
2. Export from `packages/core/src/index.ts`
3. The CLI and Action will automatically have access to it

### Adding a New CLI Command

1. Create `packages/cli/src/commands/your-command.ts`
2. Extend the `Command` class from oclif
3. oclif automatically discovers commands

### Publishing

Each package can be published independently to npm:

```bash
# Publish core
npm publish -w @verse/core

# Publish CLI
npm publish -w @verse/cli

# Publish action (also works on GitHub Actions Marketplace)
npm publish -w verse-action
```

## 📝 Configuration

All packages use the same configuration schema. See `@verse/core` for configuration details.

## 🐛 Troubleshooting

### Packages not linking
Make sure you've run `npm install` from the monorepo root.

### Build failures
Run `npm run clean` (if available) and then `npm run build` again.

### Type errors in imports
Ensure the package.json in each workspace has the correct dependencies and that imports use the correct paths (e.g., `@verse/core` not relative paths).

## 📄 License

MIT
