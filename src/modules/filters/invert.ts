import { Jimp } from "jimp";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class InvertFilter extends BaseModule {
  /**
   * Apply invert effect to an image
   * @param input Image input
   * @returns Processed image
   */
  async process(input: ImageInput): Promise<ProcessedOutput> {
    const imageBuffer = await this.validateInput(input);

    const image = await Jimp.read(imageBuffer);
    image.invert();

    return await image.getBufferAsync(Jimp.MIME_PNG);
  }
}
