import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of ["index.html", "styles.css", "app.js", "vercel.json", "evren-logo.png"]) {
  await cp(file, `dist/${file}`);
}
console.log("Static build created in dist/");
