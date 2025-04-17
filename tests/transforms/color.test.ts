import { assertEquals, assertExists, assertRejects } from '@std/assert';
import { color } from '../../src/transforms/color.ts';
import { InvalidHexError, ProcessingError } from '../../src/errors.ts';
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

Deno.test('color - successfully applies overlay color transform', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    // Create test directory and image
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

        // Verify result is a Uint8Array (image data)
        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);
    } finally {
        // Clean up
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('color - successfully applies softlight color transform', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    // Create test directory and image
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

        // Verify result is a Uint8Array (image data)
        assertExists(result);
        assertEquals(result instanceof Uint8Array, true);
    } finally {
        // Clean up
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('color - throws with unsupported blend mode', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    // Create test directory and image
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
        // Clean up
        await Deno.remove(testDir, { recursive: true });
    }
});

// Create a mock implementation
const mockValidateHex = () => {
    throw new InvalidHexError('invalid');
};

Deno.test('color - propagates hex validation errors', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testImage = join(testDir, 'test.png');

    // Create test directory and image
    await Deno.mkdir(testDir, { recursive: true });
    await createTestImage(testImage);

    // Store original implementation
    const originalValidateHex = validationUtils.validateHex;

    // Create a new object with the mock implementation
    const mockedUtils = {
        ...validationUtils,
        validateHex: mockValidateHex,
    };

    // Replace the imported module with our mocked version
    Object.defineProperty(validationUtils, 'validateHex', {
        value: mockValidateHex,
        writable: true,
    });

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
        // Restore original implementation
        Object.defineProperty(validationUtils, 'validateHex', {
            value: originalValidateHex,
            writable: true,
        });

        // Clean up
        await Deno.remove(testDir, { recursive: true });
    }
});
