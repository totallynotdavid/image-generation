import { join } from 'jsr:@std/path@1.0.8';
import { assertEquals, assertExists } from 'jsr:@std/assert@1.0.12';
import { assertSpyCalls, spy } from 'jsr:@std/testing@1.0.11/mock';
import {
    AssetResolver,
    blink,
    circle,
    color,
    greyscale,
    transform,
} from '@/index.ts';
import { processor } from '@/core/processor.ts';
import sharp from 'npm:sharp@0.34.1';

async function createTestImageFile(path: string): Promise<void> {
    // Create a 1x1 white PNG image
    const image = sharp({
        create: {
            width: 1,
            height: 1,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
    });
    await image.png().toFile(path);
}

Deno.test(
    'greyscale - calls processor.process with correct parameters',
    async () => {
        const processSpy = spy(processor, 'process');

        const testDir = join(Deno.cwd(), 'test-images');
        const testFile = join(testDir, 'test.png');

        await Deno.mkdir(testDir, { recursive: true });
        await createTestImageFile(testFile);

        try {
            await greyscale({ input: testFile });

            assertSpyCalls(processSpy, 1);
            assertEquals(processSpy.calls[0].args[0], 'greyscale');
            assertEquals(processSpy.calls[0].args[1], { input: testFile });
        } finally {
            processSpy.restore();
            await Deno.remove(testDir, { recursive: true });
        }
    },
);

Deno.test(
    'color - calls processor.process with correct parameters',
    async () => {
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
    },
);

Deno.test(
    'circle - calls processor.process with correct parameters',
    async () => {
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
    },
);

Deno.test(
    'blink - calls processor.process with correct parameters',
    async () => {
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
    },
);

Deno.test(
    'transform - calls processor.process with correct parameters',
    async () => {
        const processSpy = spy(processor, 'process');

        const testDir = join(Deno.cwd(), 'test-images');
        const testFile = join(testDir, 'test.png');

        await Deno.mkdir(testDir, { recursive: true });
        await createTestImageFile(testFile);

        try {
            await transform('greyscale', { input: testFile });

            assertSpyCalls(processSpy, 1);
            assertEquals(processSpy.calls[0].args[0], 'greyscale');
            assertEquals(processSpy.calls[0].args[1], { input: testFile });
        } finally {
            processSpy.restore();
            await Deno.remove(testDir, { recursive: true });
        }
    },
);

Deno.test('exports - exports all required types and classes', () => {
    assertExists(AssetResolver);
});
