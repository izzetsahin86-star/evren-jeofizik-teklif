(() => {
  const STORAGE_KEY = "evren-jeofizik-ced-v1";
  const OLD_NOTE = `Teklifin onaylanması halinde toplam hizmet bedelinin %60’ı peşin talep edilecektir, kalan kısmın tahsilatı iş bitiminde tamamlanacaktır.\nOnaylanan teklif sözleşme yerine geçer.`;
  const NEW_NOTE = "Resmî kurumlara ödenecek harç ve diğer giderler hizmet bedeline dahil değildir ve işveren tarafından karşılanacaktır. Evren Jeofizik hizmet bedelinin %60’ı peşin, kalan %40’ı iş bitiminde tahsil edilecektir.";

  try {
    const proposals = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(proposals)) {
      let changed = false;
      proposals.forEach((proposal) => {
        if (proposal?.paymentNotes === OLD_NOTE) {
          proposal.paymentNotes = NEW_NOTE;
          changed = true;
        }
      });
      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
    }
  } catch (error) {
    console.warn("ÇED ödeme notu güncellenemedi:", error);
  }

  function applyNewDefaultToOpenEditor() {
    const textarea = document.querySelector('textarea[data-field="paymentNotes"]');
    if (!textarea || textarea.value !== OLD_NOTE) return;
    textarea.value = NEW_NOTE;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function toast(message) {
    const el = document.getElementById("ced-toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(el._runtimeTimer);
    el._runtimeTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  async function downloadPdf(button) {
    const page = document.querySelector(".ced-pdf-page");
    if (!page || !window.html2canvas || !window.jspdf?.jsPDF) {
      toast("PDF bileşenleri henüz hazır değil. Birkaç saniye sonra tekrar deneyin.");
      return;
    }

    button.disabled = true;
    button.textContent = "PDF hazırlanıyor…";
    try {
      const images = [...page.querySelectorAll("img")];
      await Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = img.onerror = resolve; })));
      const canvas = await window.html2canvas(page, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const ratioHeight = 210 * canvas.height / canvas.width;
      let width = 210;
      let height = ratioHeight;
      let x = 0;
      if (height > 297) {
        height = 297;
        width = 297 * canvas.width / canvas.height;
        x = (210 - width) / 2;
      }
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", x, 0, width, height, undefined, "FAST");
      const blob = pdf.output("blob");
      const customer = (document.querySelector('input[data-field="customerName"]')?.value || "CED-Teklifi").replace(/[\\/:*?"<>|]+/g, " ").trim();
      const quoteNo = (document.querySelector('input[data-field="quoteNo"]')?.value || "CED").replace(/[\\/:*?"<>|]+/g, " ").trim();
      const filename = `${customer} - ${quoteNo}.pdf`;

      if (isIOS() && navigator.share) {
        const file = new File([blob], filename, { type: "application/pdf" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
          toast("PDF hazırlandı.");
          return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast("PDF indirildi.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(error);
        toast("PDF hazırlanamadı.");
      }
    } finally {
      button.disabled = false;
      button.textContent = "PDF İndir";
    }
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-action]");
    if (!button) return;

    if (button.dataset.action === "pdf") {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      downloadPdf(button);
      return;
    }

    if (button.dataset.action === "new") {
      setTimeout(applyNewDefaultToOpenEditor, 0);
    }
  }, true);
})();
