import { Canvas, loadImage } from "canvas";
import GIFEncoder from "gifencoder";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";
import { Buffer } from "node:buffer";

export class BlinkGif extends BaseModule {
  /**
   * Create a blinking GIF from multiple images
   * @param delay Frame delay in ms
   * @param images Array of image inputs
   * @returns Processed GIF
   */
  async process(
    delay: number,
    ...images: ImageInput[]
  ): Promise<ProcessedOutput> {
    if (!images || images.length < 2) {
      throw new Error("You must provide at least two images.");
    }

    if (isNaN(delay)) {
      throw new Error("You must provide a valid delay.");
    }

    // Validate all images
    const validatedImages: Buffer[] = [];
    for (const image of images) {
      validatedImages.push(await this.validateInput(image));
    }

    const encoder = new GIFEncoder(480, 480);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(delay);
    encoder.setTransparent();

    const canvas = new Canvas(480, 480);
    const ctx = canvas.getContext("2d");

    for (const imageBuffer of validatedImages) {
      const base = await loadImage(imageBuffer);
      ctx.clearRect(0, 0, 480, 480);
      ctx.drawImage(base, 0, 0, 480, 480);
      encoder.addFrame(ctx);
    }

    encoder.finish();
    return encoder.out.getData();
  }
}
