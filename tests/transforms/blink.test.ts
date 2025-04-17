import { assertEquals, assertExists, assertRejects } from '@std/assert';
import { blink } from '../../src/transforms/blink.ts';
import { ProcessingError } from '../../src/errors.ts';
import { join } from '@std/path/join';
import sharp from 'sharp';
import GIFEncoder from 'gifencoder';

// Mock for validateImagePath to avoid actual file operations
import * as validationUtils from '../../src/validation/utils.ts';

// Create a helper to prepare test image files
async function createTestImage(
    path: string,
    color: { r: number; g: number; b: number },
): Promise<void> {
    // Create a simple 10x10 colored PNG
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

    // Create test directory and images
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

        // Verify result is a Uint8Array (GIF data)
        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);

        // Check if it starts with GIF header (GIF89a)
        assertEquals(result[0], 0x47); // G
        assertEquals(result[1], 0x49); // I
        assertEquals(result[2], 0x46); // F
    } finally {
        // Clean up
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('blink - handles custom delay and non-looping options', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage1 = join(testDir, 'test1.png');
    const testImage2 = join(testDir, 'test2.png');

    // Create test directory and images
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

        // Verify result is a Uint8Array (GIF data)
        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);
    } finally {
        // Clean up
        await Deno.remove(testDir, { recursive: true });
    }
});

// Create a mock implementation
const mockValidateImagePath = async () => {
    throw new Error('Test validation error');
};

Deno.test('blink - propagates validation errors', async () => {
    // Store original implementation
    const originalValidateImagePath = validationUtils.validateImagePath;

    // Create a new object with the mock implementation
    const mockedUtils = {
        ...validationUtils,
        validateImagePath: mockValidateImagePath,
    };

    // Replace the imported module with our mocked version
    Object.defineProperty(validationUtils, 'validateImagePath', {
        value: mockValidateImagePath,
        writable: true,
    });

    try {
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
    } finally {
        // Restore original implementation
        Object.defineProperty(validationUtils, 'validateImagePath', {
            value: originalValidateImagePath,
            writable: true,
        });
    }
});
