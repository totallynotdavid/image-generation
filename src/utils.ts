import { InvalidImageError } from '@/errors.ts';
import { isAbsolute, join } from '@std/path';
import { Image } from '@matmen/imagescript';

const MIN_FILE_SIZE = 4;

const IMAGE_SIGNATURES = {
    PNG: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
    JPEG: new Uint8Array([0xff, 0xd8]),
    GIF: new Uint8Array([0x47, 0x49, 0x46, 0x38]),
    WEBP: new Uint8Array([0x52, 0x49, 0x46, 0x46]),
} as const;


function matchesSignature(data: Uint8Array, signature: Uint8Array): boolean {
    if (data.length < signature.length) return false;
    for (let i = 0; i < signature.length; i++) {
        if (data[i] !== signature[i]) return false;
    }
    return true;
}

async function validateImageFormat(path: string): Promise<void> {
    let file: Deno.FsFile | undefined;
    try {
        file = await Deno.open(path, { read: true });
        const header = new Uint8Array(12);
        const bytesRead = await file.read(header);

        if (!bytesRead || bytesRead < MIN_FILE_SIZE) {
            throw new InvalidImageError('File too small to be a valid image');
        }

        const isValid = matchesSignature(header, IMAGE_SIGNATURES.PNG) ||
            matchesSignature(header, IMAGE_SIGNATURES.JPEG) ||
            matchesSignature(header, IMAGE_SIGNATURES.GIF) ||
            (matchesSignature(header, IMAGE_SIGNATURES.WEBP) &&
                header.slice(8, 12).some((b) => b === 0x57));

        if (!isValid) {
            throw new InvalidImageError(
                'File does not appear to be a valid image format (PNG, JPEG, GIF, or WEBP)',
            );
        }
    } catch (error) {
        if (error instanceof InvalidImageError) throw error;
        if (error instanceof Deno.errors.NotFound) {
            throw new InvalidImageError(`File not found: ${path}`);
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
            continue;
        }
    }

    throw new InvalidImageError(`Asset not found: ${assetName}`);
}

export async function loadImage(path: string): Promise<Image> {
    try {
        const buffer = await Deno.readFile(path);
        const image = await Image.decode(buffer);

        if (image.width === 0 || image.height === 0) {
            throw new InvalidImageError('Image has zero dimensions');
        }

        return image;
    } catch (error) {
        if (error instanceof InvalidImageError) throw error;
        throw new InvalidImageError(
            `Failed to load image: ${
                error instanceof Error ? error.message : 'unknown error'
            }`,
            error instanceof Error ? error : undefined,
        );
    }
}
