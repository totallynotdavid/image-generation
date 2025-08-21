import { assertEquals, assertRejects } from '@std/assert';
import { Image } from '@matmen/imagescript';
import { greyscale } from '@/transforms/greyscale.ts';
import { ProcessingError } from '@/errors.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from '../_setup.ts';

Deno.test({
    name: 'greyscale transform tests',
    async fn(t) {
        await setupTestAssets();

        await t.step('converts colored image to greyscale', async () => {
            const result = await greyscale({ input: TestAssets.RED_SQUARE });

            const image = await Image.decode(result);
            assertEquals(image.width, 100);
            assertEquals(image.height, 100);

            const [r, g, b] = image.getRGBAAt(50, 50);
            assertEquals(r, g);
            assertEquals(g, b);
        });

        await t.step('works with different image formats', async () => {
            const result = await greyscale({ input: TestAssets.GRADIENT });
            const image = await Image.decode(result);
            assertEquals(image.width, 120);
            assertEquals(image.height, 120);
        });

        await t.step('works with Uint8Array input', async () => {
            const buffer = await Deno.readFile(TestAssets.BLUE_SQUARE);
            const result = await greyscale({ input: buffer });
            const image = await Image.decode(result);
            assertEquals(image.width, 100);
        });

        await t.step('throws on invalid input', async () => {
            await assertRejects(
                () => greyscale({ input: TestAssets.NOT_IMAGE }),
                ProcessingError,
                'Failed to load image',
            );
        });

        await cleanupTestAssets();
    },
});
