import { Jimp } from "jimp";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class BlurFilter extends BaseModule {
  /**
   * Apply blur effect to an image
   * @param input Image input
   * @param level Blur intensity level (default: 5)
   * @returns Processed image
   */
  async process(input: ImageInput, level?: number): Promise<ProcessedOutput> {
    const imageBuffer = await this.validateInput(input);
    const blurLevel = typeof level === "number" ? level : 5;

    const image = await Jimp.read(imageBuffer);
    image.blur(blurLevel);

    return await image.getBuffer("image/png");
  }
}
