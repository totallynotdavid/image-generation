import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { loadImage, ProcessingError, resizeImage } from "../src";
import { animated, createFiles, solid } from "./fixtures";

let files: Awaited<ReturnType<typeof createFiles>>;
let rectangle: Uint8Array;

beforeAll(async () => {
  rectangle = await solid(150, 80, [0, 255, 0, 255]);
  files = await createFiles({
    "rectangle.png": rectangle,
    "notes.txt": "not an image",
    "empty.png": "",
  });
});
afterAll(() => files.dispose());

describe("loadImage", () => {
  it("loads from a file path", async () => {
    const image = await loadImage(files.path("rectangle.png"));

    expect([image.width, image.height]).toEqual([150, 80]);
  });

  it("loads from bytes", async () => {
    const image = await loadImage(rectangle);

    expect([image.width, image.height]).toEqual([150, 80]);
  });

  it.each(["gif", "webp"] as const)(
    "loads the first frame of an animated %s",
    async (format) => {
      const bytes = await animated(format, [
        [255, 0, 0, 255],
        [0, 0, 255, 255],
      ]);
      const image = await loadImage(bytes);

      expect([image.width, image.height]).toEqual([20, 20]);
      expect(Array.from(image.getRGBAAt(10, 10))).toEqual([255, 0, 0, 255]);
    },
  );

  it.each(["notes.txt", "empty.png", "missing.png"])(
    "rejects %s",
    async (name) => {
      await expect(loadImage(files.path(name))).rejects.toMatchObject({
        name: "ProcessingError",
        message: expect.stringContaining("Failed to load image"),
      });
    },
  );
});

describe("resizeImage", () => {
  it("keeps the aspect ratio when only the width is given", async () => {
    const resized = resizeImage(await loadImage(rectangle), { width: 75 });

    expect([resized.width, resized.height]).toEqual([75, 40]);
  });

  it("keeps the aspect ratio when only the height is given", async () => {
    const resized = resizeImage(await loadImage(rectangle), { height: 40 });

    expect([resized.width, resized.height]).toEqual([75, 40]);
  });

  it("returns the image as is without dimensions", async () => {
    const image = await loadImage(rectangle);

    expect(resizeImage(image, {})).toBe(image);
  });

  it.each([
    ["a negative width", { width: -5 }],
    ["a zero width next to a height", { width: 0, height: 10 }],
    ["a height that rounds to zero", { height: 0.2 }],
    ["an unknown mode", { width: 10, mode: "RESIZE_UNKNOWN" }],
  ] as const)("throws a ProcessingError for %s", async (_label, options) => {
    const image = await loadImage(rectangle);

    // @ts-expect-error The unknown mode is not a ResizeMode.
    expect(() => resizeImage(image, options)).toThrow(ProcessingError);
  });

  it("takes the resize mode", async () => {
    const resized = resizeImage(await loadImage(rectangle), {
      width: 30,
      height: 30,
      mode: "nearest-neighbor",
    });

    expect([resized.width, resized.height]).toEqual([30, 30]);
  });
});
