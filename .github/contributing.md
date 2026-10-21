# Contributing

## Setup

[mise](https://mise.jdx.dev) installs the pinned Node.js and Bun:

```bash
git clone https://github.com/totallynotdavid/image-generation
cd image-generation
mise install
bun install
```

The toolchain is [Vite+](https://viteplus.dev): `vp` formats, lints, type
checks, tests and bundles. `bun install` installs it as a dev dependency.

## Commands

| Command             | Does                                                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `bun run lint`      | Lints with no warnings allowed and checks formatting.                                                                |
| `bun run fix`       | Fixes what lint can fix and formats.                                                                                 |
| `bun run typecheck` | Type checks with `tsc`.                                                                                              |
| `bun run test`      | Runs the tests with coverage, which is written to `coverage/`.                                                       |
| `bun run build`     | Bundles `src/index.ts` into `dist/`, then packs the tarball, installs it and calls it with `import` and `require()`. |
| `bun run check`     | Runs `lint`, `typecheck`, `test` and `build`.                                                                        |
| `bun run example`   | Runs `example/main.ts` and writes the results to `example/output`.                                                   |

CI runs `bun run check`.

## Code layout

```
src/
├── transforms/   one file per transformation
├── errors.ts     ImageTransformError and ProcessingError
├── hex.ts        hex color parser
├── types.ts      parameter types
├── utils.ts      loadImage and resizeImage
└── index.ts      public exports
tests/            Vitest; tests/fixtures.ts builds the images they use
scripts/smoke.mjs the packed-tarball check
```

To add a transformation, add a file to `src/transforms/` that exports an async
function returning `Promise<Uint8Array>`, its parameter type to `src/types.ts`,
the exports to `src/index.ts`, and a test in `tests/transforms/`.

## Releasing

Pushing a tag named `v<version>` publishes the package to npm and creates the
GitHub release. You need push access and, once per fork, the setup below.

One-time setup, in your fork:

1. On npmjs.com, open your account, then Access Tokens, and create a granular
   access token that can publish the package. Give it write access to the
   package and no other scope.
2. On GitHub, open the repository, then Settings, Secrets and variables,
   Actions, and add a repository secret named `NPM_AUTH_TOKEN` with that token.
3. Change `name` in `package.json` to a scope you own on npm.

For each release:

1. Set `version` in `package.json`.
2. Write `.github/release-notes.md`. Its first line must be
   `<package> <version> is out.`, where `<package>` is the `name` without the
   scope, for example `image-generation 2.0.0 is out.` The rest of the file
   becomes the body of the GitHub release.
3. Run `bun run check` and merge the change to `master`.
4. Tag the merge commit and push the tag:

   ```bash
   git tag v2.0.0
   git push origin v2.0.0
   ```

The `Publish to npm` workflow stops before it publishes when the tag does not
match the `version` in `package.json`, or when the first line of
`.github/release-notes.md` is not the line above. It then runs `bun run check`,
publishes with provenance, and creates the GitHub release from the notes file.
Delete a bad tag with `git push origin :refs/tags/v2.0.0` and tag again. A
version already on npm cannot be published twice, so bump it.
