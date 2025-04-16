import {
    TransformHandler,
    TransformMap,
    TransformParams,
    TransformResult,
} from '../types/transforms.ts';
import { validators } from '../validation/schemas.ts';

class Processor {
    private handlers: Partial<
        {
            [K in keyof TransformMap]: TransformHandler<K>;
        }
    > = {};

    public registerHandler<K extends keyof TransformMap>(
        type: K,
        handler: TransformHandler<K>,
    ): void {
        this.handlers[type] = handler;
    }

    public async process<K extends keyof TransformMap>(
        type: K,
        params: TransformParams<K>,
    ): Promise<TransformResult> {
        const handler = this.handlers[type];

        if (!handler) {
            throw new Error(
                `No handler registered for transform type: ${String(type)}`,
            );
        }

        const validator = validators[type];
        if (validator) {
            validator(params);
        }

        return await handler(params);
    }
}

export const processor = new Processor();
