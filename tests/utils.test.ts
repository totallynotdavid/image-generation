import { assertEquals, assertRejects } from '@std/assert';
import { loadImage, resizeImage } from '@/utils.ts';
import { ProcessingError } from '@/errors.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from './_setup.ts';

Deno.test({
    name: 'utils tests',
    async fn(t) {
        await setupTestAssets();

        await t.step('loadImage - loads from file path', async () => {
            const image = await loadImage(TestAssets.RED_SQUARE);
            assertEquals(image.width, 100);
            assertEquals(image.height, 100);
        });

        await t.step('loadImage - loads from Uint8Array', async () => {
            const buffer = await Deno.readFile(TestAssets.BLUE_SQUARE);
            const image = await loadImage(buffer);
            assertEquals(image.width, 100);
            assertEquals(image.height, 100);
        });

        await t.step('loadImage - throws on invalid file', async () => {
            await assertRejects(
                () => loadImage(TestAssets.NOT_IMAGE),
                ProcessingError,
                'Failed to load image',
            );
        });

        await t.step('loadImage - throws on nonexistent file', async () => {
            await assertRejects(
                () => loadImage(TestAssets.NONEXISTENT),
                ProcessingError,
                'Failed to load image',
            );
        });

        await t.step('resizeImage - resizes with width only', async () => {
            const image = await loadImage(TestAssets.GREEN_RECTANGLE);
            const resized = resizeImage(image, { width: 75 });
            assertEquals(resized.width, 75);
            // height should maintain aspect ratio
            assertEquals(resized.height, 40);
        });

        await t.step('resizeImage - resizes with height only', async () => {
            const image = await loadImage(TestAssets.GREEN_RECTANGLE);
            const resized = resizeImage(image, { height: 40 });
            assertEquals(resized.height, 40);
            assertEquals(resized.width, 75);
        });

        await t.step(
            'resizeImage - returns original when no dimensions',
            async () => {
                const image = await loadImage(TestAssets.RED_SQUARE);
                const resized = resizeImage(image, {});
                assertEquals(resized.width, image.width);
                assertEquals(resized.height, image.height);
            },
        );

        await cleanupTestAssets();
    },
});
