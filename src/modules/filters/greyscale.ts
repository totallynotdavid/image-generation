import { Jimp } from "jimp";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class GreyscaleFilter extends BaseModule {
  /**
   * Apply greyscale effect to an image
   * @param input Image input
   * @returns Processed image
   */
  async process(input: ImageInput): Promise<ProcessedOutput> {
    const imageBuffer = await this.validateInput(input);

    const image = await Jimp.read(imageBuffer);
    image.greyscale();

    return await image.getBufferAsync(Jimp.MIME_PNG);
  }
}
