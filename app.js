const LOGO_URL = "/evren-logo.png";
const STORAGE_KEY = "evren-jeofizik-teklif-v1";
const AUTH_KEY = "evren-jeofizik-auth";
const PASSWORD_HASH = "01972c9696c0048d238b6c77df3c2999d4dd227f0d6b12271e4044f1e51b92e4";

const workflowDefaults = [
  "Ön Hazırlık ve Alan Belirleme",
  "Koordinat ve Harita Hazırlığı",
  "Jeolojik ve Hidrojeolojik Arazi Etütleri",
  "Jeokimyasal Numune Alımı ve Analizler",
  "Jeofizik Etütler",
  "Veri Entegrasyonu ve Değerlendirme",
  "Sondaj Öncesi İzin Süreçleri ÇDP Kurum İzinleri",
  "CED İşlemleri",
  "Sondaj Aşaması (Jeotermal ve Kaynak Suyu)"
];

const defaultDescription = `1. TEKLİF GEÇERLİLİK SÜRESİ: Bu teklif belirtilen geçerlilik tarihine kadar geçerlidir.

2. ÖDEME ŞARTLARI: İşin tamamlanmasını müteakip fatura kesilecek olup, fatura tarihinden itibaren 30 gün içinde ödeme yapılacaktır.

3. ÇALIŞMA SÜRESİ: Belirtilen iş programına göre arazi çalışmaları süresi teklif kapsamında belirtilmiştir.

4. RAPOR TESLİM SÜRESİ: Arazi çalışmaları tamamlandıktan sonra 30 (otuz) iş günü içerisinde nihai rapor teslim edilecektir.

5. ULAŞIM / KONAKLAMA: Çalışma ekibinin çalışma sahasına ulaşımı ve konaklama ihtiyaçları tarafımızca karşılanacaktır.

6. DİĞER ŞARTLAR: Teklif kapsamında yapılmayacak işler ve özel koşullar ayrıca belirtilmemiştir. İSG, sigorta ve resmi kurum izinleri ilgili mevzuat çerçevesinde yürütülür.`;

const seedServices = [
  ["srv-1", "Kurum müracaatları resmi işlemler", "Adet", "Diğer"],
  ["srv-2", "ÇED işlemleri", "Adet", "Diğer"],
  ["srv-3", "Teknik nezaretçilik , sorumluluk", "Adet", "Diğer"],
  ["srv-4", "Jeotermal kaynak, mineralli su, gaz CO₂ ve doğal kaynak ruhsatı projesi ve eklerinin hazırlanması", "Adet", "Diğer"],
  ["srv-5", "Lokasyon belirleme", "Adet", "Diğer"],
  ["srv-6", "Alan sınırlarının GPS ile işaretlenmesi", "Adet", "Diğer"],
  ["srv-7", "1/25.000 ölçekli, 1/5.000 ölçekli, 1/1.000 ölçekli onaylı harita", "Adet", "Diğer"],
  ["srv-8", "Koordinat ve harita hazırlığı", "Adet", "Diğer"],
  ["srv-9", "Su numuneleri analizi", "Adet", "Analiz"],
  ["srv-10", "Toprak Gazları (CO2, H2S, CH4, N2, O2, CO, LEL, Rn, Tn)", "Adet", "Analiz"],
  ["srv-11", "Su kimyası (Sıcaklık, pH, Tuzluluk, Elektriksel İletkenlik, Toplam Sertlik, Gerici Sertlik, Kalici Sertlik, Ca, Mg, Na, K, CO3, HCO3, Cl, SO4, SiO2, NH4, NO2, NO3, PO4, B, I, F, Fe, Mn, Pb, Zn, As, Ni, Cd, Mo, Cr, Cu)", "Adet", "Analiz"],
  ["srv-12", "Jeofizik çalışmaları DES-MT-SP (Düşey Elektrik Sondaj, Manyetotellurik ve Self Potansiyel çalışmaları)", "Adet", "Jeofizik"]
].map(([id, name, unit, category]) => ({ id, name, description: "", unit, category, price: 0, vat: 20, active: true }));

const seedQuotes = [
  { id: "q-1", no: "Yyyy", date: "2026-08-22", customerName: "Ddd", projectPlace: "Hh", status: "draft", total: 0 },
  { id: "q-2", no: "EJ-2026-0004", date: "2026-07-14", customerName: "Seydişehir Belediye Başkanlığı", projectPlace: "", status: "draft", total: 1689000 },
  { id: "q-3", no: "123", date: "2026-08-18", customerName: "Limosa Medikal İthalat İhracat ve Ticaret Ltd. Şti", projectPlace: "Konya", status: "draft", total: 0 },
  { id: "q-4", no: "EJ-2026-0003", date: "2026-08-14", customerName: "Limosa Medikal İthalat İhracat ve Ticaret Ltd.Şti.", projectPlace: "Konya", status: "draft", total: 1320000 },
  { id: "q-5", no: "TKL-211827", date: "2026-07-14", customerName: "Seydişehir Belediye Başkanlığı", projectPlace: "", status: "draft", total: 1689000 },
  { id: "q-6", no: "TKL-899131", date: "2026-06-08", customerName: "Özyapıcılar İnş.Tic.ve.San.Ltd.Şti.", projectPlace: "", status: "draft", total: 8980560 },
  { id: "q-7", no: "TKL-420983", date: "2026-06-09", customerName: "JEOTERMAL KAYNAK BİTKİSEL ÜRETİM AMAÇLI TARIMA DAYALI İHTİSAS OSB", projectPlace: "", status: "approved", total: 29917680 }
].map((q) => ({
  companyId: "company-1",
  customerId: "",
  contact: "",
  phone: "",
  email: "",
  projectName: "",
  city: "",
  district: "",
  village: "",
  licenseNo: "",
  licenseOwner: "",
  validUntil: addDays(q.date, 30),
  items: q.total ? [{ id: crypto.randomUUID(), name: "Jeofizik araştırma ve etüt hizmetleri", unit: "Adet", quantity: 1, price: q.total / 1.2, vat: 20 }] : [],
  description: defaultDescription,
  notes: "",
  workflow: [...workflowDefaults],
  ...q
}));

const initialState = {
  settings: { vatRate: 20, validityDays: 30 },
  companies: [
    {
      id: "company-1",
      name: "SİDRA MADENCİLİK ENERJİ SAN. VE TİC. A.Ş.",
      subtitle: "",
      logo: LOGO_URL,
      address: "",
      phone: "",
      email: "jeofizikhizmetleri@gmail.com",
      website: "",
      taxOffice: "",
      taxNo: "",
      bank: "",
      iban: "",
      footer: "",
      isDefault: true
    },
    {
      id: "company-2",
      name: "Evren Jeofizik Hiz. ve Tek. Tic.Ltd.Şti.",
      subtitle: "JEOFİZİK - JEOLOJİ HİZMETLERİ",
      logo: LOGO_URL,
      address: "",
      phone: "",
      email: "",
      website: "www.evrenjeofizik.com",
      taxOffice: "",
      taxNo: "",
      bank: "",
      iban: "",
      footer: "",
      isDefault: false
    }
  ],
  customers: [
    {
      id: "customer-1",
      name: "Limosa Medikal İthalat İhracat ve Ticaret Ltd. Şti",
      contact: "Ukkaşe Çap",
      phone: "0 (212) 323 24 34",
      email: "info@limosa.com.tr",
      address: "",
      taxOffice: "",
      taxNo: "",
      notes: ""
    }
  ],
  services: seedServices,
  quotes: seedQuotes
};

let state = loadState();
let quoteDraft = null;
let quoteTab = "info";
let printQuoteId = null;
let printQuoteData = null;
let pdfPreviewQuote = null;
let isAuthenticated = sessionStorage.getItem(AUTH_KEY) === "1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(initialState);
    const parsed = JSON.parse(raw);
    const merged = { ...structuredClone(initialState), ...parsed };
    merged.companies = (merged.companies || []).map((company) => ({
      ...company,
      logo: !company.logo || company.logo.includes("media.base44.com") ? LOGO_URL : company.logo
    }));
    return merged;
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function addDays(dateString, days) {
  const d = new Date(`${dateString || new Date().toISOString().slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
}

function today() { return new Date().toISOString().slice(0, 10); }

function formatDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function formatDashboardDate() {
  const date = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const weekday = new Intl.DateTimeFormat("tr-TR", { weekday: "long" }).format(new Date());
  return `${date}, ${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;
}

function money(value) {
  if (!Number(value)) return "—";
  return `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value))} TL`;
}

function calcTotals(items = []) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
  const vat = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0) * Number(item.vat || 0) / 100, 0);
  return { subtotal, vat, total: subtotal + vat };
}

function e(value = "") {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

const iconPaths = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  grid: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1v.08h-4V21a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3v-4h.08A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3h4v.08A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.3.37.51.82.6 1.3h.08v4H20a1.7 1.7 0 0 0-.6.7z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  printer: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  building: '<path d="M3 21h18M6 21V3h12v18M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8M14 7h7v7"/>',
  xcircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  arrow: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.7a16 16 0 0 0 6 6l1.24-1.24a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 6-10 7L2 6"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>'
};

function icon(name, size = 18) {
  return `<span class="icon" style="width:${size}px;height:${size}px"><svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || ""}</svg></span>`;
}

function statusLabel(status) {
  return ({ draft: "Taslak", sent: "Gönderildi", approved: "Onaylandı", rejected: "Reddedildi", cancelled: "İptal" })[status] || "Taslak";
}

function statusPill(status) { return `<span class="status-pill ${status}">${statusLabel(status)}</span>`; }

function routeInfo() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  if (path === "/quotes/new") return { page: "quote-form", id: new URLSearchParams(location.search).get("edit") };
  const match = path.match(/^\/quotes\/([^/]+)$/);
  if (match) return { page: "quote-detail", id: match[1] };
  return { page: ({ "/": "dashboard", "/quotes": "quotes", "/customers": "customers", "/catalog": "catalog", "/settings": "settings" })[path] || "dashboard" };
}

function navigate(url) {
  history.pushState({}, "", url);
  quoteDraft = null;
  quoteTab = "info";
  pdfPreviewQuote = null;
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function shell(pageHtml, active) {
  const nav = [
    ["dashboard", "/", "grid", "Ana Panel"],
    ["quotes", "/quotes", "file", "Teklifler"],
    ["customers", "/customers", "users", "Müşteriler"],
    ["catalog", "/catalog", "book", "Hizmet Kataloğu"],
    ["settings", "/settings", "settings", "Ayarlar"]
  ];
  return `
    <div class="app-shell" id="app-shell">
      <div class="mobile-menu-backdrop" data-action="close-menu"></div>
      <aside class="sidebar">
        <div class="brand">
          <img class="brand-logo" src="${LOGO_URL}" alt="Logo" />
          <div><p class="brand-title">EVREN JEOFİZİK</p><p class="brand-subtitle">JEOFİZİK - JEOLOJİ HİZ.</p></div>
        </div>
        <div class="sidebar-content">
          <button class="sidebar-new" data-link="/quotes/new">${icon("plus",16)} Yeni Teklif</button>
          <nav class="nav-list" aria-label="Ana menü">
            ${nav.map(([key, url, ic, label]) => `<a href="${url}" data-link="${url}" class="nav-item ${active === key ? "active" : ""}">${icon(ic,16)}<span>${label}</span><span class="chev">›</span></a>`).join("")}
          </nav>
        </div>
        <div class="sidebar-footer"><button class="logout-btn" data-action="logout">${icon("logout",15)} Çıkış Yap</button></div>
      </aside>
      <div class="mobile-topbar"><button class="mobile-menu-btn" data-action="open-menu" aria-label="Menüyü aç">${icon("menu",21)}</button><span class="mobile-title">Evren Jeofizik</span><button class="mobile-menu-btn" data-link="/quotes/new" aria-label="Yeni teklif">${icon("plus",21)}</button></div>
      <main class="main">${pageHtml}</main>
    </div>
    ${renderPdfPreview()}
    ${renderPrintSheet()}`;
}

function renderLogin() {
  return `<main class="login-page">
    <div class="login-glow login-glow-one"></div>
    <div class="login-glow login-glow-two"></div>
    <section class="login-card" aria-labelledby="login-title">
      <div class="login-brand-panel">
        <div class="login-logo-ring"><img src="${LOGO_URL}" alt="Evren Jeofizik Jeoloji logosu" /></div>
        <p class="login-kicker">JEOFİZİK · JEOLOJİ</p>
        <h1 id="login-title">Evren Jeofizik</h1>
        <p>Teklif ve müşteri yönetim sistemine güvenli giriş</p>
      </div>
      <div class="login-form-panel">
        <div class="login-form-heading"><span>Yönetim Paneli</span><h2>Hoş Geldiniz</h2><p>Devam etmek için kullanıcı bilgilerinizi girin.</p></div>
        <form id="login-form" class="login-form" autocomplete="on">
          <div class="field login-field"><label for="login-username">Kullanıcı Adı</label><input id="login-username" name="username" autocomplete="username" placeholder="Kullanıcı adınızı girin" autofocus required /></div>
          <div class="field login-field"><label for="login-password">Şifre</label><input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Şifrenizi girin" required /></div>
          <p class="login-error" id="login-error" role="alert"></p>
          <button class="login-submit" type="submit"><span>Giriş Yap</span><span aria-hidden="true">→</span></button>
        </form>
        <p class="login-footer">© ${new Date().getFullYear()} Evren Jeofizik · Tüm hakları saklıdır.</p>
      </div>
    </section>
  </main>`;
}

function pageHeader(title, subtitle, action = "") {
  return `<header class="page-header"><div><h1 class="page-title">${e(title)}</h1>${subtitle ? `<p class="page-subtitle">${e(subtitle)}</p>` : ""}</div>${action}</header>`;
}

function quoteActions(quote, compact = false) {
  const title = (action, label) => compact ? `title="${label}" aria-label="${label}"` : "";
  return `<div class="actions">
    <button class="icon-btn" data-link="/quotes/${quote.id}" ${title("view","Görüntüle")}>${icon("eye",16)}</button>
    <button class="icon-btn" data-link="/quotes/new?edit=${quote.id}" ${title("edit","Düzenle")}>${icon("edit",16)}</button>
    <button class="icon-btn" data-action="preview-pdf" data-id="${quote.id}" ${title("pdf","PDF Önizle")}>${icon("download",16)}</button>
    <button class="icon-btn" data-action="copy-quote" data-id="${quote.id}" ${title("copy","Kopyala")}>${icon("copy",16)}</button>
    <button class="icon-btn danger" data-action="delete-quote" data-id="${quote.id}" ${title("delete","Sil")}>${icon("trash",16)}</button>
  </div>`;
}

function renderDashboard() {
  const approvedTotal = state.quotes.filter((q) => q.status === "approved").reduce((sum, q) => sum + Number(q.total || 0), 0);
  const currentMonth = today().slice(0, 7);
  const metrics = [
    ["file", "neutral", state.quotes.length, "Toplam Teklif", ""],
    ["file", "neutral", state.quotes.filter((q) => q.status === "draft").length, "Taslak Teklif", ""],
    ["send", "blue", state.quotes.filter((q) => q.status === "sent").length, "Gönderilen Teklif", ""],
    ["check", "green", state.quotes.filter((q) => q.status === "approved").length, "Onaylanan Teklif", ""],
    ["xcircle", "red", state.quotes.filter((q) => q.status === "rejected").length, "Reddedilen Teklif", ""],
    ["trend", "yellow", money(approvedTotal), "Toplam Teklif Tutarı", "money"],
    ["calendar", "purple", Math.max(4, state.quotes.filter((q) => q.date?.startsWith(currentMonth)).length), "Bu Ay Oluşturulan", ""]
  ];
  const rows = [...state.quotes].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 7).map((q) => `
    <tr><td class="strong nowrap">${e(q.no)}</td><td class="muted nowrap">${e(q.date)}</td><td><div class="cell-main">${e(q.customerName)}</div></td><td class="muted">${e(q.projectName || "—")}</td><td class="strong nowrap">${money(q.total)}</td><td>${statusPill(q.status)}</td><td>${quoteActions(q,true)}</td></tr>`).join("");
  return shell(`<div class="content wide">
    ${pageHeader("Ana Panel", `Evren Jeofizik · ${formatDashboardDate()}`, `<button class="primary-btn" data-link="/quotes/new">${icon("plus",16)}<span class="btn-label">Yeni Teklif</span></button>`)}
    <section class="metrics-grid">${metrics.map(([ic, tone, value, label, cls]) => `<article class="metric-card"><div class="metric-icon ${tone}">${icon(ic,20)}</div><p class="metric-value ${cls}">${value}</p><p class="metric-label">${label}</p></article>`).join("")}</section>
    <section class="card"><div class="card-header"><h2>Son Teklifler</h2><a class="text-link" href="/quotes" data-link="/quotes">Tümünü Gör →</a></div><div class="table-wrap"><table class="compact-table"><thead><tr><th>Teklif No</th><th>Tarih</th><th>Müşteri</th><th>Proje</th><th>Tutar</th><th>Durum</th><th>İşlemler</th></tr></thead><tbody>${rows || `<tr><td colspan="7" class="empty-state">Henüz teklif bulunmuyor.</td></tr>`}</tbody></table></div></section>
  </div>`, "dashboard");
}

function renderQuotes() {
  const rows = [...state.quotes].sort((a,b) => b.date.localeCompare(a.date)).map((q) => `
    <tr data-quote-row data-search="${e([q.no,q.customerName,q.contact,q.projectName,q.projectPlace].join(" ").toLocaleLowerCase("tr-TR"))}" data-status="${q.status}">
      <td class="strong">${e(q.no)}</td><td class="muted">${e(q.date)}</td><td>${e(q.customerName)}</td><td>${e(q.projectName || "—")}</td><td class="muted">${e(q.projectPlace || "—")}</td><td>${statusPill(q.status)}</td><td class="strong nowrap">${money(q.total)}</td><td>${quoteActions(q,true)}</td>
    </tr>`).join("");
  return shell(`<div class="content wide">
    ${pageHeader("Teklifler", `${state.quotes.length} teklif listeleniyor`, `<button class="primary-btn" data-link="/quotes/new">${icon("plus",16)}<span class="btn-label">Yeni Teklif</span></button>`)}
    <section class="toolbar card"><div class="input-shell"><span class="input-icon">${icon("search",16)}</span><input id="quote-search" placeholder="Teklif no, firma, yetkili, proje veya proje yeri ara..." /></div><span class="muted">${icon("filter",17)}</span><select id="quote-status" class="select-compact"><option value="">Tüm Durumlar</option><option value="draft">Taslak</option><option value="sent">Gönderildi</option><option value="approved">Onaylandı</option><option value="rejected">Reddedildi</option><option value="cancelled">İptal</option></select><button class="secondary-btn" data-action="toggle-advanced">Gelişmiş</button></section>
    <section class="filter-panel card hidden" id="advanced-filter"><div class="field"><label>Başlangıç Tarihi</label><input id="filter-start" type="date" /></div><div class="field"><label>Bitiş Tarihi</label><input id="filter-end" type="date" /></div><div class="field"><label>En Az Tutar</label><input id="filter-min" type="number" min="0" /></div><div class="field"><label>En Çok Tutar</label><input id="filter-max" type="number" min="0" /></div></section>
    <section class="card"><div class="table-wrap"><table class="compact-table"><thead><tr><th>Teklif No</th><th>Tarih</th><th>Müşteri</th><th>Proje</th><th>Proje Yeri</th><th>Durum</th><th>Tutar</th><th>İşlemler</th></tr></thead><tbody id="quote-rows">${rows || `<tr><td colspan="8" class="empty-state">Henüz teklif bulunmuyor.</td></tr>`}</tbody></table></div></section>
  </div>`, "quotes");
}

function renderCustomers() {
  const cards = state.customers.map((c) => {
    const count = state.quotes.filter((q) => q.customerId === c.id || q.customerName === c.name).length;
    return `<article class="customer-card card" data-customer-card data-search="${e([c.name,c.contact,c.phone,c.email].join(" ").toLocaleLowerCase("tr-TR"))}"><div class="customer-top"><div class="customer-icon">${icon("building",18)}</div><div style="min-width:0;flex:1"><p class="customer-name">${e(c.name)}</p></div><div class="actions"><button class="icon-btn" data-action="edit-customer" data-id="${c.id}" aria-label="Düzenle">${icon("edit",15)}</button><button class="icon-btn danger" data-action="delete-customer" data-id="${c.id}" aria-label="Sil">${icon("trash",15)}</button></div></div><div class="customer-meta"><span>${icon("users",13)}${e(c.contact || "—")}</span><span>${icon("phone",13)}${e(c.phone || "—")}</span><span>${icon("mail",13)}${e(c.email || "—")}</span></div><div class="customer-footer"><span>${count} teklif</span><span>›</span></div></article>`;
  }).join("");
  return shell(`<div class="content wide">${pageHeader("Müşteriler", `${state.customers.length} müşteri kayıtlı`, `<button class="primary-btn" data-action="new-customer">${icon("plus",16)}<span class="btn-label">Yeni Müşteri</span></button>`)}<section class="toolbar card" style="grid-template-columns:1fr"><div class="input-shell"><span class="input-icon">${icon("search",16)}</span><input id="customer-search" placeholder="Firma, yetkili, telefon veya e-posta ara..." /></div></section><section class="customers-grid" id="customer-grid">${cards || `<div class="card empty-state">Henüz müşteri kaydı yok.</div>`}</section></div>`, "customers");
}

function renderCatalog() {
  const groups = [...new Set(state.services.map((s) => s.category || "Diğer"))];
  const sections = groups.map((group) => {
    const items = state.services.filter((s) => (s.category || "Diğer") === group);
    return `<section class="catalog-section card"><div class="catalog-section-head"><h3 class="section-title">${e(group)}</h3><span class="section-count">${items.length} hizmet</span></div><div class="table-wrap"><table class="catalog-table"><thead><tr><th>Hizmet</th><th>Birim</th><th>Fiyat</th><th>KDV</th><th>Aktif</th><th></th></tr></thead><tbody>${items.map((s) => `<tr><td><span class="strong">${e(s.name)}</span>${s.description ? `<div class="muted" style="font-size:12px;margin-top:4px">${e(s.description)}</div>` : ""}</td><td class="muted">${e(s.unit)}</td><td>${money(s.price)}</td><td class="muted">%${Number(s.vat)}</td><td><label class="switch"><input type="checkbox" data-action="toggle-service" data-id="${s.id}" ${s.active ? "checked" : ""}/><span class="switch-track"></span></label></td><td><div class="actions"><button class="icon-btn" data-action="edit-service" data-id="${s.id}" aria-label="Düzenle">${icon("edit",15)}</button><button class="icon-btn danger" data-action="delete-service" data-id="${s.id}" aria-label="Sil">${icon("trash",15)}</button></div></td></tr>`).join("")}</tbody></table></div></section>`;
  }).join("");
  return shell(`<div class="content">${pageHeader("Jeofizik Hizmet Kataloğu", "Teklif oluştururken seçilecek jeofizik hizmetleri", `<button class="primary-btn" data-action="new-service">${icon("plus",16)}<span class="btn-label">Yeni Hizmet</span></button>`)}${sections || `<div class="card empty-state">Henüz hizmet eklenmedi.</div>`}</div>`, "catalog");
}

function renderSettings() {
  return shell(`<div class="content" style="max-width:720px">${pageHeader("Ayarlar", "")}
    <div class="settings-stack">
      <section class="settings-card card"><div class="settings-card-head"><h2 class="section-title">Firmalar</h2><button class="primary-btn" data-action="new-company">${icon("plus",16)} Firma Ekle</button></div><div class="info-strip">Teklif oluştururken listeden firma seçebilirsiniz. Varsayılan firma yeni tekliflerde otomatik seçilir. PDF çıktıları seçili firmanın bilgilerini kullanır.</div><div class="company-list">${state.companies.map((c) => `<div class="company-row"><img src="${e(c.logo || LOGO_URL)}" alt="${e(c.name)}"/><div class="company-info"><strong>${e(c.name)}</strong>${c.isDefault ? `<span class="default-badge">Varsayılan</span>` : ""}<span>${e(c.subtitle || c.email || "")}</span></div><div class="actions">${!c.isDefault ? `<button class="icon-btn" data-action="default-company" data-id="${c.id}" aria-label="Varsayılan yap">${icon("star",15)}</button>` : ""}<button class="icon-btn" data-action="edit-company" data-id="${c.id}" aria-label="Düzenle">${icon("edit",15)}</button><button class="icon-btn danger" data-action="delete-company" data-id="${c.id}" aria-label="Sil">${icon("trash",15)}</button></div></div>`).join("")}</div></section>
      <section class="settings-card card"><div class="settings-card-head"><h2 class="section-title">Teklif Varsayılanları</h2></div><form id="settings-form" class="modal-form"><div class="field-row"><div class="field"><label>Varsayılan KDV Oranı (%)</label><input name="vatRate" type="number" min="0" max="100" value="${state.settings.vatRate}" /></div><div class="field"><label>Varsayılan Geçerlilik Süresi (Gün)</label><input name="validityDays" type="number" min="1" value="${state.settings.validityDays}" /></div></div><div><button class="primary-btn" type="submit">${icon("save",16)} Kaydet</button></div></form></section>
    </div></div>`, "settings");
}

function newQuoteDraft(existing = null) {
  if (existing) return structuredClone(existing);
  const defaultCompany = state.companies.find((c) => c.isDefault) || state.companies[0];
  return {
    id: crypto.randomUUID(), no: "", date: today(), validUntil: addDays(today(), state.settings.validityDays), companyId: defaultCompany?.id || "", customerId: "", customerName: "", contact: "", phone: "", email: "", projectName: "", projectPlace: "", city: "", district: "", village: "", licenseNo: "", licenseOwner: "", status: "draft", items: [], description: defaultDescription, notes: "", workflow: [...workflowDefaults], images: []
  };
}

function ensureQuoteDraft(editId) {
  if (!quoteDraft) quoteDraft = newQuoteDraft(editId ? state.quotes.find((q) => q.id === editId) : null);
  return quoteDraft;
}

function renderQuoteForm(editId) {
  const q = ensureQuoteDraft(editId);
  const tabs = [["info","Teklif Bilgileri"],["items","Hizmet Kalemleri"],["notes","Açıklama & Notlar"],["workflow","İş Akışı"]];
  const body = quoteTab === "info" ? renderQuoteInfo(q) : quoteTab === "items" ? renderQuoteItems(q) : quoteTab === "notes" ? renderQuoteNotes(q) : renderQuoteWorkflow(q);
  const valid = q.no.trim() && q.customerName.trim();
  const totals = calcTotals(q.items);
  return shell(`<div class="content wide quote-compose">
    <header class="quote-compose-head">
      <div class="back-row"><button class="back-btn" data-link="/quotes" aria-label="Geri">${icon("arrow",21)}</button><div><p class="quote-eyebrow">TEKLİF YÖNETİMİ</p><h1 class="page-title">${editId ? "Teklifi Düzenle" : "Yeni Teklif Oluştur"}</h1><p class="page-subtitle">Müşteri, hizmet ve proje bilgilerini tek ekrandan yönetin.</p></div></div>
      <button class="secondary-btn quote-preview-btn" data-action="preview-pdf-draft" ${valid ? "" : "disabled"}>${icon("eye",16)} PDF Önizle</button>
    </header>
    <section class="quote-compose-summary" aria-label="Teklif özeti">
      <div><span>Teklif No</span><strong>${e(q.no || "Henüz girilmedi")}</strong></div>
      <div><span>Müşteri</span><strong>${e(q.customerName || "Henüz seçilmedi")}</strong></div>
      <div><span>Hizmet Kalemi</span><strong>${q.items.length}</strong></div>
      <div class="quote-compose-total"><span>Genel Toplam</span><strong>${money(totals.total).replace("—","0,00 TL")}</strong></div>
    </section>
    <section class="form-card card quote-form-card">
      <div class="form-tabs">${tabs.map(([key,label], index) => `<button class="form-tab ${quoteTab === key ? "active" : ""}" data-action="quote-tab" data-tab="${key}"><span>${index + 1}</span>${label}</button>`).join("")}</div>
      ${body}
      <div class="form-actions"><p class="form-action-note"><span></span>${valid ? "Teklif PDF önizlemeye ve kayda hazır." : "Devam etmek için teklif no ve müşteri adını girin."}</p><div class="form-action-buttons"><button class="secondary-btn" data-action="save-quote" data-status="draft" ${valid ? "" : "disabled"}>${icon("save",15)} Taslak Kaydet</button><button class="primary-btn" data-action="save-quote" data-status="sent" ${valid ? "" : "disabled"}>${icon("send",15)} Kaydet & Gönder</button></div></div>
    </section>
  </div>`, "quotes");
}

function renderQuoteInfo(q) {
  return `<div class="form-section"><div class="field"><label class="field-label">TEKLİFİ VEREN FİRMA</label><select data-model="companyId">${state.companies.map((c) => `<option value="${c.id}" ${q.companyId === c.id ? "selected" : ""}>${e(c.name)}${c.isDefault ? " (Varsayılan)" : ""}</option>`).join("")}</select></div><div class="field-row three"><div class="field"><label>TEKLİF NO *</label><input data-model="no" value="${e(q.no)}" placeholder="Teklif numarasını girin" /></div><div class="field"><label>TEKLİF TARİHİ</label><input data-model="date" type="date" value="${e(q.date)}" /></div><div class="field"><label>GEÇERLİLİK TARİHİ</label><input data-model="validUntil" type="date" value="${e(q.validUntil)}" /></div></div><div class="separator"></div><div class="field"><label>KAYITLI MÜŞTERİDEN SEÇ</label><select data-action="select-customer"><option value="">Manuel giriş yapacağım</option>${state.customers.map((c) => `<option value="${c.id}" ${q.customerId === c.id ? "selected" : ""}>${e(c.name)}${c.contact ? ` · ${e(c.contact)}` : ""}</option>`).join("")}</select></div><div class="separator"></div><h3 class="form-section-title">Müşteri Bilgileri</h3><div class="field"><label>Müşteri / Firma Adı *</label><input data-model="customerName" value="${e(q.customerName)}" placeholder="Firma adını giriniz" /></div><div class="field-row"><div class="field"><label>Yetkili Kişi</label><input data-model="contact" value="${e(q.contact)}" placeholder="Ad Soyad" /></div><div class="field"><label>Telefon</label><input data-model="phone" value="${e(q.phone)}" placeholder="0 5xx xxx xx xx" /></div></div><div class="field"><label>E-posta</label><input data-model="email" type="email" value="${e(q.email)}" placeholder="ornek@firma.com" /></div><div class="separator"></div><h3 class="form-section-title">Proje Bilgileri</h3><div class="field-row"><div class="field"><label>Proje Adı</label><input data-model="projectName" value="${e(q.projectName)}" placeholder="Proje adı" /></div><div class="field"><label>Proje Yeri</label><input data-model="projectPlace" value="${e(q.projectPlace)}" placeholder="İl / İlçe" /></div></div><div class="separator"></div><h3 class="form-section-title">Çalışılacak Alan Bilgileri</h3><div class="field-row three"><div class="field"><label>İl</label><input data-model="city" value="${e(q.city)}" placeholder="İl" /></div><div class="field"><label>İlçe</label><input data-model="district" value="${e(q.district)}" placeholder="İlçe" /></div><div class="field"><label>Mahalle / Köy</label><input data-model="village" value="${e(q.village)}" placeholder="Mahalle / Köy" /></div></div><div class="field-row"><div class="field"><label>Ruhsat No</label><input data-model="licenseNo" value="${e(q.licenseNo)}" placeholder="Ruhsat No" /></div><div class="field"><label>Ruhsat Sahibi</label><input data-model="licenseOwner" value="${e(q.licenseOwner)}" placeholder="Ruhsat Sahibi" /></div></div></div>`;
}

function renderQuoteItems(q) {
  const totals = calcTotals(q.items);
  return `<div class="form-section"><div class="catalog-picker"><h3>Katalogdan Hizmet Ekle</h3><div class="input-shell"><span class="input-icon">${icon("search",16)}</span><input id="service-picker-search" placeholder="Hizmet ara..." /></div><div class="catalog-picker-list" id="service-picker-list">${state.services.filter((s) => s.active).map((s) => `<button class="catalog-picker-item" data-action="add-service-item" data-id="${s.id}" data-picker-item data-search="${e(s.name.toLocaleLowerCase("tr-TR"))}"><span><strong>${e(s.name)}</strong><small>${e(s.unit)} · ${s.price ? money(s.price) : "Fiyat girilecek"}</small></span><b>+ Ekle</b></button>`).join("")}</div><button class="ghost-btn btn-sm" data-action="manual-item" style="margin-top:10px;color:#d99921">${icon("plus",15)} Manuel Kalem Ekle</button></div>${q.items.length ? `<div class="line-items card"><div class="table-wrap"><table><thead><tr><th>Hizmet</th><th>Birim</th><th>Miktar</th><th>Birim Fiyat</th><th>KDV</th><th>Tutar</th><th></th></tr></thead><tbody>${q.items.map((item,index) => `<tr><td><input class="item-description" data-item-index="${index}" data-item-field="name" value="${e(item.name)}" /></td><td><input data-item-index="${index}" data-item-field="unit" value="${e(item.unit)}" /></td><td><input data-item-index="${index}" data-item-field="quantity" type="number" min="0" step="0.01" value="${Number(item.quantity)}" /></td><td><input data-item-index="${index}" data-item-field="price" type="number" min="0" step="0.01" value="${Number(item.price)}" /></td><td><input data-item-index="${index}" data-item-field="vat" type="number" min="0" max="100" value="${Number(item.vat)}" /></td><td class="strong nowrap">${money(Number(item.quantity) * Number(item.price) * (1 + Number(item.vat)/100))}</td><td><button class="icon-btn danger" data-action="remove-item" data-index="${index}">${icon("trash",15)}</button></td></tr>`).join("")}</tbody></table></div></div>` : `<div class="empty-dashed">Henüz hizmet eklenmedi. Katalogdan seçin veya manuel ekleyin.</div>`}<div class="totals"><div class="total-row"><span>Ara Toplam (KDV Hariç)</span><strong>${money(totals.subtotal).replace("—","0,00 TL")}</strong></div><div class="total-row"><span>KDV</span><strong>${money(totals.vat).replace("—","0,00 TL")}</strong></div><div class="total-row grand"><span>GENEL TOPLAM</span><span>${money(totals.total).replace("—","0,00 TL")}</span></div></div></div>`;
}

function renderQuoteNotes(q) {
  return `<div class="form-section"><h3 class="form-section-title">Açıklama</h3><textarea data-model="description" style="min-height:220px" placeholder="Teklif ile ilgili açıklamalar...">${e(q.description)}</textarea><h3 class="form-section-title">Notlar</h3><textarea data-model="notes" placeholder="Ek notlar...">${e(q.notes)}</textarea></div>`;
}

function renderQuoteWorkflow(q) {
  return `<div class="form-section"><div style="display:flex;justify-content:space-between;align-items:center"><p class="muted" style="margin:0">PDF'de görünecek iş akışı adımları</p><button class="ghost-btn btn-sm" data-action="add-workflow" style="color:#d99921">${icon("plus",15)} Adım Ekle</button></div><div class="workflow-table card"><table><thead><tr><th>İş Akışı No</th><th>İş Aşaması</th><th></th></tr></thead><tbody>${q.workflow.map((step,index) => `<tr><td>${index+1}</td><td><input data-workflow-index="${index}" value="${e(step)}" /></td><td><button class="icon-btn danger" data-action="remove-workflow" data-index="${index}">${icon("trash",15)}</button></td></tr>`).join("")}</tbody></table></div><h3 class="form-section-title">Görseller</h3><div style="display:flex;justify-content:flex-end"><label class="secondary-btn btn-sm" style="color:#d99921;cursor:pointer">${icon("download",15)} Resim Ekle<input id="quote-images" type="file" accept="image/*" multiple hidden /></label></div><div class="upload-zone">${q.images?.length ? `${q.images.length} görsel eklendi` : "Henüz görsel eklenmedi"}</div></div>`;
}

function renderQuoteDetail(id) {
  const q = state.quotes.find((quote) => quote.id === id);
  if (!q) return shell(`<div class="content"><div class="card empty-state"><h2>Teklif bulunamadı.</h2><button class="primary-btn" data-link="/quotes">Tekliflere Dön</button></div></div>`, "quotes");
  const totals = calcTotals(q.items);
  const company = state.companies.find((c) => c.id === q.companyId) || state.companies[0];
  const area = [q.village, q.district, q.city].filter(Boolean).join(" / ") || q.projectPlace || "—";
  return shell(`<div class="content wide quote-detail-page">
    <section class="quote-hero">
      <div class="quote-hero-accent"></div>
      <div class="quote-hero-main">
        <button class="quote-hero-back" data-link="/quotes" aria-label="Tekliflere dön">${icon("arrow",20)}</button>
        <img class="quote-hero-logo" src="${e(company?.logo || LOGO_URL)}" alt="${e(company?.name || "Evren Jeofizik")}" />
        <div class="quote-hero-copy"><p>FİYAT TEKLİFİ</p><div class="quote-hero-title"><h1>${e(q.no)}</h1>${statusPill(q.status)}</div><span>${e(q.customerName)}${q.projectName ? ` · ${e(q.projectName)}` : ""}</span></div>
        <div class="detail-actions"><button class="secondary-btn btn-sm" data-link="/quotes/new?edit=${q.id}">${icon("edit",15)} Düzenle</button><button class="secondary-btn btn-sm" data-action="preview-pdf" data-id="${q.id}">${icon("eye",15)} PDF Önizle</button><button class="primary-btn btn-sm" data-action="pdf-quote" data-id="${q.id}">${icon("download",15)} PDF İndir</button></div>
      </div>
      <div class="quote-hero-meta"><div><span>Teklif Tarihi</span><strong>${formatDate(q.date)}</strong></div><div><span>Geçerlilik Tarihi</span><strong>${formatDate(q.validUntil)}</strong></div><div><span>Hizmet Kalemi</span><strong>${q.items.length}</strong></div><div><span>Teklifi Veren</span><strong>${e(company?.name || "Evren Jeofizik")}</strong></div></div>
    </section>

    <div class="quote-detail-layout">
      <div class="quote-detail-main">
        <section class="quote-info-grid">
          <article class="quote-info-card card"><div class="quote-card-icon">${icon("building",20)}</div><div><p class="quote-card-kicker">MÜŞTERİ BİLGİLERİ</p><h2>${e(q.customerName)}</h2><dl><div><dt>Yetkili</dt><dd>${e(q.contact || "—")}</dd></div><div><dt>Telefon</dt><dd>${e(q.phone || "—")}</dd></div><div><dt>E-posta</dt><dd>${e(q.email || "—")}</dd></div></dl></div></article>
          <article class="quote-info-card card"><div class="quote-card-icon">${icon("trend",20)}</div><div><p class="quote-card-kicker">PROJE / SAHA</p><h2>${e(q.projectName || "Proje bilgisi girilmedi")}</h2><dl><div><dt>Çalışma Alanı</dt><dd>${e(area)}</dd></div><div><dt>Ruhsat No</dt><dd>${e(q.licenseNo || "—")}</dd></div><div><dt>Ruhsat Sahibi</dt><dd>${e(q.licenseOwner || "—")}</dd></div></dl></div></article>
        </section>

        <section class="quote-lines-card card"><div class="quote-section-head"><div><p>HİZMET KAPSAMI</p><h2>Hizmet Kalemleri</h2></div><span>${q.items.length} kalem</span></div><div class="table-wrap"><table class="quote-detail-table"><thead><tr><th>#</th><th>Hizmet</th><th>Birim</th><th>Miktar</th><th>Birim Fiyat</th><th>KDV</th><th>Tutar</th></tr></thead><tbody>${q.items.length ? q.items.map((item,index) => `<tr><td class="line-index">${String(index+1).padStart(2,"0")}</td><td><strong>${e(item.name)}</strong></td><td>${e(item.unit)}</td><td>${Number(item.quantity)}</td><td class="nowrap">${money(item.price)}</td><td>%${Number(item.vat)}</td><td class="strong nowrap">${money(Number(item.quantity)*Number(item.price)*(1+Number(item.vat)/100))}</td></tr>`).join("") : `<tr><td colspan="7" class="empty-state">Hizmet kalemi bulunmuyor.</td></tr>`}</tbody></table></div></section>

        <div class="quote-lower-grid">
          <section class="quote-content-card card"><div class="quote-section-head compact"><div><p>UYGULAMA PLANI</p><h2>İş Akışı</h2></div></div><ol class="quote-workflow-list">${(q.workflow || []).map((step,index) => `<li><span>${String(index+1).padStart(2,"0")}</span><p>${e(step)}</p></li>`).join("") || `<li class="muted">İş akışı eklenmedi.</li>`}</ol></section>
          <section class="quote-content-card card"><div class="quote-section-head compact"><div><p>TEKLİF KOŞULLARI</p><h2>Açıklama ve Notlar</h2></div></div><div class="quote-notes-preview">${e(q.description || "Açıklama eklenmedi.")}${q.notes ? `<div class="quote-extra-note"><strong>Ek Not</strong>${e(q.notes)}</div>` : ""}</div></section>
        </div>
      </div>

      <aside class="quote-summary-panel card">
        <div class="quote-summary-head"><p>TEKLİF TOPLAMI</p><span>${statusLabel(q.status)}</span></div>
        <div class="quote-summary-amount"><small>KDV Dahil Genel Toplam</small><strong>${money(q.total || totals.total).replace("—","0,00 TL")}</strong></div>
        <div class="quote-summary-rows"><div><span>Ara Toplam</span><strong>${money(totals.subtotal).replace("—","0,00 TL")}</strong></div><div><span>KDV Toplamı</span><strong>${money(totals.vat).replace("—","0,00 TL")}</strong></div></div>
        <div class="quote-summary-divider"></div>
        <div class="quote-summary-company"><img src="${e(company?.logo || LOGO_URL)}" alt="Logo"/><div><span>Teklifi Veren Firma</span><strong>${e(company?.name || "Evren Jeofizik")}</strong><small>${e(company?.subtitle || company?.email || "Jeofizik · Jeoloji Hizmetleri")}</small></div></div>
        <button class="primary-btn quote-summary-download" data-action="pdf-quote" data-id="${q.id}">${icon("download",16)} PDF İndir / Yazdır</button>
        <button class="secondary-btn quote-summary-preview" data-action="preview-pdf" data-id="${q.id}">${icon("eye",16)} Önizlemeyi Aç</button>
        <p class="quote-summary-help">İndirme düğmesi tarayıcının PDF kaydetme penceresini açar.</p>
      </aside>
    </div>
  </div>`, "quotes");
}

function pdfConditionItems(description) {
  const sections = String(description || "")
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean);
  if (!sections.length) return [{ title: "TEKLİF KOŞULLARI", text: "Teklif koşulları belirtilmemiştir." }];
  return sections.map((section, index) => {
    const clean = section.replace(/^\d+\.\s*/, "");
    const separator = clean.indexOf(":");
    if (separator > 0 && separator < 48) {
      return { title: clean.slice(0, separator).trim(), text: clean.slice(separator + 1).trim() };
    }
    return { title: `KOŞUL ${String(index + 1).padStart(2, "0")}`, text: clean };
  });
}

function pdfValidityDays(q) {
  if (!q?.date || !q?.validUntil) return Number(state.settings.validityDays || 30);
  const start = new Date(`${q.date}T12:00:00`);
  const end = new Date(`${q.validUntil}T12:00:00`);
  const days = Math.round((end - start) / 86400000);
  return Number.isFinite(days) && days > 0 ? days : Number(state.settings.validityDays || 30);
}

function renderPdfDocument(q, extraClass = "") {
  if (!q) return "";
  const company = state.companies.find((c) => c.id === q.companyId) || state.companies[0];
  const items = Array.isArray(q.items) ? q.items : [];
  const totals = calcTotals(items);
  const validityDays = pdfValidityDays(q);
  const companyContact = [company?.phone, company?.email, company?.website].filter(Boolean).join("  |  ");
  const companyLegal = [company?.taxOffice && `Vergi Dairesi: ${company.taxOffice}`, company?.taxNo && `Vergi No: ${company.taxNo}`].filter(Boolean).join("  |  ");
  const firstItems = items.slice(0, 6);
  const continuationChunks = [];
  for (let index = 6; index < items.length; index += 10) continuationChunks.push(items.slice(index, index + 10));
  const pageCount = 2 + continuationChunks.length;
  const conditions = pdfConditionItems(q.description);
  const summaryNote = q.notes || (continuationChunks.length ? "Hizmet ve ürün kalemleri takip eden sayfada devam etmektedir." : "Detaylı iş akışı ve ticari koşullar teklifin devam sayfasında yer almaktadır.");

  const header = () => `<header class="pdf-header">
    <div class="pdf-brand"><img src="${e(company?.logo || LOGO_URL)}" alt="Logo"/><div><h1>${e(company?.name || "EVREN JEOFİZİK")}</h1><strong>${e(company?.subtitle || "JEOFİZİK · JEOLOJİ HİZMETLERİ")}</strong>${company?.address ? `<p>${e(company.address)}</p>` : ""}${companyContact ? `<p>${e(companyContact)}</p>` : ""}${companyLegal ? `<p>${e(companyLegal)}</p>` : ""}</div></div>
    <div class="pdf-document-card"><h2>TEKLİF FORMU</h2><dl><div><dt>Teklif No</dt><dd>${e(q.no || "TASLAK")}</dd></div><div><dt>Tarih</dt><dd>${formatDate(q.date)}</dd></div><div><dt>Geçerlilik</dt><dd>${validityDays} gün</dd></div></dl></div>
  </header><div class="pdf-gold-rule"></div>`;

  const footer = (pageNumber) => `<footer class="pdf-footer"><span class="pdf-page-number">Sayfa ${pageNumber} / ${pageCount}</span><div><strong>${e(company?.name || "EVREN JEOFİZİK")}</strong><span>${e(companyContact || company?.footer || "Jeofizik · Jeoloji Hizmetleri")}</span><b>Bu teklif ${validityDays} gün süreyle geçerlidir.</b></div></footer>`;

  const sectionTitle = (title) => `<div class="pdf-section-title"><i></i><h2>${title}</h2></div>`;

  const itemRows = (pageItems, startIndex = 0) => pageItems.map((item, index) => `<tr><td>${startIndex + index + 1}</td><td><strong>${e(item.name)}</strong></td><td>${e(item.unit || "—")}</td><td>${Number(item.quantity || 0)}</td><td>${money(item.price).replace("—", "0,00 TL")}</td><td><strong>${money(Number(item.quantity || 0) * Number(item.price || 0)).replace("—", "0,00 TL")}</strong></td></tr>`).join("") || `<tr><td colspan="6" class="pdf-empty-row">Hizmet kalemi bulunmuyor.</td></tr>`;

  const itemsTable = (pageItems, startIndex = 0) => `<table class="pdf-items-table"><thead><tr><th>#</th><th>Açıklama</th><th>Birim</th><th>Miktar</th><th>Birim Fiyat</th><th>Tutar</th></tr></thead><tbody>${itemRows(pageItems, startIndex)}</tbody></table>`;

  const totalsBlock = () => `<div class="pdf-totals"><div><span>Ara Toplam</span><strong>${money(totals.subtotal).replace("—", "0,00 TL")}</strong></div><div><span>KDV Toplamı</span><strong>${money(totals.vat).replace("—", "0,00 TL")}</strong></div><div class="pdf-grand-total"><span>GENEL TOPLAM</span><strong>${money(q.total || totals.total).replace("—", "0,00 TL")}</strong></div></div>`;

  const firstPage = `<article class="pdf-page pdf-primary-page">${header()}
    <main class="pdf-page-content">
      <section class="pdf-section">${sectionTitle("MÜŞTERİ BİLGİLERİ")}<div class="pdf-customer-box"><strong>${e(q.customerName || "—")}</strong>${q.contact || q.phone || q.email ? `<p>${[q.contact, q.phone, q.email].filter(Boolean).map(e).join("  |  ")}</p>` : ""}${q.projectName ? `<small>${e(q.projectName)}</small>` : ""}</div></section>
      <section class="pdf-section">${sectionTitle("ÇALIŞILACAK ALAN BİLGİLERİ")}<div class="pdf-area-grid"><div><span>İl</span><strong>${e(q.city || "—")}</strong></div><div><span>İlçe</span><strong>${e(q.district || "—")}</strong></div><div><span>Mahalle / Köy</span><strong>${e(q.village || q.projectPlace || "—")}</strong></div><div><span>Ruhsat No</span><strong>${e(q.licenseNo || "—")}</strong></div><div class="wide"><span>Ruhsat Sahibi</span><strong>${e(q.licenseOwner || q.customerName || "—")}</strong></div></div></section>
      <section class="pdf-section pdf-items-section">${sectionTitle("HİZMET / ÜRÜN KALEMLERİ")}${itemsTable(firstItems)}${continuationChunks.length ? `<div class="pdf-continued-note">Hizmet kalemleri sonraki sayfada devam etmektedir.</div>` : totalsBlock()}</section>
      <section class="pdf-section pdf-note-section">${sectionTitle("AÇIKLAMA")}<div class="pdf-note-box">${e(summaryNote)}</div></section>
    </main>${footer(1)}
  </article>`;

  const continuationPages = continuationChunks.map((chunk, chunkIndex) => {
    const pageNumber = chunkIndex + 2;
    const isLast = chunkIndex === continuationChunks.length - 1;
    return `<article class="pdf-page pdf-continuation-page">${header()}<main class="pdf-page-content"><section class="pdf-section">${sectionTitle("HİZMET / ÜRÜN KALEMLERİ · DEVAM")}${itemsTable(chunk, 6 + chunkIndex * 10)}${isLast ? totalsBlock() : `<div class="pdf-continued-note">Hizmet kalemleri sonraki sayfada devam etmektedir.</div>`}</section></main>${footer(pageNumber)}</article>`;
  }).join("");

  const detailsPageNumber = pageCount;
  const detailsPage = `<article class="pdf-page pdf-secondary-page">${header()}
    <main class="pdf-page-content">
      <section class="pdf-section">${sectionTitle("İŞ AKIŞI")}<table class="pdf-workflow-table"><thead><tr><th>İş Akışı No</th><th>İş Aşaması</th></tr></thead><tbody>${(q.workflow || []).map((step, index) => `<tr><td>${index + 1}</td><td>${e(step)}</td></tr>`).join("") || `<tr><td colspan="2" class="pdf-empty-row">İş akışı belirtilmemiştir.</td></tr>`}</tbody></table></section>
      <section class="pdf-section pdf-conditions-section">${sectionTitle("TEKLİF KOŞULLARI")}<div class="pdf-conditions-grid">${conditions.map((condition, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${e(condition.title)}</strong><p>${e(condition.text)}</p></div></article>`).join("")}</div>${q.notes ? `<div class="pdf-extra-note"><strong>EK NOT</strong><span>${e(q.notes)}</span></div>` : ""}</section>
      <section class="pdf-approval"><div><span>TEKLİFİ HAZIRLAYAN</span><strong>${e(company?.name || "Evren Jeofizik")}</strong><i>Kaşe / İmza</i></div><div><span>MÜŞTERİ ONAYI</span><strong>${e(q.customerName || "")}</strong><i>Kaşe / İmza</i></div></section>
    </main>${footer(detailsPageNumber)}
  </article>`;

  return `<section class="print-sheet ${extraClass}">${firstPage}${continuationPages}${detailsPage}</section>`;
}

function renderPrintSheet() {
  const q = printQuoteData || state.quotes.find((quote) => quote.id === printQuoteId);
  return q ? renderPdfDocument(q, "print-only") : "";
}

function renderPdfPreview() {
  if (!pdfPreviewQuote) return "";
  const extraPages = Math.max(0, Math.ceil(Math.max(0, (pdfPreviewQuote.items || []).length - 6) / 10));
  return `<div class="pdf-preview-backdrop" role="dialog" aria-modal="true" aria-label="PDF önizleme"><section class="pdf-preview-modal"><header class="pdf-preview-toolbar"><div><p>PDF ÖNİZLEME</p><h2>${e(pdfPreviewQuote.no || "Taslak Teklif")}</h2><span>${2 + extraPages} sayfalık A4 teklif düzeni · Evren kurumsal şablonu</span></div><div class="pdf-preview-actions"><button class="secondary-btn" data-action="close-pdf-preview">Kapat</button><button class="primary-btn" data-action="download-preview-pdf">${icon("download",16)} PDF İndir / Yazdır</button></div></header><div class="pdf-preview-canvas">${renderPdfDocument(pdfPreviewQuote, "pdf-preview-sheet")}</div></section></div>`;
}

function render() {
  if (!isAuthenticated) {
    document.getElementById("app").innerHTML = renderLogin();
    document.title = "Evren Jeofizik · Giriş";
    bindLoginEvents();
    return;
  }
  const route = routeInfo();
  let html;
  if (route.page === "dashboard") html = renderDashboard();
  else if (route.page === "quotes") html = renderQuotes();
  else if (route.page === "customers") html = renderCustomers();
  else if (route.page === "catalog") html = renderCatalog();
  else if (route.page === "settings") html = renderSettings();
  else if (route.page === "quote-form") html = renderQuoteForm(route.id);
  else html = renderQuoteDetail(route.id);
  document.getElementById("app").innerHTML = html;
  document.title = `Evren Jeofizik Teklif · ${route.page === "dashboard" ? "Ana Panel" : route.page === "quotes" ? "Teklifler" : route.page === "customers" ? "Müşteriler" : route.page === "catalog" ? "Hizmet Kataloğu" : route.page === "settings" ? "Ayarlar" : "Teklif"}`;
  bindPageEvents();
}

async function hashValue(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bindLoginEvents() {
  document.getElementById("login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formDataObject(event.currentTarget);
    const validUser = String(data.username || "").trim().toLocaleLowerCase("tr-TR") === "evren";
    const validPassword = await hashValue(data.password || "") === PASSWORD_HASH;
    const error = document.getElementById("login-error");
    if (!validUser || !validPassword) {
      error.textContent = "Kullanıcı adı veya şifre hatalı.";
      event.currentTarget.classList.remove("login-shake");
      void event.currentTarget.offsetWidth;
      event.currentTarget.classList.add("login-shake");
      return;
    }
    sessionStorage.setItem(AUTH_KEY, "1");
    isAuthenticated = true;
    render();
    showToast("Hoş geldiniz Evren.", "success");
  });
}

function showToast(message, type = "") {
  const root = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function openModal(content, large = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "modal-backdrop";
  wrapper.id = "modal-root";
  wrapper.innerHTML = `<div class="modal ${large ? "large" : ""}" role="dialog" aria-modal="true">${content}</div>`;
  document.body.appendChild(wrapper);
}

function closeModal() { document.getElementById("modal-root")?.remove(); }

function formDataObject(form) { return Object.fromEntries(new FormData(form).entries()); }

function customerModal(customer = {}) {
  openModal(`<div class="modal-head"><h3>${customer.id ? "Müşteriyi Düzenle" : "Yeni Müşteri"}</h3><button class="modal-close" data-action="close-modal" aria-label="Kapat">×</button></div><form id="customer-form" class="modal-form" data-id="${customer.id || ""}"><div class="field"><label>Firma Adı *</label><input name="name" required value="${e(customer.name)}" /></div><div class="field-row"><div class="field"><label>Yetkili Kişi</label><input name="contact" value="${e(customer.contact)}" /></div><div class="field"><label>Telefon</label><input name="phone" value="${e(customer.phone)}" /></div></div><div class="field"><label>E-posta</label><input name="email" type="email" value="${e(customer.email)}" /></div><div class="field"><label>Adres</label><textarea name="address">${e(customer.address)}</textarea></div><div class="field-row"><div class="field"><label>Vergi Dairesi</label><input name="taxOffice" value="${e(customer.taxOffice)}" /></div><div class="field"><label>Vergi No</label><input name="taxNo" value="${e(customer.taxNo)}" /></div></div><div class="field"><label>Notlar</label><textarea name="notes">${e(customer.notes)}</textarea></div><div class="modal-actions"><button type="button" class="secondary-btn" data-action="close-modal">İptal</button><button class="primary-btn" type="submit">${icon("save",15)} Kaydet</button></div></form>`);
  document.getElementById("customer-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formDataObject(event.currentTarget);
    const id = event.currentTarget.dataset.id;
    if (id) Object.assign(state.customers.find((c) => c.id === id), data);
    else state.customers.push({ id: crypto.randomUUID(), ...data });
    saveState(); closeModal(); render(); showToast(id ? "Müşteri güncellendi." : "Müşteri kaydedildi.", "success");
  });
}

function serviceModal(service = {}) {
  openModal(`<div class="modal-head"><h3>${service.id ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}</h3><button class="modal-close" data-action="close-modal" aria-label="Kapat">×</button></div><form id="service-form" class="modal-form" data-id="${service.id || ""}"><div class="field"><label>Hizmet Adı *</label><input name="name" required placeholder="Hizmet / ürün adı" value="${e(service.name)}" /></div><div class="field"><label>Açıklama</label><textarea name="description" placeholder="Hizmet açıklaması">${e(service.description)}</textarea></div><div class="field-row"><div class="field"><label>Birim</label><input name="unit" value="${e(service.unit || "Adet")}" placeholder="Adet, Nokta, Profil..." /></div><div class="field"><label>Kategori</label><input name="category" value="${e(service.category)}" placeholder="Elektriksel Yöntemler..." /></div></div><div class="field-row"><div class="field"><label>Varsayılan Fiyat (TL)</label><input name="price" type="number" min="0" step="0.01" value="${Number(service.price || 0)}" /></div><div class="field"><label>KDV Oranı (%)</label><input name="vat" type="number" min="0" max="100" value="${Number(service.vat ?? state.settings.vatRate)}" /></div></div><div class="modal-actions"><button type="button" class="secondary-btn" data-action="close-modal">İptal</button><button class="primary-btn" type="submit">${icon("save",15)} Kaydet</button></div></form>`);
  document.getElementById("service-form").addEventListener("submit", (event) => {
    event.preventDefault(); const data = formDataObject(event.currentTarget); const id = event.currentTarget.dataset.id;
    data.price = Number(data.price); data.vat = Number(data.vat); data.active = id ? state.services.find((s) => s.id === id).active : true;
    if (id) Object.assign(state.services.find((s) => s.id === id), data); else state.services.push({ id: crypto.randomUUID(), ...data });
    saveState(); closeModal(); render(); showToast(id ? "Hizmet güncellendi." : "Hizmet kaydedildi.", "success");
  });
}

function companyModal(company = {}) {
  openModal(`<div class="modal-head"><h3>${company.id ? "Firmayı Düzenle" : "Yeni Firma"}</h3><button class="modal-close" data-action="close-modal" aria-label="Kapat">×</button></div><form id="company-form" class="modal-form" data-id="${company.id || ""}"><div class="field"><label>Logo URL</label><input name="logo" value="${e(company.logo || LOGO_URL)}" /></div><div class="field"><label>Firma Adı *</label><input name="name" required value="${e(company.name)}" /></div><div class="field"><label>Alt Başlık / Slogan</label><input name="subtitle" value="${e(company.subtitle)}" /></div><div class="field"><label>Adres</label><textarea name="address">${e(company.address)}</textarea></div><div class="field-row"><div class="field"><label>Telefon</label><input name="phone" value="${e(company.phone)}" /></div><div class="field"><label>E-posta</label><input name="email" type="email" value="${e(company.email)}" /></div></div><div class="field"><label>Web Sitesi</label><input name="website" value="${e(company.website)}" placeholder="www.evrenjeofizik.com" /></div><div class="field-row"><div class="field"><label>Vergi Dairesi</label><input name="taxOffice" value="${e(company.taxOffice)}" /></div><div class="field"><label>Vergi No</label><input name="taxNo" value="${e(company.taxNo)}" /></div></div><div class="separator"></div><div class="field-row"><div class="field"><label>Banka Bilgileri</label><input name="bank" value="${e(company.bank)}" placeholder="Banka adı / şube" /></div><div class="field"><label>IBAN</label><input name="iban" value="${e(company.iban)}" placeholder="TR..." /></div></div><div class="field"><label>Teklif Alt Bilgi Metni</label><textarea name="footer" placeholder="PDF alt kısmında görünecek metin">${e(company.footer)}</textarea></div><label style="display:flex;gap:9px;align-items:center"><input name="isDefault" type="checkbox" style="width:18px;height:18px" ${company.isDefault ? "checked" : ""}/> Varsayılan firma yap</label><div class="modal-actions"><button type="button" class="secondary-btn" data-action="close-modal">İptal</button><button class="primary-btn" type="submit">${icon("save",15)} Kaydet</button></div></form>`, true);
  document.getElementById("company-form").addEventListener("submit", (event) => {
    event.preventDefault(); const data = formDataObject(event.currentTarget); const id = event.currentTarget.dataset.id; data.isDefault = event.currentTarget.elements.isDefault.checked;
    if (data.isDefault) state.companies.forEach((c) => { c.isDefault = false; });
    if (id) Object.assign(state.companies.find((c) => c.id === id), data); else state.companies.push({ id: crypto.randomUUID(), ...data });
    if (!state.companies.some((c) => c.isDefault)) state.companies[0].isDefault = true;
    saveState(); closeModal(); render(); showToast(id ? "Firma güncellendi." : "Firma kaydedildi.", "success");
  });
}

function applyQuoteFilters() {
  const query = document.getElementById("quote-search")?.value.toLocaleLowerCase("tr-TR") || "";
  const status = document.getElementById("quote-status")?.value || "";
  const start = document.getElementById("filter-start")?.value || "";
  const end = document.getElementById("filter-end")?.value || "";
  const min = Number(document.getElementById("filter-min")?.value || 0);
  const max = Number(document.getElementById("filter-max")?.value || 0);
  document.querySelectorAll("[data-quote-row]").forEach((row) => {
    const q = state.quotes.find((item) => item.no === row.cells[0].textContent.trim());
    const visible = row.dataset.search.includes(query) && (!status || row.dataset.status === status) && (!start || q.date >= start) && (!end || q.date <= end) && (!min || Number(q.total) >= min) && (!max || Number(q.total) <= max);
    row.hidden = !visible;
  });
}

function bindPageEvents() {
  const quoteSearch = document.getElementById("quote-search");
  [quoteSearch, document.getElementById("quote-status"), document.getElementById("filter-start"), document.getElementById("filter-end"), document.getElementById("filter-min"), document.getElementById("filter-max")].filter(Boolean).forEach((el) => el.addEventListener("input", applyQuoteFilters));
  const customerSearch = document.getElementById("customer-search");
  customerSearch?.addEventListener("input", () => {
    const query = customerSearch.value.toLocaleLowerCase("tr-TR");
    document.querySelectorAll("[data-customer-card]").forEach((card) => { card.hidden = !card.dataset.search.includes(query); });
  });
  const pickerSearch = document.getElementById("service-picker-search");
  pickerSearch?.addEventListener("input", () => {
    const query = pickerSearch.value.toLocaleLowerCase("tr-TR");
    document.querySelectorAll("[data-picker-item]").forEach((item) => { item.hidden = !item.dataset.search.includes(query); });
  });
  document.getElementById("settings-form")?.addEventListener("submit", (event) => {
    event.preventDefault(); const data = formDataObject(event.currentTarget); state.settings = { vatRate: Number(data.vatRate), validityDays: Number(data.validityDays) }; saveState(); showToast("Varsayılanlar kaydedildi.", "success");
  });
  document.getElementById("quote-images")?.addEventListener("change", (event) => {
    quoteDraft.images = [...event.target.files].map((file) => file.name); showToast(`${quoteDraft.images.length} görsel seçildi.`); render();
  });
}

function prepareQuoteForPdf(source) {
  if (!source) return null;
  const copy = structuredClone(source);
  copy.total = calcTotals(copy.items || []).total;
  return copy;
}

function openPdfPrint(source) {
  const prepared = prepareQuoteForPdf(source);
  if (!prepared) return;
  printQuoteId = prepared.id || null;
  printQuoteData = prepared;
  pdfPreviewQuote = null;
  render();
  document.title = `${prepared.no || "Teklif"} · Evren Jeofizik`;
  setTimeout(() => window.print(), 180);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");
  if (link) { event.preventDefault(); navigate(link.dataset.link); return; }
  const control = event.target.closest("[data-action]");
  if (!control) return;
  const action = control.dataset.action;
  if (action === "open-menu") document.getElementById("app-shell")?.classList.add("menu-open");
  if (action === "close-menu") document.getElementById("app-shell")?.classList.remove("menu-open");
  if (action === "logout") {
    sessionStorage.removeItem(AUTH_KEY);
    isAuthenticated = false;
    quoteDraft = null;
    quoteTab = "info";
    render();
  }
  if (action === "close-modal") closeModal();
  if (action === "new-customer") customerModal();
  if (action === "edit-customer") customerModal(state.customers.find((c) => c.id === control.dataset.id));
  if (action === "delete-customer") {
    if (confirm("Bu müşteri kaydını silmek istiyor musunuz?")) { state.customers = state.customers.filter((c) => c.id !== control.dataset.id); saveState(); render(); showToast("Müşteri silindi."); }
  }
  if (action === "new-service") serviceModal();
  if (action === "edit-service") serviceModal(state.services.find((s) => s.id === control.dataset.id));
  if (action === "delete-service") {
    if (confirm("Bu hizmeti silmek istiyor musunuz?")) { state.services = state.services.filter((s) => s.id !== control.dataset.id); saveState(); render(); showToast("Hizmet silindi."); }
  }
  if (action === "new-company") companyModal();
  if (action === "edit-company") companyModal(state.companies.find((c) => c.id === control.dataset.id));
  if (action === "delete-company") {
    if (state.companies.length === 1) return showToast("En az bir firma bulunmalıdır.", "error");
    if (confirm("Bu firmayı silmek istiyor musunuz?")) { state.companies = state.companies.filter((c) => c.id !== control.dataset.id); if (!state.companies.some((c) => c.isDefault)) state.companies[0].isDefault = true; saveState(); render(); showToast("Firma silindi."); }
  }
  if (action === "default-company") { state.companies.forEach((c) => { c.isDefault = c.id === control.dataset.id; }); saveState(); render(); showToast("Varsayılan firma değiştirildi.", "success"); }
  if (action === "toggle-advanced") document.getElementById("advanced-filter")?.classList.toggle("hidden");
  if (action === "quote-tab") { quoteTab = control.dataset.tab; render(); }
  if (action === "preview-pdf") {
    pdfPreviewQuote = prepareQuoteForPdf(state.quotes.find((q) => q.id === control.dataset.id));
    render();
  }
  if (action === "preview-pdf-draft") {
    if (!quoteDraft?.no.trim() || !quoteDraft?.customerName.trim()) return showToast("Önizleme için teklif no ve müşteri adı gereklidir.", "error");
    pdfPreviewQuote = prepareQuoteForPdf(quoteDraft);
    render();
  }
  if (action === "close-pdf-preview") { pdfPreviewQuote = null; render(); }
  if (action === "download-preview-pdf") openPdfPrint(pdfPreviewQuote);
  if (action === "add-service-item") {
    const service = state.services.find((s) => s.id === control.dataset.id);
    quoteDraft.items.push({ id: crypto.randomUUID(), serviceId: service.id, name: service.name, unit: service.unit, quantity: 1, price: Number(service.price || 0), vat: Number(service.vat ?? state.settings.vatRate) }); render();
  }
  if (action === "manual-item") { quoteDraft.items.push({ id: crypto.randomUUID(), name: "Yeni hizmet kalemi", unit: "Adet", quantity: 1, price: 0, vat: state.settings.vatRate }); render(); }
  if (action === "remove-item") { quoteDraft.items.splice(Number(control.dataset.index), 1); render(); }
  if (action === "add-workflow") { quoteDraft.workflow.push("Yeni iş aşaması"); render(); }
  if (action === "remove-workflow") { quoteDraft.workflow.splice(Number(control.dataset.index), 1); render(); }
  if (action === "save-quote") {
    if (!quoteDraft.no.trim() || !quoteDraft.customerName.trim()) return showToast("Teklif no ve müşteri adı zorunludur.", "error");
    const totals = calcTotals(quoteDraft.items); quoteDraft.status = control.dataset.status; quoteDraft.total = totals.total;
    const existingIndex = state.quotes.findIndex((q) => q.id === quoteDraft.id);
    if (existingIndex >= 0) state.quotes[existingIndex] = structuredClone(quoteDraft); else state.quotes.push(structuredClone(quoteDraft));
    saveState(); const id = quoteDraft.id; quoteDraft = null; navigate(`/quotes/${id}`); showToast(control.dataset.status === "sent" ? "Teklif kaydedildi ve gönderildi." : "Taslak kaydedildi.", "success");
  }
  if (action === "delete-quote") {
    if (confirm("Bu teklifi silmek istiyor musunuz?")) { state.quotes = state.quotes.filter((q) => q.id !== control.dataset.id); saveState(); if (routeInfo().page === "quote-detail") navigate("/quotes"); else render(); showToast("Teklif silindi."); }
  }
  if (action === "copy-quote") {
    const source = state.quotes.find((q) => q.id === control.dataset.id); const copy = structuredClone(source); copy.id = crypto.randomUUID(); copy.no = `${source.no}-KOPYA`; copy.date = today(); copy.validUntil = addDays(today(), state.settings.validityDays); copy.status = "draft"; state.quotes.push(copy); saveState(); render(); showToast("Teklif kopyalandı.", "success");
  }
  if (action === "pdf-quote") {
    openPdfPrint(state.quotes.find((q) => q.id === control.dataset.id));
  }
});

document.addEventListener("input", (event) => {
  const model = event.target.dataset.model;
  if (model && quoteDraft) {
    quoteDraft[model] = event.target.value;
    if (model === "date" && !quoteDraft.validUntil) quoteDraft.validUntil = addDays(event.target.value, state.settings.validityDays);
    document.querySelectorAll('[data-action="save-quote"], [data-action="preview-pdf-draft"]').forEach((button) => { button.disabled = !(quoteDraft.no.trim() && quoteDraft.customerName.trim()); });
  }
  if (event.target.dataset.itemIndex !== undefined && quoteDraft) {
    const index = Number(event.target.dataset.itemIndex); const field = event.target.dataset.itemField; quoteDraft.items[index][field] = ["quantity","price","vat"].includes(field) ? Number(event.target.value) : event.target.value;
  }
  if (event.target.dataset.workflowIndex !== undefined && quoteDraft) quoteDraft.workflow[Number(event.target.dataset.workflowIndex)] = event.target.value;
});

document.addEventListener("change", (event) => {
  if (event.target.dataset.action === "select-customer" && quoteDraft) {
    const customer = state.customers.find((c) => c.id === event.target.value);
    quoteDraft.customerId = customer?.id || "";
    if (customer) Object.assign(quoteDraft, { customerName: customer.name, contact: customer.contact, phone: customer.phone, email: customer.email });
    render();
  }
  if (event.target.dataset.action === "toggle-service") {
    const service = state.services.find((s) => s.id === event.target.dataset.id); service.active = event.target.checked; saveState(); showToast("Hizmet durumu güncellendi.");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && pdfPreviewQuote) { pdfPreviewQuote = null; render(); }
});

window.addEventListener("popstate", () => { quoteDraft = null; quoteTab = "info"; pdfPreviewQuote = null; render(); });
window.addEventListener("afterprint", () => { printQuoteId = null; printQuoteData = null; render(); });

render();
