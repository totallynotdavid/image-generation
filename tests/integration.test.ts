import { assertEquals } from '@std/assert';
import { GIF, Image } from '@matmen/imagescript';
import { blink, circle, color, greyscale } from '@/index.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from './_setup.ts';

Deno.test({
    name: 'integration tests setup',
    fn: setupTestAssets,
});

Deno.test('integration: should chain transforms (color -> greyscale)', async () => {
    const colorResult = await color({
        input: TestAssets.RED_SQUARE,
        hex: '#00ff00',
        opacity: 0.5,
    });
    const coloredImage = await Image.decode(colorResult);

    const [r1, g1, b1, a1] = coloredImage.getRGBAAt(50, 50);
    assertEquals([r1, g1, b1, a1], [127, 127, 0, 255]);

    // second transform: greyscale
    const greyResult = await greyscale({ input: colorResult });
    const greyImage = await Image.decode(greyResult);

    assertEquals(greyImage.width, 100);
    const [r2, g2, b2, a2] = greyImage.getRGBAAt(50, 50);
    assertEquals([r2, g2, b2, a2], [63, 63, 63, 255]);
});

Deno.test('integration: should chain transforms (circle -> color)', async () => {
    const circleResult = await circle({
        input: TestAssets.PATTERN, // 100x100
        borderWidth: 5,
        borderColor: '#ff0000',
    });

    const circleImage = await Image.decode(circleResult);
    const [r1, g1, b1, a1] = circleImage.getRGBAAt(50, 50);
    assertEquals([r1, g1, b1, a1], [200, 200, 200, 255]);

    // second transform: apply blue wash color overlay
    const colorResult = await color({
        input: circleResult,
        hex: '#0000ff',
        blendMode: 'wash',
        opacity: 0.3,
    });

    const coloredImage = await Image.decode(colorResult);
    const [r2, g2, b2, a2] = coloredImage.getRGBAAt(50, 50);
    assertEquals([r2, g2, b2, a2], [140, 140, 216, 255]);
});

Deno.test('integration: should create blink from processed images', async () => {
    const redCircle = await circle({
        input: TestAssets.RED_SQUARE,
        borderWidth: 3,
    });

    const blueGrey = await greyscale({
        input: TestAssets.BLUE_SQUARE,
    });

    const tintedPattern = await color({
        input: TestAssets.PATTERN,
        hex: '#ff8800',
        opacity: 0.4,
    });

    const blinkResult = await blink({
        inputs: [redCircle, blueGrey, tintedPattern],
        delay: 200,
    });

    const gif = await GIF.decode(blinkResult);
    assertEquals(gif.length, 3);
});

Deno.test({
    name: 'integration tests cleanup',
    fn: cleanupTestAssets,
});
