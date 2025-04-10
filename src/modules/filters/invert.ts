import { Jimp } from "jimp";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class InvertFilter extends BaseModule {
  async process(input: ImageInput): Promise<ProcessedOutput> {
    const imageBuffer = await this.validateInput(input);

    const image = await Jimp.read(imageBuffer);
    image.invert();

    return await image.getBuffer("image/png");
  }
}
