import { Canvas, loadImage } from "canvas";
import GIFEncoder from "gifencoder";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class BlinkGif extends BaseModule {
  private static readonly CANVAS_SIZE = 480;

  /**
   * Creates a blinking GIF from multiple images
   * @param input Primary image input
   * @param args First argument: frame delay (ms), followed by additional images
   * @returns GIF buffer
   */
  async process(
    input: ImageInput,
    ...args: unknown[]
  ): Promise<ProcessedOutput> {
    const [delay, ...additionalImages] = args;

    if (typeof delay !== "number" || delay <= 0) {
      throw new TypeError(`Invalid delay: ${delay}. Expected positive number.`);
    }
    if (additionalImages.length === 0) {
      throw new Error(
        "At least two images are required for the blinking effect.",
      );
    }

    const allImages = [input, ...(additionalImages as ImageInput[])];

    const validatedImages = await Promise.all(
      allImages.map((img) => this.validateInput(img)),
    );

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
