// Packs the library, installs the tarball into an empty project and calls it
// the way a consumer does: once with `import`, once with `require`.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const work = mkdtempSync(join(tmpdir(), "image-generation-smoke-"));
const run = (command, args, cwd) => execFileSync(command, args, { cwd, encoding: "utf8" });

try {
  const [packed] = JSON.parse(
    run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", work], root),
  );
  const files = packed.files.map((file) => file.path).sort();
  const unexpected = files.filter(
    (file) => !["package.json", "license", "readme.md"].includes(file) && !file.startsWith("dist/"),
  );
  if (unexpected.length) throw new Error(`unexpected files in the package: ${unexpected}`);

  const consumer = join(work, "consumer");
  mkdirSync(consumer);
  writeFileSync(join(consumer, "package.json"), "{}");
  run("npm", ["install", "--no-audit", "--no-fund", join(work, packed.filename)], consumer);

  const input = join(root, "example", "input-1.jpg");
  const script = (load) => `
    const { greyscale } = ${load};
    greyscale({ input: ${JSON.stringify(input)} }).then((png) => {
      const magic = Buffer.from(png.subarray(0, 4)).toString("hex");
      if (magic !== "89504e47") throw new Error("not a PNG: " + magic);
      console.log(png.length);
    });
  `;
  const esm = run(
    "node",
    ["--input-type=module", "-e", script('await import("@totallynotdavid/image-generation")')],
    consumer,
  );
  const cjs = run(
    "node",
    ["--input-type=commonjs", "-e", script('require("@totallynotdavid/image-generation")')],
    consumer,
  );
  console.log(`package files: ${files.join(", ")}`);
  console.log(`import: ${esm.trim()} bytes, require: ${cjs.trim()} bytes`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
