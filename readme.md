# Image Transform Library

A TypeScript/Deno image processing library providing powerful, production-ready transformations with an extensible plugin architecture. Process images with built-in effects or develop custom plugins to meet your specific needs.

This library offers a modern, type-safe approach to image manipulation, perfect for:

- Creating visual effects for social media bots
- Adding image transformations to messaging applications (e.g. stickers)
- Building custom image processing pipelines
- Generating dynamic visual content

Originally built for a WhatsApp bot I mantain ([check it out](https://github.com/totallynotdavid/WhatsAppBot)) and inspired by [discord-image-generation](https://www.npmjs.com/package/discord-image-generation), this library has been completely rebuilt with TypeScript for better type safety and platform independence.

## Features

- 🖼️ Ready-to-use image effects including color manipulation, cropping, and animation
- 🧩 Easily create and integrate custom transformations
- ⚙️ Robust parameter checking to prevent runtime errors
- 🔍 Complete TypeScript definitions for better developer experience

## Transformation Gallery

| Transformation  | Description                                    | Example Usage                                                                |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| **Greyscale**   | Convert images to black and white              | `await greyscale({ input: "image.png" })`                                    |
| **Color Tint**  | Apply color overlay with blend modes           | `await color({ input: "image.png", options: { hex: "#ff5500" } })`           |
| **Circle Crop** | Crop images into circles with optional borders | `await circle({ input: "image.png", options: { borderWidth: 5 } })`          |
| **Animation**   | Create GIF animations from image sequences     | `await blink({ inputs: ["img1.png", "img2.png"], options: { delay: 200 } })` |

## Installation

For projects using Deno, just run:

```bash
deno add @dv/image-generation
```

For Node.js Projects (via npm): _Coming soon_

## Basic Usage

Import the transformations you need and apply them to your images:

```typescript
import { greyscale, color, circle } from "@dv/image-generation";

const greyImage = await greyscale({
  input: "./photos/profile.png",
});

await Deno.writeFile("./output/greyscale-profile.png", greyImage);
```

When running with Deno, you'll need these permissions:

```bash
deno run --allow-read --allow-write your-script.ts
```

## Usage Examples

### Single Image Transformations

```typescript
// Apply a color tint
const tintedImage = await color({
  input: "./input.jpg",
  options: {
    hex: "#FF99CC",
    blendMode: "softlight", // Options: 'overlay' or 'softlight'
  },
});

// Create a circular avatar with border
const avatarImage = await circle({
  input: "./photos/profile.png",
  options: {
    borderWidth: 5,
    borderColor: "#000000",
  },
});
```

### Multi-Image Processing

For transformations that work with multiple images, use the `inputs` parameter:

```typescript
// Create an animation from multiple frames
const animatedImage = await blink({
  inputs: ["frame1.png", "frame2.png", "frame3.png"],
  options: {
    delay: 200, // milliseconds between frames
    loop: true, // loop continuously
  },
});
```

### Transformation Chaining

Combine multiple transformations to create complex effects:

```typescript
import { blink, circle, greyscale } from "@dv/image-generation";

// Process each frame individually
const processedFrames = await Promise.all(
  ["frame1.png", "frame2.png"].map(async (img) => {
    // First convert to greyscale
    const grey = await greyscale({ input: img });

    // Then crop into a circle
    return circle({
      input: grey,
      options: { borderWidth: 3, borderColor: "#ffffff" },
    });
  }),
);

// Create animation from processed frames
const animation = await blink({
  inputs: processedFrames,
  options: { delay: 300 },
});
```

## Developer Guide

To set up your environment, just follow these steps:

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

3. Run the example to verify your setup:

   ```bash
   deno task dev:example
   ```

   You can see the results in `example/output`.

### Available Development Commands

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `deno task dev`         | Run development mode with hot reload |
| `deno task dev:example` | Execute the example code             |
| `deno task tidy`        | Format code and run linter           |
| `deno task test`        | Run the test suite                   |

### Project Structure

```
src/
├── core/               # Core processing components
│   ├── asset-resolver.ts   # Asset path resolution
│   └── processor.ts        # Core processing logic
├── errors.ts           # Custom error definitions
├── index.ts            # Main exports
├── plugins/            # Plugin system
│   ├── index.ts
│   └── register-built-ins.ts
├── transforms/         # Built-in transformations
│   ├── blink.ts
│   ├── circle.ts
│   ├── color.ts
│   └── greyscale.ts
├── types/              # Type definitions
│   └── transforms.ts
└── validation/         # Parameter validation
    ├── schemas.ts
    └── utils.ts
```

## Contributing

Contributions are welcome! Here's how to add a new transformation:

1. Create a new file in `src/transforms/` for your transformation
2. Define the transform parameters in `src/types/transforms.ts`
3. Add parameter validation in `src/validation/schemas.ts`
4. Register your plugin in `src/plugins/register-built-ins.ts`
5. Add tests and documentation

Before submitting:

- Run `deno task tidy` to ensure code formatting and linting pass
- Make sure all tests pass with `deno task test`
- Update documentation to reflect your changes

## License

[MIT License](LICENSE)

## Acknowledgements

- Inspired by [discord-image-generation](https://www.npmjs.com/package/discord-image-generation) by mrkayjaydee
- Built with [Deno](https://deno.land/) and [sharp](https://sharp.pixelplumbing.com/)
