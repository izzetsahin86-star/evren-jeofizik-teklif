(() => {
  const STORAGE_KEY = "evren-jeofizik-teklif-v1";
  const REPAIR_KEY = "evren-device-state-repair-v1";
  const CLOUD_REVISION_KEY = "evren-cloud-sync-revision";
  const TARGET_QUOTE_NO = "EJ-2026-0029";
  const TARGET_CUSTOMER = "KONYA KROM MAĞNEZİT TUĞLA SAN.A.Ş.";

  const EVREN = {
    id: "company-2",
    name: "EVREN JEOFİZİK HİZ. VE TEK. TİC. LTD. ŞTİ.",
    subtitle: "JEOFİZİK - JEOLOJİ HİZMETLERİ",
    logo: "/evren-logo.png",
    address: "Dumlupınar Mah. Kocatepe Merkez Mah. No:2 Ordu Blv. No:4 İç Kapı No:309\nMerkez/AFYONKARAHİSAR",
    phone: "0 532 792 79 10",
    email: "jeofizikhizmetleri@gmail.com",
    website: "www.evrenjeofizik.com",
    taxOffice: "Kocatepe V.D.",
    taxNo: "3830436033",
    bank: "",
    iban: "",
    footer: "",
    isDefault: true
  };

  const MOBILE_WORKFLOW = [
    "Koordinat ve Harita Hazırlığı",
    "Jeofizik Etütler",
    "Veri Entegrasyonu ve Değerlendirme"
  ];

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLocaleUpperCase("tr-TR")
      .replace(/[^A-ZÇĞİÖŞÜ0-9]+/g, "")
      .trim();
  }

  function isEvrenCompany(company) {
    const name = normalize(company?.name);
    return company?.id === EVREN.id || name.includes("EVRENJEOFİZİK");
  }

  function repairState() {
    try {
      // This was a one-time repair for the old PC-only localStorage mismatch.
      // Once central sync has a revision, or this device has already been repaired,
      // it must never overwrite legitimate future edits coming from the shared state.
      if (Number(sessionStorage.getItem(CLOUD_REVISION_KEY) || 0) > 0) return;
      if (localStorage.getItem(REPAIR_KEY) === "1") return;

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const state = JSON.parse(raw);
      let changed = false;

      if (!Array.isArray(state.companies)) state.companies = [];

      let canonical = state.companies.find((company) => company.id === EVREN.id)
        || state.companies.find(isEvrenCompany);

      if (!canonical) {
        canonical = { ...EVREN };
        state.companies.push(canonical);
        changed = true;
      } else {
        const id = canonical.id || EVREN.id;
        Object.assign(canonical, EVREN, { id });
        changed = true;
      }

      state.companies.forEach((company) => {
        if (company !== canonical && isEvrenCompany(company)) {
          const id = company.id;
          Object.assign(company, EVREN, { id, isDefault: false });
          changed = true;
        } else if (company !== canonical && company.isDefault) {
          company.isDefault = false;
          changed = true;
        }
      });
      canonical.isDefault = true;

      state.settings = state.settings || {};
      if (Number(state.settings.vatRate) !== 20) {
        state.settings.vatRate = 20;
        changed = true;
      }

      if (Array.isArray(state.quotes)) {
        const quote = state.quotes.find((item) =>
          String(item?.no || "").trim() === TARGET_QUOTE_NO
          && normalize(item?.customerName) === normalize(TARGET_CUSTOMER)
        );

        if (quote) {
          if (quote.companyId !== canonical.id) {
            quote.companyId = canonical.id;
            changed = true;
          }

          if (Array.isArray(quote.items)) {
            quote.items.forEach((item) => {
              if (Number(item?.vat) !== 20) {
                item.vat = 20;
                changed = true;
              }
            });
          }

          const currentWorkflow = JSON.stringify(quote.workflow || []);
          const correctWorkflow = JSON.stringify(MOBILE_WORKFLOW);
          if (currentWorkflow !== correctWorkflow) {
            quote.workflow = [...MOBILE_WORKFLOW];
            quote.includeWorkflow = true;
            changed = true;
          }

          const subtotal = (quote.items || []).reduce((sum, item) =>
            sum + Number(item?.quantity || 0) * Number(item?.price || 0), 0);
          const vat = (quote.items || []).reduce((sum, item) =>
            sum + Number(item?.quantity || 0) * Number(item?.price || 0) * (Number(item?.vat || 0) / 100), 0);
          const total = subtotal + vat;
          if (Number(quote.total || 0) !== total) {
            quote.total = total;
            changed = true;
          }

          if (Array.isArray(quote.images)) {
            const captions = ["İşletme Ruhsat Sahası", "Jeofizik DES Planı"];
            quote.images = quote.images.map((image, index) => {
              if (index > 1) return image;
              const caption = captions[index];
              if (typeof image === "string") {
                changed = true;
                return { data: image, name: "", caption };
              }
              if (image && image.caption !== caption) {
                changed = true;
                return { ...image, caption };
              }
              return image;
            });
          }
        }
      }

      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(REPAIR_KEY, "1");
    } catch (error) {
      console.warn("Cihaz verisi düzeltilemedi.", error);
    }
  }

  repairState();
})();
