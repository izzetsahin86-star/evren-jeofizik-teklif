(() => {
  const STORAGE_KEY = "evren-jeofizik-teklif-v1";

  const OLD_TEXT = `1. TEKLİF GEÇERLİLİK SÜRESİ: Bu teklif belirtilen geçerlilik tarihine kadar geçerlidir.

2. ÖDEME ŞARTLARI: İşin tamamlanmasını müteakip fatura kesilecek olup, fatura tarihinden itibaren 30 gün içinde ödeme yapılacaktır.

3. ÇALIŞMA SÜRESİ: Belirtilen iş programına göre arazi çalışmaları süresi teklif kapsamında belirtilmiştir.

4. RAPOR TESLİM SÜRESİ: Arazi çalışmaları tamamlandıktan sonra 30 (otuz) iş günü içerisinde nihai rapor teslim edilecektir.

5. ULAŞIM / KONAKLAMA: Çalışma ekibinin çalışma sahasına ulaşımı ve konaklama ihtiyaçları tarafımızca karşılanacaktır.

6. DİĞER ŞARTLAR: Teklif kapsamında yapılmayacak işler ve özel koşullar ayrıca belirtilmemiştir. İSG, sigorta ve resmi kurum izinleri ilgili mevzuat çerçevesinde yürütülür.`;

  const NEW_TEXT = `Çalışmaya başlanılması halinde toplam ücretin %60’ı peşin olarak talep edilecek, kalan %40’ı ise iş bitiminde talep edilecektir. Teklif kapsamında saha çalışmalarında görev alacak personelin konaklama, ulaşım (araç tahsisi dahil) ve diğer operasyonel ihtiyaçları firmamız tarafından karşılanacaktır. Arazi çalışmalarının yaklaşık 20 gün sürmesi öngörülmektedir. Çalışmalar sonucunda yer altı yapısı belirlenerek rapor hâline getirilecektir.`;

  function normalize(value) {
    return String(value || "").replace(/\r\n/g, "\n").trim();
  }

  function isOldDefault(value) {
    return normalize(value) === normalize(OLD_TEXT);
  }

  function migrateStoredQuotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (!Array.isArray(state?.quotes)) return;

      let changed = false;
      state.quotes.forEach((quote) => {
        if (isOldDefault(quote?.description)) {
          quote.description = NEW_TEXT;
          changed = true;
        }
      });

      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Varsayılan açıklama güncellenemedi.", error);
    }
  }

  function updateVisibleDescription() {
    const textarea = document.querySelector('textarea[data-model="description"]');
    if (!textarea || !isOldDefault(textarea.value)) return;
    textarea.value = NEW_TEXT;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  migrateStoredQuotes();

  new MutationObserver(updateVisibleDescription).observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateVisibleDescription, { once: true });
  } else {
    updateVisibleDescription();
  }
})();
