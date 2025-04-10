import https from "node:https";
import { promises as fs } from "node:fs";
import { ImageInput } from "../core/types.ts";
import { Buffer } from "node:buffer";

/**
 * Validates and retrieves image data from a URL, Buffer, or file path.
 * @param input Image input (URL, Buffer, or file path)
 * @returns Validated image data as Buffer or null if invalid
 */
export async function validateImage(input: ImageInput): Promise<Buffer | null> {
  if (!input) return null;

  // If already a buffer, return it.
  if (Buffer.isBuffer(input)) {
    return input;
  }

  // If it's a URL or file path provided as a string.
  if (typeof input === "string") {
    // If the string starts with "https://", treat it as a URL.
    if (input.startsWith("https://")) {
      try {
        return await fetchImage(input);
      } catch (error) {
        console.error("Image validation error (URL):", error);
        return null;
      }
    } else {
      // Otherwise assume it's a file path. Try reading the file.
      try {
        const fileBuffer = await fs.readFile(input);
        return fileBuffer;
      } catch (error) {
        console.error("Image validation error (file path):", error);
        return null;
      }
    }
  }

  return null;
}

/**
 * Fetches image data from a URL.
 * @param url Image URL
 * @returns Image data as Buffer
 */
async function fetchImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Invalid status code: ${response.statusCode}`));
      }

      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.startsWith("image/")) {
        return reject(new Error(`Invalid content type: ${contentType}`));
      }

      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", (err) => reject(err));
    }).on("error", (err) => reject(err));
  });
}
