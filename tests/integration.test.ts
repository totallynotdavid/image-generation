import { assertEquals } from '@std/assert';
import { GIF, Image } from '@matmen/imagescript';
import { blink, circle, color, greyscale } from '@/index.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from './_setup.ts';

Deno.test({
    name: 'integration tests',
    async fn(t) {
        await setupTestAssets();

        await t.step('chain transforms: color then greyscale', async () => {
            const colorResult = await color({
                input: TestAssets.RED_SQUARE,
                hex: '#00ff00',
                opacity: 0.5,
            });

            const greyResult = await greyscale({ input: colorResult });

            const image = await Image.decode(greyResult);
            assertEquals(image.width, 100);

            const [r, g, b] = image.getRGBAAt(50, 50);
            assertEquals(r, g);
            assertEquals(g, b);
        });

        await t.step('chain transforms: circle then color', async () => {
            const circleResult = await circle({
                input: TestAssets.PATTERN,
                borderWidth: 5,
                borderColor: '#ff0000',
            });

            const colorResult = await color({
                input: circleResult,
                hex: '#0000ff',
                blendMode: 'wash',
                opacity: 0.3,
            });

            const image = await Image.decode(colorResult);
            assertEquals(image.width, 110); // 100 + 2*5
        });

        await t.step('create blink from processed images', async () => {
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

        await cleanupTestAssets();
    },
});
