export const mainReleaseRootTemplate = `## What's changed
{{#if moduleResults}}

### 🚀 Module Releases

{{#each moduleResults}}
{{#if declaredVersion}}
{{#if (ne type "root")}}
{{#if isRelease}}
- [{{name}}]({{path}}/CHANGELOG.md) - [{{to}}]({{@root.repoUrl}}/compare/{{name}}@{{from}}...{{name}}@{{to}})
{{else}}
- [{{name}}]({{path}}/CHANGELOG.md) - Unreleased
{{/if}}
{{/if}}
{{/if}}
{{/each}}
{{/if}}

## 📝 Other Changes
{{#each commitGroups}}

#### {{title}}

{{#each commits}}
{{> commit}}
{{/each}}
{{/each}}

**Full Changelog:** {{#if linkCompare~}}
[\`{{previousTagVersion}}...{{version}}\`]({{repoUrl}}/compare/{{previousTag}}...{{currentTag}})
{{else~}}
[\`{{version}}\`]({{repoUrl}}/releases/tag/{{currentTag}})
{{/if}}

{{> footer}}
`;