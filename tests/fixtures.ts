import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Image } from "imagescript";

export type Rgba = [r: number, g: number, b: number, a: number];

export function solid(width: number, height: number, [r, g, b, a]: Rgba): Promise<Uint8Array> {
  return new Image(width, height).fill(Image.rgbaToColor(r, g, b, a)).encode();
}

/** Left third red, middle third green, right third blue. */
export function stripes(width: number, height: number): Promise<Uint8Array> {
  const image = new Image(width, height).fill((x) => {
    if (x < width / 3) return Image.rgbaToColor(255, 0, 0, 255);
    if (x < (width * 2) / 3) return Image.rgbaToColor(0, 255, 0, 255);
    return Image.rgbaToColor(0, 0, 255, 255);
  });
  return image.encode();
}

export async function pixel(bytes: Uint8Array, x: number, y: number): Promise<Rgba> {
  const image = await Image.decode(bytes);
  return Array.from(image.getRGBAAt(x, y)) as Rgba;
}

export async function size(bytes: Uint8Array): Promise<[width: number, height: number]> {
  const image = await Image.decode(bytes);
  return [image.width, image.height];
}

/** Files on disk for the tests that pass a path. Remove them with `dispose`. */
export async function createFiles(files: Record<string, Uint8Array | string>): Promise<{
  path: (name: string) => string;
  dispose: () => Promise<void>;
}> {
  const dir = await mkdtemp(join(tmpdir(), "image-generation-"));
  await Promise.all(Object.entries(files).map(([name, data]) => writeFile(join(dir, name), data)));
  return {
    path: (name) => join(dir, name),
    dispose: () => rm(dir, { recursive: true, force: true }),
  };
}
