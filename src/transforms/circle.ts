import { Colors, Image } from "imagescript";
import type { CircleParams, TransformResult } from "../types";
import { parseHex } from "../hex";
import { loadImage } from "../utils";
import {
  ImageTransformError,
  ProcessingError,
  processingError,
} from "../errors";

export async function circle(params: CircleParams): Promise<TransformResult> {
  try {
    const requestedWidth = params.borderWidth ?? 0;
    if (Number.isNaN(requestedWidth)) {
      throw new ProcessingError("Invalid border width: NaN");
    }
    const borderWidth = Math.max(0, Math.round(requestedWidth));
    const borderColor = params.borderColor ?? "#000000";
    const border = parseHex(borderColor);
    if (!border) {
      throw new ProcessingError(`Invalid border color: ${borderColor}`);
    }

    const image = await loadImage(params.input);
    const size = Math.min(image.width, image.height);

    const disc = image
      .crop(
        Math.floor((image.width - size) / 2),
        Math.floor((image.height - size) / 2),
        size,
        size,
      )
      .cropCircle();
    if (borderWidth === 0) return await disc.encode();

    if (borderWidth >= size / 2) {
      throw new ProcessingError("Border width too large for image size");
    }

    const outerSize = size + borderWidth * 2;
    const ring = new Image(outerSize, outerSize)
      .fill(Colors.fromRGBA(border.red, border.green, border.blue, 255))
      .cropCircle();
    return await ring.composite(disc, borderWidth, borderWidth).encode();
  } catch (error) {
    if (error instanceof ImageTransformError) throw error;
    throw processingError(error, "Failed to apply circle transform");
  }
}
