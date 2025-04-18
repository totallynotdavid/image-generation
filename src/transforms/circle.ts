import {
    SingleImageTransform,
    TransformMap,
    TransformResult,
} from '@/types/transforms.ts';
import { validateImagePath } from '@/validation/utils.ts';
import { Buffer } from 'node:buffer';
import sharp, { Blend } from 'npm:sharp@0.34.1';

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

    const mask = Buffer.from(`
        <svg viewBox="0 0 ${size} ${size}">
            <circle cx="${circleRadius}" cy="${circleRadius}" 
                r="${circleRadius}" fill="black"/>
            <circle cx="${circleRadius}" cy="${circleRadius}" 
                r="${circleRadius - borderWidth}" fill="white"/>
        </svg>
    `);

    const border = borderWidth > 0
        ? Buffer.from(`
        <svg viewBox="0 0 ${size} ${size}">
            <circle cx="${circleRadius}" cy="${circleRadius}"
                r="${circleRadius - (borderWidth / 2)}"
                stroke="${borderColor}"
                stroke-width="${borderWidth}"
                fill="none"
            />
        </svg>
    `)
        : null;

    const pipeline = sharp(inputBuffer)
        .resize(size, size, {
            fit: 'cover',
            position: 'center',
            fastShrinkOnLoad: true,
        })
        .composite([
            {
                input: mask,
                blend: 'dest-in' as Blend,
            },
            ...(border
                ? [
                    {
                        input: border,
                        blend: 'over' as Blend,
                    },
                ]
                : []),
        ]);

    const processedBuffer = await pipeline.png().toBuffer();
    return new Uint8Array(processedBuffer);
}
