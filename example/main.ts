import { blink, circle, color, greyscale, transform } from '../src/index.ts';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function saveOutput(data: Uint8Array, filename: string) {
    const outputPath = join(__dirname, 'output', filename);
    await writeFile(outputPath, data);
    console.log(`Saved to ${outputPath}`);
}

async function run() {
    try {
        const input1 = join(__dirname, 'input-1.jpg');
        const input2 = join(__dirname, 'input-2.jpg');

        const colored = await color({
            input: input1,
            options: {
                hex: '#ff0000',
                blendMode: 'overlay',
            },
        });
        await saveOutput(colored, 'red-overlay.png');
        console.log('Color transform complete', colored.length);

        const blinked = await blink({
            inputs: [input1, input2],
            options: {
                delay: 200,
                loop: true,
            },
        });
        await saveOutput(blinked, 'blink-animation.gif');
        console.log('Blink transform complete', blinked.length);

        const grey = await greyscale({ input: input1 });
        await saveOutput(grey, 'greyscale.png');
        console.log('Greyscale transform complete', grey.length);

        const circled = await circle({
            input: input1,
            options: {
                borderColor: '#ff0000',
                borderWidth: 8,
            },
        });
        await saveOutput(circled, 'circle-border.png');
        console.log('Circle transform complete', circled.length);

        const dynamic = await transform('color', {
            input: input1,
            options: { hex: '#fff' },
        });
        await saveOutput(dynamic, 'white-overlay.png');
        console.log('Dynamic transform complete', dynamic.length);
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
