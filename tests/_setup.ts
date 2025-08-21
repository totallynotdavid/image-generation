import { join } from '@std/path';
import { Image } from '@matmen/imagescript';

export const ASSETS_DIR = './test_assets';

export class TestImageGenerator {
    static createSolidColor(
        width: number,
        height: number,
        color: { r: number; g: number; b: number; a?: number },
    ): Image {
        const image = new Image(width, height);
        const rgba = Image.rgbaToColor(
            color.r,
            color.g,
            color.b,
            color.a ?? 255,
        );
        image.fill(rgba);
        return image;
    }

    static createGradient(width: number, height: number): Image {
        const image = new Image(width, height);
        image.fill((x: number, y: number) => {
            const r = Math.floor((x / width) * 255);
            const g = Math.floor((y / height) * 255);
            const b = 128;
            return Image.rgbaToColor(r, g, b, 255);
        });
        return image;
    }

    static createPattern(size: number): Image {
        const image = new Image(size, size);
        const center = size / 2;
        const radius = size * 0.3;

        image.fill((x: number, y: number) => {
            const dx = x - center;
            const dy = y - center;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const ring = Math.floor(distance / (radius / 3)) % 2;
            const color = ring === 0 ? 200 : 50;
            return Image.rgbaToColor(color, color, color, 255);
        });
        return image;
    }
}

const TEST_IMAGES = [
    {
        name: 'red_square.png',
        generator: () =>
            TestImageGenerator.createSolidColor(100, 100, {
                r: 255,
                g: 0,
                b: 0,
            }),
    },
    {
        name: 'blue_square.png',
        generator: () =>
            TestImageGenerator.createSolidColor(100, 100, {
                r: 0,
                g: 0,
                b: 255,
            }),
    },
    {
        name: 'green_rectangle.png',
        generator: () =>
            TestImageGenerator.createSolidColor(150, 80, {
                r: 0,
                g: 255,
                b: 0,
            }),
    },
    {
        name: 'gradient.png',
        generator: () => TestImageGenerator.createGradient(120, 120),
    },
    {
        name: 'pattern.png',
        generator: () => TestImageGenerator.createPattern(100),
    },
    {
        name: 'tiny.png',
        generator: () =>
            TestImageGenerator.createSolidColor(20, 20, {
                r: 128,
                g: 128,
                b: 128,
            }),
    },
];

export async function setupTestAssets() {
    await Deno.remove(ASSETS_DIR, { recursive: true }).catch(() => {});
    await Deno.mkdir(ASSETS_DIR, { recursive: true });

    for (const { name, generator } of TEST_IMAGES) {
        const image = generator();
        const buffer = await image.encode();
        await Deno.writeFile(join(ASSETS_DIR, name), buffer);
    }

    await Deno.writeTextFile(join(ASSETS_DIR, 'not_image.txt'), 'Not an image');
    await Deno.writeTextFile(join(ASSETS_DIR, 'empty.png'), '');

    console.log(`Generated ${TEST_IMAGES.length} test images + invalid files`);
}

export async function cleanupTestAssets() {
    await Deno.remove(ASSETS_DIR, { recursive: true }).catch(() => {});
}

export const TestAssets = {
    RED_SQUARE: join(ASSETS_DIR, 'red_square.png'),
    BLUE_SQUARE: join(ASSETS_DIR, 'blue_square.png'),
    GREEN_RECTANGLE: join(ASSETS_DIR, 'green_rectangle.png'),
    GRADIENT: join(ASSETS_DIR, 'gradient.png'),
    PATTERN: join(ASSETS_DIR, 'pattern.png'),
    TINY: join(ASSETS_DIR, 'tiny.png'),
    NOT_IMAGE: join(ASSETS_DIR, 'not_image.txt'),
    EMPTY: join(ASSETS_DIR, 'empty.png'),
    NONEXISTENT: join(ASSETS_DIR, 'does_not_exist.png'),
} as const;
