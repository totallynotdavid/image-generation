import {
  ImageInput,
  ImageProcessor,
  ProcessedOutput,
  ProcessingModule,
} from "./types.ts";
import { validateImage } from "../utils/image-validator.ts";

export class ImageProcessorImpl implements ImageProcessor {
  private modules: Map<string, ProcessingModule> = new Map();

  /**
   * Register an image processing module
   * @param name Module name
   * @param module Processing module implementation
   */
  registerModule(name: string, module: ProcessingModule): void {
    this.modules.set(name.toLowerCase(), module);
  }

  /**
   * Process an image using the specified module
   * @param input Image input (URL or Buffer)
   * @param moduleName Name of the module to use
   * @param args Additional arguments for the module
   * @returns Processed image as Buffer
   */
  async processImage(
    input: ImageInput,
    moduleName: string,
    ...args: any[]
  ): Promise<ProcessedOutput> {
    const module = this.modules.get(moduleName.toLowerCase());
    if (!module) {
      throw new Error(`Module not found: ${moduleName}`);
    }

    const validatedInput = await validateImage(input);
    if (!validatedInput) {
      throw new Error("Invalid image input");
    }

    return module.process(validatedInput, ...args);
  }
}
