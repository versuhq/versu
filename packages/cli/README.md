# @muverse/cli

Command-line interface for `@muverse/core`.

Build

```bash
npm run -w packages/cli build
```

Run

```bash
# after build
node dist/index.js version --dry-run
```

Publish to npm

```bash
npm publish --workspace packages/cli --access public
```
