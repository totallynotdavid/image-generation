import { assertEquals, assertRejects } from '@std/assert';
import { Image } from '@matmen/imagescript';
import { color } from '@/transforms/color.ts';
import { ProcessingError } from '@/errors.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from '../_setup.ts';

Deno.test({
    name: 'color tests setup',
    fn: setupTestAssets,
});

Deno.test('color: should apply basic tint', async () => {
    const result = await color({
        input: TestAssets.PATTERN,
        hex: '#0000ff',
        blendMode: 'tint',
        opacity: 0.5, // TODO: seems to be ignored under tint
    });

    const image = await Image.decode(result);
    const [r, g, b, a] = Image.colorToRGBA(image.getPixelAt(10, 10));
    assertEquals([r, g, b, a], [0, 0, 100, 255]);
});

Deno.test('color: applies wash blend mode', async () => {
    const result = await color({
        input: TestAssets.PATTERN,
        hex: '#ffff00',
        blendMode: 'wash',
        opacity: 0.3,
    });

    const image = await Image.decode(result);
    const [r, g, b, a] = Image.colorToRGBA(image.getPixelAt(10, 10));
    assertEquals([r, g, b, a], [111, 111, 35, 255]);
});

Deno.test('color: should apply softlight blend mode', async () => {
    const result = await color({
        input: TestAssets.GRADIENT,
        hex: '#ff8800',
        blendMode: 'softlight',
        opacity: 0.4, // TODO: seems to be ignored by softlight
        intensity: 0.8,
    });

    const image = await Image.decode(result);
    const [r, g, b, a] = Image.colorToRGBA(image.getPixelAt(10, 10));
    assertEquals([r, g, b, a], [56, 7, 76, 255]);
});

Deno.test('color: should use default parameters', async () => {
    const result = await color({
        input: TestAssets.BLUE_SQUARE,
        // defaults to:
        // - blendMode: tint
        // - intensity: 1.0
        // - opacity: 0.3
        // - hex: #ffffff
    });

    const image = await Image.decode(result);
    const [r, g, b, a] = Image.colorToRGBA(image.getPixelAt(10, 10));
    assertEquals([r, g, b, a], [128, 128, 128, 255]);
});

Deno.test('color: should throw error on invalid hex color', async () => {
    await assertRejects(
        () =>
            color({
                input: TestAssets.RED_SQUARE,
                hex: 'invalid',
            }),
        ProcessingError,
        'Invalid hex color',
    );
});

Deno.test('color: should throw error on invalid input', async () => {
    await assertRejects(
        () => color({ input: TestAssets.NONEXISTENT }),
        ProcessingError,
        'Failed to load image',
    );
});

Deno.test({
    name: 'color tests cleanup',
    fn: cleanupTestAssets,
});
