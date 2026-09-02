(() => {
  const STORAGE_KEY = "evren-jeofizik-teklif-v1";
  let queued = false;

  function normalize(value) {
    return String(value || "").trim().toLocaleLowerCase("tr-TR");
  }

  function cleanStoredProjectFields() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.quotes)) return;

      let changed = false;
      parsed.quotes.forEach((quote) => {
        if (!quote || typeof quote !== "object") return;
        if (Object.prototype.hasOwnProperty.call(quote, "projectName")) {
          delete quote.projectName;
          changed = true;
        }
        if (Object.prototype.hasOwnProperty.call(quote, "projectPlace")) {
          delete quote.projectPlace;
          changed = true;
        }
      });

      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (error) {
      console.warn("Eski proje alanları temizlenemedi.", error);
    }
  }

  function storedQuoteForCurrentRoute() {
    try {
      const match = location.pathname.match(/^\/quotes\/([^/]+)\/?$/);
      if (!match) return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return (parsed?.quotes || []).find((quote) => quote.id === decodeURIComponent(match[1])) || null;
    } catch {
      return null;
    }
  }

  function removeProjectFormSection() {
    const heading = [...document.querySelectorAll(".form-section-title")]
      .find((node) => normalize(node.textContent) === "proje bilgileri");

    if (heading) {
      const previous = heading.previousElementSibling;
      const row = heading.nextElementSibling;
      if (previous?.classList.contains("separator")) previous.remove();
      if (row?.querySelector?.('[data-model="projectName"], [data-model="projectPlace"]')) row.remove();
      heading.remove();
    }

    document.querySelectorAll('[data-model="projectName"], [data-model="projectPlace"]').forEach((input) => {
      const row = input.closest(".field-row");
      if (row) row.remove();
      else input.closest(".field")?.remove();
    });
  }

  function removeTableColumns(table, labels) {
    const headerCells = [...table.querySelectorAll("thead th")];
    if (!headerCells.length) return;

    const indexes = headerCells
      .map((cell, index) => labels.has(normalize(cell.textContent)) ? index : -1)
      .filter((index) => index >= 0)
      .sort((a, b) => b - a);

    if (!indexes.length) return;

    indexes.forEach((index) => {
      table.querySelectorAll("tr").forEach((row) => {
        const cells = [...row.children].filter((cell) => cell.matches("th,td"));
        cells[index]?.remove();
      });
    });

    const columnCount = table.querySelectorAll("thead th").length;
    table.querySelectorAll('tbody td[colspan]').forEach((cell) => {
      cell.colSpan = columnCount;
    });
  }

  function cleanTables() {
    document.querySelectorAll("table").forEach((table) => {
      const labels = new Set([...table.querySelectorAll("thead th")].map((th) => normalize(th.textContent)));
      if (labels.has("proje yeri")) {
        removeTableColumns(table, new Set(["proje", "proje yeri"]));
      } else if (labels.has("proje") && labels.has("müşteri") && labels.has("teklif no")) {
        removeTableColumns(table, new Set(["proje"]));
      }
    });

    const search = document.getElementById("quote-search");
    if (search) search.placeholder = "Teklif no, firma veya yetkili ara...";
  }

  function cleanQuoteDetail() {
    const quote = storedQuoteForCurrentRoute();
    const heroLine = document.querySelector(".quote-hero-copy > span");
    if (heroLine && quote?.customerName) heroLine.textContent = quote.customerName;

    const projectCard = [...document.querySelectorAll(".quote-info-card")]
      .find((card) => normalize(card.querySelector(".quote-card-kicker")?.textContent) === "proje / saha");
    if (!projectCard) return;

    const kicker = projectCard.querySelector(".quote-card-kicker");
    if (kicker) kicker.textContent = "ÇALIŞMA ALANI";

    const areaRow = [...projectCard.querySelectorAll("dl > div")]
      .find((row) => normalize(row.querySelector("dt")?.textContent) === "çalışma alanı");
    const areaText = areaRow?.querySelector("dd")?.textContent?.trim() || "—";
    const title = projectCard.querySelector("h2");
    if (title) title.textContent = areaText;
    areaRow?.remove();
  }

  function cleanUi() {
    removeProjectFormSection();
    cleanTables();
    cleanQuoteDetail();
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      cleanUi();
    });
  }

  cleanStoredProjectFields();

  document.addEventListener("click", (event) => {
    if (!event.target.closest('[data-action="save-quote"]')) return;
    setTimeout(cleanStoredProjectFields, 50);
    setTimeout(cleanStoredProjectFields, 250);
  });

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("popstate", schedule);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cleanUi, { once: true });
  } else {
    cleanUi();
  }
})();
