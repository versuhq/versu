export const mainReleaseModuleTemplate = `## What's changed
{{#each commitGroups}}

### {{title}}

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