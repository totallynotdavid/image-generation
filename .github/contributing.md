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

1. Change `name` in `package.json` to a scope you own on npm.
2. Publish the first version by hand so the package exists on npm: run
   `npm login`, then `bun run build`, then `npm publish --access public`.
3. Let the workflow authenticate to npm. Use trusted publishing, which needs no
   stored token:
   1. On npmjs.com, open the package, then Settings, then Trusted Publisher, and
      choose GitHub Actions.
   2. Enter your GitHub user or organization and the repository name. Enter the
      workflow filename `publish.yml`. Leave the environment name empty. Allow
      `npm publish`.
   3. On GitHub, open the repository, then Settings, Secrets and variables,
      Actions, Variables, and add a repository variable named
      `NPM_TRUSTED_PUBLISHER` with the value `true`.
4. Or use a token instead: on npmjs.com, open your account, then Access Tokens,
   and create a granular access token with write access to the package and no
   other scope. On GitHub, add it as a repository secret named `NPM_AUTH_TOKEN`.
   When the secret exists, the dry run checks that it can publish.

When trusted publishing is set up, npm uses it before any token. Delete the
`NPM_AUTH_TOKEN` secret once a release has gone out through it.

For each release:

1. Set `version` in `package.json`.
2. Write `.github/release-notes.md`. Its first line must be
   `<package> <version> is out.`, where `<package>` is the `name` without the
   scope, for example `image-generation 2.0.0 is out.` The rest of the file
   becomes the body of the GitHub release.
3. Run `bun run check` and open a pull request. The `Release` workflow runs on
   it as a dry run, described below. Merge only when it passes.
4. Merge the change to `master`, tag the merge commit and push the tag:

   ```bash
   git tag v2.0.0
   git push origin v2.0.0
   ```

On a tag, the `Release` workflow checks that the tag matches the `version` in
`package.json` and that the first line of `.github/release-notes.md` is the line
above. It runs `bun run check`, packs the tarball, publishes that tarball to npm
with provenance, and creates the GitHub release from the notes file.

Delete a bad tag with `git push origin :refs/tags/v2.0.0` and tag again. A
version already on npm cannot be published twice, so bump it.

## Dry run

Every pull request and manual run (`gh workflow run publish.yml --ref <branch>`)
runs the same workflow without publishing or creating the release. The checks
and pack run as on a tag. The version is compared with the notes only because
there is no tag. A separate `preflight` job fails when:

- a job names an `environment:` that does not exist in the repository;
- the `NPM_AUTH_TOKEN` secret exists but npm rejects it (`npm whoami`) or the
  token has no write access to the package (`npm access list collaborators`);
- neither the secret nor the `NPM_TRUSTED_PUBLISHER` variable is set.

The npm checks are skipped on pull requests from forks and from Dependabot,
which cannot read secrets. npm cannot check a trusted publisher before a
publish, so the variable records that you set it up.
