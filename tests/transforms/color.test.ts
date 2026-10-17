import { describe, expect, it } from "vite-plus/test";
import { color } from "../../src";
import { pixel, solid } from "../fixtures";

const grey = (value: number, alpha = 255): Promise<Uint8Array> =>
  solid(10, 10, [value, value, value, alpha]);

describe("color wash", () => {
  it("mixes the color into every channel by opacity", async () => {
    const result = await color({
      input: await grey(200),
      hex: "#ffff00",
      blendMode: "wash",
      opacity: 0.3,
    });

    // channel = tint * 0.3 + base * 0.7, truncated
    expect(await pixel(result, 5, 5)).toEqual([216, 216, 140, 255]);
  });

  it("returns the color at opacity 1 and the image at opacity 0", async () => {
    const input = await grey(90);
    const full = await color({ input, hex: "#102030", blendMode: "wash", opacity: 1 });
    const none = await color({ input, hex: "#102030", blendMode: "wash", opacity: 0 });

    expect(await pixel(full, 0, 0)).toEqual([16, 32, 48, 255]);
    expect(await pixel(none, 0, 0)).toEqual([90, 90, 90, 255]);
  });
});

describe("color tint", () => {
  it("keeps the lightness of the pixel and takes the hue of the color", async () => {
    // grey 51 has lightness 0.2, hsl(240, 100%, 20%) is rgb(0, 0, 102)
    const result = await color({
      input: await grey(51),
      hex: "#0000ff",
      blendMode: "tint",
      opacity: 1,
    });

    expect(await pixel(result, 5, 5)).toEqual([0, 0, 102, 255]);
  });

  it("blends the tinted pixel with the original by opacity", async () => {
    const result = await color({
      input: await grey(51),
      hex: "#0000ff",
      opacity: 0.5,
    });

    expect(await pixel(result, 5, 5)).toEqual([25, 25, 76, 255]);
  });

  it("is the default blend mode", async () => {
    const input = await grey(51);
    const implicit = await color({ input, hex: "#0000ff" });
    const explicit = await color({ input, hex: "#0000ff", blendMode: "tint" });

    expect(implicit).toEqual(explicit);
  });

  it("defaults to a white tint at opacity 0.3", async () => {
    const result = await color({ input: await solid(4, 4, [0, 0, 255, 255]) });

    // hsl(0, 0%, 50%) is grey 128 for a pure blue pixel (lightness 0.5)
    expect(await pixel(result, 2, 2)).toEqual([38, 38, 216, 255]);
  });
});

describe("color softlight", () => {
  it("darkens with a dark overlay", async () => {
    const result = await color({
      input: await grey(128),
      hex: "#000000",
      blendMode: "softlight",
      opacity: 1,
    });

    // base - (1 - 2 * overlay) * base * (1 - base), with base = 128 / 255
    expect((await pixel(result, 5, 5)).slice(0, 3)).toEqual([64, 64, 64]);
  });

  it("lightens with a light overlay", async () => {
    const result = await color({
      input: await grey(128),
      hex: "#ffffff",
      blendMode: "softlight",
      opacity: 1,
    });

    // sqrt(128 / 255) * 255
    expect((await pixel(result, 5, 5)).slice(0, 3)).toEqual([180, 180, 180]);
  });

  it("scales between the image and a mid overlay with the overlay value", async () => {
    const result = await color({
      input: await grey(128),
      hex: "#808080",
      blendMode: "softlight",
      opacity: 1,
    });

    const [value] = await pixel(result, 5, 5);
    // an overlay of 0.502 changes the base by at most a unit
    expect(value).toBeGreaterThanOrEqual(127);
    expect(value).toBeLessThanOrEqual(129);
  });
});

describe("color options", () => {
  it("intensity 0 leaves the image unchanged", async () => {
    const result = await color({
      input: await grey(100),
      hex: "#ff0000",
      opacity: 1,
      intensity: 0,
    });

    expect(await pixel(result, 0, 0)).toEqual([100, 100, 100, 255]);
  });

  it("intensity scales the effect", async () => {
    const result = await color({
      input: await grey(100),
      hex: "#ff0000",
      blendMode: "wash",
      opacity: 1,
      intensity: 0.5,
    });

    // 255 at full intensity, halfway back to 100
    expect(await pixel(result, 0, 0)).toEqual([177, 50, 50, 255]);
  });

  it("clamps opacity and intensity to 0..1", async () => {
    const input = await grey(100);
    const wild = await color({
      input,
      hex: "#ff0000",
      blendMode: "wash",
      opacity: 7,
      intensity: 3,
    });
    const full = await color({
      input,
      hex: "#ff0000",
      blendMode: "wash",
      opacity: 1,
      intensity: 1,
    });

    expect(wild).toEqual(full);
  });

  it("keeps the alpha channel", async () => {
    const result = await color({ input: await grey(100, 90), hex: "#ff0000", opacity: 1 });

    expect((await pixel(result, 0, 0))[3]).toBe(90);
  });

  it.each(["#f00", "ff0000", "#ff0000ff"])("accepts the hex form %s", async (hex) => {
    const result = await color({ input: await grey(0), hex, blendMode: "wash", opacity: 1 });

    expect(await pixel(result, 0, 0)).toEqual([255, 0, 0, 255]);
  });
});

describe("color errors", () => {
  it("rejects an invalid hex color", async () => {
    await expect(color({ input: await grey(0), hex: "invalid" })).rejects.toMatchObject({
      name: "ProcessingError",
      message: expect.stringContaining("Invalid hex color"),
    });
  });

  it("rejects an unknown blend mode", async () => {
    const input = await grey(0);
    await expect(color({ input, blendMode: "multiply" as unknown as "tint" })).rejects.toThrow(
      "Invalid blend mode",
    );
  });
});
