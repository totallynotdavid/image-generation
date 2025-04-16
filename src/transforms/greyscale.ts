import { SingleImageTransform, TransformResult } from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { validateImagePath } from '../validation/utils.ts';
import sharp from 'npm:sharp@0.34.1';

export async function greyscale(
    params: SingleImageTransform,
): Promise<TransformResult> {
    const { input } = params;

    const inputBuffer = await validateImagePath(input);

    const outputBuffer = await sharp(inputBuffer)
        .grayscale()
        .toBuffer();

    return new Uint8Array(outputBuffer);
}

processor.registerHandler('greyscale', greyscale);
