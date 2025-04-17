import { TransformMap, TransformParams } from '@/types/transforms.ts';
import { validateHex } from '@/validation/utils.ts';
import {
    InvalidOptionError,
    MinimumImagesError,
    MissingParameterError,
} from '@/errors.ts';

/**
 * Validator function type for transform parameters
 */
type Validator<K extends keyof TransformMap> = (
    params: TransformParams<K>,
) => void;

/**
 * Registry of validators for each transform type
 */
export const validators: {
    [K in keyof TransformMap]: Validator<K>;
} = {
    /**
     * Validator for color transform
     */
    color: (params) => {
        const { options } = params as TransformParams<'color'>;

        if (!options?.hex) {
            throw new MissingParameterError('hex');
        }

        validateHex(options.hex);

        if (
            options.blendMode !== undefined &&
            !['overlay', 'softlight'].includes(options.blendMode)
        ) {
            throw new InvalidOptionError(
                'blendMode',
                `Must be one of: overlay, softlight. Got: ${options.blendMode}`,
            );
        }
    },

    /**
     * Validator for circle transform
     */
    circle: (params) => {
        const { options } = params as TransformParams<'circle'>;

        if (options?.borderColor !== undefined) {
            validateHex(options.borderColor);
        }

        if (options?.borderWidth !== undefined) {
            if (
                typeof options.borderWidth !== 'number' ||
                options.borderWidth < 0
            ) {
                throw new InvalidOptionError(
                    'borderWidth',
                    'Must be a non-negative number',
                );
            }
        }
    },

    /**
     * Validator for blink transform
     */
    blink: (params) => {
        const { inputs, options } = params as TransformParams<'blink'>;

        if (!inputs || inputs.length < 2) {
            throw new MinimumImagesError(2);
        }

        if (options?.delay !== undefined) {
            if (typeof options.delay !== 'number' || options.delay < 0) {
                throw new InvalidOptionError(
                    'delay',
                    'Must be a non-negative number',
                );
            }
        }

        if (options?.loop !== undefined && typeof options.loop !== 'boolean') {
            throw new InvalidOptionError('loop', 'Must be a boolean value');
        }
    },

    /**
     * Validator for greyscale transform
     */
    greyscale: (params) => {
        const { input } = params as TransformParams<'greyscale'>;
        if (!input || typeof input !== 'string') {
            throw new MissingParameterError('input');
        }
    },
};
