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

export abstract class BaseModule implements ProcessingModule {
  protected assetResolver: AssetResolver;

  constructor(assetResolver: AssetResolver) {
    this.assetResolver = assetResolver;
  }

  abstract process(
    input: ImageInput | ImageInput[],
    ...args: unknown[]
  ): Promise<ProcessedOutput>;

  protected async validateSingleInput(input: ImageInput): Promise<Buffer> {
    const validated = await validateImage(input);
    if (!validated) {
      throw new Error(
        "Invalid image input - must be valid file path or image buffer",
      );
    }
    return validated;
  }

  protected async validateMultipleInputs(
    inputs: ImageInput[],
  ): Promise<Buffer[]> {
    if (!inputs || inputs.length === 0) {
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
}

export abstract class SingleImageBaseModule extends BaseModule
  implements SingleImageModule {
  abstract override process(
    input: ImageInput,
    ...args: unknown[]
  ): Promise<ProcessedOutput>;
}

export abstract class MultiImageBaseModule extends BaseModule
  implements MultiImageModule {
  abstract override process(
    inputs: ImageInput[],
    ...args: unknown[]
  ): Promise<ProcessedOutput>;
}
