export type ImageInput = string | Uint8Array;
export type TransformResult = Uint8Array;

export interface ResizeOptions {
    width?: number;
    height?: number;
    mode?: string;
}

export interface GreyscaleParams {
    input: ImageInput;
}

export interface ColorParams {
    input: ImageInput;
    hex?: string;
    blendMode?: 'tint' | 'softlight' | 'wash';
    opacity?: number;
    intensity?: number;
}

export interface CircleParams {
    input: ImageInput;
    borderWidth?: number;
    borderColor?: string;
}

export interface BlinkParams {
    inputs: ImageInput[];
    delay?: number;
    loop?: boolean;
}
