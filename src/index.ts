import { processor } from '@/core/processor.ts';
import {
    TransformMap,
    TransformParams,
    TransformResult,
} from '@/types/transforms.ts';

import '@/plugins/register-built-ins.ts';

export * from '@/plugins/index.ts';

/**
 * Generic transform function that can handle any registered transform type
 * @param type - The type of transform to apply
 * @param params - The parameters for the transform
 * @returns A promise that resolves to the transformed image data
 */
export function transform<K extends keyof TransformMap>(
    type: K,
    params: TransformParams<K>,
): Promise<TransformResult> {
    return processor.process(type, params);
}

/**
 * Converts an image to grayscale
 * @param params - The parameters for the transform
 * @param params.input - Path to the input image
 * @returns A promise that resolves to the grayscale image data
 */
export function greyscale(
    params: TransformParams<'greyscale'>,
): Promise<TransformResult> {
    return transform('greyscale', params);
}

/**
 * Applies a color tint to an image
 * @param params - The parameters for the transform
 * @param params.input - Path to the input image
 * @param params.options - Optional configuration
 * @param params.options.hex - Hexadecimal color code for tinting
 * @param params.options.blendMode - Blend mode for color application ('overlay' or 'softlight')
 * @returns A promise that resolves to the color-tinted image data
 */
export function color(
    params: TransformParams<'color'>,
): Promise<TransformResult> {
    return transform('color', params);
}

/**
 * Applies a circular mask to an image
 * @param params - The parameters for the transform
 * @param params.input - Path to the input image
 * @param params.options - Optional configuration
 * @param params.options.borderWidth - Width of the border in pixels
 * @param params.options.borderColor - Hexadecimal color code for border
 * @returns A promise that resolves to the circular-masked image data
 */
export function circle(
    params: TransformParams<'circle'>,
): Promise<TransformResult> {
    return transform('circle', params);
}

/**
 * Creates an animated GIF that alternates between multiple images
 * @param params - The parameters for the transform
 * @param params.inputs - Paths to the input images
 * @param params.options - Optional configuration
 * @param params.options.delay - Frame delay in milliseconds
 * @param params.options.loop - Whether to loop the animation
 * @returns A promise that resolves to the animated GIF data
 */
export function blink(
    params: TransformParams<'blink'>,
): Promise<TransformResult> {
    return transform('blink', params);
}

export type {
    MultiImageTransform,
    SingleImageTransform,
    TransformMap,
    TransformParams,
    TransformResult,
} from '@/types/transforms.ts';

export * from '@/errors.ts';

export { AssetResolver } from '@/core/asset-resolver.ts';
export { Processor } from '@/core/processor.ts';
