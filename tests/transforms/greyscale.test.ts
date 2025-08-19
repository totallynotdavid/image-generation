import {
    assert,
    assertInstanceOf,
    assertRejects,
    cleanup,
    getAssetPath,
    hasPngSignature,
    setup,
} from '../_setup.ts';
import { greyscale } from '@/transforms/greyscale.ts';
import { InvalidImageError } from '@/errors.ts';

await setup();

Deno.test('greyscale: should successfully convert an image', async () => {
    const result = await greyscale({
        input: getAssetPath('square.png'),
    });
    assertInstanceOf(result, Uint8Array);
    assert(result.length > 0);
    assert(hasPngSignature(result));
});

Deno.test('greyscale: should throw InvalidImageError for an invalid input path', async () => {
    await assertRejects(
        () => greyscale({ input: 'nonexistent.png' }),
        InvalidImageError,
    );
});

Deno.test({
    name: 'cleanup greyscale assets',
    fn: cleanup,
    sanitizeResources: false,
    sanitizeOps: false,
});
