import {
  ImageInput,
  ProcessedOutput,
  ProcessingModule,
} from "../core/types.ts";
import { validateImage } from "../utils/image-validator.ts";
import { AssetResolver } from "../core/asset-resolver.ts";
import { Buffer } from "node:buffer";

export abstract class BaseModule implements ProcessingModule {
  static validateInput(input: ImageInput): boolean {
    if (!input) {
      return false;
    }

    if (typeof input === "string") {
      try {
        new URL(input);
        return true;
      } catch (_e) {
        return false;
      }
    } else if (Buffer.isBuffer(input)) {
      // Validate buffer has content
      return input.length > 0;
    }

    return false;
  }
  protected assetResolver: AssetResolver;

  constructor(assetResolver: AssetResolver) {
    this.assetResolver = assetResolver;
  }

  /**
   * Process an image using this module
   * @param input Image input (URL or Buffer)
   * @param args Additional arguments for processing
   */
  abstract process(input: ImageInput, ...args: any[]): Promise<ProcessedOutput>;

  /**
   * Validates image input and performs common error checking
   * @param input Image input
   * @returns Validated image buffer
   */
  protected async validateInput(input: ImageInput): Promise<Buffer> {
    const validated = await validateImage(input);
    if (!validated) {
      throw new Error("Invalid image input");
    }
    return validated;
  }
}
