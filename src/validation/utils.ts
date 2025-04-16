import { promises as fs } from 'node:fs';
import { InvalidHexError, InvalidImageError } from '../errors.ts';
import { Buffer } from 'node:buffer';

/**
 * Validates a hex color string
 * Throws InvalidHexError if invalid
 */
export function validateHex(hex: string): void {
    const hexRegex = /^#([A-Fa-f0-9]{3,4}){1,2}$/;
    if (!hexRegex.test(hex)) {
        throw new InvalidHexError(hex);
    }
}

/**
 * Validates an image path exists and is readable
 * Returns the file buffer if valid
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
