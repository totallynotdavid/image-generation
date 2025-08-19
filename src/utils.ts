import { InvalidHexError, InvalidImageError } from '@/errors.ts';
import { isAbsolute, join } from '@std/path';

const IMAGE_SIGNATURES = {
    PNG: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
    JPEG: new Uint8Array([0xff, 0xd8]),
    GIF: new Uint8Array([0x47, 0x49, 0x46, 0x38]),
} as const;

function matchesSignature(data: Uint8Array, signature: Uint8Array): boolean {
    if (data.length < signature.length) return false;
    for (let i = 0; i < signature.length; i++) {
        if (data[i] !== signature[i]) return false;
    }
    return true;
}

async function validateImageFormat(path: string): Promise<void> {
    let file: Deno.FsFile;
    try {
        file = await Deno.open(path, { read: true });
        const header = new Uint8Array(4);
        const bytesRead = await file.read(header);

        if (!bytesRead || bytesRead < 4) {
            throw new InvalidImageError('File too small to be a valid image');
        }

        const isValid = matchesSignature(header, IMAGE_SIGNATURES.PNG) ||
            matchesSignature(header, IMAGE_SIGNATURES.JPEG) ||
            matchesSignature(header, IMAGE_SIGNATURES.GIF);

        if (!isValid) {
            throw new InvalidImageError(
                'File does not appear to be a valid image format (PNG, JPEG, or GIF)',
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

    // Determine candidate paths in order of preference
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

export function parseHexColor(
    hex: string,
): { r: number; g: number; b: number } {
    if (!hex || typeof hex !== 'string') {
        throw new InvalidHexError('Hex color must be a string');
    }

    const cleanHex = hex.replace('#', '');

    if (!/^[A-Fa-f0-9]{3}$|^[A-Fa-f0-9]{6}$/.test(cleanHex)) {
        throw new InvalidHexError(hex);
    }

    let r: number;
    let g: number;
    let b: number;

    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0].repeat(2), 16);
        g = parseInt(cleanHex[1].repeat(2), 16);
        b = parseInt(cleanHex[2].repeat(2), 16);
    } else {
        r = parseInt(cleanHex.slice(0, 2), 16);
        g = parseInt(cleanHex.slice(2, 4), 16);
        b = parseInt(cleanHex.slice(4, 6), 16);
    }

    return { r, g, b };
}
