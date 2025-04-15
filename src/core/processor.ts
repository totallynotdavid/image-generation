import {
    ImageInput,
    ImageProcessor,
    MultiImageModule,
    ProcessedOutput,
    ProcessingModule,
    SingleImageModule,
} from './types.ts';

/**
 * Extended interface for processing modules with type flag
 */
interface ModuleWithFlag extends ProcessingModule {
    _acceptsMultipleImages?: boolean;
}

export class ImageProcessorImpl implements ImageProcessor {
    private modules: Map<string, ProcessingModule> = new Map();

    registerModule(name: string, module: ProcessingModule): void {
        if (!name || typeof name !== 'string') {
            throw new Error('Module name must be a non-empty string');
        }

        if (!module || typeof module.process !== 'function') {
            throw new Error('Invalid module: must have a process method');
        }

        const normalizedName = name.toLowerCase();
        if (this.modules.has(normalizedName)) {
            console.warn(`Overwriting existing module: ${normalizedName}`);
        }
        this.modules.set(normalizedName, module);
    }

    async processImage<T extends unknown[] = unknown[]>(
        input: ImageInput | ImageInput[],
        moduleName: string,
        ...args: T
    ): Promise<ProcessedOutput> {
        if (!moduleName || typeof moduleName !== 'string') {
            throw new Error('Module name must be a non-empty string');
        }

        const normalizedName = moduleName.toLowerCase();
        const module = this.modules.get(normalizedName);

        if (!module) {
            throw new Error(
                `Module "${normalizedName}" not registered. Available modules: ${
                    Array.from(
                        this.modules.keys(),
                    ).join(', ')
                }`,
            );
        }

        try {
            if (isSingleImageModule(module) && Array.isArray(input)) {
                throw new Error(
                    `Module "${module.getName()}" requires a single image, but an array of images was provided.`,
                );
            }

            if (isMultiImageModule(module) && !Array.isArray(input)) {
                throw new Error(
                    `Module "${module.getName()}" requires multiple images, but only a single image was provided.`,
                );
            }

            if (Array.isArray(input) && isMultiImageModule(module)) {
                return await (module as MultiImageModule).process(
                    input,
                    ...args,
                );
            } else if (!Array.isArray(input) && isSingleImageModule(module)) {
                return await (module as SingleImageModule).process(
                    input,
                    ...args,
                );
            } else {
                return await module.process(
                    input as ImageInput | ImageInput[],
                    ...args,
                );
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(
                    `Image processing failed in module "${module.getName()}": ${error.message}`,
                );
            }
            throw new Error(
                `Unknown error occurred in module "${module.getName()}"`,
            );
        }
    }
}

/**
 * Type guard for SingleImageModule
 */
function isSingleImageModule(
    module: ProcessingModule,
): module is SingleImageModule {
    const modulePrototype = Object.getPrototypeOf(module);
    if (modulePrototype && modulePrototype.constructor) {
        const constructorName = modulePrototype.constructor.name;
        if (constructorName === 'SingleImageBaseModule') {
            return true;
        }
    }

    return (
        'process' in module &&
        typeof module.process === 'function' &&
        !isMultiImageModule(module)
    );
}

/**
 * Type guard for MultiImageModule
 */
function isMultiImageModule(
    module: ProcessingModule,
): module is MultiImageModule {
    const modulePrototype = Object.getPrototypeOf(module);
    if (modulePrototype && modulePrototype.constructor) {
        const constructorName = modulePrototype.constructor.name;
        if (constructorName === 'MultiImageBaseModule') {
            return true;
        }
    }

    const moduleWithFlag = module as ModuleWithFlag;
    return moduleWithFlag._acceptsMultipleImages === true;
}
