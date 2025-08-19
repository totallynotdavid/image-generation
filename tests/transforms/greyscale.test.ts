import {
    assert,
    assertInstanceOf,
    assertRejects,
    cleanup,
    getAssetPath,
    hasPngSignature,
    setup,
    TestAssets,
} from '../_setup.ts';
import { greyscale } from '@/transforms/greyscale.ts';
import { InvalidImageError } from '@/errors.ts';

Deno.test({
    name: 'greyscale tests setup',
    fn: setup,
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test('greyscale: should convert colored image to grayscale', async () => {
    const result = await greyscale({
        input: getAssetPath(TestAssets.SQUARE_RED),
    });

    assertInstanceOf(result, Uint8Array);
    assert(result.length > 0);
    assert(hasPngSignature(result));
});

Deno.test('greyscale: should handle different image sizes', async () => {
    const testCases = [
        TestAssets.TINY,
        TestAssets.WIDE,
        TestAssets.TALL,
        TestAssets.LARGE,
    ];

    for (const asset of testCases) {
        const result = await greyscale({ input: getAssetPath(asset) });
        assertInstanceOf(result, Uint8Array);
        assert(result.length > 0);
        assert(hasPngSignature(result));
    }
});

Deno.test('greyscale: should handle complex patterns', async () => {
    const testCases = [
        TestAssets.CHECKERBOARD,
        TestAssets.CIRCLE,
        TestAssets.NOISE,
    ];

    for (const asset of testCases) {
        const result = await greyscale({ input: getAssetPath(asset) });
        assertInstanceOf(result, Uint8Array);
        assert(result.length > 0);
        assert(hasPngSignature(result));
    }
});

Deno.test('greyscale: should throw InvalidImageError for nonexistent file', async () => {
    await assertRejects(
        () => greyscale({ input: getAssetPath(TestAssets.NONEXISTENT) }),
        InvalidImageError,
        'Asset not found',
    );
});

Deno.test('greyscale: should throw InvalidImageError for non-image file', async () => {
    await assertRejects(
        () => greyscale({ input: getAssetPath(TestAssets.NOT_IMAGE) }),
        InvalidImageError,
        'File does not appear to be a valid image format',
    );
});

Deno.test({
    name: 'greyscale tests cleanup',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
