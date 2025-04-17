import { registerPlugin } from '@/plugins/index.ts';
import { greyscale } from '@/transforms/greyscale.ts';
import { color } from '@/transforms/color.ts';
import { circle } from '@/transforms/circle.ts';
import { blink } from '@/transforms/blink.ts';
import { validators } from '@/validation/schemas.ts';

registerPlugin({
    name: 'greyscale',
    handler: greyscale,
    validator: validators.greyscale,
});

registerPlugin({
    name: 'color',
    handler: color,
    validator: validators.color,
});

registerPlugin({
    name: 'circle',
    handler: circle,
    validator: validators.circle,
});

registerPlugin({
    name: 'blink',
    handler: blink,
    validator: validators.blink,
});
