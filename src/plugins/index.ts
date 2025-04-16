import {
    TransformMap,
    TransformParams,
    TransformResult,
} from '../types/transforms';
import { processor } from '../core/processor';
import { ImageTransformError } from '../errors';

export interface Plugin<K extends keyof TransformMap = keyof TransformMap> {
    name: K;
    handler: (params: TransformParams<K>) => Promise<TransformResult>;
    validator?: (params: TransformParams<K>) => void;
}

const plugins = new Map<string, Plugin>();

/**
 * Register a new plugin
 */
export function registerPlugin<K extends keyof TransformMap>(
    plugin: Plugin<K>,
): void {
    const { name, handler, validator } = plugin;

    if (plugins.has(String(name))) {
        throw new ImageTransformError(
            'PLUGIN_EXISTS',
            `Plugin '${String(name)}' is already registered`,
        );
    }

    // Store in plugin registry
    plugins.set(String(name), plugin);

    processor.registerHandler(name, handler);
}

/**
 * Get a registered plugin by name
 */
export function getPlugin<K extends keyof TransformMap>(
    name: K,
): Plugin<K> | undefined {
    return plugins.get(String(name)) as Plugin<K> | undefined;
}

/**
 * Get all registered plugins
 */
export function getAllPlugins(): Plugin[] {
    return Array.from(plugins.values());
}
