import { Image } from '@matmen/imagescript';
import { parseHex } from '@temelj/color';
import type { CircleParams, TransformResult } from '@/types.ts';
import { loadImage } from '@/utils.ts';
import {
    ImageTransformError,
    ProcessingError,
    throwProcessingError,
} from '@/errors.ts';

export async function circle(params: CircleParams): Promise<TransformResult> {
    try {
        const image = await loadImage(params.input);

        if (image.width === 0 || image.height === 0) {
            throw new ProcessingError('Image has zero dimensions');
        }

        const borderWidth = Math.max(0, params.borderWidth || 0);
        const size = Math.min(image.width, image.height);

        let processedImage = image;
        if (image.width !== size || image.height !== size) {
            processedImage = image.cover(size, size);
        }

        if (borderWidth === 0) {
            const circularImage = processedImage.cropCircle();
            return await circularImage.encode();
        }

        return await createCircleWithBorder(
            processedImage,
            size,
            borderWidth,
            params.borderColor,
        );
    } catch (error) {
        if (error instanceof ImageTransformError) throw error;
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

    const centerX = borderSize / 2;
    const centerY = borderSize / 2;
    const outerRadiusSquared = (borderSize / 2) ** 2;
    const innerRadiusSquared = (borderSize / 2 - borderWidth) ** 2;

    borderedImage.fill((x: number, y: number) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distanceSquared = dx * dx + dy * dy;

        return (distanceSquared <= outerRadiusSquared &&
                distanceSquared > innerRadiusSquared)
            ? borderColorRGBA
            : 0x00000000;
    });

    const circularImage = image.cropCircle();
    borderedImage.composite(circularImage, borderWidth, borderWidth);

    const finalImage = borderedImage.cropCircle();
    return await finalImage.encode();
}
