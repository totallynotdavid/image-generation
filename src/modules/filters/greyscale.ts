import { Jimp } from "jimp";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class GreyscaleFilter extends BaseModule {
  async process(inputs: ImageInput[]): Promise<ProcessedOutput> {
    const validatedInputs = await this.validateInputs(inputs);
    const imageBuffer = validatedInputs[0];

    const image = await Jimp.read(imageBuffer);
    image.greyscale();

    return await image.getBuffer("image/png");
  }
}
