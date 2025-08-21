import { GreyscaleParams, TransformResult } from '@/types.ts';
import { applyBaseTransforms, loadImageFromInput } from '@/utils.ts';
import { InvalidImageError, throwProcessingError } from '@/errors.ts';

export async function greyscale(
    params: GreyscaleParams,
): Promise<TransformResult> {
    try {
        const originalImage = await loadImageFromInput(params.input);
        const image = applyBaseTransforms(originalImage, params.options);
        const greyImage = image.saturation(0);
        return await greyImage.encode();
    } catch (error) {
        if (error instanceof InvalidImageError) {
            throw error;
        }
        throwProcessingError(error, 'Failed to apply grayscale transform');
    }
}
