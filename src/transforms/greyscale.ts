import type { GreyscaleParams, TransformResult } from '@/types.ts';
import { loadImage } from '@/utils.ts';
import { ImageTransformError, throwProcessingError } from '@/errors.ts';

export async function greyscale(
    params: GreyscaleParams,
): Promise<TransformResult> {
    try {
        const image = await loadImage(params.input);
        const greyImage = image.saturation(0);
        return await greyImage.encode();
    } catch (error) {
        if (error instanceof ImageTransformError) throw error;
        throwProcessingError(error, 'Failed to apply greyscale transform');
    }
}
