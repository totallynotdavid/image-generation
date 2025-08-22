import { assert, assertEquals, assertRejects } from '@std/assert';
import { GIF } from '@matmen/imagescript';
import { blink } from '@/transforms/blink.ts';
import { ProcessingError } from '@/errors.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from '../_setup.ts';

Deno.test({
    name: 'blink tests setup',
    fn: setupTestAssets,
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test('blink: should create basic blink animation', async () => {
    const result = await blink({
        inputs: [TestAssets.RED_SQUARE, TestAssets.BLUE_SQUARE],
    });

    const gif = await GIF.decode(result);
    assertEquals(gif.length, 2); // amount of frames, which is 2 in this case
    assertEquals(gif.duration, 400); // default is 200ms
    assertEquals(gif[0].bitmap.length, 40000); // 100x100x4 (RGBA)
});

Deno.test('blink: should handle multiple images', async () => {
    const result = await blink({
        inputs: [
            TestAssets.RED_SQUARE, // 100x100
            TestAssets.BLUE_SQUARE, // 100x100
            TestAssets.PATTERN, // 100x100
        ],
        delay: 300,
    });

    const gif = await GIF.decode(result);
    assertEquals(gif.length, 3);
    assertEquals(gif[0].duration, 300);
    assertEquals(gif[0].bitmap.length, 40000);
});

Deno.test('blink: should handle mixed image sizes', async () => {
    const result = await blink({
        inputs: [
            TestAssets.RED_SQUARE, // 100x100
            TestAssets.GREEN_RECTANGLE, // 150x80
        ],
        delay: 150,
    });

    const gif = await GIF.decode(result);
    assertEquals(gif.length, 2);

    // blink() normalizes all images to match the first image's dimensions
    // in case of mixed sizes.
    assertEquals(gif.height, 100);
    assertEquals(gif.width, 100);

    // Since we passed two images, two objects should be generated.
    assertEquals(gif[0].bitmap.length, 40000);
    assertEquals(gif[1].bitmap.length, 40000);
});

Deno.test('blink: respects minimum delay', async () => {
    const result = await blink({
        inputs: [TestAssets.RED_SQUARE, TestAssets.BLUE_SQUARE],
        delay: 10, // blink() enforces a minimum of 50ms
    });

    const gif = await GIF.decode(result);
    assertEquals(gif[0].duration, 50);
});

Deno.test('blink: throws on insufficient images', async () => {
    await assertRejects(
        () =>
            blink({
                inputs: [TestAssets.RED_SQUARE],
            }),
        ProcessingError,
        'At least 2 images required',
    );
});

Deno.test('blink: throws on empty inputs', async () => {
    await assertRejects(
        () =>
            blink({
                inputs: [],
            }),
        ProcessingError,
        'At least 2 images required',
    );
});

Deno.test({
    name: 'blink tests cleanup',
    fn: cleanupTestAssets,
    sanitizeResources: false,
    sanitizeOps: false,
});
