(() => {
  const STORAGE_KEY = "evren-jeofizik-teklif-v1";
  let queued = false;

  function imageSource(image) {
    if (typeof image === "string") return /^(data:|https?:|blob:)/.test(image) ? image : "";
    return image?.data || image?.src || "";
  }

  function readStoredQuotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed?.quotes) ? parsed.quotes : [];
    } catch {
      return [];
    }
  }

  function quoteForSheet(sheet) {
    const quotes = readStoredQuotes();
    if (!quotes.length) return null;

    const routeMatch = location.pathname.match(/^\/quotes\/([^/]+)\/?$/);
    if (routeMatch) {
      const byId = quotes.find((quote) => quote.id === decodeURIComponent(routeMatch[1]));
      if (byId) return byId;
    }

    const modal = sheet.closest(".pdf-preview-modal");
    const quoteNo = modal?.querySelector(".pdf-preview-toolbar h2")?.textContent?.trim()
      || sheet.querySelector(".pdf-compact-quote-no")?.textContent?.trim()
      || "";
    return quotes.find((quote) => String(quote.no || "").trim() === quoteNo) || null;
  }

  function visibleDraftImages() {
    return [...document.querySelectorAll(".quote-image-grid img")]
      .map((img) => img.currentSrc || img.src || "")
      .filter(Boolean)
      .slice(0, 4);
  }

  function getImages(sheet) {
    const quote = quoteForSheet(sheet);
    const stored = (quote?.images || []).map(imageSource).filter(Boolean).slice(0, 4);
    return stored.length ? stored : visibleDraftImages();
  }

  function fitImageArea(page) {
    const content = page.querySelector(".pdf-page-content");
    const workflow = page.querySelector(".pdf-workflow-section");
    const section = page.querySelector(".pdf-workflow-images");
    const title = section?.querySelector(".pdf-workflow-images-title");
    const grid = section?.querySelector(".pdf-workflow-image-grid");
    if (!content || !workflow || !section || !title || !grid) return;

    grid.style.height = "";
    grid.style.maxHeight = "";

    requestAnimationFrame(() => {
      const contentRect = content.getBoundingClientRect();
      const workflowRect = workflow.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const sectionStyle = getComputedStyle(section);
      const titleStyle = getComputedStyle(title);
      const marginTop = parseFloat(sectionStyle.marginTop) || 0;
      const titleMarginBottom = parseFloat(titleStyle.marginBottom) || 0;
      const safety = 5;
      const remaining = contentRect.bottom - workflowRect.bottom - marginTop - safety;
      const gridHeight = Math.max(44, remaining - titleRect.height - titleMarginBottom);

      grid.style.height = `${Math.floor(gridHeight)}px`;
      grid.style.maxHeight = `${Math.floor(gridHeight)}px`;
    });
  }

  function injectIntoSheet(sheet) {
    const page = sheet.querySelector(".pdf-secondary-page");
    if (!page) return;

    const content = page.querySelector(".pdf-page-content");
    const workflow = page.querySelector(".pdf-workflow-section");
    if (!content || !workflow) return;

    const images = getImages(sheet);
    const existing = page.querySelector(".pdf-workflow-images");

    page.classList.remove("pdf-workflow-has-images", "pdf-workflow-images-dense", "pdf-workflow-images-tight");

    if (!images.length) {
      existing?.remove();
      return;
    }

    const rowCount = workflow.querySelectorAll("tbody tr").length;
    page.classList.add("pdf-workflow-has-images");
    if (rowCount > 10) page.classList.add("pdf-workflow-images-tight");
    else if (rowCount > 7) page.classList.add("pdf-workflow-images-dense");

    const signature = images.join("|");
    let section = existing;

    if (!section || section.dataset.signature !== signature) {
      existing?.remove();
      section = document.createElement("section");
      section.className = `pdf-workflow-images count-${images.length}`;
      section.dataset.signature = signature;
      section.innerHTML = `
        <div class="pdf-workflow-images-title"><i></i><span>İŞ AKIŞI GÖRSELLERİ</span></div>
        <div class="pdf-workflow-image-grid">
          ${images.map((src, index) => `<figure><img src="${src}" alt="İş akışı görseli ${index + 1}" /></figure>`).join("")}
        </div>`;
      workflow.insertAdjacentElement("afterend", section);
    }

    page.dataset.workflowRows = String(rowCount);
    section.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", () => fitImageArea(page), { once: true });
    });
    fitImageArea(page);
  }

  function injectAll() {
    document.querySelectorAll(".print-sheet").forEach(injectIntoSheet);
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      injectAll();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("beforeprint", injectAll);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectAll, { once: true });
  else injectAll();
})();
