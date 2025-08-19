import { Image } from '@matmen/imagescript';
import { CircleParams, TransformResult } from '@/types.ts';
import { parseHexColor, resolveAsset } from '@/utils.ts';
import { ProcessingError } from '@/errors.ts';

export async function circle(params: CircleParams): Promise<TransformResult> {
    try {
        const resolvedPath = await resolveAsset(params.input);
        const buffer = await Deno.readFile(resolvedPath);

        const image = await Image.decode(buffer);

        if (image.width === 0 || image.height === 0) {
            throw new ProcessingError('Image has zero dimensions');
        }

        const size = Math.min(image.width, image.height);
        const options = params.options;
        const borderWidth = options?.borderWidth || 0;

        if (borderWidth < 0) {
            throw new ProcessingError('Border width must be non-negative');
        }

        const maxSize = 4096;
        if (size + (borderWidth * 2) > maxSize) {
            throw new ProcessingError(
                `Resulting image size too large: ${size + (borderWidth * 2)}px`,
            );
        }

        let processedImage = image;
        if (image.width !== size || image.height !== size) {
            processedImage = image.cover(size, size);
        }

        if (borderWidth > 0) {
            return createCircleWithBorder(
                processedImage,
                size,
                borderWidth,
                options?.borderColor,
            );
        } else {
            processedImage = processedImage.cropCircle();
            const result = await processedImage.encode();
            return new Uint8Array(result);
        }
    } catch (error) {
        if (error instanceof ProcessingError) {
            throw error;
        }
        throw new ProcessingError(
            `Failed to apply circle transform: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}

async function createCircleWithBorder(
    image: Image,
    size: number,
    borderWidth: number,
    borderColor?: string,
): Promise<TransformResult> {
    const borderColorHex = borderColor || '#000000';

    const { r, g, b } = parseHexColor(borderColorHex);
    const borderColorRGBA = Image.rgbaToColor(r, g, b, 255);

    const borderSize = size + (borderWidth * 2);
    const borderedImage = new Image(borderSize, borderSize);

    borderedImage.fill(0x00000000); // transparent background

    const borderRadius = borderSize / 2;
    const innerRadius = borderRadius - borderWidth;

    if (innerRadius <= 0) {
        throw new ProcessingError('Border width too large for image size');
    }

    borderedImage.drawCircle(
        borderRadius,
        borderRadius,
        borderRadius,
        borderColorRGBA,
    );

    borderedImage.drawCircle(
        borderRadius,
        borderRadius,
        innerRadius,
        0x00000000,
    );

    const circularImage = image.cropCircle();

    borderedImage.composite(circularImage, borderWidth, borderWidth);

    const finalImage = borderedImage.cropCircle();
    const result = await finalImage.encode();
    return new Uint8Array(result);
}
