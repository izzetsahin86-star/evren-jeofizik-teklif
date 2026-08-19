(() => {
  "use strict";

  const STORAGE_KEY = "evren-jeofizik-field-professional-v1";
  let activeKey = "";
  let activeTab = "general";
  let mountTimer = 0;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const defaults = () => ({
    siteArea: "",
    coordinateSystem: "ITRF96 / TUREF (proje verisine göre)",
    access: "Araç ve yaya erişimi saha başlangıcında kontrol edilecektir.",
    terrain: "Arazi topoğrafyası ve yüzey koşulları saha keşfi ile netleştirilecektir.",
    workingHours: "08:00 – 18:00 (saha ve izin koşullarına göre)",
    permits: "Ruhsat, arazi giriş ve çalışma izinleri işveren koordinasyonunda sağlanacaktır.",
    method: "",
    stationCount: "",
    lineCount: "",
    lineSpacing: "",
    measurementSpacing: "",
    targetDepth: "",
    surveyControl: "GNSS / GPS ile saha konum kontrolü ve günlük veri kalite kontrolü",
    team: "1 Jeofizik Mühendisi + saha ihtiyacına göre teknik personel",
    vehicle: "4x4 arazi aracı / saha koşullarına uygun ulaşım",
    equipment: "Jeofizik ölçüm sistemi, GNSS/GPS, saha bilgisayarı, haberleşme ve yardımcı ekipman",
    ppe: "Baret, reflektif yelek, iş ayakkabısı, eldiven, gözlük ve ilk yardım seti",
    mobilization: "Mobilizasyon ve demobilizasyon saha konumuna göre planlanacaktır.",
    accommodation: "Konaklama ve günlük saha lojistiği çalışma programına göre organize edilecektir.",
    hse: "Saha başlangıcında risk değerlendirmesi yapılır; günlük toolbox konuşması ve ekipman kontrolü uygulanır.",
    weather: "Şiddetli yağış, yıldırım, fırtına, taşkın veya güvenli erişimi engelleyen koşullarda çalışma güvenli biçimde durdurulur.",
    communication: "Saha sorumlusu ile işveren temsilcisi arasında günlük koordinasyon ve ilerleme bilgilendirmesi yapılır.",
    schedule: "Mobilizasyon: 1 gün\nSaha ölçümleri: çalışma kapsamına göre\nGünlük veri kontrolü: saha ile eş zamanlı\nDemobilizasyon: 1 gün",
    deliverables: "Saha ölçüm kayıtları\nGünlük kalite kontrolü\nKonum / hat / istasyon bilgileri\nİşlenmiş veri, harita ve kesitler\nTeknik değerlendirme\nNihai PDF rapor",
    assumptions: "Çalışma alanına güvenli erişimin sağlanması, gerekli koordinat ve ruhsat bilgilerinin işveren tarafından paylaşılması ve ölçüm noktalarında çalışma izninin bulunması esas alınmıştır.",
    exclusions: "Resmi harçlar, üçüncü taraf analizleri, işveren kaynaklı beklemeler, özel güvenlik/iş makinesi ihtiyacı ve teklifte açıkça belirtilmeyen ek çalışmalar aksi yazılmadıkça kapsam dışıdır.",
    fieldNotes: "",
  });

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  function writeStore(store) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
    catch (error) { console.warn("Saha detayları kaydedilemedi", error); }
  }

  function normalizeKey(value = "") {
    return value.trim().toLocaleUpperCase("tr-TR").replace(/\s+/g, "-").replace(/[^A-ZÇĞİÖŞÜ0-9_-]/g, "");
  }

  function contextKey() {
    const inputNo = $('[name="no"]')?.value?.trim();
    if (inputNo) return `no:${normalizeKey(inputNo)}`;
    const printNo = $(".print-quote-number")?.textContent?.trim();
    if (printNo) return `no:${normalizeKey(printNo)}`;
    const route = (location.hash || "").replace(/^#/, "");
    const id = route.match(/^\/quotes\/([^/]+)/)?.[1];
    return id ? `id:${id}` : "";
  }

  function dataFor(key = contextKey()) {
    if (!key) return defaults();
    const store = readStore();
    return { ...defaults(), ...(store[key] || {}) };
  }

  function saveData(data, key = contextKey()) {
    if (!key) return;
    const store = readStore();
    store[key] = data;
    writeStore(store);
  }

  function migrateKey() {
    const next = contextKey();
    if (!next) return "";
    if (activeKey && activeKey !== next) {
      const store = readStore();
      if (store[activeKey] && !store[next]) store[next] = store[activeKey];
      writeStore(store);
    }
    activeKey = next;
    return next;
  }

  function inferMethod() {
    const names = $$('[data-item-field="name"]').map((el) => el.value).join(" ") ||
      $$(".print-table tbody td:nth-child(2)").map((el) => el.textContent).join(" ");
    const upper = names.toLocaleUpperCase("tr-TR");
    const methods = [];
    if (/\bDES\b|DÜŞEY ELEKTRİK|REZİSTİVİTE/.test(upper)) methods.push("DES / Rezistivite");
    if (/\bMT\b|MANYETOTELLUR/.test(upper)) methods.push("Manyetotellürik (MT)");
    if (/\bSP\b|SELF POTANS/.test(upper)) methods.push("Self Potansiyel (SP)");
    if (/SİSMİK|SISMIK/.test(upper)) methods.push("Sismik");
    if (/MANYETİK|MANYETIK/.test(upper)) methods.push("Manyetik");
    if (/GRAVİTE|GRAVITE/.test(upper)) methods.push("Gravite");
    if (/GPR|YER RADARI/.test(upper)) methods.push("GPR / Yer Radarı");
    return methods.length ? methods.join(" + ") : "Teklif kapsamındaki jeofizik saha ölçümleri";
  }

  function completion(data) {
    const keys = ["coordinateSystem", "access", "method", "team", "equipment", "hse", "schedule", "deliverables", "assumptions"];
    const done = keys.filter((key) => String(data[key] || "").trim()).length;
    return Math.round((done / keys.length) * 100);
  }

  function field(label, name, value, placeholder = "") {
    return `<label class="fp-field"><span>${esc(label)}</span><input class="input" data-fp-field="${name}" value="${esc(value)}" placeholder="${esc(placeholder)}" /></label>`;
  }

  function area(label, name, value, placeholder = "", rows = 3) {
    return `<label class="fp-field fp-field-wide"><span>${esc(label)}</span><textarea class="textarea" rows="${rows}" data-fp-field="${name}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></label>`;
  }

  function tabButton(id, label, hint) {
    return `<button type="button" class="fp-tab ${activeTab === id ? "active" : ""}" data-fp-tab="${id}"><strong>${label}</strong><small>${hint}</small></button>`;
  }

  function panelHtml(data) {
    const score = completion(data);
    const method = data.method || inferMethod();
    return `<section class="fp-panel" data-fp-panel>
      <header class="fp-panel-head">
        <div class="fp-panel-title">
          <span class="fp-kicker">SAHA PLANLAMA MODÜLÜ</span>
          <h3>Saha & Teknik Uygulama Detayları</h3>
          <p>Teklifin sahada nasıl uygulanacağını, ekipmanını, güvenlik yaklaşımını ve teslimatlarını tanımlayın.</p>
        </div>
        <div class="fp-readiness"><span>Hazırlık</span><strong>${score}%</strong><i><b style="width:${score}%"></b></i></div>
      </header>
      <nav class="fp-tabs" aria-label="Saha detayları">
        ${tabButton("general", "Genel & Erişim", "Saha / izin / topoğrafya")}
        ${tabButton("method", "Yöntem & Ölçüm", "Hat / istasyon / kalite")}
        ${tabButton("crew", "Ekip & İSG", "Personel / araç / güvenlik")}
        ${tabButton("delivery", "Program & Teslimat", "Süre / rapor / kapsam")}
      </nav>
      <div class="fp-tab-content ${activeTab === "general" ? "active" : ""}" data-fp-pane="general">
        <div class="fp-grid">
          ${field("Çalışma Alanı / Saha Büyüklüğü", "siteArea", data.siteArea, "Örn. 120 ha / 3 ruhsat alanı")}
          ${field("Koordinat Sistemi", "coordinateSystem", data.coordinateSystem, "ITRF96 / TUREF / WGS84")}
          ${field("Günlük Çalışma Saatleri", "workingHours", data.workingHours)}
          ${field("İzin / Ruhsat Sorumluluğu", "permits", data.permits)}
          ${area("Saha Erişimi", "access", data.access, "Yol, araç, yaya erişimi ve kısıtlar")}
          ${area("Topoğrafya / Zemin Koşulları", "terrain", data.terrain, "Eğim, bitki örtüsü, zemin ve saha engelleri")}
        </div>
      </div>
      <div class="fp-tab-content ${activeTab === "method" ? "active" : ""}" data-fp-pane="method">
        <div class="fp-method-banner"><span>Önerilen / algılanan yöntem</span><strong>${esc(method)}</strong><button type="button" data-fp-use-method>Forma aktar</button></div>
        <div class="fp-grid fp-grid-3">
          ${field("Jeofizik Yöntem", "method", data.method, method)}
          ${field("Hat Sayısı", "lineCount", data.lineCount, "Örn. 8 hat")}
          ${field("İstasyon / Nokta Sayısı", "stationCount", data.stationCount, "Örn. 48 nokta")}
          ${field("Hat Aralığı", "lineSpacing", data.lineSpacing, "Örn. 100 m")}
          ${field("Ölçüm Aralığı", "measurementSpacing", data.measurementSpacing, "Örn. 25 m")}
          ${field("Hedef Araştırma Derinliği", "targetDepth", data.targetDepth, "Örn. 500–1500 m")}
          ${area("Saha Kontrolü & Veri Kalitesi", "surveyControl", data.surveyControl, "Konumlama, tekrar ölçüm ve günlük QC", 3)}
        </div>
      </div>
      <div class="fp-tab-content ${activeTab === "crew" ? "active" : ""}" data-fp-pane="crew">
        <div class="fp-grid">
          ${field("Saha Ekibi", "team", data.team)}
          ${field("Araç / Ulaşım", "vehicle", data.vehicle)}
          ${area("Ana Ekipman", "equipment", data.equipment, "Ölçüm cihazları ve yardımcı ekipman")}
          ${area("KKD / Güvenlik Ekipmanı", "ppe", data.ppe, "Kişisel koruyucu donanımlar")}
          ${area("Mobilizasyon", "mobilization", data.mobilization)}
          ${area("Konaklama / Günlük Lojistik", "accommodation", data.accommodation)}
          ${area("İSG Uygulaması", "hse", data.hse, "Risk analizi, toolbox, ekipman kontrolü")}
          ${area("Hava / Saha Durdurma Kriterleri", "weather", data.weather)}
          ${area("Saha İletişimi & Koordinasyon", "communication", data.communication)}
        </div>
      </div>
      <div class="fp-tab-content ${activeTab === "delivery" ? "active" : ""}" data-fp-pane="delivery">
        <div class="fp-grid">
          ${area("Saha İş Programı", "schedule", data.schedule, "Mobilizasyon, ölçüm, QC, demobilizasyon", 5)}
          ${area("Teslim Edilecek Çıktılar", "deliverables", data.deliverables, "Haritalar, kesitler, veri ve rapor", 5)}
          ${area("Teknik Varsayımlar", "assumptions", data.assumptions, "Teklifin dayandığı saha ve işveren varsayımları", 4)}
          ${area("Kapsam Dışı / Hariç İşler", "exclusions", data.exclusions, "Teklife dahil olmayan işler", 4)}
          ${area("Saha Özel Notları", "fieldNotes", data.fieldNotes, "Bu projeye özel saha notları", 4)}
        </div>
      </div>
    </section>`;
  }

  function currentDataFromPanel() {
    const data = dataFor(activeKey || contextKey());
    $$('[data-fp-field]').forEach((el) => { data[el.dataset.fpField] = el.value; });
    return data;
  }

  function mountEditor() {
    const form = $("#quote-form");
    const editor = $(".editor-shell");
    if (!form || !editor) return false;
    migrateKey();
    const existing = $('[data-fp-panel]', form);
    if (existing) return true;
    form.insertAdjacentHTML("afterbegin", panelHtml(dataFor(activeKey)));
    return true;
  }

  function valueOrDash(value) {
    return String(value || "").trim() || "—";
  }

  function listHtml(value) {
    return String(value || "")
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => `<li>${esc(item)}</li>`)
      .join("");
  }

  function printSections(data) {
    const method = data.method || inferMethod();
    const metrics = [
      ["Yöntem", method],
      ["Koordinat", data.coordinateSystem],
      ["Saha", data.siteArea],
      ["Hat", data.lineCount],
      ["İstasyon", data.stationCount],
      ["Hedef derinlik", data.targetDepth],
    ].filter(([, value]) => String(value || "").trim());

    return `<section class="print-section fp-print-section" data-fp-print="field">
      <div class="print-section-heading"><span>S1</span><div><h3>Saha Uygulama Planı</h3><p>Ölçüm yaklaşımı, saha koşulları ve kalite kontrol çerçevesi</p></div></div>
      <div class="fp-print-metrics">${metrics.map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("")}</div>
      <div class="fp-print-two">
        <div class="fp-print-card"><span>SAHA ERİŞİMİ</span><p>${esc(valueOrDash(data.access))}</p></div>
        <div class="fp-print-card"><span>TOPOĞRAFYA / ZEMİN</span><p>${esc(valueOrDash(data.terrain))}</p></div>
        <div class="fp-print-card"><span>İZİN & ÇALIŞMA SAATİ</span><p>${esc(valueOrDash(data.permits))}</p><small>${esc(valueOrDash(data.workingHours))}</small></div>
        <div class="fp-print-card"><span>VERİ KALİTE KONTROLÜ</span><p>${esc(valueOrDash(data.surveyControl))}</p></div>
      </div>
    </section>
    <section class="print-section fp-print-section" data-fp-print="crew">
      <div class="print-section-heading"><span>S2</span><div><h3>Ekip, Ekipman & İSG</h3><p>Saha organizasyonu, lojistik ve güvenli çalışma esasları</p></div></div>
      <div class="fp-print-three">
        <div class="fp-print-card"><span>SAHA EKİBİ</span><p>${esc(valueOrDash(data.team))}</p><small>${esc(valueOrDash(data.vehicle))}</small></div>
        <div class="fp-print-card"><span>EKİPMAN</span><p>${esc(valueOrDash(data.equipment))}</p></div>
        <div class="fp-print-card"><span>KKD / GÜVENLİK</span><p>${esc(valueOrDash(data.ppe))}</p></div>
      </div>
      <div class="fp-print-hse"><div><b>İSG</b><span>${esc(valueOrDash(data.hse))}</span></div><div><b>Hava / Durdurma</b><span>${esc(valueOrDash(data.weather))}</span></div><div><b>Koordinasyon</b><span>${esc(valueOrDash(data.communication))}</span></div></div>
    </section>
    <section class="print-section fp-print-section" data-fp-print="delivery">
      <div class="print-section-heading"><span>S3</span><div><h3>İş Programı & Teslimatlar</h3><p>Saha zamanlaması, raporlama çıktıları ve teknik sınırlar</p></div></div>
      <div class="fp-print-two fp-print-lists">
        <div class="fp-print-card"><span>SAHA İŞ PROGRAMI</span><ul>${listHtml(data.schedule)}</ul></div>
        <div class="fp-print-card"><span>TESLİM EDİLECEK ÇIKTILAR</span><ul>${listHtml(data.deliverables)}</ul></div>
      </div>
      <div class="fp-print-note"><b>Teknik varsayımlar</b><p>${esc(valueOrDash(data.assumptions))}</p></div>
      <div class="fp-print-note muted"><b>Kapsam dışı / hariç işler</b><p>${esc(valueOrDash(data.exclusions))}</p></div>
      ${data.fieldNotes?.trim() ? `<div class="fp-print-note accent"><b>Saha özel notu</b><p>${esc(data.fieldNotes)}</p></div>` : ""}
    </section>`;
  }

  function updatePrintSheet(sheet, data) {
    if (!sheet) return;
    $$('[data-fp-print]', sheet).forEach((el) => el.remove());
    const target = $(".print-terms", sheet) || $(".print-approval", sheet) || $(".print-footer", sheet);
    if (!target) return;
    target.insertAdjacentHTML("beforebegin", printSections(data));
  }

  function updateAllPrints() {
    const key = migrateKey();
    if (!key) return;
    const data = currentDataFromPanel();
    if (!data.method.trim()) data.method = "";
    saveData(data, key);
    $$(".print-sheet").forEach((sheet) => updatePrintSheet(sheet, data));
    const score = completion(data);
    const readiness = $(".fp-readiness");
    if (readiness) {
      $("strong", readiness).textContent = `${score}%`;
      $("b", readiness).style.width = `${score}%`;
    }
  }

  function mount() {
    clearTimeout(mountTimer);
    mountTimer = setTimeout(() => {
      mountEditor();
      updateAllPrints();
    }, 30);
  }

  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-fp-tab]");
    if (tab) {
      event.preventDefault();
      activeTab = tab.dataset.fpTab;
      $$(".fp-tab").forEach((el) => el.classList.toggle("active", el.dataset.fpTab === activeTab));
      $$('[data-fp-pane]').forEach((el) => el.classList.toggle("active", el.dataset.fpPane === activeTab));
      return;
    }

    const useMethod = event.target.closest("[data-fp-use-method]");
    if (useMethod) {
      const input = $('[data-fp-field="method"]');
      if (input) {
        input.value = inferMethod();
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      return;
    }

    if (event.target.closest(".editor-shell [data-action]")) {
      setTimeout(mount, 0);
      setTimeout(mount, 100);
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-fp-field]")) {
      updateAllPrints();
      return;
    }
    if (event.target.closest("#quote-form")) {
      setTimeout(updateAllPrints, 0);
      setTimeout(updateAllPrints, 80);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.closest("#quote-form")) {
      setTimeout(mount, 0);
      setTimeout(updateAllPrints, 100);
    }
  });

  addEventListener("hashchange", mount);
  addEventListener("popstate", mount);
  addEventListener("afterprint", updateAllPrints);

  const app = $("#app");
  if (app) {
    new MutationObserver((mutations) => {
      const onlyOwn = mutations.every((m) => {
        const node = m.target instanceof Element ? m.target : m.target.parentElement;
        return node?.closest?.("[data-fp-panel], [data-fp-print]");
      });
      if (!onlyOwn) mount();
    }).observe(app, { childList: true, subtree: true });
  }

  mount();
})();
