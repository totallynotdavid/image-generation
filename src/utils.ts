import { readFile } from "node:fs/promises";
import { Animation, Image } from "imagescript";
import type { ImageInput, ResizeOptions } from "./types";
import { processingError } from "./errors";

function decode(data: Uint8Array): Promise<Image> {
  return Image.decode(data).catch(async (error: unknown) => {
    const animation = await Animation.decode(data, {
      onlyFirstFrame: true,
    }).catch(() => undefined);
    const first = animation?.frames[0];
    if (!first) throw error;
    return first;
  });
}

export async function loadImage(input: ImageInput): Promise<Image> {
  try {
    const data = typeof input === "string" ? await readFile(input) : input;
    return await decode(data);
  } catch (error) {
    throw processingError(error, "Failed to load image");
  }
}

export function resizeImage(image: Image, options: ResizeOptions): Image {
  const { width, height, mode } = options;
  if (!width && !height) return image;

  try {
    return image.resize(
      width ?? Image.RESIZE_AUTO,
      height ?? Image.RESIZE_AUTO,
      { mode },
    );
  } catch (error) {
    throw processingError(error, "Failed to resize image");
  }
}
