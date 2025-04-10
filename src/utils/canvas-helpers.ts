import { Canvas, CanvasRenderingContext2D } from "canvas";
import { CanvasData } from "../core/types";

/**
 * Creates a canvas with the specified dimensions
 * @param width Canvas width
 * @param height Canvas height
 * @returns Canvas data object
 */
export function createCanvas(width: number, height: number): CanvasData {
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d");
  return { canvas, ctx };
}

/**
 * Applies responsive text sizing to fit within width
 * @param ctx Canvas context
 * @param text Text to measure
 * @param maxWidth Maximum width for text
 * @param defaultFontSize Starting font size
 * @param fontFamily Font family
 * @returns Appropriate font size
 */
export function applyText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  defaultFontSize: number,
  fontFamily: string = "sans-serif",
): string {
  let fontSize = defaultFontSize;

  do {
    fontSize--;
    ctx.font = `${fontSize}px ${fontFamily}`;
  } while (ctx.measureText(text).width > maxWidth && fontSize > 1);

  return ctx.font;
}

/**
 * Wraps text to fit within a specified width
 * @param ctx Canvas context
 * @param text Text to wrap
 * @param maxWidth Maximum width for each line
 * @returns Array of text lines
 */
export async function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): Promise<string[] | null> {
  if (ctx.measureText(text).width < maxWidth) return [text];
  if (ctx.measureText("W").width > maxWidth) return null;

  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  while (words.length > 0) {
    let split = false;

    while (ctx.measureText(words[0]).width >= maxWidth) {
      const temp = words[0];
      words[0] = temp.slice(0, -1);

      if (split) {
        words[1] = `${temp.slice(-1)}${words[1]}`;
      } else {
        split = true;
        words.splice(1, 0, temp.slice(-1));
      }
    }

    if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
      line += `${words.shift()} `;
    } else {
      lines.push(line.trim());
      line = "";
    }

    if (words.length === 0) lines.push(line.trim());
  }

  return lines;
}
