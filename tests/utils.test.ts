import { assertEquals, assertRejects } from '@std/assert';
import { loadImage, resizeImage } from '@/utils.ts';
import { ProcessingError } from '@/errors.ts';
import { cleanupTestAssets, setupTestAssets, TestAssets } from './_setup.ts';

Deno.test({
    name: 'utils tests setup',
    fn: setupTestAssets,
});

Deno.test('loadImage: should load from file path', async () => {
    const image = await loadImage(TestAssets.RED_SQUARE);
    assertEquals(image.width, 100);
    assertEquals(image.height, 100);
});

Deno.test('loadImage: should load from Uint8Array', async () => {
    const buffer = await Deno.readFile(TestAssets.BLUE_SQUARE);
    const image = await loadImage(buffer);
    assertEquals(image.width, 100);
    assertEquals(image.height, 100);
});

Deno.test('loadImage: should throw an error on invalid file', async () => {
    await assertRejects(
        () => loadImage(TestAssets.NOT_IMAGE),
        ProcessingError,
        'Failed to load image',
    );
});

Deno.test('loadImage: should throw an error on non-existent file', async () => {
    await assertRejects(
        () => loadImage(TestAssets.NONEXISTENT),
        ProcessingError,
        'Failed to load image',
    );
});

Deno.test('resizeImage: should resize with width only', async () => {
    const image = await loadImage(TestAssets.GREEN_RECTANGLE); // size: 150x80
    const resized = resizeImage(image, { width: 75 });
    assertEquals(resized.width, 75);
    // height should maintain aspect ratio
    assertEquals(resized.height, 40);
});

Deno.test('resizeImage: should resize with height only', async () => {
    const image = await loadImage(TestAssets.GREEN_RECTANGLE);
    const resized = resizeImage(image, { height: 40 });
    assertEquals(resized.height, 40);
    assertEquals(resized.width, 75);
});

Deno.test('resizeImage: should return original when no dimensions are passed', async () => {
    const image = await loadImage(TestAssets.RED_SQUARE);
    const resized = resizeImage(image, {});
    assertEquals(resized.width, image.width);
    assertEquals(resized.height, image.height);
});

Deno.test({
    name: 'utils tests cleanup',
    fn: cleanupTestAssets,
});
