import { exists } from 'https://deno.land/std@0.224.0/fs/mod.ts';
import { join } from 'https://deno.land/std@0.224.0/path/mod.ts';
import { FileSystemError } from '../errors.ts';

/**
 * Resolves asset paths within a configured directory
 */
export class AssetResolver {
    private basePath: string;

    /**
     * Creates a new asset resolver
     * @param assetsPath Optional custom path for assets directory
     */
    constructor(assetsPath?: string) {
        this.basePath = assetsPath || join(Deno.cwd(), 'assets');
        this.ensureBasePathExists();
    }

    /**
     * Ensures the base assets directory exists
     * @throws {FileSystemError} If directory creation fails
     */
    private async ensureBasePathExists(): Promise<void> {
        try {
            if (!await exists(this.basePath)) {
                await Deno.mkdir(this.basePath);
            }
        } catch (_error: unknown) {
            throw new FileSystemError(
                'Failed to create assets directory',
                this.basePath,
            );
        }
    }

    /**
     * Resolves an asset name to its full path
     * @param assetName Name of the asset to resolve
     * @returns Full path to the asset
     * @throws {FileSystemError} If asset cannot be found
     */
    public async resolveAsset(assetName: string): Promise<string> {
        if (!assetName || typeof assetName !== 'string') {
            throw new FileSystemError('Asset name must be a non-empty string');
        }

        const assetPath = join(this.basePath, assetName);

        try {
            if (!await exists(assetPath)) {
                throw new FileSystemError(
                    `Asset not found: ${assetName}`,
                    assetPath,
                );
            }
            return assetPath;
        } catch (error: unknown) {
            if (error instanceof FileSystemError) {
                throw error;
            }
            throw new FileSystemError(
                `Failed to access asset: ${assetName}`,
                assetPath,
            );
        }
    }
}
