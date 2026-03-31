<!-- markdownlint-disable MD041 -->

![versu](../../docs/assets/images/versu_4.png)

<!-- markdownlint-enable MD041 -->

# @versu/action - GitHub Action

GitHub Actions wrapper for Versu. This action provides seamless integration with GitHub workflows for automatic semantic versioning across your monorepo projects.

For comprehensive documentation, examples, and configuration options, please refer to the our website <https://versuhq.github.io/>.

## Usage

### Basic Usage

Add this action to your workflow:

```yaml
name: Release
on:
  push:
    branches: [ "main" ]

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          # This is required to analyze commit history for version bumps
          fetch-depth: 0

      # Example using the Gradle adapter
      # Make sure to install the appropriate adapter for your project type
      - name: Install gradle adapter
        run: npm install -g @versu/plugin-gradle

      - name: Versu Semantic Evolution
        id: versu
        uses: versuhq/versu@v0
        with:
          dry-run: false
          # Optional - Versu will auto-detect your project type
          # adapter: gradle

      - name: Print results
        run: |
          echo "Bumped: ${{ steps.versu.outputs.bumped }}"
          echo "Changed: ${{ steps.versu.outputs['changed-modules'] }}"
```

### Adapter Auto-Detection

Versu automatically detects your project type based on currently installed adapters plugins. Each plugin is responsible for analyzing the repository structure and files to determine if they are applicable. For example, the Gradle plugin looks for `build.gradle`, `build.gradle.kts`, `settings.gradle`, or `settings.gradle.kts` files to determine if it should be used.

Note that if Versu will only auto-detect one adapter, meaning that if you have multiple supported project types (e.g., both Maven and Gradle files), you must explicitly specify which adapter to use in the workflow configuration, otherwise Versu picks up the first one it detects.

If auto-detection fails, Versu will throw an error asking you to explicitly specify the `adapter` input:

```yaml
- name: Versu Semantic Evolution
  uses: versuhq/versu@v0
  with:
    # Required if auto-detection fails
    adapter: gradle
```

If the specified adapter is not supported or not properly configured, Versu will provide a clear error message indicating the issue.

### Pre-release Versions

For development builds or pre-release versions:

```yaml
name: Development Build
on:
  push:
    branches: [ "develop" ]

jobs:
  prerelease-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          # This is required to analyze commit history for version bumps
          fetch-depth: 0

      # Example using the Gradle adapter
      # Make sure to install the appropriate adapter for your project type
      - name: Install gradle adapter
        run: npm install -g @versu/plugin-gradle

      - name: Create pre-release versions
        uses: versuhq/versu@v0
        with:
          prerelease-mode: true
          prerelease-id: alpha
          bump-unchanged: true
```

### Timestamp-based Versions

For time-based unique versions (useful for CI/CD pipelines):

```yaml
name: CI Build
on:
  pull_request:
  push:
    branches: [ "feature/*", "develop" ]

jobs:
  ci-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          # This is required to analyze commit history for version bumps
          fetch-depth: 0

      # Example using the Gradle adapter
      # Make sure to install the appropriate adapter for your project type
      - name: Install gradle adapter
        run: npm install -g @versu/plugin-gradle

      - name: Create timestamp versions
        uses: versuhq/versu@v0
        with:
          prerelease-mode: true
          prerelease-id: alpha
          timestamp-versions: true
          bump-unchanged: true
          add-build-metadata: true
```

This generates versions like: `1.2.3-alpha.20251208.1530+abc1234` where:

- `alpha.20251208.1530` is the timestamp-based prerelease identifier (YYYYMMDD.HHMM format)
- `abc1234` is the short SHA build metadata

### SNAPSHOT Versions

For projects using the conventional `-SNAPSHOT` suffix, such as Gradle projects:

```yaml
name: Development Build
on:
  push:
    branches: [ "develop" ]

jobs:
  gradle-snapshot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          # This is required to analyze commit history for version bumps
          fetch-depth: 0

      # Install the Gradle adapter plugin
      - name: Install gradle adapter
        run: npm install -g @versu/plugin-gradle

      - name: Create Gradle SNAPSHOT versions
        uses: versuhq/versu@v0
        with:
          append-snapshot: true
```

This applies `-SNAPSHOT` suffix to **all** module versions, generating versions like: `1.2.3-SNAPSHOT`, `2.1.0-SNAPSHOT`

## Action Inputs

| Input | Description | Default |
| ------- | ------------- | --------- |
| `prerelease-mode` | Generate pre-release versions | `false` |
| `prerelease-id` | Pre-release identifier | `alpha` |
| `bump-unchanged` | Bump modules with no changes in prerelease mode | `false` |
| `add-build-metadata` | Add build metadata with short SHA to all versions | `false` |
| `timestamp-versions` | Use timestamp-based prerelease identifiers (e.g., alpha.20251208.1530) | `false` |
| `append-snapshot` | Add -SNAPSHOT suffix to all versions if supported by adapter (e.g. `gradle`) | `false` |
| `create-tags` | Create Git tags for bumped versions | `true` |
| `generate-changelog` | Generate or update changelog files for changed modules | `true` |
| `push-changes` | Commit and push version changes and changelogs to remote | `true` |
| `dry-run` | Run without writing or pushing | `false` |
| `adapter` | Language adapter (auto-detected if not provided) | `` |
| `changelog-filename` | Filename for generated changelog | `CHANGELOG.md` |
| `release-notes-filename` | Filename for generated release notes | `RELEASE.md` |

## Action Outputs

| Output | Description |
| ------- | ------------- |
| `bumped` | Whether any module was bumped |
| `changed-modules` | JSON array of changed modules |
| `created-tags` | Comma-separated list of created tags |
| `changelog-paths` | Comma-separated changelog file paths |

### Using Outputs

```yaml
- name: Versu Semantic Evolution
  id: versu
  uses: versuhq/versu@v0
  
- name: Check if bumped
  if: steps.versu.outputs.bumped == 'true'
  run: echo "Versions were updated!"
  
- name: Process changed modules
  run: echo '${{ steps.versu.outputs.changed-modules }}' | jq .
  
- name: List created tags
  run: echo "Tags: ${{ steps.versu.outputs.created-tags }}"
```

## Git Operations

The action automatically handles git operations as part of the versioning workflow:

### Automatic Commit and Push

By default (`push-changes: true`), the action will:

1. **Generate** version updates and changelogs
2. **Commit** all changed files with message: `"chore: update versions and changelogs"`  
3. **Push** changes to the remote repository
4. **Create and push** version tags (if `push-tags: true`)

### Disabling Git Operations

For workflows where you want to handle git operations manually:

```yaml
- name: Version modules (no git operations)
  uses: versuhq/versu@v0
  with:
    adapter: gradle
    push-changes: false    # Disable automatic commit/push
    push-tags: false       # Disable automatic tag pushing
```

This is useful when:

- **Running in forks** or environments without write permissions
- **Custom commit workflows** that require specific commit messages or signing
- **Multi-step pipelines** where versioning is separated from publishing
- **Testing and validation** before committing changes

### Git Configuration Requirements

For git operations to work, ensure your workflow has:

```yaml
steps:
  - uses: actions/checkout@v6
    with:
      # This is required to analyze commit history for version bumps
      fetch-depth: 0
      # Or personal access token
      token: ${{ secrets.GITHUB_TOKEN }}
  - name: Configure Git
    run: |
      git config --global user.name "github-actions[bot]"
      git config --global user.email "github-actions[bot]@users.noreply.github.com"
```

## Configuration

Versu uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) for flexible configuration loading and [Zod](https://github.com/colinhacks/zod) for type-safe validation. Configuration files are automatically detected in your repository root.

You can provide configuration in any of the supported config files (e.g., `.versurc`, `versu.config.js`, etc.) or via `package.json` under the `versu` key. For the full list please refer to [cosmiconfig search places documentation](https://github.com/cosmiconfig/cosmiconfig?tab=readme-ov-file#searchplaces).

### Configuration Options

| Option | Type | Description | Required |
| ------- | ------ | ------------- | --------- |
| `plugins` | `array` | List of plugins to load | Optional |
| `versioning.breakingChange` | `object` | Breaking change version bump configuration | Optional |
| `versioning.unknownCommitType` | `object` | Default version bump type when conventional commit types don't match | Optional |
| `versioning.commitTypes` | `object` | Maps conventional commit types to version bump types or `none` | Optional |
| `versioning.cascadeRules` | `object` | How to bump dependents when dependencies change | Optional |
| `changelog.root` | `object` | Configuration for root-level changelog generation | Optional |
| `changelog.module` | `object` | Configuration for per-module changelog generation | Optional |
| `release.root` | `object` | Configuration for root-level release notes generation | Optional |
| `release.module` | `object` | Configuration for per-module release notes generation | Optional |

### Configuration Examples

#### JSON Format (`.versurc.json`)

<!-- markdownlint-disable MD033 -->

<details>
<summary>Expand JSON Configuration</summary>

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

</details>

<!-- markdownlint-enable MD033 -->

#### YAML Format (`.versurc.yaml`)

<!-- markdownlint-disable MD033 -->

<details>
<summary>Expand YAML Configuration</summary>

```yaml
versioning:
  breakingChange:
    stable: major
    prerelease: premajor
  unknownCommitType:
    stable: patch
    prerelease: prepatch
  commitTypes:
    feat:
      stable: minor
      prerelease: preminor
    fix:
      stable: patch
      prerelease: prepatch
  cascadeRules:
    stable:
      major: major
      minor: minor
      patch: patch
    prerelease:
      major: premajor
      minor: preminor
      patch: prepatch

changelog:
  root:
    context:
      prependPlaceholder: "<!-- Next Version Placeholder -->"
  module:
    context:
      prependPlaceholder: "<!-- Next Version Placeholder -->"
```

</details>

<!-- markdownlint-enable MD033 -->

#### JavaScript Format (`versu.config.js`)

<!-- markdownlint-disable MD033 -->

<details>
<summary>Expand JavaScript Configuration</summary>

```javascript
module.exports = {
  versioning: {
    breakingChange: {
      stable: 'major',
      prerelease: 'premajor'
    },
    unknownCommitType: {
      stable: 'patch',
      prerelease: 'prepatch'
    },
    commitTypes: {
      feat: {
        stable: 'minor',
        prerelease: 'preminor'
      },
      fix: {
        stable: 'patch',
        prerelease: 'prepatch'
      },
    },
    cascadeRules: {
      stable: {
        major: 'major',
        minor: 'minor',
        patch: 'patch'
      },
      prerelease: {
        major: 'premajor',
        minor: 'preminor',
        patch: 'prepatch'
      }
    }
  },
  changelog: {
    root: {
      context: {
        prependPlaceholder: '<!-- Next Version Placeholder -->'
      }
    },
    module: {
      context: {
        prependPlaceholder: '<!-- Next Version Placeholder -->'
      }
    }
  }
};
```

</details>

<!-- markdownlint-enable MD033 -->

#### Package.json Format

<!-- markdownlint-disable MD033 -->

<details>
<summary>Expand Package.json Configuration</summary>

```json
{
  "name": "my-project",
  "versu": {
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
        },
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
}
```

</details>

<!-- markdownlint-enable MD033 -->

### Configuration Validation

All configuration files are validated using [Zod](https://github.com/colinhacks/zod) schemas to ensure correctness and consistency. If validation fails, Versu will provide a detailed error message indicating which configuration fields are invalid.

### Advanced Changelog & Release Configuration

Versu integrates with [conventional-changelog-writer](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer) for powerful changelog and release notes generation. All options from conventional-changelog-writer are supported through the `changelog` and `release` fields. For advanced customization requiring functions (like custom transforms, sorting logic, or templates), use JavaScript (or TypeScript) configuration files in your repository.

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

Breaking changes can be indicated in two ways:

1. Using `!` after the type: `feat!: remove deprecated API`
2. Using `BREAKING CHANGE:` in the footer:

   ```text
   feat: update API
   
   BREAKING CHANGE: The old API is removed
   ```

Both trigger a **major** version bump.

## Complete Workflow Example

Here's a comprehensive workflow that handles different branches:

```yaml
name: Version Management

on:
  push:
    branches:
      - main
      - develop
      - 'feature/**'

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          # This is required to analyze commit history for version bumps
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Configure Git
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
      
      # Install the appropriate adapter for your project type
      - name: Install gradle adapter
        run: npm install -g @versu/plugin-gradle

      # Production releases
      - name: Release version
        if: github.ref == 'refs/heads/main'
        id: release
        uses: versuhq/versu@v0
        with:
          push-changes: true
          push-tags: true
      
      # Development pre-releases
      - name: Pre-release version
        if: github.ref == 'refs/heads/develop'
        id: prerelease
        uses: versuhq/versu@v0
        with:
          prerelease-mode: true
          prerelease-id: beta
          bump-unchanged: true
          push-changes: true
          push-tags: false
      
      # Feature branch CI versions
      - name: CI version
        if: startsWith(github.ref, 'refs/heads/feature/')
        id: ci
        uses: versuhq/versu@v0
        with:
          prerelease-mode: true
          prerelease-id: alpha
          timestamp-versions: true
          add-build-metadata: true
          bump-unchanged: true
          push-changes: false
          push-tags: false
      
      - name: Report results
        env:
          RELEASE_CHANGED_MODULES: ${{ steps.release.outputs.changed-modules }}
          RELEASE_CREATED_TAGS: ${{ steps.release.outputs.created-tags }}
          PRERELEASE_CHANGED_MODULES: ${{ steps.prerelease.outputs.changed-modules }}
          CI_CHANGED_MODULES: ${{ steps.ci.outputs.changed-modules }}
        run: |
          echo "Branch: $GITHUB_REF"
          if [ "$GITHUB_REF" == "refs/heads/main" ]; then
            echo "Changed modules: ${RELEASE_CHANGED_MODULES}"
            echo "Created tags: ${RELEASE_CREATED_TAGS}"
          elif [ "$GITHUB_REF" == "refs/heads/develop" ]; then
            echo "Changed modules: ${PRERELEASE_CHANGED_MODULES}"
          else
            echo "Changed modules: ${CI_CHANGED_MODULES}"
          fi
```

## Troubleshooting

### Permission Denied on Push

If you get permission errors when pushing:

1. Ensure `fetch-depth: 0` is set in checkout
2. Use a token with write permissions:

   ```yaml
   - uses: actions/checkout@v6
     with:
       token: ${{ secrets.PAT_TOKEN }}  # Personal access token
   ```

### No Version Bump Detected

If versions aren't bumping:

1. Check commit messages follow Conventional Commits format
2. Verify commits are in the repository (use `fetch-depth: 0`)
3. Check configuration if certain commit types should be ignored

### Adapter Not Detected

If auto-detection fails:

1. Verify your project has the expected build files
2. Explicitly specify the adapter:

   ```yaml
   with:
     adapter: gradle
   ```

## Related Packages

- **[@versu/core](../core)** - Core library for custom integrations
- **[@versu/cli](../cli)** - CLI tool for local development
- **[@versu/plugin-gradle][plugin-gradle]** - Gradle adapter plugin

## License

MIT License - see [LICENSE](../../LICENSE) for details.

[plugin-gradle]: https://github.com/versuhq/plugin-gradle
