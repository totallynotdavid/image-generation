import { SingleImageTransform, TransformResult } from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { validateImagePath } from '../validation/utils.ts';
import { ProcessingError } from '../errors.ts';
import sharp from 'sharp';

/**
 * Convert an image to grayscale
 * @param params Transform parameters
 * @returns Transformed image data as Uint8Array
 */
export async function greyscale(
    params: SingleImageTransform,
): Promise<TransformResult> {
    const { input } = params;

    try {
        const inputBuffer = await validateImagePath(input);

        const outputBuffer = await sharp(inputBuffer)
            .grayscale()
            .toBuffer();

        return new Uint8Array(outputBuffer);
    } catch (error: unknown) {
        throw new ProcessingError(
            `Failed to apply grayscale transform: ${
                error instanceof Error ? error.message : 'Unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}

// Register the transform handler
processor.registerHandler('greyscale', greyscale);
