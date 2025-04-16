import { processor } from './core/processor.ts';
import {
    TransformMap,
    TransformParams,
    TransformResult,
} from './types/transforms.ts';

import './transforms/greyscale.ts';
import './transforms/color.ts';
import './transforms/circle.ts';
import './transforms/blink.ts';

export * from './plugins/index.ts';

/**
 * Apply grayscale transformation to an image
 * @param params Transform parameters
 * @returns Transformed image data
 */
export function greyscale(
    params: TransformParams<'greyscale'>,
): Promise<TransformResult> {
    return processor.process('greyscale', params);
}

/**
 * Apply color tint transformation to an image
 * @param params Transform parameters
 * @returns Transformed image data
 */
export function color(
    params: TransformParams<'color'>,
): Promise<TransformResult> {
    return processor.process('color', params);
}

/**
 * Apply circle mask transformation to an image
 * @param params Transform parameters
 * @returns Transformed image data
 */
export function circle(
    params: TransformParams<'circle'>,
): Promise<TransformResult> {
    return processor.process('circle', params);
}

/**
 * Create an animated blink GIF from multiple images
 * @param params Transform parameters
 * @returns Transformed image data
 */
export function blink(
    params: TransformParams<'blink'>,
): Promise<TransformResult> {
    return processor.process('blink', params);
}

/**
 * Generic transform function for any registered transform
 * @param type Transform type
 * @param params Transform parameters
 * @returns Transformed image data
 */
export function transform<K extends keyof TransformMap>(
    type: K,
    params: TransformParams<K>,
): Promise<TransformResult> {
    return processor.process(type, params);
}

export type {
    MultiImageTransform,
    SingleImageTransform,
    TransformMap,
    TransformParams,
    TransformResult,
} from './types/transforms.ts';

export * from './errors.ts';

export { AssetResolver } from './core/asset-resolver.ts';
