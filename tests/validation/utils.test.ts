import { join } from 'jsr:@std/path@1.0.8';
import {
    assertEquals,
    assertRejects,
    assertThrows,
} from 'jsr:@std/assert@1.0.12';
import {
    parseHexColor,
    validateHex,
    validateImagePath,
} from '@/validation/utils.ts';
import { InvalidHexError, InvalidImageError } from '@/errors.ts';

Deno.test('validateHex - accepts valid hex colors', () => {
    // Test valid 3-character hex
    validateHex('#abc');

    // Test valid 6-character hex
    validateHex('#abcdef');

    // Test valid uppercase hex
    validateHex('#ABCDEF');

    // Test mixed case hex
    validateHex('#aBcDeF');
});

Deno.test('validateHex - throws on invalid hex colors', () => {
    // Test without #
    assertThrows(
        () => validateHex('abc'),
        InvalidHexError,
        'Invalid hex color value',
    );

    // Test wrong length
    assertThrows(
        () => validateHex('#ab'),
        InvalidHexError,
        'Invalid hex color value',
    );

    // Test invalid characters
    assertThrows(
        () => validateHex('#xyz'),
        InvalidHexError,
        'Invalid hex color value',
    );

    // Test too long
    assertThrows(
        () => validateHex('#abcdefg'),
        InvalidHexError,
        'Invalid hex color value',
    );
});

Deno.test('parseHexColor - converts 3-char hex to RGB', () => {
    const result = parseHexColor('#abc');
    assertEquals(result, {
        r: 170, // aa in hex
        g: 187, // bb in hex
        b: 204, // cc in hex
    });
});

Deno.test('parseHexColor - converts 6-char hex to RGB', () => {
    const result = parseHexColor('#123456');
    assertEquals(result, {
        r: 18, // 12 in hex
        g: 52, // 34 in hex
        b: 86, // 56 in hex
    });
});

Deno.test('parseHexColor - validates hex before parsing', () => {
    assertThrows(
        () => parseHexColor('invalid'),
        InvalidHexError,
        'Invalid hex color value',
    );
});

Deno.test('validateImagePath - accepts valid image files', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const pngFile = join(testDir, 'test.png');
    const jpegFile = join(testDir, 'test.jpg');
    const gifFile = join(testDir, 'test.gif');

    await Deno.mkdir(testDir, { recursive: true });

    try {
        // Create a valid PNG file
        await Deno.writeFile(
            pngFile,
            new Uint8Array([
                0x89,
                0x50,
                0x4e,
                0x47, // PNG signature
                0x0d,
                0x0a,
                0x1a,
                0x0a,
                0x00,
                0x00,
                0x00,
                0x0d,
            ]),
        );

        // Create a valid JPEG file
        await Deno.writeFile(
            jpegFile,
            new Uint8Array([
                0xff,
                0xd8, // JPEG signature
                0xff,
                0xe0,
                0x00,
                0x10,
                0x4a,
                0x46,
            ]),
        );

        // Create a valid GIF file
        await Deno.writeFile(
            gifFile,
            new Uint8Array([
                0x47,
                0x49,
                0x46,
                0x38, // GIF signature
                0x39,
                0x61,
                0x0a,
                0x00,
                0x0a,
                0x00,
            ]),
        );

        // These should not throw
        const pngResult = await validateImagePath(pngFile);
        const jpegResult = await validateImagePath(jpegFile);
        const gifResult = await validateImagePath(gifFile);

        assertEquals(pngResult instanceof Uint8Array, true);
        assertEquals(jpegResult instanceof Uint8Array, true);
        assertEquals(gifResult instanceof Uint8Array, true);
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('validateImagePath - rejects non-existent files', async () => {
    await assertRejects(
        async () => {
            await validateImagePath('nonexistent.png');
        },
        InvalidImageError,
        'File not found',
    );
});

Deno.test('validateImagePath - rejects invalid image formats', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const invalidFile = join(testDir, 'invalid.png');

    await Deno.mkdir(testDir, { recursive: true });

    try {
        // Create an "image" file with invalid header
        await Deno.writeFile(
            invalidFile,
            new Uint8Array([0x00, 0x01, 0x02, 0x03]),
        );

        await assertRejects(
            async () => {
                await validateImagePath(invalidFile);
            },
            InvalidImageError,
            'File does not appear to be a valid image',
        );
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('validateImagePath - rejects files that are too small', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const tinyFile = join(testDir, 'tiny.png');

    await Deno.mkdir(testDir, { recursive: true });

    try {
        // Create a file that's too small to be an image
        await Deno.writeFile(tinyFile, new Uint8Array([0x01, 0x02, 0x03]));

        await assertRejects(
            async () => {
                await validateImagePath(tinyFile);
            },
            InvalidImageError,
            'File too small to be a valid image',
        );
    } finally {
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('validateImagePath - handles file read errors', async () => {
    const testDir = join(Deno.cwd(), 'test-images');
    const testFile = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await Deno.writeFile(testFile, new Uint8Array([0x89, 0x50, 0x4e, 0x47]));

    const originalReadFile = Deno.readFile;
    Deno.readFile = async () => {
        throw new Error('Permission denied');
    };

    try {
        await assertRejects(
            async () => {
                await validateImagePath(testFile);
            },
            InvalidImageError,
            'Failed to read image from path',
        );
    } finally {
        Deno.readFile = originalReadFile;

        await Deno.remove(testDir, { recursive: true });
    }
});
