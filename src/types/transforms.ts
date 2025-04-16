export type SingleImageTransform<T extends object = never> = {
    input: string;
    options?: T;
};

export type MultiImageTransform<T extends object = never> = {
    inputs: string[];
    options?: T;
};

export type TransformParams<K extends keyof TransformMap> = K extends
    keyof SingleTransforms ? SingleImageTransform<TransformMap[K]>
    : K extends keyof MultiTransforms ? MultiImageTransform<TransformMap[K]>
    : never;

type SingleTransforms = {
    greyscale: never;
    color: { hex: string; blendMode?: 'overlay' | 'softlight' };
    circle: { borderWidth?: number; borderColor?: string };
};

type MultiTransforms = {
    blink: { delay?: number; loop?: boolean };
};

export type TransformMap = SingleTransforms & MultiTransforms;

export type TransformHandler<K extends keyof TransformMap> = (
    params: TransformParams<K>,
) => Promise<Uint8Array>;

export type TransformResult = Uint8Array;
