import { Frame, GIF, Image } from '@matmen/imagescript';
import { BlinkParams, TransformResult } from '@/types.ts';
import { resolveAsset } from '@/utils.ts';
import {
    InvalidImageError,
    ProcessingError,
    throwProcessingError,
} from '@/errors.ts';

export async function blink(params: BlinkParams): Promise<TransformResult> {
    const { inputs, options } = params;

    if (!inputs || inputs.length < 2) {
        throw new ProcessingError(
            'At least 2 images required for blink animation',
        );
    }

    const duration = Math.max(0, options?.delay ?? 200);
    const loop = options?.loop !== false;

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

        // all images where dimensions don't match
        // are resized to match the first image
        const resizedFrames: Frame[] = images.map((img) => {
            let processedImg = img;
            if (img.width !== width || img.height !== height) {
                processedImg = img.fit(width, height);
            }
            const frame = new Frame(width, height);
            frame.composite(processedImg, 0, 0);
            return frame;
        });

        resizedFrames.forEach((frame) => {
            frame.duration = duration;
        });

        const loopCount = loop ? -1 : 0;
        const gif = new GIF(resizedFrames, loopCount);

        return await gif.encode();
    } catch (error) {
        if (error instanceof InvalidImageError) {
            throw error;
        }
        throwProcessingError(error, 'Failed to create blink animation');
    }
}
