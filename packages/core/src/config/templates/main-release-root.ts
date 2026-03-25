export const mainReleaseRootTemplate = `{{#if moduleResults}}

### 🚀 Module Releases

{{#each moduleResults}}
{{~#if declaredVersion~}}
{{~#if isRelease~}}
- [{{name}}]({{path}}/CHANGELOG.md) - [{{to}}]({{@root.repoUrl}}/compare/{{name}}@{{from}}...{{name}}@{{to}})
{{~else~}}
- [{{name}}]({{path}}/CHANGELOG.md) - Unreleased
{{~/if}}

{{/if~}}
{{/each}}
{{/if}}

## 📝 Other Changes
{{#each commitGroups}}

#### {{title}}

{{#each commits}}
{{> commit}}
{{/each}}
{{/each}}
{{> footer}}
`;