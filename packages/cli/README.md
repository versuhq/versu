<!-- markdownlint-disable MD041 -->

![versu](../../docs/assets/images/versu_4.png)

<!-- markdownlint-enable MD041 -->

# @versu/cli - Command-Line Interface

Command-line interface for Versu. This CLI provides all the power of Versu's semantic versioning engine through an easy-to-use command-line tool, perfect for local development and custom CI/CD systems.

For comprehensive documentation, examples, and configuration options, please refer to the our website <https://versuhq.github.io/>.

## Installation

### Global Installation

```bash
npm install -g @versu/cli
```

### Local Installation

```bash
npm install --save-dev @versu/cli
```

### Using npx (no installation)

```bash
npx @versu/cli run
```

## Usage

### Basic Usage

Navigate to your project root and run:

```bash
versu run
```

This will:

1. Detect your project type (Gradle, etc.)
2. Analyze commits since the last version
3. Calculate version bumps based on Conventional Commits
4. Update version files
5. Generate changelogs
6. Create git commits and tags
7. Push changes to remote

### Dry Run

Preview what would happen without making changes:

```bash
versu run --dry-run
```

### Specify Project Root

```bash
versu run /path/to/project
```

### Specify Adapter

If auto-detection fails or you want to be explicit:

```bash
versu run --adapter gradle
```

## Command Reference

### `versu run <repositoryRoot> [options]`

Calculate and apply semantic version changes.

**Arguments:**

- `<repositoryRoot>` - Path to the repository root (default: `.`)

**Flags:**

| Flag | Description | Default |
| ------ | ------------- | --------- |
| `--prerelease-mode` | Generate pre-release versions instead of final versions | `false` |
| `--prerelease-id <value>` | Pre-release identifier (e.g., alpha, beta, rc) | `alpha` |
| `--bump-unchanged` | In prerelease mode, bump modules even when no changes are detected | `false` |
| `--add-build-metadata` | Add build metadata with short SHA to all versions | `false` |
| `--timestamp-versions` | Use timestamp-based prerelease identifiers (requires prerelease-mode) | `false` |
| `--append-snapshot` | Add -SNAPSHOT suffix to all versions if supported by adapter | `false` |
| `--create-tags` | Create git tags for new versions | `true` |
| `--generate-changelog` | Generate or update changelog files for changed modules | `true` |
| `--push-changes` | Commit and push version changes and changelogs to remote | `true` |
| `--dry-run` | Run without writing or pushing changes | `false` |
| `--adapter <value>` | Language adapter (e.g., gradle). Auto-detected if not provided | - |
| `--changelog-filename <value>` | Filename for generated changelog | `CHANGELOG.md` |
| `--release-notes-filename <value>` | Filename for generated release notes | `RELEASE.md` |
| `--from-ref <value>` | Git ref to compare from (e.g., previous tag or commit SHA) | - |
| `--provider <value>` | Version control provider (e.g., github, gitlab) | - |

## Examples

### Release Version

Apply semantic versions based on commits:

```bash
versu run
```

### Pre-release Versions

Generate beta pre-release versions:

```bash
versu run --prerelease-mode --prerelease-id beta
```

### Timestamp Versions

Generate timestamp-based pre-release versions for CI builds:

```bash
versu run --prerelease-mode --prerelease-id alpha --timestamp-versions --add-build-metadata
```

This generates versions like: `1.2.3-alpha.20251208.1530+abc1234`

### Gradle SNAPSHOT Versions

Generate Gradle SNAPSHOT versions:

```bash
versu run --append-snapshot
```

### Development Workflow

Bump all modules (even unchanged) for development:

```bash
versu run --prerelease-mode --bump-unchanged
```

### Local Testing

Test without committing or pushing:

```bash
versu run --dry-run --no-push-changes --no-push-tags
```

### Manual Git Operations

Calculate versions without automatic git operations:

```bash
versu run --no-push-changes --no-push-tags
```

Then manually review, commit, and push.

## Configuration

Versu CLI uses the same configuration system as the core library. Configuration files are automatically detected in your repository root.

### Supported Configuration Files

Versu will automatically search for configuration in the following order:

1. `package.json` (under the `versu` key)
2. `.versurc`
3. `.versurc.json`
4. `.versurc.yaml`
5. `.versurc.yml`
6. `.versurc.js`
7. `.versurc.ts`
8. `.versurc.mjs`
9. `.versurc.cjs`
10. `.config/versurc`
11. `.config/versurc.json`
12. `.config/versurc.yaml`
13. `.config/versurc.yml`
14. `.config/versurc.js`
15. `.config/versurc.ts`
16. `.config/versurc.mjs`
17. `.config/versurc.cjs`
18. `versu.config.js`
19. `versu.config.ts`
20. `versu.config.mjs`
21. `versu.config.cjs`

### Configuration Example

`.versurc.json`:

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

For more configuration examples, see the [core package documentation](../core).

**Advanced Changelog Configuration:**

Versu supports [conventional-changelog-writer](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer) options for customizing changelog generation. For advanced customization with functions (transforms, sorting, templates), use JavaScript configuration files:

```javascript
// versu.config.js
module.exports = {
  versioning: {
    // ... version rules
  },
  changelog: {
    module: {
      options: {
        groupBy: 'type',
        commitsGroupsSort: (a, b) => {
          const order = { feat: 1, fix: 2, perf: 3 };
          return (order[a.title] || 99) - (order[b.title] || 99);
        },
        transform: (commit, context) => {
          // Custom commit transformation
          const commitPatch = {};
          return commitPatch;
        }
      }
    }
  }
};
```

## Gradle Project Support

Gradle support is provided by the **[@versu/plugin-gradle][plugin-gradle]** package. For more details please refer to the [plugin documentation][plugin-gradle].

## Commit Message Format

Versu uses [Conventional Commits](https://conventionalcommits.org/) to determine version bumps:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Examples:**

- `feat(api): add new endpoint` → **minor** bump
- `fix(core): resolve memory leak` → **patch** bump  
- `feat!: breaking API change` → **major** bump

### Breaking Changes

Breaking changes trigger **major** version bumps:

1. Using `!` after the type: `feat!: remove deprecated API`
2. Using `BREAKING CHANGE:` in the footer:

   ```text
   feat: update API
   
   BREAKING CHANGE: The old API is removed
   ```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Install Versu CLI
  run: npm i -g @versu/cli

- name: Install Adapter
  run: |
    # install required adapters
    npm i -g @versu/plugin-gradle

- name: Version modules
  run: versu run
```

### GitLab CI

```yaml
version:
  script:
    - npm i -g @versu/cli
    - npm i -g @versu/plugin-gradle
    - versu run
```

### Jenkins

```groovy
stage('Version') {
  steps {
    sh 'npm i -g @versu/cli'
    sh 'npm i -g @versu/plugin-gradle'
    sh 'versu run'
  }
}
```

### Local Development

Add to your `package.json`:

```json
{
  "scripts": {
    "version": "versu run --dry-run",
    "version:release": "versu run"
  }
}
```

Then run:

```bash
npm run version        # Dry run
npm run version:release # Actual release
```

## Troubleshooting

### Command Not Found

If `versu` is not found after global installation:

1. Check npm global bin path: `npm bin -g`
2. Ensure it's in your PATH
3. Try using npx: `npx @versu/cli`

### Permission Denied on Push

If you get permission errors when pushing:

1. Ensure you have proper git credentials configured
2. Check if you have write access to the repository
3. Use `--no-push-changes --no-push-tags` to skip git operations

### No Version Bump Detected

If versions aren't bumping:

1. Check commit messages follow Conventional Commits format
2. Verify you have commits since the last version
3. Check configuration if certain commit types are ignored
4. Use `--dry-run` to see what Versu detects

### Adapter Not Detected

If auto-detection fails:

1. Verify your project has the expected build files
2. Explicitly specify the adapter: `--adapter gradle`
3. Check if your project structure is supported

## Development

### Building from Source

```bash
# From monorepo root
npm install
npm run build

# Or from CLI package
cd packages/cli
npm install
npm run build
```

### Running Locally

```bash
# After building
bin/dev.js --dry-run
```

### Publishing

```bash
npm publish --workspace packages/cli --access public
```

## Related Packages

- **[@versu/core](../core)** - Core library for custom integrations
- **[@versu/action](../action)** - GitHub Actions integration
- **[@versu/plugin-gradle][plugin-gradle]** - Gradle adapter plugin

## License

MIT License - see [LICENSE](../../LICENSE) for details.

[plugin-gradle]: https://github.com/versuhq/plugin-gradle
