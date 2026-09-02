(() => {
  let scheduled = false;

  function applyLabels() {
    scheduled = false;

    document.querySelectorAll(".form-section-title").forEach((el) => {
      if (el.textContent.trim() === "Açıklama") el.textContent = "TEKLİF NOTLARI";
    });

    document.querySelectorAll(".quote-content-card .quote-section-head.compact p").forEach((el) => {
      if (el.textContent.trim() === "AÇIKLAMA") el.textContent = "TEKLİF NOTLARI";
    });

    document.querySelectorAll(".quote-content-card .quote-section-head.compact h2").forEach((el) => {
      if (el.textContent.trim() === "Teklif Açıklaması") el.textContent = "Teklif Notları";
    });

    document.querySelectorAll(".pdf-note-section .pdf-section-title h2").forEach((el) => {
      el.textContent = "TEKLİF NOTLARI";
    });

    document.querySelectorAll(".pdf-items-table thead th:nth-child(2)").forEach((el) => {
      el.textContent = "HİZMET / ÜRÜN";
    });

    document.querySelectorAll(".form-section .muted").forEach((el) => {
      if (el.textContent.includes("PDF'de AÇIKLAMA başlığı altında görünür.")) {
        el.textContent = el.textContent.replace(
          "PDF'de AÇIKLAMA başlığı altında görünür.",
          "PDF'de TEKLİF NOTLARI başlığı altında görünür."
        );
      }
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => requestAnimationFrame(applyLabels));
  }

  document.addEventListener("click", schedule, true);
  window.addEventListener("popstate", schedule);
  window.addEventListener("load", schedule, { once: true });

  const originalPushState = history.pushState.bind(history);
  history.pushState = (...args) => {
    const result = originalPushState(...args);
    schedule();
    return result;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
})();
