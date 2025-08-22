import { Image } from '@matmen/imagescript';
import type { ImageInput, ResizeOptions } from '@/types.ts';
import { throwProcessingError } from '@/errors.ts';

export async function loadImage(input: ImageInput): Promise<Image> {
    try {
        if (typeof input === 'string') {
            const buffer = await Deno.readFile(input);
            return await Image.decode(buffer);
        } else {
            return await Image.decode(input);
        }
    } catch (error) {
        throwProcessingError(error, 'Failed to load image');
    }
}

export function resizeImage(image: Image, options: ResizeOptions): Image {
    const { width, height, mode } = options;
    if (!width && !height) return image;

    const resizeWidth = width ?? Image.RESIZE_AUTO;
    const resizeHeight = height ?? Image.RESIZE_AUTO;
    const resizeMode = mode ?? Image.RESIZE_NEAREST_NEIGHBOR;

    return image.resize(resizeWidth, resizeHeight, resizeMode);
}
