// errors/index.ts
/**
 * Base error class for all image transform errors
 */
export class ImageTransformError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(`[${code}] ${message}`);
        this.code = code;
        this.name = this.constructor.name;

        // Properly capture stack trace in Node.js
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Thrown when a required parameter is missing
 */
export class MissingParameterError extends ImageTransformError {
    constructor(param: string) {
        super('MISSING_PARAM', `Required parameter missing: ${param}`);
    }
}

/**
 * Thrown when an invalid hex color is provided
 */
export class InvalidHexError extends ImageTransformError {
    constructor(hex: string) {
        super('INVALID_HEX', `Invalid hex color value: ${hex}`);
    }
}

/**
 * Thrown when fewer than the minimum number of images are provided
 */
export class MinimumImagesError extends ImageTransformError {
    constructor(minRequired: number) {
        super('MIN_IMAGES', `At least ${minRequired} images required`);
    }
}

/**
 * Thrown when an invalid image is provided
 */
export class InvalidImageError extends ImageTransformError {
    constructor(message: string = 'Invalid image provided') {
        super('INVALID_IMAGE', message);
    }
}

/**
 * Thrown when an invalid option value is provided
 */
export class InvalidOptionError extends ImageTransformError {
    constructor(option: string, message: string) {
        super('INVALID_OPTION', `Invalid option '${option}': ${message}`);
    }
}

/**
 * Thrown when a transform is not found
 */
export class TransformNotFoundError extends ImageTransformError {
    constructor(transform: string) {
        super('TRANSFORM_NOT_FOUND', `Transform not found: ${transform}`);
    }
}

/**
 * Thrown when image processing fails
 */
export class ProcessingError extends ImageTransformError {
    constructor(message: string, cause?: Error) {
        super('PROCESSING_ERROR', message);
        if (cause && 'cause' in Error) {
            Object.defineProperty(this, 'cause', { value: cause });
        }
    }
}

/**
 * Thrown when there's an issue with the file system
 */
export class FileSystemError extends ImageTransformError {
    constructor(message: string, path?: string) {
        const pathInfo = path ? ` (${path})` : '';
        super('FS_ERROR', `${message}${pathInfo}`);
    }
}

/**
 * Thrown when a plugin with the same name is already registered
 */
export class PluginExistsError extends ImageTransformError {
    constructor(name: string) {
        super(
            'PLUGIN_EXISTS',
            `Plugin with name '${name}' is already registered`,
        );
    }
}
