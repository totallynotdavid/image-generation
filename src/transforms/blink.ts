import { Animation, Frame } from "imagescript";
import type { BlinkParams, TransformResult } from "../types";
import { loadImage } from "../utils";
import { ImageTransformError, ProcessingError, throwProcessingError } from "../errors";

const MIN_DELAY_MS = 50;

export async function blink(params: BlinkParams): Promise<TransformResult> {
  const { inputs, delay = 200, loop = true } = params;

  if (!inputs?.length || inputs.length < 2) {
    throw new ProcessingError("At least 2 images required for blink animation");
  }

  try {
    const images = await Promise.all(inputs.map(loadImage));
    const duration = Math.max(MIN_DELAY_MS, delay);
    const { width, height } = images[0]!;

    const frames = images.map((image) => {
      if (image.width !== width || image.height !== height) image.cover(width, height);
      return Frame.from(image, duration);
    });

    const animation = new Animation(frames, { loopCount: loop ? -1 : 0 });
    return await animation.encodeGIF();
  } catch (error) {
    if (error instanceof ImageTransformError) throw error;
    throwProcessingError(error, "Failed to create blink animation");
  }
}
