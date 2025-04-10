import { Jimp } from "jimp";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class AdMontage extends BaseModule {
  /**
   * Create an "ad" meme with an image
   * @param input Image input
   * @returns Processed image
   */
  async process(input: ImageInput): Promise<ProcessedOutput> {
    const imageBuffer = await this.validateInput(input);

    const image = await Jimp.read(imageBuffer);
    image.resize(230, 230);

    const bgPath = this.assetResolver.resolveAsset("ad.png");
    const background = await Jimp.read(bgPath);
    background.composite(image, 150, 75);

    return background.getBufferAsync(Jimp.MIME_PNG);
  }
}
