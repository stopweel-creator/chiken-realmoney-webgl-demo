import { cp, mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { brotliDecompressSync } from "node:zlib";

const sourceDirectory = resolve(".");
const outputDirectory = resolve(process.argv[2] ?? "site");
const buildDirectory = join(outputDirectory, "Build");
const compressedFiles = [
  "GamePreviewBuild.data.br",
  "GamePreviewBuild.framework.js.br",
  "GamePreviewBuild.wasm.br",
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(sourceDirectory, outputDirectory, {
  recursive: true,
  filter: (source) => !source.includes(`${process.platform === "win32" ? "\\" : "/"}site`)
});

for (const compressedFile of compressedFiles) {
  const compressedPath = join(buildDirectory, compressedFile);
  const targetPath = join(buildDirectory, basename(compressedFile, ".br"));
  const content = await readFile(compressedPath);
  await writeFile(targetPath, brotliDecompressSync(content));
  await unlink(compressedPath);
}

const indexPath = join(outputDirectory, "index.html");
const index = await readFile(indexPath, "utf8");
await writeFile(indexPath, index.replaceAll(".data.br", ".data").replaceAll(".framework.js.br", ".framework.js").replaceAll(".wasm.br", ".wasm"));

console.log(`Prepared GitHub Pages files in ${outputDirectory}`);
