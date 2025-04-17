/**
 * Base type for transforms that operate on a single image
 */
export type SingleImageTransform<T extends object = never> = {
    /** Path to the input image */
    input: string;
    /** Optional configuration for the transform */
    options?: T extends never ? never : T;
};

/**
 * Base type for transforms that operate on multiple images
 */
export type MultiImageTransform<T extends object = never> = {
    /** Paths to the input images */
    inputs: string[];
    /** Optional configuration for the transform */
    options?: T extends never ? never : T;
};

/**
 * Map of all available single-image transforms and their options
 */
export type SingleTransforms = {
    /** Convert image to grayscale */
    greyscale: never;
    /** Apply color tint to image */
    color: {
        /** Hexadecimal color code for tinting */
        hex: string;
        /** Blend mode for color application */
        blendMode?: 'overlay' | 'softlight';
    };
    /** Apply circular mask to image */
    circle: {
        /** Width of the border in pixels */
        borderWidth?: number;
        /** Hexadecimal color code for border */
        borderColor?: string;
    };
};

/**
 * Map of all available multi-image transforms and their options
 */
export type MultiTransforms = {
    /** Create animated GIF from multiple images */
    blink: {
        /** Frame delay in milliseconds */
        delay?: number;
        /** Whether to loop the animation */
        loop?: boolean;
    };
};

/**
 * Combined map of all transform types
 */
export type TransformMap = SingleTransforms & MultiTransforms;

/**
 * Helper type to determine the appropriate parameters type for a given transform
 */
export type TransformParams<K extends keyof TransformMap> = K extends
    keyof SingleTransforms ? SingleImageTransform<TransformMap[K]>
    : K extends keyof MultiTransforms ? MultiImageTransform<TransformMap[K]>
    : never;

/**
 * Function signature for transform handlers
 */
export type TransformHandler<K extends keyof TransformMap> = (
    params: TransformParams<K>,
) => Promise<TransformResult>;

/**
 * Standard result type for all transforms
 */
export type TransformResult = Uint8Array;

/**
 * Configuration for asset resolution behavior
 */
export type AssetResolutionConfig = {
    /** How to handle unresolved assets */
    mode: 'strict' | 'warn' | 'silent';
    /** Whether to log warnings for unresolved assets */
    logWarnings?: boolean;
    /** Custom logger function for warnings */
    logger?: (message: string) => void;
};
