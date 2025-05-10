import { isAbsolute, join } from '@std/path';
import { exists } from '@std/fs/exists';
import { FileSystemError } from '@/errors.ts';

export class AssetResolver {
    private basePath: string;
    private basePathExists: boolean | null = null;
    private fileCache = new Map<string, string>();

    constructor(assetsPath?: string) {
        if (assetsPath !== undefined && typeof assetsPath !== 'string') {
            throw new TypeError('Assets path must be a string if provided');
        }

        this.basePath = assetsPath || join(Deno.cwd(), 'assets');
    }

    private async ensureBasePathExists(): Promise<void> {
        if (this.basePathExists !== null) {
            if (!this.basePathExists) {
                throw new FileSystemError(
                    'Assets directory does not exist and could not be created',
                    this.basePath,
                );
            }
            return;
        }

        try {
            const pathExists = await exists(this.basePath);

            if (!pathExists) {
                await Deno.mkdir(this.basePath, { recursive: true });
            }

            this.basePathExists = true;
        } catch (error) {
            this.basePathExists = false;
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

        // Check cache first
        const cacheKey = isAbsolute(assetName)
            ? assetName
            : join(this.basePath, assetName);
        const cachedPath = this.fileCache.get(cacheKey);
        if (cachedPath !== undefined) {
            return cachedPath;
        }

        // If assetName is absolute, check it directly without checking basePath
        if (isAbsolute(assetName)) {
            return this.validateAndCachePath(assetName, assetName);
        }

        // For relative paths, ensure base path exists first
        await this.ensureBasePathExists();

        // Resolve relative to base path
        const assetPath = join(this.basePath, assetName);
        return this.validateAndCachePath(assetName, assetPath);
    }

    private async validateAndCachePath(
        assetName: string,
        assetPath: string,
    ): Promise<string> {
        try {
            const fileInfo = await Deno.stat(assetPath);

            if (!fileInfo.isFile) {
                throw new FileSystemError(
                    `Asset exists but is not a file: ${assetName}`,
                    assetPath,
                );
            }

            this.fileCache.set(assetPath, assetPath);
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
                    error instanceof Error ? error.message : 'unknown error'
                }`,
                assetPath,
                error instanceof Error ? error : undefined,
            );
        }
    }

    public clearCache(): void {
        this.fileCache.clear();
    }
}
