import {
    assert,
    assertInstanceOf,
    cleanup,
    getAssetPath,
    setup,
    TestAssets,
} from './_setup.ts';
import { blink } from '@/transforms/blink.ts';
import { circle } from '@/transforms/circle.ts';
import { color } from '@/transforms/color.ts';
import { greyscale } from '@/transforms/greyscale.ts';

Deno.test({
    name: 'performance tests setup',
    fn: setup,
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test('performance: transforms should complete within reasonable time', async () => {
    const startTime = performance.now();

    await greyscale({ input: getAssetPath(TestAssets.LARGE) });
    await color({
        input: getAssetPath(TestAssets.LARGE),
        options: { hex: '#ff4080' },
    });
    await circle({
        input: getAssetPath(TestAssets.LARGE),
        options: { borderWidth: 5, borderColor: '#000000' },
    });

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Locally, this value is ~385, but on the CI server it takes about twice as long.
    assert(totalTime < 775, `Transforms took too long: ${totalTime}ms`);
});

Deno.test('performance: blink should handle multiple images efficiently', async () => {
    const startTime = performance.now();

    const inputs = [
        getAssetPath(TestAssets.SQUARE_RED),
        getAssetPath(TestAssets.SQUARE_GREEN),
        getAssetPath(TestAssets.SQUARE_BLUE),
        getAssetPath(TestAssets.CIRCLE),
        getAssetPath(TestAssets.CHECKERBOARD),
    ];

    const result = await blink({ inputs });

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    assertInstanceOf(result, Uint8Array);
    assert(totalTime < 80, `Blink animation took too long: ${totalTime}ms`);
});

Deno.test('performance: small images should be very fast', async () => {
    const operations = [
        () => greyscale({ input: getAssetPath(TestAssets.TINY) }),
        () =>
            color({
                input: getAssetPath(TestAssets.TINY),
                options: { hex: '#ff0000' },
            }),
        () => circle({ input: getAssetPath(TestAssets.TINY) }),
    ];

    for (const operation of operations) {
        const startTime = performance.now();
        const result = await operation();
        const endTime = performance.now();
        const operationTime = endTime - startTime;

        assertInstanceOf(result, Uint8Array);
        assert(
            operationTime < 15,
            `Small image operation took too long: ${operationTime}ms`,
        );
    }
});

Deno.test('performance: memory usage should be reasonable', async () => {
    const operations = [];
    for (let i = 0; i < 100; i++) {
        operations.push(
            greyscale({ input: getAssetPath(TestAssets.CHECKERBOARD) }),
        );
    }

    const results = await Promise.all(operations);

    assert(results.length === 100);
    results.forEach((result) => {
        assertInstanceOf(result, Uint8Array);
        assert(result.length > 0);
    });
});

Deno.test({
    name: 'performance tests cleanup',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
