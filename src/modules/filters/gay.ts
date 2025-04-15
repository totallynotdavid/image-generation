import { Canvas, loadImage } from 'canvas';
import { ImageInput, ProcessedOutput } from '../../core/types.ts';
import { SingleImageBaseModule } from '../base-module.ts';

export class GayFilter extends SingleImageBaseModule {
    private static readonly IMAGE_SIZE = 480;

    async process(input: ImageInput): Promise<ProcessedOutput> {
        const imageBuffer = await this.validateSingleInput(input);

        const canvas = new Canvas(GayFilter.IMAGE_SIZE, GayFilter.IMAGE_SIZE);
        const ctx = canvas.getContext('2d');

        const img = await loadImage(imageBuffer);
        const bgPath = this.assetResolver.resolveAsset('gay.png');
        const bg = await loadImage(bgPath);

        ctx.drawImage(img, 0, 0, GayFilter.IMAGE_SIZE, GayFilter.IMAGE_SIZE);
        ctx.drawImage(bg, 0, 0, GayFilter.IMAGE_SIZE, GayFilter.IMAGE_SIZE);

        return canvas.toBuffer();
    }
}
