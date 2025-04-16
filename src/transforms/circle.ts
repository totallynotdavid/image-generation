// transforms/circle.ts
import {
    SingleImageTransform,
    TransformMap,
    TransformResult,
} from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { validateImagePath } from '../validation/utils.ts';
import sharp from 'sharp';
import { Buffer } from 'node:buffer';

export async function circle(
    params: SingleImageTransform<TransformMap['circle']>,
): Promise<TransformResult> {
    const { input, options } = params;

    const {
        borderColor = '#000000',
        borderWidth = 0,
    } = options || {};

    const inputBuffer = await validateImagePath(input);

    // Get image dimensions
    const metadata = await sharp(inputBuffer).metadata();
    const { width = 0, height = 0 } = metadata;

    // Calculate circle mask parameters
    const size = Math.min(width, height);
    const circleRadius = size / 2 - borderWidth;

    const circleSvg = `
    <svg width="${size}" height="${size}">
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${circleRadius}"
        fill="white"
      />
    </svg>
  `;

    let outputBuffer = await sharp(inputBuffer)
        .resize(size, size)
        .composite([{
            input: Buffer.from(circleSvg),
            blend: 'dest-in',
        }]);

    if (borderWidth > 0) {
        const borderSvg = `
      <svg width="${size}" height="${size}">
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${circleRadius}"
          fill="none"
          stroke="${borderColor}"
          stroke-width="${borderWidth}"
        />
      </svg>
    `;

        outputBuffer = outputBuffer.composite([{
            input: Buffer.from(borderSvg),
            blend: 'over',
        }]);
    }

    const processedBuffer = await outputBuffer.toBuffer();

    return new Uint8Array(processedBuffer);
}

processor.registerHandler('circle', circle);
