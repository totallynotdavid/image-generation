import { InvalidImageError } from '@/errors.ts';
import { isAbsolute, join } from '@std/path';
import { Image } from '@matmen/imagescript';
import type { TransformOptions } from '@/types.ts';

const IMAGE_SIGNATURES = {
    PNG: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
    JPEG: new Uint8Array([0xff, 0xd8]),
    GIF: new Uint8Array([0x47, 0x49, 0x46, 0x38]),
    WEBP_RIFF: new Uint8Array([0x52, 0x49, 0x46, 0x46]),
    WEBP_WEBP: new Uint8Array([0x57, 0x45, 0x42, 0x50]),
} as const;

const validatedPaths = new Set<string>();

function matchesSignature(data: Uint8Array, signature: Uint8Array): boolean {
    if (data.length < signature.length) return false;
    return signature.every((byte, i) => data[i] === byte);
}

function isWebP(header: Uint8Array): boolean {
    return (
        matchesSignature(header, IMAGE_SIGNATURES.WEBP_RIFF) &&
        matchesSignature(header.slice(8, 12), IMAGE_SIGNATURES.WEBP_WEBP)
    );
}

async function validateImageFormat(path: string): Promise<void> {
    if (validatedPaths.has(path)) return;

    let file: Deno.FsFile | undefined;
    try {
        file = await Deno.open(path, { read: true });
        const header = new Uint8Array(12);
        const bytesRead = await file.read(header);

        if (!bytesRead || bytesRead < 12) {
            throw new InvalidImageError('File too small to be a valid image');
        }

        const isValid = matchesSignature(header, IMAGE_SIGNATURES.PNG) ||
            matchesSignature(header, IMAGE_SIGNATURES.JPEG) ||
            matchesSignature(header, IMAGE_SIGNATURES.GIF) ||
            isWebP(header);

        if (!isValid) {
            throw new InvalidImageError(
                'File does not appear to be a valid image format (PNG, JPEG, GIF, or WEBP)',
            );
        }

        validatedPaths.add(path);
    } catch (error) {
        if (error instanceof InvalidImageError) throw error;
        if (error instanceof Deno.errors.NotFound) {
            throw new InvalidImageError(`File not found: ${path}`, error);
        }
        throw new InvalidImageError(
            `Failed to validate image: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    } finally {
        file?.close();
    }
}

export async function resolveAsset(
    assetName: string,
    basePath = './assets',
): Promise<string> {
    if (!assetName?.trim()) {
        throw new InvalidImageError('Asset name must be a non-empty string');
    }

    const candidates = isAbsolute(assetName)
        ? [assetName]
        : [assetName, join(basePath, assetName)];

    for (const path of candidates) {
        try {
            const stat = await Deno.stat(path);
            if (!stat.isFile) continue;

            await validateImageFormat(path);
            return path;
        } catch (error) {
            if (error instanceof InvalidImageError) throw error;
        }
    }

    throw new InvalidImageError(`Asset not found: ${assetName}`);
}

export async function loadImage(path: string): Promise<Image> {
    try {
        const buffer = await Deno.readFile(path);
        return await Image.decode(buffer);
    } catch (error) {
        throw new InvalidImageError(
            `Failed to load image: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}

export function applyBaseTransforms(
    image: Image,
    options?: TransformOptions,
): Image {
    if (!options?.resize) return image;

    const { width, height, mode } = options.resize;

    if (!width && !height) return image;

    const resizeWidth = width ?? Image.RESIZE_AUTO;
    const resizeHeight = height ?? Image.RESIZE_AUTO;
    const resizeMode = mode ?? Image.RESIZE_NEAREST_NEIGHBOR;

    return image.resize(resizeWidth, resizeHeight, resizeMode);
}
