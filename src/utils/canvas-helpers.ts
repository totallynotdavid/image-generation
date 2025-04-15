import { Canvas, CanvasRenderingContext2D } from "canvas";
import { CanvasData } from "../core/types.ts";

/**
 * Creates a canvas with the specified dimensions
 * @param width - Width of the canvas in pixels
 * @param height - Height of the canvas in pixels
 * @returns Canvas data object with canvas and context
 * @throws Error if dimensions are invalid
 */
export function createCanvas(width: number, height: number): CanvasData {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error(`Invalid canvas dimensions: ${width}x${height}`);
  }

  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d");
  return { canvas, ctx };
}

/**
 * Calculates the optimal font size for text to fit within a maximum width
 * @param ctx - Canvas rendering context
 * @param text - Text to measure
 * @param maxWidth - Maximum width the text should occupy
 * @param defaultFontSize - Starting font size
 * @param fontFamily - Font family to use
 * @returns Object containing the font string and calculated font size
 */
export function applyText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  defaultFontSize: number,
  fontFamily: string = "sans-serif",
): { fontString: string; fontSize: number } {
  if (!Number.isInteger(defaultFontSize) || defaultFontSize <= 0) {
    throw new Error(`Invalid default font size: ${defaultFontSize}`);
  }

  let low = 1;
  let high = Math.min(defaultFontSize, 1000);
  let optimalSize = 0;

  // Short-circuit for empty text
  if (text.trim().length === 0) {
    const fontString = `${defaultFontSize}px ${fontFamily}`;
    ctx.font = fontString;
    return { fontString, fontSize: defaultFontSize };
  }

  // Binary search for optimal font size
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    ctx.font = `${mid}px ${fontFamily}`;
    const textWidth = ctx.measureText(text).width;

    if (textWidth <= maxWidth) {
      optimalSize = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Fallback to minimum 1px if no size found
  const fontSize = optimalSize || 1;
  const fontString = `${fontSize}px ${fontFamily}`;
  ctx.font = fontString;
  return { fontString, fontSize };
}

/**
 * Wraps text to fit within a maximum width
 * @param ctx - Canvas rendering context
 * @param text - Text to wrap
 * @param maxWidth - Maximum width for each line
 * @returns Array of wrapped text lines or null if text cannot be wrapped
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] | null {
  // Input validation
  if (typeof text !== "string") return null;
  if (maxWidth <= 0) return null;

  const trimmedText = text.trim();
  if (trimmedText === "") return [];

  // Check if even a single character can fit
  if (ctx.measureText("W").width > maxWidth) return null;

  const words = trimmedText.split(/(\s+|-+)/g).filter((word) => {
    const cleanedWord = word.replace(/[\s-]/g, "");
    return cleanedWord.length > 0;
  });

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const isHyphenated = word.endsWith("-");
    const testLine = currentLine
      ? `${currentLine}${isHyphenated ? word : ` ${word}`}`
      : word;

    const metrics = ctx.measureText(testLine);

    if (metrics.width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine === "") {
        // Word is too long for a line by itself
        const chunks = splitWord(ctx, word, maxWidth);
        if (!chunks) return null;
        lines.push(...chunks);
      } else {
        lines.push(currentLine.trim());
        currentLine = word;
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines;
}

/**
 * Splits a word into chunks that fit within a maximum width
 * @param ctx - Canvas rendering context
 * @param word - Word to split
 * @param maxWidth - Maximum width for each chunk
 * @returns Array of word chunks or null if word cannot be split
 */
function splitWord(
  ctx: CanvasRenderingContext2D,
  word: string,
  maxWidth: number,
): string[] | null {
  const chunks: string[] = [];
  let remaining = word;

  while (remaining.length > 0) {
    let low = 0;
    let high = remaining.length;
    let sliceIndex = remaining.length;

    while (low <= high) {
      const mid = Math.ceil((low + high) / 2);
      const testSlice = remaining.slice(0, mid);
      const width = ctx.measureText(testSlice).width;

      if (width <= maxWidth) {
        sliceIndex = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    if (sliceIndex === 0) return null; // Can't split

    chunks.push(remaining.slice(0, sliceIndex));
    remaining = remaining.slice(sliceIndex);
  }

  return chunks;
}
