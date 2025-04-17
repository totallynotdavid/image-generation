import { assertEquals, assertExists, assertRejects } from '@std/assert';
import { AssetResolver } from '../../src/core/asset-resolver.ts';
import { FileSystemError } from '../../src/errors.ts';
import { join } from '@std/path/join';
import { exists } from '@std/fs/exists';
import { assertSpyCalls, spy } from '@std/testing/mock';

Deno.test('AssetResolver - constructor creates assets directory if not exists', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');

    // Clean up before test if directory exists
    if (await exists(testPath)) {
        await Deno.remove(testPath, { recursive: true });
    }

    // Create resolver which should create the directory
    const resolver = new AssetResolver(testPath);
    assertExists(resolver);

    // Verify directory was created
    const dirExists = await exists(testPath);
    assertEquals(dirExists, true);

    // Clean up
    await Deno.remove(testPath, { recursive: true });
});

Deno.test('AssetResolver - constructor uses default path if none provided', async () => {
    const defaultPath = join(Deno.cwd(), 'assets');
    const mkdirSpy = spy(Deno, 'mkdir');

    try {
        // Create resolver with default path
        const resolver = new AssetResolver();
        assertExists(resolver);

        // Should have tried to create the default directory
        assertSpyCalls(mkdirSpy, 1);
    } finally {
        // Restore original function
        mkdirSpy.restore();
    }
});

Deno.test('AssetResolver - constructor throws on directory creation failure', async () => {
    const mockPath = '/invalid-location';

    // Mock Deno.mkdir to simulate failure
    const originalMkdir = Deno.mkdir;
    Deno.mkdir = async () => {
        throw new Error('Permission denied');
    };

    try {
        await assertRejects(
            async () => {
                new AssetResolver(mockPath);
            },
            FileSystemError,
            'Failed to create assets directory',
        );
    } finally {
        // Restore original function
        Deno.mkdir = originalMkdir;
    }
});

Deno.test('AssetResolver - resolveAsset returns valid path for existing asset', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');
    const testFile = 'test-image.png';
    const fullPath = join(testPath, testFile);

    // Create test directory and file
    await Deno.mkdir(testPath, { recursive: true });
    await Deno.writeFile(fullPath, new Uint8Array([0x89, 0x50, 0x4E, 0x47])); // PNG header

    try {
        const resolver = new AssetResolver(testPath);
        const resolvedPath = await resolver.resolveAsset(testFile);

        assertEquals(resolvedPath, fullPath);
    } finally {
        // Clean up
        await Deno.remove(testPath, { recursive: true });
    }
});

Deno.test('AssetResolver - resolveAsset throws for non-existent asset', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');

    // Create test directory
    await Deno.mkdir(testPath, { recursive: true });

    try {
        const resolver = new AssetResolver(testPath);
        await assertRejects(
            async () => {
                await resolver.resolveAsset('non-existent.png');
            },
            FileSystemError,
            'Asset not found',
        );
    } finally {
        // Clean up
        await Deno.remove(testPath, { recursive: true });
    }
});

Deno.test('AssetResolver - resolveAsset throws for empty asset name', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');

    // Create test directory
    await Deno.mkdir(testPath, { recursive: true });

    try {
        const resolver = new AssetResolver(testPath);
        await assertRejects(
            async () => {
                await resolver.resolveAsset('');
            },
            FileSystemError,
            'Asset name must be a non-empty string',
        );
    } finally {
        // Clean up
        await Deno.remove(testPath, { recursive: true });
    }
});

Deno.test('AssetResolver - resolveAsset throws for filesystem errors', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');
    const testFile = 'test-image.png';

    // Create test directory
    await Deno.mkdir(testPath, { recursive: true });

    // Mock exists to simulate access error
    const originalExists = exists;
    // deno-lint-ignore require-await
    (exists as unknown) = async () => {
        throw new Error('Permission denied');
    };

    try {
        const resolver = new AssetResolver(testPath);
        await assertRejects(
            async () => {
                await resolver.resolveAsset(testFile);
            },
            FileSystemError,
            'Failed to access asset',
        );
    } finally {
        // Restore original function
        (exists as unknown) = originalExists;

        // Clean up
        await Deno.remove(testPath, { recursive: true });
    }
});
