import path from "node:path";
import fs from "node:fs";

import {
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.224.0/path/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));

export class AssetResolver {
  private basePath: string;

  constructor(assetsPath?: string) {
    this.basePath = assetsPath || join(__dirname, "..", "..", "assets");

    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  /**
   * Resolves an asset path and ensures it exists
   * @param assetName The name of the asset to resolve
   * @returns The full path to the asset
   * @throws Error if the asset cannot be found
   */
  resolveAsset(assetName: string): string {
    if (!assetName || typeof assetName !== "string") {
      throw new Error("Asset name must be a non-empty string");
    }

    const assetPath = path.join(this.basePath, assetName);
    if (!fs.existsSync(assetPath)) {
      throw new Error(`Asset not found: ${assetName}`);
    }
    return assetPath;
  }
}
