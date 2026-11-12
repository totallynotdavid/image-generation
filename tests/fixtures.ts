import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Animation, Colors, Frame, Image } from "imagescript";

export type Rgba = [r: number, g: number, b: number, a: number];

export function solid(
  width: number,
  height: number,
  [r, g, b, a]: Rgba,
): Promise<Uint8Array> {
  return new Image(width, height).fill(Colors.fromRGBA(r, g, b, a)).encode();
}

/** An animation with one square frame per color. */
export async function animated(
  format: "gif" | "webp",
  colors: Rgba[],
  side = 20,
): Promise<Uint8Array> {
  const frames = await Promise.all(
    colors.map(async (rgba) =>
      Frame.from(await Image.decode(await solid(side, side, rgba)), 100),
    ),
  );
  const animation = new Animation(frames);
  return format === "gif" ? animation.encodeGIF() : animation.encodeWebP();
}

/** Left third red, middle third green, right third blue. */
export function stripes(width: number, height: number): Promise<Uint8Array> {
  const image = new Image(width, height).fill((x) => {
    if (x < width / 3) return Colors.fromRGBA(255, 0, 0, 255);
    if (x < (width * 2) / 3) return Colors.fromRGBA(0, 255, 0, 255);
    return Colors.fromRGBA(0, 0, 255, 255);
  });
  return image.encode();
}

export async function pixel(
  bytes: Uint8Array,
  x: number,
  y: number,
): Promise<Rgba> {
  const image = await Image.decode(bytes);
  const [r = 0, g = 0, b = 0, a = 0] = image.getRGBAAt(x, y);
  return [r, g, b, a];
}

export async function size(
  bytes: Uint8Array,
): Promise<[width: number, height: number]> {
  const image = await Image.decode(bytes);
  return [image.width, image.height];
}

/** Files on disk for the tests that pass a path. Remove them with `dispose`. */
export async function createFiles(
  files: Record<string, Uint8Array | string>,
): Promise<{
  path: (name: string) => string;
  dispose: () => Promise<void>;
}> {
  const dir = await mkdtemp(join(tmpdir(), "image-generation-"));
  await Promise.all(
    Object.entries(files).map(([name, data]) =>
      writeFile(join(dir, name), data),
    ),
  );
  return {
    path: (name) => join(dir, name),
    dispose: () => rm(dir, { recursive: true, force: true }),
  };
}
