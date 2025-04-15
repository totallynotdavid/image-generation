import { promises as fs } from "node:fs";
import { ImageInput } from "../core/types.ts";
import { Buffer } from "node:buffer";

/**
 * Validates and converts an image input to a Buffer
 * @param input The image input to validate (Buffer or file path)
 * @returns A promise resolving to a Buffer containing the image data, or null if invalid
 */
export async function validateImage(input: ImageInput): Promise<Buffer | null> {
  if (!input) return null;

  if (Buffer.isBuffer(input)) {
    return input;
  }

  if (typeof input === "string") {
    try {
      const fileBuffer = await fs.readFile(input);
      return fileBuffer;
    } catch (error) {
      console.error("Image validation error (file path):", error);
      return null;
    }
  }

  return null;
}

/**
 * Validates a color hex string
 * @param color The color hex string to validate
 * @returns True if the color is valid, false otherwise
 */
export function validateColorHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/
    .test(
      color,
    );
}
