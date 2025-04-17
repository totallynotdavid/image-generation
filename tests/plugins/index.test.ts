import { assertEquals, assertExists, assertThrows } from '@std/assert';
import {
    clearPlugins,
    getAllPlugins,
    getPlugin,
    Plugin,
    registerPlugin,
} from '../../src/plugins/index.ts';
import { PluginExistsError } from '../../src/errors.ts';
import { processor } from '../../src/core/processor.ts';
import { validators } from '../../src/validation/schemas.ts';
import { TransformResult } from '../../src/types/transforms.ts';

// Helper function to clean up plugins between tests
function cleanupPlugins(): void {
    clearPlugins();
    processor.reset();
    Object.keys(validators).forEach((key) => {
        delete (validators as Record<string, unknown>)[key];
    });
}

Deno.test('registerPlugin - successfully registers a plugin', () => {
    cleanupPlugins();
    const mockHandler = async (): Promise<TransformResult> => {
        return new Uint8Array([1, 2, 3]);
    };

    const mockPlugin: Plugin<'greyscale'> = {
        name: 'greyscale' as const,
        handler: mockHandler,
    };

    registerPlugin(mockPlugin);

    const retrievedPlugin = getPlugin('greyscale' as keyof typeof validators);
    assertExists(retrievedPlugin);
    assertEquals(retrievedPlugin.name, 'greyscale');

    const hasHandler = processor.hasHandler(
        'greyscale' as keyof typeof validators,
    );
    assertEquals(hasHandler, true);
});

Deno.test('registerPlugin - registers plugin with validator', () => {
    cleanupPlugins();
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

    registerPlugin(mockPlugin);

    const validator = validators['color' as keyof typeof validators];
    assertExists(validator);
});

Deno.test('registerPlugin - throws when plugin already exists', () => {
    cleanupPlugins();
    const mockHandler = async (): Promise<TransformResult> => {
        return new Uint8Array([1, 2, 3]);
    };

    const mockPlugin: Plugin<'circle'> = {
        name: 'circle' as const,
        handler: mockHandler,
    };

    registerPlugin(mockPlugin);

    assertThrows(
        () => registerPlugin(mockPlugin),
        PluginExistsError,
        "Plugin with name 'circle' is already registered",
    );
});

Deno.test('getPlugin - returns undefined for non-existent plugin', () => {
    cleanupPlugins();
    const plugin = getPlugin('nonExistentPlugin' as keyof typeof validators);
    assertEquals(plugin, undefined);
});

Deno.test('getAllPlugins - returns array of all registered plugins', () => {
    cleanupPlugins();
    const originalPlugins = getAllPlugins();

    const mockHandler1 = async (): Promise<TransformResult> => {
        return new Uint8Array([1, 2, 3]);
    };

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

    registerPlugin(plugin1);
    registerPlugin(plugin2);

    const plugins = getAllPlugins();

    assertEquals(plugins.length >= 2, true);
    assertEquals(plugins.some((p) => p.name === 'greyscale'), true);
    assertEquals(plugins.some((p) => p.name === 'blink'), true);
});
