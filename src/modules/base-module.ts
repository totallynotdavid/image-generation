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
  protected name: string;

  constructor(assetResolver: AssetResolver, name?: string) {
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

export abstract class SingleImageBaseModule extends BaseModule
  implements SingleImageModule {
  abstract override process(
    input: ImageInput,
    ...args: unknown[]
  ): Promise<ProcessedOutput>;

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

export abstract class MultiImageBaseModule extends BaseModule
  implements MultiImageModule {
  protected _acceptsMultipleImages = true;

  abstract override process(
    inputs: ImageInput[],
    ...args: unknown[]
  ): Promise<ProcessedOutput>;

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
