import { assertEquals, assertInstanceOf } from '@std/assert';
import {
    ImageTransformError,
    ProcessingError,
    throwProcessingError,
} from '@/errors.ts';

Deno.test('ImageTransformError', () => {
    const error = new ImageTransformError('TEST_CODE', 'Test message');

    assertEquals(error.code, 'TEST_CODE');
    assertEquals(error.message, '[TEST_CODE] Test message');
    assertEquals(error.name, 'ImageTransformError');
    assertInstanceOf(error, Error);
});

Deno.test('ProcessingError', () => {
    const cause = new Error('Original error');
    const error = new ProcessingError('Processing failed', cause);

    assertEquals(error.code, 'PROCESSING_ERROR');
    assertEquals(error.message, '[PROCESSING_ERROR] Processing failed');
    assertEquals(error.cause, cause);
    assertInstanceOf(error, ImageTransformError);
});

Deno.test('throwProcessingError', () => {
    const originalError = new Error('Original');

    try {
        throwProcessingError(originalError, 'Test prefix');
    } catch (error) {
        assertInstanceOf(error, ProcessingError);
        assertEquals(error.message, '[PROCESSING_ERROR] Test prefix: Original');
        assertEquals(error.cause, originalError);
    }
});
