import { assertEquals, assertRejects, assertThrows } from 'jsr:@std/assert';
import { join } from 'jsr:@std/path/join';
import { exists } from 'jsr:@std/fs/exists';
import { assertSpyCalls, spy } from 'jsr:@std/testing/mock';
import { AssetResolver } from '@/core/asset-resolver.ts';
import { FileSystemError } from '@/errors.ts';

/**
 * Helper function to clean up test directories
 */
async function cleanupTestDir(path: string): Promise<void> {
    if (await exists(path)) {
        await Deno.remove(path, { recursive: true });
    }
}

Deno.test(
    'AssetResolver - creates assets directory if not exists',
    async () => {
        const testPath = join(Deno.cwd(), 'test-assets');
        await cleanupTestDir(testPath);

        try {
            const resolver = new AssetResolver(testPath);
            await resolver.resolveAsset('dummy.txt').catch(() => {
                // We expect this to fail, but we want to ensure initialization happens
            });

            const dirExists = await exists(testPath);
            assertEquals(
                dirExists,
                true,
                'Directory should be created during initialization',
            );
        } finally {
            await cleanupTestDir(testPath);
        }
    },
);

Deno.test('AssetResolver - uses default path if none provided', async () => {
    const defaultPath = join(Deno.cwd(), 'assets');
    await cleanupTestDir(defaultPath);

    const mkdirSpy = spy(Deno, 'mkdir');

    try {
        const resolver = new AssetResolver();

        await resolver.resolveAsset('dummy.txt').catch(() => {
            // Expected to fail
        });

        assertSpyCalls(mkdirSpy, 1);
        assertEquals(
            mkdirSpy.calls[0].args[0],
            defaultPath,
            'Should create directory at default path',
        );
    } finally {
        mkdirSpy.restore();
        await cleanupTestDir(defaultPath);
    }
});

Deno.test('AssetResolver - throws on directory creation failure', async () => {
    const mockPath = '/invalid-location';
    const originalMkdir = Deno.mkdir;

    try {
        Deno.mkdir = async () => {
            throw new Error('Permission denied');
        };

        const resolver = new AssetResolver(mockPath);

        await assertRejects(
            () => resolver.resolveAsset('dummy.txt'),
            FileSystemError,
            'Failed to create assets directory',
        );
    } finally {
        Deno.mkdir = originalMkdir;
    }
});

Deno.test('AssetResolver - correctly resolves existing asset', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');
    const testFile = 'test-image.png';
    const fullPath = join(testPath, testFile);

    await cleanupTestDir(testPath);

    try {
        await Deno.mkdir(testPath, { recursive: true });
        await Deno.writeFile(
            fullPath,
            new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
        ); // PNG header

        const resolver = new AssetResolver(testPath);
        const resolvedPath = await resolver.resolveAsset(testFile);

        assertEquals(resolvedPath, fullPath);
    } finally {
        await cleanupTestDir(testPath);
    }
});

Deno.test('AssetResolver - throws for non-existent asset', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');
    await cleanupTestDir(testPath);

    try {
        await Deno.mkdir(testPath, { recursive: true });
        const resolver = new AssetResolver(testPath);

        const error = await assertRejects(
            () => resolver.resolveAsset('non-existent.png'),
            FileSystemError,
        );

        assertEquals(error.message.includes('Asset not found'), true);
    } finally {
        await cleanupTestDir(testPath);
    }
});

Deno.test('AssetResolver - validates constructor arguments', () => {
    assertThrows(
        () => {
            // @ts-expect-error Testing runtime validation
            new AssetResolver(123);
        },
        TypeError,
        'Assets path must be a string if provided',
    );
});

Deno.test('AssetResolver - throws for empty asset name', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');
    await cleanupTestDir(testPath);

    try {
        await Deno.mkdir(testPath, { recursive: true });
        const resolver = new AssetResolver(testPath);

        await assertRejects(
            () => resolver.resolveAsset(''),
            TypeError,
            'Asset name must be a non-empty string',
        );

        await assertRejects(
            () => resolver.resolveAsset('   '),
            TypeError,
            'Asset name must be a non-empty string',
        );
    } finally {
        await cleanupTestDir(testPath);
    }
});

Deno.test('AssetResolver - throws for invalid asset name type', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');
    await cleanupTestDir(testPath);

    try {
        await Deno.mkdir(testPath, { recursive: true });
        const resolver = new AssetResolver(testPath);

        await assertRejects(
            // @ts-expect-error Testing runtime type checking
            () => resolver.resolveAsset(null),
            TypeError,
            'Asset name must be a non-empty string',
        );

        await assertRejects(
            // @ts-expect-error Testing runtime type checking
            () => resolver.resolveAsset(123),
            TypeError,
            'Asset name must be a non-empty string',
        );
    } finally {
        await cleanupTestDir(testPath);
    }
});

Deno.test('AssetResolver - handles file system errors properly', async () => {
    const testPath = join(Deno.cwd(), 'test-assets');
    const testFile = 'test-image.png';
    await cleanupTestDir(testPath);

    try {
        await Deno.mkdir(testPath, { recursive: true });
        const resolver = new AssetResolver(testPath);

        try {
            await resolver.resolveAsset(testFile);
        } catch {
            // Expected to fail
        }

        const originalStat = Deno.stat;
        Deno.stat = async () => {
            throw new Error('Permission denied');
        };

        try {
            const error = await assertRejects(
                () => resolver.resolveAsset(testFile),
                FileSystemError,
            );
            assertEquals(
                error.message.includes('Failed to access asset'),
                true,
            );
        } finally {
            Deno.stat = originalStat;
        }
    } finally {
        await cleanupTestDir(testPath);
    }
});

Deno.test(
    'AssetResolver - throws if asset is a directory not a file',
    async () => {
        const testPath = join(Deno.cwd(), 'test-assets');
        const testDir = 'test-dir';
        const fullPath = join(testPath, testDir);
        await cleanupTestDir(testPath);

        try {
            await Deno.mkdir(testPath, { recursive: true });
            await Deno.mkdir(fullPath, { recursive: true });

            const resolver = new AssetResolver(testPath);

            const error = await assertRejects(
                () => resolver.resolveAsset(testDir),
                FileSystemError,
            );

            assertEquals(error.message.includes('not a file'), true);
        } finally {
            await cleanupTestDir(testPath);
        }
    },
);
