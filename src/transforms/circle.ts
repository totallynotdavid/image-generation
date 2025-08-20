import { Image } from '@matmen/imagescript';
import { parseHex } from '@temelj/color';
import { CircleParams, TransformResult } from '@/types.ts';
import { applyBaseTransforms, loadImage, resolveAsset } from '@/utils.ts';
import { ProcessingError, throwProcessingError } from '@/errors.ts';

export async function circle(params: CircleParams): Promise<TransformResult> {
    try {
        const resolvedPath = await resolveAsset(params.input);
        const originalImage = await loadImage(resolvedPath);

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

    borderedImage.fill(0x00000000); // transparent background

    const centerX = borderSize / 2;
    const centerY = borderSize / 2;
    const outerRadius = borderSize / 2;
    const innerRadius = outerRadius - borderWidth;

    borderedImage.drawCircle(centerX, centerY, outerRadius, borderColorRGBA);

    borderedImage.drawCircle(centerX, centerY, innerRadius, 0x00000000);

    const circularImage = image.cropCircle();
    borderedImage.composite(circularImage, borderWidth, borderWidth);

    const finalImage = borderedImage.cropCircle();
    return await finalImage.encode();
}
