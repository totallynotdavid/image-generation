import { Image } from '@matmen/imagescript';
import { fromRgb, hslToRgb, parseHex, rgbToHsl } from '@temelj/color';
import { ColorParams, TransformResult } from '@/types.ts';
import { loadImage, resolveAsset } from '@/utils.ts';
import { ProcessingError } from '@/errors.ts';

const INV_255 = 1 / 255;

function softLightBlend(b: number, s: number): number {
    if (s < 0.5) {
        return b - (1 - 2 * s) * b * (1 - b);
    } else {
        const d = b <= 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b);
        return b + (2 * s - 1) * (d - b);
    }
}

export async function color(params: ColorParams): Promise<TransformResult> {
    try {
        const options = params.options ?? {};
        const mode = options.blendMode ?? 'tint';
        const intensity = typeof options.intensity === 'number'
            ? Math.max(0, Math.min(1, options.intensity))
            : 1;

        const hex = options.hex ?? '#ffffff';
        const tintRgb = parseHex(hex);

        if (!tintRgb) {
            throw new ProcessingError(`Invalid hex color: ${hex}`);
        }

        const tr255 = tintRgb.red;
        const tg255 = tintRgb.green;
        const tb255 = tintRgb.blue;

        let tr: number;
        let tg: number;
        let tb: number;

        let tH: number;
        let tS: number;
        if (mode === 'tint') {
            const tintHsl = rgbToHsl(tintRgb);
            tH = tintHsl.hue;
            tS = tintHsl.saturation;
        } else if (mode === 'softlight') {
            tr = tr255 * INV_255;
            tg = tg255 * INV_255;
            tb = tb255 * INV_255;
        }

        const washOpacity = typeof options.opacity === 'number'
            ? Math.max(0, Math.min(1, options.opacity))
            : 0.3;

        const resolvedPath = await resolveAsset(params.input);
        const src = await loadImage(resolvedPath);
        const out = new Image(src.width, src.height);

        const oneMinusWashOpacity = 1 - washOpacity;

        out.fill((x: number, y: number) => {
            const [origR, origG, origB, origA] = src.getRGBAAt(x, y);

            let finalR = origR;
            let finalG = origG;
            let finalB = origB;

            if (mode === 'wash') {
                finalR =
                    ((tr255 * washOpacity) + (origR * oneMinusWashOpacity)) | 0;
                finalG =
                    ((tg255 * washOpacity) + (origG * oneMinusWashOpacity)) | 0;
                finalB =
                    ((tb255 * washOpacity) + (origB * oneMinusWashOpacity)) | 0;
            } else if (
                mode === 'tint' && tH !== undefined && tS !== undefined
            ) {
                const srcHsl = rgbToHsl(fromRgb(origR, origG, origB));
                const sl = srcHsl.lightness;
                const tinted = hslToRgb({
                    hue: tH,
                    saturation: tS,
                    lightness: sl,
                    alpha: 1,
                });
                finalR = tinted.red;
                finalG = tinted.green;
                finalB = tinted.blue;
            } else if (
                mode === 'softlight' && tr !== undefined && tg !== undefined &&
                tb !== undefined
            ) {
                const br = origR * INV_255;
                const bg = origG * INV_255;
                const bb = origB * INV_255;
                const rr = softLightBlend(br, tr);
                const rg = softLightBlend(bg, tg);
                const rb = softLightBlend(bb, tb);
                finalR = (rr * 255) | 0;
                finalG = (rg * 255) | 0;
                finalB = (rb * 255) | 0;
            }

            if (intensity <= 0) {
                return Image.rgbaToColor(origR, origG, origB, origA);
            } else if (intensity >= 1) {
                return Image.rgbaToColor(finalR, finalG, finalB, origA);
            } else {
                const rMix =
                    ((origR * (1 - intensity)) + (finalR * intensity)) | 0;
                const gMix =
                    ((origG * (1 - intensity)) + (finalG * intensity)) | 0;
                const bMix =
                    ((origB * (1 - intensity)) + (finalB * intensity)) | 0;
                return Image.rgbaToColor(rMix, gMix, bMix, origA);
            }
        });

        return await out.encode();
    } catch (err) {
        throw new ProcessingError(
            `Failed to apply color transform: ${
                err instanceof Error ? err.message : 'unknown error'
            }`,
            err instanceof Error ? err : undefined,
        );
    }
}
