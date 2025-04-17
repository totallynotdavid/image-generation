import { assertEquals, assertExists, assertRejects } from 'jsr:@std/assert';
import { join } from 'jsr:@std/path/join';
import { ProcessingError } from '@/errors.ts';
import { blink } from '@/transforms/blink.ts';
import sharp from 'npm:sharp';

async function createTestImage(
    path: string,
    color: { r: number; g: number; b: number },
): Promise<void> {
    const imageBuffer = await sharp({
        create: {
            width: 10,
            height: 10,
            channels: 4,
            background: { ...color, alpha: 1 },
        },
    }).png().toBuffer();

    await Deno.writeFile(path, imageBuffer);
}

Deno.test('blink - successfully creates animated GIF', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage1 = join(testDir, 'test1.png');
    const testImage2 = join(testDir, 'test2.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage1, { r: 0, g: 0, b: 0 }); // Black
    await createTestImage(testImage2, { r: 255, g: 255, b: 255 }); // White

    try {
        const result = await blink({
            inputs: [testImage1, testImage2],
            options: {
                delay: 200,
                loop: true,
            },
        });

        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);

        assertEquals(result[0], 0x47); // G
        assertEquals(result[1], 0x49); // I
        assertEquals(result[2], 0x46); // F
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('blink - handles custom delay and non-looping options', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage1 = join(testDir, 'test1.png');
    const testImage2 = join(testDir, 'test2.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage1, { r: 255, g: 0, b: 0 }); // Red
    await createTestImage(testImage2, { r: 0, g: 0, b: 255 }); // Blue

    try {
        const result = await blink({
            inputs: [testImage1, testImage2],
            options: {
                delay: 500, // Longer delay
                loop: false, // No loop
            },
        });

        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('blink - propagates validation errors', async () => {
    await assertRejects(
        async () => {
            await blink({
                inputs: ['invalid1.png', 'invalid2.png'],
                options: {
                    delay: 200,
                    loop: true,
                },
            });
        },
        ProcessingError,
        'Failed to create animated GIF',
    );
});
