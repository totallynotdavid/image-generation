import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { blink, circle, color, greyscale } from "../src";

const dir = import.meta.dirname;
const input1 = join(dir, "input-1.jpg");
const input2 = join(dir, "input-2.jpg");

async function save(data: Uint8Array, filename: string): Promise<void> {
  const path = join(dir, "output", filename);
  await writeFile(path, data);
  console.log(`${filename}: ${data.length} bytes`);
}

await save(await color({ input: input1, hex: "#ff0000", blendMode: "tint" }), "red-tint.png");
await save(
  await blink({ inputs: [input1, input2], delay: 200, loop: true }),
  "blink-animation.gif",
);
await save(await greyscale({ input: input1 }), "greyscale.png");
await save(
  await circle({ input: input1, borderColor: "#ff0000", borderWidth: 8 }),
  "circle-border.png",
);
