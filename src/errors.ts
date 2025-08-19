export class ImageTransformError extends Error {
    readonly code: string;
    override readonly cause?: Error;

    constructor(code: string, message: string, cause?: Error) {
        super(`[${code}] ${message}`);
        this.code = code;
        this.name = this.constructor.name;
        this.cause = cause;
    }
}

export class InvalidImageError extends ImageTransformError {
    constructor(message = 'Invalid image provided', cause?: Error) {
        super('INVALID_IMAGE', message, cause);
    }
}

export class InvalidHexError extends ImageTransformError {
    constructor(hex: string) {
        super('INVALID_HEX', `Invalid hex color value: ${hex}`);
    }
}

export class ProcessingError extends ImageTransformError {
    constructor(message: string, cause?: Error) {
        super('PROCESSING_ERROR', message, cause);
    }
}
