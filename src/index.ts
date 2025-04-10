import { ImageProcessorImpl } from "./core/processor.ts";
import { AssetResolver } from "./core/asset-resolver.ts";
import { ImageInput, ImageProcessor, ProcessedOutput } from "./core/types.ts";

// Import filter modules
import { BlurFilter } from "./modules/filters/blur.ts";
import { GreyscaleFilter } from "./modules/filters/greyscale.ts";
import { InvertFilter } from "./modules/filters/invert.ts";
import { SepiaFilter } from "./modules/filters/sepia.ts";
import { GayFilter } from "./modules/filters/gay.ts";

// Import GIF modules
import { BlinkGif } from "./modules/gif/blink.ts";
import { TriggeredGif } from "./modules/gif/triggered.ts";

// Import montage modules
import { AdMontage } from "./modules/montage/ad.ts";

// Import utility modules
import { CircleUtil } from "./modules/utils/circle.ts";
import { ColorUtil } from "./modules/utils/color.ts";

/**
 * Create an ImageProcessor instance with default configuration
 * @param assetsPath Optional custom path to assets directory
 * @returns Configured ImageProcessor instance
 */
export function createProcessor(assetsPath?: string): ImageProcessor {
  const assetResolver = new AssetResolver(assetsPath);
  const processor = new ImageProcessorImpl();

  // Register filter modules
  processor.registerModule("blur", new BlurFilter(assetResolver));
  processor.registerModule("greyscale", new GreyscaleFilter(assetResolver));
  processor.registerModule("invert", new InvertFilter(assetResolver));
  processor.registerModule("sepia", new SepiaFilter(assetResolver));
  processor.registerModule("gay", new GayFilter(assetResolver));

  // Register GIF modules
  processor.registerModule("blink", new BlinkGif(assetResolver));
  processor.registerModule("triggered", new TriggeredGif(assetResolver));

  // Register montage modules
  processor.registerModule("ad", new AdMontage(assetResolver));

  // Register utility modules
  processor.registerModule("circle", new CircleUtil(assetResolver));
  processor.registerModule("color", new ColorUtil(assetResolver));

  return processor;
}

/**
 * Process an image using a specified module
 * @param input Image input (valid file path or image Buffer)
 * @param moduleName Name of the processing module to use
 * @param args Additional arguments for the module
 * @returns Processed image buffer
 */
export async function processImage(
  input: ImageInput,
  moduleName: string,
  ...args: unknown[]
): Promise<ProcessedOutput> {
  const processor = createProcessor();
  return await processor.processImage(input, moduleName, ...args);
}

// Export types for library users
export type {
  ImageInput,
  ImageProcessor,
  ProcessedOutput,
} from "./core/types.ts";

// Export default processor instance
export default createProcessor();
