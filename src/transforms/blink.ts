import { Frame, GIF, Image } from '@matmen/imagescript';
import { BlinkParams, TransformResult } from '@/types.ts';
import { applyBaseTransforms, loadImageFromInput } from '@/utils.ts';
import {
    InvalidImageError,
    ProcessingError,
    throwProcessingError,
} from '@/errors.ts';

export async function blink(params: BlinkParams): Promise<TransformResult> {
    const { inputs, options } = params;

    if (!inputs?.length || inputs.length < 2) {
        throw new ProcessingError(
            'At least 2 images required for blink animation',
        );
    }

    const delay = Math.max(50, options?.delay ?? 200);
    const loop = options?.loop !== false;

    try {
        const originalImages: Image[] = await Promise.all(
            inputs.map(loadImageFromInput),
        );

        const images = originalImages.map((img) =>
            applyBaseTransforms(img, options)
        );

        const { width, height } = images[0];
        const normalized: Image[] = new Array(images.length);
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            normalized[i] = img.width !== width || img.height !== height
                ? img.fit(width, height)
                : img;
        }

        const frames: Frame[] = new Array(normalized.length);
        for (let i = 0; i < normalized.length; i++) {
            const frame = new Frame(width, height);
            frame.composite(normalized[i], 0, 0);
            frame.duration = delay;
            frames[i] = frame;
        }

        const gif = new GIF(frames, loop ? -1 : 0);
        return await gif.encode();
    } catch (error) {
        if (error instanceof InvalidImageError) {
            throw error;
        }
        throwProcessingError(error, 'Failed to create blink animation');
    }
}
