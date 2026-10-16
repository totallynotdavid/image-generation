# image-generation

[![npm](https://img.shields.io/npm/v/@totallynotdavid/image-generation)](https://www.npmjs.com/package/@totallynotdavid/image-generation)
[![CI](https://github.com/totallynotdavid/image-generation/actions/workflows/ci.yml/badge.svg)](https://github.com/totallynotdavid/image-generation/actions/workflows/ci.yml)
[![CodeQL](https://github.com/totallynotdavid/image-generation/actions/workflows/codeql.yml/badge.svg)](https://github.com/totallynotdavid/image-generation/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/totallynotdavid/image-generation/graph/badge.svg?token=Z9K6TC9HFO)](https://codecov.io/gh/totallynotdavid/image-generation)

Image transformations for Node.js, Bun and Deno. Each transformation is an async
function: pass a file path or encoded image bytes and get the processed image
back as a `Uint8Array`.

The library does not cache, limit concurrency or cap image size. A decoded image
takes 4 bytes per pixel in memory, so size limits belong to the caller.

## Install

```bash
npm install @totallynotdavid/image-generation
# or
bun add @totallynotdavid/image-generation
deno add npm:@totallynotdavid/image-generation
```

It needs Node.js 22.13 or later. The package is ESM and works with `require()`
on those Node.js versions.

## Usage

```typescript
import { writeFile } from "node:fs/promises";
import { greyscale } from "@totallynotdavid/image-generation";

const png = await greyscale({ input: "./photo.jpg" });
await writeFile("./photo-grey.png", png);
```

`input` is a file path or the bytes of a PNG, JPEG, GIF, WebP, TIFF or TGA
image. Every transformation except `blink` returns a PNG. `blink` returns a GIF.

## Transformations

| Transform   | Purpose                             | Example                                                                         | Result                                           |
| ----------- | ----------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| `greyscale` | Convert to black and white          | `await greyscale({ input: "photo.jpg" })`                                       | ![greyscale](example/output/greyscale.png)       |
| `color`     | Apply color effects with blending   | `await color({ input: "photo.jpg", hex: "#ff0000", blendMode: "tint" })`        | ![color-tint](example/output/red-tint.png)       |
| `circle`    | Crop to circle with optional border | `await circle({ input: "photo.jpg", borderWidth: 8, borderColor: "#ff0000" })`  | ![circle-crop](example/output/circle-border.png) |
| `blink`     | Create animated GIF from images     | `await blink({ inputs: ["frame1.jpg", "frame2.jpg"], delay: 200, loop: true })` | ![animation](example/output/blink-animation.gif) |

The cat in the image examples is
[@rexiecat](https://www.instagram.com/rexiecat/). Give them some love.

### greyscale

`greyscale({ input })` converts to grey by luma (ITU-R 601) and keeps the alpha
channel.

### color

`color({ input, hex, blendMode, opacity, intensity })` mixes a color into every
pixel. The alpha channel stays as it is.

| Option      | Default   | Meaning                                                     |
| ----------- | --------- | ----------------------------------------------------------- |
| `hex`       | `#ffffff` | `#rgb`, `#rrggbb` or `#rrggbbaa`. The `#` is optional.      |
| `blendMode` | `tint`    | `tint`, `softlight` or `wash`.                              |
| `opacity`   | `0.3`     | Share of the blended color in the result, from 0 to 1.      |
| `intensity` | `1`       | Strength of the whole effect, from 0 (original image) to 1. |

The blend modes:

- `tint` keeps the lightness of each pixel and takes the hue and saturation of
  the color.
- `softlight` blends the color over the image with the W3C soft-light formula.
- `wash` mixes the color into each channel.

### circle

`circle({ input, borderWidth, borderColor })` crops the centered square of the
shorter side to a circle with transparent corners. A border of `borderWidth`
pixels (rounded to a whole number) is added around it, so the output is
`size + 2 * borderWidth` pixels wide. `borderColor` takes the same formats as
`hex` and defaults to `#000000`. A border of half the shorter side or more
throws.

### blink

`blink({ inputs, delay, loop })` builds a GIF with one frame per input. It needs
at least two inputs. Every frame is scaled to cover the size of the first image
and cropped to it. `delay` is in milliseconds, defaults to 200 and is raised to
50 when lower. `loop` defaults to `true`.

### Composing transformations

Each transformation accepts the output of another as `input`, so a pipeline
needs no files in between:

```typescript
import { blink, circle, greyscale } from "@totallynotdavid/image-generation";

const frames = await Promise.all(
  ["./frame1.jpg", "./frame2.jpg", "./frame3.jpg"].map(async (path) =>
    circle({
      input: await greyscale({ input: path }),
      borderWidth: 3,
      borderColor: "#fff",
    }),
  ),
);

const animation = await blink({ inputs: frames, delay: 300 });
```

## Errors

Every failure throws a `ProcessingError`, a subclass of `ImageTransformError`.
The message starts with the code, as in
`[PROCESSING_ERROR] Failed to load image: ...`, and `cause` holds the original
error when there is one.

```typescript
import { greyscale, ProcessingError } from "@totallynotdavid/image-generation";

try {
  await greyscale({ input: "./missing.png" });
} catch (error) {
  if (error instanceof ProcessingError)
    console.error(error.code, error.message);
}
```

## Other exports

`loadImage(input)` decodes a path or bytes to an
[ImageScript](https://github.com/matmen/ImageScript) `Image`, and
`resizeImage(image, { width, height, mode })` resizes one in place and returns
it. Give one dimension to keep the aspect ratio. `mode` is an ImageScript
`ResizeMode` and defaults to bilinear.

## Contributing

See [.github/contributing.md](.github/contributing.md).

## License

[MIT](license)

Built on [ImageScript](https://github.com/matmen/ImageScript) by matmen.
Inspired by
[discord-image-generation](https://www.npmjs.com/package/discord-image-generation)
by mrkayjaydee.
