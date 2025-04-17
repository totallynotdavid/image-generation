import {
    TransformMap,
    TransformParams,
    TransformResult,
} from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { PluginExistsError } from '../errors.ts';
import { validators } from '../validation/schemas.ts';

/**
 * Plugin interface for extending the transform system
 */
export interface Plugin<K extends keyof TransformMap = keyof TransformMap> {
    name: K;
    handler: (params: TransformParams<K>) => Promise<TransformResult>;
    validator?: (params: TransformParams<K>) => void;
}

const plugins = new Map<string, Plugin<keyof TransformMap>>();

/**
 * Clear all registered plugins (for testing purposes)
 */
export function clearPlugins(): void {
    plugins.clear();
}

/**
 * Register a new transform plugin
 * @param plugin Plugin configuration
 * @throws {PluginExistsError} If a plugin with the same name is already registered
 */
export function registerPlugin<K extends keyof TransformMap>(
    plugin: Plugin<K>,
): void {
    const { name, handler, validator } = plugin;
    const pluginKey = String(name);

    if (plugins.has(pluginKey)) {
        throw new PluginExistsError(pluginKey);
    }

    plugins.set(pluginKey, plugin as unknown as Plugin<keyof TransformMap>);

    processor.registerHandler(name, handler);

    if (validator) {
        validators[name] = validator as (
            params: TransformParams<keyof TransformMap>,
        ) => void;
    }
}

/**
 * Get a registered plugin by name
 * @param name Plugin name
 * @returns Plugin or undefined if not found
 */
export function getPlugin<K extends keyof TransformMap>(
    name: K,
): Plugin<K> | undefined {
    return plugins.get(String(name)) as Plugin<K> | undefined;
}

/**
 * Get all registered plugins
 * @returns Array of all plugins
 */
export function getAllPlugins(): Plugin[] {
    return Array.from(plugins.values());
}
