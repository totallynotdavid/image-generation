import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export class AssetResolver {
    private basePath: string;

    constructor(assetsPath?: string) {
        this.basePath = assetsPath || path.join(process.cwd(), 'assets');

        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath, { recursive: true });
        }
    }

    public resolveAsset(assetName: string): string {
        if (!assetName || typeof assetName !== 'string') {
            throw new Error('Asset name must be a non-empty string');
        }

        const assetPath = path.join(this.basePath, assetName);
        if (!fs.existsSync(assetPath)) {
            throw new Error(`Asset not found: ${assetName}`);
        }
        return assetPath;
    }
}
