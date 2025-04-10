import {
  assertEquals,
  assertExists,
  assertThrows,
  assertRejects
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  cleanupTestAssets,
  createImageInput,
  createTestAssetResolver,
  saveTestAsset,
} from "./test-utils.ts";
import { BlinkGif } from "../src/modules/gif/blink.ts";
import { CircleUtil } from "../src/modules/utils/circle.ts";
import { GayFilter } from "../src/modules/filters/gay.ts";
import { GreyscaleFilter } from "../src/modules/filters/greyscale.ts";
import { InvertFilter } from "../src/modules/filters/invert.ts";
import { SepiaFilter } from "../src/modules/filters/sepia.ts";
import { Buffer } from "node:buffer";

Deno.test("GayFilter", async (t) => {
  try {
    await t.step("should apply gay filter effect", async () => {
      const resolver = createTestAssetResolver();
      // Create gay.png asset
      saveTestAsset("gay.png", createImageInput());

      const filter = new GayFilter(resolver);
      const input = createImageInput();
      const output = await filter.process(input);

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });

    await t.step(
      "should throw error when gay.png asset is missing",
      async () => {
        const resolver = createTestAssetResolver();
        // Intentionally not creating the gay.png asset

        const filter = new GayFilter(resolver);
        const input = createImageInput();

        await assertRejects(
          async () => {
            await filter.process(input);
          },
          Error,
          "Asset not found: gay.png",
        );
      },
    );
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("GreyscaleFilter", async (t) => {
  try {
    await t.step("should apply greyscale effect", async () => {
      const resolver = createTestAssetResolver();
      const filter = new GreyscaleFilter(resolver);

      const input = createImageInput();
      const output = await filter.process(input);

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });

    await t.step("should throw error for invalid input", async () => {
      const resolver = createTestAssetResolver();
      const filter = new GreyscaleFilter(resolver);

      await assertRejects(
        async () => {
          // @ts-ignore - intentionally testing invalid input
          await filter.process(null);
        },
        Error,
        "Invalid image input",
      );

      await assertRejects(
        async () => {
          // @ts-ignore - intentionally testing invalid input
          await filter.process({});
        },
        Error,
        "Invalid image input",
      );
    });
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("InvertFilter", async (t) => {
  try {
    await t.step("should apply invert effect", async () => {
      const resolver = createTestAssetResolver();
      const filter = new InvertFilter(resolver);

      const input = createImageInput();
      const output = await filter.process(input);

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("SepiaFilter", async (t) => {
  try {
    await t.step("should apply sepia effect", async () => {
      const resolver = createTestAssetResolver();
      const filter = new SepiaFilter(resolver);

      const input = createImageInput();
      const output = await filter.process(input);

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("CircleUtil", async (t) => {
  try {
    await t.step("should create circular image", async () => {
      const resolver = createTestAssetResolver();
      const circleUtil = new CircleUtil(resolver);

      const input = createImageInput();
      const output = await circleUtil.process(input);

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });
  } finally {
    cleanupTestAssets();
  }
});

Deno.test("BlinkGif", async (t) => {
  try {
    await t.step(
      "should create blinking gif with multiple images",
      async () => {
        const resolver = createTestAssetResolver();
        const blinkGif = new BlinkGif(resolver);

        // Create an array of 3 test images
        const inputs = [
          createImageInput(),
          createImageInput(),
          createImageInput(),
        ];

        const output = await blinkGif.process(inputs);

        assertExists(output);
        assertEquals(output instanceof Buffer, true);
      },
    );

    await t.step("should throw error with insufficient images", async () => {
      const resolver = createTestAssetResolver();
      const blinkGif = new BlinkGif(resolver);

      // Create array with only 1 image
      const inputs = [createImageInput()];

      await assertRejects(
        async () => {
          await blinkGif.process(inputs);
        },
        Error,
        "At least two images are required",
      );
    });

    await t.step("should create gif with custom delay", async () => {
      const resolver = createTestAssetResolver();
      const blinkGif = new BlinkGif(resolver);

      const inputs = [
        createImageInput(),
        createImageInput(),
        createImageInput(),
      ];

      const output = await blinkGif.process(inputs, 200);

      assertExists(output);
      assertEquals(output instanceof Buffer, true);
    });

    await t.step("should throw error for invalid delay", async () => {
      const resolver = createTestAssetResolver();
      const blinkGif = new BlinkGif(resolver);

      const inputs = [
        createImageInput(),
        createImageInput(),
      ];

      await assertRejects(
        async () => {
          await blinkGif.process(inputs, -50);
        },
        Error,
        "Invalid delay",
      );

      await assertRejects(
        async () => {
          await blinkGif.process(inputs, 0);
        },
        Error,
        "Invalid delay",
      );
    });
  } finally {
    cleanupTestAssets();
  }
});
