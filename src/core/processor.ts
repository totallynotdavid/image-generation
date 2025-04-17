import {
    TransformHandler,
    TransformMap,
    TransformParams,
    TransformResult,
} from '../types/transforms.ts';
import { validators } from '../validation/schemas.ts';
import { ProcessingError, TransformNotFoundError } from '../errors.ts';

/**
 * Manages transform handlers and processes transform requests
 */
export class Processor {
    private handlers: Partial<
        Record<keyof TransformMap, TransformHandler<keyof TransformMap>>
    > = {};

    /**
     * Register a transform handler
     * @param type Transform type
     * @param handler Transform handler function
     */
    public registerHandler<K extends keyof TransformMap>(
        type: K,
        handler: TransformHandler<K>,
    ): void {
        this.handlers[type] = handler as TransformHandler<keyof TransformMap>;
    }

    /**
     * Unregister a transform handler
     * @param type Transform type
     */
    public unregisterHandler<K extends keyof TransformMap>(type: K): void {
        delete this.handlers[type];
    }

    /**
     * Check if a transform handler is registered
     * @param type Transform type
     * @returns True if handler exists
     */
    public hasHandler<K extends keyof TransformMap>(type: K): boolean {
        return !!this.handlers[type];
    }

    /**
     * Process a transform request
     * @param type Transform type
     * @param params Transform parameters
     * @returns Transform result
     * @throws {TransformNotFoundError} If no handler is registered for the transform type
     * @throws {ProcessingError} If processing fails
     */
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

        try {
            return await handler(params);
        } catch (error: unknown) {
            if (
                error instanceof Error &&
                !error.name.includes('ImageTransform')
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

    /**
     * Reset all handlers (for testing)
     */
    public reset(): void {
        this.handlers = {};
    }
}

export const processor = new Processor();
