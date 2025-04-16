// index.ts
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

export async function greyscale(
    params: TransformParams<'greyscale'>,
): Promise<TransformResult> {
    return processor.process('greyscale', params);
}

export async function color(
    params: TransformParams<'color'>,
): Promise<TransformResult> {
    return processor.process('color', params);
}

export async function circle(
    params: TransformParams<'circle'>,
): Promise<TransformResult> {
    return processor.process('circle', params);
}

export async function blink(
    params: TransformParams<'blink'>,
): Promise<TransformResult> {
    return processor.process('blink', params);
}

export async function transform<K extends keyof TransformMap>(
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
