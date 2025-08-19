import {
    assert,
    assertEquals,
    assertRejects,
    cleanup,
    getAssetPath,
    setup,
} from './_setup.ts';
import { resolveAsset } from '@/utils.ts';
import { InvalidImageError } from '@/errors.ts';

await setup();

Deno.test('resolveAsset: should resolve an absolute path to a valid image', async () => {
    const path = await resolveAsset(getAssetPath('square.png'));
    assert(path.endsWith('square.png'));
});

Deno.test('resolveAsset: should resolve a relative path from the base directory', async () => {
    const path = await resolveAsset('square.png', getAssetPath('.'));
    assertEquals(path, getAssetPath('square.png'));
});

Deno.test('resolveAsset: should throw InvalidImageError for a missing file', async () => {
    await assertRejects(
        () => resolveAsset('nonexistent.png'),
        InvalidImageError,
        'Asset not found: nonexistent.png',
    );
});

Deno.test('resolveAsset: should throw InvalidImageError for empty input', async () => {
    await assertRejects(
        () => resolveAsset(' '),
        InvalidImageError,
        'Asset name must be a non-empty string',
    );
});

Deno.test('resolveAsset: should throw InvalidImageError for a directory', async () => {
    await assertRejects(
        () => resolveAsset(getAssetPath('a_directory')),
        InvalidImageError,
        `Asset not found: ${getAssetPath('a_directory')}`,
    );
});

Deno.test('resolveAsset: should throw InvalidImageError for a non-image file', async () => {
    await assertRejects(
        () => resolveAsset(getAssetPath('not_an_image.txt')),
        InvalidImageError,
        'File does not appear to be a valid image format',
    );
});

Deno.test('resolveAsset: should throw InvalidImageError for a corrupt image', async () => {
    await assertRejects(
        () => resolveAsset(getAssetPath('corrupt.png')),
        InvalidImageError,
        'File does not appear to be a valid image format',
    );
});

Deno.test({
    name: 'cleanup utils assets',
    fn: async () => {
        await cleanup();
    },
    sanitizeResources: false,
    sanitizeOps: false,
});
