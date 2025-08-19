import { Image } from '@matmen/imagescript';
import { CircleParams, TransformResult } from '@/types.ts';
import { resolveAsset } from '@/utils.ts';
import { ProcessingError, throwProcessingError } from '@/errors.ts';
import { parseHex } from '@temelj/color';

const MAX_IMAGE_SIZE = 4096;

export async function circle(params: CircleParams): Promise<TransformResult> {
    try {
        const resolvedPath = await resolveAsset(params.input);
        const buffer = await Deno.readFile(resolvedPath);

        const image = await Image.decode(buffer);

        if (image.width === 0 || image.height === 0) {
            throw new ProcessingError('Image has zero dimensions');
        }

        if (image.width > MAX_IMAGE_SIZE || image.height > MAX_IMAGE_SIZE) {
            throw new ProcessingError(
                `Image too large: ${image.width}x${image.height}px`,
            );
        }

        const size = Math.min(image.width, image.height);
        const options = params.options;
        const borderWidth = Math.max(0, options?.borderWidth || 0);

        if (size + (borderWidth * 2) > MAX_IMAGE_SIZE) {
            throw new ProcessingError(
                `Resulting image size too large: ${size + (borderWidth * 2)}px`,
            );
        }

        let processedImage = image;
        if (image.width !== size || image.height !== size) {
            processedImage = image.cover(size, size);
        }

        if (borderWidth > 0) {
            return await createCircleWithBorder(
                processedImage,
                size,
                borderWidth,
                options?.borderColor,
            );
        } else {
            processedImage = processedImage.cropCircle();
            return await processedImage.encode();
        }
    } catch (error) {
        throwProcessingError(error, 'Failed to apply circle transform');
    }
}

async function createCircleWithBorder(
    image: Image,
    size: number,
    borderWidth: number,
    borderColor?: string,
): Promise<TransformResult> {
    const borderColorHex = borderColor || '#000000';

    const color = parseHex(borderColorHex);
    if (!color) {
        throw new ProcessingError(`Invalid border color: ${borderColorHex}`);
    }

    const { red: r, green: g, blue: b } = color;
    const borderColorRGBA = Image.rgbaToColor(r, g, b, 255);

    if (borderWidth >= size / 2) {
        throw new ProcessingError('Border width too large for image size');
    }

    const borderSize = size + (borderWidth * 2);
    const borderedImage = new Image(borderSize, borderSize);

    borderedImage.fill(0x00000000); // transparent background

    const borderRadius = borderSize / 2;
    const innerRadius = borderRadius - borderWidth;

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
    return await finalImage.encode();
}
