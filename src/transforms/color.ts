import { Image } from '@matmen/imagescript';
import { fromRgb, hslToRgb, parseHex, rgbToHsl } from '@temelj/color';
import type { ColorParams, TransformResult } from '@/types.ts';
import { loadImage } from '@/utils.ts';
import {
    ImageTransformError,
    ProcessingError,
    throwProcessingError,
} from '@/errors.ts';

const INV_255 = 1 / 255;

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function softLightBlend(base: number, overlay: number): number {
    return overlay < 0.5
        ? base - (1 - 2 * overlay) * base * (1 - base)
        : base + (2 * overlay - 1) * (
                    base <= 0.25
                        ? ((16 * base - 12) * base + 4) * base
                        : Math.sqrt(base)
                ) -
            base;
}

export async function color(params: ColorParams): Promise<TransformResult> {
    try {
        const image = await loadImage(params.input);

        const mode = params.blendMode ?? 'tint';
        const intensity = clamp(params.intensity ?? 1.0, 0, 1);
        const opacity = clamp(params.opacity ?? 0.3, 0, 1);
        const hex = params.hex ?? '#ffffff';

        const tintRgb = parseHex(hex);
        if (!tintRgb) {
            throw new ProcessingError(`Invalid hex color: ${hex}`);
        }

        const { red: tr255, green: tg255, blue: tb255 } = tintRgb;

        let tint: { h: number; s: number; tr: number; tg: number; tb: number };
        if (mode === 'tint') {
            const tintHsl = rgbToHsl(tintRgb);
            tint = {
                // hue is stored as [0,1], so we have to scale it to deg [0,360] for hslToRgb
                h: tintHsl.hue * 360,
                s: tintHsl.saturation,
                tr: tr255 * INV_255,
                tg: tg255 * INV_255,
                tb: tb255 * INV_255,
            };
        } else {
            tint = {
                h: 0,
                s: 0,
                tr: tr255 * INV_255,
                tg: tg255 * INV_255,
                tb: tb255 * INV_255,
            };
        }

        const oneMinusOpacity = 1 - opacity;
        const oneMinusIntensity = 1 - intensity;

        const out = new Image(image.width, image.height);
        out.fill((x: number, y: number) => {
            const [origR, origG, origB, origA] = image.getRGBAAt(x, y);

            let finalR = origR;
            let finalG = origG;
            let finalB = origB;

            switch (mode) {
                case 'wash':
                    finalR = (tr255 * opacity + origR * oneMinusOpacity) | 0;
                    finalG = (tg255 * opacity + origG * oneMinusOpacity) | 0;
                    finalB = (tb255 * opacity + origB * oneMinusOpacity) | 0;
                    break;

                case 'tint': {
                    const srcHsl = rgbToHsl(fromRgb(origR, origG, origB));
                    const tinted = hslToRgb({
                        hue: tint.h,
                        saturation: tint.s,
                        lightness: srcHsl.lightness,
                        alpha: 1,
                    });
                    finalR = (tinted.red * opacity + origR * oneMinusOpacity) |
                        0;
                    finalG =
                        (tinted.green * opacity + origG * oneMinusOpacity) | 0;
                    finalB = (tinted.blue * opacity + origB * oneMinusOpacity) |
                        0;
                    break;
                }

                case 'softlight': {
                    const br = origR * INV_255;
                    const bg = origG * INV_255;
                    const bb = origB * INV_255;
                    const softR = softLightBlend(br, tint.tr) * 255;
                    const softG = softLightBlend(bg, tint.tg) * 255;
                    const softB = softLightBlend(bb, tint.tb) * 255;
                    finalR = (softR * opacity + origR * oneMinusOpacity) | 0;
                    finalG = (softG * opacity + origG * oneMinusOpacity) | 0;
                    finalB = (softB * opacity + origB * oneMinusOpacity) | 0;
                    break;
                }
            }

            if (intensity < 1) {
                finalR = (origR * oneMinusIntensity + finalR * intensity) | 0;
                finalG = (origG * oneMinusIntensity + finalG * intensity) | 0;
                finalB = (origB * oneMinusIntensity + finalB * intensity) | 0;
            }

            return Image.rgbaToColor(finalR, finalG, finalB, origA);
        });

        return await out.encode();
    } catch (error) {
        if (error instanceof ImageTransformError) throw error;
        throwProcessingError(error, 'Failed to apply color transform');
    }
}
