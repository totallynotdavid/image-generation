import {
    assert,
    assertInstanceOf,
    assertRejects,
    cleanup,
    getAssetPath,
    hasPngSignature,
    setup,
    TestAssets,
} from '../_setup.ts';
import { color } from '@/transforms/color.ts';
import { ProcessingError } from '@/errors.ts';

Deno.test({
    name: 'color tests setup',
    fn: setup,
    sanitizeResources: false,
    sanitizeOps: false,
});

Deno.test('color: should apply tint blend mode with different colors', async () => {
    const colors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ffff00',
        '#ff00ff',
        '#00ffff',
    ];

    for (const hex of colors) {
        const result = await color({
            input: getAssetPath(TestAssets.CHECKERBOARD),
            options: { blendMode: 'tint', hex },
        });

        assertInstanceOf(result, Uint8Array);
        assert(hasPngSignature(result));
    }
});

Deno.test('color: should apply softlight blend mode', async () => {
    const result = await color({
        input: getAssetPath(TestAssets.CIRCLE),
        options: { blendMode: 'softlight', hex: '#808080', intensity: 0.8 },
    });

    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('color: should apply wash blend mode with different opacities', async () => {
    const opacities = [0.1, 0.3, 0.5, 0.7, 0.9];

    for (const opacity of opacities) {
        const result = await color({
            input: getAssetPath(TestAssets.NOISE),
            options: { blendMode: 'wash', hex: '#ff8040', opacity },
        });

        assertInstanceOf(result, Uint8Array);
        assert(hasPngSignature(result));
    }
});

Deno.test('color: should handle intensity variations', async () => {
    const intensities = [0, 0.25, 0.5, 0.75, 1.0];

    for (const intensity of intensities) {
        const result = await color({
            input: getAssetPath(TestAssets.WIDE),
            options: { blendMode: 'tint', hex: '#4080ff', intensity },
        });

        assertInstanceOf(result, Uint8Array);
        assert(hasPngSignature(result));
    }
});

Deno.test('color: should use default values when options are minimal', async () => {
    const result = await color({
        input: getAssetPath(TestAssets.TALL),
        options: {},
    });

    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('color: should clamp out-of-range values', async () => {
    // Test intensity clamping
    const result1 = await color({
        input: getAssetPath(TestAssets.SQUARE_RED),
        options: { intensity: -5 }, // Should clamp to 0
    });
    assertInstanceOf(result1, Uint8Array);

    const result2 = await color({
        input: getAssetPath(TestAssets.SQUARE_GREEN),
        options: { intensity: 10 }, // Should clamp to 1
    });
    assertInstanceOf(result2, Uint8Array);

    // Test opacity clamping for wash mode
    const result3 = await color({
        input: getAssetPath(TestAssets.SQUARE_BLUE),
        options: { blendMode: 'wash', opacity: -2 }, // Should clamp to 0
    });
    assertInstanceOf(result3, Uint8Array);
});

Deno.test('color: should throw ProcessingError for invalid hex colors', async () => {
    const invalidColors = ['not-a-color', '123', 'rgb(255,0,0)', '#gggggg', ''];

    for (const hex of invalidColors) {
        await assertRejects(
            () =>
                color({
                    input: getAssetPath(TestAssets.TINY),
                    options: { hex },
                }),
            ProcessingError,
            'Invalid hex color',
        );
    }
});

Deno.test('color: should work with various image patterns', async () => {
    const testImages = [
        TestAssets.CHECKERBOARD,
        TestAssets.CIRCLE,
        TestAssets.NOISE,
    ];
    const blendModes = ['tint', 'softlight', 'wash'] as const;

    for (const image of testImages) {
        for (const blendMode of blendModes) {
            const result = await color({
                input: getAssetPath(image),
                options: { blendMode, hex: '#40c0ff' },
            });

            assertInstanceOf(result, Uint8Array);
            assert(hasPngSignature(result));
        }
    }
});

Deno.test({
    name: 'color tests cleanup',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
