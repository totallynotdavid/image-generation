import {
    SingleImageTransform,
    TransformMap,
    TransformResult,
} from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { parseHexColor, validateImagePath } from '../validation/utils.ts';
import { ProcessingError } from '../errors.ts';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

/**
 * Apply a color tint to an image
 * @param params Transform parameters
 * @returns Transformed image data as Uint8Array
 */
export async function color(
    params: SingleImageTransform<TransformMap['color']>,
): Promise<TransformResult> {
    const { input, options } = params;

    const {
        hex = '#ffffff',
        blendMode = 'overlay',
    } = options || {};

    try {
        const inputBuffer = await validateImagePath(input);
        const { r, g, b } = parseHexColor(hex);

        let outputBuffer: Buffer;

        // Apply different color transformations based on blend mode
        if (blendMode === 'overlay') {
            outputBuffer = await sharp(inputBuffer)
                .tint({ r, g, b })
                .toBuffer();
        } else if (blendMode === 'softlight') {
            outputBuffer = await sharp(inputBuffer)
                .modulate({
                    brightness: 1,
                    saturation: 1.2,
                    hue: 30,
                })
                .tint({ r, g, b })
                .toBuffer();
        } else {
            // This should never happen due to validation, but just in case
            throw new ProcessingError(`Unsupported blend mode: ${blendMode}`);
        }

        return new Uint8Array(outputBuffer);
    } catch (error: unknown) {
        throw new ProcessingError(
            `Failed to apply color transform: ${
                error instanceof Error ? error.message : 'Unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}

// Register the transform handler
processor.registerHandler('color', color);
