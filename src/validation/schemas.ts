import { TransformMap, TransformParams } from '../types/transforms.ts';
import { validateHex } from './utils.ts';
import {
    InvalidOptionError,
    MinimumImagesError,
    MissingParameterError,
} from '../errors.ts';

type Validator<K extends keyof TransformMap> = (
    params: TransformParams<K>,
) => void;

export const validators: {
    [K in keyof TransformMap]?: Validator<K>;
} = {
    color: (params) => {
        const { options } = params as TransformParams<'color'>;
        if (!options?.hex) {
            throw new MissingParameterError('hex');
        }
        validateHex(options.hex);

        if (
            options.blendMode &&
            !['overlay', 'softlight'].includes(options.blendMode)
        ) {
            throw new InvalidOptionError(
                'blendMode',
                `Must be one of: overlay, softlight. Got: ${options.blendMode}`,
            );
        }
    },

    circle: (params) => {
        const { options } = params as TransformParams<'circle'>;
        if (options?.borderColor) {
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
};
