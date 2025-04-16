import {
    SingleImageTransform,
    TransformMap,
    TransformResult,
} from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { parseHexColor, validateImagePath } from '../validation/utils.ts';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

/**
 * Applies a color tint to an image.
 *
 * @param params - Transform parameters including input image and color options
 * @returns A processed image as a Uint8Array
 */
export async function color(
    params: SingleImageTransform<TransformMap['color']>,
): Promise<TransformResult> {
    const { input, options } = params;

    const {
        hex = '#ffffff',
        blendMode = 'overlay',
    } = options || {};

    const inputBuffer = await validateImagePath(input);

    const { r, g, b } = parseHexColor(hex);

    let outputBuffer: Buffer;

    if (blendMode === 'overlay') {
        outputBuffer = await sharp(inputBuffer)
            .tint({ r, g, b })
            .toBuffer();
    } else {
        outputBuffer = await sharp(inputBuffer)
            .modulate({
                brightness: 1,
                saturation: 1.2,
                hue: 30,
            })
            .tint({ r, g, b })
            .toBuffer();
    }

    return new Uint8Array(outputBuffer);
}

processor.registerHandler('color', color);
