import { assertEquals } from '@std/assert';
import {
    FileSystemError,
    ImageTransformError,
    InvalidHexError,
    InvalidImageError,
    InvalidOptionError,
    MinimumImagesError,
    MissingParameterError,
    PluginExistsError,
    ProcessingError,
    TransformNotFoundError,
} from '../../src/errors.ts';

Deno.test('ImageTransformError - correctly initializes base error class', () => {
    const error = new ImageTransformError('TEST_CODE', 'Test message');

    assertEquals(error.code, 'TEST_CODE');
    assertEquals(error.message, '[TEST_CODE] Test message');
    assertEquals(error.name, 'ImageTransformError');
    assertEquals(error.cause, undefined);
});

Deno.test('ImageTransformError - handles cause parameter', () => {
    const cause = new Error('Original error');
    const error = new ImageTransformError('TEST_CODE', 'Test message', cause);

    assertEquals(error.cause, cause);
});

Deno.test('MissingParameterError - correctly formats error message', () => {
    const error = new MissingParameterError('testParam');

    assertEquals(error.code, 'MISSING_PARAM');
    assertEquals(
        error.message,
        '[MISSING_PARAM] Required parameter missing: testParam',
    );
    assertEquals(error.name, 'MissingParameterError');
});

Deno.test('InvalidHexError - correctly formats error message', () => {
    const error = new InvalidHexError('#zzz');

    assertEquals(error.code, 'INVALID_HEX');
    assertEquals(error.message, '[INVALID_HEX] Invalid hex color value: #zzz');
    assertEquals(error.name, 'InvalidHexError');
});

Deno.test('MinimumImagesError - correctly formats error message', () => {
    const error = new MinimumImagesError(3);

    assertEquals(error.code, 'MIN_IMAGES');
    assertEquals(error.message, '[MIN_IMAGES] At least 3 images required');
    assertEquals(error.name, 'MinimumImagesError');
});

Deno.test('InvalidImageError - handles default message', () => {
    const error = new InvalidImageError();

    assertEquals(error.code, 'INVALID_IMAGE');
    assertEquals(error.message, '[INVALID_IMAGE] Invalid image provided');
    assertEquals(error.name, 'InvalidImageError');
});

Deno.test('InvalidImageError - handles custom message and cause', () => {
    const cause = new Error('Original error');
    const error = new InvalidImageError('Custom message', cause);

    assertEquals(error.message, '[INVALID_IMAGE] Custom message');
    assertEquals(error.cause, cause);
});

Deno.test('InvalidOptionError - correctly formats error message', () => {
    const error = new InvalidOptionError('size', 'Must be a positive number');

    assertEquals(error.code, 'INVALID_OPTION');
    assertEquals(
        error.message,
        "[INVALID_OPTION] Invalid option 'size': Must be a positive number",
    );
    assertEquals(error.name, 'InvalidOptionError');
});

Deno.test('TransformNotFoundError - correctly formats error message', () => {
    const error = new TransformNotFoundError('blur');

    assertEquals(error.code, 'TRANSFORM_NOT_FOUND');
    assertEquals(
        error.message,
        '[TRANSFORM_NOT_FOUND] Transform not found: blur',
    );
    assertEquals(error.name, 'TransformNotFoundError');
});

Deno.test('ProcessingError - correctly formats error message and handles cause', () => {
    const cause = new Error('Original error');
    const error = new ProcessingError('Failed to process image', cause);

    assertEquals(error.code, 'PROCESSING_ERROR');
    assertEquals(error.message, '[PROCESSING_ERROR] Failed to process image');
    assertEquals(error.cause, cause);
    assertEquals(error.name, 'ProcessingError');
});

Deno.test('FileSystemError - correctly formats error message without path', () => {
    const error = new FileSystemError('Access denied');

    assertEquals(error.code, 'FS_ERROR');
    assertEquals(error.message, '[FS_ERROR] Access denied');
    assertEquals(error.name, 'FileSystemError');
});

Deno.test('FileSystemError - correctly formats error message with path', () => {
    const error = new FileSystemError('Access denied', '/path/to/file');

    assertEquals(error.code, 'FS_ERROR');
    assertEquals(error.message, '[FS_ERROR] Access denied (/path/to/file)');
    assertEquals(error.name, 'FileSystemError');
});

Deno.test('PluginExistsError - correctly formats error message', () => {
    const error = new PluginExistsError('customPlugin');

    assertEquals(error.code, 'PLUGIN_EXISTS');
    assertEquals(
        error.message,
        "[PLUGIN_EXISTS] Plugin with name 'customPlugin' is already registered",
    );
    assertEquals(error.name, 'PluginExistsError');
});
