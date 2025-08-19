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
import { circle } from '@/transforms/circle.ts';
import { ProcessingError } from '@/errors.ts';

Deno.test({
    name: 'circle tests setup',
    fn: setup,
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test('circle: should crop square images to circles', async () => {
    const squareImages = [
        TestAssets.SQUARE_RED,
        TestAssets.SQUARE_GREEN,
        TestAssets.SQUARE_BLUE,
    ];

    for (const image of squareImages) {
        const result = await circle({ input: getAssetPath(image) });
        assertInstanceOf(result, Uint8Array);
        assert(hasPngSignature(result));
    }
});

Deno.test('circle: should handle rectangular images by cropping to smallest dimension', async () => {
    const result1 = await circle({ input: getAssetPath(TestAssets.WIDE) });
    assertInstanceOf(result1, Uint8Array);
    assert(hasPngSignature(result1));

    const result2 = await circle({ input: getAssetPath(TestAssets.TALL) });
    assertInstanceOf(result2, Uint8Array);
    assert(hasPngSignature(result2));
});

Deno.test('circle: should add borders with different widths and colors', async () => {
    const borderConfigs = [
        { borderWidth: 2, borderColor: '#ff0000' },
        { borderWidth: 5, borderColor: '#00ff00' },
        { borderWidth: 10, borderColor: '#0000ff' },
        { borderWidth: 15, borderColor: '#ffff00' },
    ];

    for (const config of borderConfigs) {
        const result = await circle({
            input: getAssetPath(TestAssets.CIRCLE),
            options: config,
        });

        assertInstanceOf(result, Uint8Array);
        assert(hasPngSignature(result));
    }
});

Deno.test('circle: should handle edge cases for border width', async () => {
    // Zero border width
    const result1 = await circle({
        input: getAssetPath(TestAssets.CHECKERBOARD),
        options: { borderWidth: 0 },
    });
    assertInstanceOf(result1, Uint8Array);

    // Negative border width (should clamp to 0)
    const result2 = await circle({
        input: getAssetPath(TestAssets.TINY),
        options: { borderWidth: -5 },
    });
    assertInstanceOf(result2, Uint8Array);
});

Deno.test('circle: should work with different image sizes', async () => {
    const sizes = [TestAssets.TINY, TestAssets.LARGE];

    for (const size of sizes) {
        const result = await circle({
            input: getAssetPath(size),
            options: { borderWidth: 3, borderColor: '#808080' },
        });

        assertInstanceOf(result, Uint8Array);
        assert(hasPngSignature(result));
    }
});

Deno.test('circle: should throw ProcessingError for invalid border colors', async () => {
    const invalidColors = ['invalid-color', 'not-hex', '123456', '#gggggg'];

    for (const borderColor of invalidColors) {
        await assertRejects(
            () =>
                circle({
                    input: getAssetPath(TestAssets.SQUARE_RED),
                    options: { borderWidth: 5, borderColor },
                }),
            ProcessingError,
            'Invalid border color',
        );
    }
});

Deno.test('circle: should throw ProcessingError when border is too large', async () => {
    await assertRejects(
        () =>
            circle({
                input: getAssetPath(TestAssets.TINY), // 10x10 image
                options: { borderWidth: 10 }, // Border too large relative to image
            }),
        ProcessingError,
        'Border width too large for image size',
    );
});

Deno.test('circle: should throw ProcessingError for extremely large borders', async () => {
    await assertRejects(
        () =>
            circle({
                input: getAssetPath(TestAssets.SQUARE_RED),
                options: { borderWidth: 5000 },
            }),
        ProcessingError,
        'Resulting image size too large',
    );
});

Deno.test({
    name: 'circle tests cleanup',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
