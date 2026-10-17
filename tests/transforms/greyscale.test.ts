import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { greyscale } from "../../src";
import { createFiles, pixel, size, solid } from "../fixtures";

let files: Awaited<ReturnType<typeof createFiles>>;

beforeAll(async () => {
  files = await createFiles({
    "red.png": await solid(100, 60, [255, 0, 0, 255]),
  });
});
afterAll(() => files.dispose());

describe("greyscale", () => {
  it("turns the luma of a path input into equal channels", async () => {
    const result = await greyscale({ input: files.path("red.png") });

    expect(await size(result)).toEqual([100, 60]);
    // ITU-R 601 luma of pure red: 0.299 * 255
    const [r, g, b, a] = await pixel(result, 50, 30);
    expect([r, a]).toEqual([76, 255]);
    expect(g).toBe(r);
    expect(b).toBe(r);
  });

  it("accepts encoded bytes", async () => {
    const result = await greyscale({
      input: await solid(8, 8, [0, 0, 255, 255]),
    });

    expect(await pixel(result, 4, 4)).toEqual([29, 29, 29, 255]);
  });

  it("keeps the alpha channel", async () => {
    const result = await greyscale({
      input: await solid(8, 8, [200, 50, 50, 128]),
    });

    expect((await pixel(result, 4, 4))[3]).toBe(128);
  });
});
