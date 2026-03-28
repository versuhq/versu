export const mainModuleTemplate = `{{~#if prepend}}{{> header}}
{{prependPlaceholder}}

{{/if~}}
{{~#if version}}
{{~#if linkCompare}}
## [{{version}}]({{repoUrl}}/compare/{{previousTag}}...{{currentTag}}) - {{date}}
{{~else}}
## [{{version}}]({{repoUrl}}/releases/tag/{{currentTag}}) - {{date}}
{{~/if}}
{{~else}}
{{~#if previousTag}}
## [Unreleased]({{repoUrl}}/compare/{{previousTag}}...HEAD) - {{date}}
{{~else}}
## Unreleased
{{~/if}}
{{~/if}}

{{#each commitGroups}}

### {{title}}

{{#each commits}}
{{> commit}}
{{/each}}
{{/each}}
{{#if prepend}}

{{> footer}}{{/if}}
`;