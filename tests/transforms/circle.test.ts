import { assertEquals, assertExists, assertRejects } from '@std/assert';
import { circle } from '../../src/transforms/circle.ts';
import { InvalidImageError } from '../../src/errors.ts';
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

Deno.test('circle - successfully creates circle image without border', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    // Create test directory and image
    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage);

    try {
        const result = await circle({
            input: testImage,
            options: {
                borderWidth: 0,
            },
        });

        // Verify result is a Uint8Array (image data)
        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);
    } finally {
        // Clean up
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('circle - successfully creates circle image with border', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    // Create test directory and image
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

        // Verify result is a Uint8Array (image data)
        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);
    } finally {
        // Clean up
        await Deno.remove(testDir, { recursive: true });
    }
});

// Create a mock implementation
const mockValidateImagePath = async () => {
    throw new InvalidImageError('Test validation error');
};

Deno.test('circle - propagates validation errors', async () => {
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
                await circle({
                    input: 'invalid.png',
                    options: {
                        borderWidth: 0,
                    },
                });
            },
            InvalidImageError,
            'Test validation error',
        );
    } finally {
        // Restore original implementation
        Object.defineProperty(validationUtils, 'validateImagePath', {
            value: originalValidateImagePath,
            writable: true,
        });
    }
});
