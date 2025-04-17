import {
    TransformHandler,
    TransformMap,
    TransformParams,
    TransformResult,
} from '../types/transforms.ts';
import { validators } from '../validation/schemas.ts';
import {
    ImageTransformError,
    ProcessingError,
    TransformNotFoundError,
} from '../errors.ts';
import { AssetResolver } from './asset-resolver.ts';

export class Processor {
    private handlers: Partial<
        Record<keyof TransformMap, TransformHandler<keyof TransformMap>>
    > = {};
    private assetResolver: AssetResolver;

    constructor(assetsPath?: string) {
        this.assetResolver = new AssetResolver(assetsPath);
    }

    public getAssetResolver(): AssetResolver {
        return this.assetResolver;
    }

    public registerHandler<K extends keyof TransformMap>(
        type: K,
        handler: TransformHandler<K>,
    ): void {
        this.handlers[type] = handler as TransformHandler<keyof TransformMap>;
    }

    public unregisterHandler<K extends keyof TransformMap>(type: K): void {
        delete this.handlers[type];
    }

    public hasHandler<K extends keyof TransformMap>(type: K): boolean {
        return !!this.handlers[type];
    }

    public async process<K extends keyof TransformMap>(
        type: K,
        params: TransformParams<K>,
    ): Promise<TransformResult> {
        const handler = this.handlers[type];

        if (!handler) {
            throw new TransformNotFoundError(String(type));
        }

        const validator = validators[type];
        if (validator) {
            validator(params);
        }

        if ('input' in params && typeof params.input === 'string') {
            try {
                params.input = await this.assetResolver.resolveAsset(
                    params.input,
                );
            } catch (error) {
                if (
                    !(error instanceof Error &&
                        error.message.includes('Asset not found'))
                ) {
                    throw error;
                }
            }
        } else if ('inputs' in params && Array.isArray(params.inputs)) {
            const resolvedInputs = [];
            for (const input of params.inputs) {
                try {
                    resolvedInputs.push(
                        await this.assetResolver.resolveAsset(input),
                    );
                } catch (error) {
                    if (
                        !(error instanceof Error &&
                            error.message.includes('Asset not found'))
                    ) {
                        throw error;
                    }
                    resolvedInputs.push(input);
                }
            }
            params.inputs = resolvedInputs;
        }

        try {
            return await handler(params);
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                !(error instanceof ImageTransformError)
            ) {
                throw new ProcessingError(
                    `Failed to process ${
                        String(type)
                    } transform: ${error.message}`,
                    error,
                );
            }
            throw error;
        }
    }

    public reset(): void {
        this.handlers = {};
    }
}

export const processor = new Processor();
