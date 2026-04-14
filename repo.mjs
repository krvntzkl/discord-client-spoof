import asar from "@electron/asar";
import fs from "node:fs";
import path from "node:path";

/**
 * Pack each `dist/<folder>/` extension into `repo/<manifest.id>.asar`
 * (required layout for the official moonlight extensions index).
 */
const distRoot = "./dist";

if (!fs.existsSync(distRoot)) {
  console.error("dist/ is missing. Run `pnpm run build` first.");
  process.exit(1);
}

fs.mkdirSync("./repo", { recursive: true });

for (const folder of fs.readdirSync(distRoot)) {
  const extPath = path.join(distRoot, folder);
  if (!fs.statSync(extPath).isDirectory()) continue;

  const manifestPath = path.join(extPath, "manifest.json");
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const id = manifest.id;
  if (!id || typeof id !== "string") continue;

  const out = path.join("./repo", `${id}.asar`);
  await asar.createPackage(extPath, out);
  console.log(`Packed ${folder} -> ${out}`);
}
