import { Canvas, loadImage } from "canvas";
import GIFEncoder from "gifencoder";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { BaseModule } from "../base-module.ts";

export class TriggeredGif extends BaseModule {
  /**
   * Create a "triggered" meme GIF
   * @param input Image input
   * @param timeout Frame delay in ms (default: 15)
   * @returns Processed GIF
   */
  async process(
    input: ImageInput,
    timeout: number = 15,
  ): Promise<ProcessedOutput> {
    const imageBuffer = await this.validateInput(input);

    if (isNaN(timeout)) {
      throw new Error("The timeout argument must be a number.");
    }

    const img = await loadImage(imageBuffer);
    const basePath = this.assetResolver.resolveAsset("triggered.png");
    const base = await loadImage(basePath);

    const encoder = new GIFEncoder(256, 310);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(timeout);

    const canvas = new Canvas(256, 310);
    const ctx = canvas.getContext("2d");

    const BR = 20;
    const LR = 10;

    for (let i = 0; i < 9; i++) {
      ctx.clearRect(0, 0, 256, 310);
      ctx.drawImage(
        img,
        Math.floor(Math.random() * BR) - BR,
        Math.floor(Math.random() * BR) - BR,
        256 + BR,
        310 - 54 + BR,
      );

      ctx.fillStyle = "#FF000033";
      ctx.fillRect(0, 0, 256, 310);

      ctx.drawImage(
        base,
        Math.floor(Math.random() * LR) - LR,
        310 - 54 + Math.floor(Math.random() * LR) - LR,
        256 + LR,
        54 + LR,
      );

      encoder.addFrame(ctx);
    }

    encoder.finish();
    return encoder.out.getData();
  }
}
