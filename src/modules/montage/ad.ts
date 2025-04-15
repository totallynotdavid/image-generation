import { Jimp } from 'jimp';
import { ImageInput, ProcessedOutput } from '../../core/types.ts';
import { SingleImageBaseModule } from '../base-module.ts';

export class AdMontage extends SingleImageBaseModule {
    async process(input: ImageInput): Promise<ProcessedOutput> {
        const imageBuffer = await this.validateSingleInput(input);

        const image = await Jimp.read(imageBuffer);
        image.resize({ w: 230, h: 230 });

        const bgPath = this.assetResolver.resolveAsset('ad.png');
        const background = await Jimp.read(bgPath);
        background.composite(image, 150, 75);

        return await background.getBuffer('image/png');
    }
}
