// transforms/blink.ts
import {
    MultiImageTransform,
    TransformMap,
    TransformResult,
} from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { validateImagePath } from '../validation/utils.ts';
import sharp from 'sharp';
import GIFEncoder from 'gifencoder';
import { createCanvas, loadImage } from 'canvas';

export async function blink(
    params: MultiImageTransform<TransformMap['blink']>,
): Promise<TransformResult> {
    const { inputs, options } = params;

    const {
        delay = 200,
        loop = true,
    } = options || {};

    const imageBuffers = await Promise.all(
        inputs.map((input: string) => validateImagePath(input)),
    );

    // Get dimensions from first image
    const metadata = await sharp(imageBuffers[0]).metadata();
    const width = metadata.width || 480;
    const height = metadata.height || 480;

    const encoder = new GIFEncoder(width, height);
    encoder.start();
    encoder.setRepeat(loop ? 0 : -1); // 0 = loop, -1 = no loop
    encoder.setDelay(delay);
    encoder.setQuality(10); // Lower is better quality

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    for (const buffer of imageBuffers) {
        const image = await loadImage(buffer);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        encoder.addFrame(ctx);
    }

    encoder.finish();

    const gifData = encoder.out.getData();

    return new Uint8Array(gifData);
}

processor.registerHandler('blink', blink);
