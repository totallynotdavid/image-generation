import sharp from 'npm:sharp@0.34.1';
import { GreyscaleParams, TransformResult } from '@/types.ts';
import { resolveAsset } from '@/utils.ts';
import { ProcessingError } from '@/errors.ts';

export async function greyscale(
    params: GreyscaleParams,
): Promise<TransformResult> {
    try {
        const resolvedPath = await resolveAsset(params.input);
        const buffer = await Deno.readFile(resolvedPath);

        const result = await sharp(buffer)
            .grayscale()
            .toBuffer();

        return new Uint8Array(result);
    } catch (error) {
        throw new ProcessingError(
            `Failed to apply grayscale transform: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}
