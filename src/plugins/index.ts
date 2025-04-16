import {
    TransformMap,
    TransformParams,
    TransformResult,
} from '../types/transforms.ts';
import { processor } from '../core/processor.ts';
import { PluginExistsError } from '../errors.ts';

/**
 * Plugin interface for extending the transform system
 */
export interface Plugin<K extends keyof TransformMap = keyof TransformMap> {
    /** Unique name for the transform type */
    name: K;
    /** Handler function that performs the transformation */
    handler: (params: TransformParams<K>) => Promise<TransformResult>;
    /** Optional validator function for validating parameters */
    validator?: (params: TransformParams<K>) => void;
}

// Store registered plugins
const plugins = new Map<string, Plugin<any>>();

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

    // Register the plugin in our registry
    plugins.set(pluginKey, plugin);

    // Register the handler with the processor
    processor.registerHandler(name, handler);

    // If the plugin has a validator, register it (handled in validator registration)
    if (validator) {
        // Note: validator registration would be handled in the validation system
        // This is currently handled by explicitly importing validators
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
