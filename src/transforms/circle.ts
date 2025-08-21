import { Image } from '@matmen/imagescript';
import { parseHex } from '@temelj/color';
import { CircleParams, TransformResult } from '@/types.ts';
import { applyBaseTransforms, loadImageFromInput } from '@/utils.ts';
import { ProcessingError, throwProcessingError } from '@/errors.ts';

export async function circle(params: CircleParams): Promise<TransformResult> {
    try {
        const originalImage = await loadImageFromInput(params.input);
        const image = applyBaseTransforms(originalImage, params.options);

        if (image.width === 0 || image.height === 0) {
            throw new ProcessingError('Image has zero dimensions');
        }

        const options = params.options;
        const borderWidth = Math.max(0, options?.borderWidth || 0);

        // smaller dimension is used to ensure we can fit a circle
        const size = Math.min(image.width, image.height);

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
            const circularImage = processedImage.cropCircle();
            return await circularImage.encode();
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
