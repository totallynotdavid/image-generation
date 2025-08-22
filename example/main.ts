import { blink, circle, color, greyscale } from '@/index.ts';
import { dirname, fromFileUrl, join } from '@std/path';

const __dirname = dirname(fromFileUrl(import.meta.url));

async function saveOutput(data: Uint8Array, filename: string): Promise<void> {
    const outputPath = join(__dirname, 'output', filename);
    await Deno.writeFile(outputPath, data);
    console.log(`Saved to ${outputPath}`);
}

async function run(): Promise<void> {
    try {
        // You can use relative paths or absolute paths for the input files
        const input1 = './example/input-1.jpg';
        const input2 = join(__dirname, 'input-2.jpg');

        const colored = await color({
            input: input1,
            hex: '#ff0000',
            blendMode: 'tint',
        });
        await saveOutput(colored, 'red-tint.png');
        console.log('Color transform complete', colored.length);

        const blinked = await blink({
            inputs: [input1, input2],
            delay: 200,
            loop: true,
        });
        await saveOutput(blinked, 'blink-animation.gif');
        console.log('Blink transform complete', blinked.length);

        const grey = await greyscale({ input: input1 });
        await saveOutput(grey, 'greyscale.png');
        console.log('Greyscale transform complete', grey.length);

        const circled = await circle({
            input: input1,
            borderColor: '#ff0000',
            borderWidth: 8,
        });
        await saveOutput(circled, 'circle-border.png');
        console.log('Circle transform complete', circled.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
