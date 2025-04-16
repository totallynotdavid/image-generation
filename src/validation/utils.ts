import { promises as fs } from 'node:fs';
import { InvalidHexError, InvalidImageError } from '../errors.ts';
import { Buffer } from 'node:buffer';

/**
 * Validates a hex color string.
 * Accepts both 3-digit (#rgb) and 6-digit (#rrggbb) formats.
 *
 * @param hex - The hex color string to validate (e.g., "#fff" or "#ffffff")
 * @throws {InvalidHexError} If the hex color format is invalid
 */
export function validateHex(hex: string): void {
    const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
    if (!hexRegex.test(hex)) {
        throw new InvalidHexError(hex);
    }
}

/**
 * Parses a hex color string into RGB components.
 * Handles both 3-digit (#rgb) and 6-digit (#rrggbb) formats.
 *
 * @param hex - The hex color string to parse (e.g., "#fff" or "#ffffff")
 * @returns An object with r, g, b values (0-255)
 * @throws {Error} If the hex color format is invalid
 */
export function parseHexColor(
    hex: string,
): { r: number; g: number; b: number } {
    const cleanHex = hex.replace('#', '');

    let r: number;
    let g: number;
    let b: number;

    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
    } else {
        throw new InvalidHexError(hex);
    }

    return { r, g, b };
}

/**
 * Validates an image path and returns its buffer.
 *
 * @param path - Path to the image file
 * @returns A Buffer containing the image data
 * @throws {InvalidImageError} If the image cannot be read
 */
export async function validateImagePath(path: string): Promise<Buffer> {
    try {
        return await fs.readFile(path);
    } catch (_error) {
        throw new InvalidImageError(
            `Failed to read image from path: ${path}`,
        );
    }
}
