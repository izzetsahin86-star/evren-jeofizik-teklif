import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of ["index.html", "styles.css", "mobile.css", "mobile-smart-nav.css", "mobile-smart-nav.js", "device-state-repair.js", "default-description-update.js", "cloud-sync.js", "sync-session-fix.js", "auto-customer-sync.js", "remove-project-fields.js", "quote-labels-update.js", "quote-type-chooser.css", "quote-type-chooser.js", "workflow-image-captions.js", "pdf-two-page-fix.css", "pdf-two-page-fix.js", "pdf-workflow-images.css", "pdf-workflow-images.js", "pdf-logo-fix.css", "pdf-note-font.css", "pdf-direct-download.js", "app.js", "ced.html", "ced.css", "ced-pdf-company-fix.css", "ced.js", "ced-runtime-fix.js", "ced-cloud-sync.js", "vercel.json", "evren-logo.png"]) {
  await cp(file, `dist/${file}`);
}
console.log("Static build created in dist/");
