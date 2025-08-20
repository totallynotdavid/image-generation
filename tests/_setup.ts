import { join } from '@std/path';
import { Image } from '@matmen/imagescript';
export {
    assert,
    assertEquals,
    assertInstanceOf,
    assertRejects,
} from '@std/assert';

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
            const b = Math.floor(((x + y) / (width + height)) * 255);
            return Image.rgbaToColor(r, g, b, 255);
        });
        return image;
    }

    static createCirclePattern(size: number): Image {
        const image = new Image(size, size);
        const center = size / 2;
        const radius = size * 0.4;

        image.fill((x: number, y: number) => {
            const dx = x - center;
            const dy = y - center;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                return Image.rgbaToColor(255, 100, 100, 255); // Red circle
            } else {
                return Image.rgbaToColor(100, 100, 255, 255); // Blue background
            }
        });
        return image;
    }

    static createCheckerboard(
        width: number,
        height: number,
        squareSize = 10,
    ): Image {
        const image = new Image(width, height);
        image.fill((x: number, y: number) => {
            const checkX = Math.floor(x / squareSize);
            const checkY = Math.floor(y / squareSize);
            const isWhite = (checkX + checkY) % 2 === 0;
            const color = isWhite ? 255 : 0;
            return Image.rgbaToColor(color, color, color, 255);
        });
        return image;
    }

    static createNoise(width: number, height: number): Image {
        const image = new Image(width, height);
        image.fill(() => {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return Image.rgbaToColor(r, g, b, 255);
        });
        return image;
    }
}

const TEST_IMAGES = [
    {
        name: 'square_red.png',
        generator: () =>
            TestImageGenerator.createSolidColor(100, 100, {
                r: 255,
                g: 0,
                b: 0,
            }),
    },
    {
        name: 'square_green.png',
        generator: () =>
            TestImageGenerator.createSolidColor(100, 100, {
                r: 0,
                g: 255,
                b: 0,
            }),
    },
    {
        name: 'square_blue.png',
        generator: () =>
            TestImageGenerator.createSolidColor(100, 100, {
                r: 0,
                g: 0,
                b: 255,
            }),
    },
    {
        name: 'wide_gradient.png',
        generator: () => TestImageGenerator.createGradient(200, 100),
    },
    {
        name: 'tall_gradient.png',
        generator: () => TestImageGenerator.createGradient(100, 200),
    },
    {
        name: 'circle_pattern.png',
        generator: () => TestImageGenerator.createCirclePattern(120),
    },
    {
        name: 'checkerboard.png',
        generator: () => TestImageGenerator.createCheckerboard(150, 150, 15),
    },
    {
        name: 'noise_small.png',
        generator: () => TestImageGenerator.createNoise(80, 80),
    },
    {
        name: 'tiny_image.png',
        generator: () =>
            TestImageGenerator.createSolidColor(10, 10, {
                r: 128,
                g: 128,
                b: 128,
            }),
    },
    {
        name: 'large_image.png',
        generator: () => TestImageGenerator.createCheckerboard(800, 600, 50),
    },
];

export async function setup() {
    await Deno.remove(ASSETS_DIR, { recursive: true }).catch(() => {});
    await Deno.mkdir(ASSETS_DIR, { recursive: true });

    // red herring for path resolver test
    // see utils.test.ts
    await Deno.mkdir(join(ASSETS_DIR, 'subdirectory'), { recursive: true });

    await Deno.writeTextFile(
        join(ASSETS_DIR, 'not_an_image.txt'),
        'This is not an image file',
    );
    await Deno.writeTextFile(
        join(ASSETS_DIR, 'fake_image.png'),
        'PNG header but not really a PNG',
    );
    await Deno.writeTextFile(join(ASSETS_DIR, 'empty_file.png'), '');

    for (const { name, generator } of TEST_IMAGES) {
        const image = generator();
        const buffer = await image.encode();
        await Deno.writeFile(join(ASSETS_DIR, name), buffer);
    }

    console.log(
        `[✅] Generated ${TEST_IMAGES.length} test images in ${ASSETS_DIR}`,
    );
}

export async function cleanup() {
    await Deno.remove(ASSETS_DIR, { recursive: true }).catch(() => {});
    console.log('[🧹] Cleaned up test assets');
}

export function getAssetPath(name: string): string {
    return join(ASSETS_DIR, name);
}

// These functions validate image formats across different tests
export function hasPngSignature(data: Uint8Array): boolean {
    const signature = [0x89, 0x50, 0x4e, 0x47];
    if (data.length < signature.length) return false;
    return signature.every((byte, i) => data[i] === byte);
}

export function hasGifSignature(data: Uint8Array): boolean {
    const signature = [0x47, 0x49, 0x46, 0x38];
    if (data.length < signature.length) return false;
    return signature.every((byte, i) => data[i] === byte);
}

export function hasJpegSignature(data: Uint8Array): boolean {
    const signature = [0xff, 0xd8];
    if (data.length < signature.length) return false;
    return signature.every((byte, i) => data[i] === byte);
}

// Set of files created by _setup.ts used across the tests
export const TestAssets = {
    // Basic shapes
    SQUARE_RED: 'square_red.png',
    SQUARE_GREEN: 'square_green.png',
    SQUARE_BLUE: 'square_blue.png',

    // Different dimensions
    WIDE: 'wide_gradient.png',
    TALL: 'tall_gradient.png',

    // Complex patterns
    CIRCLE: 'circle_pattern.png',
    CHECKERBOARD: 'checkerboard.png',
    NOISE: 'noise_small.png',

    // Edge cases
    TINY: 'tiny_image.png',
    LARGE: 'large_image.png',

    // Invalid files
    NOT_IMAGE: 'not_an_image.txt',
    FAKE_PNG: 'fake_image.png',
    EMPTY: 'empty_file.png',
    NONEXISTENT: 'does_not_exist.png',
} as const;
