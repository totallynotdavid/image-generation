import { Frame, GIF } from '@matmen/imagescript';
import type { BlinkParams, TransformResult } from '@/types.ts';
import { loadImage } from '@/utils.ts';
import {
    ImageTransformError,
    ProcessingError,
    throwProcessingError,
} from '@/errors.ts';

export async function blink(params: BlinkParams): Promise<TransformResult> {
    const { inputs, delay = 200, loop = true } = params;

    if (!inputs?.length || inputs.length < 2) {
        throw new ProcessingError(
            'At least 2 images required for blink animation',
        );
    }

    try {
        const images = await Promise.all(inputs.map(loadImage));
        const animationDelay = Math.max(50, delay);

        const { width, height } = images[0];

        const normalizedImages = images.map((img) =>
            img.width !== width || img.height !== height
                ? img.fit(width, height)
                : img
        );

        const frames = normalizedImages.map((img) => {
            const frame = new Frame(width, height);
            frame.composite(img, 0, 0);
            frame.duration = animationDelay;
            return frame;
        });

        const gif = new GIF(frames, loop ? -1 : 0);
        return await gif.encode();
    } catch (error) {
        if (error instanceof ImageTransformError) throw error;
        throwProcessingError(error, 'Failed to create blink animation');
    }
}
