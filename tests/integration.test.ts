import { Animation } from "imagescript";
import { describe, expect, it } from "vite-plus/test";
import { blink, circle, color, greyscale, ProcessingError } from "../src";
import { pixel, size, solid } from "./fixtures";

describe("unreadable input", () => {
  const transforms = {
    greyscale: (input: string | Uint8Array) => greyscale({ input }),
    color: (input: string | Uint8Array) => color({ input }),
    circle: (input: string | Uint8Array) => circle({ input }),
    blink: async (input: string | Uint8Array) =>
      blink({ inputs: [await solid(4, 4, [0, 0, 0, 255]), input] }),
  };

  const unreadable = {
    "a missing path": "/nonexistent/image.png",
    "bytes that are not an image": new Uint8Array([1, 2, 3]),
  };
  const cases = Object.entries(transforms).flatMap(([name, run]) =>
    Object.entries(unreadable).map(
      ([label, input]) => [name, label, run, input] as const,
    ),
  );

  it.each(cases)("%s rejects %s", async (_name, _label, run, input) => {
    await expect(run(input)).rejects.toMatchObject({
      name: "ProcessingError",
      message: expect.stringContaining("Failed to load image"),
    });
  });
});

describe("error cause", () => {
  it("holds the original error", async () => {
    const error = await greyscale({ input: "/nonexistent/image.png" }).catch(
      (caught: unknown) => caught,
    );

    expect.assert(error instanceof ProcessingError);
    expect(error.cause).toMatchObject({ code: "ENOENT" });
  });

  it("is not set when the failure has none", async () => {
    const error = await color({
      input: await solid(4, 4, [0, 0, 0, 255]),
      hex: "invalid",
    }).catch((caught: unknown) => caught);

    expect.assert(error instanceof ProcessingError);
    expect(Object.hasOwn(error, "cause")).toBe(false);
  });
});

describe("chained transforms", () => {
  it("feeds the output of color into greyscale", async () => {
    const tinted = await color({
      input: await solid(100, 100, [255, 0, 0, 255]),
      hex: "#00ff00",
      blendMode: "wash",
      opacity: 0.5,
    });
    expect(await pixel(tinted, 50, 50)).toEqual([127, 127, 0, 255]);

    const grey = await greyscale({ input: tinted });
    // 0.299 * 127 + 0.587 * 127
    expect(await pixel(grey, 50, 50)).toEqual([113, 113, 113, 255]);
  });

  it("feeds the output of circle into color", async () => {
    const rounded = await circle({
      input: await solid(100, 100, [200, 200, 200, 255]),
      borderWidth: 5,
      borderColor: "#ff0000",
    });

    const washed = await color({
      input: rounded,
      hex: "#0000ff",
      blendMode: "wash",
      opacity: 0.3,
    });

    expect(await size(washed)).toEqual([110, 110]);
    expect(await pixel(washed, 55, 55)).toEqual([140, 140, 216, 255]);
    expect((await pixel(washed, 0, 0))[3]).toBe(0);
  });

  it("feeds the output of blink into greyscale", async () => {
    const gif = await blink({
      inputs: [
        await solid(10, 10, [255, 0, 0, 255]),
        await solid(10, 10, [0, 0, 255, 255]),
      ],
    });

    const grey = await greyscale({ input: gif });

    expect(await size(grey)).toEqual([10, 10]);
    expect(await pixel(grey, 5, 5)).toEqual([76, 76, 76, 255]);
  });

  it("builds an animation from processed frames", async () => {
    const frames = await Promise.all([
      circle({
        input: await solid(100, 100, [255, 0, 0, 255]),
        borderWidth: 3,
      }),
      greyscale({ input: await solid(100, 100, [0, 0, 255, 255]) }),
      color({
        input: await solid(100, 100, [50, 50, 50, 255]),
        hex: "#ff8800",
        opacity: 0.4,
      }),
    ]);

    const gif = await Animation.decode(
      await blink({ inputs: frames, delay: 200 }),
    );

    expect(gif.frames).toHaveLength(3);
  });
});
