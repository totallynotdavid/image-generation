import sharp from 'npm:sharp@0.34.1';
import GIFEncoder from 'npm:gifencoder@2.0.1';
import { BlinkParams, TransformResult } from '@/types.ts';
import { resolveAsset } from '@/utils.ts';
import { ProcessingError } from '@/errors.ts';

export async function blink(params: BlinkParams): Promise<TransformResult> {
    const { inputs, options } = params;

    if (!inputs || inputs.length < 2) {
        throw new ProcessingError(
            'At least 2 images required for blink animation',
        );
    }

    const delay = options?.delay || 200;
    const loop = options?.loop !== false; // defaults to true

    if (delay < 0) {
        throw new ProcessingError('Delay must be non-negative');
    }

    try {
        const resolvedPaths = await Promise.all(
            inputs.map((input) => resolveAsset(input)),
        );

        const imageBuffers = await Promise.all(
            resolvedPaths.map(async (path) => {
                const buffer = await Deno.readFile(path);
                return sharp(buffer).png().toBuffer();
            }),
        );

        const { width = 480, height = 480 } = await sharp(imageBuffers[0])
            .metadata();

        // all images are resized to the same dimensions as the first img
        const resizedBuffers = await Promise.all(
            imageBuffers.map((buffer) =>
                sharp(buffer)
                    .resize(width, height, { fit: 'cover' })
                    .raw()
                    .toBuffer({ resolveWithObject: true })
            ),
        );

        const encoder = new GIFEncoder(width, height);
        encoder.start();
        encoder.setRepeat(loop ? 0 : -1);
        encoder.setDelay(delay);
        encoder.setQuality(10);

        for (const { data } of resizedBuffers) {
            // convert raw buffer to ImageData format for GIF encoder
            const rgbaData = new Uint8ClampedArray(width * height * 4);

            // convert to RGBA as sharp uses RGB by default
            for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
                rgbaData[j] = data[i]; // R
                rgbaData[j + 1] = data[i + 1]; // G
                rgbaData[j + 2] = data[i + 2]; // B
                rgbaData[j + 3] = 255; // A
            }

            encoder.addFrame(rgbaData);
        }

        encoder.finish();
        return new Uint8Array(encoder.out.getData());
    } catch (error) {
        throw new ProcessingError(
            `Failed to create blink animation: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}
