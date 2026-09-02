(() => {
  function replaceText(root = document) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(parent.tagName)) return;
      const text = node.nodeValue;
      if (!text) return;

      if (text.trim() === "AÇIKLAMA") node.nodeValue = text.replace("AÇIKLAMA", "TEKLİF NOTLARI");
      else if (text.trim() === "Açıklama") node.nodeValue = text.replace("Açıklama", "TEKLİF NOTLARI");
      else if (text.trim() === "Teklif Açıklaması") node.nodeValue = text.replace("Teklif Açıklaması", "Teklif Notları");
      else if (text.includes("PDF'de AÇIKLAMA başlığı altında görünür.")) {
        node.nodeValue = text.replace("PDF'de AÇIKLAMA başlığı altında görünür.", "PDF'de TEKLİF NOTLARI başlığı altında görünür.");
      }
    });

    document.querySelectorAll(".pdf-items-table thead th:nth-child(2)").forEach((th) => {
      if (th.textContent.trim() === "Açıklama") th.textContent = "HİZMET / ÜRÜN";
    });
  }

  replaceText();
  new MutationObserver(() => replaceText()).observe(document.documentElement, { childList: true, subtree: true });
})();
