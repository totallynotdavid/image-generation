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
   * Resolves an asset name to its full path
   * @param assetName - Name of the asset to resolve
   * @returns The full path to the asset
   * @throws Error if the asset is not found
   */
  resolveAsset(assetName: string): string {
    const assetPath = path.join(this.basePath, assetName);
    if (!fs.existsSync(assetPath)) {
      throw new Error(`Asset not found: ${assetName}`);
    }
    return assetPath;
  }
}
