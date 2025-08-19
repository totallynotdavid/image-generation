import {
    assert,
    assertInstanceOf,
    assertRejects,
    cleanup,
    getAssetPath,
    hasGifSignature,
    setup,
    TestAssets,
} from '../_setup.ts';
import { blink } from '@/transforms/blink.ts';
import { InvalidImageError, ProcessingError } from '@/errors.ts';

Deno.test({
    name: 'blink tests setup',
    fn: setup,
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test('blink: should create GIF from same-sized images', async () => {
    const result = await blink({
        inputs: [
            getAssetPath(TestAssets.SQUARE_RED),
            getAssetPath(TestAssets.SQUARE_GREEN),
            getAssetPath(TestAssets.SQUARE_BLUE),
        ],
    });

    assertInstanceOf(result, Uint8Array);
    assert(result.length > 0);
    assert(hasGifSignature(result));
});

Deno.test('blink: should handle images of different sizes by resizing', async () => {
    const result = await blink({
        inputs: [
            getAssetPath(TestAssets.WIDE), // 200x100
            getAssetPath(TestAssets.TALL), // 100x200
            getAssetPath(TestAssets.TINY), // 10x10
            getAssetPath(TestAssets.CIRCLE), // 120x120
        ],
    });

    assertInstanceOf(result, Uint8Array);
    assert(hasGifSignature(result));
});

Deno.test('blink: should work with different pattern types', async () => {
    const result = await blink({
        inputs: [
            getAssetPath(TestAssets.CHECKERBOARD),
            getAssetPath(TestAssets.NOISE),
            getAssetPath(TestAssets.CIRCLE),
        ],
    });

    assertInstanceOf(result, Uint8Array);
    assert(hasGifSignature(result));
});

Deno.test('blink: should handle minimum case (2 images)', async () => {
    const result = await blink({
        inputs: [
            getAssetPath(TestAssets.SQUARE_RED),
            getAssetPath(TestAssets.SQUARE_GREEN),
        ],
    });

    assertInstanceOf(result, Uint8Array);
    assert(hasGifSignature(result));
});

Deno.test('blink: should respect timing options', async () => {
    const delays = [50, 100, 200, 500, 1000];

    for (const delay of delays) {
        const result = await blink({
            inputs: [
                getAssetPath(TestAssets.SQUARE_RED),
                getAssetPath(TestAssets.SQUARE_BLUE),
            ],
            options: { delay },
        });

        assertInstanceOf(result, Uint8Array);
        assert(hasGifSignature(result));
    }
});

Deno.test('blink: should handle loop options', async () => {
    // Test looping enabled
    const result1 = await blink({
        inputs: [
            getAssetPath(TestAssets.CIRCLE),
            getAssetPath(TestAssets.CHECKERBOARD),
        ],
        options: { loop: true },
    });
    assertInstanceOf(result1, Uint8Array);
    assert(hasGifSignature(result1));

    // Test looping disabled
    const result2 = await blink({
        inputs: [
            getAssetPath(TestAssets.NOISE),
            getAssetPath(TestAssets.WIDE),
        ],
        options: { loop: false },
    });
    assertInstanceOf(result2, Uint8Array);
    assert(hasGifSignature(result2));
});

Deno.test('blink: should clamp negative delay to zero', async () => {
    const result = await blink({
        inputs: [
            getAssetPath(TestAssets.TINY),
            getAssetPath(TestAssets.LARGE),
        ],
        options: { delay: -100 },
    });

    assertInstanceOf(result, Uint8Array);
    assert(hasGifSignature(result));
});

Deno.test('blink: should throw ProcessingError for insufficient images', async () => {
    // Test with no images
    await assertRejects(
        () => blink({ inputs: [] }),
        ProcessingError,
        'At least 2 images required for blink animation',
    );

    // Test with only one image
    await assertRejects(
        () => blink({ inputs: [getAssetPath(TestAssets.SQUARE_RED)] }),
        ProcessingError,
        'At least 2 images required for blink animation',
    );
});

Deno.test('blink: should throw InvalidImageError for nonexistent files', async () => {
    await assertRejects(
        () =>
            blink({
                inputs: [
                    getAssetPath(TestAssets.SQUARE_RED),
                    getAssetPath(TestAssets.NONEXISTENT),
                ],
            }),
        InvalidImageError,
        'Asset not found',
    );
});

Deno.test('blink: should throw InvalidImageError for invalid image files', async () => {
    await assertRejects(
        () =>
            blink({
                inputs: [
                    getAssetPath(TestAssets.SQUARE_GREEN),
                    getAssetPath(TestAssets.NOT_IMAGE),
                ],
            }),
        InvalidImageError,
        'File does not appear to be a valid image format',
    );
});

Deno.test({
    name: 'blink tests cleanup',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
