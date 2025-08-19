import {
    assert,
    assertInstanceOf,
    assertRejects,
    cleanup,
    getAssetPath,
    hasGifSignature,
    setup,
} from '../_setup.ts';
import { blink } from '@/transforms/blink.ts';
import { InvalidImageError, ProcessingError } from '@/errors.ts';

await setup();

Deno.test('blink: should create a GIF from images of different sizes', async () => {
    const result = await blink({
        inputs: [
            getAssetPath('square.png'),
            getAssetPath('wide.png'),
            getAssetPath('tall.png'),
        ],
    });
    assertInstanceOf(result, Uint8Array);
    assert(result.length > 0);
    assert(hasGifSignature(result));
});

Deno.test('blink: should throw ProcessingError for less than 2 images', async () => {
    await assertRejects(
        () => blink({ inputs: [getAssetPath('square.png')] }),
        ProcessingError,
        'At least 2 images required',
    );
    await assertRejects(
        () => blink({ inputs: [] }),
        ProcessingError,
        'At least 2 images required',
    );
});

Deno.test('blink: should throw InvalidImageError if one input is invalid', async () => {
    await assertRejects(
        () =>
            blink({
                inputs: [getAssetPath('square.png'), 'nonexistent.png'],
            }),
        InvalidImageError,
        'Asset not found: nonexistent.png',
    );
});

Deno.test('blink: should respect delay and loop options', async () => {
    const result = await blink({
        inputs: [getAssetPath('square.png'), getAssetPath('wide.png')],
        options: { delay: 50, loop: false },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasGifSignature(result));
});

Deno.test('blink: should clamp negative delay to 0', async () => {
    const result = await blink({
        inputs: [getAssetPath('square.png'), getAssetPath('wide.png')],
        options: { delay: -500 },
    });
    assertInstanceOf(result, Uint8Array);
    assert(hasGifSignature(result));
});

Deno.test({
    name: 'cleanup blink assets',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
