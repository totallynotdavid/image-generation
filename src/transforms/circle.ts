import sharp from 'npm:sharp@0.34.1';
import { CircleParams, TransformResult } from '@/types.ts';
import { parseHexColor, resolveAsset } from '@/utils.ts';
import { ProcessingError } from '@/errors.ts';

export async function circle(params: CircleParams): Promise<TransformResult> {
    try {
        const resolvedPath = await resolveAsset(params.input);
        const buffer = await Deno.readFile(resolvedPath);

        const metadata = await sharp(buffer).metadata();
        const size = Math.min(metadata.width || 0, metadata.height || 0);
        const radius = size / 2;

        let pipeline = sharp(buffer)
            .resize(size, size, {
                fit: 'cover',
                position: 'center',
            });

        const options = params.options;
        const borderWidth = options?.borderWidth || 0;
        const borderColor = options?.borderColor || '#000000';

        if (borderWidth > 0) {
            parseHexColor(borderColor);

            const maskRadius = radius - borderWidth;

            const mask = await sharp({
                create: {
                    width: size,
                    height: size,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: 0 },
                },
            })
                .composite([{
                    input: Buffer.from(`
          <svg width="${size}" height="${size}">
            <circle cx="${radius}" cy="${radius}" r="${maskRadius}" fill="white"/>
          </svg>
        `),
                    blend: 'over',
                }])
                .png()
                .toBuffer();

            const border = Buffer.from(`
        <svg width="${size}" height="${size}">
          <circle cx="${radius}" cy="${radius}" r="${radius - borderWidth / 2}" 
                  stroke="${borderColor}" stroke-width="${borderWidth}" fill="none"/>
        </svg>
      `);

            pipeline = pipeline
                .composite([
                    { input: mask, blend: 'dest-in' },
                    { input: border, blend: 'over' },
                ]);
        } else {
            const mask = Buffer.from(`
        <svg width="${size}" height="${size}">
          <circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/>
        </svg>
      `);

            pipeline = pipeline.composite([{ input: mask, blend: 'dest-in' }]);
        }

        const result = await pipeline.png().toBuffer();
        return new Uint8Array(result);
    } catch (error) {
        throw new ProcessingError(
            `Failed to apply circle transform: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}
