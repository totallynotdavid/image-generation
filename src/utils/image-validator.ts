import { promises as fs } from "node:fs";
import { ImageInput } from "../core/types.ts";
import { Buffer } from "node:buffer";

/**
 * Validates and converts an image input to a Buffer
 * @param input - Image input (file path or Buffer)
 * @returns Buffer containing the image data or null if invalid
 */
export async function validateImage(input: ImageInput): Promise<Buffer | null> {
  if (!input) return null;

  if (Buffer.isBuffer(input)) {
    return input;
  }

  if (typeof input === "string") {
    try {
      return await fs.readFile(input);
    } catch (error) {
      console.error("Image validation error (file path):", error);
      return null;
    }
  }

  return null;
}
