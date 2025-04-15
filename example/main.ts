import { processImage } from "../src/index.ts";

async function applyBlur(imageUrl: string) {
  const blurredImage = await processImage(imageUrl, "blur", 5);
  return blurredImage;
}

const blurredImage = await applyBlur("input.png");
await Deno.writeFile("output.png", blurredImage);
