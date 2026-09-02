(() => {
  const AUTH_KEY = "evren-jeofizik-auth";
  const STORAGE_KEY = "evren-jeofizik-ced-v1";
  const COMPANY = {
    name: "EVREN JEOFİZİK HİZ. VE TEK. TİC. LTD. ŞTİ.",
    subtitle: "JEOFİZİK - JEOLOJİ HİZMETLERİ",
    logo: "/evren-logo.png",
    address: "Dumlupınar Mah. Kocatepe Merkez Mah. No:2 Ordu Blv. No:4 İç Kapı No:309 Merkez/AFYONKARAHİSAR",
    phone: "0 532 792 79 10",
    email: "jeofizikhizmetleri@gmail.com",
    website: "www.evrenjeofizik.com"
  };

  const COMPANY_WORK = `Proje Tanıtım Dosyası (ÇED) hazırlanması işlemleri, işin kabulü sonrasında yürürlükteki Yeterlik Tebliği hükümleri gereğince proje alanının yerinde tetkiki için ilgili Çevre, Şehircilik ve İklim Değişikliği İl Müdürlüğüne resmi müracaat ile başlatılacaktır.

Proje alanının yerinde incelenmesini takiben, projeye ilişkin bilgi, belge ve haritaların temini ile hazırlanacak dosya ilgili kuruma sunulacak ve süreç firma tarafından takip edilecektir.`;

  const EMPLOYER_WORK = `Projeye ilişkin bilgi, belge, harita, plan ve vaziyet planı gibi dokümanların firmamıza teslim edilmesi.
Saha incelemesinde proje yerinin gösterilmesi ve gerekli yerinde bilgilerin verilmesi.
Resmi harçlar, belge ücretleri ve kurumlarca talep edilen ek çalışma bedellerinin ödenmesi.`;

  const DEFAULT_PAYMENT_NOTES = `Teklifin onaylanması halinde toplam hizmet bedelinin %60’ı peşin talep edilecektir, kalan kısmın tahsilatı iş bitiminde tamamlanacaktır.
Onaylanan teklif sözleşme yerine geçer.`;

  const DEFAULT_OFFICIAL_EXPENSES = [
    { id: crypto.randomUUID(), name: "Format Bedeli (ÇED Raporu / Proje Bedeli 0-10 Milyon TL)", institution: "ÇŞİDB Döner Sermayesi", amount: 205000 },
    { id: crypto.randomUUID(), name: "1/100.000 Ölçekli Çevre Düzeni Planı, Lejandı ve Plan Hükümleri", institution: "Mekansal Planlama Genel Müdürlüğü", amount: 0 }
  ];

  const DEFAULT_SERVICES = [
    { id: crypto.randomUUID(), name: "Hidrojeolojik Değerlendirme Raporu", amount: 100000 },
    { id: crypto.randomUUID(), name: "Toprak Koruma Projesi", amount: 60000 },
    { id: crypto.randomUUID(), name: "Mera Geri Dönüşüm Projesi", amount: 30000 },
    { id: crypto.randomUUID(), name: "Proje Tanıtım Dosyası (ÇED) Hazırlanması Mühendislik Hizmet Bedeli", amount: 160000 },
    { id: crypto.randomUUID(), name: "Meteorolojiden Bülten ve Hava Modelleme Verilerinin Alınması", amount: 50000 }
  ];

  if (sessionStorage.getItem(AUTH_KEY) !== "1") {
    location.replace("/");
    return;
  }

  let proposals = loadProposals();
  let draft = null;
  let editingId = null;

  const app = document.getElementById("ced-app");
  const toastEl = document.getElementById("ced-toast");

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(dateString, days) {
    const d = new Date(`${dateString}T12:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function formatDate(date) {
    if (!date) return "—";
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T12:00:00`));
  }

  function money(value) {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(Number(value || 0));
  }

  function e(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nextQuoteNo() {
    const year = new Date().getFullYear();
    const count = proposals.filter((p) => String(p.quoteNo || "").includes(String(year))).length + 1;
    return `EJ-${year}-CED-${String(count).padStart(4, "0")}`;
  }

  function newProposal() {
    const date = today();
    return {
      id: crypto.randomUUID(),
      quoteNo: nextQuoteNo(),
      date,
      validUntil: addDays(date, 30),
      title: "Proje Tanıtım Dosyası (ÇED) Hazırlama",
      customerName: "",
      city: "",
      district: "",
      licenseNumbers: "",
      paymentNotes: DEFAULT_PAYMENT_NOTES,
      officialExpenses: clone(DEFAULT_OFFICIAL_EXPENSES).map((row) => ({ ...row, id: crypto.randomUUID() })),
      services: clone(DEFAULT_SERVICES).map((row) => ({ ...row, id: crypto.randomUUID() })),
      updatedAt: new Date().toISOString()
    };
  }

  function loadProposals() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
  }

  function introText(q) {
    const area = [q.city ? `${q.city} ili` : "", q.district ? `${q.district} ilçesi sınırları dahilinde` : ""].filter(Boolean).join(", ");
    const licenses = q.licenseNumbers ? `${q.licenseNumbers} numaralı ruhsat saha/sahaları ile ilgili olarak ` : "";
    return `${area ? area + " bulunan " : ""}${licenses}\"${q.title || "Proje Tanıtım Dosyası (ÇED) Hazırlama"}\" işi için hazırladığımız fiyat teklifi ve hizmet kapsamı aşağıda bilgilerinize sunulmuştur.`;
  }

  function totals(q) {
    const subtotal = (q.services || []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const vat = subtotal * 0.2;
    return { subtotal, vat, total: subtotal + vat };
  }

  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  function shell(content, actions = "") {
    return `<div class="ced-shell">
      <header class="ced-topbar">
        <div class="ced-brand"><img src="${COMPANY.logo}" alt="Evren Jeofizik"/><div><strong>Evren Jeofizik · ÇED Teklifleri</strong><span>AYRI ÇED TEKLİF MODÜLÜ</span></div></div>
        <div class="ced-top-actions"><button class="ced-btn secondary" data-action="normal-system">Normal Teklif Sistemi</button>${actions}</div>
      </header>
      <main class="ced-main">${content}</main>
    </div>`;
  }

  function renderList() {
    const rows = proposals.slice().sort((a, b) => String(b.updatedAt || b.date).localeCompare(String(a.updatedAt || a.date))).map((q) => {
      const t = totals(q);
      return `<tr>
        <td><strong>${e(q.quoteNo || "—")}</strong></td>
        <td>${formatDate(q.date)}</td>
        <td>${e(q.customerName || "—")}</td>
        <td>${e(q.title || "—")}</td>
        <td><span class="ced-chip">ÇED</span></td>
        <td><strong>${money(t.total)}</strong></td>
        <td><button class="ced-btn secondary" data-action="edit" data-id="${q.id}">Aç</button> <button class="ced-btn danger" data-action="delete" data-id="${q.id}">Sil</button></td>
      </tr>`;
    }).join("");

    app.innerHTML = shell(`
      <div class="ced-page-head"><div><h1>ÇED Teklifleri</h1><p>Normal tekliflerden tamamen ayrı çalışan ÇED teklif ve sözleşme alanı.</p></div><button class="ced-btn primary" data-action="new">+ Yeni ÇED Teklifi</button></div>
      <section class="ced-card ced-list">${rows ? `<div class="ced-table-wrap"><table class="ced-table"><thead><tr><th>Teklif No</th><th>Tarih</th><th>Müşteri</th><th>Teklif Konusu</th><th>Tür</th><th>Toplam</th><th>İşlem</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="ced-empty"><strong>Henüz ÇED teklifi yok.</strong>İlk ÇED teklifini oluşturmak için “Yeni ÇED Teklifi” düğmesini kullanın.</div>`}</section>
    `);
  }

  function renderEditor() {
    const q = draft;
    app.innerHTML = shell(`
      <div class="ced-page-head"><div><h1>${editingId ? "ÇED Teklifini Düzenle" : "Yeni ÇED Teklifi"}</h1><p>Bu ekran normal teklif sisteminden ayrı çalışır. Sabit ÇED metinleri otomatik gelir.</p></div></div>
      <div class="ced-editor-grid">
        <section class="ced-card ced-editor">
          <div class="ced-section"><h2>Teklif Bilgileri</h2><div class="ced-field-grid three">
            ${field("Teklif No", "quoteNo", q.quoteNo)}
            ${field("Teklif Tarihi", "date", q.date, "date")}
            ${field("Geçerlilik Tarihi", "validUntil", q.validUntil, "date")}
            <div class="ced-field full"><label>Teklif / Sözleşme Konusu</label><input data-field="title" value="${e(q.title)}" /></div>
            <div class="ced-field full"><label>Müşteri / İşveren</label><input data-field="customerName" value="${e(q.customerName)}" placeholder="Firma adını girin" /></div>
          </div></div>

          <div class="ced-section"><h2>Saha / Ruhsat Bilgileri</h2><div class="ced-field-grid three">
            ${field("İl", "city", q.city)}
            ${field("İlçe", "district", q.district)}
            <div class="ced-field"><label>Ruhsat No / Numaraları</label><input data-field="licenseNumbers" value="${e(q.licenseNumbers)}" placeholder="ARA.42... / ARA.42..." /></div>
          </div></div>

          <div class="ced-section"><h2>I · Firma Tarafından Yapılacak İşler</h2><div class="ced-fixed-box">${e(COMPANY_WORK)}</div></div>
          <div class="ced-section"><h2>II · İşveren Tarafından Yapılacak İşler</h2><div class="ced-fixed-box">${e(EMPLOYER_WORK)}</div></div>

          <div class="ced-section"><h2>III · Resmi Giderler</h2>${officialEditor(q)}<button class="ced-btn secondary ced-add-row" data-action="add-official">+ Resmi Gider Ekle</button></div>
          <div class="ced-section"><h2>IV · Hazırlanacak Raporlar ve Hizmet Ücretleri</h2>${servicesEditor(q)}<button class="ced-btn secondary ced-add-row" data-action="add-service">+ Hizmet Ekle</button></div>

          <div class="ced-section"><h2>Teklif Notları / Ödeme Koşulları</h2><div class="ced-field"><textarea data-field="paymentNotes">${e(q.paymentNotes)}</textarea></div></div>
        </section>

        <aside class="ced-preview-wrap">
          <div class="ced-preview-head"><strong>PDF Önizleme</strong><span class="ced-mobile-note">Mobil ekranda önizleme küçültülerek gösterilir.</span></div>
          <div class="ced-preview-scale" id="ced-preview-scale"><div id="ced-pdf-host">${renderPdf(q)}</div></div>
        </aside>
      </div>
    `, `<button class="ced-btn secondary" data-action="cancel">Geri</button><button class="ced-btn gold" data-action="pdf">PDF İndir</button><button class="ced-btn primary" data-action="save">Kaydet</button>`);
  }

  function field(label, key, value, type = "text") {
    return `<div class="ced-field"><label>${label}</label><input data-field="${key}" type="${type}" value="${e(value)}" /></div>`;
  }

  function officialEditor(q) {
    const rows = (q.officialExpenses || []).map((row, index) => `<tr>
      <td><input data-official-index="${index}" data-row-field="name" value="${e(row.name)}" /></td>
      <td><input data-official-index="${index}" data-row-field="institution" value="${e(row.institution)}" /></td>
      <td class="amount"><input data-official-index="${index}" data-row-field="amount" type="number" min="0" step="0.01" value="${Number(row.amount || 0)}" /></td>
      <td class="ced-row-actions"><button class="ced-icon-btn" data-action="remove-official" data-index="${index}">Sil</button></td>
    </tr>`).join("");
    return `<div class="ced-table-wrap"><table class="ced-mini-table"><thead><tr><th>Yapılacak İşlem</th><th>İlgili Kurum</th><th>Tutar</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function servicesEditor(q) {
    const rows = (q.services || []).map((row, index) => `<tr>
      <td><input data-service-index="${index}" data-row-field="name" value="${e(row.name)}" /></td>
      <td class="amount"><input data-service-index="${index}" data-row-field="amount" type="number" min="0" step="0.01" value="${Number(row.amount || 0)}" /></td>
      <td class="ced-row-actions"><button class="ced-icon-btn" data-action="remove-service" data-index="${index}">Sil</button></td>
    </tr>`).join("");
    return `<div class="ced-table-wrap"><table class="ced-mini-table"><thead><tr><th>Hazırlanacak Rapor / Mühendislik Hizmeti</th><th>KDV Hariç</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function renderPdf(q) {
    const t = totals(q);
    const officialRows = (q.officialExpenses || []).map((row) => `<tr><td>${e(row.name || "—")}</td><td>${e(row.institution || "—")}</td><td class="num">${Number(row.amount || 0) ? money(row.amount) : "—"}</td></tr>`).join("");
    const serviceRows = (q.services || []).map((row) => {
      const base = Number(row.amount || 0);
      const vat = base * .2;
      return `<tr><td>${e(row.name || "—")}</td><td class="num"><strong>${money(base)}</strong></td><td class="num">${money(vat)}</td><td class="num"><strong>${money(base + vat)}</strong></td></tr>`;
    }).join("");
    const payment = `${q.paymentNotes || DEFAULT_PAYMENT_NOTES}\nTeklif ${formatDate(q.validUntil)} tarihine kadar geçerlidir.`;

    return `<article class="ced-pdf-page">
      <header class="ced-pdf-header"><div class="ced-pdf-brand"><img src="${COMPANY.logo}" alt="Logo"/><div><h1>${COMPANY.name}</h1><p>${COMPANY.subtitle}</p></div></div><div class="ced-pdf-meta"><span>Teklif No</span><strong>${e(q.quoteNo || "—")}</strong><span>Tarih</span><strong>${formatDate(q.date)}</strong></div></header>
      <div class="ced-pdf-rule"></div>
      <section class="ced-hero"><small>TEKLİF · SÖZLEŞME</small><h2>${e(q.title || "Proje Tanıtım Dosyası (ÇED) Hazırlama")}</h2><p>Sayın <strong>${e(q.customerName || "—")}</strong></p></section>
      <p class="ced-intro">${e(introText(q))}</p>

      <section class="ced-pdf-section"><div class="ced-pdf-title"><b>I</b><h3>FİRMA TARAFINDAN YAPILACAK İŞLER</h3></div><p class="ced-pdf-text">${e(COMPANY_WORK)}</p></section>
      <section class="ced-pdf-section"><div class="ced-pdf-title"><b>II</b><h3>İŞVEREN TARAFINDAN YAPILACAK İŞLER</h3></div><p class="ced-pdf-text">${e(EMPLOYER_WORK)}</p></section>

      <section class="ced-pdf-section"><div class="ced-pdf-title"><b>III</b><h3>RESMİ GİDERLER</h3></div><table class="ced-pdf-table"><thead><tr><th>YAPILACAK İŞLEM</th><th>İLGİLİ KURUM</th><th class="num">TUTAR</th></tr></thead><tbody>${officialRows || `<tr><td colspan="3">Resmi gider eklenmemiştir.</td></tr>`}</tbody></table><div class="ced-note-strip">K.D.V. uygulanmaz. Resmi giderler hizmet bedeline dahil değildir ve faaliyet sahibi tarafından ilgili kuruma yatırılır.</div></section>

      <section class="ced-pdf-section"><div class="ced-pdf-title"><b>IV</b><h3>HAZIRLANACAK RAPORLAR VE HİZMET ÜCRETLERİ</h3></div><table class="ced-pdf-table"><thead><tr><th>HAZIRLANACAK RAPOR / MÜHENDİSLİK HİZMETİ</th><th class="num">K.D.V. HARİÇ</th><th class="num">K.D.V. (%20)</th><th class="num">K.D.V. DAHİL</th></tr></thead><tbody>${serviceRows}<tr class="ced-total-row"><td>Rapor ve Hizmet Toplamı</td><td class="num">${money(t.subtotal)}</td><td class="num">${money(t.vat)}</td><td></td></tr><tr class="ced-grand-row"><td colspan="3">K.D.V. DAHİL GENEL TOPLAM</td><td class="num">${money(t.total)}</td></tr></tbody></table><div class="ced-note-strip">Teklif yukarıdaki kapsam için geçerli olup, resmi kurumların tasarruf ve tebliğlerine göre değişkenlik gösterebilir.</div></section>

      <section class="ced-bottom-notes"><h3>TEKLİF NOTLARI VE ÖDEME KOŞULLARI</h3><p>${e(payment)}</p></section>
      <section class="ced-signatures"><div><small>İŞVEREN</small><strong>${e(q.customerName || "—")}</strong><div class="ced-sign-line">Kaşe · İmza</div></div><div><small>YÜKLENİCİ</small><strong>${COMPANY.name}</strong><div class="ced-sign-line">Kaşe · İmza</div></div></section>
      <footer class="ced-pdf-footer"><div class="ced-pdf-footer-left"><img src="${COMPANY.logo}" alt="Logo"/><div><strong>${COMPANY.name}</strong><span>${COMPANY.address}</span></div></div><div class="ced-pdf-footer-right"><span>${COMPANY.phone}</span><span>${COMPANY.email}</span><span>${COMPANY.website}</span></div></footer>
    </article>`;
  }

  function refreshPreview() {
    const host = document.getElementById("ced-pdf-host");
    if (host && draft) host.innerHTML = renderPdf(draft);
  }

  function updateDraftFromInput(target) {
    if (!draft) return;
    const fieldName = target.dataset.field;
    if (fieldName) {
      draft[fieldName] = target.value;
      refreshPreview();
      return;
    }
    const officialIndex = target.dataset.officialIndex;
    if (officialIndex !== undefined) {
      const row = draft.officialExpenses[Number(officialIndex)];
      if (row) row[target.dataset.rowField] = target.dataset.rowField === "amount" ? Number(target.value || 0) : target.value;
      refreshPreview();
      return;
    }
    const serviceIndex = target.dataset.serviceIndex;
    if (serviceIndex !== undefined) {
      const row = draft.services[Number(serviceIndex)];
      if (row) row[target.dataset.rowField] = target.dataset.rowField === "amount" ? Number(target.value || 0) : target.value;
      refreshPreview();
    }
  }

  function saveDraft() {
    if (!draft.customerName.trim()) {
      toast("Müşteri / işveren adı gerekli.");
      return;
    }
    draft.updatedAt = new Date().toISOString();
    const index = proposals.findIndex((p) => p.id === draft.id);
    if (index >= 0) proposals[index] = clone(draft);
    else proposals.push(clone(draft));
    persist();
    toast("ÇED teklifi kaydedildi.");
    setTimeout(() => { draft = null; editingId = null; renderList(); }, 350);
  }

  async function exportPdf() {
    const page = document.querySelector(".ced-pdf-page");
    if (!page || !window.html2canvas || !window.jspdf?.jsPDF) {
      toast("PDF bileşenleri henüz hazır değil. Birkaç saniye sonra tekrar deneyin.");
      return;
    }
    const button = document.querySelector('[data-action="pdf"]');
    if (button) { button.disabled = true; button.textContent = "PDF hazırlanıyor…"; }
    try {
      const images = [...page.querySelectorAll("img")];
      await Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = img.onerror = resolve; })));
      const canvas = await html2canvas(page, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const ratioHeight = 210 * canvas.height / canvas.width;
      let width = 210, height = ratioHeight, x = 0, y = 0;
      if (height > 297) { height = 297; width = 297 * canvas.width / canvas.height; x = (210 - width) / 2; }
      pdf.addImage(canvas.toDataURL("image/jpeg", .92), "JPEG", x, y, width, height, undefined, "FAST");
      const blob = pdf.output("blob");
      const safeCustomer = (draft.customerName || "CED-Teklifi").replace(/[\\/:*?"<>|]+/g, " ").trim();
      const file = new File([blob], `${safeCustomer} - ${draft.quoteNo || "CED"}.pdf`, { type: "application/pdf" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: file.name });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }
      toast("PDF hazırlandı.");
    } catch (error) {
      console.error(error);
      toast("PDF hazırlanamadı.");
    } finally {
      if (button) { button.disabled = false; button.textContent = "PDF İndir"; }
    }
  }

  app.addEventListener("input", (event) => updateDraftFromInput(event.target));

  app.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "normal-system") location.href = "/";
    else if (action === "new") { editingId = null; draft = newProposal(); renderEditor(); }
    else if (action === "edit") {
      const found = proposals.find((p) => p.id === button.dataset.id);
      if (found) { editingId = found.id; draft = clone(found); renderEditor(); }
    }
    else if (action === "delete") {
      const found = proposals.find((p) => p.id === button.dataset.id);
      if (found && confirm(`${found.quoteNo || "Bu ÇED teklifi"} silinsin mi?`)) {
        proposals = proposals.filter((p) => p.id !== found.id); persist(); renderList(); toast("ÇED teklifi silindi.");
      }
    }
    else if (action === "cancel") { draft = null; editingId = null; renderList(); }
    else if (action === "save") saveDraft();
    else if (action === "pdf") exportPdf();
    else if (action === "add-official") { draft.officialExpenses.push({ id: crypto.randomUUID(), name: "", institution: "", amount: 0 }); renderEditor(); }
    else if (action === "remove-official") { draft.officialExpenses.splice(Number(button.dataset.index), 1); renderEditor(); }
    else if (action === "add-service") { draft.services.push({ id: crypto.randomUUID(), name: "", amount: 0 }); renderEditor(); }
    else if (action === "remove-service") { draft.services.splice(Number(button.dataset.index), 1); renderEditor(); }
  });

  renderList();
})();
