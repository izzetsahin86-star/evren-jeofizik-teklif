(() => {
  let busy = false;

  function sleepFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function safeFileName(value) {
    const name = String(value || "Evren-Jeofizik-Teklif")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return `${name || "Evren-Jeofizik-Teklif"}.pdf`;
  }

  function updateButtonLabels() {
    document.querySelectorAll('[data-action="download-preview-pdf"]').forEach((button) => {
      [...button.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.includes("PDF İndir / Yazdır")) {
          node.nodeValue = node.nodeValue.replace("PDF İndir / Yazdır", "PDF İndir");
        }
      });
      button.setAttribute("aria-label", "PDF İndir");
      button.setAttribute("title", "PDF İndir");
    });
  }

  function librariesReady() {
    return typeof window.html2canvas === "function" && Boolean(window.jspdf?.jsPDF);
  }

  async function createPdf(button) {
    if (busy) return;
    busy = true;

    const originalDisabled = button.disabled;
    const originalText = button.innerHTML;

    try {
      button.disabled = true;
      button.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:pdf-direct-spin .7s linear infinite"></span> PDF hazırlanıyor...';

      if (!librariesReady()) {
        throw new Error("PDF oluşturma bileşenleri yüklenemedi. İnternet bağlantınızı kontrol edip sayfayı yenileyin.");
      }

      await sleepFrame();

      const modal = button.closest(".pdf-preview-modal");
      const sheet = modal?.querySelector(".pdf-preview-sheet");
      const pages = sheet ? [...sheet.querySelectorAll(":scope > .pdf-page")] : [];
      if (!pages.length) throw new Error("PDF sayfaları bulunamadı.");

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true
      });

      for (let index = 0; index < pages.length; index += 1) {
        const page = pages[index];
        const canvas = await window.html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 12000,
          removeContainer: true,
          scrollX: 0,
          scrollY: 0
        });

        if (index > 0) pdf.addPage("a4", "portrait");
        const image = canvas.toDataURL("image/jpeg", 0.96);
        pdf.addImage(image, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }

      const title = modal?.querySelector(".pdf-preview-toolbar h2")?.textContent?.trim() || "Evren Jeofizik Teklif";
      pdf.setProperties({
        title,
        subject: "Evren Jeofizik Teklif",
        creator: "Evren Jeofizik Teklif Sistemi"
      });

      pdf.save(safeFileName(title));
    } catch (error) {
      console.error("PDF oluşturulamadı:", error);
      window.alert(error?.message || "PDF oluşturulamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
    } finally {
      button.disabled = originalDisabled;
      button.innerHTML = originalText.replace("PDF İndir / Yazdır", "PDF İndir");
      busy = false;
    }
  }

  const style = document.createElement("style");
  style.textContent = "@keyframes pdf-direct-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(style);

  document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="download-preview-pdf"]');
    if (!button) return;

    // Capture this action before app.js can call window.print().
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    createPdf(button);
  }, true);

  const observer = new MutationObserver(updateButtonLabels);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateButtonLabels, { once: true });
  } else {
    updateButtonLabels();
  }
})();
