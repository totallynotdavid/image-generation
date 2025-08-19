import { join } from '@std/path';
import { decodeBase64 } from '@std/encoding/base64';
export {
    assert,
    assertEquals,
    assertInstanceOf,
    assertRejects,
} from '@std/assert';

export const ASSETS_DIR = './test_assets';

const TEST_ASSETS = {
    'square.png':
        'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAA/ElEQVR4nO3RQREAMAjAMOZf9EBGH8nVQd+fuagwJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiFhWOx523MzV4AAAAAElFTkSuQmCC',
    'wide.png':
        'iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAABFUlEQVR4nO3TAQ0AIAzAMPAvGi7gmYJ2GnbPm4CVQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIBgEgkEgGASCQSAYBIJBIHxWqMeddJrS2gAAAABJRU5ErkJggg==',
    'tall.png':
        'iVBORw0KGgoAAAANSUhEUgAAAGQAAADICAYAAAAePETBAAABw0lEQVR4nO3RMQEAMAwEoa9/0amNG8ACb7sbGUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQGCExQmKExAiJERIjJEZIjJAYITFCYoTECIkREiMkRkiMkBghMUJihMQIiRESIyRGSIyQmA+09I9IRTRlxQAAAABJRU5ErkJggg==',
};

export async function setup() {
    await Deno.remove(ASSETS_DIR, { recursive: true }).catch(() => {});
    await Deno.mkdir(ASSETS_DIR, { recursive: true });

    await Deno.mkdir(join(ASSETS_DIR, 'a_directory'), { recursive: true });
    await Deno.writeTextFile(join(ASSETS_DIR, 'not_an_image.txt'), 'hello');
    await Deno.writeTextFile(
        join(ASSETS_DIR, 'corrupt.png'),
        'not a valid png',
    );

    for (const [name, b64] of Object.entries(TEST_ASSETS)) {
        const data = decodeBase64(b64);
        await Deno.writeFile(join(ASSETS_DIR, name), data);
    }
}

export async function cleanup() {
    await Deno.remove(ASSETS_DIR, { recursive: true }).catch(() => {});
}

export function getAssetPath(name: string): string {
    return join(ASSETS_DIR, name);
}

export function hasPngSignature(data: Uint8Array): boolean {
    const signature = [0x89, 0x50, 0x4e, 0x47];
    if (data.length < signature.length) return false;
    for (let i = 0; i < signature.length; i++) {
        if (data[i] !== signature[i]) return false;
    }
    return true;
}

export function hasGifSignature(data: Uint8Array): boolean {
    const signature = [0x47, 0x49, 0x46, 0x38];
    if (data.length < signature.length) return false;
    for (let i = 0; i < signature.length; i++) {
        if (data[i] !== signature[i]) return false;
    }
    return true;
}
