import type { ColorParams, TransformResult } from "../types";
import { parseHex, type Rgb } from "../hex";
import { loadImage } from "../utils";
import {
  ImageTransformError,
  ProcessingError,
  processingError,
} from "../errors";

type BlendMode = NonNullable<ColorParams["blendMode"]>;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function softLight(base: number, overlay: number): number {
  if (overlay < 0.5) return base - (1 - 2 * overlay) * base * (1 - base);
  const curve =
    base <= 0.25 ? ((16 * base - 12) * base + 4) * base : Math.sqrt(base);
  return base + (2 * overlay - 1) * (curve - base);
}

function mix(base: number, effect: number, amount: number): number {
  return (effect * amount + base * (1 - amount)) | 0;
}

function hueAndSaturation({ red, green, blue }: Rgb): {
  hue: number;
  saturation: number;
} {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return { hue: 0, saturation: 0 };

  const delta = max - min;
  const saturation =
    (max + min) / 2 > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue: number;
  if (max === r) hue = (g - b) / delta + (g < b ? 6 : 0);
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  return { hue: hue / 6, saturation };
}

function hueToChannel(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/**
 * The tint colors for every lightness a pixel can have. A pixel's lightness is
 * (max + min) / 510 of its channels, so 511 entries cover all of them.
 */
function tintTable(tint: Rgb): Uint8Array {
  const { hue, saturation } = hueAndSaturation(tint);
  const table = new Uint8Array(511 * 3);
  for (let sum = 0; sum <= 510; sum++) {
    const lightness = sum / 510;
    let r = lightness;
    let g = lightness;
    let b = lightness;
    if (saturation !== 0) {
      const q =
        lightness < 0.5
          ? lightness * (1 + saturation)
          : lightness + saturation - lightness * saturation;
      const p = 2 * lightness - q;
      r = hueToChannel(p, q, hue + 1 / 3);
      g = hueToChannel(p, q, hue);
      b = hueToChannel(p, q, hue - 1 / 3);
    }
    table[sum * 3] = Math.round(r * 255);
    table[sum * 3 + 1] = Math.round(g * 255);
    table[sum * 3 + 2] = Math.round(b * 255);
  }
  return table;
}

/** Lookup table for modes that blend each channel independently. */
function channelTable(
  mode: Exclude<BlendMode, "tint">,
  tintValue: number,
  opacity: number,
  intensity: number,
): Uint8Array {
  const table = new Uint8Array(256);
  for (let value = 0; value < 256; value++) {
    const effect =
      mode === "wash"
        ? tintValue
        : softLight(value / 255, tintValue / 255) * 255;
    table[value] = mix(value, mix(value, effect, opacity), intensity);
  }
  return table;
}

function applyTint(
  pixels: Uint8ClampedArray,
  tint: Rgb,
  opacity: number,
  intensity: number,
): void {
  const table = tintTable(tint);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]!;
    const g = pixels[i + 1]!;
    const b = pixels[i + 2]!;
    const sum = Math.max(r, g, b) + Math.min(r, g, b);
    pixels[i] = mix(r, mix(r, table[sum * 3]!, opacity), intensity);
    pixels[i + 1] = mix(g, mix(g, table[sum * 3 + 1]!, opacity), intensity);
    pixels[i + 2] = mix(b, mix(b, table[sum * 3 + 2]!, opacity), intensity);
  }
}

function applyChannelTables(
  pixels: Uint8ClampedArray,
  mode: Exclude<BlendMode, "tint">,
  tint: Rgb,
  opacity: number,
  intensity: number,
): void {
  const red = channelTable(mode, tint.red, opacity, intensity);
  const green = channelTable(mode, tint.green, opacity, intensity);
  const blue = channelTable(mode, tint.blue, opacity, intensity);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = red[pixels[i]!]!;
    pixels[i + 1] = green[pixels[i + 1]!]!;
    pixels[i + 2] = blue[pixels[i + 2]!]!;
  }
}

export async function color(params: ColorParams): Promise<TransformResult> {
  try {
    const mode = params.blendMode ?? "tint";
    if (mode !== "tint" && mode !== "softlight" && mode !== "wash") {
      throw new ProcessingError(`Invalid blend mode: ${String(mode)}`);
    }
    const hex = params.hex ?? "#ffffff";
    const tint = parseHex(hex);
    if (!tint) {
      throw new ProcessingError(`Invalid hex color: ${hex}`);
    }
    const intensity = clamp(params.intensity ?? 1, 0, 1);
    const opacity = clamp(params.opacity ?? 0.3, 0, 1);

    const image = await loadImage(params.input);
    if (mode === "tint") applyTint(image.bitmap, tint, opacity, intensity);
    else applyChannelTables(image.bitmap, mode, tint, opacity, intensity);
    return await image.encode();
  } catch (error) {
    if (error instanceof ImageTransformError) throw error;
    throw processingError(error, "Failed to apply color transform");
  }
}
