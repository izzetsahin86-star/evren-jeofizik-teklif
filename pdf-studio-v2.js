(() => {
  "use strict";

  const APP_KEY = "evren-jeofizik-teklif-v1";
  const LAYOUT_KEY = "evren-jeofizik-pdf-studio-v2";
  const LOGO = "/assets/evren-jeofizik-logo-embedded.svg";
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v = "") => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const META = {
    "p1-header-bg": "S1 · Üst siyah bant",
    "p1-logo": "S1 · Logo",
    "p1-company": "S1 · Firma başlığı",
    "p1-meta": "S1 · Teklif tarih/no alanı",
    "p1-customer-title": "S1 · Müşteri Bilgileri başlığı",
    "p1-customer": "S1 · Müşteri bilgi kutusu",
    "p1-offer-title": "S1 · Teklif Detayları başlığı",
    "p1-table": "S1 · Hizmet tablosu",
    "p1-totals": "S1 · Toplamlar",
    "p1-terms-title": "S1 · Şartlar başlığı",
    "p1-terms": "S1 · Şartlar metni",
    "p1-approval": "S1 · İmza / onay alanı",
    "p1-footer": "S1 · Alt turuncu bant",
    "p2-header-bg": "S2 · Üst siyah bant",
    "p2-logo": "S2 · Logo",
    "p2-company": "S2 · Firma / iş akışı başlığı",
    "p2-meta": "S2 · Teklif no alanı",
    "p2-workflow-title": "S2 · İş Akışı başlığı",
    "p2-workflow": "S2 · İş akışı tablosu",
    "p2-footer": "S2 · Alt turuncu bant"
  };

  const D = {
    "p1-header-bg": {x:0,y:0,w:210,h:33,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p1-logo": {x:11,y:6.5,w:18,h:18,scale:100,padX:1,padY:1,letter:0,line:100,opacity:100},
    "p1-company": {x:34,y:8.4,w:110,h:17,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p1-meta": {x:151,y:8,w:48,h:18,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p1-customer-title": {x:11,y:39,w:188,h:8,scale:100,padX:3.5,padY:0,letter:0,line:100,opacity:100},
    "p1-customer": {x:11,y:49,w:188,h:27,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p1-offer-title": {x:11,y:81,w:188,h:8,scale:100,padX:3.5,padY:0,letter:0,line:100,opacity:100},
    "p1-table": {x:11,y:91,w:188,h:34,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p1-totals": {x:119,y:127,w:80,h:40,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p1-terms-title": {x:11,y:171,w:188,h:8,scale:100,padX:3.5,padY:0,letter:0,line:100,opacity:100},
    "p1-terms": {x:11,y:181,w:188,h:12,scale:100,padX:4,padY:4,letter:0,line:150,opacity:100},
    "p1-approval": {x:11,y:229,w:188,h:50,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p1-footer": {x:11,y:279,w:188,h:9.5,scale:100,padX:5,padY:0,letter:0,line:100,opacity:100},
    "p2-header-bg": {x:0,y:0,w:210,h:25,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p2-logo": {x:11,y:5,w:14,h:14,scale:100,padX:1,padY:1,letter:0,line:100,opacity:100},
    "p2-company": {x:29,y:6,w:118,h:14,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p2-meta": {x:158,y:7,w:41,h:13,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p2-workflow-title": {x:11,y:32,w:188,h:8,scale:100,padX:3.5,padY:0,letter:0,line:100,opacity:100},
    "p2-workflow": {x:11,y:42,w:188,h:88,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},
    "p2-footer": {x:11,y:279,w:188,h:9.5,scale:100,padX:5,padY:0,letter:0,line:100,opacity:100}
  };

  let selected = "p1-company";
  let zoom = .58;
  let grid = true;
  let snapStep = .5;
  let draftCache = null;
  let routeCache = "";
  let mountTimer = 0;
  let renderTimer = 0;
  let mutating = false;

  function read(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  function appState() { return read(APP_KEY, {companies:[],quotes:[],settings:{}}); }
  function layoutStore() { const s = read(LAYOUT_KEY, {version:2, blocks:{}}); s.blocks ||= {}; return s; }
  function cfg(key) { return {...D[key], ...(layoutStore().blocks[key] || {})}; }
  function saveCfg(key, patch) { const s = layoutStore(); s.blocks[key] = {...cfg(key), ...patch}; write(LAYOUT_KEY, s); }
  function resetCfg(key) { const s = layoutStore(); delete s.blocks[key]; write(LAYOUT_KEY, s); }
  function resetAll() { write(LAYOUT_KEY, {version:2, blocks:{}}); }
  function snap(v) { if (!snapStep) return Math.round(v * 10) / 10; return Math.round(v / snapStep) * snapStep; }

  function path() {
    const r = (location.hash || "").startsWith("#/") ? location.hash.slice(1) : location.pathname;
    return r.replace(/\/$/, "") || "/";
  }
  function editorId() {
    const p = path();
    if (p === "/quotes/new") return "new";
    return p.match(/^\/quotes\/([^/]+)\/edit$/)?.[1] || "";
  }
  function detailId() { return path().match(/^\/quotes\/([^/]+)$/)?.[1] || ""; }
  function baseDraft() {
    const id = editorId();
    const s = appState();
    if (id && id !== "new") {
      const old = s.quotes?.find(v => v.id === id);
      if (old) return clone(old);
    }
    const c = s.companies?.find(v => v.isDefault) || s.companies?.[0] || {};
    return {id:"live",no:"",date:"",validUntil:"",companyId:c.id||"",customer:"",contact:"",phone:"",email:"",project:"",location:"",province:"",district:"",neighborhood:"",licenseNo:"",licenseOwner:"",items:[],description:"",notes:"",workflow:[],images:[]};
  }
  function currentDraft() {
    const r = path();
    if (!draftCache || routeCache !== r) { routeCache = r; draftCache = baseDraft(); }
    captureForm(draftCache);
    return draftCache;
  }
  function captureForm(x) {
    const f = q("#quote-form");
    if (!f || !x) return;
    qa("[name]", f).forEach(e => { if (e.type !== "file") x[e.name] = e.value; });
    const itemEls = qa("[data-item-index][data-item-field]", f);
    if (itemEls.length) {
      const arr = [];
      itemEls.forEach(e => {
        const i = +e.dataset.itemIndex, k = e.dataset.itemField;
        arr[i] ||= {...(x.items?.[i] || {})};
        arr[i][k] = ["quantity","price","vat"].includes(k) ? +(e.value || 0) : e.value;
      });
      x.items = arr.filter(Boolean);
    }
    const wf = qa("[data-workflow-index]", f);
    if (wf.length) x.workflow = wf.sort((a,b)=>+a.dataset.workflowIndex-+b.dataset.workflowIndex).map(e=>e.value);
  }
  function company(x) {
    const s = appState();
    return s.companies?.find(v=>v.id===x.companyId) || s.companies?.find(v=>v.isDefault) || s.companies?.[0] || {name:"EVREN JEOFİZİK HİZ. VE TEK. LTD. ŞTİ.",subtitle:"JEOFİZİK - JEOLOJİ HİZMETLERİ",email:"jeofizikhizmetleri@gmail.com",phone:"0 532 792 79 10",logo:LOGO};
  }
  function money(v) { return `${new Intl.NumberFormat("tr-TR", {minimumFractionDigits:2,maximumFractionDigits:2}).format(+(v||0))} TL`; }
  function totals(x) {
    let sub=0, vat=0;
    (x.items||[]).forEach(i=>{ const b=+(i.quantity||0)*+(i.price||0); sub+=b; vat+=b*+(i.vat||0)/100; });
    return {sub,vat,total:sub+vat};
  }

  function block(key, cls, inner) {
    const c = cfg(key);
    const contentStyle = `transform:scale(${c.scale/100});transform-origin:top left;width:${10000/c.scale}%;height:${10000/c.scale}%;letter-spacing:${c.letter}px;line-height:${c.line/100};padding:${c.padY}mm ${c.padX}mm;box-sizing:border-box`;
    return `<div class="ps-block ${cls}" data-ps-block="${key}" style="left:${c.x}mm;top:${c.y}mm;width:${c.w}mm;height:${c.h}mm;opacity:${c.opacity/100}"><div class="ps-content" style="${contentStyle}">${inner}</div><i class="ps-resize" data-ps-resize></i></div>`;
  }
  function logoHtml(c) { return `<img src="${esc(c.logo || LOGO)}" alt="Evren Jeofizik logosu">`; }
  function tableRows(x) {
    const items = x.items?.length ? x.items : [{name:"Hizmet kalemi",unit:"Adet",quantity:1,price:0,vat:20}];
    return items.map((i,idx)=>`<tr><td>${idx+1}</td><td>${esc(i.name||"Hizmet")}</td><td>${esc(i.unit||"Adet")}</td><td>${+(i.quantity||0)}</td><td>${money(i.price)}</td><td>${money(+(i.quantity||0)*+(i.price||0))}</td></tr>`).join("");
  }
  function page1(x) {
    const c = company(x), t = totals(x);
    const location = x.location || [x.neighborhood,x.district,x.province].filter(Boolean).join(" / ") || "—";
    const terms = x.description || "1. TEKLİF GEÇERLİLİK SÜRESİ: Bu teklif belirtilen geçerlilik tarihine kadar geçerlidir.";
    return `<div class="ps-page-stage"><section class="ps-page ${grid ? "grid-on" : ""}" data-page="1">
      ${block("p1-header-bg","ps-header-bg","")}
      ${block("p1-logo","ps-logo",logoHtml(c))}
      ${block("p1-company","ps-company",`<h1>${esc((c.name||"EVREN JEOFİZİK HİZ. VE TEK. LTD. ŞTİ.").toLocaleUpperCase("tr-TR"))}</h1><p>${esc(c.subtitle||"JEOFİZİK - JEOLOJİ HİZMETLERİ")}</p>`)}
      ${block("p1-meta","ps-offer-meta",`<h2>FİYAT TEKLİFİ</h2><p>Teklif No: <b>${esc(x.no||"EJ-2026-0001")}</b></p><p>Teklif Tarihi: ${esc(x.date||"—")}</p><p>Geçerlilik Tarihi: ${esc(x.validUntil||"—")}</p>`)}
      ${block("p1-customer-title","ps-section-title","MÜŞTERİ BİLGİLERİ")}
      ${block("p1-customer","ps-customer-box",`<div class="ps-info-col"><span>Firma:</span><strong>${esc(x.customer||"—")}</strong><span>Yetkili:</span><strong>${esc(x.contact||"—")}</strong><span>Telefon:</span><strong>${esc(x.phone||"—")}</strong><span>E-posta:</span><strong>${esc(x.email||"—")}</strong></div><div class="ps-info-col"><span>Proje:</span><strong>${esc(x.project||"—")}</strong><span>Proje Yeri:</span><strong>${esc(location)}</strong><span>Ruhsat No:</span><strong>${esc(x.licenseNo||"—")}</strong><span>Ruhsat Sahibi:</span><strong>${esc(x.licenseOwner||x.customer||"—")}</strong></div>`)}
      ${block("p1-offer-title","ps-section-title","TEKLİF DETAYLARI")}
      ${block("p1-table","",`<table class="ps-table"><thead><tr><th>No</th><th>Hizmet</th><th>Birim</th><th>Miktar</th><th>Birim Fiyat</th><th>Toplam</th></tr></thead><tbody>${tableRows(x)}</tbody></table>`)}
      ${block("p1-totals","ps-totals",`<div class="ps-total-row"><span>Ara Toplam</span><strong>${money(t.sub)}</strong></div><div class="ps-total-row"><span>İskonto</span><strong>- 0,00 TL</strong></div><div class="ps-total-row"><span>Net Ara Toplam (KDV Hariç)</span><strong>${money(t.sub)}</strong></div><div class="ps-total-row"><span>KDV</span><strong>${money(t.vat)}</strong></div><div class="ps-total-row grand"><span>GENEL TOPLAM</span><strong>${money(t.total)}</strong></div>`)}
      ${block("p1-terms-title","ps-section-title","ŞARTLAR")}
      ${block("p1-terms","ps-terms",esc(terms))}
      ${block("p1-approval","ps-approval",`<div><h3>TEKLİFİ VEREN</h3><strong>${esc((c.name||"Evren Jeofizik").toLocaleUpperCase("tr-TR"))}</strong><small>Yetkili: —</small><small class="sign">İmza / Kaşe</small></div><div><h3>MÜŞTERİ ONAYI</h3><strong>${esc(x.customer||"Müşteri / Firma")}</strong><small>Yetkili: —</small><small class="sign">İmza / Kaşe</small></div>`)}
      ${block("p1-footer","ps-footer",`<strong>EVREN JEOFİZİK HİZ</strong><span>${esc(c.email||"jeofizikhizmetleri@gmail.com")} | ${esc(c.phone||"0 532 792 79 10")}</span><span>Bu teklif 30 gün süreyle geçerlidir.</span>`)}
      <span class="ps-page-number">1 / 2</span>
    </section></div>`;
  }
  function page2(x) {
    const c = company(x);
    const workflow = x.workflow?.length ? x.workflow : ["Ön Hazırlık ve Alan Belirleme","Koordinat ve Harita Hazırlığı","Jeolojik ve Hidrojeolojik Arazi Etütleri","Jeokimyasal Numune Alımı ve Analizler","Jeofizik Etütler","Veri Entegrasyonu ve Değerlendirme","Sondaj Öncesi İzin Süreçleri ÇDP Kurum İzinleri","ÇED İşlemleri","Sondaj Aşaması (Jeotermal ve Kaynak Suyu)"];
    return `<div class="ps-page-stage"><section class="ps-page ${grid ? "grid-on" : ""}" data-page="2">
      ${block("p2-header-bg","ps-header-bg","")}
      ${block("p2-logo","ps-logo",logoHtml(c))}
      ${block("p2-company","ps-company",`<h1>${esc((c.name||"EVREN JEOFİZİK HİZ. VE TEK. LTD. ŞTİ.").toLocaleUpperCase("tr-TR"))}</h1><p>İş Akışı ve Uygulama Aşamaları</p>`)}
      ${block("p2-meta","ps-offer-meta",`<h2>TEKLİF No</h2><p><b>${esc(x.no||"EJ-2026-0001")}</b></p>`)}
      ${block("p2-workflow-title","ps-section-title","İŞ AKIŞI")}
      ${block("p2-workflow","",`<table class="ps-workflow"><tbody>${workflow.map((v,i)=>`<tr><td>${i+1}</td><td>${esc(v)}</td></tr>`).join("")}</tbody></table>`)}
      ${block("p2-footer","ps-footer",`<strong>EVREN JEOFİZİK HİZ</strong><span>Sayfa 2 / 2 · ${esc(x.no||"EJ-2026-0001")}</span><span>${esc(c.phone||"0 532 792 79 10")}</span>`)}
      <span class="ps-page-number">2 / 2</span>
    </section></div>`;
  }
  function pagesHtml(x) { return page1(x) + page2(x); }

  function studioMarkup() {
    return `<aside class="ps-studio">
      <div class="ps-toolbar"><div class="ps-brand"><strong>A4 CANLI PDF STÜDYOSU</strong><small>210 × 297 mm · 2 sayfa · milimetre hassasiyetli</small></div><div class="ps-actions"><button class="ps-btn active" data-ps-action="grid">Izgara</button><select class="ps-select" data-ps-snap aria-label="Hassasiyet"><option value="0.1">0,1 mm</option><option value="0.5" selected>0,5 mm</option><option value="1">1 mm</option><option value="0">Serbest</option></select><button class="ps-btn" data-ps-action="fit">Sığdır</button><label class="ps-zoom"><span data-ps-zoom-label>%58</span><input type="range" min="35" max="110" value="58" data-ps-zoom></label><button class="ps-btn primary" data-ps-action="print">PDF / Yazdır</button></div></div>
      <div class="ps-inspector"><div class="ps-inspector-head"><div class="ps-inspector-title"><span>SEÇİLİ ÖĞE</span><strong data-ps-selected>${esc(META[selected])}</strong></div><div class="ps-inspector-tools"><select class="ps-select" data-ps-block-select>${Object.entries(META).map(([k,v])=>`<option value="${k}" ${k===selected?"selected":""}>${esc(v)}</option>`).join("")}</select><button class="ps-mini" data-ps-action="reset">Öğeyi sıfırla</button><button class="ps-mini" data-ps-action="reset-all">Tümünü sıfırla</button></div></div>
      <div class="ps-control-grid">
        ${control("x","X konumu","mm",-20,230,.1)}${control("y","Y konumu","mm",-20,320,.1)}${control("w","Genişlik","mm",2,230,.1)}${control("h","Yükseklik","mm",2,320,.1)}
        ${control("scale","İçerik ölçeği","%",40,220,1)}${control("padX","Yatay iç boşluk","mm",0,25,.1)}${control("padY","Dikey iç boşluk","mm",0,25,.1)}${control("letter","Harf aralığı","px",-3,8,.1)}
        ${control("line","Satır yüksekliği","%",70,220,1)}${control("opacity","Görünürlük","%",10,100,1)}
      </div><div class="ps-inspector-note">Öğeyi PDF üzerinde sürükleyerek taşıyın; sağ alt köşesinden çekerek genişlik/yüksekliği değiştirin. Sayısal kutular milimetre bazlıdır ve seçili hassasiyete göre çalışır.</div></div>
      <div class="ps-canvas"><div class="ps-pages" style="--ps-zoom:${zoom}"></div></div>
    </aside>`;
  }
  function control(k,label,unit,min,max,step){ const c=cfg(selected); return `<label class="ps-control"><span>${label}<em class="ps-unit">${unit}</em></span><input type="number" data-ps-control="${k}" min="${min}" max="${max}" step="${step}" value="${c[k]}"></label>`; }

  function applyBlockStyle(el, key) {
    if (!el) return;
    const c = cfg(key);
    el.style.left = `${c.x}mm`; el.style.top = `${c.y}mm`; el.style.width = `${c.w}mm`; el.style.height = `${c.h}mm`; el.style.opacity = c.opacity/100;
    const cont = q(".ps-content", el);
    if (cont) {
      cont.style.transform = `scale(${c.scale/100})`;
      cont.style.width = `${10000/c.scale}%`; cont.style.height = `${10000/c.scale}%`;
      cont.style.padding = `${c.padY}mm ${c.padX}mm`; cont.style.letterSpacing = `${c.letter}px`; cont.style.lineHeight = c.line/100;
    }
  }
  function updateInspector(studio) {
    q("[data-ps-selected]", studio).textContent = META[selected] || selected;
    const sel = q("[data-ps-block-select]", studio); if (sel) sel.value = selected;
    const c = cfg(selected);
    qa("[data-ps-control]", studio).forEach(i => i.value = c[i.dataset.psControl]);
    qa(".ps-block", studio).forEach(e => e.classList.toggle("selected", e.dataset.psBlock === selected));
  }
  function renderStudio(studio, preserve = true) {
    const pages = q(".ps-pages", studio), canvas = q(".ps-canvas", studio);
    if (!pages) return;
    const sy = preserve ? canvas.scrollTop : 0, sx = preserve ? canvas.scrollLeft : 0;
    pages.style.setProperty("--ps-zoom", zoom);
    pages.innerHTML = pagesHtml(currentDraft());
    updateInspector(studio);
    canvas.scrollTop = sy; canvas.scrollLeft = sx;
  }
  function queueRender(studio) { clearTimeout(renderTimer); renderTimer = setTimeout(()=>renderStudio(studio,true), 45); }

  function fit(studio) {
    const canvas = q(".ps-canvas", studio); if (!canvas) return;
    const pxPerMm = 96/25.4;
    const zW = (canvas.clientWidth - 48) / (210 * pxPerMm);
    const zH = (canvas.clientHeight - 48) / (297 * pxPerMm);
    zoom = clamp(Math.min(zW,zH), .35, 1.1);
    q("[data-ps-zoom]", studio).value = Math.round(zoom*100);
    q("[data-ps-zoom-label]", studio).textContent = `%${Math.round(zoom*100)}`;
    q(".ps-pages", studio).style.setProperty("--ps-zoom", zoom);
  }

  function wireStudio(studio) {
    studio.addEventListener("click", e => {
      const blockEl = e.target.closest("[data-ps-block]");
      if (blockEl && !e.target.matches("[data-ps-resize]")) { selected = blockEl.dataset.psBlock; updateInspector(studio); return; }
      const b = e.target.closest("[data-ps-action]"); if (!b) return;
      const a = b.dataset.psAction;
      if (a === "grid") { grid = !grid; b.classList.toggle("active", grid); qa(".ps-page", studio).forEach(p=>p.classList.toggle("grid-on",grid)); }
      if (a === "fit") fit(studio);
      if (a === "print") { document.body.classList.add("ps-printing"); setTimeout(()=>window.print(),50); }
      if (a === "reset") { resetCfg(selected); renderStudio(studio,true); }
      if (a === "reset-all" && confirm("Tüm PDF yerleşim ve boyut ayarları sıfırlansın mı?")) { resetAll(); renderStudio(studio,true); }
    });
    q("[data-ps-zoom]", studio).addEventListener("input", e => { zoom = +e.target.value/100; q("[data-ps-zoom-label]", studio).textContent = `%${e.target.value}`; q(".ps-pages", studio).style.setProperty("--ps-zoom",zoom); });
    q("[data-ps-snap]", studio).addEventListener("change", e => { snapStep = +e.target.value; });
    q("[data-ps-block-select]", studio).addEventListener("change", e => { selected = e.target.value; updateInspector(studio); const el=q(`[data-ps-block="${CSS.escape(selected)}"]`,studio); el?.scrollIntoView({block:"nearest",behavior:"smooth"}); });
    qa("[data-ps-control]", studio).forEach(input => input.addEventListener("input", e => {
      const k = e.target.dataset.psControl, val = +e.target.value;
      const ranges = {x:[-20,230],y:[-20,320],w:[2,230],h:[2,320],scale:[40,220],padX:[0,25],padY:[0,25],letter:[-3,8],line:[70,220],opacity:[10,100]};
      const [a,b] = ranges[k]; saveCfg(selected,{[k]:clamp(val,a,b)});
      qa(`[data-ps-block="${CSS.escape(selected)}"]`,studio).forEach(el=>applyBlockStyle(el,selected));
    }));
    studio.addEventListener("pointerdown", startPointer);
  }

  function startPointer(e) {
    const el = e.target.closest("[data-ps-block]"); if (!el) return;
    const studio = e.currentTarget, key = el.dataset.psBlock;
    selected = key; updateInspector(studio);
    const page = el.closest(".ps-page"), rect = page.getBoundingClientRect(), start = cfg(key);
    const resize = !!e.target.closest("[data-ps-resize]");
    const sx=e.clientX, sy=e.clientY, mmX=210/rect.width, mmY=297/rect.height;
    e.preventDefault(); el.setPointerCapture?.(e.pointerId);
    const move = ev => {
      const dx=(ev.clientX-sx)*mmX, dy=(ev.clientY-sy)*mmY;
      const patch = resize ? {w:Math.max(2,snap(start.w+dx)),h:Math.max(2,snap(start.h+dy))} : {x:snap(start.x+dx),y:snap(start.y+dy)};
      saveCfg(key,patch); qa(`[data-ps-block="${CSS.escape(key)}"]`,studio).forEach(node=>applyBlockStyle(node,key)); updateInspector(studio);
    };
    const up = () => { window.removeEventListener("pointermove",move); window.removeEventListener("pointerup",up); };
    window.addEventListener("pointermove",move); window.addEventListener("pointerup",up,{once:true});
  }

  function mountEditor() {
    const ed = q(".editor-shell"), id = editorId();
    if (!ed || !id) return false;
    ed.classList.add("ps-enabled");
    let studio = q(":scope > .ps-studio", ed);
    if (!studio) { mutating=true; ed.insertAdjacentHTML("beforeend",studioMarkup()); studio=q(":scope > .ps-studio",ed); wireStudio(studio); mutating=false; }
    renderStudio(studio,true);
    return true;
  }
  function mountDetail() {
    const id = detailId(); if (!id || editorId()) return false;
    const s = appState(), x = s.quotes?.find(v=>v.id===id); if (!x) return false;
    const old = q(".print-sheet:not(.ps-page)"); if (!old) return false;
    old.style.display="none";
    let wrap = q(".ps-detail-pages");
    if (!wrap) { mutating=true; wrap=document.createElement("div"); wrap.className="ps-detail-pages"; old.insertAdjacentElement("afterend",wrap); mutating=false; }
    wrap.innerHTML = pagesHtml(x);
    qa(".ps-page",wrap).forEach(p=>p.classList.remove("grid-on"));
    return true;
  }
  function mount() {
    clearTimeout(mountTimer);
    mountTimer=setTimeout(()=>{ if (mutating) return; mountEditor() || mountDetail(); },20);
  }

  document.addEventListener("input", e => { const studio=q(".ps-studio"); if (studio && e.target.closest("#quote-form")) queueRender(studio); });
  document.addEventListener("change", e => { const studio=q(".ps-studio"); if (studio && e.target.closest("#quote-form")) setTimeout(()=>renderStudio(studio,true),30); });
  document.addEventListener("click", e => {
    if (e.target.closest('[data-action="window-print"], [data-action="print-quote"]')) document.body.classList.add("ps-printing");
    if (e.target.closest(".editor-shell [data-action]")) setTimeout(mount,80);
  }, true);
  addEventListener("afterprint",()=>document.body.classList.remove("ps-printing"));
  addEventListener("hashchange",()=>{draftCache=null;routeCache="";mount();});
  addEventListener("popstate",()=>{draftCache=null;routeCache="";mount();});
  addEventListener("resize",()=>{const s=q(".ps-studio"); if(s) fit(s);});
  const app=q("#app");
  if(app) new MutationObserver(()=>{ if(!mutating) mount(); }).observe(app,{childList:true,subtree:true});
  mount();
})();
