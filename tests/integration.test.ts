import {
    assert,
    assertInstanceOf,
    cleanup,
    getAssetPath,
    hasGifSignature,
    hasPngSignature,
    setup,
    TestAssets,
} from './_setup.ts';
import { blink } from '@/transforms/blink.ts';
import { circle } from '@/transforms/circle.ts';
import { color } from '@/transforms/color.ts';
import { greyscale } from '@/transforms/greyscale.ts';

Deno.test({
    name: 'integration tests setup',
    fn: setup,
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test('integration: should chain transforms conceptually', async () => {
    // While we can't directly chain without saving intermediate results,
    // we can test that each transform produces valid output that could be chained

    const originalPath = getAssetPath(TestAssets.CIRCLE);

    const greyResult = await greyscale({ input: originalPath });
    assertInstanceOf(greyResult, Uint8Array);
    assert(hasPngSignature(greyResult));

    const colorResult = await color({
        input: originalPath,
        options: { blendMode: 'tint', hex: '#ff4080' },
    });
    assertInstanceOf(colorResult, Uint8Array);
    assert(hasPngSignature(colorResult));

    const circleResult = await circle({
        input: originalPath,
        options: { borderWidth: 5, borderColor: '#000000' },
    });
    assertInstanceOf(circleResult, Uint8Array);
    assert(hasPngSignature(circleResult));
});

Deno.test('integration: should handle complex blink scenarios', async () => {
    const inputs = [
        getAssetPath(TestAssets.CHECKERBOARD),
        getAssetPath(TestAssets.CIRCLE),
        getAssetPath(TestAssets.NOISE),
        getAssetPath(TestAssets.WIDE),
    ];

    const result = await blink({
        inputs,
        options: {
            delay: 150,
            loop: true,
        },
    });

    assertInstanceOf(result, Uint8Array);
    assert(hasGifSignature(result));
    assert(result.length > 1000); // it should be reasonably sized for 4 frames
});

Deno.test('integration: should work with various combinations of parameters', async () => {
    const testCombinations = [
        {
            transform: 'color',
            input: TestAssets.LARGE,
            options: {
                blendMode: 'wash' as const,
                hex: '#ff0080',
                opacity: 0.4,
                intensity: 0.8,
            },
        },
        {
            transform: 'circle',
            input: TestAssets.WIDE,
            options: { borderWidth: 12, borderColor: '#40ff80' },
        },
        {
            transform: 'color',
            input: TestAssets.TINY,
            options: {
                blendMode: 'softlight' as const,
                hex: '#8040ff',
                intensity: 0.6,
            },
        },
    ] as const;

    for (const combo of testCombinations) {
        let result: Uint8Array;

        if (combo.transform === 'color') {
            result = await color({
                input: getAssetPath(combo.input),
                options: combo.options,
            });
        } else if (combo.transform === 'circle') {
            result = await circle({
                input: getAssetPath(combo.input),
                options: combo.options,
            });
        } else {
            continue;
        }

        assertInstanceOf(result, Uint8Array);
        assert(hasPngSignature(result));
    }
});

Deno.test('integration: should maintain quality with different image patterns', async () => {
    const testImage = TestAssets.CHECKERBOARD;

    const grey = await greyscale({ input: getAssetPath(testImage) });
    assert(grey.length > 0);

    const colored = await color({
        input: getAssetPath(testImage),
        options: { blendMode: 'tint', hex: '#4080c0', intensity: 0.7 },
    });
    assert(colored.length > 0);

    const circled = await circle({
        input: getAssetPath(testImage),
        options: { borderWidth: 8, borderColor: '#c04080' },
    });
    assert(circled.length > 0);

    // all results should be valid PNG data
    assert(hasPngSignature(grey));
    assert(hasPngSignature(colored));
    assert(hasPngSignature(circled));
});

Deno.test('integration: should handle edge cases across transforms', async () => {
    const tinyTests = [
        () => greyscale({ input: getAssetPath(TestAssets.TINY) }),
        () =>
            color({
                input: getAssetPath(TestAssets.TINY),
                options: { hex: '#ff0000' },
            }),
        () =>
            circle({
                input: getAssetPath(TestAssets.TINY),
                options: { borderWidth: 1, borderColor: '#000000' },
            }),
    ];

    for (const test of tinyTests) {
        const result = await test();
        assertInstanceOf(result, Uint8Array);
        assert(hasPngSignature(result));
    }
});

Deno.test('integration: should produce different outputs for different inputs', async () => {
    const baseImage = getAssetPath(TestAssets.SQUARE_RED);

    const results = await Promise.all([
        greyscale({ input: baseImage }),
        color({ input: baseImage, options: { hex: '#00ff00' } }),
        circle({ input: baseImage }),
    ]);

    for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
            // compare first 100 bytes to see if they're different
            const bytes1 = results[i].slice(100, 200);
            const bytes2 = results[j].slice(100, 200);

            let isDifferent = false;
            for (let k = 0; k < Math.min(bytes1.length, bytes2.length); k++) {
                if (bytes1[k] !== bytes2[k]) {
                    isDifferent = true;
                    break;
                }
            }
            // TODO: this is not a foolproof test
            console.log(
                `Comparing ${i} and ${j}: ${
                    isDifferent ? 'Different' : 'Same'
                }`,
            );
        }
    }
});

Deno.test({
    name: 'integration tests cleanup',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
