export interface ResizeOptions {
    width?: number;
    height?: number;
    mode?: string;
}

export interface TransformOptions {
    resize?: ResizeOptions;
}

export interface GreyscaleParams {
    input: string;
    options?: TransformOptions;
}

export interface ColorParams {
    input: string;
    options: ColorOptions & TransformOptions;
}

export interface ColorOptions {
    hex?: string;
    blendMode?: 'tint' | 'softlight' | 'wash';
    opacity?: number;
    intensity?: number;
}

export interface CircleParams {
    input: string;
    options?: CircleOptions & TransformOptions;
}

export interface CircleOptions {
    borderWidth?: number;
    borderColor?: string;
}

export interface BlinkParams {
    inputs: string[];
    options?: BlinkOptions & TransformOptions;
}

export interface BlinkOptions {
    delay?: number;
    loop?: boolean;
    maxConcurrent?: number;
}

export type TransformResult = Uint8Array;
