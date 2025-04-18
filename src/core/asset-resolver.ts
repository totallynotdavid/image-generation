import { isAbsolute, join } from '@std/path';
import { exists } from '@std/fs';
import { FileSystemError } from '@/errors.ts';

/**
 * Resolves asset paths within a configured directory
 */
export class AssetResolver {
    private basePath: string;
    private initializePromise: Promise<void>;

    /**
     * Creates a new asset resolver
     * @param assetsPath Optional custom path for assets directory
     * @throws {TypeError} If assetsPath is provided but not a string
     */
    constructor(assetsPath?: string) {
        if (assetsPath !== undefined && typeof assetsPath !== 'string') {
            throw new TypeError('Assets path must be a string if provided');
        }

        this.basePath = assetsPath || join(Deno.cwd(), 'assets');
        this.initializePromise = this.ensureBasePathExists();
    }

    /**
     * Ensures the base assets directory exists
     * @private
     */
    private async ensureBasePathExists(): Promise<void> {
        try {
            if (!await exists(this.basePath)) {
                await Deno.mkdir(this.basePath, { recursive: true });
            }
        } catch (error) {
            throw new FileSystemError(
                `Failed to create assets directory: ${
                    error instanceof Error ? error.message : 'unknown error'
                }`,
                this.basePath,
                error instanceof Error ? error : undefined,
            );
        }
    }

    /**
     * Resolves an asset name to its full path
     * @param assetName Name of the asset to resolve
     * @returns Full path to the asset
     * @throws {FileSystemError} If asset cannot be found or accessed
     * @throws {TypeError} If assetName is not a string or is empty
     */
    public async resolveAsset(assetName: string): Promise<string> {
        if (typeof assetName !== 'string' || assetName.trim() === '') {
            throw new TypeError('Asset name must be a non-empty string');
        }

        await this.initializePromise;

        try {
            const fileInfo = await Deno.stat(assetName);
            if (fileInfo.isFile) {
                return assetName;
            }
            throw new FileSystemError(
                `Asset exists but is not a file: ${assetName}`,
                assetName,
            );
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                const assetPath = isAbsolute(assetName)
                    ? assetName
                    : join(this.basePath, assetName);

                try {
                    const fileInfo = await Deno.stat(assetPath);

                    if (!fileInfo.isFile) {
                        throw new FileSystemError(
                            `Asset exists but is not a file: ${assetName}`,
                            assetPath,
                        );
                    }

                    return assetPath;
                } catch (error) {
                    if (error instanceof Deno.errors.NotFound) {
                        throw new FileSystemError(
                            `Asset not found: ${assetName}`,
                            assetPath,
                        );
                    }

                    if (error instanceof FileSystemError) {
                        throw error;
                    }

                    throw new FileSystemError(
                        `Failed to access asset '${assetName}': ${
                            error instanceof Error
                                ? error.message
                                : 'unknown error'
                        }`,
                        assetPath,
                        error instanceof Error ? error : undefined,
                    );
                }
            }
            throw new FileSystemError(
                `Failed to access asset '${assetName}': ${
                    error instanceof Error ? error.message : 'unknown error'
                }`,
                assetName,
                error instanceof Error ? error : undefined,
            );
        }
    }
}
