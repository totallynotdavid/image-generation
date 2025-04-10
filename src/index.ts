import { ImageProcessorImpl } from "./core/processor.ts";
import { AssetResolver } from "./core/asset-resolver.ts";
import { ImageInput, ImageProcessor, ProcessedOutput } from "./core/types.ts";

import { BlurFilter } from "./modules/filters/blur.ts";
import { GreyscaleFilter } from "./modules/filters/greyscale.ts";
import { InvertFilter } from "./modules/filters/invert.ts";
import { SepiaFilter } from "./modules/filters/sepia.ts";
import { GayFilter } from "./modules/filters/gay.ts";

import { BlinkGif } from "./modules/gif/blink.ts";
import { TriggeredGif } from "./modules/gif/triggered.ts";

import { AdMontage } from "./modules/montage/ad.ts";

import { CircleUtil } from "./modules/utils/circle.ts";
import { ColorUtil } from "./modules/utils/color.ts";

export function createProcessor(assetsPath?: string): ImageProcessor {
  const assetResolver = new AssetResolver(assetsPath);
  const processor = new ImageProcessorImpl();

  // Register all modules
  processor.registerModule("blur", new BlurFilter(assetResolver));
  processor.registerModule("greyscale", new GreyscaleFilter(assetResolver));
  processor.registerModule("invert", new InvertFilter(assetResolver));
  processor.registerModule("sepia", new SepiaFilter(assetResolver));
  processor.registerModule("gay", new GayFilter(assetResolver));

  processor.registerModule("blink", new BlinkGif(assetResolver));
  processor.registerModule("triggered", new TriggeredGif(assetResolver));

  processor.registerModule("ad", new AdMontage(assetResolver));

  processor.registerModule("circle", new CircleUtil(assetResolver));
  processor.registerModule("color", new ColorUtil(assetResolver));

  return processor;
}

/**
 * Processes an image using the specified module
 * @param input - Image input (file path, Buffer, or array of these)
 * @param moduleName - Name of the module to use
 * @param args - Additional arguments for the module
 * @returns Processed image as Buffer
 */
export async function processImage(
  input: ImageInput | ImageInput[],
  moduleName: string,
  ...args: unknown[]
): Promise<ProcessedOutput> {
  const processor = createProcessor();
  return await processor.processImage(input, moduleName, ...args);
}

export type {
  ImageInput,
  ImageProcessor,
  MultiImageModule,
  ProcessedOutput,
  SingleImageModule,
} from "./core/types.ts";

export default createProcessor();
