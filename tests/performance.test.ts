import { assert, assertInstanceOf } from '@std/assert';
import { blink } from '@/transforms/blink.ts';
import { circle } from '@/transforms/circle.ts';
import { color } from '@/transforms/color.ts';
import { greyscale } from '@/transforms/greyscale.ts';
import {
    cleanupTestAssets,
    setupTestAssets,
    TestAssets,
    TestImageGenerator,
} from './_setup.ts';
import { join } from '@std/path';

const PERF_ASSETS_DIR = './test_perf_assets';

async function setupPerfAssets() {
    await Deno.remove(PERF_ASSETS_DIR, { recursive: true }).catch(() => {});
    await Deno.mkdir(PERF_ASSETS_DIR, { recursive: true });

    const largeImage = TestImageGenerator.createGradient(800, 600);
    const largeBuffer = await largeImage.encode();
    await Deno.writeFile(join(PERF_ASSETS_DIR, 'large.png'), largeBuffer);

    const mediumImage = TestImageGenerator.createPattern(300);
    const mediumBuffer = await mediumImage.encode();
    await Deno.writeFile(join(PERF_ASSETS_DIR, 'medium.png'), mediumBuffer);
}

async function cleanupPerfAssets() {
    await Deno.remove(PERF_ASSETS_DIR, { recursive: true }).catch(() => {});
}

const PerfAssets = {
    LARGE: join(PERF_ASSETS_DIR, 'large.png'),
    MEDIUM: join(PERF_ASSETS_DIR, 'medium.png'),
} as const;

const THRESHOLDS = {
    largeTransformsMs: 500,
    blink5Ms: 75,
    smallOpMs: 6,
    concurrent20Ms: 150,
    memoryMeanBytes: 12 * 1024 * 1024,
    memoryMaxBytes: 40 * 1024 * 1024,
    blendPerModeMs: 120,
    blendMaxMinRatio: 3.9,
    progressiveScaleRatio: 8,
};

Deno.test({
    name: 'performance tests',
    async fn(t) {
        await setupTestAssets();
        await setupPerfAssets();

        try {
            await greyscale({ input: TestAssets.TINY });
            await color({ input: TestAssets.TINY, hex: '#ff0000' });
            await circle({ input: TestAssets.TINY, borderWidth: 1 });
            await blink({
                inputs: [TestAssets.TINY, TestAssets.TINY],
                delay: 50,
            });
        } catch {
            // ignore warmup errors
        }

        await t.step(
            'transforms complete within a short amount of time on large images',
            async () => {
                const start = performance.now();

                const a = await greyscale({ input: PerfAssets.LARGE });
                const b = await color({
                    input: PerfAssets.LARGE,
                    hex: '#ff4080',
                    opacity: 0.3,
                });
                const c = await circle({
                    input: PerfAssets.LARGE,
                    borderWidth: 10,
                    borderColor: '#000000',
                });

                const durationMs = performance.now() - start;

                assertInstanceOf(a, Uint8Array);
                assert(a.length > 0);
                assertInstanceOf(b, Uint8Array);
                assert(b.length > 0);
                assertInstanceOf(c, Uint8Array);
                assert(c.length > 0);

                assert(
                    durationMs < THRESHOLDS.largeTransformsMs,
                    `Large-image transforms too slow: ${durationMs}ms (threshold ${THRESHOLDS.largeTransformsMs}ms)`,
                );
            },
        );

        await t.step('blink handles multiple images', async () => {
            const start = performance.now();

            const inputs = [
                TestAssets.RED_SQUARE,
                TestAssets.BLUE_SQUARE,
                TestAssets.GRADIENT,
                TestAssets.PATTERN,
                PerfAssets.MEDIUM,
            ];

            const result = await blink({ inputs, delay: 100 });

            const durationMs = performance.now() - start;

            assertInstanceOf(result, Uint8Array);
            assert(result.length > 0);

            assert(
                durationMs < THRESHOLDS.blink5Ms,
                `Blink with 5 images too slow: ${durationMs}ms (threshold ${THRESHOLDS.blink5Ms}ms)`,
            );
        });

        await t.step(
            'small images process very quickly',
            async () => {
                {
                    const start = performance.now();
                    const res = await greyscale({ input: TestAssets.TINY });
                    const elapsed = performance.now() - start;
                    assertInstanceOf(res, Uint8Array);
                    assert(res.length > 0);
                    assert(
                        elapsed < THRESHOLDS.smallOpMs,
                        `greyscale on tiny image too slow: ${elapsed}ms (threshold ${THRESHOLDS.smallOpMs}ms)`,
                    );
                }
                {
                    const start = performance.now();
                    const res = await color({
                        input: TestAssets.TINY,
                        hex: '#ff0000',
                    });
                    const elapsed = performance.now() - start;
                    assertInstanceOf(res, Uint8Array);
                    assert(res.length > 0);
                    assert(
                        elapsed < THRESHOLDS.smallOpMs,
                        `color on tiny image too slow: ${elapsed}ms (threshold ${THRESHOLDS.smallOpMs}ms)`,
                    );
                }
                {
                    const start = performance.now();
                    const res = await circle({
                        input: TestAssets.TINY,
                        borderWidth: 2,
                    });
                    const elapsed = performance.now() - start;
                    assertInstanceOf(res, Uint8Array);
                    assert(res.length > 0);
                    assert(
                        elapsed < THRESHOLDS.smallOpMs,
                        `circle on tiny image too slow: ${elapsed}ms (threshold ${THRESHOLDS.smallOpMs}ms)`,
                    );
                }
            },
        );

        await t.step(
            'concurrent operations handle well',
            async () => {
                const start = performance.now();

                const ops = Array.from(
                    { length: 20 },
                    () => greyscale({ input: TestAssets.PATTERN }),
                );

                const results = await Promise.all(ops);

                const durationMs = performance.now() - start;

                assert(results.length === 20);
                results.forEach((r) => {
                    assertInstanceOf(r, Uint8Array);
                    assert(r.length > 0);
                });

                assert(
                    durationMs < THRESHOLDS.concurrent20Ms,
                    `20 concurrent greyscale operations too slow: ${durationMs}ms (threshold ${THRESHOLDS.concurrent20Ms}ms)`,
                );
            },
        );

        await t.step(
            'memory usage remains tight under load',
            async () => {
                const runs = 3;
                const growths: number[] = [];

                for (let i = 0; i < runs; i++) {
                    const before = Deno.memoryUsage();
                    const ops: Promise<Uint8Array>[] = [];
                    for (let j = 0; j < 50; j++) {
                        const hex = '#' +
                            Math.floor(Math.random() * 0xffffff)
                                .toString(16)
                                .padStart(6, '0');
                        ops.push(
                            color({
                                input: TestAssets.GRADIENT,
                                hex,
                                opacity: 0.5,
                            }) as Promise<Uint8Array>,
                        );
                    }
                    const results = await Promise.all(ops);
                    results.forEach((r) => {
                        assertInstanceOf(r, Uint8Array);
                        assert(r.length > 0);
                    });
                    const after = Deno.memoryUsage();
                    if (before && after) {
                        growths.push(after.heapUsed - before.heapUsed);
                    }
                }

                const mean = growths.reduce((a, b) => a + b, 0) /
                    (growths.length || 1);
                const max = growths.length ? Math.max(...growths) : 0;

                assert(
                    mean < THRESHOLDS.memoryMeanBytes,
                    `Mean heapUsed growth too large: ${
                        (mean / 1024 / 1024).toFixed(2)
                    }MB (threshold ${
                        (THRESHOLDS.memoryMeanBytes / 1024 / 1024).toFixed(2)
                    }MB)`,
                );

                assert(
                    max < THRESHOLDS.memoryMaxBytes,
                    `Max heapUsed growth too large: ${
                        (max / 1024 / 1024).toFixed(2)
                    }MB (threshold ${
                        (THRESHOLDS.memoryMaxBytes / 1024 / 1024).toFixed(2)
                    }MB)`,
                );
            },
        );

        await t.step(
            'different blend modes have similar performance',
            async () => {
                const modes = ['tint', 'wash', 'softlight'] as const;
                const times: number[] = [];

                for (const mode of modes) {
                    const start = performance.now();
                    await color({
                        input: PerfAssets.MEDIUM,
                        hex: '#ff8800',
                        blendMode: mode,
                        opacity: 0.5,
                    });
                    times.push(performance.now() - start);
                }

                times.forEach((tms, idx) => {
                    assert(
                        tms < THRESHOLDS.blendPerModeMs,
                        `Blend mode ${
                            modes[idx]
                        } too slow: ${tms}ms (threshold ${THRESHOLDS.blendPerModeMs}ms)`,
                    );
                });

                const minTime = Math.min(...times);
                const maxTime = Math.max(...times);
                const ratio = maxTime / (minTime || 1);

                assert(
                    ratio < THRESHOLDS.blendMaxMinRatio,
                    `Blend modes performance varies too much: ${ratio}x (threshold ${THRESHOLDS.blendMaxMinRatio}x)`,
                );
            },
        );

        await t.step('progressive image sizes scale fast', async () => {
            const sizes = [50, 100, 200, 400];
            const times: number[] = [];

            for (const size of sizes) {
                const img = TestImageGenerator.createGradient(size, size);
                const buffer = await img.encode();
                const start = performance.now();
                await circle({ input: buffer, borderWidth: 5 });
                times.push(performance.now() - start);
            }

            for (let i = 1; i < times.length; i++) {
                const ratio = times[i] / (times[i - 1] || 1);
                assert(
                    ratio < THRESHOLDS.progressiveScaleRatio,
                    `Performance doesn't scale well: ${
                        sizes[i]
                    }px took ${ratio}x longer (threshold ${THRESHOLDS.progressiveScaleRatio}x)`,
                );
            }
        });

        await cleanupTestAssets();
        await cleanupPerfAssets();
    },
    sanitizeResources: false,
    sanitizeOps: false,
});
