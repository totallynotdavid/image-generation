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

    const metadata = await sharp(inputBuffer).metadata();
    const { width = 0, height = 0 } = metadata;

    const size = Math.min(width, height);
    const circleRadius = size / 2;
    const borderRadius = circleRadius - (borderWidth / 2);

    const maskBuffer = await sharp({
        create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    })
        .composite([{
            input: Buffer.from(
                `<svg width="${size}" height="${size}">
              <circle cx="${size / 2}" cy="${
                    size / 2
                }" r="${circleRadius}" fill="white"/>
          </svg>`,
            ),
        }])
        .raw()
        .toBuffer();

    const output = await sharp(inputBuffer)
        .resize(size, size, {
            fit: 'cover',
            position: 'center',
        })
        .ensureAlpha()
        .raw()
        .toBuffer();

    const outputBuffer = Buffer.alloc(output.length);
    for (let i = 0; i < output.length; i += 4) {
        const maskAlpha = maskBuffer[i + 3] / 255;
        outputBuffer[i] = output[i]; // R
        outputBuffer[i + 1] = output[i + 1]; // G
        outputBuffer[i + 2] = output[i + 2]; // B
        outputBuffer[i + 3] = Math.round(output[i + 3] * maskAlpha); // A
    }

    let finalOutput = sharp(outputBuffer, {
        raw: {
            width: size,
            height: size,
            channels: 4,
        },
    });

    if (borderWidth > 0) {
        const borderSvg = `
      <svg width="${size}" height="${size}">
          <circle
              cx="${size / 2}"
              cy="${size / 2}"
              r="${borderRadius}"
              fill="none"
              stroke="${borderColor}"
              stroke-width="${borderWidth}"
          />
      </svg>`;

        finalOutput = finalOutput.composite([{
            input: Buffer.from(borderSvg),
            blend: 'over',
        }]);
    }

    const processedBuffer = await finalOutput
        .png()
        .toBuffer();

    return new Uint8Array(processedBuffer);
}

processor.registerHandler('circle', circle);
