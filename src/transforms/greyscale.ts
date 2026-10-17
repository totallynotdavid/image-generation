import type { GreyscaleParams, TransformResult } from "../types";
import { loadImage } from "../utils";
import { ImageTransformError, processingError } from "../errors";

export async function greyscale(
  params: GreyscaleParams,
): Promise<TransformResult> {
  try {
    const image = await loadImage(params.input);
    return await image.greyscale().encode();
  } catch (error) {
    if (error instanceof ImageTransformError) throw error;
    throw processingError(error, "Failed to apply greyscale transform");
  }
}
