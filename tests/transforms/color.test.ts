import { join } from 'jsr:@std/path@1.0.8';
import {
    assertEquals,
    assertExists,
    assertRejects,
} from 'jsr:@std/assert@1.0.12';
import { color } from '@/transforms/color.ts';
import { ProcessingError } from '@/errors.ts';
import sharp from 'npm:sharp@0.34.1';

async function createTestImage(path: string): Promise<void> {
    // Create a simple 10x10 black PNG
    const imageBuffer = await sharp({
        create: {
            width: 10,
            height: 10,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 },
        },
    })
        .png()
        .toBuffer();

    await Deno.writeFile(path, imageBuffer);
}

Deno.test('color - successfully applies overlay color transform', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage);

    try {
        const result = await color({
            input: testImage,
            options: {
                hex: '#ff0000', // Red
                blendMode: 'overlay',
            },
        });

        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test(
    'color - successfully applies softlight color transform',
    async () => {
        const testDir = join(Deno.cwd(), 'test-images');
        const testImage = join(testDir, 'test.png');

        await Deno.mkdir(testDir, { recursive: true });
        await createTestImage(testImage);

        try {
            const result = await color({
                input: testImage,
                options: {
                    hex: '#00ff00', // Green
                    blendMode: 'softlight',
                },
            });

            assertExists(result);
            assertEquals(result instanceof Uint8Array, true);
        } finally {
            await Deno.remove(testDir, { recursive: true });
        }
    },
);

Deno.test('color - throws with unsupported blend mode', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage);

    try {
        await assertRejects(
            async () => {
                await color({
                    input: testImage,
                    options: {
                        hex: '#0000ff', // Blue
                        blendMode: 'unsupported' as 'overlay' | 'softlight',
                    },
                });
            },
            ProcessingError,
            'Failed to apply color transform',
        );
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('color - propagates hex validation errors', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage);

    try {
        await assertRejects(
            async () => {
                await color({
                    input: testImage,
                    options: {
                        hex: 'invalid', // Invalid hex color
                    },
                });
            },
            ProcessingError,
            'Failed to apply color transform',
        );
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});
