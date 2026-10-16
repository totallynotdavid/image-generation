import { Animation } from "imagescript";
import { describe, expect, it } from "vite-plus/test";
import { blink, circle, color, greyscale } from "../src";
import { pixel, size, solid } from "./fixtures";

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

  it("builds an animation from processed frames", async () => {
    const frames = await Promise.all([
      circle({ input: await solid(100, 100, [255, 0, 0, 255]), borderWidth: 3 }),
      greyscale({ input: await solid(100, 100, [0, 0, 255, 255]) }),
      color({ input: await solid(100, 100, [50, 50, 50, 255]), hex: "#ff8800", opacity: 0.4 }),
    ]);

    const gif = await Animation.decode(await blink({ inputs: frames, delay: 200 }));

    expect(gif.frames).toHaveLength(3);
  });
});
