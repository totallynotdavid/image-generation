import { processor } from '@/core/processor.ts';
import {
    TransformMap,
    TransformParams,
    TransformResult,
} from '@/types/transforms.ts';

import '@/plugins/register-built-ins.ts';

export * from '@/plugins/index.ts';

export function transform<K extends keyof TransformMap>(
    type: K,
    params: TransformParams<K>,
): Promise<TransformResult> {
    return processor.process(type, params);
}

export function greyscale(
    params: TransformParams<'greyscale'>,
): Promise<TransformResult> {
    return transform('greyscale', params);
}

export function color(
    params: TransformParams<'color'>,
): Promise<TransformResult> {
    return transform('color', params);
}

export function circle(
    params: TransformParams<'circle'>,
): Promise<TransformResult> {
    return transform('circle', params);
}

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
