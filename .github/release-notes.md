image-generation 2.0.0 is out.

This is the first release since 1.0.0 in April 2025. It is a rewrite of the
internals and a cleanup of the API, and code written against 1.x needs changes.
If you only call `greyscale`, `color`, `circle` and `blink` with file paths, the
changes are small and listed below.

The biggest change is the engine. 1.x used sharp, canvas and gifencoder, which
need native binaries. 2.0 uses
[ImageScript](https://github.com/matmen/ImageScript), which is plain JavaScript
and WebAssembly. Nothing is compiled at install time, and the same package runs
on Node.js 22.13 or later, Bun and Deno. The package is ESM and also loads with
`require()` on those Node.js versions. Pixel output is not byte-identical to
1.x, so do not compare saved images.

The second change is the API. I removed the plugin system, the generic
`transform()` function, `Processor` and `AssetResolver`. They served custom
transformations and asset lookup that nobody asked for. The four transformations
are now plain async functions, and their options sit next to `input` instead of
inside an `options` object. `input` also takes encoded image bytes, so
transformations chain without writing files in between.

`color` gained `opacity` (default 0.3), `intensity` and a `wash` blend mode, and
the blend modes changed as described below. The rest is tests, docs, and
tooling: the project now builds with Vite+ and Bun, and CI runs the checks and a
smoke test that installs the packed tarball.

## Breaking changes

**Options are flat.** Before:

```ts
await color({
  input: "photo.jpg",
  options: { hex: "#ff5500", blendMode: "overlay" },
});
await circle({ input: "photo.jpg", options: { borderWidth: 5 } });
await blink({ inputs: ["a.jpg", "b.jpg"], options: { delay: 200 } });
```

After:

```ts
await color({ input: "photo.jpg", hex: "#ff5500", blendMode: "tint" });
await circle({ input: "photo.jpg", borderWidth: 5 });
await blink({ inputs: ["a.jpg", "b.jpg"], delay: 200 });
```

**The blend mode `overlay` is now `tint`, and `tint` is the default.** The modes
are `tint`, `softlight` and `wash`. Any other value throws a `ProcessingError`.
`hex` is optional and defaults to `#ffffff`. It accepts `#rgb`, `#rrggbb` and
`#rrggbbaa`, and the `#` is optional.

**The plugin system is gone.** `transform()`, `registerPlugin`, `getPlugin`,
`getAllPlugins`, `clearPlugins`, `Processor`, `AssetResolver` and the types
`TransformMap`, `TransformParams`, `SingleImageTransform` and
`MultiImageTransform` are removed. Call the transformation directly. Before:

```ts
import { transform } from "@totallynotdavid/image-generation";
await transform("greyscale", { input: "photo.jpg" });
```

After:

```ts
import { greyscale } from "@totallynotdavid/image-generation";
await greyscale({ input: "photo.jpg" });
```

**One error class.** `MissingParameterError`, `InvalidHexError`,
`MinimumImagesError`, `InvalidImageError`, `InvalidOptionError`,
`TransformNotFoundError`, `FileSystemError` and `PluginExistsError` are removed.
Every failure, including a bad option or an unreadable file, throws a
`ProcessingError`, a subclass of `ImageTransformError`, and `cause` holds the
original error. Before:

```ts
try {
  await greyscale({ input: "missing.png" });
} catch (error) {
  if (error instanceof InvalidImageError) console.error("bad file");
}
```

After:

```ts
try {
  await greyscale({ input: "missing.png" });
} catch (error) {
  if (error instanceof ProcessingError) console.error("bad file", error.cause);
}
```

**`circle` adds the border outside.** In 1.x the border was drawn inside the
circle and the output kept the input size. Now the output is
`size + 2 * borderWidth` pixels wide. A border of half the shorter side or more
throws.

**`blink` frames follow the first image, and `delay` is at least 50 ms.** Frames
of another size are scaled to cover the first image and cropped to it. A lower
`delay` is raised to 50.

**Runtime and install.** The package is published to npm only, and needs Node.js
22.13 or later. Deno users import it as `npm:@totallynotdavid/image-generation`.
The 1.x `deno.json` and the JSR entry are gone.

## Known problems

None known.

## What to do

Install the new version and update the calls as shown above:

```bash
npm install @totallynotdavid/image-generation@2
```

Run your tests, and look at the images the transformations produce, since the
engine changed. Report problems at
https://github.com/totallynotdavid/image-generation/issues.

## Changes

Plugins and API:

- 1520405 remove the plugin system and asset resolution
- de0c4ea flatten the options and unify image input handling
- 9de823d add standardized resizing, now `resizeImage`
- bef75dc return the processing error instead of throwing it internally
- 4125f87 remove the zero-size image check

Color:

- 7ac10e6 apply `opacity` in the tint and softlight blend modes

Runtime and build:

- 0d81924 replace Deno with Vite+ and Bun
- 75a8e46 simplify the example
- b3a8c9a, 9817645, 4378130, 2a85e51, 4dd0d44, 433f7c5, 544d5ad move tool
  settings, scripts and formatting to the new toolchain
- 3721896 add an environment example

Tests:

- ecd5290 port the tests to vitest
- 9958e3f clean up descriptions and tighten the performance thresholds
- 8fb60a4, 17ccbe3 merge repeated tests and remove unsafe type assertions

CI and dependencies:

- 0e35ab6, 46a1c41, 320d861 run the checks in GitHub Actions through package
  scripts
- 38356a1 pin every action to a commit SHA
- f24e0a7 scope the workflow triggers
- 27e49ff, 905ab4e group Dependabot updates and cover every ecosystem
- 723d9fe, dfdf142 update dependencies

Docs:

- 230bada, 29a3088, 34f4495 clarify the package scope, update the readme and
  document the bun commands
