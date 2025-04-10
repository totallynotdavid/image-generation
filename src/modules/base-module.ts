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
    if (!input) return false;

    return typeof input === "string" || Buffer.isBuffer(input);
  }

  protected assetResolver: AssetResolver;

  constructor(assetResolver: AssetResolver) {
    this.assetResolver = assetResolver;
  }

  abstract process(
    input: ImageInput,
    ...args: unknown[]
  ): Promise<ProcessedOutput>;

  protected async validateInput(input: ImageInput): Promise<Buffer> {
    const validated = await validateImage(input);
    if (!validated) {
      throw new Error(
        "Invalid image input - must be valid file path or image buffer",
      );
    }
    return validated;
  }
}
