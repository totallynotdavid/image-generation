import { Image } from '@matmen/imagescript';
import { fromRgb, hslToRgb, parseHex, rgbToHsl } from '@temelj/color';
import { ColorParams, TransformResult } from '@/types.ts';
import { applyBaseTransforms, loadImageFromInput } from '@/utils.ts';
import { ProcessingError, throwProcessingError } from '@/errors.ts';

const INV_255 = 1 / 255;
const DEFAULTS = { INTENSITY: 1.0, OPACITY: 0.3, HEX: '#ffffff' } as const;
const BOUNDS = { INTENSITY: [0, 1], OPACITY: [0, 1] } as const;

function clamp(value: number, [min, max]: readonly [number, number]): number {
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
        const options = params.options;
        const mode = options.blendMode ?? 'tint';
        const intensity = clamp(
            options.intensity ?? DEFAULTS.INTENSITY,
            BOUNDS.INTENSITY,
        );
        const opacity = clamp(
            options.opacity ?? DEFAULTS.OPACITY,
            BOUNDS.OPACITY,
        );
        const hex = options.hex ?? DEFAULTS.HEX;

        const tintRgb = parseHex(hex);
        if (!tintRgb) {
            throw new ProcessingError(`Invalid hex color: ${hex}`);
        }

        const { red: tr255, green: tg255, blue: tb255 } = tintRgb;
        const originalImage = await loadImageFromInput(params.input);
        const src = applyBaseTransforms(originalImage, params.options);

        let tint: { h: number; s: number; tr: number; tg: number; tb: number };
        if (mode === 'tint') {
            const tintHsl = rgbToHsl(tintRgb);
            tint = {
                h: tintHsl.hue,
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

        const out = new Image(src.width, src.height);
        out.fill((x: number, y: number) => {
            const [origR, origG, origB, origA] = src.getRGBAAt(x, y);

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
                    finalR = tinted.red;
                    finalG = tinted.green;
                    finalB = tinted.blue;
                    break;
                }

                case 'softlight': {
                    const br = origR * INV_255;
                    const bg = origG * INV_255;
                    const bb = origB * INV_255;
                    finalR = (softLightBlend(br, tint.tr) * 255) | 0;
                    finalG = (softLightBlend(bg, tint.tg) * 255) | 0;
                    finalB = (softLightBlend(bb, tint.tb) * 255) | 0;
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
        throwProcessingError(error, 'Failed to apply color transform');
    }
}
