import { assertEquals, assertThrows } from '@std/assert';
import { validators } from '../../src/validation/schemas.ts';
import {
    InvalidOptionError,
    MinimumImagesError,
    MissingParameterError,
} from '../../src/errors.ts';

Deno.test('validators.color - validates hex color parameter', () => {
    // Valid color parameters
    validators.color({
        input: 'test.png',
        options: {
            hex: '#ffffff',
        },
    });

    // Missing hex parameter
    assertThrows(
        () =>
            validators.color({
                input: 'test.png',
                options: {} as { hex: string },
            }),
        MissingParameterError,
        'Required parameter missing: hex',
    );

    // Invalid hex color
    assertThrows(
        () =>
            validators.color({
                input: 'test.png',
                options: {
                    hex: 'invalid',
                },
            }),
        Error,
        'Invalid hex color value',
    );
});

Deno.test('validators.color - validates blendMode parameter', () => {
    // Valid blend mode: overlay
    validators.color({
        input: 'test.png',
        options: {
            hex: '#fff',
            blendMode: 'overlay',
        },
    });

    // Valid blend mode: softlight
    validators.color({
        input: 'test.png',
        options: {
            hex: '#fff',
            blendMode: 'softlight',
        },
    });

    // Invalid blend mode
    assertThrows(
        () =>
            validators.color({
                input: 'test.png',
                options: {
                    hex: '#fff',
                    blendMode: 'invalid' as 'overlay' | 'softlight',
                },
            }),
        InvalidOptionError,
        'Must be one of: overlay, softlight',
    );
});

Deno.test('validators.circle - validates borderColor parameter', () => {
    // Valid border color
    validators.circle({
        input: 'test.png',
        options: {
            borderColor: '#ffffff',
        },
    });

    // Invalid border color
    assertThrows(
        () =>
            validators.circle({
                input: 'test.png',
                options: {
                    borderColor: 'invalid',
                },
            }),
        Error,
        'Invalid hex color value',
    );
});

Deno.test('validators.circle - validates borderWidth parameter', () => {
    // Valid border width
    validators.circle({
        input: 'test.png',
        options: {
            borderWidth: 5,
        },
    });

    // Zero border width
    validators.circle({
        input: 'test.png',
        options: {
            borderWidth: 0,
        },
    });

    // Negative border width
    assertThrows(
        () =>
            validators.circle({
                input: 'test.png',
                options: {
                    borderWidth: -1,
                },
            }),
        InvalidOptionError,
        'Must be a non-negative number',
    );

    // Non-number border width
    assertThrows(
        () =>
            validators.circle({
                input: 'test.png',
                options: {
                    borderWidth: '5' as unknown as number,
                },
            }),
        InvalidOptionError,
        'Must be a non-negative number',
    );
});

Deno.test('validators.blink - validates minimum number of inputs', () => {
    // Valid number of inputs
    validators.blink({
        inputs: ['img1.png', 'img2.png'],
        options: {},
    });

    // Too few inputs
    assertThrows(
        () =>
            validators.blink({
                inputs: ['img1.png'],
                options: {},
            }),
        MinimumImagesError,
        'At least 2 images required',
    );

    // No inputs
    assertThrows(
        () =>
            validators.blink({
                inputs: [],
                options: {},
            }),
        MinimumImagesError,
        'At least 2 images required',
    );
});

Deno.test('validators.blink - validates delay parameter', () => {
    // Valid delay
    validators.blink({
        inputs: ['img1.png', 'img2.png'],
        options: {
            delay: 200,
        },
    });

    // Zero delay
    validators.blink({
        inputs: ['img1.png', 'img2.png'],
        options: {
            delay: 0,
        },
    });

    // Negative delay
    assertThrows(
        () =>
            validators.blink({
                inputs: ['img1.png', 'img2.png'],
                options: {
                    delay: -100,
                },
            }),
        InvalidOptionError,
        'Must be a non-negative number',
    );

    // Non-number delay
    assertThrows(
        () =>
            validators.blink({
                inputs: ['img1.png', 'img2.png'],
                options: {
                    delay: '200' as unknown as number,
                },
            }),
        InvalidOptionError,
        'Must be a non-negative number',
    );
});

Deno.test('validators.blink - validates loop parameter', () => {
    // Valid loop: true
    validators.blink({
        inputs: ['img1.png', 'img2.png'],
        options: {
            loop: true,
        },
    });

    // Valid loop: false
    validators.blink({
        inputs: ['img1.png', 'img2.png'],
        options: {
            loop: false,
        },
    });

    // Non-boolean loop
    assertThrows(
        () =>
            validators.blink({
                inputs: ['img1.png', 'img2.png'],
                options: {
                    loop: 'true' as unknown as boolean,
                },
            }),
        InvalidOptionError,
        'Must be a boolean value',
    );
});

Deno.test('validators.greyscale - validates input parameter', () => {
    // Valid input
    validators.greyscale({
        input: 'test.png',
    });

    // Missing input
    assertThrows(
        () =>
            validators.greyscale({
                input: '',
            }),
        MissingParameterError,
        'Required parameter missing: input',
    );

    // Non-string input
    assertThrows(
        () =>
            validators.greyscale({
                input: 123 as unknown as string,
            }),
        MissingParameterError,
        'Required parameter missing: input',
    );
});
