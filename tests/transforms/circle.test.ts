import { assertEquals, assertExists, assertRejects } from 'jsr:@std/assert';
import { join } from 'jsr:@std/path/join';
import { circle } from '@/transforms/circle.ts';
import { InvalidImageError } from '@/errors.ts';
import sharp from 'npm:sharp';

async function createTestImage(path: string): Promise<void> {
    // Create a simple 10x10 black PNG
    const imageBuffer = await sharp({
        create: {
            width: 10,
            height: 10,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 },
        },
    }).png().toBuffer();

    await Deno.writeFile(path, imageBuffer);
}

Deno.test('circle - successfully creates circle image without border', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage);

    try {
        const result = await circle({
            input: testImage,
            options: {
                borderWidth: 0,
            },
        });

        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('circle - successfully creates circle image with border', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage);

    try {
        const result = await circle({
            input: testImage,
            options: {
                borderWidth: 2,
                borderColor: '#ff0000', // Red border
            },
        });

        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('circle - propagates validation errors', async () => {
    await assertRejects(
        async () => {
            await circle({
                input: 'invalid.png',
                options: {
                    borderWidth: 0,
                },
            });
        },
        InvalidImageError,
        '[INVALID_IMAGE] File not found: invalid.png',
    );
});
