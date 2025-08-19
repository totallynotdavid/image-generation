export interface GreyscaleParams {
    input: string;
}

export interface ColorParams {
    input: string;
    options: {
        hex?: string;
        blendMode?: 'tint' | 'softlight' | 'wash';
        opacity?: number;
        intensity?: number;
    };
}

export interface CircleParams {
    input: string;
    options?: {
        borderWidth?: number;
        borderColor?: string;
    };
}

export interface BlinkParams {
    inputs: string[];
    options?: {
        delay?: number;
        loop?: boolean;
    };
}

export type TransformResult = Uint8Array;
