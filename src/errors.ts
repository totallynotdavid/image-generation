/**
 * Base error class for all image transformation errors
 */
export class ImageTransformError extends Error {
    readonly code: string;
    override readonly cause?: Error;

    /**
     * Creates a new image transform error
     * @param code Error code
     * @param message Error message
     * @param cause Optional underlying cause
     */
    constructor(code: string, message: string, cause?: Error) {
        super(`[${code}] ${message}`);
        this.code = code;
        this.name = this.constructor.name;
        this.cause = cause;
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
 * Thrown when an invalid hex color value is provided
 */
export class InvalidHexError extends ImageTransformError {
    constructor(hex: string) {
        super('INVALID_HEX', `Invalid hex color value: ${hex}`);
    }
}

/**
 * Thrown when not enough images are provided for a multi-image transform
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
    constructor(message = 'Invalid image provided', cause?: Error) {
        super('INVALID_IMAGE', message, cause);
    }
}

/**
 * Thrown when an invalid option is provided
 */
export class InvalidOptionError extends ImageTransformError {
    constructor(option: string, message: string) {
        super('INVALID_OPTION', `Invalid option '${option}': ${message}`);
    }
}

/**
 * Thrown when a requested transform is not found
 */
export class TransformNotFoundError extends ImageTransformError {
    constructor(transform: string) {
        super('TRANSFORM_NOT_FOUND', `Transform not found: ${transform}`);
    }
}

/**
 * Thrown when processing an image fails
 */
export class ProcessingError extends ImageTransformError {
    constructor(message: string, cause?: Error) {
        super('PROCESSING_ERROR', message, cause);
    }
}

/**
 * Thrown when a filesystem operation fails
 */
export class FileSystemError extends ImageTransformError {
    constructor(message: string, path?: string, cause?: Error) {
        const pathInfo = path ? ` (${path})` : '';
        super('FS_ERROR', `${message}${pathInfo}`, cause);
    }
}

/**
 * Thrown when trying to register a plugin that already exists
 */
export class PluginExistsError extends ImageTransformError {
    constructor(name: string) {
        super(
            'PLUGIN_EXISTS',
            `Plugin with name '${name}' is already registered`,
        );
    }
}
