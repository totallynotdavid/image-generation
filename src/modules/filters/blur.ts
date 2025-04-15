import { Jimp } from 'jimp';
import { ImageInput, ProcessedOutput } from '../../core/types.ts';
import { SingleImageBaseModule } from '../base-module.ts';

export class BlurFilter extends SingleImageBaseModule {
    async process(input: ImageInput, level?: number): Promise<ProcessedOutput> {
        const imageBuffer = await this.validateSingleInput(input);
        const blurLevel = typeof level === 'number' ? level : 5;

        const image = await Jimp.read(imageBuffer);
        image.blur(blurLevel);

        return await image.getBuffer('image/png');
    }
}
