import { InvalidHexError, InvalidImageError } from '../errors.ts';

/**
 * Validates a hexadecimal color code
 * @param hex Hex color code to validate
 * @throws {InvalidHexError} If hex format is invalid
 */
export function validateHex(hex: string): void {
    const hexRegex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
    if (!hexRegex.test(hex)) {
        throw new InvalidHexError(hex);
    }
}

/**
 * Parses a hexadecimal color code to RGB components
 * @param hex Hex color code to parse
 * @returns Object with r, g, b number values (0-255)
 * @throws {InvalidHexError} If hex format is invalid
 */
export function parseHexColor(
    hex: string,
): { r: number; g: number; b: number } {
    // Validate the hex first
    validateHex(hex);

    const cleanHex = hex.replace('#', '');

    let r: number;
    let g: number;
    let b: number;

    if (cleanHex.length === 3) {
        // Handle shorthand hex format (#RGB)
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else {
        // Handle standard hex format (#RRGGBB)
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
    }

    return { r, g, b };
}

/**
 * Validates and reads an image file
 * @param path Path to the image file
 * @returns Promise resolving to the file contents as a Buffer
 * @throws {InvalidImageError} If file cannot be read or is invalid
 */
export async function validateImagePath(path: string): Promise<Uint8Array> {
    try {
        const fileData = await Deno.readFile(path);

        // Simple validation to check if it's an image
        // We check for common image file signatures
        if (fileData.length < 4) {
            throw new InvalidImageError('File too small to be a valid image');
        }

        // Check file signature for common image formats
        const isPNG = fileData[0] === 0x89 &&
            fileData[1] === 0x50 &&
            fileData[2] === 0x4E &&
            fileData[3] === 0x47;

        const isJPEG = fileData[0] === 0xFF &&
            fileData[1] === 0xD8;

        const isGIF = fileData[0] === 0x47 &&
            fileData[1] === 0x49 &&
            fileData[2] === 0x46 &&
            fileData[3] === 0x38;

        if (!(isPNG || isJPEG || isGIF)) {
            throw new InvalidImageError(
                'File does not appear to be a valid image',
            );
        }

        return fileData;
    } catch (error: unknown) {
        if (error instanceof InvalidImageError) {
            throw error;
        }

        if (error instanceof Deno.errors.NotFound) {
            throw new InvalidImageError(`File not found: ${path}`);
        }

        throw new InvalidImageError(
            `Failed to read image from path: ${path}`,
            error instanceof Error ? error : undefined,
        );
    }
}
