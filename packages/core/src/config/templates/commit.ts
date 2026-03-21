export const commitPartial = `- {{subject}} {{#if @root.repoUrl}}([{{shortHash}}]({{@root.repoUrl}}/commit/{{hash}})){{else}}({{shortHash}}){{/if}}{{#if scope}} ({{scope}}){{/if}}
`;