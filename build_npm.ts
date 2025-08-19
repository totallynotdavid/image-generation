import { build, emptyDir } from '@deno/dnt';

await emptyDir('./build');

await build({
    entryPoints: ['./src/index.ts'],
    importMap: './deno.json',
    test: false,
    outDir: './build',
    shims: {
        deno: true,
    },
    scriptModule: false,
    package: {
        name: '@totallynotdavid/image-generation',
        version: Deno.args[0]?.replace(/^v/, '') ?? '1.0.0',
        description:
            'A TypeScript library for image transformations using sharp and built with Deno',
        license: 'MIT',
        repository: {
            type: 'git',
            url: 'git+https://github.com/totallynotdavid/image-generation.git',
        },
        bugs: {
            url: 'https://github.com/totallynotdavid/image-generation/issues',
        },
    },
    postBuild() {
        Deno.copyFileSync('license', 'build/LICENSE');
        Deno.copyFileSync('readme.md', 'build/README.md');
    },
});
