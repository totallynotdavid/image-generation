import { GreyscaleParams, TransformResult } from '@/types.ts';
import { loadImage, resolveAsset } from '@/utils.ts';
import { ProcessingError } from '@/errors.ts';

export async function greyscale(
    params: GreyscaleParams,
): Promise<TransformResult> {
    try {
        const resolvedPath = await resolveAsset(params.input);
        const image = await loadImage(resolvedPath);

        const greyImage = image.saturation(0);

        const result = await greyImage.encode();
        return new Uint8Array(result);
    } catch (error) {
        if (error instanceof ProcessingError) {
            throw error;
        }
        throw new ProcessingError(
            `Failed to apply grayscale transform: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}
