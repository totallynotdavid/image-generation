import { assertEquals, assertExists, assertRejects } from 'jsr:@std/assert';
import { join } from 'jsr:@std/path/join';
import { greyscale } from '../../src/transforms/greyscale.ts';
import { ProcessingError } from '../../src/errors.ts';
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

Deno.test('greyscale - successfully converts image to greyscale', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage);

    try {
        const result = await greyscale({ input: testImage });

        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);

        const rawBuffer = await sharp(result).raw().toBuffer();
        const pixelData = new Uint8Array(rawBuffer);

        for (let i = 0; i < pixelData.length; i += 4) {
            const r = pixelData[i];
            const g = pixelData[i + 1];
            const b = pixelData[i + 2];
            assertEquals(
                r,
                g,
                'Red and green channels should be equal in grayscale',
            );
            assertEquals(
                g,
                b,
                'Green and blue channels should be equal in grayscale',
            );
        }
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('greyscale - propagates validation errors', async () => {
    await assertRejects(
        async () => {
            await greyscale({ input: 'invalid.png' });
        },
        ProcessingError,
        'Failed to apply grayscale transform: [INVALID_IMAGE] File not found: invalid.png',
    );
});

Deno.test('greyscale - handles sharp processing errors', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await Deno.writeFile(testImage, new Uint8Array([0, 1, 2, 3]));

    try {
        await assertRejects(
            async () => {
                await greyscale({ input: testImage });
            },
            ProcessingError,
            'Failed to apply grayscale transform',
        );
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});
