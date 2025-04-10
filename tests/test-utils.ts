import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import { AssetResolver } from "../src/core/asset-resolver.ts";
import { ImageInput } from "../src/core/types.ts";
import { Jimp } from "jimp";

/**
 * Creates a test asset resolver with a temporary directory
 * @returns An AssetResolver instance configured for testing
 */
export function createTestAssetResolver(): AssetResolver {
  const testAssetsDir = path.join(Deno.cwd(), "test-assets");

  // Ensure test assets directory exists
  if (!fs.existsSync(testAssetsDir)) {
    fs.mkdirSync(testAssetsDir, { recursive: true });
  }

  return new AssetResolver(testAssetsDir);
}

/**
 * Creates a sample test image
 * @param width Image width in pixels
 * @param height Image height in pixels
 * @param color Background color (hex string)
 * @returns Buffer containing the image data
 */
export async function createTestImage(
  width = 100,
  height = 100,
  color = "#FF0000",
): Promise<Buffer> {
  const image = await new Jimp({ width, height, color });
  return await image.getBuffer("image/png");
}

/**
 * Saves a test asset for use in tests
 * @param assetName Name to save the asset as
 * @param data The asset data to save
 * @returns The full path to the saved asset
 */
export function saveTestAsset(
  assetName: string,
  data: Buffer | string,
): string {
  const testAssetsDir = path.join(Deno.cwd(), "test-assets");
  const assetPath = path.join(testAssetsDir, assetName);

  if (typeof data === "string") {
    fs.writeFileSync(assetPath, data);
  } else {
    fs.writeFileSync(assetPath, data);
  }

  return assetPath;
}

/**
 * Simulates an image input for testing
 * @param type Type of input to create ('buffer' or 'path')
 * @returns An ImageInput for testing
 */
export async function createImageInput(
  type: "buffer" | "path" = "buffer",
): Promise<ImageInput> {
  const testImage = await createTestImage();

  if (type === "path") {
    const imagePath = saveTestAsset("test-image.png", testImage);
    return imagePath;
  }

  return testImage;
}

/**
 * Cleans up test assets after tests
 */
export function cleanupTestAssets(): void {
  const testAssetsDir = path.join(Deno.cwd(), "test-assets");

  if (fs.existsSync(testAssetsDir)) {
    // Delete all files in the directory
    const files = fs.readdirSync(testAssetsDir);
    for (const file of files) {
      fs.unlinkSync(path.join(testAssetsDir, file));
    }

    // Remove the directory
    fs.rmdirSync(testAssetsDir);
  }
}
