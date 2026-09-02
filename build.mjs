import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of ["index.html", "styles.css", "mobile.css", "mobile-smart-nav.css", "mobile-smart-nav.js", "default-description-update.js", "auto-customer-sync.js", "remove-project-fields.js", "workflow-image-captions.js", "pdf-two-page-fix.css", "pdf-two-page-fix.js", "pdf-workflow-images.css", "pdf-workflow-images.js", "pdf-direct-download.js", "app.js", "vercel.json", "evren-logo.png"]) {
  await cp(file, `dist/${file}`);
}
console.log("Static build created in dist/");
