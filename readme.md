# [pkg]: image-generation [![JSR](https://jsr.io/badges/@dv/image-generation)](https://jsr.io/@dv/image-generation) [![npm version](https://badge.fury.io/js/@totallynotdavid%2Fimage-generation.svg)](https://badge.fury.io/js/@totallynotdavid%2Fimage-generation)

[![CodeQL](https://github.com/totallynotdavid/image-generation/actions/workflows/codeql.yml/badge.svg)](https://github.com/totallynotdavid/image-generation/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/totallynotdavid/image-generation/graph/badge.svg?token=Z9K6TC9HFO)](https://codecov.io/gh/totallynotdavid/image-generation)
[![Deno CI](https://github.com/totallynotdavid/image-generation/actions/workflows/deno.yml/badge.svg)](https://github.com/totallynotdavid/image-generation/actions/workflows/deno.yml)

A TypeScript/Deno image processing library providing powerful, production-ready
transformations with an extensible plugin architecture. Process images with
built-in effects or develop custom plugins to meet your specific needs.

This library offers a modern, type-safe approach to image manipulation, perfect
for:

- Creating visual effects for social media bots
- Adding image transformations to messaging applications (e.g., stickers)
- Building custom image processing pipelines
- Generating dynamic visual content

Originally built for a WhatsApp bot
([check it out](https://github.com/totallynotdavid/WhatsAppBot)) and inspired by
[discord-image-generation](https://www.npmjs.com/package/discord-image-generation),
this library has been completely rebuilt with TypeScript for better type safety
and platform independence.

## Features

- 🖼️ Ready-to-use image effects including color manipulation, cropping, and
  animation
- 🧩 Easily create and integrate custom transformations
- ⚙️ Robust parameter checking to prevent runtime errors
- 🔍 Complete TypeScript definitions for better developer experience

## Transformation Gallery

| Transformation  | Description                                    | Example Usage                                                                | Result                                           |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| **Greyscale**   | Convert images to black and white              | `await greyscale({ input: "image.png" })`                                    | ![greyscale](example/output/greyscale.png)       |
| **Color Tint**  | Apply color overlay with blend modes           | `await color({ input: "image.png", options: { hex: "#ff5500" } })`           | ![color-tint](example/output/red-overlay.png)    |
| **Circle Crop** | Crop images into circles with optional borders | `await circle({ input: "image.png", options: { borderWidth: 5 } })`          | ![circle-crop](example/output/circle-border.png) |
| **Animation**   | Create GIF animations from image sequences     | `await blink({ inputs: ["img1.png", "img2.png"], options: { delay: 200 } })` | ![animation](example/output/blink-animation.gif) |

The cat in the image examples is
[@rexiecat](https://www.instagram.com/rexiecat/). Give them some love.

## Getting Started

### Installation & Usage

For projects using Deno, simply add the package:

```bash
deno add @dv/image-generation
```

Node.js support via npm is coming soon.

Import the transformations you need and apply them to your images:

```typescript
import { greyscale } from '@dv/image-generation';

const greyImage = await greyscale({
    input: './photos/profile.png',
});

await Deno.writeFile('./output/greyscale-profile.png', greyImage);
```

When running with Deno, you'll need these permissions:

```bash
deno run --allow-read --allow-write your-script.ts
```

If you’d rather not write a script just to test things, you can run:

```bash
deno task dev:example
```

## Examples

The library provides several ways to transform images, from simple single-image
operations to complex multi-step pipelines.

### Single Image Transformations

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
    },
});
```

For the `hex` parameter, you can use either 6-digit or 3-digit hex codes. The
`blendMode` parameter accepts either `softlight` or `overlay`. See the
documentation for complete parameter options.

To create a circular avatar with a border:

```typescript
import { circle } from '@dv/image-generation';

const avatarImage = await circle({
    input: './photos/profile.png',
    options: {
        borderWidth: 5,
        borderColor: '#000000',
    },
});
```

### Multi-Image Processing

Some transformations like animations require multiple input images. For these,
use the `inputs` parameter instead of `input`:

```typescript
import { blink } from '@dv/image-generation';

const animatedImage = await blink({
    inputs: ['frame1.png', 'frame2.png', 'frame3.png'],
    options: {
        delay: 200, // milliseconds between frames
        loop: true, // loop continuously
    },
});
```

### Building Transformation Pipelines

The real power of this library comes from combining transformations. You can
chain them to create complex effects by passing the output of one transformation
as the input to another. For example, you could do:

```typescript
import { blink, circle, greyscale } from '@dv/image-generation';

const inputFrames = ['frame1.png', 'frame2.png'];

// Create a processing pipeline for each frame
const processedFrames = await Promise.all(
    inputFrames.map(async (img) => {
        const grey = await greyscale({ input: img });

        return circle({
            input: grey,
            options: { borderWidth: 3, borderColor: '#ffffff' },
        });
    }),
);

// Combine processed frames into an animation
const animation = await blink({
    inputs: processedFrames,
    options: { delay: 300 },
});

await Deno.writeFile('./output/animated-avatars.gif', animation);
```

This example shows how to create a more complex workflow:

1. Load multiple image frames
2. Convert each to greyscale (we use the `greyscale` function for this)
3. Crop each into a circle with border (for this, we use the `circle` function)
4. Combine them into an animated GIF (using `blink`)

Each transformation returns a buffer that can be passed directly as input to the
next transformation, making it easy to create sophisticated image processing
chains without saving intermediate files.

## For Developers

The library is designed to be both user-friendly and developer-friendly. If
you're interested in contributing or extending the library with your own
transformations, this section will help you get started.

### Setting Up Your Environment

To set up your development environment:

1. Clone the repository:

   ```bash
   git clone https://github.com/totallynotdavid/image-generation
   cd image-generation
   ```

2. Install Deno if you don't have it:

   ```bash
   # Unix-based systems
   curl -fsSL https://deno.land/install.sh | sh

   # Windows
   irm https://deno.land/install.ps1 | iex
   ```

3. Install dependencies:

   ```bash
   deno install --allow-scripts
   ```

4. Run the example to verify your setup:

   ```bash
   deno task dev:example
   ```

   You can see the results in `example/output`.

The repo includes several useful development commands:

- `deno task dev` - Run development mode with hot reload
- `deno task dev:example` - Execute the example code
- `deno task tidy` - Format code and run linter
- `deno task test` - Run the test suite

### Project Structure

The codebase is organized to make it easy to understand and extend:

```
src/
├── core/                       # Core processing components
│   ├── asset-resolver.ts       # Asset path resolution
│   └── processor.ts            # Core processing logic
├── errors.ts                   # Custom error definitions
├── index.ts                    # Main exports
├── plugins/                    # Plugin system
│   ├── index.ts
│   └── register-built-ins.ts
├── transforms/                 # Built-in transformations
│   ├── blink.ts
│   ├── circle.ts
│   ├── color.ts
│   └── greyscale.ts
├── types/                      # Type definitions
│   └── transforms.ts
└── validation/                 # Parameter validation
    ├── schemas.ts
    └── utils.ts
```

If you're looking to understand how transformations work, start by exploring the
`transforms` directory, which contains all the built-in effects.

### Contributing

Contributions are welcome! If you'd like to add a new transformation or improve
an existing one, here's how:

1. Create a new file in `src/transforms/` for your transformation
2. Define the transform parameters in `src/types/transforms.ts`
3. Add parameter validation in `src/validation/schemas.ts`
4. Register your plugin in `src/plugins/register-built-ins.ts`
5. Add tests and documentation

Before submitting a pull request:

- Run `deno task tidy` to ensure code formatting and linting pass
- Make sure all tests pass with `deno task test`
- Update documentation to reflect your changes

## License

[MIT License](LICENSE)

## Acknowledgements

- Inspired by
  [discord-image-generation](https://www.npmjs.com/package/discord-image-generation)
  by mrkayjaydee
- Built with [Deno](https://deno.land/) and
  [sharp](https://sharp.pixelplumbing.com/)
