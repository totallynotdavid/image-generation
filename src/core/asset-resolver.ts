import path from "node:path";
import fs from "node:fs";

import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));

export class AssetResolver {
  private basePath: string;

  constructor(assetsPath?: string) {
    this.basePath = assetsPath || join(__dirname, "..", "..", "assets");

    // Ensure the assets directory exists
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  /**
   * Resolves the path to an asset file
   * @param assetName Name of the asset file
   * @returns Full path to the asset
   */
  resolveAsset(assetName: string): string {
    const assetPath = path.join(this.basePath, assetName);
    if (!fs.existsSync(assetPath)) {
      throw new Error(`Asset not found: ${assetName}`);
    }
    return assetPath;
  }
}
