import { Frame, GIF, Image } from '@matmen/imagescript';
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

    const duration = options?.delay ?? 200;
    const loop = options?.loop !== false; // defaults to true

    if (duration < 0) {
        throw new ProcessingError('Duration must be non-negative');
    }

    try {
        const resolvedPaths = await Promise.all(
            inputs.map((input) => resolveAsset(input)),
        );

        const images = await Promise.all(
            resolvedPaths.map((path) => {
                return Deno.readFile(path).then((buffer) =>
                    Image.decode(buffer)
                );
            }),
        );

        const firstImage = images[0];
        const { width, height } = firstImage;

        // all images are resized to the same dimensions as the first img
        const resizedFrames: Frame[] = images.map((img) => {
            const resized = img.resize(width, height);
            const frame = new Frame(width, height);
            frame.composite(resized, 0, 0);
            return frame;
        });

        resizedFrames.forEach((frame) => {
            frame.duration = duration;
        });

        const loopCount = loop ? -1 : 0;
        const gif = new GIF(resizedFrames, loopCount);

        const encodedGif = await gif.encode();

        return encodedGif;
    } catch (error) {
        throw new ProcessingError(
            `Failed to create blink animation: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}
