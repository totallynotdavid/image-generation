import { Canvas } from "canvas";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";
import { AssetResolver } from "../../core/asset-resolver.ts";

const DEFAULT_CONFIG = {
  width: 2048,
  height: 2048,
  defaultColor: "#FFFFFF",
};

export class ColorUtil extends BaseModule {
  private dimensions: { width: number; height: number };

  constructor(
    assetResolver: AssetResolver,
    config?: Partial<typeof DEFAULT_CONFIG>,
  ) {
    // Pass the assetResolver to the base class
    super(assetResolver);
    this.dimensions = {
      width: config?.width ?? DEFAULT_CONFIG.width,
      height: config?.height ?? DEFAULT_CONFIG.height,
    };
  }

  /**
   * Create a solid color image.
   * @param _input Unused input parameter to match interface signature
   * @param color Color value (default: #FFFFFF)
   * @returns Color image buffer
   * @throws Error if invalid color format
   */
  process(
    _inputs: ImageInput[],
    color: string = DEFAULT_CONFIG.defaultColor,
  ): Promise<ProcessedOutput> {
    if (!/^#([A-Fa-f0-9]{3,4}){1,2}$/.test(color)) {
      throw new Error(`Invalid color format: ${color}`);
    }

    const canvas = new Canvas(this.dimensions.width, this.dimensions.height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return Promise.resolve(canvas.toBuffer());
  }
}
