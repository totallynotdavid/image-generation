import {
    assert,
    assertInstanceOf,
    assertRejects,
    cleanup,
    getAssetPath,
    hasPngSignature,
    setup,
} from '../_setup.ts';
import { color } from '@/transforms/color.ts';
import { ProcessingError } from '@/errors.ts';

await setup();

Deno.test('color: should apply "tint" blend mode', async () => {
    const result = await color({
        input: getAssetPath('square.png'),
        options: { blendMode: 'tint', hex: '#ff0000' },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('color: should apply "softlight" blend mode', async () => {
    const result = await color({
        input: getAssetPath('square.png'),
        options: { blendMode: 'softlight', hex: '#00ff00' },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('color: should apply "wash" blend mode', async () => {
    const result = await color({
        input: getAssetPath('square.png'),
        options: { blendMode: 'wash', hex: '#0000ff', opacity: 0.5 },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('color: should use default options when none are provided', async () => {
    const result = await color({
        input: getAssetPath('square.png'),
        options: {},
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('color: should clamp intensity when value is below 0', async () => {
    const result = await color({
        input: getAssetPath('square.png'),
        options: { intensity: -10 },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('color: should clamp intensity when value is above 1', async () => {
    const result = await color({
        input: getAssetPath('square.png'),
        options: { intensity: 10 },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('color: should clamp opacity for wash mode', async () => {
    const result = await color({
        input: getAssetPath('square.png'),
        options: { blendMode: 'wash', opacity: -10 },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('color: should throw ProcessingError for an invalid hex code', async () => {
    await assertRejects(
        () =>
            color({
                input: getAssetPath('square.png'),
                options: { hex: 'not-a-color' },
            }),
        ProcessingError,
        'Invalid hex color: not-a-color',
    );
});

Deno.test({
    name: 'cleanup color assets',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
