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

| Command                 | Does                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `bun run check`         | Format check, lint and type check.                                                 |
| `bun run fix`           | The same, rewriting what it can fix.                                               |
| `bun run test`          | Runs the tests.                                                                    |
| `bun run test:coverage` | Runs the tests and writes `coverage/`.                                             |
| `bun run build`         | Bundles `src/index.ts` into `dist/`.                                               |
| `bun run smoke`         | Builds, packs the tarball, installs it and calls it with `import` and `require()`. |
| `bun run example`       | Runs `example/main.ts` and writes the results to `example/output`.                 |

CI runs `check`, `test:coverage` and `smoke` on the pinned Node.js, and `test`
and `smoke` on Node.js 22.18 and 24.

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
