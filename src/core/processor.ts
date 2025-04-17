import {
    AssetResolutionConfig,
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
    private assetConfig: AssetResolutionConfig;

    constructor(assetsPath?: string, config?: Partial<AssetResolutionConfig>) {
        this.assetResolver = new AssetResolver(assetsPath);
        this.assetConfig = {
            mode: 'warn',
            logWarnings: true,
            ...config,
        };
    }

    public getAssetResolver(): AssetResolver {
        return this.assetResolver;
    }

    public setAssetConfig(config: Partial<AssetResolutionConfig>): void {
        this.assetConfig = {
            ...this.assetConfig,
            ...config,
        };
    }

    public getAssetConfig(): AssetResolutionConfig {
        return this.assetConfig;
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

    private async handleAssetResolution(input: string): Promise<string> {
        try {
            return await this.assetResolver.resolveAsset(input);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('Asset not found')
            ) {
                const message = `Asset not found: ${input}`;

                if (this.assetConfig.mode === 'strict') {
                    throw new ProcessingError(message);
                }

                if (this.assetConfig.logWarnings) {
                    const logger = this.assetConfig.logger || console.warn;
                    logger(message);
                }

                return input;
            }
            throw error;
        }
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
            params.input = await this.handleAssetResolution(params.input);
        } else if ('inputs' in params && Array.isArray(params.inputs)) {
            params.inputs = await Promise.all(
                params.inputs.map((input) => this.handleAssetResolution(input)),
            );
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
