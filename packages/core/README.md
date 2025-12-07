# @verse/core

Core business logic for VERSE — independent of GitHub Actions.

Build

```bash
npm run -w packages/core build
```

Test

```bash
npm run -w packages/core test
```

Publish to npm

```bash
# ensure dist is built
npm publish --workspace packages/core --access public
```
