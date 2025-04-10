import { Canvas, loadImage } from "canvas";
import GIFEncoder from "gifencoder";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { SingleImageBaseModule } from "../base-module.ts"; // Changed to SingleImageBaseModule

interface TriggeredConfig {
  width: number;
  height: number;
  frameCount: number;
  baseOffsetY: number;
  randomRange: number;
  lightRandomRange: number;
}

export class TriggeredGif extends SingleImageBaseModule {
  private config: TriggeredConfig = {
    width: 256,
    height: 310,
    frameCount: 9,
    baseOffsetY: 54, // Where the "TRIGGERED" text starts
    randomRange: 20, // BR in original
    lightRandomRange: 10, // LR in original
  };

  async process(
    input: ImageInput,
    timeout: number = 15,
  ): Promise<ProcessedOutput> {
    if (typeof timeout !== "number" || isNaN(timeout)) {
      throw new Error("The timeout argument must be a number.");
    }

    const imageBuffer = await this.validateSingleInput(input);
    const img = await loadImage(imageBuffer);
    const basePath = this.assetResolver.resolveAsset("triggered.png");
    const base = await loadImage(basePath);

    const encoder = new GIFEncoder(this.config.width, this.config.height);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(timeout);

    const canvas = new Canvas(this.config.width, this.config.height);
    const ctx = canvas.getContext("2d");

    for (let i = 0; i < this.config.frameCount; i++) {
      ctx.clearRect(0, 0, this.config.width, this.config.height);

      // Draw the main image with random offset
      const randomOffsetX =
        Math.floor(Math.random() * this.config.randomRange) -
        this.config.randomRange;
      const randomOffsetY =
        Math.floor(Math.random() * this.config.randomRange) -
        this.config.randomRange;

      ctx.drawImage(
        img,
        randomOffsetX,
        randomOffsetY,
        this.config.width + this.config.randomRange,
        this.config.height - this.config.baseOffsetY + this.config.randomRange,
      );

      // Add red overlay
      ctx.fillStyle = "#FF000033";
      ctx.fillRect(0, 0, this.config.width, this.config.height);

      // Draw the "TRIGGERED" text with slight randomness
      const textRandomOffsetX =
        Math.floor(Math.random() * this.config.lightRandomRange) -
        this.config.lightRandomRange;
      const textRandomOffsetY =
        Math.floor(Math.random() * this.config.lightRandomRange) -
        this.config.lightRandomRange +
        (this.config.height - this.config.baseOffsetY);

      ctx.drawImage(
        base,
        textRandomOffsetX,
        textRandomOffsetY,
        this.config.width + this.config.lightRandomRange,
        this.config.baseOffsetY + this.config.lightRandomRange,
      );

      encoder.addFrame(ctx);
    }

    encoder.finish();
    return encoder.out.getData();
  }
}
