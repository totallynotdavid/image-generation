import { Canvas } from "canvas";
import { Jimp } from "jimp";
import { Buffer } from "node:buffer";

export type ImageInput = string | Buffer;
export type ProcessedOutput = Buffer;

export interface ImageProcessor {
  processImage(
    input: ImageInput,
    moduleName: string,
    ...args: any[]
  ): Promise<ProcessedOutput>;
  registerModule(name: string, module: ProcessingModule): void;
}

export interface ProcessingModule {
  process(input: ImageInput, ...args: any[]): Promise<ProcessedOutput>;
}

export interface CanvasData {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
}

export type JimpImage = Jimp;
