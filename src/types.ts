import type { ResizeMode } from "imagescript";

/** A file path, or encoded image bytes (PNG, JPEG, GIF, WebP, TIFF, TGA). */
export type ImageInput = string | Uint8Array;
/** An encoded PNG, or a GIF for `blink`. */
export type TransformResult = Uint8Array;

export interface ResizeOptions {
  width?: number;
  height?: number;
  /** Defaults to bilinear filtering. */
  mode?: ResizeMode;
}

export interface GreyscaleParams {
  input: ImageInput;
}

export interface ColorParams {
  input: ImageInput;
  /** `#rgb`, `#rrggbb` or `#rrggbbaa`, the `#` is optional. Default `#ffffff`. */
  hex?: string;
  /** Default `tint`. */
  blendMode?: "tint" | "softlight" | "wash";
  /** Share of the effect mixed into the image, 0 to 1. Default 0.3. */
  opacity?: number;
  /** Strength of the whole effect, 0 to 1. Default 1. */
  intensity?: number;
}

export interface CircleParams {
  input: ImageInput;
  /** Pixels added around the image. Default 0. */
  borderWidth?: number;
  /** Same formats as `ColorParams.hex`. Default `#000000`. */
  borderColor?: string;
}

export interface BlinkParams {
  /** At least two images. Every frame is cropped to the first image's size. */
  inputs: ImageInput[];
  /** Milliseconds per frame, at least 50. Default 200. */
  delay?: number;
  /** Repeat forever. Default true. */
  loop?: boolean;
}
