import { assertEquals, assertRejects } from '@std/assert';
import { Processor } from '../../src/core/processor.ts';
import { ProcessingError, TransformNotFoundError } from '../../src/errors.ts';
import {
    TransformHandler,
    TransformParams,
} from '../../src/types/transforms.ts';
import { validators } from '../../src/validation/schemas.ts';

// Create a clean processor instance for each test to avoid state bleeding
let testProcessor: Processor;
// Store original validators to restore them after tests
const originalValidators = { ...validators };

function setup() {
    testProcessor = new Processor();
}

function teardown() {
    Object.keys(validators).forEach((key) => {
        const typedKey = key as keyof typeof validators;
        if (!(typedKey in originalValidators)) {
            (validators as Record<string, unknown>)[key] = undefined;
        }
    });

    Object.entries(originalValidators).forEach(([key, value]) => {
        (validators as Record<string, unknown>)[key] = value;
    });
}

type TestTransformType = 'greyscale' | 'color' | 'circle' | 'blink';

Deno.test('Processor - registerHandler registers a transform handler', () => {
    setup();

    const mockHandler: TransformHandler<'greyscale'> = async () => {
        return new Uint8Array([1, 2, 3]);
    };

    testProcessor.registerHandler('greyscale', mockHandler);
    assertEquals(testProcessor.hasHandler('greyscale'), true);

    teardown();
});

Deno.test('Processor - hasHandler returns false for unregistered handler', () => {
    setup();

    const hasHandler = testProcessor.hasHandler(
        'nonexistent' as TestTransformType,
    );
    assertEquals(hasHandler, false);

    teardown();
});

Deno.test('Processor - process executes registered handler', async () => {
    setup();

    const expectedResult = new Uint8Array([1, 2, 3]);
    const mockHandler: TransformHandler<'greyscale'> = async () => {
        return expectedResult;
    };

    testProcessor.registerHandler('greyscale', mockHandler);

    const params: TransformParams<'greyscale'> = { input: 'test.png' };
    const result = await testProcessor.process('greyscale', params);

    assertEquals(result, expectedResult);

    teardown();
});

Deno.test('Processor - process throws for unregistered transform', async () => {
    setup();

    await assertRejects(
        async () => {
            await testProcessor.process(
                'nonexistent' as TestTransformType,
                { input: 'test.png' } as TransformParams<TestTransformType>,
            );
        },
        TransformNotFoundError,
        'Transform not found',
    );

    teardown();
});

Deno.test('Processor - process validates params if validator exists', async () => {
    setup();

    const mockValidationFn = () => {
        throw new Error('Validation failed');
    };

    const originalGreyscaleValidator = validators['greyscale'];

    (validators as Record<string, unknown>)['greyscale'] = mockValidationFn;

    const mockHandler: TransformHandler<'greyscale'> = async () => {
        return new Uint8Array([1, 2, 3]);
    };

    testProcessor.registerHandler('greyscale', mockHandler);

    await assertRejects(
        async () => {
            await testProcessor.process(
                'greyscale',
                { input: 'test.png' } as TransformParams<'greyscale'>,
            );
        },
        Error,
        'Validation failed',
    );

    if (originalGreyscaleValidator) {
        (validators as Record<string, unknown>)['greyscale'] =
            originalGreyscaleValidator;
    } else {
        (validators as Record<string, unknown>)['greyscale'] = undefined;
    }

    teardown();
});

Deno.test('Processor - process wraps non-ImageTransformError errors', async () => {
    setup();

    const mockHandler: TransformHandler<'greyscale'> = async () => {
        throw new Error('Something went wrong');
    };

    testProcessor.registerHandler('greyscale', mockHandler);

    await assertRejects(
        async () => {
            await testProcessor.process(
                'greyscale',
                { input: 'test.png' } as TransformParams<'greyscale'>,
            );
        },
        ProcessingError,
        'Failed to process greyscale transform',
    );

    teardown();
});

Deno.test('Processor - process passes through ImageTransformError errors', async () => {
    setup();

    const mockHandler: TransformHandler<'greyscale'> = async () => {
        const error = new Error('Custom error');
        error.name = 'ImageTransformError';
        throw error;
    };

    testProcessor.registerHandler('greyscale', mockHandler);

    await assertRejects(
        async () => {
            await testProcessor.process(
                'greyscale',
                { input: 'test.png' } as TransformParams<'greyscale'>,
            );
        },
        Error,
        'Custom error',
    );

    teardown();
});
