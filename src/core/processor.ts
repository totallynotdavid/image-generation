import {
  ImageInput,
  ImageProcessor,
  ProcessedOutput,
  ProcessingModule,
} from "./types.ts";
import { validateImage } from "../utils/image-validator.ts";

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
    input: ImageInput,
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
      const validatedInput = await validateImage(input);
      if (!validatedInput) {
        throw new Error("Invalid image input - validation returned null");
      }
      return await module.process(validatedInput, ...args);
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
