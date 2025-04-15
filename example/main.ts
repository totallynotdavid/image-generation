import { processImage } from "../src/index.ts";

async function applyBlur(imageUrl: string) {
  const blurredImage = await processImage(imageUrl, "blur", 5);
  return blurredImage;
}

const blurredImage = await applyBlur("example/input.png");
await Deno.writeFile("example/output.png", blurredImage);
