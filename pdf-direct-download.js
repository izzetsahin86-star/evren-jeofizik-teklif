(() => {
  let busy = false;

  function sleepFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function waitFor(selector, timeout = 2500) {
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

  async function deliverPdf(pdf, title) {
    const fileName = safeFileName(title);
    const blob = pdf.output("blob");

    // iPhone/iPad: native share sheet includes “Dosyalara Kaydet”.
    try {
      const file = new File([blob], fileName, { type: "application/pdf" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: fileName,
          text: "Evren Jeofizik teklif PDF dosyası"
        });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.warn("Yerel paylaşım kullanılamadı, doğrudan indirmeye geçiliyor.", error);
    }

    // Desktop / fallback: real PDF download, never window.print().
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
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

      const title = modal?.querySelector(".pdf-preview-toolbar h2")?.textContent?.trim() || "Evren Jeofizik Teklif";
      pdf.setProperties({
        title,
        subject: "Evren Jeofizik Teklif",
        creator: "Evren Jeofizik Teklif Sistemi"
      });

      await deliverPdf(pdf, title);
    } catch (error) {
      console.error("PDF oluşturulamadı:", error);
      window.alert(error?.message || "PDF oluşturulamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
    } finally {
      button.disabled = originalDisabled;
      button.innerHTML = originalText.replace("PDF İndir / Yazdır", "PDF İndir");
      busy = false;
    }
  }

  async function downloadFromQuoteDetail(control) {
    const id = control.dataset.id;
    const previewButton = document.querySelector(`[data-action="preview-pdf"][data-id="${CSS.escape(id || "")}"]`)
      || document.querySelector('[data-action="preview-pdf"]');
    if (!previewButton) throw new Error("PDF önizleme butonu bulunamadı.");

    previewButton.click();
    const modal = await waitFor(".pdf-preview-modal");
    await sleepFrame();
    const downloadButton = modal.querySelector('[data-action="download-preview-pdf"]');
    if (!downloadButton) throw new Error("PDF indirme butonu bulunamadı.");
    await createPdf(downloadButton);
  }

  const style = document.createElement("style");
  style.textContent = "@keyframes pdf-direct-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(style);

  // Capture phase prevents app.js from reaching window.print().
  document.addEventListener("click", (event) => {
    const control = event.target.closest('[data-action="download-preview-pdf"], [data-action="pdf-quote"]');
    if (!control) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (control.dataset.action === "pdf-quote") {
      downloadFromQuoteDetail(control).catch((error) => {
        console.error(error);
        window.alert(error?.message || "PDF oluşturulamadı.");
      });
      return;
    }

    createPdf(control);
  }, true);

  const observer = new MutationObserver(updateButtonLabels);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateButtonLabels, { once: true });
  } else {
    updateButtonLabels();
  }
})();
