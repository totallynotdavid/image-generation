import { Animation } from "imagescript";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";
import { blink, ProcessingError } from "../../src";
import { createFiles, solid } from "../fixtures";

let files: Awaited<ReturnType<typeof createFiles>>;
let red: Uint8Array;
let blue: Uint8Array;
let green: Uint8Array;

beforeAll(async () => {
  red = await solid(100, 100, [255, 0, 0, 255]);
  blue = await solid(100, 100, [0, 0, 255, 255]);
  green = await solid(150, 80, [0, 255, 0, 255]);
  files = await createFiles({ "red.png": red, "blue.png": blue });
});
afterAll(() => files.dispose());

describe("blink", () => {
  it("builds a looping GIF with one frame per input", async () => {
    const gif = await Animation.decode(
      await blink({ inputs: [files.path("red.png"), files.path("blue.png")] }),
    );

    expect(gif.frames).toHaveLength(2);
    expect(gif.frames.map((frame) => frame.duration)).toEqual([200, 200]);
    expect(gif.loopCount).toBe(-1);
    expect([gif.width, gif.height]).toEqual([100, 100]);
    expect(Array.from(gif.frames[0]!.getRGBAAt(50, 50))).toEqual([255, 0, 0, 255]);
    expect(Array.from(gif.frames[1]!.getRGBAAt(50, 50))).toEqual([0, 0, 255, 255]);
  });

  it("plays once when loop is false", async () => {
    const gif = await Animation.decode(await blink({ inputs: [red, blue], loop: false }));

    expect(gif.loopCount).toBe(0);
  });

  it("uses the delay for every frame", async () => {
    const gif = await Animation.decode(await blink({ inputs: [red, blue, red], delay: 300 }));

    expect(gif.frames.map((frame) => frame.duration)).toEqual([300, 300, 300]);
  });

  it("raises a delay below 50 ms to 50 ms", async () => {
    const gif = await Animation.decode(await blink({ inputs: [red, blue], delay: 10 }));

    expect(gif.frames[0]!.duration).toBe(50);
  });

  it("fills every frame to the size of the first image", async () => {
    const gif = await Animation.decode(await blink({ inputs: [red, green] }));

    expect([gif.width, gif.height]).toEqual([100, 100]);
    const second = gif.frames[1]!;
    expect([second.width, second.height]).toEqual([100, 100]);
    expect(Array.from(second.getRGBAAt(0, 0))).toEqual([0, 255, 0, 255]);
    expect(Array.from(second.getRGBAAt(99, 99))).toEqual([0, 255, 0, 255]);
  });

  it("requires at least two images", async () => {
    await expect(blink({ inputs: [] })).rejects.toThrow(ProcessingError);
    await expect(blink({ inputs: [red] })).rejects.toThrow("At least 2 images required");
  });

  it("reports an input that cannot be loaded", async () => {
    await expect(blink({ inputs: [red, files.path("missing.png")] })).rejects.toThrow(
      "Failed to load image",
    );
  });
});
