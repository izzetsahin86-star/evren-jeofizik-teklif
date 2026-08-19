(() => {
  "use strict";

  const LAYOUT_KEY = "evren-jeofizik-pdf-studio-v2";
  const UI_KEY = "evren-jeofizik-professional-suite-v3";
  const META = {
    "p1-header-bg":"S1 · Üst siyah bant","p1-logo":"S1 · Logo","p1-company":"S1 · Firma başlığı","p1-meta":"S1 · Teklif tarih / no","p1-customer-title":"S1 · Müşteri başlığı","p1-customer":"S1 · Müşteri bilgi kutusu","p1-offer-title":"S1 · Teklif detayları başlığı","p1-table":"S1 · Hizmet tablosu","p1-totals":"S1 · Toplamlar","p1-terms-title":"S1 · Şartlar başlığı","p1-terms":"S1 · Şartlar metni","p1-approval":"S1 · İmza / onay","p1-footer":"S1 · Alt turuncu bant",
    "p2-header-bg":"S2 · Üst siyah bant","p2-logo":"S2 · Logo","p2-company":"S2 · Firma / iş akışı","p2-meta":"S2 · Teklif no","p2-workflow-title":"S2 · İş akışı başlığı","p2-workflow":"S2 · İş akışı tablosu","p2-footer":"S2 · Alt turuncu bant"
  };
  const DEFAULTS = {
    "p1-header-bg":{x:0,y:0,w:210,h:33,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p1-logo":{x:11,y:6.5,w:18,h:18,scale:100,padX:1,padY:1,letter:0,line:100,opacity:100},"p1-company":{x:34,y:8.4,w:110,h:17,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p1-meta":{x:151,y:8,w:48,h:18,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p1-customer-title":{x:11,y:39,w:188,h:8,scale:100,padX:3.5,padY:0,letter:0,line:100,opacity:100},"p1-customer":{x:11,y:49,w:188,h:27,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p1-offer-title":{x:11,y:81,w:188,h:8,scale:100,padX:3.5,padY:0,letter:0,line:100,opacity:100},"p1-table":{x:11,y:91,w:188,h:34,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p1-totals":{x:119,y:127,w:80,h:40,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p1-terms-title":{x:11,y:171,w:188,h:8,scale:100,padX:3.5,padY:0,letter:0,line:100,opacity:100},"p1-terms":{x:11,y:181,w:188,h:12,scale:100,padX:4,padY:4,letter:0,line:150,opacity:100},"p1-approval":{x:11,y:229,w:188,h:50,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p1-footer":{x:11,y:279,w:188,h:9.5,scale:100,padX:5,padY:0,letter:0,line:100,opacity:100},
    "p2-header-bg":{x:0,y:0,w:210,h:25,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p2-logo":{x:11,y:5,w:14,h:14,scale:100,padX:1,padY:1,letter:0,line:100,opacity:100},"p2-company":{x:29,y:6,w:118,h:14,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p2-meta":{x:158,y:7,w:41,h:13,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p2-workflow-title":{x:11,y:32,w:188,h:8,scale:100,padX:3.5,padY:0,letter:0,line:100,opacity:100},"p2-workflow":{x:11,y:42,w:188,h:88,scale:100,padX:0,padY:0,letter:0,line:100,opacity:100},"p2-footer":{x:11,y:279,w:188,h:9.5,scale:100,padX:5,padY:0,letter:0,line:100,opacity:100}
  };

  const q = (s, r=document) => r.querySelector(s);
  const qa = (s, r=document) => [...r.querySelectorAll(s)];
  const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
  const clone = v => JSON.parse(JSON.stringify(v));
  let undoStack = [], redoStack = [], mountedStudio = null, layerPage = 1, beforeEdit = null, styleClipboard = null;

  function read(key, fallback){ try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback} }
  function write(key, value){ try{localStorage.setItem(key, JSON.stringify(value))}catch{} }
  function layout(){ const s=read(LAYOUT_KEY,{version:2,blocks:{}}); s.blocks ||= {}; return s; }
  function ui(){ const s=read(UI_KEY,{locks:{},hidden:{},guides:true}); s.locks ||= {}; s.hidden ||= {}; return s; }
  function cfg(key){ return {...DEFAULTS[key], ...(layout().blocks[key]||{})}; }
  function setCfg(key, patch){ const s=layout(); s.blocks[key]={...cfg(key),...patch}; write(LAYOUT_KEY,s); }
  function selectedKey(studio=mountedStudio){ return q(".ps-block.selected",studio)?.dataset.psBlock || q("[data-ps-block-select]",studio)?.value || "p1-company"; }
  function pageOf(key){ return key.startsWith("p2-") ? 2 : 1; }
  function snapshot(){ return JSON.stringify(layout()); }
  function pushUndo(raw=snapshot()){ if(undoStack.at(-1)!==raw){ undoStack.push(raw); if(undoStack.length>80) undoStack.shift(); } redoStack=[]; updateHistoryButtons(); }
  function restore(raw){ try{localStorage.setItem(LAYOUT_KEY,raw); applyLayoutToDom(); refreshAll();}catch{} }
  function undo(){ if(!undoStack.length)return; const now=snapshot(), prev=undoStack.pop(); redoStack.push(now); restore(prev); toast("Son yerleşim değişikliği geri alındı.","ok"); }
  function redo(){ if(!redoStack.length)return; const now=snapshot(), next=redoStack.pop(); undoStack.push(now); restore(next); toast("Yerleşim değişikliği yeniden uygulandı.","ok"); }
  function updateHistoryButtons(){ if(!mountedStudio)return; const u=q('[data-pro-action="undo"]',mountedStudio), r=q('[data-pro-action="redo"]',mountedStudio); if(u)u.disabled=!undoStack.length; if(r)r.disabled=!redoStack.length; }

  function applyBlock(el,key){ const c=cfg(key); if(!el)return; el.style.left=`${c.x}mm`;el.style.top=`${c.y}mm`;el.style.width=`${c.w}mm`;el.style.height=`${c.h}mm`;el.style.opacity=c.opacity/100; const cont=q(".ps-content",el); if(cont){cont.style.transform=`scale(${c.scale/100})`;cont.style.width=`${10000/c.scale}%`;cont.style.height=`${10000/c.scale}%`;cont.style.padding=`${c.padY}mm ${c.padX}mm`;cont.style.letterSpacing=`${c.letter}px`;cont.style.lineHeight=c.line/100;} }
  function applyLayoutToDom(){ qa("[data-ps-block]",mountedStudio).forEach(el=>applyBlock(el,el.dataset.psBlock)); syncInspector(); }
  function syncInspector(){ if(!mountedStudio)return; const key=selectedKey(), c=cfg(key); const sel=q("[data-ps-block-select]",mountedStudio); if(sel)sel.value=key; qa("[data-ps-control]",mountedStudio).forEach(i=>{const k=i.dataset.psControl;if(k in c)i.value=c[k]}); }

  function studioBar(){ return `<div class="pro-studio-bar">
    <div class="pro-studio-bar-left">
      <button class="pro-tool" data-pro-action="undo" title="Geri al (Ctrl+Z)">↶ Geri</button><button class="pro-tool" data-pro-action="redo" title="İleri al (Ctrl+Y)">↷ İleri</button><span class="pro-divider"></span>
      <button class="pro-tool active" data-pro-action="guides">Kılavuz</button><button class="pro-tool" data-pro-action="layers">Katmanlar</button><button class="pro-tool" data-pro-action="copy-style">Stil Kopyala</button><button class="pro-tool" data-pro-action="paste-style">Stil Yapıştır</button>
    </div>
    <div class="pro-studio-state"><i class="pro-status-dot" data-pro-status-dot></i><strong data-pro-state-title>Profesyonel A4 çalışma alanı hazır</strong><span data-pro-state-detail>8 mm güvenli baskı alanı · 5 mm ızgara</span></div>
    <div class="pro-studio-bar-right"><div class="pro-align-group"><button class="pro-tool" data-pro-align="left">Sol</button><button class="pro-tool" data-pro-align="center">Yatay Orta</button><button class="pro-tool" data-pro-align="right">Sağ</button><button class="pro-tool" data-pro-align="top">Üst</button><button class="pro-tool" data-pro-align="middle">Dikey Orta</button><button class="pro-tool" data-pro-align="bottom">Alt</button></div><span class="pro-divider"></span><button class="pro-tool" data-pro-action="export">Yerleşimi Yedekle</button><button class="pro-tool" data-pro-action="import">Yükle</button><input type="file" accept="application/json" data-pro-import hidden></div>
  </div>`; }

  function layerDrawer(){ return `<div class="pro-layer-drawer"><div class="pro-layer-head"><div><strong>PDF Katmanları</strong><small>Öğeyi seçin, kilitleyin veya gizleyin</small></div><button class="pro-icon-btn" data-pro-action="layers" title="Kapat">×</button></div><div class="pro-layer-pages"><button class="pro-page-btn active" data-pro-page="1">Sayfa 1 · Teklif</button><button class="pro-page-btn" data-pro-page="2">Sayfa 2 · İş Akışı</button></div><div class="pro-layer-list" data-pro-layer-list></div></div>`; }
  function measureStrip(){ return `<div class="pro-measure-strip"><div class="pro-measure-cell"><span>X</span><strong data-pro-m="x">—</strong></div><div class="pro-measure-cell"><span>Y</span><strong data-pro-m="y">—</strong></div><div class="pro-measure-cell"><span>Genişlik</span><strong data-pro-m="w">—</strong></div><div class="pro-measure-cell"><span>Yükseklik</span><strong data-pro-m="h">—</strong></div><div class="pro-measure-cell"><span>Ölçek</span><strong data-pro-m="scale">—</strong></div><div class="pro-measure-cell" data-pro-bound-cell><span>A4 Kontrol</span><strong data-pro-m="bound">Uygun</strong></div></div>`; }

  function mount(studio){ if(!studio || studio.dataset.proSuite==="1")return; studio.dataset.proSuite="1"; mountedStudio=studio; studio.insertAdjacentHTML("afterbegin",studioBar()); studio.insertAdjacentHTML("beforeend",layerDrawer()+measureStrip()); wire(studio); applyUiState(); refreshAll(); updateHistoryButtons(); }

  function wire(studio){
    studio.addEventListener("pointerdown",e=>{ const block=e.target.closest("[data-ps-block]"); if(!block)return; const key=block.dataset.psBlock, state=ui(); if(state.locks[key]){e.preventDefault();e.stopImmediatePropagation();toast("Bu katman kilitli. Katmanlar panelinden kilidi kaldırabilirsiniz.","warn");return;} pushUndo(); },true);
    studio.addEventListener("focusin",e=>{ if(e.target.matches("[data-ps-control]")) beforeEdit=snapshot(); },true);
    studio.addEventListener("change",e=>{ if(e.target.matches("[data-ps-control]")&&beforeEdit){ if(beforeEdit!==snapshot()){undoStack.push(beforeEdit); if(undoStack.length>80)undoStack.shift(); redoStack=[]; updateHistoryButtons();} beforeEdit=null; setTimeout(refreshAll,20);} },true);
    studio.addEventListener("click",e=>{
      const action=e.target.closest("[data-pro-action]")?.dataset.proAction;
      if(action){e.preventDefault();handleAction(action,e.target.closest("[data-pro-action]"));return;}
      const align=e.target.closest("[data-pro-align]")?.dataset.proAlign; if(align){e.preventDefault();alignSelected(align);return;}
      const page=e.target.closest("[data-pro-page]")?.dataset.proPage; if(page){layerPage=+page; qa("[data-pro-page]",studio).forEach(b=>b.classList.toggle("active",+b.dataset.proPage===layerPage)); renderLayers(); scrollPage(layerPage); return;}
      const layer=e.target.closest("[data-pro-layer-key]"); if(layer){ const key=layer.dataset.proLayerKey; const mini=e.target.closest("[data-pro-layer-cmd]"); if(mini){toggleLayer(key,mini.dataset.proLayerCmd);return;} selectLayer(key);return; }
      if(e.target.closest("[data-ps-block]")) setTimeout(refreshAll,0);
    });
    q("[data-pro-import]",studio)?.addEventListener("change",importLayout);
  }

  function handleAction(action,button){
    if(action==="undo")return undo(); if(action==="redo")return redo();
    if(action==="guides"){const s=ui();s.guides=!s.guides;write(UI_KEY,s);button?.classList.toggle("active",s.guides);applyUiState();return;}
    if(action==="layers"){q(".pro-layer-drawer",mountedStudio)?.classList.toggle("open");renderLayers();return;}
    if(action==="copy-style"){const c=cfg(selectedKey());styleClipboard={scale:c.scale,padX:c.padX,padY:c.padY,letter:c.letter,line:c.line,opacity:c.opacity};toast("Seçili öğenin tipografi ve iç boşluk stili kopyalandı.","ok");return;}
    if(action==="paste-style"){if(!styleClipboard)return toast("Önce bir öğenin stilini kopyalayın.","warn");pushUndo();setCfg(selectedKey(),clone(styleClipboard));applyLayoutToDom();refreshAll();toast("Stil seçili öğeye uygulandı.","ok");return;}
    if(action==="export")return exportLayout(); if(action==="import"){q("[data-pro-import]",mountedStudio)?.click();return;}
  }

  function alignSelected(mode){ const key=selectedKey(), state=ui(); if(state.locks[key])return toast("Katman kilitli.","warn"); const c=cfg(key), margin=11; let patch={}; if(mode==="left")patch.x=margin; if(mode==="center")patch.x=(210-c.w)/2; if(mode==="right")patch.x=210-margin-c.w; if(mode==="top")patch.y=margin; if(mode==="middle")patch.y=(297-c.h)/2; if(mode==="bottom")patch.y=297-margin-c.h; pushUndo(); Object.keys(patch).forEach(k=>patch[k]=Math.round(patch[k]*10)/10); setCfg(key,patch);applyLayoutToDom();refreshAll();toast(`${META[key]} hizalandı.`,"ok"); }

  function selectLayer(key){ const s=ui(); if(s.hidden[key])return toast("Gizli katmanı seçmek için önce görünür yapın.","warn"); const el=q(`[data-ps-block="${CSS.escape(key)}"]`,mountedStudio); if(el){el.click();el.scrollIntoView({block:"nearest",behavior:"smooth"});setTimeout(refreshAll,20);} }
  function toggleLayer(key,cmd){ const s=ui(); if(cmd==="lock")s.locks[key]=!s.locks[key]; if(cmd==="hide")s.hidden[key]=!s.hidden[key];write(UI_KEY,s);applyUiState();renderLayers();refreshAll(); }
  function applyUiState(){ if(!mountedStudio)return; const s=ui(); qa(".ps-page",mountedStudio).forEach(p=>p.classList.toggle("pro-guides",!!s.guides)); qa("[data-ps-block]",mountedStudio).forEach(el=>{const k=el.dataset.psBlock;el.classList.toggle("pro-locked",!!s.locks[k]);el.classList.toggle("pro-hidden",!!s.hidden[k]);}); q('[data-pro-action="guides"]',mountedStudio)?.classList.toggle("active",!!s.guides);checkBounds(); }

  function renderLayers(){ if(!mountedStudio)return; const list=q("[data-pro-layer-list]",mountedStudio); if(!list)return; const s=ui(), selected=selectedKey(); const entries=Object.entries(META).filter(([k])=>pageOf(k)===layerPage); list.innerHTML=entries.map(([k,name],i)=>`<div class="pro-layer-row ${k===selected?"selected":""}" data-pro-layer-key="${k}"><span class="pro-layer-index">${String(i+1).padStart(2,"0")}</span><span class="pro-layer-name" title="${name}">${name.replace(/^S[12] · /,"")}</span><button class="pro-icon-btn ${s.hidden[k]?"active":""}" data-pro-layer-cmd="hide" title="Göster / gizle">${s.hidden[k]?"◌":"●"}</button><button class="pro-icon-btn ${s.locks[k]?"active":""}" data-pro-layer-cmd="lock" title="Kilitle / kilidi aç">${s.locks[k]?"◆":"◇"}</button></div>`).join(""); }

  function scrollPage(page){ q(`.ps-page[data-page="${page}"]`,mountedStudio)?.closest(".ps-page-stage")?.scrollIntoView({block:"start",behavior:"smooth"}); }
  function checkBounds(){ if(!mountedStudio)return 0; let count=0; qa("[data-ps-block]",mountedStudio).forEach(el=>{const c=cfg(el.dataset.psBlock),out=c.x<0||c.y<0||c.x+c.w>210||c.y+c.h>297;el.classList.toggle("pro-out",out);if(out)count++;}); const dot=q("[data-pro-status-dot]",mountedStudio), title=q("[data-pro-state-title]",mountedStudio), detail=q("[data-pro-state-detail]",mountedStudio); if(dot)dot.classList.toggle("warn",count>0); if(title)title.textContent=count?`${count} öğe A4 sınırının dışında`:"A4 yerleşimi baskıya hazır"; if(detail)detail.textContent=count?"Kırmızı işaretli öğeleri sayfa içine taşıyın":"8 mm güvenli alan · hassas ölçü aktif";return count; }

  function refreshMetrics(){ if(!mountedStudio)return; const key=selectedKey(),c=cfg(key),out=c.x<0||c.y<0||c.x+c.w>210||c.y+c.h>297; const vals={x:`${c.x.toFixed(1)} mm`,y:`${c.y.toFixed(1)} mm`,w:`${c.w.toFixed(1)} mm`,h:`${c.h.toFixed(1)} mm`,scale:`%${Math.round(c.scale)}`,bound:out?"A4 dışı":"Uygun"};Object.entries(vals).forEach(([k,v])=>{const el=q(`[data-pro-m="${k}"]`,mountedStudio);if(el)el.textContent=v});q("[data-pro-bound-cell]",mountedStudio)?.classList.toggle("warn",out); }
  function refreshAll(){ if(!mountedStudio)return; applyUiState();renderLayers();refreshMetrics();checkBounds();updateHistoryButtons(); }

  function currentSnap(){ const v=+(q("[data-ps-snap]",mountedStudio)?.value ?? .5); return v||.1; }
  function nudge(e){ if(!mountedStudio||["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return; const map={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}; if(!map[e.key])return; const key=selectedKey(),state=ui();if(state.locks[key])return; e.preventDefault(); const base=e.altKey?.1:currentSnap(),step=e.shiftKey?base*10:base,[dx,dy]=map[e.key],c=cfg(key);pushUndo();setCfg(key,{x:Math.round((c.x+dx*step)*10)/10,y:Math.round((c.y+dy*step)*10)/10});applyLayoutToDom();refreshAll(); }
  function shortcuts(e){ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo();return;} if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="y"){e.preventDefault();redo();return;} nudge(e); }

  function exportLayout(){ const payload={type:"evren-jeofizik-pdf-layout",version:3,exportedAt:new Date().toISOString(),layout:layout(),ui:ui()}; const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`evren-jeofizik-pdf-yerlesim-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("PDF yerleşim yedeği indirildi.","ok"); }
  function importLayout(e){ const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!data.layout?.blocks)throw new Error("invalid");pushUndo();write(LAYOUT_KEY,data.layout);if(data.ui)write(UI_KEY,{...ui(),...data.ui});applyLayoutToDom();refreshAll();toast("Yerleşim yedeği başarıyla yüklendi.","ok");}catch{toast("Bu dosya geçerli bir Evren Jeofizik yerleşim yedeği değil.","error");}e.target.value="";};reader.readAsText(file); }

  function toast(text,type="ok"){ if(!mountedStudio)return; q(".pro-toast",mountedStudio)?.remove();const el=document.createElement("div");el.className=`pro-toast ${type}`;el.textContent=text;mountedStudio.appendChild(el);setTimeout(()=>el.remove(),2600); }

  document.addEventListener("keydown",shortcuts,true);
  document.addEventListener("click",e=>{ if(e.target.closest(".ps-studio [data-ps-block], .ps-studio [data-ps-block-select]"))setTimeout(refreshAll,15); },true);
  document.addEventListener("input",e=>{ if(e.target.closest(".ps-studio")&&e.target.matches("[data-ps-control]"))setTimeout(refreshAll,15); },true);
  document.addEventListener("change",e=>{ if(e.target.closest(".ps-studio")&&e.target.matches("[data-ps-snap]"))setTimeout(refreshAll,15); },true);

  const observer=new MutationObserver(()=>{const studio=q(".ps-studio");if(studio){if(studio!==mountedStudio)mount(studio);else setTimeout(refreshAll,20);}});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  const initial=q(".ps-studio");if(initial)mount(initial);
})();
