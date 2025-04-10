import { Jimp } from "jimp";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { SingleImageBaseModule } from "../base-module.ts";

export class GreyscaleFilter extends SingleImageBaseModule {
  async process(input: ImageInput): Promise<ProcessedOutput> {
    const imageBuffer = await this.validateSingleInput(input);

    const image = await Jimp.read(imageBuffer);
    image.greyscale();

    return await image.getBuffer("image/png");
  }
}
