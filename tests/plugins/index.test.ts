import { assertEquals, assertExists, assertThrows } from '@std/assert';
import {
    getAllPlugins,
    getPlugin,
    Plugin,
    registerPlugin,
} from '../../src/plugins/index.ts';
import { PluginExistsError } from '../../src/errors.ts';
import { processor } from '../../src/core/processor.ts';
import { validators } from '../../src/validation/schemas.ts';
import {
    TransformParams,
    TransformResult,
} from '../../src/types/transforms.ts';

Deno.test('registerPlugin - successfully registers a plugin', () => {
    // deno-lint-ignore require-await
    const mockHandler = async (): Promise<TransformResult> => {
        return new Uint8Array([1, 2, 3]);
    };

    const mockPlugin: Plugin<'greyscale'> = {
        name: 'greyscale' as const,
        handler: mockHandler,
    };

    // Register plugin
    registerPlugin(mockPlugin);

    // Verify plugin was registered
    const retrievedPlugin = getPlugin('greyscale' as keyof typeof validators);
    assertExists(retrievedPlugin);
    assertEquals(retrievedPlugin.name, 'greyscale');

    // Verify handler was registered with processor
    const hasHandler = processor.hasHandler(
        'greyscale' as keyof typeof validators,
    );
    assertEquals(hasHandler, true);

    // Clean up
    delete (validators as Record<string, unknown>)['greyscale'];
});

Deno.test('registerPlugin - registers plugin with validator', () => {
    // deno-lint-ignore require-await
    const mockHandler = async (): Promise<TransformResult> => {
        return new Uint8Array([1, 2, 3]);
    };

    const mockValidator = (): void => {
        // Validation logic
    };

    const mockPlugin: Plugin<'color'> = {
        name: 'color' as const,
        handler: mockHandler,
        validator: mockValidator,
    };

    // Register plugin
    registerPlugin(mockPlugin);

    // Verify validator was registered
    const validator = validators['color' as keyof typeof validators];
    assertExists(validator);

    // Clean up
    delete (validators as Record<string, unknown>)['color'];
});

Deno.test('registerPlugin - throws when plugin already exists', () => {
    // deno-lint-ignore require-await
    const mockHandler = async (): Promise<TransformResult> => {
        return new Uint8Array([1, 2, 3]);
    };

    const mockPlugin: Plugin<'circle'> = {
        name: 'circle' as const,
        handler: mockHandler,
    };

    // Register plugin once
    registerPlugin(mockPlugin);

    // Try to register again
    assertThrows(
        () => registerPlugin(mockPlugin),
        PluginExistsError,
        "Plugin with name 'circle' is already registered",
    );

    // Clean up
    delete (validators as Record<string, unknown>)['circle'];
});

Deno.test('getPlugin - returns undefined for non-existent plugin', () => {
    const plugin = getPlugin('nonExistentPlugin' as keyof typeof validators);
    assertEquals(plugin, undefined);
});

Deno.test('getAllPlugins - returns array of all registered plugins', () => {
    // Clear existing plugins for this test
    const originalPlugins = getAllPlugins();

    // deno-lint-ignore require-await
    const mockHandler1 = async (): Promise<TransformResult> => {
        return new Uint8Array([1, 2, 3]);
    };

    // deno-lint-ignore require-await
    const mockHandler2 = async (): Promise<TransformResult> => {
        return new Uint8Array([4, 5, 6]);
    };

    const plugin1: Plugin<'greyscale'> = {
        name: 'greyscale' as const,
        handler: mockHandler1,
    };

    const plugin2: Plugin<'blink'> = {
        name: 'blink' as const,
        handler: mockHandler2,
    };

    // Register test plugins
    registerPlugin(plugin1);
    registerPlugin(plugin2);

    // Get all plugins
    const plugins = getAllPlugins();

    // Verify both plugins are in the array
    assertEquals(plugins.length >= 2, true);
    assertEquals(plugins.some((p) => p.name === 'greyscale'), true);
    assertEquals(plugins.some((p) => p.name === 'blink'), true);

    // Clean up
    delete (validators as Record<string, unknown>)['greyscale'];
    delete (validators as Record<string, unknown>)['blink'];
});
