import {
    assert,
    assertInstanceOf,
    assertRejects,
    cleanup,
    getAssetPath,
    hasPngSignature,
    setup,
} from '../_setup.ts';
import { circle } from '@/transforms/circle.ts';
import { ProcessingError } from '@/errors.ts';

await setup();

Deno.test('circle: should crop a non-square image', async () => {
    const result = await circle({
        input: getAssetPath('wide.png'),
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('circle: should add a valid border', async () => {
    const result = await circle({
        input: getAssetPath('square.png'),
        options: { borderWidth: 5, borderColor: '#ff00ff' },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('circle: should handle zero border width gracefully', async () => {
    const result = await circle({
        input: getAssetPath('square.png'),
        options: { borderWidth: 0 },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('circle: should clamp negative border width to 0', async () => {
    const result = await circle({
        input: getAssetPath('square.png'),
        options: { borderWidth: -10 },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasPngSignature(result));
});

Deno.test('circle: should throw ProcessingError for invalid border color', async () => {
    await assertRejects(
        () =>
            circle({
                input: getAssetPath('square.png'),
                options: { borderWidth: 5, borderColor: 'invalid' },
            }),
        ProcessingError,
        'Invalid border color: invalid',
    );
});

Deno.test('circle: should throw ProcessingError if border is too wide for image', async () => {
    await assertRejects(
        () =>
            circle({
                input: getAssetPath('square.png'), // It's 100x100
                options: { borderWidth: 51 },
            }),
        ProcessingError,
        'Border width too large for image size',
    );
});

Deno.test('circle: should throw ProcessingError if resulting image is too large', async () => {
    await assertRejects(
        () =>
            circle({
                input: getAssetPath('square.png'),
                options: { borderWidth: 4000 },
            }),
        ProcessingError,
        'Resulting image size too large',
    );
});

Deno.test({
    name: 'cleanup circle assets',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
