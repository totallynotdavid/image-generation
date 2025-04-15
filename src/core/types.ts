import { Canvas, CanvasRenderingContext2D } from 'canvas';
import { Jimp } from 'jimp';
import { Buffer } from 'node:buffer';

export type ImageInput = Buffer | string;
export type ProcessedOutput = Buffer;

/**
 * Base interface for all image processing modules
 */
export interface ProcessingModule<
    TInputs extends ImageInput | ImageInput[] = ImageInput | ImageInput[],
    TArgs extends unknown[] = unknown[],
> {
    process(input: TInputs, ...args: TArgs): Promise<ProcessedOutput>;
    getName(): string;
}

/**
 * Interface for modules that process a single image
 */
export interface SingleImageModule<TArgs extends unknown[] = unknown[]>
    extends ProcessingModule<ImageInput, TArgs> {
    process(input: ImageInput, ...args: TArgs): Promise<ProcessedOutput>;
}

/**
 * Interface for modules that process multiple images
 */
export interface MultiImageModule<TArgs extends unknown[] = unknown[]>
    extends ProcessingModule<ImageInput[], TArgs> {
    process(inputs: ImageInput[], ...args: TArgs): Promise<ProcessedOutput>;
}

/**
 * Interface for modules that can process either single or multiple images
 */
export interface FlexibleImageModule<TArgs extends unknown[] = unknown[]>
    extends ProcessingModule<ImageInput | ImageInput[], TArgs> {
    process(
        input: ImageInput | ImageInput[],
        ...args: TArgs
    ): Promise<ProcessedOutput>;
}

/**
 * Interface for the main image processor
 */
export interface ImageProcessor {
    processImage<T extends unknown[] = unknown[]>(
        input: ImageInput | ImageInput[],
        moduleName: string,
        ...args: T
    ): Promise<ProcessedOutput>;

    registerModule(name: string, module: ProcessingModule): void;
}

/**
 * Interface for canvas data
 */
export interface CanvasData {
    canvas: Canvas;
    ctx: CanvasRenderingContext2D;
}

export type JimpImage = typeof Jimp;
