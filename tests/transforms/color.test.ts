import { assertEquals, assertRejects } from '@std/assert';
import { Image } from '@matmen/imagescript';
import { color } from '@/transforms/color.ts';
import { ProcessingError } from '@/errors.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from '../_setup.ts';

Deno.test({
    name: 'color transform tests',
    async fn(t) {
        await setupTestAssets();

        await t.step('applies basic tint', async () => {
            const result = await color({
                input: TestAssets.RED_SQUARE,
                hex: '#0000ff',
                blendMode: 'tint',
                opacity: 0.5,
            });

            const image = await Image.decode(result);
            assertEquals(image.width, 100);
            assertEquals(image.height, 100);
        });

        await t.step('applies wash blend mode', async () => {
            const result = await color({
                input: TestAssets.PATTERN,
                hex: '#ffff00',
                blendMode: 'wash',
                opacity: 0.3,
            });

            const image = await Image.decode(result);
            assertEquals(image.width, 100);
            assertEquals(image.height, 100);
        });

        await t.step('applies softlight blend mode', async () => {
            const result = await color({
                input: TestAssets.GRADIENT,
                hex: '#ff8800',
                blendMode: 'softlight',
                opacity: 0.4,
                intensity: 0.8,
            });

            const image = await Image.decode(result);
            assertEquals(image.width, 120);
        });

        await t.step('uses default parameters', async () => {
            const result = await color({
                input: TestAssets.BLUE_SQUARE,
            });

            const image = await Image.decode(result);
            assertEquals(image.width, 100);
        });

        await t.step('throws on invalid hex color', async () => {
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

        await t.step('throws on invalid input', async () => {
            await assertRejects(
                () => color({ input: TestAssets.NONEXISTENT }),
                ProcessingError,
                'Failed to load image',
            );
        });

        await cleanupTestAssets();
    },
});
