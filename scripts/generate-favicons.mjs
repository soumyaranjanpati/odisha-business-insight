/**
 * One-off asset generator: OE mark on brand blue (#1877F2).
 * Run: node scripts/generate-favicons.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="36" fill="#1877F2"/>
  <text x="90" y="118" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="72" font-weight="700" fill="white" text-anchor="middle">OE</text>
</svg>
`;

async function main() {
  const base = Buffer.from(svg);

  const png32 = await sharp(base).resize(32, 32).png().toBuffer();
  const png48 = await sharp(base).resize(48, 48).png().toBuffer();
  const png180 = await sharp(base).resize(180, 180).png().toBuffer();

  await writeFile(join(publicDir, "favicon-32x32.png"), png32);
  await writeFile(join(publicDir, "apple-touch-icon.png"), png180);

  const ico = await toIco([png48, png32]);
  await writeFile(join(publicDir, "favicon.ico"), ico);

  console.log("Wrote public/favicon.ico, favicon-32x32.png, apple-touch-icon.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
