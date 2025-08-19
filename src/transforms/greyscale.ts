import { GreyscaleParams, TransformResult } from '@/types.ts';
import { loadImage, resolveAsset } from '@/utils.ts';
import { throwProcessingError } from '@/errors.ts';

export async function greyscale(
    params: GreyscaleParams,
): Promise<TransformResult> {
    try {
        const resolvedPath = await resolveAsset(params.input);
        const image = await loadImage(resolvedPath);

        const greyImage = image.saturation(0);

        return await greyImage.encode();
    } catch (error) {
        throwProcessingError(error, 'Failed to apply grayscale transform');
    }
}
