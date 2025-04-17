import { assertEquals, assertExists, assertRejects } from '@std/assert';
import { greyscale } from '../../src/transforms/greyscale.ts';
import { InvalidImageError, ProcessingError } from '../../src/errors.ts';
import { join } from '@std/path/join';
import sharp from 'sharp';

// Mock for validateImagePath to avoid actual file operations
import * as validationUtils from '../../src/validation/utils.ts';

// Create a helper to prepare test image files
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

    // Create test directory and image
    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage);

    try {
        const result = await greyscale({ input: testImage });

        // Verify result is a Uint8Array (image data)
        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);

        // Verify the image is now grayscale by checking metadata
        const metadata = await sharp(result).metadata();
        assertEquals(metadata.channels, 1); // Grayscale has 1 channel
    } finally {
        // Clean up
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('greyscale - propagates validation errors', async () => {
    // Mock validateImagePath using a spy
    const originalValidateImagePath = validationUtils.validateImagePath;
    const mockValidateImagePath = async () => {
        throw new InvalidImageError('Test validation error');
    };

    // Temporarily replace the function
    Object.defineProperty(validationUtils, 'validateImagePath', {
        value: mockValidateImagePath,
        writable: true,
        configurable: true,
    });

    try {
        await assertRejects(
            async () => {
                await greyscale({ input: 'invalid.png' });
            },
            ProcessingError,
            'Failed to apply grayscale transform',
        );
    } finally {
        // Restore original function
        Object.defineProperty(validationUtils, 'validateImagePath', {
            value: originalValidateImagePath,
            writable: true,
            configurable: true,
        });
    }
});

Deno.test('greyscale - handles sharp processing errors', async () => {
    // Mock validateImagePath using a spy
    const originalValidateImagePath = validationUtils.validateImagePath;
    const mockValidateImagePath = async () => {
        return new Uint8Array([0, 1, 2, 3]); // Invalid image data
    };

    // Temporarily replace the function
    Object.defineProperty(validationUtils, 'validateImagePath', {
        value: mockValidateImagePath,
        writable: true,
        configurable: true,
    });

    try {
        await assertRejects(
            async () => {
                await greyscale({ input: 'invalid-data.png' });
            },
            ProcessingError,
            'Failed to apply grayscale transform',
        );
    } finally {
        // Restore original function
        Object.defineProperty(validationUtils, 'validateImagePath', {
            value: originalValidateImagePath,
            writable: true,
            configurable: true,
        });
    }
});
