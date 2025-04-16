import {
    SingleImageTransform,
    TransformMap,
    TransformResult,
} from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { validateImagePath } from '../validation/utils.ts';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

export async function color(
    params: SingleImageTransform<TransformMap['color']>,
): Promise<TransformResult> {
    const { input, options } = params;

    const {
        hex = '#ffffff',
        blendMode = 'overlay',
    } = options || {};

    const inputBuffer = await validateImagePath(input);

    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);

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
