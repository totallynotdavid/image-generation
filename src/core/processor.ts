import {
  ImageInput,
  ImageProcessor,
  MultiImageModule,
  ProcessedOutput,
  ProcessingModule,
  SingleImageModule,
} from "./types.ts";

export class ImageProcessorImpl implements ImageProcessor {
  private modules: Map<string, ProcessingModule> = new Map();

  registerModule(name: string, module: ProcessingModule): void {
    const normalizedName = name.toLowerCase();
    if (this.modules.has(normalizedName)) {
      console.warn(`Overwriting existing module: ${normalizedName}`);
    }
    this.modules.set(normalizedName, module);
  }

  async processImage<T extends unknown[] = unknown[]>(
    input: ImageInput | ImageInput[],
    moduleName: string,
    ...args: T
  ): Promise<ProcessedOutput> {
    const normalizedName = moduleName.toLowerCase();
    const module = this.modules.get(normalizedName);

    if (!module) {
      throw new Error(
        `Module "${normalizedName}" not registered. Available modules: ${
          Array.from(this.modules.keys()).join(", ")
        }`,
      );
    }

    try {
      if (isSingleImageModule(module) && Array.isArray(input)) {
        throw new Error(
          `Module "${normalizedName}" requires a single image, but an array of images was provided.`,
        );
      }

      if (isMultiImageModule(module) && !Array.isArray(input)) {
        throw new Error(
          `Module "${normalizedName}" requires multiple images, but only a single image was provided.`,
        );
      }

      return await module.process(input as any, ...args);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Image processing failed in module "${normalizedName}": ${error.message}`,
        );
      }
      throw new Error(`Unknown error occurred in module "${normalizedName}"`);
    }
  }
}

function isSingleImageModule(
  module: ProcessingModule,
): module is SingleImageModule {
  return module instanceof isSingleImageModule;
}

function isMultiImageModule(
  module: ProcessingModule,
): module is MultiImageModule {
  return module instanceof isMultiImageModule;
}
