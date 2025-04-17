import {
    assertEquals,
    assertExists,
    assertRejects,
    assertThrows,
} from '@std/assert';
import { processor } from '../../src/core/processor.ts';
import { ProcessingError, TransformNotFoundError } from '../../src/errors.ts';
import {
    TransformHandler,
    TransformMap,
    TransformParams,
    TransformResult,
} from '../../src/types/transforms.ts';
import { validators } from '../../src/validation/schemas.ts';

Deno.test('Processor - registerHandler registers a transform handler', () => {
    // deno-lint-ignore require-await
    const mockHandler: TransformHandler<'greyscale'> = async () => {
        return new Uint8Array([1, 2, 3]);
    };

    // Register a mock handler
    processor.registerHandler('greyscale', mockHandler);

    // Check if handler exists
    const hasHandler = processor.hasHandler('greyscale');
    assertEquals(hasHandler, true);
});

Deno.test('Processor - hasHandler returns false for unregistered handler', () => {
    const hasHandler = processor.hasHandler(
        'nonexistent' as 'greyscale' | 'color' | 'circle' | 'blink',
    );
    assertEquals(hasHandler, false);
});

Deno.test('Processor - process executes registered handler', async () => {
    const expectedResult = new Uint8Array([1, 2, 3]);

    // Mock handler that returns a predictable result
    // deno-lint-ignore require-await
    const mockHandler: TransformHandler<'greyscale'> = async () => {
        return expectedResult;
    };

    // Register the handler
    processor.registerHandler('greyscale', mockHandler);

    // Process with the handler
    const result = await processor.process(
        'greyscale',
        { input: 'test.png' } as TransformParams<'greyscale'>,
    );

    // Verify result
    assertEquals(result, expectedResult);
});

Deno.test('Processor - process throws for unregistered transform', async () => {
    await assertRejects(
        async () => {
            await processor.process(
                'nonexistent' as 'greyscale' | 'color' | 'circle' | 'blink',
                { input: 'test.png' } as TransformParams<'greyscale'>,
            );
        },
        TransformNotFoundError,
        'Transform not found',
    );
});

Deno.test('Processor - process validates params if validator exists', async () => {
    // Create a mock validator that always throws
    validators['mockValidated' as keyof typeof validators] = () => {
        throw new Error('Validation failed');
    };

    // Mock handler
    // deno-lint-ignore require-await
    const mockHandler: TransformHandler<'greyscale'> = async () => {
        return new Uint8Array([1, 2, 3]);
    };

    // Register the handler
    processor.registerHandler('greyscale', mockHandler);

    // Process should fail at validation
    await assertRejects(
        async () => {
            await processor.process(
                'greyscale',
                { input: 'test.png' } as TransformParams<'greyscale'>,
            );
        },
        Error,
        'Validation failed',
    );

    // Clean up
    delete validators['mockValidated' as keyof typeof validators];
});

Deno.test('Processor - process wraps non-ImageTransformError errors', async () => {
    // Mock handler that throws a regular Error
    // deno-lint-ignore require-await
    const mockHandler: TransformHandler<'greyscale'> = async () => {
        throw new Error('Something went wrong');
    };

    // Register the handler
    processor.registerHandler('greyscale', mockHandler);

    // Process should wrap the error
    await assertRejects(
        async () => {
            await processor.process(
                'greyscale',
                { input: 'test.png' } as TransformParams<'greyscale'>,
            );
        },
        ProcessingError,
        'Failed to process greyscale transform',
    );
});

Deno.test('Processor - process passes through ImageTransformError errors', async () => {
    // Mock handler that throws an ImageTransformError
    // deno-lint-ignore require-await
    const mockHandler: TransformHandler<'greyscale'> = async () => {
        const error = new Error('Custom error');
        error.name = 'ImageTransformError';
        throw error;
    };

    // Register the handler
    processor.registerHandler('greyscale', mockHandler);

    // Process should pass through the ImageTransformError
    await assertRejects(
        async () => {
            await processor.process(
                'greyscale',
                { input: 'test.png' } as TransformParams<'greyscale'>,
            );
        },
        Error,
        'Custom error',
    );
});
