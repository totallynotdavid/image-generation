import { Jimp } from "jimp";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class CircleUtil extends BaseModule {
  async process(inputs: ImageInput[]): Promise<ProcessedOutput> {
    const validatedInputs = await this.validateInputs(inputs);
    const imageBuffer = validatedInputs[0];

    const image = await Jimp.read(imageBuffer);
    image.resize({ w: 480, h: 480 });
    image.circle();

    return await image.getBuffer("image/png");
  }
}
