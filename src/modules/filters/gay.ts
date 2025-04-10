import { Canvas, loadImage } from "canvas";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class GayFilter extends BaseModule {
  async process(inputs: ImageInput[]): Promise<ProcessedOutput> {
    const validatedInputs = await this.validateInputs(inputs);
    // Use the first image from the array
    const imageBuffer = validatedInputs[0];

    const canvas = new Canvas(480, 480);
    const ctx = canvas.getContext("2d");

    const img = await loadImage(imageBuffer);
    const bgPath = this.assetResolver.resolveAsset("gay.png");
    const bg = await loadImage(bgPath);

    ctx.drawImage(img, 0, 0, 480, 480);
    ctx.drawImage(bg, 0, 0, 480, 480);

    return canvas.toBuffer();
  }
}
