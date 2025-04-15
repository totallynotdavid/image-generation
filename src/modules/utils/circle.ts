import { Jimp } from 'jimp';
import { ImageInput, ProcessedOutput } from '../../core/types.ts';
import { SingleImageBaseModule } from '../base-module.ts';

export class CircleUtil extends SingleImageBaseModule {
    async process(input: ImageInput): Promise<ProcessedOutput> {
        const imageBuffer = await this.validateSingleInput(input);

        const image = await Jimp.read(imageBuffer);
        image.resize({ w: 480, h: 480 });
        image.circle();

        return await image.getBuffer('image/png');
    }
}
