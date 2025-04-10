import { promises as fs } from "node:fs";
import { ImageInput } from "../core/types.ts";
import { Buffer } from "node:buffer";

/**
 * Validates and retrieves image data from a Buffer or file path.
 * @param input Image input (Buffer or file path)
 * @returns Validated image data as Buffer or null if invalid
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
