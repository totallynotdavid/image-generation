import {
  assertEquals,
  assertExists,
  assertRejects,
  assertThrows,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  cleanupTestAssets,
  createImageInput,
  createTestAssetResolver,
  saveTestAsset,
} from "./test-utils.ts";
import { AssetResolver } from "../src/core/asset-resolver.ts";
import { ImageProcessorImpl } from "../src/core/processor.ts";
import { BlurFilter } from "../src/modules/filters/blur.ts";
import { GayFilter } from "../src/modules/filters/gay.ts";
import { ColorUtil } from "../src/modules/utils/color.ts";
import { TriggeredGif } from "../src/modules/gif/triggered.ts";
import { AdMontage } from "../src/modules/montage/ad.ts";
import { Buffer } from "node:buffer";
import { BlinkGif } from "../src/modules/gif/blink.ts";

Deno.test("AssetResolver", async (t) => {
  try {
    await t.step("should create a new instance with default path", () => {
      const resolver = new AssetResolver();
      assertExists(resolver);
    });

    await t.step("should create a new instance with custom path", () => {
      const resolver = new AssetResolver("./custom-assets");
      assertExists(resolver);
    });

    await t.step("should resolve an existing asset", () => {
      const resolver = createTestAssetResolver();
      // Create a test asset
      const assetPath = saveTestAsset("test-asset.txt", "test content");

      // Resolve should find the asset
      const resolved = resolver.resolveAsset("test-asset.txt");
      assertEquals(resolved, assetPath);
    });

    await t.step("should throw an error for non-existent asset", () => {
      const resolver = createTestAssetResolver();
      assertThrows(
        () => {
          resolver.resolveAsset("non-existent-asset.txt");
        },
        Error,
        "Asset not found",
      );
    });

    await t.step("should throw an error for invalid asset name", () => {
      const resolver = createTestAssetResolver();
      // @ts-ignore - Testing error handling with invalid input
      assertThrows(() => resolver.resolveAsset(null), Error);
      // @ts-ignore - Testing error handling with invalid input
      assertThrows(() => resolver.resolveAsset(undefined), Error);
      // @ts-ignore - Testing error handling with invalid input
      assertThrows(() => resolver.resolveAsset(123), Error);
      assertThrows(() => resolver.resolveAsset(""), Error);
    });
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("ImageProcessor", async (t) => {
  try {
    await t.step("should register and process modules", async () => {
      const resolver = createTestAssetResolver();
      const processor = new ImageProcessorImpl();

      // Create necessary assets for testing
      saveTestAsset("gay.png", createImageInput());

      // Register a module
      const filter = new GayFilter(resolver);
      processor.registerModule("testFilter", filter);

      // Process an image
      const input = createImageInput();
      const output = await processor.processImage(input, "testFilter");

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });

    await t.step("should throw error for unregistered module", async () => {
      const processor = new ImageProcessorImpl();
      const input = createImageInput();

      await assertRejects(
        async () => {
          await processor.processImage(input, "nonExistentModule");
        },
        Error,
        "not registered",
      );
    });

    await t.step(
      "should validate input types for single/multi image modules",
      async () => {
        const resolver = createTestAssetResolver();
        const processor = new ImageProcessorImpl();

        // Create necessary assets
        saveTestAsset("gay.png", createImageInput());
        saveTestAsset("triggered.png", createImageInput());

        // Register a single image module
        const singleImageModule = new GayFilter(resolver);
        processor.registerModule("singleImage", singleImageModule);

        // Register a multi image module
        const multiImageModule = new BlinkGif(resolver);
        processor.registerModule("multiImage", multiImageModule);

        // Try to process an array with a single image module
        await assertRejects(
          async () => {
            await processor.processImage([createImageInput()], "singleImage");
          },
          Error,
          "requires a single image",
        );

        // Try to process a single image with a multi image module
        await assertRejects(
          async () => {
            await processor.processImage(createImageInput(), "multiImage");
          },
          Error,
          "requires multiple images",
        );
      },
    );
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("BlurFilter", async (t) => {
  try {
    await t.step("should apply blur effect with default level", async () => {
      const resolver = createTestAssetResolver();
      const filter = new BlurFilter(resolver);

      const input = createImageInput();
      const output = await filter.process(input);

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });

    await t.step("should apply blur effect with custom level", async () => {
      const resolver = createTestAssetResolver();
      const filter = new BlurFilter(resolver);

      const input = createImageInput();
      const output = await filter.process(input, 10);

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });

    await t.step("should handle invalid blur level", async () => {
      const resolver = createTestAssetResolver();
      const filter = new BlurFilter(resolver);

      const input = createImageInput();
      // Should use default blur level for non-numeric input
      const output = await filter.process(
        input,
        "invalid" as unknown as number,
      );

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("ColorUtil", async (t) => {
  try {
    await t.step("should create an image with default color", async () => {
      const resolver = createTestAssetResolver();
      const colorUtil = new ColorUtil(resolver);

      const output = await colorUtil.process();

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });

    await t.step("should create an image with custom color", async () => {
      const resolver = createTestAssetResolver();
      const colorUtil = new ColorUtil(resolver);

      const output = await colorUtil.process(undefined, "#FF5500");

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });

    await t.step("should throw error for invalid color format", async () => {
      const resolver = createTestAssetResolver();
      const colorUtil = new ColorUtil(resolver);

      await assertRejects(
        async () => {
          await colorUtil.process(undefined, "not-a-color");
        },
        Error,
        "Invalid color format",
      );
    });

    await t.step("should create an instance with custom dimensions", () => {
      const resolver = createTestAssetResolver();
      const colorUtil = new ColorUtil(resolver, { width: 500, height: 300 });

      assertExists(colorUtil);
    });

    await t.step("should throw error for invalid dimensions", () => {
      const resolver = createTestAssetResolver();

      assertThrows(
        () => {
          new ColorUtil(resolver, { width: -200, height: 300 });
        },
        Error,
        "Invalid dimensions",
      );

      assertThrows(
        () => {
          new ColorUtil(resolver, { width: 200, height: 0 });
        },
        Error,
        "Invalid dimensions",
      );
    });
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("TriggeredGif", async (t) => {
  try {
    await t.step(
      "should create a triggered gif with default timeout",
      async () => {
        const resolver = createTestAssetResolver();
        // Create the necessary asset
        saveTestAsset("triggered.png", createImageInput());

        const triggeredGif = new TriggeredGif(resolver);

        const input = createImageInput();
        const output = await triggeredGif.process(input);

        assertExists(output);
        assertEquals(output instanceof Buffer, true);
      },
    );

    await t.step(
      "should create a triggered gif with custom timeout",
      async () => {
        const resolver = createTestAssetResolver();
        // Create the necessary asset
        saveTestAsset("triggered.png", createImageInput());

        const triggeredGif = new TriggeredGif(resolver);

        const input = createImageInput();
        const output = await triggeredGif.process(input, 30);

        assertExists(output);
        assertEquals(output instanceof Buffer, true);
      },
    );

    await t.step("should throw error for invalid timeout", async () => {
      const resolver = createTestAssetResolver();
      saveTestAsset("triggered.png", createImageInput());

      const triggeredGif = new TriggeredGif(resolver);

      const input = createImageInput();

      await assertRejects(
        async () => {
          await triggeredGif.process(input, -10);
        },
        Error,
        "Invalid timeout",
      );

      await assertRejects(
        async () => {
          await triggeredGif.process(input, NaN);
        },
        Error,
        "Invalid timeout",
      );

      await assertRejects(
        async () => {
          await triggeredGif.process(input, 0);
        },
        Error,
        "Invalid timeout",
      );
    });
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("Multi-module tests - Combined workflows", async (t) => {
  try {
    await t.step("should process image through multiple modules", async () => {
      const resolver = createTestAssetResolver();
      const processor = new ImageProcessorImpl();

      // Create necessary assets
      saveTestAsset("gay.png", createImageInput());
      saveTestAsset("ad.png", createImageInput());

      // Register modules
      processor.registerModule("gay", new GayFilter(resolver));
      processor.registerModule("ad", new AdMontage(resolver));

      // First process with gay filter
      const input = createImageInput();
      const intermediateOutput = await processor.processImage(input, "gay");

      // Then take that output and process with ad montage
      const finalOutput = await processor.processImage(
        intermediateOutput,
        "ad",
      );

      assertExists(finalOutput);
      assertEquals(finalOutput instanceof Buffer, true);
    });
  } finally {
    cleanupTestAssets();
  }
});
