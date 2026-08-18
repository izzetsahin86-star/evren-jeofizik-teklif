(() => {
  "use strict";

  const STORAGE_KEY = "evren-jeofizik-teklif-v1";
  const EVREN_LOGO_URL = "/assets/evren-jeofizik-logo-embedded.svg";
  const DEFAULT_DESCRIPTION = `1. TEKLİF GEÇERLİLİK SÜRESİ: Bu teklif belirtilen geçerlilik tarihine kadar geçerlidir.

2. ÖDEME ŞARTLARI: İşin tamamlanmasını müteakip fatura kesilecek olup, fatura tarihinden itibaren 30 gün içinde ödeme yapılacaktır.

3. ÇALIŞMA SÜRESİ: Belirtilen iş programına göre arazi çalışmaları süresi teklif kapsamında belirtilmiştir.

4. RAPOR TESLİM SÜRESİ: Arazi çalışmaları tamamlandıktan sonra 30 (otuz) iş günü içerisinde nihai rapor teslim edilecektir.

5. ULAŞIM / KONAKLAMA: Çalışma ekibinin çalışma sahasına ulaşımı ve konaklama ihtiyaçları tarafımızca karşılanacaktır.

6. DİĞER ŞARTLAR: Teklif kapsamında yapılmayacak işler ve özel koşullar ayrıca belirtilmemiştir. İSG, sigorta ve resmi kurum izinleri ilgili mevzuat çerçevesinde yürütülür.`;

  const DEFAULT_WORKFLOW = [
    "Ön Hazırlık ve Alan Belirleme",
    "Koordinat ve Harita Hazırlığı",
    "Jeolojik ve Hidrojeolojik Arazi Etütleri",
    "Jeokimyasal Numune Alımı ve Analizler",
    "Jeofizik Etütler",
    "Veri Entegrasyonu ve Değerlendirme",
    "Sondaj Öncesi İzin Süreçleri ÇDP Kurum İzinleri",
    "ÇED İşlemleri",
    "Sondaj Aşaması (Jeotermal ve Kaynak Suyu)",
  ];

  const defaultServices = [
    ["srv-1", "Kurum müracaatları resmi işlemler", "Diğer"],
    ["srv-2", "ÇED işlemleri", "Diğer"],
    ["srv-3", "Teknik nezaretçilik, sorumluluk", "Diğer"],
    ["srv-4", "Jeotermal kaynak, mineralli su, gaz CO₂ ve doğal kaynak ruhsatı projesi ve eklerinin hazırlanması", "Diğer"],
    ["srv-5", "Lokasyon belirleme", "Diğer"],
    ["srv-6", "Alan sınırlarının GPS ile işaretlenmesi", "Diğer"],
    ["srv-7", "1/25.000 ölçekli, 1/5.000 ölçekli, 1/1.000 ölçekli onaylı harita", "Diğer"],
    ["srv-8", "Koordinat ve harita hazırlığı", "Diğer"],
    ["srv-9", "Su kimyası (Sıcaklık, pH, Tuzluluk, Elektriksel İletkenlik, Toplam Sertlik, Ca, Mg, Na, K, CO3, HCO3, Cl, SO4, SiO2, NH4, NO2, NO3, PO4, B, I, F, Fe, Mn, Pb, Zn, As, Ni, Cd, Mo, Cr, Cu)", "Analiz"],
    ["srv-10", "Su numuneleri analizi", "Analiz"],
    ["srv-11", "Toprak Gazları (CO2, H2S, CH4, N2, O2, CO, LEL, Rn, Tn)", "Analiz"],
    ["srv-12", "Jeofizik çalışmaları DES-MT-SP (Düşey Elektrik Sondaj, Manyetotellurik ve Self Potansiyel çalışmaları)", "Jeofizik"],
  ].map(([id, name, category]) => ({
    id,
    name,
    description: "",
    unit: "Adet",
    category,
    price: 0,
    vat: 20,
    active: true,
  }));

  function isoDate(offsetDays = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  }

  const seedState = {
    settings: { defaultVat: 20, validityDays: 30 },
    companies: [
      {
        id: "company-sidra",
        name: "SİDRA MADENCİLİK ENERJİ SAN. VE TİC. A.Ş.",
        subtitle: "JEOFİZİK - JEOLOJİ HİZMETLERİ",
        address: "Konya",
        phone: "",
        email: "jeofizikhizmetleri@gmail.com",
        website: "",
        taxOffice: "",
        taxNo: "",
        bank: "",
        iban: "",
        footer: "Jeofizik ve jeoloji hizmetlerinde güvenilir çözüm ortağınız.",
        logo: "",
        isDefault: true,
      },
      {
        id: "company-evren",
        name: "Evren Jeofizik Hiz. ve Tek. Tic. Ltd. Şti.",
        subtitle: "JEOFİZİK - JEOLOJİ HİZMETLERİ",
        address: "Konya",
        phone: "",
        email: "",
        website: "www.evrenjeofizik.com",
        taxOffice: "",
        taxNo: "",
        bank: "",
        iban: "",
        footer: "Evren Jeofizik Hiz. ve Tek. Tic. Ltd. Şti.",
        logo: EVREN_LOGO_URL,
        isDefault: false,
      },
    ],
    customers: [
      {
        id: "customer-limosa",
        company: "Limosa Medikal İthalat İhracat ve Ticaret Ltd. Şti.",
        contact: "Ukkaşe Çap",
        phone: "0 (212) 323 24 34",
        email: "info@limosa.com.tr",
        address: "",
        taxOffice: "",
        taxNo: "",
        notes: "",
      },
    ],
    services: defaultServices,
    quotes: [
      {
        id: "quote-123",
        no: "123",
        date: "2026-08-18",
        validUntil: "2026-09-17",
        companyId: "company-sidra",
        customerId: "customer-limosa",
        customer: "Limosa Medikal İthalat İhracat ve Ticaret Ltd. Şti.",
        contact: "Ukkaşe Çap",
        phone: "0 (212) 323 24 34",
        email: "info@limosa.com.tr",
        project: "",
        location: "Konya",
        province: "Konya",
        district: "",
        neighborhood: "",
        licenseNo: "",
        licenseOwner: "",
        status: "Taslak",
        items: [],
        description: DEFAULT_DESCRIPTION,
        notes: "",
        workflow: [...DEFAULT_WORKFLOW],
        images: [],
      },
      {
        id: "quote-ej-2026-0003",
        no: "EJ-2026-0003",
        date: "2026-08-14",
        validUntil: "2026-09-13",
        companyId: "company-evren",
        customerId: "customer-limosa",
        customer: "Limosa Medikal İthalat İhracat ve Ticaret Ltd. Şti.",
        contact: "Ukkaşe Çap",
        phone: "0 (212) 323 24 34",
        email: "info@limosa.com.tr",
        project: "Jeofizik Araştırma Hizmetleri",
        location: "Konya",
        province: "Konya",
        district: "",
        neighborhood: "",
        licenseNo: "",
        licenseOwner: "",
        status: "Taslak",
        items: [{ id: "item-1", serviceId: "srv-12", name: defaultServices[11].name, unit: "Adet", quantity: 1, price: 1100000, vat: 20 }],
        description: DEFAULT_DESCRIPTION,
        notes: "",
        workflow: [...DEFAULT_WORKFLOW],
        images: [],
      },
      {
        id: "quote-tkl-211827",
        no: "TKL-211827",
        date: "2026-07-14",
        validUntil: "2026-08-13",
        companyId: "company-evren",
        customerId: "",
        customer: "Seydişehir Belediye Başkanlığı",
        contact: "",
        phone: "",
        email: "",
        project: "Jeotermal Kaynak Araştırması",
        location: "Seydişehir / Konya",
        province: "Konya",
        district: "Seydişehir",
        neighborhood: "",
        licenseNo: "",
        licenseOwner: "",
        status: "Taslak",
        items: [{ id: "item-2", serviceId: "srv-12", name: defaultServices[11].name, unit: "Adet", quantity: 1, price: 1407500, vat: 20 }],
        description: DEFAULT_DESCRIPTION,
        notes: "",
        workflow: [...DEFAULT_WORKFLOW],
        images: [],
      },
      {
        id: "quote-tkl-899131",
        no: "TKL-899131",
        date: "2026-06-08",
        validUntil: "2026-07-08",
        companyId: "company-sidra",
        customerId: "",
        customer: "Özyapıcılar İnş. Tic. ve San. Ltd. Şti.",
        contact: "",
        phone: "",
        email: "",
        project: "Jeolojik ve Jeofizik Etütler",
        location: "",
        province: "",
        district: "",
        neighborhood: "",
        licenseNo: "",
        licenseOwner: "",
        status: "Taslak",
        items: [{ id: "item-3", serviceId: "srv-12", name: defaultServices[11].name, unit: "Adet", quantity: 1, price: 7483800, vat: 20 }],
        description: DEFAULT_DESCRIPTION,
        notes: "",
        workflow: [...DEFAULT_WORKFLOW],
        images: [],
      },
      {
        id: "quote-tkl-420983",
        no: "TKL-420983",
        date: "2026-06-09",
        validUntil: "2026-07-09",
        companyId: "company-sidra",
        customerId: "",
        customer: "JEOTERMAL KAYNAK BİTKİSEL ÜRETİM AMAÇLI TARIMA DAYALI İHTİSAS OSB",
        contact: "",
        phone: "",
        email: "",
        project: "Jeotermal Kaynak Araştırma Projesi",
        location: "",
        province: "",
        district: "",
        neighborhood: "",
        licenseNo: "",
        licenseOwner: "",
        status: "Onaylandı",
        items: [{ id: "item-4", serviceId: "srv-12", name: defaultServices[11].name, unit: "Adet", quantity: 1, price: 24931400, vat: 20 }],
        description: DEFAULT_DESCRIPTION,
        notes: "",
        workflow: [...DEFAULT_WORKFLOW],
        images: [],
      },
    ],
  };

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved?.quotes && saved?.customers && saved?.services && saved?.companies) {
        const evrenCompany = saved.companies.find((company) => company.id === "company-evren" || company.name?.includes("Evren Jeofizik"));
        if (evrenCompany && !evrenCompany.logo) evrenCompany.logo = EVREN_LOGO_URL;
        return saved;
      }
    } catch (error) {
      console.warn("Kayıtlı veri okunamadı", error);
    }
    return deepClone(seedState);
  }

  let state = loadState();
  let ui = {
    sidebarOpen: false,
    modal: null,
    quoteTab: "info",
    quoteDraft: null,
    quoteSearch: "",
    quoteStatus: "",
    advanced: false,
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
    customerSearch: "",
    catalogSearch: "",
  };

  const app = document.getElementById("app");
  const toastRoot = document.getElementById("toast-root");

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      toast("Tarayıcı depolama alanı doldu. Büyük görselleri azaltmayı deneyin.", "error");
      console.error(error);
    }
  }

  function uid(prefix = "id") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function money(value, dashZero = false) {
    const number = Number(value || 0);
    if (dashZero && number === 0) return "—";
    return `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number)} TL`;
  }

  function dateLong(value = new Date()) {
    const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" }).format(date);
  }

  function dateShort(value) {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
  }

  function quoteTotals(quote) {
    const subtotal = (quote.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
    const vat = (quote.items || []).reduce((sum, item) => {
      const base = Number(item.quantity || 0) * Number(item.price || 0);
      return sum + base * Number(item.vat || 0) / 100;
    }, 0);
    return { subtotal, vat, total: subtotal + vat };
  }

  function initials(value = "") {
    return value.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toLocaleUpperCase("tr-TR") || "EJ";
  }

  const iconPaths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 5.5v14A2.5 2.5 0 0 0 6.5 22H20"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.37.34.71.6 1 .3.3.69.5 1.1.6h.09v4h-.09a1.7 1.7 0 0 0-1.7.4z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    reject: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/>',
    building: '<path d="M3 21h18M6 21V3h12v18M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
    arrowLeft: '<path d="m15 18-6-6 6-6"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
  };

  function icon(name, size = 18, className = "") {
    return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.file}</svg>`;
  }

  function brandMark() {
    return `<div class="brand-mark" aria-hidden="true"><img src="${EVREN_LOGO_URL}" alt="" /></div>`;
  }

  function toast(message, type = "") {
    toastRoot.innerHTML = `<div class="toast ${type}">${icon(type === "error" ? "reject" : "check", 18)}<span>${escapeHtml(message)}</span></div>`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toastRoot.innerHTML = ""; }, 3200);
  }

  function pathInfo() {
    const route = (window.location.hash || "").startsWith("#/")
      ? window.location.hash.slice(1)
      : window.location.pathname;
    const path = route.replace(/\/$/, "") || "/";
    const quoteMatch = path.match(/^\/quotes\/([^/]+)(?:\/(edit))?$/);
    return { path, quoteMatch };
  }

  function routeHref(path) {
    return `/#${path}`;
  }

  function pathFromHref(href) {
    const hashIndex = href.indexOf("#");
    return hashIndex >= 0 ? (href.slice(hashIndex + 1) || "/") : href;
  }

  function navigate(path) {
    history.pushState({}, "", routeHref(path));
    ui.sidebarOpen = false;
    ui.modal = null;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navActive(href, path) {
    if (href === "/") return path === "/";
    return path.startsWith(href);
  }

  function shell(content, currentPath) {
    const navItems = [
      ["/", "dashboard", "Ana Panel"],
      ["/quotes", "file", "Teklifler"],
      ["/customers", "users", "Müşteriler"],
      ["/catalog", "book", "Hizmet Kataloğu"],
      ["/settings", "settings", "Ayarlar"],
    ];
    return `
      <div class="app-shell">
        <aside class="sidebar ${ui.sidebarOpen ? "open" : ""}">
          <a href="${routeHref("/")}" class="brand" data-nav>
            ${brandMark()}
            <div class="brand-copy">
              <p class="brand-name">EVREN JEOFİZİK</p>
              <p class="brand-subtitle">JEOFİZİK - JEOLOJİ HİZ.</p>
            </div>
          </a>
          <button class="sidebar-primary" data-action="new-quote">${icon("plus", 17)} Yeni Teklif</button>
          <nav class="nav-list" aria-label="Ana menü">
            ${navItems.map(([href, iconName, label]) => `
              <a href="${routeHref(href)}" data-nav class="nav-link ${navActive(href, currentPath) ? "active" : ""}">
                ${icon(iconName, 17)}<span>${label}</span>${navActive(href, currentPath) ? icon("chevron", 14, "nav-arrow") : ""}
              </a>`).join("")}
          </nav>
          <div class="sidebar-footer">
            <button class="logout-button" data-action="logout">${icon("logout", 16)} Çıkış Yap</button>
          </div>
        </aside>
        <div class="sidebar-scrim ${ui.sidebarOpen ? "open" : ""}" data-action="close-sidebar"></div>
        <div class="main-wrap">
          <header class="mobile-topbar">
            <button class="icon-button" data-action="toggle-sidebar" aria-label="Menüyü aç">${icon("menu", 21)}</button>
            <a href="${routeHref("/")}" data-nav class="mobile-brand">${brandMark()}<span>EVREN JEOFİZİK</span></a>
            <button class="icon-button" data-action="new-quote" aria-label="Yeni teklif">${icon("plus", 21)}</button>
          </header>
          ${content}
        </div>
      </div>
      ${renderModal()}`;
  }

  function pageHeader(title, subtitle, actions = "") {
    return `<header class="page-header">
      <div class="page-heading"><h1 class="page-title">${title}</h1>${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ""}</div>
      ${actions ? `<div class="header-actions">${actions}</div>` : ""}
    </header>`;
  }

  function statusClass(status) {
    return ({ "Gönderildi": "sent", "Onaylandı": "approved", "Reddedildi": "rejected", "İptal": "cancelled" })[status] || "";
  }

  function quoteTable(quotes, compact = false) {
    if (!quotes.length) return `<div class="empty-state"><div><div class="empty-state-icon">${icon("file", 25)}</div><strong>Teklif bulunamadı</strong><p>Arama ölçütlerini değiştirin veya yeni bir teklif oluşturun.</p></div></div>`;
    return `<div class="table-wrap"><table class="data-table">
      <thead><tr>
        <th>Teklif No</th><th>Tarih</th><th>Müşteri</th>${compact ? "" : "<th>Proje</th><th>Proje Yeri</th>"}<th>Tutar</th><th>Durum</th><th>İşlemler</th>
      </tr></thead>
      <tbody>${quotes.map((quote) => {
        const total = quoteTotals(quote).total;
        return `<tr>
          <td><span class="table-id"><span class="table-id-mark">${icon("file", 14)}</span><strong>${escapeHtml(quote.no)}</strong></span></td>
          <td class="muted-cell">${escapeHtml(quote.date)}</td>
          <td><span class="table-customer"><span class="table-avatar">${escapeHtml(initials(quote.customer))}</span><span class="truncate-cell" title="${escapeHtml(quote.customer)}">${escapeHtml(quote.customer || "—")}</span></span></td>
          ${compact ? "" : `<td><span class="truncate-cell" title="${escapeHtml(quote.project)}">${escapeHtml(quote.project || "—")}</span></td><td><span class="truncate-cell">${escapeHtml(quote.location || "—")}</span></td>`}
          <td class="amount-cell">${money(total, true)}</td>
          <td><span class="status-pill ${statusClass(quote.status)}">${escapeHtml(quote.status)}</span></td>
          <td><div class="row-actions">
            <a class="icon-button" href="${routeHref(`/quotes/${quote.id}`)}" data-nav title="Görüntüle" aria-label="Görüntüle">${icon("eye", 15)}</a>
            <a class="icon-button" href="${routeHref(`/quotes/${quote.id}/edit`)}" data-nav title="Düzenle" aria-label="Düzenle">${icon("edit", 15)}</a>
            <button class="icon-button" data-action="print-quote" data-id="${quote.id}" title="PDF / Yazdır" aria-label="PDF / Yazdır">${icon("download", 15)}</button>
            <button class="icon-button" data-action="copy-quote" data-id="${quote.id}" title="Kopyala" aria-label="Kopyala">${icon("copy", 15)}</button>
            <button class="icon-button danger" data-action="delete-quote" data-id="${quote.id}" title="Sil" aria-label="Sil">${icon("trash", 15)}</button>
          </div></td>
        </tr>`;
      }).join("")}</tbody>
    </table></div>`;
  }

  function renderDashboard() {
    const total = state.quotes.length;
    const count = (status) => state.quotes.filter((quote) => quote.status === status).length;
    const approvedTotal = state.quotes
      .filter((quote) => quote.status === "Onaylandı")
      .reduce((sum, quote) => sum + quoteTotals(quote).total, 0);
    const now = new Date();
    const monthly = state.quotes.filter((quote) => {
      const date = new Date(`${quote.date}T12:00:00`);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }).length;
    const activeQuotes = state.quotes.filter((quote) => !["Reddedildi", "İptal"].includes(quote.status));
    const activeValue = activeQuotes.reduce((sum, quote) => sum + quoteTotals(quote).total, 0);
    const conversion = total ? Math.round((count("Onaylandı") / total) * 100) : 0;
    const actions = `<button class="btn btn-primary" data-action="new-quote">${icon("plus", 17)} Yeni Teklif</button>`;
    const stats = [
      ["file", "neutral", total, "Toplam Teklif", `${monthly} teklif bu ay`],
      ["file", "amber", count("Taslak"), "Hazırlanan Taslak", "Düzenlenmeyi bekliyor"],
      ["send", "blue", count("Gönderildi"), "Müşteriye Gönderildi", "Yanıt bekleniyor"],
      ["check", "green", count("Onaylandı"), "Kazanılan Teklif", `%${conversion} dönüşüm`],
    ];
    return `<main class="page">
      ${pageHeader("Teklif Merkezi", `Evren Jeofizik · ${dateLong()}`, actions)}
      <section class="dashboard-hero">
        <div class="hero-copy">
          <span class="eyebrow">JEOFİZİK & JEOLOJİ HİZMETLERİ</span>
          <h2>Tekliflerinizi güvenle yönetin.</h2>
          <p>Müşteri taleplerinden fiyatlandırmaya, teklif hazırlığından PDF çıktısına kadar tüm süreç tek ekranda.</p>
          <div class="hero-actions">
            <button class="btn btn-primary" data-action="new-quote">${icon("plus", 16)} Yeni teklif hazırla</button>
            <a class="btn btn-hero-secondary" href="${routeHref("/quotes")}" data-nav>${icon("file", 15)} Tüm teklifler</a>
          </div>
        </div>
        <div class="hero-summary" aria-label="Aktif teklif portföyü">
          <div class="hero-summary-top"><span>Aktif teklif portföyü</span><span class="live-dot">Güncel</span></div>
          <strong>${money(activeValue)}</strong>
          <div class="hero-summary-grid">
            <div><span>Açık teklif</span><b>${activeQuotes.length}</b></div>
            <div><span>Bu ay</span><b>${monthly}</b></div>
            <div><span>Başarı</span><b>%${conversion}</b></div>
          </div>
        </div>
      </section>
      <section class="stats-grid" aria-label="Teklif istatistikleri">
        ${stats.map(([iconName, color, value, label, hint]) => `<article class="stat-card">
          <div class="stat-icon ${color}">${icon(iconName, 20)}</div>
          <div class="stat-content"><p class="stat-value">${value}</p><p class="stat-label">${label}</p><span class="stat-hint">${hint}</span></div>
        </article>`).join("")}
      </section>
      <section class="dashboard-finance-grid">
        <article class="finance-card">
          <div class="finance-card-icon">${icon("trend", 22)}</div>
          <div><span>Onaylanan toplam değer</span><strong>${money(approvedTotal)}</strong><small>Kazanılan tekliflerin KDV dahil toplamı</small></div>
        </article>
        <article class="mini-insight-card"><span class="mini-insight-icon">${icon("calendar", 19)}</span><div><strong>${monthly}</strong><span>Bu ay oluşturulan</span></div></article>
        <article class="mini-insight-card"><span class="mini-insight-icon red">${icon("reject", 19)}</span><div><strong>${count("Reddedildi")}</strong><span>Reddedilen teklif</span></div></article>
      </section>
      <section class="card">
        <div class="card-header"><div><span class="card-kicker">SON HAREKETLER</span><h2 class="card-title">Güncel Teklifler</h2></div><a href="${routeHref("/quotes")}" data-nav class="link-accent">Tümünü görüntüle ${icon("chevron", 14)}</a></div>
        ${quoteTable([...state.quotes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), true)}
      </section>
    </main>`;
  }

  function filteredQuotes() {
    const query = ui.quoteSearch.trim().toLocaleLowerCase("tr-TR");
    return [...state.quotes]
      .filter((quote) => {
        const total = quoteTotals(quote).total;
        const haystack = [quote.no, quote.customer, quote.contact, quote.project, quote.location].join(" ").toLocaleLowerCase("tr-TR");
        if (query && !haystack.includes(query)) return false;
        if (ui.quoteStatus && quote.status !== ui.quoteStatus) return false;
        if (ui.dateFrom && quote.date < ui.dateFrom) return false;
        if (ui.dateTo && quote.date > ui.dateTo) return false;
        if (ui.minAmount !== "" && total < Number(ui.minAmount)) return false;
        if (ui.maxAmount !== "" && total > Number(ui.maxAmount)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function renderQuotes() {
    const quotes = filteredQuotes();
    const actions = `<button class="btn btn-primary" data-action="new-quote">${icon("plus", 17)} Yeni Teklif</button>`;
    return `<main class="page">
      ${pageHeader("Teklifler", `${quotes.length} teklif listeleniyor`, actions)}
      <div class="toolbar">
        <label class="search-field">${icon("search", 17)}<input class="input" data-filter="quote-search" value="${escapeHtml(ui.quoteSearch)}" placeholder="Teklif no, firma, yetkili, proje veya proje yeri ara..." /></label>
        <select class="select" data-filter="quote-status" aria-label="Teklif durumu">
          ${["", "Taslak", "Gönderildi", "Onaylandı", "Reddedildi", "İptal"].map((status) => `<option value="${status}" ${ui.quoteStatus === status ? "selected" : ""}>${status || "Tüm Durumlar"}</option>`).join("")}
        </select>
        <button class="btn ${ui.advanced ? "btn-dark" : ""}" data-action="toggle-advanced">${icon("filter", 15)} Gelişmiş</button>
      </div>
      ${ui.advanced ? `<div class="advanced-filters">
        ${filterField("Tarih (Başlangıç)", "date", "date-from", ui.dateFrom)}
        ${filterField("Tarih (Bitiş)", "date", "date-to", ui.dateTo)}
        ${filterField("Min. Tutar", "number", "min-amount", ui.minAmount)}
        ${filterField("Maks. Tutar", "number", "max-amount", ui.maxAmount)}
        <button class="btn" data-action="clear-filters">Filtreleri Temizle</button>
      </div>` : ""}
      <section class="card">${quoteTable(quotes)}</section>
    </main>`;
  }

  function filterField(label, type, name, value) {
    return `<label class="field"><span class="field-label">${label}</span><input class="input" type="${type}" data-filter="${name}" value="${escapeHtml(value)}" ${type === "number" ? 'min="0"' : ""} /></label>`;
  }

  function customerQuoteCount(customer) {
    return state.quotes.filter((quote) => quote.customerId === customer.id || quote.customer === customer.company).length;
  }

  function renderCustomers() {
    const query = ui.customerSearch.trim().toLocaleLowerCase("tr-TR");
    const customers = state.customers.filter((customer) => [customer.company, customer.contact, customer.phone, customer.email].join(" ").toLocaleLowerCase("tr-TR").includes(query));
    const actions = `<button class="btn btn-primary" data-action="add-customer">${icon("plus", 17)} Yeni Müşteri</button>`;
    return `<main class="page">
      ${pageHeader("Müşteriler", `${state.customers.length} müşteri kayıtlı`, actions)}
      <div class="toolbar" style="grid-template-columns:minmax(280px, 520px)">
        <label class="search-field">${icon("search", 17)}<input class="input" data-filter="customer-search" value="${escapeHtml(ui.customerSearch)}" placeholder="Firma, yetkili, telefon veya e-posta ara..." /></label>
      </div>
      ${customers.length ? `<section class="customer-grid">${customers.map((customer) => `<article class="customer-card">
        <div class="customer-card-top">
          <div class="avatar">${escapeHtml(initials(customer.company))}</div>
          <div style="min-width:0;flex:1">
            <h3>${escapeHtml(customer.company)}</h3>
            <div class="customer-meta">
              ${customer.contact ? `<div class="meta-row">${icon("person", 14)}<span>${escapeHtml(customer.contact)}</span></div>` : ""}
              ${customer.phone ? `<div class="meta-row">${icon("phone", 14)}<span>${escapeHtml(customer.phone)}</span></div>` : ""}
              ${customer.email ? `<div class="meta-row">${icon("mail", 14)}<span>${escapeHtml(customer.email)}</span></div>` : ""}
            </div>
            <span class="customer-count">${customerQuoteCount(customer)} teklif</span>
          </div>
        </div>
        <div class="card-corner-actions">
          <button class="icon-button" data-action="edit-customer" data-id="${customer.id}" title="Düzenle">${icon("edit", 15)}</button>
          <button class="icon-button danger" data-action="delete-customer" data-id="${customer.id}" title="Sil">${icon("trash", 15)}</button>
        </div>
      </article>`).join("")}</section>` : `<div class="card empty-state"><div><div class="empty-state-icon">${icon("users", 25)}</div><strong>Müşteri bulunamadı</strong><p>Aramayı değiştirin veya yeni müşteri ekleyin.</p></div></div>`}
    </main>`;
  }

  function renderCatalog() {
    const query = ui.catalogSearch.trim().toLocaleLowerCase("tr-TR");
    const services = state.services.filter((service) => [service.name, service.category, service.description].join(" ").toLocaleLowerCase("tr-TR").includes(query));
    const groups = services.reduce((acc, service) => {
      (acc[service.category || "Diğer"] ||= []).push(service);
      return acc;
    }, {});
    const actions = `<button class="btn btn-primary" data-action="add-service">${icon("plus", 17)} Yeni Hizmet</button>`;
    return `<main class="page">
      ${pageHeader("Jeofizik Hizmet Kataloğu", "Teklif oluştururken seçilecek jeofizik hizmetleri", actions)}
      <div class="toolbar" style="grid-template-columns:minmax(280px, 520px)">
        <label class="search-field">${icon("search", 17)}<input class="input" data-filter="catalog-search" value="${escapeHtml(ui.catalogSearch)}" placeholder="Hizmet veya kategori ara..." /></label>
      </div>
      ${Object.entries(groups).map(([category, items]) => `<section>
        <div class="section-title-row"><h2 class="section-title">${escapeHtml(category)}</h2><span class="count-badge">${items.length} hizmet</span></div>
        <div class="card"><div class="table-wrap"><table class="data-table">
          <thead><tr><th>Hizmet</th><th>Birim</th><th>Fiyat</th><th>KDV</th><th>Aktif</th><th></th></tr></thead>
          <tbody>${items.map((service) => `<tr>
            <td><strong class="truncate-cell" title="${escapeHtml(service.name)}">${escapeHtml(service.name)}</strong>${service.description ? `<small class="muted-cell truncate-cell">${escapeHtml(service.description)}</small>` : ""}</td>
            <td>${escapeHtml(service.unit)}</td><td class="amount-cell">${money(service.price, true)}</td><td>%${Number(service.vat || 0)}</td>
            <td><label class="switch" title="Aktif/Pasif"><input type="checkbox" data-action="toggle-service" data-id="${service.id}" ${service.active ? "checked" : ""}/><span class="switch-track"></span></label></td>
            <td><div class="row-actions"><button class="icon-button" data-action="edit-service" data-id="${service.id}">${icon("edit", 15)}</button><button class="icon-button danger" data-action="delete-service" data-id="${service.id}">${icon("trash", 15)}</button></div></td>
          </tr>`).join("")}</tbody>
        </table></div></div>
      </section>`).join("") || `<div class="card empty-state"><div><strong>Hizmet bulunamadı</strong></div></div>`}
    </main>`;
  }

  function companyLogo(company) {
    return company.logo ? `<div class="company-logo"><img src="${company.logo}" alt="${escapeHtml(company.name)}" /></div>` : `<div class="company-logo">${escapeHtml(initials(company.name))}</div>`;
  }

  function renderSettings() {
    const actions = `<button class="btn btn-primary" data-action="add-company">${icon("plus", 17)} Firma Ekle</button>`;
    return `<main class="page">
      ${pageHeader("Ayarlar", "Firma bilgileri ve teklif varsayılanları", actions)}
      <section class="card settings-card">
        <h2 class="section-title" style="margin:0 0 8px">Firmalar</h2>
        <p class="settings-copy">Teklif oluştururken listeden firma seçebilirsiniz. Varsayılan firma yeni tekliflerde otomatik seçilir. PDF çıktıları seçili firmanın bilgilerini kullanır.</p>
        <div class="company-grid">${state.companies.map((company) => `<article class="company-card ${company.isDefault ? "default" : ""}">
          <div class="company-card-top">${companyLogo(company)}<div style="min-width:0;flex:1">
            <h3>${escapeHtml(company.name)}${company.isDefault ? '<span class="default-badge">Varsayılan</span>' : ""}</h3>
            <div class="company-meta">
              ${company.subtitle ? `<div class="meta-row"><span>${escapeHtml(company.subtitle)}</span></div>` : ""}
              ${company.email ? `<div class="meta-row">${icon("mail", 14)}<span>${escapeHtml(company.email)}</span></div>` : ""}
              ${company.website ? `<div class="meta-row">${icon("building", 14)}<span>${escapeHtml(company.website)}</span></div>` : ""}
            </div>
            ${company.isDefault ? "" : `<button class="btn btn-sm" style="margin-top:13px" data-action="default-company" data-id="${company.id}">Varsayılan yap</button>`}
          </div></div>
          <div class="card-corner-actions"><button class="icon-button" data-action="edit-company" data-id="${company.id}">${icon("edit", 15)}</button><button class="icon-button danger" data-action="delete-company" data-id="${company.id}">${icon("trash", 15)}</button></div>
        </article>`).join("")}</div>
      </section>
      <section class="card settings-card">
        <h2 class="section-title" style="margin:0 0 18px">Teklif Varsayılanları</h2>
        <form id="defaults-form" class="settings-form-grid">
          <label class="field"><span class="field-label">Varsayılan KDV Oranı (%)</span><input class="input" name="defaultVat" type="number" min="0" max="100" value="${Number(state.settings.defaultVat)}" /></label>
          <label class="field"><span class="field-label">Varsayılan Geçerlilik Süresi (Gün)</span><input class="input" name="validityDays" type="number" min="1" value="${Number(state.settings.validityDays)}" /></label>
          <button class="btn btn-dark" type="submit">${icon("save", 15)} Kaydet</button>
        </form>
      </section>
      <section class="card settings-card">
        <h2 class="section-title" style="margin:0 0 8px">Yerel Veriler</h2>
        <p class="settings-copy">Bu sürüm verileri yalnızca bu tarayıcıda saklar. Örnek verilere dönmek isterseniz tüm yerel kayıtları sıfırlayabilirsiniz.</p>
        <button class="btn btn-danger" data-action="reset-data">${icon("refresh", 15)} Örnek Verilere Sıfırla</button>
      </section>
    </main>`;
  }

  function newQuoteDraft() {
    const company = state.companies.find((item) => item.isDefault) || state.companies[0];
    const validity = Number(state.settings.validityDays || 30);
    return {
      id: uid("quote"),
      no: `EJ-${new Date().getFullYear()}-${String(state.quotes.length + 1).padStart(4, "0")}`,
      date: isoDate(),
      validUntil: isoDate(validity),
      companyId: company?.id || "",
      customerId: "",
      customer: "",
      contact: "",
      phone: "",
      email: "",
      project: "",
      location: "",
      province: "",
      district: "",
      neighborhood: "",
      licenseNo: "",
      licenseOwner: "",
      status: "Taslak",
      items: [],
      description: DEFAULT_DESCRIPTION,
      notes: "",
      workflow: [...DEFAULT_WORKFLOW],
      images: [],
    };
  }

  function ensureDraft(quote = null) {
    if (!ui.quoteDraft || (quote && ui.quoteDraft.id !== quote.id)) {
      ui.quoteDraft = quote ? deepClone(quote) : newQuoteDraft();
      ui.quoteTab = "info";
    }
    return ui.quoteDraft;
  }

  function quoteField(label, name, value, placeholder = "", type = "text", full = false, required = false) {
    return `<label class="field ${full ? "full" : ""}"><span class="field-label">${label}${required ? " *" : ""}</span><input class="input" name="${name}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""}/></label>`;
  }

  function renderQuoteInfo(draft) {
    return `<div class="form-grid three">
      <label class="field full"><span class="field-label">Teklifi Veren Firma</span><select class="select" name="companyId">
        <option value="">Firma seçin</option>${state.companies.map((company) => `<option value="${company.id}" ${draft.companyId === company.id ? "selected" : ""}>${escapeHtml(company.name)}${company.isDefault ? " (Varsayılan)" : ""}</option>`).join("")}
      </select></label>
      ${quoteField("Teklif No", "no", draft.no, "Teklif numarasını girin", "text", false, true)}
      ${quoteField("Teklif Tarihi", "date", draft.date, "", "date")}
      ${quoteField("Geçerlilik Tarihi", "validUntil", draft.validUntil, "", "date")}
      <label class="field full"><span class="field-label">Kayıtlı Müşteriden Seç</span><select class="select" name="customerId">
        <option value="">Manuel giriş yapacağım</option>${state.customers.map((customer) => `<option value="${customer.id}" ${draft.customerId === customer.id ? "selected" : ""}>${escapeHtml(customer.company)}${customer.contact ? ` · ${escapeHtml(customer.contact)}` : ""}</option>`).join("")}
      </select></label>
      <h3 class="form-section-title full">Müşteri Bilgileri</h3>
      ${quoteField("Müşteri / Firma Adı", "customer", draft.customer, "Firma adını giriniz", "text", false, true)}
      ${quoteField("Yetkili Kişi", "contact", draft.contact, "Ad Soyad")}
      ${quoteField("Telefon", "phone", draft.phone, "0 5xx xxx xx xx")}
      ${quoteField("E-posta", "email", draft.email, "ornek@firma.com", "email")}
      ${quoteField("Proje Adı", "project", draft.project, "Proje / çalışma adı", "text", true)}
      <h3 class="form-section-title full">Proje Bilgileri</h3>
      ${quoteField("Proje Yeri", "location", draft.location, "İl / İlçe", "text", true)}
      <h3 class="form-section-title full">Çalışılacak Alan Bilgileri</h3>
      ${quoteField("İl", "province", draft.province, "İl")}
      ${quoteField("İlçe", "district", draft.district, "İlçe")}
      ${quoteField("Mahalle / Köy", "neighborhood", draft.neighborhood, "Mahalle / Köy")}
      ${quoteField("Ruhsat No", "licenseNo", draft.licenseNo, "Ruhsat No")}
      ${quoteField("Ruhsat Sahibi", "licenseOwner", draft.licenseOwner, "Ruhsat Sahibi", "text", true)}
    </div>`;
  }

  function renderQuoteItems(draft) {
    const catalog = state.services.filter((service) => service.active && service.name.toLocaleLowerCase("tr-TR").includes(ui.catalogSearch.toLocaleLowerCase("tr-TR")));
    const totals = quoteTotals(draft);
    return `<div class="catalog-picker">
      <section>
        <div class="workflow-toolbar"><h3 class="section-title">Katalogdan Hizmet Ekle</h3></div>
        <label class="search-field" style="display:block;margin-bottom:12px">${icon("search", 16)}<input class="input" data-filter="catalog-search-editor" value="${escapeHtml(ui.catalogSearch)}" placeholder="Hizmet ara..." /></label>
        <div class="catalog-list">${catalog.map((service) => `<button type="button" class="catalog-add" data-action="add-quote-service" data-id="${service.id}">
          <span class="catalog-add-copy"><span class="catalog-add-name">${escapeHtml(service.name)}</span><span class="catalog-add-meta">${escapeHtml(service.unit)} · ${service.price ? money(service.price) : "Fiyat girilecek"}</span></span><span class="catalog-add-action">+ Ekle</span>
        </button>`).join("")}</div>
      </section>
      <section>
        <div class="workflow-toolbar"><h3 class="section-title">Hizmet Kalemleri</h3><button type="button" class="btn btn-sm" data-action="manual-quote-item">${icon("plus", 14)} Manuel Kalem</button></div>
        ${draft.items.length ? `<div class="table-wrap"><table class="data-table quote-items-table">
          <thead><tr><th>Hizmet</th><th>Birim</th><th>Adet</th><th>Birim Fiyat</th><th>KDV</th><th></th></tr></thead>
          <tbody>${draft.items.map((item, index) => `<tr>
            <td><input class="input" data-item-index="${index}" data-item-field="name" value="${escapeHtml(item.name)}" /></td>
            <td><input class="input" data-item-index="${index}" data-item-field="unit" value="${escapeHtml(item.unit)}" /></td>
            <td><input class="input" type="number" min="0" step="0.01" data-item-index="${index}" data-item-field="quantity" value="${Number(item.quantity)}" /></td>
            <td><input class="input" type="number" min="0" step="0.01" data-item-index="${index}" data-item-field="price" value="${Number(item.price)}" /></td>
            <td><input class="input" type="number" min="0" max="100" data-item-index="${index}" data-item-field="vat" value="${Number(item.vat)}" /></td>
            <td><button type="button" class="icon-button danger" data-action="remove-quote-item" data-index="${index}">${icon("trash", 15)}</button></td>
          </tr>`).join("")}</tbody>
        </table></div>` : `<div class="empty-state" style="min-height:190px;border:1px dashed var(--line-dark);border-radius:9px"><div>Henüz hizmet eklenmedi.<br/><small>Katalogdan seçin veya manuel kalem ekleyin.</small></div></div>`}
        <div class="quote-summary">
          <div class="summary-row"><span>Ara Toplam (KDV Hariç)</span><strong>${money(totals.subtotal)}</strong></div>
          <div class="summary-row"><span>KDV</span><strong>${money(totals.vat)}</strong></div>
          <div class="summary-row total"><span>GENEL TOPLAM</span><strong>${money(totals.total)}</strong></div>
        </div>
      </section>
    </div>`;
  }

  function renderQuoteNotes(draft) {
    return `<div class="form-grid">
      <label class="field full"><span class="form-section-title" style="margin:0">Açıklama</span><textarea class="textarea" name="description" style="min-height:320px" placeholder="Teklif ile ilgili açıklamalar...">${escapeHtml(draft.description)}</textarea></label>
      <label class="field full"><span class="form-section-title" style="margin:0">Notlar</span><textarea class="textarea" name="notes" placeholder="Ek notlar...">${escapeHtml(draft.notes)}</textarea></label>
    </div>`;
  }

  function renderQuoteWorkflow(draft) {
    return `<div>
      <div class="workflow-toolbar"><div><h3 class="section-title">İş Akışı</h3><p class="page-subtitle">PDF'de görünecek iş akışı adımları</p></div><button type="button" class="btn btn-sm" data-action="add-workflow">${icon("plus", 14)} Adım Ekle</button></div>
      <div class="table-wrap"><table class="data-table workflow-table"><thead><tr><th>No</th><th>İş Aşaması</th><th></th></tr></thead><tbody>
        ${draft.workflow.map((step, index) => `<tr><td><strong>${index + 1}</strong></td><td><input class="input" data-workflow-index="${index}" value="${escapeHtml(step)}" /></td><td><button type="button" class="icon-button danger" data-action="remove-workflow" data-index="${index}">${icon("trash", 15)}</button></td></tr>`).join("")}
      </tbody></table></div>
      <div class="section-title-row" style="margin-top:28px"><h3 class="section-title">Görseller</h3><label class="btn btn-sm">${icon("image", 15)} Resim Ekle<input class="sr-only" type="file" accept="image/*" multiple data-action="quote-images" /></label></div>
      <div class="image-upload-grid">${draft.images.length ? draft.images.map((imageUrl, index) => `<div class="image-upload" style="position:relative"><img src="${imageUrl}" alt="Teklif görseli ${index + 1}"/><button type="button" class="icon-button danger" data-action="remove-quote-image" data-index="${index}" style="position:absolute;top:5px;right:5px;background:#fff">${icon("trash", 14)}</button></div>`).join("") : `<div class="image-upload" style="grid-column:1/-1;cursor:default">${icon("image", 24)}<span>Henüz görsel eklenmedi</span></div>`}</div>
    </div>`;
  }

  function renderQuoteEditor(quote = null) {
    const isNew = !quote;
    const draft = ensureDraft(quote);
    const tabs = [
      ["info", "file", "Teklif Bilgileri"],
      ["items", "book", "Hizmet Kalemleri"],
      ["notes", "edit", "Açıklama & Notlar"],
      ["workflow", "trend", "İş Akışı"],
    ];
    const tabContent = ({ info: renderQuoteInfo, items: renderQuoteItems, notes: renderQuoteNotes, workflow: renderQuoteWorkflow })[ui.quoteTab](draft);
    const valid = draft.no.trim() && draft.customer.trim();
    return `<main class="page editor-shell">
      ${pageHeader(isNew ? "Yeni Teklif" : `Teklifi Düzenle · ${escapeHtml(draft.no)}`, isNew ? "Yeni fiyat teklifi oluşturun" : "Teklif bilgilerini ve hizmet kalemlerini güncelleyin")}
      <div class="editor-tabs">${tabs.map(([id, iconName, label]) => `<button type="button" class="editor-tab ${ui.quoteTab === id ? "active" : ""}" data-action="quote-tab" data-tab="${id}">${icon(iconName, 15)}${label}</button>`).join("")}</div>
      <form id="quote-form" class="card editor-card">
        ${tabContent}
        <div class="editor-footer">
          <button type="button" class="btn" data-action="cancel-quote">İptal</button>
          <button type="button" class="btn btn-dark" data-action="save-quote" data-status="Taslak" ${valid ? "" : "disabled"}>${icon("save", 15)} Taslak Kaydet</button>
          <button type="button" class="btn btn-primary" data-action="save-quote" data-status="Gönderildi" ${valid ? "" : "disabled"}>${icon("send", 15)} Kaydet & Gönder</button>
        </div>
      </form>
    </main>`;
  }

  function renderPrintQuote(quote) {
    const company = state.companies.find((item) => item.id === quote.companyId) || state.companies.find((item) => item.isDefault) || {};
    const totals = quoteTotals(quote);
    const location = quote.location || [quote.neighborhood, quote.district, quote.province].filter(Boolean).join(" / ") || "—";
    const companyContacts = [company.phone, company.email, company.website].filter(Boolean);
    return `<div class="detail-toolbar no-print">
      <a href="${routeHref("/quotes")}" data-nav class="back-link">${icon("arrowLeft", 16)} Tekliflere Dön</a>
      <div class="detail-status"><span class="status-pill ${statusClass(quote.status)}">${escapeHtml(quote.status)}</span></div>
      <div class="inline-actions"><a href="${routeHref(`/quotes/${quote.id}/edit`)}" data-nav class="btn">${icon("edit", 15)} Düzenle</a><button class="btn btn-primary" data-action="window-print">${icon("print", 15)} PDF Oluştur / Yazdır</button></div>
    </div>
    <article class="print-sheet">
      <div class="print-accent-bar"></div>
      <header class="print-header">
        <div class="print-brand">${companyLogo(company)}<div><span class="print-brand-kicker">JEOFİZİK · JEOLOJİ</span><h2>${escapeHtml(company.name || "Evren Jeofizik")}</h2><p>${escapeHtml(company.subtitle || "")}</p><p>${escapeHtml(company.address || "")}</p></div></div>
        <div class="print-document"><span>TEKLİF DOSYASI</span><h1>FİYAT TEKLİFİ</h1><div class="print-quote-number">${escapeHtml(quote.no)}</div></div>
      </header>
      <section class="print-intro-grid">
        <div class="print-party-card">
          <span class="print-card-label">TEKLİF SUNULAN</span>
          <h3>${escapeHtml(quote.customer || "—")}</h3>
          ${quote.contact ? `<p><b>Yetkili</b>${escapeHtml(quote.contact)}</p>` : ""}
          ${quote.phone ? `<p><b>Telefon</b>${escapeHtml(quote.phone)}</p>` : ""}
          ${quote.email ? `<p><b>E-posta</b>${escapeHtml(quote.email)}</p>` : ""}
        </div>
        <div class="print-project-card">
          <span class="print-card-label">PROJE / ÇALIŞMA</span>
          <h3>${escapeHtml(quote.project || "Jeofizik ve jeoloji hizmetleri")}</h3>
          <p><b>Çalışma alanı</b>${escapeHtml(location)}</p>
          ${quote.licenseNo ? `<p><b>Ruhsat no</b>${escapeHtml(quote.licenseNo)}</p>` : ""}
          ${quote.licenseOwner ? `<p><b>Ruhsat sahibi</b>${escapeHtml(quote.licenseOwner)}</p>` : ""}
        </div>
        <div class="print-date-card">
          <div><span>Teklif tarihi</span><strong>${escapeHtml(dateShort(quote.date))}</strong></div>
          <div><span>Geçerlilik tarihi</span><strong>${escapeHtml(dateShort(quote.validUntil))}</strong></div>
          <small>Fiyatlar belirtilen geçerlilik tarihine kadar geçerlidir.</small>
        </div>
      </section>
      <section class="print-section print-pricing-section">
        <div class="print-section-heading"><span>01</span><div><h3>Hizmet ve Fiyatlandırma</h3><p>Çalışma kapsamında sunulacak hizmet kalemleri</p></div></div>
        <table class="print-table"><thead><tr><th>#</th><th>Hizmet Açıklaması</th><th>Birim</th><th>Miktar</th><th>Birim Fiyat</th><th>KDV</th><th>Tutar</th></tr></thead><tbody>
          ${(quote.items.length ? quote.items : [{ name: "Hizmet kalemi girilmemiştir", unit: "—", quantity: 0, price: 0, vat: 0 }]).map((item, index) => `<tr><td><span class="item-index">${String(index + 1).padStart(2, "0")}</span></td><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.unit)}</td><td>${Number(item.quantity || 0)}</td><td class="numeric-cell">${money(item.price)}</td><td>%${Number(item.vat || 0)}</td><td class="numeric-cell"><strong>${money(Number(item.quantity || 0) * Number(item.price || 0))}</strong></td></tr>`).join("")}
        </tbody></table>
        <div class="print-totals"><div class="print-total-row"><span>Ara Toplam</span><strong>${money(totals.subtotal)}</strong></div><div class="print-total-row"><span>KDV</span><strong>${money(totals.vat)}</strong></div><div class="print-total-row grand"><span>GENEL TOPLAM</span><strong>${money(totals.total)}</strong></div><small>KDV dahil toplam teklif bedelidir.</small></div>
      </section>
      ${quote.workflow?.length ? `<section class="print-section"><div class="print-section-heading"><span>02</span><div><h3>Çalışma Planı</h3><p>Projenin uygulanma ve teslim aşamaları</p></div></div><div class="print-workflow">${quote.workflow.map((step, index) => `<div class="print-workflow-step"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(step)}</strong></div>`).join("")}</div></section>` : ""}
      ${quote.images?.length ? `<section class="print-section"><div class="print-section-heading"><span>03</span><div><h3>Proje Görselleri</h3><p>Çalışma alanı ve projeye ait ek görseller</p></div></div><div class="print-image-grid">${quote.images.map((imageUrl, index) => `<figure><img src="${imageUrl}" alt="Proje görseli ${index + 1}"/><figcaption>Görsel ${index + 1}</figcaption></figure>`).join("")}</div></section>` : ""}
      ${quote.description ? `<section class="print-section print-terms"><div class="print-section-heading"><span>${quote.images?.length ? "04" : "03"}</span><div><h3>Teklif Koşulları</h3><p>Geçerlilik, ödeme ve uygulama esasları</p></div></div><div class="print-copy">${escapeHtml(quote.description)}</div></section>` : ""}
      ${quote.notes ? `<section class="print-section print-note"><span>Ek Not</span><p>${escapeHtml(quote.notes)}</p></section>` : ""}
      <section class="print-approval">
        <div><span>TEKLİFİ HAZIRLAYAN</span><strong>${escapeHtml(company.name || "Evren Jeofizik")}</strong><p>Yetkili / Kaşe / İmza</p></div>
        <div><span>MÜŞTERİ ONAYI</span><strong>${escapeHtml(quote.customer || "Müşteri / Firma")}</strong><p>Ad Soyad / Kaşe / İmza</p></div>
      </section>
      <footer class="print-footer"><div><strong>${escapeHtml(company.footer || company.name || "Evren Jeofizik")}</strong><span>${escapeHtml(company.address || "")}</span></div>${companyContacts.length ? `<div class="print-contact-list">${companyContacts.map((contact) => `<span>${escapeHtml(contact)}</span>`).join("")}</div>` : ""}</footer>
    </article>`;
  }

  function renderQuoteDetail(quote) {
    if (!quote) return `<main class="page"><div class="card empty-state"><div><strong>Teklif bulunamadı.</strong><p><a href="${routeHref("/quotes")}" data-nav class="link-accent">Teklif listesine dön</a></p></div></div></main>`;
    return `<main class="page">${renderPrintQuote(quote)}</main>`;
  }

  function modalShell(title, body, footer, wide = false) {
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}" data-modal-panel>
      <header class="modal-header"><h2 class="modal-title">${escapeHtml(title)}</h2><button class="icon-button" data-action="close-modal" aria-label="Kapat">${icon("x", 19)}</button></header>
      <div class="modal-body">${body}</div>${footer ? `<footer class="modal-footer">${footer}</footer>` : ""}
    </section></div>`;
  }

  function renderModal() {
    const modal = ui.modal;
    if (!modal) return "";
    if (modal.type === "confirm") {
      const body = `<div style="display:flex;gap:15px;align-items:flex-start"><div class="empty-state-icon" style="flex:0 0 54px;margin:0;color:var(--danger);background:var(--danger-soft)">${icon("trash", 24)}</div><div><h3 style="margin:3px 0 8px">${escapeHtml(modal.heading)}</h3><p class="settings-copy" style="margin:0">${escapeHtml(modal.message)}</p></div></div>`;
      const footer = `<button class="btn" data-action="close-modal">İptal</button><button class="btn btn-danger" data-action="confirm-modal">${modal.confirmLabel || "Sil"}</button>`;
      return modalShell("Onay Gerekli", body, footer);
    }
    if (modal.type === "customer") {
      const customer = modal.id ? state.customers.find((item) => item.id === modal.id) : null;
      const value = customer || { company: "", contact: "", phone: "", email: "", address: "", taxOffice: "", taxNo: "", notes: "" };
      const body = `<form id="customer-form" class="form-grid">
        ${modalInput("Firma Adı", "company", value.company, true, true)}
        ${modalInput("Yetkili Kişi", "contact", value.contact)}
        ${modalInput("Telefon", "phone", value.phone)}
        ${modalInput("E-posta", "email", value.email, false, false, "email")}
        ${modalInput("Adres", "address", value.address, false, true)}
        ${modalInput("Vergi Dairesi", "taxOffice", value.taxOffice)}
        ${modalInput("Vergi No", "taxNo", value.taxNo)}
        <label class="field full"><span class="field-label">Notlar</span><textarea class="textarea" name="notes">${escapeHtml(value.notes)}</textarea></label>
      </form>`;
      const footer = `<button class="btn" data-action="close-modal">İptal</button><button class="btn btn-primary" data-action="submit-modal-form" data-form="customer-form">${icon("save", 15)} Kaydet</button>`;
      return modalShell(customer ? "Müşteriyi Düzenle" : "Yeni Müşteri", body, footer, true);
    }
    if (modal.type === "service") {
      const service = modal.id ? state.services.find((item) => item.id === modal.id) : null;
      const value = service || { name: "", description: "", unit: "Adet", category: "Diğer", price: 0, vat: state.settings.defaultVat, active: true };
      const body = `<form id="service-form" class="form-grid">
        ${modalInput("Hizmet Adı", "name", value.name, true, true)}
        <label class="field full"><span class="field-label">Açıklama</span><textarea class="textarea" name="description" placeholder="Hizmet açıklaması">${escapeHtml(value.description)}</textarea></label>
        ${modalInput("Birim", "unit", value.unit)}
        ${modalInput("Kategori", "category", value.category)}
        ${modalInput("Varsayılan Fiyat (TL)", "price", value.price, false, false, "number")}
        ${modalInput("KDV Oranı (%)", "vat", value.vat, false, false, "number")}
        <label class="checkbox-row full"><input type="checkbox" name="active" ${value.active ? "checked" : ""}/><span>Aktif hizmet</span></label>
      </form>`;
      const footer = `<button class="btn" data-action="close-modal">İptal</button><button class="btn btn-primary" data-action="submit-modal-form" data-form="service-form">${icon("save", 15)} Kaydet</button>`;
      return modalShell(service ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle", body, footer, true);
    }
    if (modal.type === "company") {
      const company = modal.id ? state.companies.find((item) => item.id === modal.id) : null;
      const value = company || { name: "", subtitle: "", address: "", phone: "", email: "", website: "", taxOffice: "", taxNo: "", bank: "", iban: "", footer: "", logo: "", isDefault: false };
      const logoValue = modal.logo ?? value.logo;
      const body = `<form id="company-form" class="form-grid">
        <div class="logo-upload full"><div class="logo-upload-preview">${logoValue ? `<img src="${logoValue}" alt="Logo önizleme"/>` : icon("image", 24)}</div><label class="btn btn-sm">${icon("image", 15)} Logo Yükle<input type="file" class="sr-only" accept="image/*" data-action="company-logo" /></label></div>
        ${modalInput("Firma Adı", "name", value.name, true, true)}
        ${modalInput("Alt Başlık / Slogan", "subtitle", value.subtitle, false, true)}
        ${modalInput("Adres", "address", value.address, false, true)}
        ${modalInput("Telefon", "phone", value.phone)}
        ${modalInput("E-posta", "email", value.email, false, false, "email")}
        ${modalInput("Web Sitesi", "website", value.website)}
        ${modalInput("Vergi Dairesi", "taxOffice", value.taxOffice)}
        ${modalInput("Vergi No", "taxNo", value.taxNo)}
        <h3 class="form-section-title full">Banka Bilgileri</h3>
        ${modalInput("Banka Bilgileri", "bank", value.bank)}
        ${modalInput("IBAN", "iban", value.iban)}
        <label class="field full"><span class="field-label">Teklif Alt Bilgi Metni</span><textarea class="textarea" name="footer" placeholder="PDF alt kısmında görünecek metin">${escapeHtml(value.footer)}</textarea></label>
        <label class="checkbox-row full"><input type="checkbox" name="isDefault" ${value.isDefault ? "checked" : ""}/><span>Varsayılan firma yap</span></label>
      </form>`;
      const footer = `<button class="btn" data-action="close-modal">İptal</button><button class="btn btn-primary" data-action="submit-modal-form" data-form="company-form">${icon("save", 15)} Kaydet</button>`;
      return modalShell(company ? "Firmayı Düzenle" : "Yeni Firma", body, footer, true);
    }
    return "";
  }

  function modalInput(label, name, value, required = false, full = false, type = "text") {
    return `<label class="field ${full ? "full" : ""}"><span class="field-label">${label}${required ? " *" : ""}</span><input class="input" name="${name}" type="${type}" value="${escapeHtml(value ?? "")}" ${required ? "required" : ""} ${type === "number" ? 'min="0" step="0.01"' : ""}/></label>`;
  }

  function openConfirm(kind, id, heading, message, confirmLabel = "Sil") {
    ui.modal = { type: "confirm", kind, id, heading, message, confirmLabel };
    render();
  }

  function formObject(form) {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
  }

  function submitModalForm(formId) {
    const form = document.getElementById(formId);
    if (!form || !form.reportValidity()) return;
    const values = formObject(form);
    if (formId === "customer-form") {
      const item = { id: ui.modal.id || uid("customer"), ...values };
      const index = state.customers.findIndex((customer) => customer.id === item.id);
      if (index >= 0) state.customers[index] = item; else state.customers.unshift(item);
      toast(index >= 0 ? "Müşteri güncellendi." : "Müşteri eklendi.", "success");
    }
    if (formId === "service-form") {
      const item = { id: ui.modal.id || uid("service"), ...values, price: Number(values.price || 0), vat: Number(values.vat || 0), active: form.elements.active.checked };
      const index = state.services.findIndex((service) => service.id === item.id);
      if (index >= 0) state.services[index] = item; else state.services.push(item);
      toast(index >= 0 ? "Hizmet güncellendi." : "Hizmet eklendi.", "success");
    }
    if (formId === "company-form") {
      const isDefault = form.elements.isDefault.checked || state.companies.length === 0;
      const item = { id: ui.modal.id || uid("company"), ...values, logo: ui.modal.logo ?? (state.companies.find((company) => company.id === ui.modal.id)?.logo || ""), isDefault };
      if (isDefault) state.companies.forEach((company) => { company.isDefault = false; });
      const index = state.companies.findIndex((company) => company.id === item.id);
      if (index >= 0) state.companies[index] = item; else state.companies.push(item);
      toast(index >= 0 ? "Firma güncellendi." : "Firma eklendi.", "success");
    }
    persist();
    ui.modal = null;
    render();
  }

  function confirmModalAction() {
    const modal = ui.modal;
    if (!modal || modal.type !== "confirm") return;
    if (modal.kind === "quote") {
      state.quotes = state.quotes.filter((quote) => quote.id !== modal.id);
      toast("Teklif silindi.", "success");
    }
    if (modal.kind === "customer") {
      state.customers = state.customers.filter((customer) => customer.id !== modal.id);
      toast("Müşteri silindi.", "success");
    }
    if (modal.kind === "service") {
      state.services = state.services.filter((service) => service.id !== modal.id);
      toast("Hizmet silindi.", "success");
    }
    if (modal.kind === "company") {
      if (state.companies.length <= 1) {
        ui.modal = null;
        toast("En az bir firma kayıtlı olmalıdır.", "error");
        render();
        return;
      }
      const deleted = state.companies.find((company) => company.id === modal.id);
      state.companies = state.companies.filter((company) => company.id !== modal.id);
      if (deleted?.isDefault && state.companies[0]) state.companies[0].isDefault = true;
      toast("Firma silindi.", "success");
    }
    if (modal.kind === "reset") {
      state = deepClone(seedState);
      localStorage.removeItem(STORAGE_KEY);
      toast("Örnek veriler geri yüklendi.", "success");
    }
    persist();
    ui.modal = null;
    render();
  }

  function copyQuote(id) {
    const source = state.quotes.find((quote) => quote.id === id);
    if (!source) return;
    const copy = deepClone(source);
    copy.id = uid("quote");
    copy.no = `${source.no}-KOPYA`;
    copy.date = isoDate();
    copy.validUntil = isoDate(Number(state.settings.validityDays || 30));
    copy.status = "Taslak";
    copy.items = copy.items.map((item) => ({ ...item, id: uid("item") }));
    state.quotes.unshift(copy);
    persist();
    toast("Teklif kopyalandı.", "success");
    render();
  }

  function saveQuote(status) {
    const draft = ui.quoteDraft;
    if (!draft?.no.trim() || !draft?.customer.trim()) {
      toast("Teklif no ve müşteri adı zorunludur.", "error");
      ui.quoteTab = "info";
      render();
      return;
    }
    draft.status = status;
    const index = state.quotes.findIndex((quote) => quote.id === draft.id);
    if (index >= 0) state.quotes[index] = deepClone(draft); else state.quotes.unshift(deepClone(draft));
    persist();
    const id = draft.id;
    ui.quoteDraft = null;
    toast(status === "Gönderildi" ? "Teklif kaydedildi ve gönderildi olarak işaretlendi." : "Teklif taslak olarak kaydedildi.", "success");
    navigate(`/quotes/${id}`);
  }

  function updateTotalsInPlace() {
    if (!ui.quoteDraft) return;
    const totals = quoteTotals(ui.quoteDraft);
    const values = document.querySelectorAll(".quote-summary .summary-row strong");
    if (values[0]) values[0].textContent = money(totals.subtotal);
    if (values[1]) values[1].textContent = money(totals.vat);
    if (values[2]) values[2].textContent = money(totals.total);
  }

  function rerenderWithFocus(target) {
    const filter = target.dataset.filter;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    render();
    const next = document.querySelector(`[data-filter="${filter}"]`);
    if (next) {
      next.focus();
      if (typeof next.setSelectionRange === "function" && start !== null) next.setSelectionRange(start, end);
    }
  }

  function readFiles(files, callback) {
    [...files].forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 2_500_000) {
        toast(`${file.name} çok büyük. En fazla 2,5 MB görsel yükleyin.`, "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => callback(reader.result);
      reader.readAsDataURL(file);
    });
  }

  app.addEventListener("click", (event) => {
    const navLink = event.target.closest("a[data-nav]");
    if (navLink) {
      event.preventDefault();
      navigate(pathFromHref(navLink.getAttribute("href")));
      return;
    }
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (action === "close-modal" && actionEl.classList.contains("modal-backdrop") && event.target !== actionEl) return;

    if (action === "toggle-sidebar") { ui.sidebarOpen = !ui.sidebarOpen; render(); }
    if (action === "close-sidebar") { ui.sidebarOpen = false; render(); }
    if (action === "new-quote") { ui.quoteDraft = null; ui.quoteTab = "info"; navigate("/quotes/new"); }
    if (action === "logout") toast("Bu sürüm kişisel kullanım için açık oturumda çalışıyor.");
    if (action === "toggle-advanced") { ui.advanced = !ui.advanced; render(); }
    if (action === "clear-filters") {
      Object.assign(ui, { quoteSearch: "", quoteStatus: "", dateFrom: "", dateTo: "", minAmount: "", maxAmount: "" });
      render();
    }
    if (action === "add-customer") { ui.modal = { type: "customer", id: null }; render(); }
    if (action === "edit-customer") { ui.modal = { type: "customer", id: actionEl.dataset.id }; render(); }
    if (action === "delete-customer") {
      const item = state.customers.find((customer) => customer.id === actionEl.dataset.id);
      openConfirm("customer", actionEl.dataset.id, "Müşteri silinsin mi?", `${item?.company || "Bu müşteri"} kalıcı olarak silinecek. Mevcut tekliflerde yazılı müşteri bilgileri korunur.`);
    }
    if (action === "add-service") { ui.modal = { type: "service", id: null }; render(); }
    if (action === "edit-service") { ui.modal = { type: "service", id: actionEl.dataset.id }; render(); }
    if (action === "delete-service") {
      const item = state.services.find((service) => service.id === actionEl.dataset.id);
      openConfirm("service", actionEl.dataset.id, "Hizmet silinsin mi?", `${item?.name || "Bu hizmet"} katalogdan kaldırılacak. Önceki tekliflerdeki kalemler korunur.`);
    }
    if (action === "add-company") { ui.modal = { type: "company", id: null, logo: "" }; render(); }
    if (action === "edit-company") {
      const item = state.companies.find((company) => company.id === actionEl.dataset.id);
      ui.modal = { type: "company", id: actionEl.dataset.id, logo: item?.logo || "" };
      render();
    }
    if (action === "delete-company") {
      const item = state.companies.find((company) => company.id === actionEl.dataset.id);
      openConfirm("company", actionEl.dataset.id, "Firma silinsin mi?", `${item?.name || "Bu firma"} ayarlardan kaldırılacak.`);
    }
    if (action === "default-company") {
      state.companies.forEach((company) => { company.isDefault = company.id === actionEl.dataset.id; });
      persist();
      toast("Varsayılan firma değiştirildi.", "success");
      render();
    }
    if (action === "reset-data") openConfirm("reset", "all", "Tüm veriler sıfırlansın mı?", "Bu tarayıcıdaki teklifler, müşteriler, hizmetler ve ayarlar silinerek örnek veriler geri yüklenecek.", "Sıfırla");
    if (action === "quote-tab") { ui.quoteTab = actionEl.dataset.tab; render(); }
    if (action === "cancel-quote") { ui.quoteDraft = null; navigate("/quotes"); }
    if (action === "save-quote") saveQuote(actionEl.dataset.status);
    if (action === "add-quote-service") {
      const service = state.services.find((item) => item.id === actionEl.dataset.id);
      if (service && ui.quoteDraft) {
        ui.quoteDraft.items.push({ id: uid("item"), serviceId: service.id, name: service.name, unit: service.unit, quantity: 1, price: Number(service.price || 0), vat: Number(service.vat ?? state.settings.defaultVat) });
        toast("Hizmet teklife eklendi.", "success");
        render();
      }
    }
    if (action === "manual-quote-item") {
      ui.quoteDraft?.items.push({ id: uid("item"), serviceId: "", name: "Yeni hizmet kalemi", unit: "Adet", quantity: 1, price: 0, vat: Number(state.settings.defaultVat) });
      render();
    }
    if (action === "remove-quote-item") { ui.quoteDraft?.items.splice(Number(actionEl.dataset.index), 1); render(); }
    if (action === "add-workflow") { ui.quoteDraft?.workflow.push("Yeni iş aşaması"); render(); }
    if (action === "remove-workflow") { ui.quoteDraft?.workflow.splice(Number(actionEl.dataset.index), 1); render(); }
    if (action === "remove-quote-image") { ui.quoteDraft?.images.splice(Number(actionEl.dataset.index), 1); render(); }
    if (action === "copy-quote") copyQuote(actionEl.dataset.id);
    if (action === "delete-quote") {
      const item = state.quotes.find((quote) => quote.id === actionEl.dataset.id);
      openConfirm("quote", actionEl.dataset.id, "Teklif silinsin mi?", `${item?.no || "Bu teklif"} numaralı teklif kalıcı olarak silinecek.`);
    }
    if (action === "print-quote") {
      navigate(`/quotes/${actionEl.dataset.id}`);
      setTimeout(() => window.print(), 220);
    }
    if (action === "window-print") window.print();
    if (action === "close-modal") { ui.modal = null; render(); }
    if (action === "submit-modal-form") submitModalForm(actionEl.dataset.form);
    if (action === "confirm-modal") confirmModalAction();
  });

  app.addEventListener("input", (event) => {
    const target = event.target;
    if (target.dataset.filter) {
      const map = {
        "quote-search": "quoteSearch",
        "date-from": "dateFrom",
        "date-to": "dateTo",
        "min-amount": "minAmount",
        "max-amount": "maxAmount",
        "customer-search": "customerSearch",
        "catalog-search": "catalogSearch",
        "catalog-search-editor": "catalogSearch",
      };
      const key = map[target.dataset.filter];
      if (key) ui[key] = target.value;
      clearTimeout(ui.filterTimer);
      ui.filterTimer = setTimeout(() => rerenderWithFocus(target), 160);
      return;
    }
    if (!ui.quoteDraft) return;
    if (target.name && target.closest("#quote-form")) {
      ui.quoteDraft[target.name] = target.value;
      document.querySelectorAll('[data-action="save-quote"]').forEach((button) => { button.disabled = !(ui.quoteDraft.no.trim() && ui.quoteDraft.customer.trim()); });
    }
    if (target.dataset.itemField !== undefined) {
      const item = ui.quoteDraft.items[Number(target.dataset.itemIndex)];
      if (item) item[target.dataset.itemField] = ["quantity", "price", "vat"].includes(target.dataset.itemField) ? Number(target.value) : target.value;
      updateTotalsInPlace();
    }
    if (target.dataset.workflowIndex !== undefined) ui.quoteDraft.workflow[Number(target.dataset.workflowIndex)] = target.value;
  });

  app.addEventListener("change", (event) => {
    const target = event.target;
    if (target.dataset.filter === "quote-status") { ui.quoteStatus = target.value; render(); return; }
    if (target.dataset.action === "toggle-service") {
      const service = state.services.find((item) => item.id === target.dataset.id);
      if (service) service.active = target.checked;
      persist();
      return;
    }
    if (target.dataset.action === "company-logo") {
      readFiles(target.files, (dataUrl) => { ui.modal.logo = dataUrl; render(); });
      return;
    }
    if (target.dataset.action === "quote-images") {
      readFiles(target.files, (dataUrl) => { ui.quoteDraft.images.push(dataUrl); render(); });
      return;
    }
    if (target.name === "customerId" && ui.quoteDraft) {
      ui.quoteDraft.customerId = target.value;
      const customer = state.customers.find((item) => item.id === target.value);
      if (customer) Object.assign(ui.quoteDraft, { customer: customer.company, contact: customer.contact, phone: customer.phone, email: customer.email });
      render();
      return;
    }
    if (target.name === "companyId" && ui.quoteDraft) ui.quoteDraft.companyId = target.value;
  });

  app.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id === "defaults-form") {
      const values = formObject(event.target);
      state.settings.defaultVat = Number(values.defaultVat || 20);
      state.settings.validityDays = Number(values.validityDays || 30);
      persist();
      toast("Teklif varsayılanları kaydedildi.", "success");
    }
  });

  window.addEventListener("popstate", () => {
    ui.modal = null;
    ui.sidebarOpen = false;
    render();
  });

  function render() {
    const { path, quoteMatch } = pathInfo();
    let content;
    if (path === "/") content = renderDashboard();
    else if (path === "/quotes") content = renderQuotes();
    else if (path === "/quotes/new") content = renderQuoteEditor();
    else if (quoteMatch) {
      const quote = state.quotes.find((item) => item.id === quoteMatch[1]);
      content = quoteMatch[2] === "edit" ? renderQuoteEditor(quote) : renderQuoteDetail(quote);
    }
    else if (path === "/customers") content = renderCustomers();
    else if (path === "/catalog") content = renderCatalog();
    else if (path === "/settings") content = renderSettings();
    else content = `<main class="page"><div class="card empty-state"><div><div class="empty-state-icon">${icon("file", 25)}</div><strong>Sayfa bulunamadı</strong><p><a href="${routeHref("/")}" data-nav class="link-accent">Ana panele dön</a></p></div></div></main>`;
    app.innerHTML = shell(content, path);
    const titles = { "/": "Ana Panel", "/quotes": "Teklifler", "/customers": "Müşteriler", "/catalog": "Hizmet Kataloğu", "/settings": "Ayarlar", "/quotes/new": "Yeni Teklif" };
    document.title = `${titles[path] || (quoteMatch ? "Teklif" : "Evren Jeofizik")} | Evren Jeofizik Teklif`;
  }

  render();
})();
