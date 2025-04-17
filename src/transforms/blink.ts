import {
    MultiImageTransform,
    TransformMap,
    TransformResult,
} from '../types/transforms.ts';
import { validateImagePath } from '../validation/utils.ts';
import { ProcessingError } from '../errors.ts';
import sharp from 'npm:sharp';
import GIFEncoder from 'npm:gifencoder';
import { createCanvas, Image } from 'npm:canvas';

export async function blink(
    params: MultiImageTransform<TransformMap['blink']>,
): Promise<TransformResult> {
    const { inputs, options } = params;
    const {
        delay = 200,
        loop = true,
    } = options || {};

    try {
        const processedBuffers = await Promise.all(
            inputs.map(async (input) => {
                const buffer = await validateImagePath(input);
                const { width, height } = await sharp(buffer).metadata();
                return sharp(buffer)
                    .resize(width, height)
                    .toFormat('png')
                    .toBuffer();
            }),
        );

        const { width = 480, height = 480 } = await sharp(processedBuffers[0])
            .metadata();

        const encoder = new GIFEncoder(width, height);
        encoder.start();
        encoder.setRepeat(loop ? 0 : -1);
        encoder.setDelay(delay);
        encoder.setQuality(10);

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        for (const buffer of processedBuffers) {
            const img = new Image();
            img.src = `data:image/png;base64,${buffer.toString('base64')}`;
            
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            encoder.addFrame(ctx);
        }

        encoder.finish();
        return new Uint8Array(encoder.out.getData());
    } catch (error) {
        throw new ProcessingError(
            `Failed to create animated GIF: ${
                error instanceof Error ? error.message : 'Unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}
