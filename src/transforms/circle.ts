import {
    SingleImageTransform,
    TransformMap,
    TransformResult,
} from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { validateImagePath } from '../validation/utils.ts';
import { ProcessingError } from '../errors.ts';
import { Buffer } from 'node:buffer';
import sharp from 'npm:sharp@0.34.1';

/**
 * Apply a circular mask to an image, optionally with a border
 * @param params Transform parameters
 * @returns Transformed image data as Uint8Array
 */
export async function circle(
    params: SingleImageTransform<TransformMap['circle']>,
): Promise<TransformResult> {
    const { input, options } = params;

    const {
        borderColor = '#000000',
        borderWidth = 0,
    } = options || {};

    try {
        const inputBuffer = await validateImagePath(input);

        // Get image metadata
        const metadata = await sharp(inputBuffer).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        if (width === 0 || height === 0) {
            throw new ProcessingError('Invalid image dimensions');
        }

        // Calculate circle dimensions
        const size = Math.min(width, height);
        const circleRadius = size / 2;
        const borderRadius = circleRadius - (borderWidth / 2);

        // Create circular mask SVG
        const circleMask = `<svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${
            size / 2
        }" r="${circleRadius}" fill="white"/>
      </svg>`;

        // Create a pipeline for processing the image
        let pipeline = sharp(inputBuffer)
            .resize(size, size, {
                fit: 'cover',
                position: 'center',
            })
            .composite([{
                input: Buffer.from(circleMask),
                blend: 'dest-in',
            }]);

        // Add border if specified
        if (borderWidth > 0) {
            const borderSvg = `<svg width="${size}" height="${size}">
          <circle
            cx="${size / 2}"
            cy="${size / 2}" 
            r="${borderRadius}"
            fill="none"
            stroke="${borderColor}"
            stroke-width="${borderWidth}"
          />
        </svg>`;

            pipeline = pipeline.composite([{
                input: Buffer.from(borderSvg),
                blend: 'over',
            }]);
        }

        // Generate output
        const processedBuffer = await pipeline.png().toBuffer();
        return new Uint8Array(processedBuffer);
    } catch (error: unknown) {
        throw new ProcessingError(
            `Failed to apply circle transform: ${
                error instanceof Error ? error.message : 'Unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}

// Register the transform handler
processor.registerHandler('circle', circle);
