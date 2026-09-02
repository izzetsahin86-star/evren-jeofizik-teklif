(() => {
  const MODAL_ID = "quote-type-chooser";

  function closeChooser() {
    document.getElementById(MODAL_ID)?.remove();
  }

  function openChooser() {
    closeChooser();
    const modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "quote-type-backdrop";
    modal.innerHTML = `
      <section class="quote-type-modal" role="dialog" aria-modal="true" aria-labelledby="quote-type-title">
        <button class="quote-type-close" type="button" aria-label="Kapat">×</button>
        <div class="quote-type-head">
          <span>YENİ TEKLİF</span>
          <h2 id="quote-type-title">Teklif türünü seçin</h2>
          <p>Normal teklif mevcut sistemle devam eder. ÇED teklifi ayrı ÇED modülünü açar.</p>
        </div>
        <div class="quote-type-grid">
          <button class="quote-type-card normal" type="button" data-quote-type="normal">
            <div class="quote-type-icon">N</div>
            <strong>Normal Teklif</strong>
            <span>Mevcut fiyat teklifi sistemi</span>
            <b>Devam Et →</b>
          </button>
          <button class="quote-type-card ced" type="button" data-quote-type="ced">
            <div class="quote-type-icon">ÇED</div>
            <strong>ÇED Teklifi</strong>
            <span>ÇED teklif / sözleşme modülü</span>
            <b>ÇED Teklifi Oluştur →</b>
          </button>
        </div>
      </section>`;
    document.body.appendChild(modal);

    modal.querySelector(".quote-type-close").addEventListener("click", closeChooser);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeChooser();
      const choice = event.target.closest("[data-quote-type]");
      if (!choice) return;
      if (choice.dataset.quoteType === "ced") window.location.href = "/ced";
      else window.location.href = "/quotes/new";
    });
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest('[data-link="/quotes/new"], a[href="/quotes/new"]');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    openChooser();
  }, true);
})();
