import { assertEquals, assertExists } from '@std/assert';
import {
    AssetResolver,
    blink,
    circle,
    color,
    greyscale,
    transform,
} from '../src/index.ts';
import { processor } from '../src/core/processor.ts';
import { TransformParams } from '../src/types/transforms.ts';
import { join } from '@std/path/join';
import { assertSpyCalls, spy } from '@std/testing/mock';

// Helper function to create an image file for testing
async function createTestImageFile(path: string): Promise<void> {
    await Deno.writeFile(
        path,
        new Uint8Array([
            0x89,
            0x50,
            0x4E,
            0x47, // PNG header
            0x0D,
            0x0A,
            0x1A,
            0x0A,
            0x00,
            0x00,
            0x00,
            0x0D, // etc
        ]),
    );
}

Deno.test('greyscale - calls processor.process with correct parameters', async () => {
    const processSpy = spy(processor, 'process');

    const testDir = join(Deno.cwd(), 'test-images');
    const testFile = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImageFile(testFile);

    try {
        await greyscale({ input: testFile });

        // Verify processor.process was called with the correct parameters
        assertSpyCalls(processSpy, 1);
        assertEquals(processSpy.calls[0].args[0], 'greyscale');
        assertEquals(processSpy.calls[0].args[1], { input: testFile });
    } finally {
        processSpy.restore();
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('color - calls processor.process with correct parameters', async () => {
    const processSpy = spy(processor, 'process');

    const testDir = join(Deno.cwd(), 'test-images');
    const testFile = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImageFile(testFile);

    try {
        await color({
            input: testFile,
            options: {
                hex: '#ff0000',
                blendMode: 'overlay',
            },
        });

        // Verify processor.process was called with the correct parameters
        assertSpyCalls(processSpy, 1);
        assertEquals(processSpy.calls[0].args[0], 'color');
        assertEquals(processSpy.calls[0].args[1], {
            input: testFile,
            options: {
                hex: '#ff0000',
                blendMode: 'overlay',
            },
        });
    } finally {
        processSpy.restore();
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('circle - calls processor.process with correct parameters', async () => {
    const processSpy = spy(processor, 'process');

    const testDir = join(Deno.cwd(), 'test-images');
    const testFile = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImageFile(testFile);

    try {
        await circle({
            input: testFile,
            options: {
                borderWidth: 2,
                borderColor: '#000000',
            },
        });

        // Verify processor.process was called with the correct parameters
        assertSpyCalls(processSpy, 1);
        assertEquals(processSpy.calls[0].args[0], 'circle');
        assertEquals(processSpy.calls[0].args[1], {
            input: testFile,
            options: {
                borderWidth: 2,
                borderColor: '#000000',
            },
        });
    } finally {
        processSpy.restore();
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('blink - calls processor.process with correct parameters', async () => {
    const processSpy = spy(processor, 'process');

    const testDir = join(Deno.cwd(), 'test-images');
    const testFile1 = join(testDir, 'test1.png');
    const testFile2 = join(testDir, 'test2.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImageFile(testFile1);
    await createTestImageFile(testFile2);

    try {
        await blink({
            inputs: [testFile1, testFile2],
            options: {
                delay: 200,
                loop: true,
            },
        });

        // Verify processor.process was called with the correct parameters
        assertSpyCalls(processSpy, 1);
        assertEquals(processSpy.calls[0].args[0], 'blink');
        assertEquals(processSpy.calls[0].args[1], {
            inputs: [testFile1, testFile2],
            options: {
                delay: 200,
                loop: true,
            },
        });
    } finally {
        processSpy.restore();
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('transform - calls processor.process with correct parameters', async () => {
    const processSpy = spy(processor, 'process');

    const testDir = join(Deno.cwd(), 'test-images');
    const testFile = join(testDir, 'test.png');

    await Deno.mkdir(testDir, { recursive: true });
    await createTestImageFile(testFile);

    try {
        await transform('greyscale', { input: testFile });

        // Verify processor.process was called with the correct parameters
        assertSpyCalls(processSpy, 1);
        assertEquals(processSpy.calls[0].args[0], 'greyscale');
        assertEquals(processSpy.calls[0].args[1], { input: testFile });
    } finally {
        processSpy.restore();
        await Deno.remove(testDir, { recursive: true });
    }
});

Deno.test('exports - exports all required types and classes', () => {
    // Check that AssetResolver is exported
    assertExists(AssetResolver);
});
