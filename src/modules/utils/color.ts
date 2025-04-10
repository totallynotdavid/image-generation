import { Canvas } from "canvas";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";
import { AssetResolver } from "../../core/asset-resolver.ts";

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

export class ColorUtil extends BaseModule {
  private dimensions: { width: number; height: number };
  private defaultColor: string;

  constructor(
    assetResolver: AssetResolver,
    config?: Partial<ColorConfig>,
  ) {
    super(assetResolver);
    this.dimensions = {
      width: config?.width ?? DEFAULT_CONFIG.width,
      height: config?.height ?? DEFAULT_CONFIG.height,
    };
    this.defaultColor = config?.defaultColor ?? DEFAULT_CONFIG.defaultColor;
  }

  process(
    _input?: ImageInput | ImageInput[],
    color: string = this.defaultColor,
  ): Promise<ProcessedOutput> {
    // Validate color format
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
