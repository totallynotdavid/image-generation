import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { loadImage, ProcessingError, resizeImage } from "../src";
import { createFiles, solid } from "./fixtures";

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

  it.each(["notes.txt", "empty.png", "missing.png"])("rejects %s", async (name) => {
    await expect(loadImage(files.path(name))).rejects.toThrow(ProcessingError);
    await expect(loadImage(files.path(name))).rejects.toThrow("Failed to load image");
  });
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

  it("takes the resize mode", async () => {
    const resized = resizeImage(await loadImage(rectangle), {
      width: 30,
      height: 30,
      mode: "RESIZE_NEAREST_NEIGHBOR",
    });

    expect([resized.width, resized.height]).toEqual([30, 30]);
  });
});
