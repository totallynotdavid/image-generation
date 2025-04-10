import { Canvas, CanvasRenderingContext2D } from "canvas";
import type { Jimp } from "jimp";
import { Buffer } from "node:buffer";

export type ImageInput = Buffer | string;
export type ProcessedOutput = Buffer;

export interface ImageProcessor {
  processImage(
    input: ImageInput,
    moduleName: string,
    ...args: unknown[]
  ): Promise<ProcessedOutput>;
  registerModule(name: string, module: ProcessingModule): void;
}

export interface ProcessingModule {
  process(input: ImageInput, ...args: unknown[]): Promise<ProcessedOutput>;
}

export interface CanvasData {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
}

export type JimpImage = typeof Jimp;
