# Publishing guide

This repository is a monorepo with three packages:
- `packages/core` — `@muverse/core` (business logic)
- `packages/cli` — `@muverse/cli` (CLI wrapper)
- `packages/action` — `@muverse/action` (GitHub Action bundle)

Build all packages:

```bash
npm install
npm run -w packages/core build
npm run -w packages/cli build
npm run -w packages/action build
```

Publish to npm (example):

```bash
# publish core
npm publish --workspace packages/core --access public
# publish cli
npm publish --workspace packages/cli --access public
```

Notes for the GitHub Action:
- The Action is intended to be published by tagging a release on GitHub. The `dist/index.js` artifact is included in the repo when building the action package.
- To use via marketplace or reference the action, create a Git tag and release, then reference `owner/repo@vX` in workflows.

Repository metadata should be set in each package `package.json` (`repository`, `bugs`, `homepage`, `files`).
