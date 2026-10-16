import { readFile } from "node:fs/promises";
import { Image } from "imagescript";
import type { ImageInput, ResizeOptions } from "./types";
import { throwProcessingError } from "./errors";

export async function loadImage(input: ImageInput): Promise<Image> {
  try {
    const data = typeof input === "string" ? await readFile(input) : input;
    return await Image.decode(data);
  } catch (error) {
    throwProcessingError(error, "Failed to load image");
  }
}

export function resizeImage(image: Image, options: ResizeOptions): Image {
  const { width, height, mode } = options;
  if (!width && !height) return image;

  return image.resize(width ?? Image.RESIZE_AUTO, height ?? Image.RESIZE_AUTO, { mode });
}
