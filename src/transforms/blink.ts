import {
    MultiImageTransform,
    TransformMap,
    TransformResult,
} from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { validateImagePath } from '../validation/utils.ts';
import { ProcessingError } from '../errors.ts';
import sharp from 'sharp';
import GIFEncoder from 'gifencoder';
import { createCanvas, loadImage } from 'canvas';
import { Buffer } from 'node:buffer';

/**
 * Creates an animated GIF from multiple images
 * @param params Transform parameters
 * @returns Transformed image data as Uint8Array
 */
export async function blink(
    params: MultiImageTransform<TransformMap['blink']>,
): Promise<TransformResult> {
    const { inputs, options } = params;

    const {
        delay = 200,
        loop = true,
    } = options || {};

    try {
        // Process all input images
        const imageBuffers = await Promise.all(
            inputs.map((input: string) => validateImagePath(input)),
        );

        // Get dimensions from first image
        const metadata = await sharp(imageBuffers[0]).metadata();
        const width = metadata.width || 480;
        const height = metadata.height || 480;

        // Setup GIF encoder
        const encoder = new GIFEncoder(width, height);
        encoder.start();
        encoder.setRepeat(loop ? 0 : -1); // 0 = loop forever, -1 = no loop
        encoder.setDelay(delay);
        encoder.setQuality(10); // 10 is default, lower = better quality but larger file

        // Create canvas for drawing frames
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Add each image as a frame
        for (const buffer of imageBuffers) {
            const image = await loadImage(Buffer.from(buffer));
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(image, 0, 0, width, height);
            encoder.addFrame(ctx);
        }

        encoder.finish();

        // Get the GIF data
        const gifData = encoder.out.getData();
        return new Uint8Array(gifData);
    } catch (error: unknown) {
        // Handle errors specific to blink transform
        throw new ProcessingError(
            `Failed to create animated GIF: ${
                error instanceof Error ? error.message : 'Unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}

// Register the transform handler
processor.registerHandler('blink', blink);
