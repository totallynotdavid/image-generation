import { assertEquals, assertRejects } from '@std/assert';
import { Image } from '@matmen/imagescript';
import { circle } from '@/transforms/circle.ts';
import { ProcessingError } from '@/errors.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from '../_setup.ts';

Deno.test({
    name: 'circle tests setup',
    fn: setupTestAssets,
});

Deno.test('circle: should create basic circle', async () => {
    const result = await circle({
        input: TestAssets.RED_SQUARE,
    });

    const image = await Image.decode(result);
    assertEquals(image.width, 100);
    assertEquals(image.height, 100);
});

Deno.test('circle: should create circle with border', async () => {
    const result = await circle({
        input: TestAssets.BLUE_SQUARE,
        borderWidth: 10,
        borderColor: '#ffffff',
    });

    const image = await Image.decode(result);

    // BLUE_SQUARE + 2 * borderWith, where BLUE_SQUARE is 100x100
    assertEquals(image.width, 120);
    assertEquals(image.height, 120);
});

Deno.test('circle: should handle rectangular image', async () => {
    const result = await circle({
        input: TestAssets.GREEN_RECTANGLE,
        borderWidth: 5,
    });

    const image = await Image.decode(result);

    // GREEN_RECTANGLE + 2 * borderWidth, where GREEN_RECTANGLE is 150x80
    // circle() picks the smallest dimension for the transformation
    assertEquals(image.width, 90);
    assertEquals(image.height, 90);
});

Deno.test('circle: should work with tiny images', async () => {
    const result = await circle({
        input: TestAssets.TINY,
        borderWidth: 2,
        borderColor: '#ff0000',
    });

    const image = await Image.decode(result);
    // TINY + 2 * borderWidth, where TINY is 20x20
    assertEquals(image.width, 24);
});

Deno.test('circle: should throw ProcessingError for invalid border color', async () => {
    const invalidBorderCall = async () => {
        return circle({
            input: TestAssets.RED_SQUARE,
            borderColor: 'invalid',
            // NOTE: borderWidth must be specified here.
            // If borderWidth = 0 (or omitted), the function skips border handling entirely,
            // so borderColor would never be validated. Setting borderWidth > 0 ensures
            // that the invalid color check is triggered.
            borderWidth: 5,
        });
    };

    await assertRejects(
        invalidBorderCall,
        ProcessingError,
        'Invalid border color',
    );
});

Deno.test('circle: should throws on excessive border width', async () => {
    await assertRejects(
        () =>
            circle({
                input: TestAssets.TINY, // size: 20x20
                // Rule (createCircleWithBorder): borderWidth must be <= size / 2
                // For 20px, the maximum allowed border is any value < 10
                borderWidth: 15,
            }),
        ProcessingError,
        'Border width too large',
    );
});

Deno.test({
    name: 'circle tests cleanup',
    fn: cleanupTestAssets,
});
