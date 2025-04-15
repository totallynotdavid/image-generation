import { processImage } from "../src/index.ts";

async function testAllModules() {
  const inputImage = "example/input-1.jpg";
  const inputImage2 = "example/input-2.jpg";
  const inputImage3 = "example/input-3.jpg";
  const inputImage4 = "example/input-4.jpg";
  const inputImage5 = "example/input-5.jpg";
  const inputImage6 = "example/input-6.jpg";
  const inputImage7 = "example/input-7.jpg";
  const inputImage8 = "example/input-8.jpg";
  
  // Test filter modules
  console.log("Testing filter modules...");
  
  // Blur filter
  const blurredImage = await processImage(inputImage, "blur", 5);
  await Deno.writeFile("example/output/blur.png", blurredImage);
  
  // Greyscale filter
  const greyscaleImage = await processImage(inputImage, "greyscale");
  await Deno.writeFile("example/output/greyscale.png", greyscaleImage);
  
  // Invert filter
  const invertedImage = await processImage(inputImage, "invert");
  await Deno.writeFile("example/output/invert.png", invertedImage);
  
  // Sepia filter
  const sepiaImage = await processImage(inputImage, "sepia");
  await Deno.writeFile("example/output/sepia.png", sepiaImage);
  
  // Gay filter
  const gayImage = await processImage(inputImage, "gay");
  await Deno.writeFile("example/output/gay.png", gayImage);
  
  // Test GIF modules
  console.log("Testing GIF modules...");
  
  // Blink GIF
  const blinkGif = await processImage([inputImage, inputImage2, inputImage3, inputImage4, inputImage5, inputImage6, inputImage7, inputImage8], "blink");
  await Deno.writeFile("example/output/blink.gif", blinkGif);
  
  // Triggered GIF
  const triggeredGif = await processImage(inputImage, "triggered");
  await Deno.writeFile("example/output/triggered.gif", triggeredGif);
  
  // Test montage module
  console.log("Testing montage module...");
  
  // Ad montage
  const adMontage = await processImage(inputImage, "ad");
  await Deno.writeFile("example/output/ad.png", adMontage);
  
  // Test utility modules
  console.log("Testing utility modules...");
  
  // Circle utility
  const circleImage = await processImage(inputImage, "circle");
  await Deno.writeFile("example/output/circle.png", circleImage);
  
  // Color utility
  const colorImage = await processImage(inputImage, "color", "#FF0000");
  await Deno.writeFile("example/output/color.png", colorImage);
  
  console.log("All modules tested successfully!");
}

// Create output directory if it doesn't exist
try {
  await Deno.mkdir("example/output", { recursive: true });
} catch (error) {
  if (!(error instanceof Deno.errors.AlreadyExists)) {
    throw error;
  }
}

// Run the tests
await testAllModules();
