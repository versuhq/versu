export const mainReleaseModuleTemplate = `## What's changed
{{#each commitGroups}}

### {{title}}

{{#each commits}}
{{> commit}}
{{/each}}
{{/each}}

**Full Changelog:** {{#if linkCompare~}}
[\`{{previousTag}}...{{currentTag}}\`]({{repoUrl}}/compare/{{previousTag}}...{{currentTag}})
{{else~}}
[\`{{version}}\`]({{repoUrl}}/releases/tag/{{version}})
{{/if}}

{{> footer}}
`;