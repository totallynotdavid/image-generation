import { assertEquals, assertRejects } from '@std/assert';
import { GIF } from '@matmen/imagescript';
import { blink } from '@/transforms/blink.ts';
import { ProcessingError } from '@/errors.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from '../_setup.ts';

Deno.test({
    name: 'blink transform tests',
    async fn(t) {
        await setupTestAssets();

        await t.step('creates basic blink animation', async () => {
            const result = await blink({
                inputs: [TestAssets.RED_SQUARE, TestAssets.BLUE_SQUARE],
            });

            const gif = await GIF.decode(result);
            assertEquals(gif.duration, 400); // Default delay is 200ms
            assertEquals(gif[0].bitmap.length, 40000); // 100x100x4 (RGBA)
        });

        await t.step('handles multiple images', async () => {
            const result = await blink({
                inputs: [
                    TestAssets.RED_SQUARE,
                    TestAssets.BLUE_SQUARE,
                    TestAssets.PATTERN,
                ],
                delay: 300,
            });

            const gif = await GIF.decode(result);
            assertEquals(gif.length, 3);
            assertEquals(gif[0].duration, 300);
        });

        await t.step('handles mixed image sizes', async () => {
            const result = await blink({
                inputs: [TestAssets.RED_SQUARE, TestAssets.GREEN_RECTANGLE],
                delay: 150,
            });

            const gif = await GIF.decode(result);
            assertEquals(gif.length, 2);
            assertEquals(gif[0].bitmap.length, 40000);
            assertEquals(gif[1].bitmap.length, 40000);
        });

        await t.step('respects minimum delay', async () => {
            const result = await blink({
                inputs: [TestAssets.RED_SQUARE, TestAssets.BLUE_SQUARE],
                delay: 10,
            });

            const gif = await GIF.decode(result);
            assertEquals(gif[0].duration, 50);
        });

        await t.step('throws on insufficient images', async () => {
            await assertRejects(
                () =>
                    blink({
                        inputs: [TestAssets.RED_SQUARE],
                    }),
                ProcessingError,
                'At least 2 images required',
            );
        });

        await t.step('throws on empty inputs', async () => {
            await assertRejects(
                () =>
                    blink({
                        inputs: [],
                    }),
                ProcessingError,
                'At least 2 images required',
            );
        });

        await cleanupTestAssets();
    },
});
