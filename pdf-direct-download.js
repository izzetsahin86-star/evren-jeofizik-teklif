(() => {
  let busy = false;

  function sleepFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function waitFor(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(selector);
      if (existing) return resolve(existing);
      const observer = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if (found) {
          observer.disconnect();
          resolve(found);
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        reject(new Error("PDF önizleme ekranı açılamadı."));
      }, timeout);
    });
  }

  function safeFileName(value) {
    const name = String(value || "Evren Jeofizik Teklif")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .replace(/-+/g, "-")
      .replace(/^[ .-]+|[ .-]+$/g, "");
    return `${name || "Evren Jeofizik Teklif"}.pdf`;
  }

  function setButtonText(button, text) {
    const svg = button.querySelector("svg")?.outerHTML || "";
    button.innerHTML = `${svg}${svg ? " " : ""}${text}`;
  }

  function rewriteButtons() {
    document.querySelectorAll('[data-action="pdf-quote"]').forEach((button) => {
      button.dataset.action = "export-pdf";
      setButtonText(button, "PDF Dışa Aktar");
      button.setAttribute("aria-label", "PDF Dışa Aktar");
      button.setAttribute("title", "PDF Dışa Aktar");
    });

    document.querySelectorAll('[data-action="download-preview-pdf"]').forEach((button) => {
      button.dataset.action = "export-preview-pdf";
      setButtonText(button, "PDF Dışa Aktar");
      button.setAttribute("aria-label", "PDF Dışa Aktar");
      button.setAttribute("title", "PDF Dışa Aktar");
    });
  }

  function librariesReady() {
    return typeof window.html2canvas === "function" && Boolean(window.jspdf?.jsPDF);
  }

  async function exportPdfFile(pdf, title) {
    const fileName = safeFileName(title);
    const blob = pdf.output("blob");
    const file = new File([blob], fileName, { type: "application/pdf", lastModified: Date.now() });

    // iPhone/iPad: share ONLY the actual PDF file. No URL, title or text is sent.
    // This makes iOS show the real PDF attachment and “Dosyalara Kaydet”.
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.warn("PDF dosya paylaşımı başarısız, PDF görüntüleyici açılıyor.", error);
      }
    }

    // Safe fallback: open the generated PDF itself, never the quote webpage.
    // From the PDF viewer the user can use Share > Dosyalara Kaydet.
    const url = URL.createObjectURL(blob);
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 120000);
  }

  async function createPdf(button) {
    if (busy) return;
    busy = true;

    const originalDisabled = button.disabled;
    const originalHtml = button.innerHTML;

    try {
      button.disabled = true;
      button.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:pdf-direct-spin .7s linear infinite"></span> PDF hazırlanıyor...';

      if (!librariesReady()) {
        throw new Error("PDF oluşturma bileşenleri yüklenemedi. Sayfayı yenileyip tekrar deneyin.");
      }

      await sleepFrame();
      rewriteButtons();

      const modal = button.closest(".pdf-preview-modal") || document.querySelector(".pdf-preview-modal");
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

      const quoteTitle = modal?.querySelector(".pdf-preview-toolbar h2")?.textContent?.trim() || "Evren Jeofizik Teklif";
      const customerName = sheet?.querySelector(".pdf-primary-page .pdf-customer-box > strong")?.textContent?.trim() || "";
      const fileTitle = customerName && customerName !== "—" ? customerName : quoteTitle;

      pdf.setProperties({
        title: quoteTitle,
        subject: "Evren Jeofizik Teklif",
        creator: "Evren Jeofizik Teklif Sistemi"
      });

      await exportPdfFile(pdf, fileTitle);
    } catch (error) {
      console.error("PDF dışa aktarılamadı:", error);
      window.alert(error?.message || "PDF dışa aktarılamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
    } finally {
      button.disabled = originalDisabled;
      button.innerHTML = originalHtml;
      rewriteButtons();
      busy = false;
    }
  }

  async function exportFromQuoteDetail(control) {
    const id = control.dataset.id;
    const previewButton = document.querySelector(`[data-action="preview-pdf"][data-id="${CSS.escape(id || "")}"]`)
      || document.querySelector('[data-action="preview-pdf"]');
    if (!previewButton) throw new Error("PDF önizleme butonu bulunamadı.");

    previewButton.click();
    const modal = await waitFor(".pdf-preview-modal");
    await sleepFrame();
    rewriteButtons();
    const exportButton = modal.querySelector('[data-action="export-preview-pdf"]');
    if (!exportButton) throw new Error("PDF dışa aktarma butonu bulunamadı.");
    await createPdf(exportButton);
  }

  const style = document.createElement("style");
  style.textContent = "@keyframes pdf-direct-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(style);

  // These action names are intentionally unknown to app.js, so window.print() cannot run.
  document.addEventListener("click", (event) => {
    const control = event.target.closest('[data-action="export-preview-pdf"], [data-action="export-pdf"]');
    if (!control) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (control.dataset.action === "export-pdf") {
      exportFromQuoteDetail(control).catch((error) => {
        console.error(error);
        window.alert(error?.message || "PDF dışa aktarılamadı.");
      });
      return;
    }

    createPdf(control);
  }, true);

  const observer = new MutationObserver(rewriteButtons);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rewriteButtons, { once: true });
  } else {
    rewriteButtons();
  }
})();
