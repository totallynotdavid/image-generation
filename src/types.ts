export interface ResizeOptions {
    width?: number;
    height?: number;
    mode?: string;
}

export interface TransformOptions {
    resize?: ResizeOptions;
}

export type ImageInput = string | Uint8Array;

export interface GreyscaleParams {
    input: ImageInput;
    options?: TransformOptions;
}

export interface ColorParams {
    input: ImageInput;
    options: ColorOptions & TransformOptions;
}

export interface ColorOptions {
    hex?: string;
    blendMode?: 'tint' | 'softlight' | 'wash';
    opacity?: number;
    intensity?: number;
}

export interface CircleParams {
    input: ImageInput;
    options?: CircleOptions & TransformOptions;
}

export interface CircleOptions {
    borderWidth?: number;
    borderColor?: string;
}

export interface BlinkParams {
    inputs: ImageInput[];
    options?: BlinkOptions & TransformOptions;
}

export interface BlinkOptions {
    delay?: number;
    loop?: boolean;
}

export type TransformResult = Uint8Array;
