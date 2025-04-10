import { Canvas, loadImage } from "canvas";
import GIFEncoder from "gifencoder";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { MultiImageBaseModule } from "../base-module.ts";

export class BlinkGif extends MultiImageBaseModule {
  private static readonly CANVAS_SIZE = 480;

  async process(
    inputs: ImageInput[],
    delay: number = 100,
  ): Promise<ProcessedOutput> {
    if (inputs.length < 2) {
      throw new Error(
        "At least two images are required for the blinking effect.",
      );
    }

    if (typeof delay !== "number" || delay <= 0) {
      throw new TypeError(`Invalid delay: ${delay}. Expected positive number.`);
    }

    const validatedImages = await this.validateMultipleInputs(inputs);

    const encoder = new GIFEncoder(
      BlinkGif.CANVAS_SIZE,
      BlinkGif.CANVAS_SIZE,
    );

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(delay);
    encoder.setTransparent(true);

    const canvas = new Canvas(
      BlinkGif.CANVAS_SIZE,
      BlinkGif.CANVAS_SIZE,
    );
    const ctx = canvas.getContext("2d");

    for (const imageBuffer of validatedImages) {
      const image = await loadImage(imageBuffer);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      encoder.addFrame(ctx);
    }

    encoder.finish();
    return encoder.out.getData();
  }
}
