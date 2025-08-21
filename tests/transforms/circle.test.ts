import { assertEquals, assertRejects } from '@std/assert';
import { Image } from '@matmen/imagescript';
import { circle } from '@/transforms/circle.ts';
import { ProcessingError } from '@/errors.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from '../_setup.ts';

Deno.test({
    name: 'circle transform tests',
    async fn(t) {
        await setupTestAssets();

        await t.step('creates basic circle', async () => {
            const result = await circle({
                input: TestAssets.RED_SQUARE,
            });

            const image = await Image.decode(result);
            assertEquals(image.width, 100);
            assertEquals(image.height, 100);
        });

        await t.step('creates circle with border', async () => {
            const result = await circle({
                input: TestAssets.BLUE_SQUARE,
                borderWidth: 10,
                borderColor: '#ffffff',
            });

            const image = await Image.decode(result);
            assertEquals(image.width, 120); // 100 + 2*10
            assertEquals(image.height, 120);
        });

        await t.step('handles rectangular image', async () => {
            const result = await circle({
                input: TestAssets.GREEN_RECTANGLE,
                borderWidth: 5,
            });

            const image = await Image.decode(result);
            // should use smallest dimension (80) + border
            assertEquals(image.width, 90);
            assertEquals(image.height, 90);
        });

        await t.step('works with tiny images', async () => {
            const result = await circle({
                input: TestAssets.TINY,
                borderWidth: 2,
                borderColor: '#ff0000',
            });

            const image = await Image.decode(result);
            assertEquals(image.width, 24); // 20 + 2*2
        });

        await t.step(
            'should throw ProcessingError for invalid border color',
            async () => {
                const invalidBorderCall = async () => {
                    return circle({
                        input: TestAssets.RED_SQUARE,
                        borderColor: 'invalid',
                        borderWidth: 5,
                    });
                };

                await assertRejects(
                    invalidBorderCall,
                    ProcessingError,
                    'Invalid border color',
                );
            },
        );

        await t.step('throws on excessive border width', async () => {
            await assertRejects(
                () =>
                    circle({
                        input: TestAssets.TINY,
                        borderWidth: 15, // too large for 20px image
                    }),
                ProcessingError,
                'Border width too large',
            );
        });

        await cleanupTestAssets();
    },
});
