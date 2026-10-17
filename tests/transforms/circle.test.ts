import { describe, expect, it } from "vite-plus/test";
import { circle } from "../../src";
import { pixel, size, solid, stripes } from "../fixtures";

describe("circle", () => {
  it("makes the corners transparent and keeps the center", async () => {
    const result = await circle({
      input: await solid(100, 100, [255, 0, 0, 255]),
    });

    expect(await size(result)).toEqual([100, 100]);
    expect(await pixel(result, 50, 50)).toEqual([255, 0, 0, 255]);
    expect((await pixel(result, 0, 0))[3]).toBe(0);
    expect((await pixel(result, 99, 99))[3]).toBe(0);
  });

  it("adds the border around the image", async () => {
    const result = await circle({
      input: await solid(100, 100, [0, 0, 255, 255]),
      borderWidth: 10,
      borderColor: "#ffffff",
    });

    expect(await size(result)).toEqual([120, 120]);
    expect(await pixel(result, 60, 60)).toEqual([0, 0, 255, 255]);
    // 55 px from the center: inside the 50..60 ring
    expect(await pixel(result, 60, 5)).toEqual([255, 255, 255, 255]);
    expect((await pixel(result, 0, 0))[3]).toBe(0);
  });

  it("draws a black border when no color is given", async () => {
    const result = await circle({
      input: await solid(100, 100, [0, 0, 255, 255]),
      borderWidth: 10,
    });

    expect(await pixel(result, 60, 5)).toEqual([0, 0, 0, 255]);
  });

  it("crops a rectangle to a centered square", async () => {
    const result = await circle({
      input: await stripes(150, 80),
      borderWidth: 5,
    });

    expect(await size(result)).toEqual([90, 90]);
    // columns 35..114 of the input: red up to 49, green up to 99, blue after
    expect(await pixel(result, 45, 45)).toEqual([0, 255, 0, 255]);
    expect(await pixel(result, 10, 45)).toEqual([255, 0, 0, 255]);
    expect(await pixel(result, 80, 45)).toEqual([0, 0, 255, 255]);
  });

  it("rounds a fractional border width", async () => {
    const result = await circle({
      input: await solid(20, 20, [1, 2, 3, 255]),
      borderWidth: 2.4,
    });

    expect(await size(result)).toEqual([24, 24]);
  });

  it("rejects an invalid border color", async () => {
    const input = await solid(100, 100, [0, 0, 0, 255]);

    await expect(
      circle({ input, borderColor: "invalid", borderWidth: 5 }),
    ).rejects.toMatchObject({
      name: "ProcessingError",
      message: expect.stringContaining("Invalid border color"),
    });
  });

  it("rejects a border that leaves no image", async () => {
    await expect(
      circle({ input: await solid(20, 20, [0, 0, 0, 255]), borderWidth: 10 }),
    ).rejects.toThrow("Border width too large");
  });
});
