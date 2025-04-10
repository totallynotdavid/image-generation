import { Canvas, CanvasRenderingContext2D } from "canvas";
import type { Jimp } from "jimp";
import { Buffer } from "node:buffer";

export type ImageInput = Buffer | string;
export type ProcessedOutput = Buffer;

export interface ProcessingModule<
  TInputs extends ImageInput | ImageInput[] = ImageInput | ImageInput[],
> {
  process(input: TInputs, ...args: unknown[]): Promise<ProcessedOutput>;
}

export interface SingleImageModule extends ProcessingModule<ImageInput> {
  process(input: ImageInput, ...args: unknown[]): Promise<ProcessedOutput>;
}

export interface MultiImageModule extends ProcessingModule<ImageInput[]> {
  process(inputs: ImageInput[], ...args: unknown[]): Promise<ProcessedOutput>;
}

export interface FlexibleImageModule
  extends ProcessingModule<ImageInput | ImageInput[]> {
  process(
    input: ImageInput | ImageInput[],
    ...args: unknown[]
  ): Promise<ProcessedOutput>;
}

export interface ImageProcessor {
  processImage<T extends unknown[] = unknown[]>(
    input: ImageInput | ImageInput[],
    moduleName: string,
    ...args: T
  ): Promise<ProcessedOutput>;

  registerModule(name: string, module: ProcessingModule): void;
}

export interface CanvasData {
  canvas: Canvas;
  ctx: CanvasRenderingContext2D;
}

export type JimpImage = typeof Jimp;
