import {
  ImageInput,
  MultiImageModule,
  ProcessedOutput,
  ProcessingModule,
  SingleImageModule,
} from "../core/types.ts";
import { validateImage } from "../utils/image-validator.ts";
import { AssetResolver } from "../core/asset-resolver.ts";
import { Buffer } from "node:buffer";

/**
 * Base abstract class for all image processing modules
 */
export abstract class BaseModule implements ProcessingModule {
  protected assetResolver: AssetResolver;
  protected name: string;

  constructor(assetResolver: AssetResolver, name?: string) {
    if (!assetResolver) {
      throw new Error("AssetResolver is required");
    }

    this.assetResolver = assetResolver;
    this.name = name || this.constructor.name;
  }

  getName(): string {
    return this.name;
  }

  abstract process(
    input: ImageInput | ImageInput[],
    ...args: unknown[]
  ): Promise<ProcessedOutput>;

  /**
   * Validates a single image input
   * @param input The image input to validate
   * @returns A promise resolving to a buffer containing the image data
   * @throws Error if the image is invalid
   */
  protected async validateSingleInput(input: ImageInput): Promise<Buffer> {
    const validated = await validateImage(input);
    if (!validated) {
      throw new Error(
        "Invalid image input - must be valid file path or image buffer",
      );
    }
    return validated;
  }

  /**
   * Validates an array of image inputs
   * @param inputs An array of image inputs to validate
   * @returns A promise resolving to an array of buffers containing the image data
   * @throws Error if any image is invalid
   */
  protected async validateMultipleInputs(
    inputs: ImageInput[],
  ): Promise<Buffer[]> {
    if (!inputs || !Array.isArray(inputs) || inputs.length === 0) {
      throw new Error("At least one image input is required");
    }

    return await Promise.all(
      inputs.map(async (input, index) => {
        const validated = await validateImage(input);
        if (!validated) {
          throw new Error(`Invalid image input at position ${index}`);
        }
        return validated;
      }),
    );
  }

  /**
   * Validates image inputs, whether single or multiple
   * @param inputs The image input(s) to validate
   * @returns A promise resolving to an array of buffers containing the image data
   * @throws Error if any image is invalid
   */
  protected async validateInputs(
    inputs: ImageInput | ImageInput[],
  ): Promise<Buffer[]> {
    if (Array.isArray(inputs)) {
      return this.validateMultipleInputs(inputs);
    } else {
      const singleBuffer = await this.validateSingleInput(inputs);
      return [singleBuffer];
    }
  }
}

/**
 * Base abstract class for modules that process a single image
 */
export abstract class SingleImageBaseModule extends BaseModule
  implements SingleImageModule {
  abstract override process(
    input: ImageInput,
    ...args: unknown[]
  ): Promise<ProcessedOutput>;

  /**
   * Validates a single image input
   * @param input The image input to validate
   * @returns A promise resolving to an array containing a single buffer with the image data
   * @throws Error if the image is invalid or if an array is provided
   */
  protected override async validateInputs(
    input: ImageInput,
  ): Promise<Buffer[]> {
    if (Array.isArray(input)) {
      throw new Error(
        `${this.getName()} requires a single image, but an array was provided`,
      );
    }
    const validated = await this.validateSingleInput(input);
    return [validated];
  }
}

/**
 * Base abstract class for modules that process multiple images
 */
export abstract class MultiImageBaseModule extends BaseModule
  implements MultiImageModule {
  protected _acceptsMultipleImages = true;

  abstract override process(
    inputs: ImageInput[],
    ...args: unknown[]
  ): Promise<ProcessedOutput>;

  /**
   * Validates multiple image inputs
   * @param inputs The image inputs to validate
   * @returns A promise resolving to an array of buffers containing the image data
   * @throws Error if the inputs are invalid or if a single image is provided
   */
  protected override validateInputs(
    inputs: ImageInput | ImageInput[],
  ): Promise<Buffer[]> {
    if (!Array.isArray(inputs)) {
      throw new Error(
        `${this.getName()} requires multiple images, but a single image was provided`,
      );
    }
    return this.validateMultipleInputs(inputs);
  }
}
