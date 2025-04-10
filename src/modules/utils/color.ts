import { Canvas } from "canvas";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";
import { AssetResolver } from "../../core/asset-resolver.ts";
import { validateColorHex } from "../../utils/image-validator.ts";

/**
 * Configuration for the color utility
 */
interface ColorConfig {
  width: number;
  height: number;
  defaultColor: string;
}

const DEFAULT_CONFIG: ColorConfig = {
  width: 2048,
  height: 2048,
  defaultColor: "#FFFFFF",
};

/**
 * Utility for creating solid color images
 */
export class ColorUtil extends BaseModule {
  private dimensions: { width: number; height: number };
  private defaultColor: string;

  constructor(
    assetResolver: AssetResolver,
    config?: Partial<ColorConfig>,
  ) {
    super(assetResolver);

    const width = config?.width ?? DEFAULT_CONFIG.width;
    const height = config?.height ?? DEFAULT_CONFIG.height;

    if (
      !Number.isInteger(width) || !Number.isInteger(height) || width <= 0 ||
      height <= 0
    ) {
      throw new Error(`Invalid dimensions: width=${width}, height=${height}`);
    }

    const defaultColor = config?.defaultColor ?? DEFAULT_CONFIG.defaultColor;

    if (!validateColorHex(defaultColor)) {
      throw new Error(`Invalid default color format: ${defaultColor}`);
    }

    this.dimensions = { width, height };
    this.defaultColor = defaultColor;
  }

  /**
   * Generates a solid color image
   * @param input Unused parameter (maintained for interface compatibility)
   * @param color Hex color string (defaults to the configured default color)
   * @returns A promise resolving to a buffer containing the generated image
   */
  process(
    _input?: ImageInput | ImageInput[],
    color: string = this.defaultColor,
  ): Promise<ProcessedOutput> {
    // Validate the color format
    if (!validateColorHex(color)) {
      throw new Error(`Invalid color format: ${color}`);
    }

    const canvas = new Canvas(this.dimensions.width, this.dimensions.height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return Promise.resolve(canvas.toBuffer());
  }
}
