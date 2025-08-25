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
        opacity: 0.5,
    });

    const image = await Image.decode(result);
    const [r, g, b, a] = Image.colorToRGBA(image.getPixelAt(10, 10));
    assertEquals([r, g, b, a], [25, 25, 75, 255]);
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
        opacity: 0.4,
        intensity: 0.8,
    });

    const image = await Image.decode(result);
    const [r, g, b, a] = Image.colorToRGBA(image.getPixelAt(10, 10));
    assertEquals([r, g, b, a], [34, 15, 107, 255]);
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
    assertEquals([r, g, b, a], [38, 38, 216, 255]);
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

Deno.test('color: opacity should affect tint blend mode', async () => {
    const highOpacity = await color({
        input: TestAssets.BLUE_SQUARE,
        hex: '#ff0000',
        blendMode: 'tint',
        opacity: 0.5,
    });

    const lowOpacity = await color({
        input: TestAssets.BLUE_SQUARE,
        hex: '#ff0000',
        blendMode: 'tint',
        opacity: 0.45,
    });

    const [r1, g1, b1] = Image.colorToRGBA(
        (await Image.decode(highOpacity)).getPixelAt(50, 50),
    );
    const [r2, g2, b2] = Image.colorToRGBA(
        (await Image.decode(lowOpacity)).getPixelAt(50, 50),
    );

    assertEquals(
        r1 !== r2 || g1 !== g2 || b1 !== b2,
        true,
        'Opacity should affect tint results',
    );
});

Deno.test('color: opacity should affect softlight blend mode', async () => {
    const highOpacity = await color({
        input: TestAssets.GRADIENT,
        hex: '#ff0000',
        blendMode: 'softlight',
        opacity: 0.5,
    });

    const lowOpacity = await color({
        input: TestAssets.GRADIENT,
        hex: '#ff0000',
        blendMode: 'softlight',
        opacity: 0.3,
    });

    const [r1, g1, b1] = Image.colorToRGBA(
        (await Image.decode(highOpacity)).getPixelAt(50, 50),
    );
    const [r2, g2, b2] = Image.colorToRGBA(
        (await Image.decode(lowOpacity)).getPixelAt(50, 50),
    );

    assertEquals(
        r1 !== r2 || g1 !== g2 || b1 !== b2,
        true,
        'Opacity should affect softlight results',
    );
});

Deno.test({
    name: 'color tests cleanup',
    fn: cleanupTestAssets,
});
