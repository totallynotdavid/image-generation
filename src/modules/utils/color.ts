import { Canvas } from "canvas";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class ColorUtil extends BaseModule {
  /**
   * Create a solid color image
   * @param color Color value (default: #FFFFFF)
   * @returns Color image
   */
  async process(
    _input: ImageInput | null = null,
    color: string = "#FFFFFF",
  ): Promise<ProcessedOutput> {
    const canvas = new Canvas(2048, 2048);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return canvas.toBuffer();
  }
}
