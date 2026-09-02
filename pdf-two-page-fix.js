(() => {
  const DENSITY_CLASSES = ["pdf-fit-dense", "pdf-fit-compact", "pdf-fit-tight", "pdf-fit-ultra", "pdf-desc-long", "pdf-desc-very-long"];
  let queued = false;

  function classifyPrimary(primary) {
    const body = primary.querySelector(".pdf-items-table tbody");
    if (!body) return;
    const rows = [...body.querySelectorAll("tr")].filter((row) => !row.querySelector(".pdf-empty-row"));
    const count = rows.length;
    primary.classList.remove(...DENSITY_CLASSES);
    if (count > 18) primary.classList.add("pdf-fit-ultra");
    else if (count > 13) primary.classList.add("pdf-fit-tight");
    else if (count > 9) primary.classList.add("pdf-fit-compact");
    else if (count > 6) primary.classList.add("pdf-fit-dense");

    const descriptionLength = primary.querySelector(".pdf-note-box")?.textContent?.trim().length || 0;
    if (descriptionLength > 800) primary.classList.add("pdf-desc-very-long");
    else if (descriptionLength > 430) primary.classList.add("pdf-desc-long");
  }

  function normalizeSheet(sheet) {
    const primary = sheet.querySelector(".pdf-primary-page");
    if (!primary) return;
    const itemSection = primary.querySelector(".pdf-items-section");
    const primaryBody = primary.querySelector(".pdf-items-table tbody");
    if (!itemSection || !primaryBody) return;

    const continuationPages = [...sheet.querySelectorAll(".pdf-continuation-page")];
    if (continuationPages.length) {
      let totals = null;
      continuationPages.forEach((page) => {
        page.querySelectorAll(".pdf-items-table tbody tr").forEach((row) => primaryBody.appendChild(row));
        const pageTotals = page.querySelector(".pdf-totals");
        if (pageTotals) totals = pageTotals;
      });

      itemSection.querySelectorAll(".pdf-continued-note").forEach((note) => note.remove());
      if (totals) itemSection.appendChild(totals);
      continuationPages.forEach((page) => page.remove());
    }

    classifyPrimary(primary);
  }

  function updatePreviewCount() {
    document.querySelectorAll(".pdf-preview-modal").forEach((modal) => {
      const sheet = modal.querySelector(".print-sheet");
      const label = modal.querySelector(".pdf-preview-toolbar span");
      if (!sheet || !label) return;
      const count = sheet.querySelectorAll(".pdf-page").length;
      const text = `${count} sayfalık A4 teklif düzeni · Evren kurumsal şablonu`;
      if (label.textContent !== text) label.textContent = text;
    });
  }

  function normalizeAll() {
    document.querySelectorAll(".print-sheet").forEach(normalizeSheet);
    updatePreviewCount();
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      normalizeAll();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("beforeprint", normalizeAll);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", normalizeAll, { once: true });
  else normalizeAll();
})();
