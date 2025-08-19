# image-generation [![JSR](https://jsr.io/badges/@dv/image-generation)](https://jsr.io/@dv/image-generation) [![npm version](https://badge.fury.io/js/@totallynotdavid%2Fimage-generation.svg)](https://badge.fury.io/js/@totallynotdavid%2Fimage-generation)

[![CodeQL](https://github.com/totallynotdavid/image-generation/actions/workflows/codeql.yml/badge.svg)](https://github.com/totallynotdavid/image-generation/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/totallynotdavid/image-generation/graph/badge.svg?token=Z9K6TC9HFO)](https://codecov.io/gh/totallynotdavid/image-generation)
[![Deno CI](https://github.com/totallynotdavid/image-generation/actions/workflows/deno.yml/badge.svg)](https://github.com/totallynotdavid/image-generation/actions/workflows/deno.yml)

A simple, lightweight TypeScript image-processing library for Deno.

Each image transformation is a small, standalone async function: you pass
parameters and it returns a `Uint8Array` containing the processed image. That
functional design makes transformations easy to compose, test, and reuse.

Features:

- Runs natively on Deno (no npm dependencies).
- Works with local files and in-memory buffers (no need to upload images to
  third-party services).
- Each transformation returns a `Uint8Array`, so you can chain them together and
  integrate the results wherever you deliver or store image data.
- Designed for composition: build processing pipelines by chaining simple
  functions.

The package is a good fit for:

- Social media or chat bots that need consistent image effects
- Messaging applications that add image filters or overlays

## Available transformations

| Transform   | Purpose                             | Example                                                                                  | Result                                           |
| ----------- | ----------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `greyscale` | Convert to black and white          | `await greyscale({ input: "photo.jpg" })`                                                | ![greyscale](example/output/greyscale.png)       |
| `color`     | Apply color effects with blending   | `await color({ input: "photo.jpg", options: { hex: "#ff5500", blendMode: "tint" } })`    | ![color-tint](example/output/red-tint.png)       |
| `circle`    | Crop to circle with optional border | `await circle({ input: "photo.jpg", options: { borderWidth: 5, borderColor: "#000" } })` | ![circle-crop](example/output/circle-border.png) |
| `blink`     | Create animated GIF from images     | `await blink({ inputs: ["frame1.jpg", "frame2.jpg"], options: { delay: 200 } })`         | ![animation](example/output/blink-animation.gif) |

The cat in the image examples is
[@rexiecat](https://www.instagram.com/rexiecat/). Give them some love.

Each transformation returns a `Uint8Array` that you can write to disk, send over
HTTP, or pass to another transformation.

## Getting started

Install it:

```bash
deno add @dv/image-generation
# or if you use npm
npm install @totallynotdavid/image-generation
```

The most basic usage involves importing a transformation and calling it:

```typescript
import { greyscale } from '@dv/image-generation';

const result = await greyscale({ input: './photos/profile.png' });

// Save the result
await Deno.writeFile('./output/grey-profile.png', result);
```

You need read permissions for input files and write permissions if saving
output:

```bash
deno run --allow-read --allow-write your-script.ts
```

## How transformations work

The library provides several ways to transform images, from simple single-image
operations to complex multi-step pipelines.

### Single image processing

Most transformations operate on a single input image, producing a modified
output that can be saved or passed along in your pipeline.

For example, to apply a color tint with blend mode to an image:

```typescript
import { color } from '@dv/image-generation';

const tintedImage = await color({
    input: './input.jpg',
    options: {
        hex: '#FF99CC',
        blendMode: 'softlight',
        intensity: 0.7,
        opacity: 0.3,
    },
});
```

The `color` transformation in particular supports three blend modes:

- `tint`: Changes the hue while preserving lightness.
- `softlight`: Applies soft light blending for subtle effects.
- `wash`: Simple color overlay with opacity control.

### Multiple input processing

The `blink` transformation creates animated GIFs from multiple images:

```typescript
import { blink } from '@dv/image-generation';

const animation = await blink({
    inputs: ['frame1.png', 'frame2.png', 'frame3.png'],
    options: {
        delay: 200, // milliseconds between frames
        loop: true, // whether to loop indefinitely
    },
});
```

All input images are automatically resized to match the dimensions of the first
image, ensuring consistent animation frames.

### Composing transformations

Since each transformation returns a `Uint8Array`, you can chain them by passing
the output of one as input to another:

```typescript
import { blink, circle, greyscale } from '@dv/image-generation';

// Process individual frames:
// it applies a grayscale transformation followed by a circle transformation
const processFrame = async (imagePath: string) => {
    const greyData = await greyscale({ input: imagePath });
    return await circle({
        input: greyData, // Pass the buffer directly
        options: { borderWidth: 3, borderColor: '#ffffff' },
    });
};

// Create animation from processed frames
const frames = await Promise.all([
    processFrame('./frame1.jpg'),
    processFrame('./frame2.jpg'),
    processFrame('./frame3.jpg'),
]);

const animation = await blink({
    inputs: frames, // Use processed buffers
    options: { delay: 300 },
});
```

This approach gives you control over each step while avoiding intermediate file
I/O.

## Development

To work on this library:

```bash
git clone https://github.com/totallynotdavid/image-generation
cd image-generation
deno install --allow-scripts
```

Available tasks:

- `deno task dev:example` - Run the example code
- `deno task test` - Run tests (67 tests)
- `deno task tidy` - Format and lint code using the rules set on
  [deno.json](deno.json)
- `deno task build:npm` - Build the library for npm. It uses the
  [build_npm.ts](build_npm.ts) script

Run the example to verify everything works:

```bash
deno task dev:example
```

The codebase structure reflects the functional approach:

```
src/
├── transforms/           # Each transformation is a standalone function
├── types.ts              # Parameter types for each transformation
├── utils.ts              # Asset resolution and image loading
├── errors.ts             # Custom error classes
└── index.ts              # Public API exports
```

If you want to add a new transformation, create a new file in `src/transforms/`
that exports an async function following the established pattern. Add the
appropriate types to `src/types.ts` and export from `src/index.ts`.

## License

MIT License

## Acknowledgements

- Inspired by
  [discord-image-generation](https://www.npmjs.com/package/discord-image-generation)
  by mrkayjaydee
- Built with [ImageScript](https://github.com/matmen/ImageScript) by matmen for
  cross-platform image processing
