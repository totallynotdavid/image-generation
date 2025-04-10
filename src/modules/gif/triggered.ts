import { Canvas, loadImage } from "canvas";
import GIFEncoder from "gifencoder";
import { ImageInput, ProcessedOutput } from "../../core/types.ts";
import { SingleImageBaseModule } from "../base-module.ts";
import { AssetResolver } from "../../core/asset-resolver.ts";

interface TriggeredConfig {
  width: number;
  height: number;
  frameCount: number;
  baseOffsetY: number;
  randomRange: number;
  lightRandomRange: number;
}

export class TriggeredGif extends SingleImageBaseModule {
  private readonly config: TriggeredConfig = {
    width: 256,
    height: 310,
    frameCount: 9,
    baseOffsetY: 54,
    randomRange: 20,
    lightRandomRange: 10,
  };

  constructor(assetResolver: AssetResolver) {
    super(assetResolver);
    this.validateConfig();
  }

  private validateConfig(): void {
    const {
      width,
      height,
      frameCount,
      baseOffsetY,
      randomRange,
      lightRandomRange,
    } = this.config;

    if (!Number.isInteger(width) || width <= 0) {
      throw new Error(`Invalid width: ${width}`);
    }

    if (!Number.isInteger(height) || height <= 0) {
      throw new Error(`Invalid height: ${height}`);
    }

    if (!Number.isInteger(frameCount) || frameCount <= 0) {
      throw new Error(`Invalid frameCount: ${frameCount}`);
    }

    if (!Number.isInteger(baseOffsetY) || baseOffsetY < 0) {
      throw new Error(`Invalid baseOffsetY: ${baseOffsetY}`);
    }

    if (!Number.isInteger(randomRange) || randomRange < 0) {
      throw new Error(`Invalid randomRange: ${randomRange}`);
    }

    if (!Number.isInteger(lightRandomRange) || lightRandomRange < 0) {
      throw new Error(`Invalid lightRandomRange: ${lightRandomRange}`);
    }
  }

  /**
   * Generate a bounded random offset within the specified range
   * @param range The maximum range for the random offset
   * @returns A random integer between -range and range
   */
  private getRandomOffset(range: number): number {
    // Use Math.floor to ensure integer values and handle the range properly
    return Math.floor(Math.random() * (2 * range + 1)) - range;
  }

  /**
   * Processes an image to create a "triggered" GIF animation
   * @param input The image to process
   * @param timeout The delay between frames in milliseconds (default: 15)
   * @returns A promise resolving to a buffer containing the generated GIF
   */
  async process(
    input: ImageInput,
    timeout: number = 15,
  ): Promise<ProcessedOutput> {
    if (typeof timeout !== "number" || isNaN(timeout) || timeout <= 0) {
      throw new Error(`Invalid timeout: ${timeout}. Expected positive number.`);
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

    // Generate frames for the GIF
    for (let i = 0; i < this.config.frameCount; i++) {
      ctx.clearRect(0, 0, this.config.width, this.config.height);

      const randomOffsetX = this.getRandomOffset(this.config.randomRange);
      const randomOffsetY = this.getRandomOffset(this.config.randomRange);

      ctx.drawImage(
        img,
        randomOffsetX,
        randomOffsetY,
        this.config.width + this.config.randomRange,
        this.config.height - this.config.baseOffsetY + this.config.randomRange,
      );

      // Add red tint overlay
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
      ctx.fillRect(0, 0, this.config.width, this.config.height);

      const textRandomOffsetX = this.getRandomOffset(
        this.config.lightRandomRange,
      );
      const textRandomOffsetY =
        this.getRandomOffset(this.config.lightRandomRange) +
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
