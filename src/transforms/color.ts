import sharp from 'npm:sharp@0.34.1';
import { ColorParams, TransformResult } from '@/types.ts';
import { parseHexColor, resolveAsset } from '@/utils.ts';
import { ProcessingError } from '@/errors.ts';

export async function color(params: ColorParams): Promise<TransformResult> {
    try {
        const { r, g, b } = parseHexColor(params.options.hex);
        const resolvedPath = await resolveAsset(params.input);
        const buffer = await Deno.readFile(resolvedPath);

        let pipeline = sharp(buffer);

        if (params.options.blendMode === 'softlight') {
            pipeline = pipeline.modulate({
                brightness: 1,
                saturation: 1.2,
                hue: 30,
            });
        }

        const result = await pipeline
            .tint({ r, g, b })
            .toBuffer();

        return new Uint8Array(result);
    } catch (error) {
        throw new ProcessingError(
            `Failed to apply color transform: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}
