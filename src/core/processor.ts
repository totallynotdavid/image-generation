import {
  ImageInput,
  ImageProcessor,
  MultiImageModule,
  ProcessedOutput,
  ProcessingModule,
  SingleImageModule,
} from "./types.ts";

interface ModuleWithFlag extends ProcessingModule {
  _acceptsMultipleImages?: boolean;
}

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
          `Module "${module.getName()}" requires a single image, but an array of images was provided.`,
        );
      }

      if (isMultiImageModule(module) && !Array.isArray(input)) {
        throw new Error(
          `Module "${module.getName()}" requires multiple images, but only a single image was provided.`,
        );
      }

      if (Array.isArray(input) && isMultiImageModule(module)) {
        return await (module as MultiImageModule).process(input, ...args);
      } else if (!Array.isArray(input) && isSingleImageModule(module)) {
        return await (module as SingleImageModule).process(input, ...args);
      } else {
        return await module.process(
          input as ImageInput | ImageInput[],
          ...args,
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Image processing failed in module "${module.getName()}": ${error.message}`,
        );
      }
      throw new Error(`Unknown error occurred in module "${module.getName()}"`);
    }
  }
}

function isSingleImageModule(
  module: ProcessingModule,
): module is SingleImageModule {
  return "process" in module &&
    module.process.length >= 1 &&
    !isMultiImageModule(module);
}

function isMultiImageModule(
  module: ProcessingModule,
): module is MultiImageModule {
  if (module.constructor.name.includes("Multi")) {
    return true;
  }

  const moduleWithFlag = module as ModuleWithFlag;
  return moduleWithFlag._acceptsMultipleImages === true;
}
