import {
    assert,
    assertEquals,
    assertInstanceOf,
    assertRejects,
    cleanup,
    getAssetPath,
    setup,
    TestAssets,
} from './_setup.ts';
import { resolveAsset } from '@/utils.ts';
import { InvalidImageError } from '@/errors.ts';

Deno.test({
    name: 'utils tests setup',
    fn: setup,
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test('resolveAsset: should resolve absolute paths to valid images', async () => {
    const testImages = [
        TestAssets.SQUARE_RED,
        TestAssets.CIRCLE,
        TestAssets.CHECKERBOARD,
    ];

    for (const image of testImages) {
        const absolutePath = getAssetPath(image);
        const resolved = await resolveAsset(absolutePath);
        assertEquals(resolved, absolutePath);
    }
});

Deno.test('resolveAsset: should resolve relative paths from base directory', async () => {
    const testImages = [TestAssets.WIDE, TestAssets.TALL, TestAssets.NOISE];

    for (const image of testImages) {
        const resolved = await resolveAsset(image, getAssetPath('.'));
        assertEquals(resolved, getAssetPath(image));
    }
});

Deno.test('resolveAsset: should handle different image formats', async () => {
    // All our generated images are PNG, but test the validation logic
    const pngFiles = [TestAssets.TINY, TestAssets.LARGE];

    for (const file of pngFiles) {
        const resolved = await resolveAsset(getAssetPath(file));
        assert(resolved.endsWith(file));
    }
});

Deno.test('resolveAsset: should validate image format signatures', async () => {
    // Test with a valid PNG
    const validPath = await resolveAsset(getAssetPath(TestAssets.CIRCLE));
    assert(validPath.includes(TestAssets.CIRCLE));
});

Deno.test('resolveAsset: should throw InvalidImageError for various invalid inputs', async () => {
    // Empty or whitespace-only names
    const invalidNames = ['', '   ', '\t', '\n'];
    for (const name of invalidNames) {
        await assertRejects(
            () => resolveAsset(name),
            InvalidImageError,
            'Asset name must be a non-empty string',
        );
    }
});

Deno.test('resolveAsset: should throw InvalidImageError for nonexistent files', async () => {
    const nonexistentFiles = [
        'does_not_exist.png',
        'missing/file.jpg',
        'another_missing_file.gif',
    ];

    for (const file of nonexistentFiles) {
        await assertRejects(
            () => resolveAsset(file),
            InvalidImageError,
            'Asset not found',
        );
    }
});

Deno.test('resolveAsset: should throw InvalidImageError for non-image files', async () => {
    await assertRejects(
        () => resolveAsset(getAssetPath(TestAssets.NOT_IMAGE)),
        InvalidImageError,
        'File does not appear to be a valid image format',
    );
});

Deno.test('resolveAsset: should throw InvalidImageError for fake image files', async () => {
    await assertRejects(
        () => resolveAsset(getAssetPath(TestAssets.FAKE_PNG)),
        InvalidImageError,
        'File does not appear to be a valid image format',
    );
});

Deno.test('resolveAsset: should throw InvalidImageError for empty files', async () => {
    await assertRejects(
        () => resolveAsset(getAssetPath(TestAssets.EMPTY)),
        InvalidImageError,
        'File too small to be a valid image',
    );
});

Deno.test('resolveAsset: should handle directory candidates properly', async () => {
    // Subdirectory exists but is not a file
    await assertRejects(
        () => resolveAsset(getAssetPath('subdirectory')),
        InvalidImageError,
        'Asset not found',
    );
});

Deno.test('resolveAsset: should try multiple candidate paths', async () => {
    // Test that it tries both absolute and relative paths
    const result = await resolveAsset(TestAssets.SQUARE_RED, getAssetPath('.'));
    assertEquals(result, getAssetPath(TestAssets.SQUARE_RED));
});

Deno.test('resolveAsset: should handle complex path scenarios', async () => {
    // Test with different base paths
    const basePaths = ['./', './test_assets', getAssetPath('.')];

    for (const basePath of basePaths) {
        try {
            const result = await resolveAsset(TestAssets.NOISE, basePath);
            assert(result.includes(TestAssets.NOISE));
        } catch (error) {
            assertInstanceOf(error, InvalidImageError);
        }
    }
});

Deno.test({
    name: 'utils tests cleanup',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
