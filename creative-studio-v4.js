(() => {
  "use strict";

  const STORE_KEY = "evren-jeofizik-creative-studio-v4";
  const PRO_UI_KEY = "evren-jeofizik-professional-suite-v3";
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const round = (v, n = 1) => Math.round(v * (10 ** n)) / (10 ** n);
  const uid = () => `v4-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const esc = (v = "") => String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  let studio = null;
  let selected = { kind: "builtin", id: "p1-company" };
  let activePage = 1;
  let renderGuard = false;
  let selectionTimer = 0;

  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
  function routeKey() {
    const p = (location.hash || "").startsWith("#/") ? location.hash.slice(1) : location.pathname;
    const clean = p.replace(/\/$/, "") || "/";
    const id = clean.match(/^\/quotes\/([^/]+)/)?.[1] || (clean === "/quotes/new" ? "new" : "global");
    const no = q('#quote-form [name="no"]')?.value?.trim();
    return no ? `no:${no.toLocaleUpperCase("tr-TR")}` : `id:${id}`;
  }
  function rootStore() { const s = read(STORE_KEY, {version:4, docs:{}}); s.docs ||= {}; return s; }
  function doc() {
    const s = rootStore(), k = routeKey();
    s.docs[k] ||= {objects:[], text:{}, builtin:{}, settings:{showRulers:true, showMargins:true}};
    s.docs[k].objects ||= []; s.docs[k].text ||= {}; s.docs[k].builtin ||= {}; s.docs[k].settings ||= {};
    return {root:s, key:k, data:s.docs[k]};
  }
  function saveDoc(mutator) {
    const d = doc(); mutator(d.data); return write(STORE_KEY, d.root);
  }
  function proUi() { const s = read(PRO_UI_KEY,{locks:{},hidden:{},guides:true}); s.locks ||= {}; s.hidden ||= {}; return s; }
  function writeProUi(s) { write(PRO_UI_KEY, s); }

  function objectDefaults(type, page = activePage) {
    const base = {id:uid(),page,type,x:25,y:55,w:65,h:14,z:50,rotation:0,opacity:100,locked:false,hidden:false,
      fontFamily:"Arial",fontSize:12,fontWeight:700,fontStyle:"normal",underline:false,color:"#222222",align:"left",lineHeight:1.2,
      background:"transparent",borderColor:"#333333",borderWidth:0,radius:0,text:"Yeni metin",src:""};
    if(type === "box") Object.assign(base,{w:70,h:28,text:"",background:"#f5a61a",borderWidth:0,opacity:100});
    if(type === "line") Object.assign(base,{w:70,h:1.2,text:"",background:"#333333",borderWidth:0});
    if(type === "image") Object.assign(base,{w:50,h:35,text:"",background:"#f4f4f4",borderColor:"#cccccc",borderWidth:.3});
    return base;
  }

  function toolbarHtml() {
    return `<div class="v4-createbar">
      <div class="v4-create-left">
        <strong>TASARIM</strong>
        <button class="v4-add" data-v4-add="text">＋ Metin</button>
        <button class="v4-add" data-v4-add="box">▭ Kutu</button>
        <button class="v4-add" data-v4-add="line">━ Çizgi</button>
        <button class="v4-add" data-v4-add="image">▧ Görsel</button>
        <input type="file" accept="image/*" data-v4-image-input hidden>
      </div>
      <div class="v4-create-mid">
        <button class="v4-tool" data-v4-action="duplicate">Çoğalt</button>
        <button class="v4-tool" data-v4-action="front">Öne Al</button>
        <button class="v4-tool" data-v4-action="back">Arkaya Al</button>
        <button class="v4-tool" data-v4-action="lock">Kilitle</button>
        <button class="v4-tool danger" data-v4-action="delete">Sil</button>
      </div>
      <div class="v4-create-right">
        <button class="v4-tool active" data-v4-action="rulers">Cetvel</button>
        <button class="v4-tool active" data-v4-action="margins">Baskı Alanı</button>
        <span class="v4-tip">Yazıya çift tıkla → doğrudan düzenle</span>
      </div>
    </div>`;
  }

  function panelHtml() {
    return `<section class="v4-properties">
      <div class="v4-prop-head">
        <div><span>NESNE / YAZI DÜZENLEME</span><strong data-v4-title>Firma başlığı</strong></div>
        <div class="v4-page-tabs"><button data-v4-page="1" class="active">Sayfa 1</button><button data-v4-page="2">Sayfa 2</button></div>
      </div>
      <div class="v4-tabs"><button class="active" data-v4-tab="text">Yazı</button><button data-v4-tab="layout">Yerleşim</button><button data-v4-tab="appearance">Görünüm</button><button data-v4-tab="content">İçerik</button></div>
      <div class="v4-tab-pane active" data-v4-pane="text">
        <label><span>Font</span><select data-v4-prop="fontFamily"><option>Arial</option><option>Arial Black</option><option>Georgia</option><option>Times New Roman</option><option>Verdana</option><option>Tahoma</option><option>Trebuchet MS</option><option>Courier New</option></select></label>
        <label><span>Boyut <b>pt</b></span><input type="number" min="4" max="72" step="0.5" data-v4-prop="fontSize"></label>
        <label><span>Kalınlık</span><select data-v4-prop="fontWeight"><option value="400">Normal</option><option value="500">Orta</option><option value="600">Yarı Kalın</option><option value="700">Kalın</option><option value="800">Çok Kalın</option><option value="900">Siyah</option></select></label>
        <label><span>Satır</span><input type="number" min="0.7" max="3" step="0.05" data-v4-prop="lineHeight"></label>
        <label><span>Yazı rengi</span><input type="color" data-v4-prop="color"></label>
        <div class="v4-segment"><button data-v4-align="left">Sol</button><button data-v4-align="center">Orta</button><button data-v4-align="right">Sağ</button></div>
        <div class="v4-segment"><button data-v4-style="italic">İtalik</button><button data-v4-style="underline">Altı Çizili</button><button data-v4-style="upper">BÜYÜK</button></div>
      </div>
      <div class="v4-tab-pane" data-v4-pane="layout">
        ${num("x","X","mm",-30,230,.1)}${num("y","Y","mm",-30,320,.1)}${num("w","Genişlik","mm",1,240,.1)}${num("h","Yükseklik","mm",1,330,.1)}
        ${num("rotation","Döndür","°",-180,180,1)}${num("z","Katman","",0,999,1)}
      </div>
      <div class="v4-tab-pane" data-v4-pane="appearance">
        ${num("opacity","Görünürlük","%",0,100,1)}${num("borderWidth","Çizgi","mm",0,10,.1)}${num("radius","Köşe","mm",0,30,.1)}
        <label><span>Arka plan</span><input type="color" data-v4-prop="backgroundColor"></label>
        <label><span>Çizgi rengi</span><input type="color" data-v4-prop="borderColor"></label>
        <div class="v4-wide-actions"><button data-v4-action="transparent">Arka Planı Şeffaf Yap</button><button data-v4-action="restore">Silinen Bölümü Geri Getir</button></div>
      </div>
      <div class="v4-tab-pane" data-v4-pane="content">
        <label class="wide"><span>Metin / İçerik</span><textarea rows="4" data-v4-content placeholder="Seçilen özel metnin içeriği"></textarea></label>
        <p class="v4-help">Hazır PDF yazıları için en hızlı yöntem: PDF üzerindeki yazıya <b>çift tıklayın</b>, metni değiştirin ve dışarı tıklayın. Tablo hücreleri, başlıklar ve alt bilgiler de düzenlenebilir.</p>
      </div>
    </section>`;
  }
  function num(key,label,unit,min,max,step){ return `<label><span>${label} <b>${unit}</b></span><input type="number" min="${min}" max="${max}" step="${step}" data-v4-prop="${key}"></label>`; }

  function mount(s) {
    if (!s || s.dataset.v4 === "1") return;
    s.dataset.v4 = "1"; studio = s;
    const inspector = q(".ps-inspector", s);
    if (inspector) inspector.insertAdjacentHTML("beforebegin", toolbarHtml());
    if (inspector) inspector.insertAdjacentHTML("afterend", panelHtml());
    wire(s); applyAll();
  }

  function wire(s) {
    s.addEventListener("click", onClick, true);
    s.addEventListener("dblclick", onDoubleClick, true);
    s.addEventListener("pointerdown", onPointerDown, true);
    qa("[data-v4-prop]", s).forEach(el => el.addEventListener("input", onProperty));
    q("[data-v4-content]", s)?.addEventListener("input", e => setSelectedProp("text", e.target.value));
    q("[data-v4-image-input]", s)?.addEventListener("change", importImage);
  }

  function onClick(e) {
    const tab = e.target.closest("[data-v4-tab]");
    if (tab) { switchTab(tab.dataset.v4Tab); return; }
    const pg = e.target.closest("[data-v4-page]");
    if (pg) { activePage = +pg.dataset.v4Page; qa("[data-v4-page]",studio).forEach(b=>b.classList.toggle("active",+b.dataset.v4Page===activePage)); scrollPage(activePage); return; }
    const add = e.target.closest("[data-v4-add]");
    if (add) { if (add.dataset.v4Add === "image") q("[data-v4-image-input]",studio)?.click(); else addObject(add.dataset.v4Add); return; }
    const act = e.target.closest("[data-v4-action]"); if (act) { handleAction(act.dataset.v4Action); return; }
    const align = e.target.closest("[data-v4-align]"); if (align) { setSelectedProp("align",align.dataset.v4Align); return; }
    const sty = e.target.closest("[data-v4-style]"); if (sty) { handleStyle(sty.dataset.v4Style); return; }
    const custom = e.target.closest("[data-v4-object]");
    if (custom) { selectCustom(custom.dataset.v4Object); return; }
    const builtin = e.target.closest("[data-ps-block]");
    if (builtin) { selected={kind:"builtin",id:builtin.dataset.psBlock}; activePage=+builtin.closest(".ps-page")?.dataset.page||1; refreshPanel(); }
  }

  function switchTab(name){ qa("[data-v4-tab]",studio).forEach(b=>b.classList.toggle("active",b.dataset.v4Tab===name)); qa("[data-v4-pane]",studio).forEach(p=>p.classList.toggle("active",p.dataset.v4Pane===name)); }

  function addObject(type, extra={}) {
    const obj = {...objectDefaults(type),...extra};
    saveDoc(d=>d.objects.push(obj)); selected={kind:"custom",id:obj.id}; applyAll(); toast(`${type === "text" ? "Metin" : type === "box" ? "Kutu" : "Çizgi"} eklendi.`,"ok");
  }
  function importImage(e) {
    const file=e.target.files?.[0]; e.target.value=""; if(!file)return;
    if(!file.type.startsWith("image/"))return toast("Lütfen bir görsel seçin.","warn");
    const img=new Image(), fr=new FileReader();
    fr.onload=()=>{img.onload=()=>{const max=1400, scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext("2d").drawImage(img,0,0,c.width,c.height);const src=c.toDataURL("image/jpeg",.84);addObject("image",{src,w:60,h:round(60*c.height/c.width,1)});};img.src=fr.result;};
    fr.readAsDataURL(file);
  }

  function onDoubleClick(e) {
    const custom=e.target.closest("[data-v4-object]");
    if(custom && custom.dataset.v4Type==="text"){ const t=q(".v4-object-text",custom); if(t) beginEditCustomText(t,custom.dataset.v4Object); return; }
    const leaf=e.target.closest("h1,h2,h3,p,strong,span,small,td,th");
    const block=leaf?.closest("[data-ps-block]");
    if(!leaf||!block||leaf.querySelector("h1,h2,h3,p,strong,span,small,td,th"))return;
    e.preventDefault();e.stopPropagation();selected={kind:"builtin",id:block.dataset.psBlock}; beginEditBuiltinText(leaf,block.dataset.psBlock); refreshPanel();
  }
  function textLeaves(block){ return qa("h1,h2,h3,p,strong,span,small,td,th",block).filter(el=>!el.querySelector("h1,h2,h3,p,strong,span,small,td,th")); }
  function leafId(el, blockKey){ const leaves=textLeaves(el.closest("[data-ps-block]")); return `${blockKey}::${leaves.indexOf(el)}`; }
  function beginEditBuiltinText(el,key){
    const id=leafId(el,key); el.contentEditable="true"; el.classList.add("v4-editing-text"); el.focus(); document.execCommand?.("selectAll",false,null);
    const finish=()=>{ el.contentEditable="false";el.classList.remove("v4-editing-text");saveDoc(d=>d.text[id]={text:el.innerText});toast("Yazı kaydedildi.","ok");};
    el.addEventListener("blur",finish,{once:true}); el.addEventListener("keydown",ev=>{if(ev.key==="Escape"){ev.preventDefault();el.blur();}}, {once:false});
  }
  function beginEditCustomText(el,id){ el.contentEditable="true";el.classList.add("v4-editing-text");el.focus(); const finish=()=>{el.contentEditable="false";el.classList.remove("v4-editing-text");saveDoc(d=>{const o=d.objects.find(v=>v.id===id);if(o)o.text=el.innerText;});refreshPanel();};el.addEventListener("blur",finish,{once:true}); }

  function renderCustom(page) {
    const d=doc().data, pg=q(`.ps-page[data-page="${page}"]`,studio); if(!pg)return;
    qa("[data-v4-object]",pg).forEach(n=>n.remove());
    d.objects.filter(o=>o.page===page&&!o.hidden).sort((a,b)=>a.z-b.z).forEach(o=>{
      const el=document.createElement("div"); el.className=`v4-object v4-${o.type}`;el.dataset.v4Object=o.id;el.dataset.v4Type=o.type;
      applyObjectStyle(el,o);
      if(o.type==="text")el.innerHTML=`<div class="v4-object-text">${esc(o.text).replaceAll("\n","<br>")}</div>`;
      if(o.type==="image")el.innerHTML=o.src?`<img src="${o.src}" alt="Eklenen görsel">`:`<span>Görsel</span>`;
      if(o.type==="box"||o.type==="line")el.innerHTML="";
      el.insertAdjacentHTML("beforeend",`<i class="v4-handle nw" data-v4-handle="nw"></i><i class="v4-handle ne" data-v4-handle="ne"></i><i class="v4-handle sw" data-v4-handle="sw"></i><i class="v4-handle se" data-v4-handle="se"></i><i class="v4-rotate" data-v4-rotate>↻</i>`);
      pg.appendChild(el);
    });
  }
  function applyObjectStyle(el,o){
    el.style.left=`${o.x}mm`;el.style.top=`${o.y}mm`;el.style.width=`${o.w}mm`;el.style.height=`${o.h}mm`;el.style.zIndex=String(o.z);el.style.opacity=o.opacity/100;el.style.transform=`rotate(${o.rotation}deg)`;el.style.background=o.background;el.style.border=`${o.borderWidth}mm solid ${o.borderColor}`;el.style.borderRadius=`${o.radius}mm`;el.style.color=o.color;el.style.fontFamily=o.fontFamily;el.style.fontSize=`${o.fontSize}pt`;el.style.fontWeight=o.fontWeight;el.style.fontStyle=o.fontStyle;el.style.textDecoration=o.underline?"underline":"none";el.style.textAlign=o.align;el.style.lineHeight=o.lineHeight;el.classList.toggle("selected",selected.kind==="custom"&&selected.id===o.id);el.classList.toggle("locked",!!o.locked);
  }

  function applyTextOverrides(){
    const d=doc().data;
    qa("[data-ps-block]",studio).forEach(block=>{const key=block.dataset.psBlock;textLeaves(block).forEach((el,i)=>{const ov=d.text[`${key}::${i}`];if(ov&&document.activeElement!==el)el.innerText=ov.text;});});
  }
  function applyBuiltinState(){
    const d=doc().data, p=proUi();
    qa("[data-ps-block]",studio).forEach(el=>{
      const key=el.dataset.psBlock, s=d.builtin[key]||{};
      el.classList.toggle("v4-hidden-builtin",!!(s.hidden||p.hidden[key]));
      el.style.opacity=s.opacity===undefined?el.style.opacity:(s.opacity/100);
      if(s.background) el.style.background=s.background;
      if(s.borderColor||s.borderWidth) el.style.border=`${s.borderWidth||0}mm solid ${s.borderColor||"#333333"}`;
      if(s.radius!==undefined) el.style.borderRadius=`${s.radius}mm`;
      textLeaves(el).forEach(leaf=>{
        if(s.fontFamily) leaf.style.fontFamily=s.fontFamily;
        if(s.fontSize) leaf.style.fontSize=`${s.fontSize}pt`;
        if(s.fontWeight) leaf.style.fontWeight=s.fontWeight;
        if(s.fontStyle) leaf.style.fontStyle=s.fontStyle;
        if(s.underline!==undefined) leaf.style.textDecoration=s.underline?"underline":"none";
        if(s.color) leaf.style.color=s.color;
        if(s.align) leaf.style.textAlign=s.align;
        if(s.lineHeight) leaf.style.lineHeight=s.lineHeight;
      });
    });
  }
  function applySettings(){ const st=doc().data.settings; qa(".ps-page",studio).forEach(pg=>{pg.classList.toggle("v4-rulers",st.showRulers!==false);pg.classList.toggle("v4-margins",st.showMargins!==false);}); const rb=q('[data-v4-action="rulers"]',studio),mb=q('[data-v4-action="margins"]',studio);rb?.classList.toggle("active",st.showRulers!==false);mb?.classList.toggle("active",st.showMargins!==false); }
  function applyAll(){ if(!studio||renderGuard)return;renderGuard=true;try{renderCustom(1);renderCustom(2);applyTextOverrides();applyBuiltinState();applySettings();refreshPanel();}finally{setTimeout(()=>renderGuard=false,0);} }

  function selectCustom(id){ selected={kind:"custom",id}; const o=doc().data.objects.find(v=>v.id===id);if(o)activePage=o.page;applyAll(); }
  function selectedObject(){return selected.kind==="custom"?doc().data.objects.find(o=>o.id===selected.id):null;}
  function selectedBuiltin(){return selected.kind==="builtin"?selected.id:null;}
  function builtStyle(){ const d=doc().data;return d.builtin[selected.id]||{}; }

  function refreshPanel(){
    if(!studio)return;clearTimeout(selectionTimer);selectionTimer=setTimeout(()=>{
      const title=q("[data-v4-title]",studio),content=q("[data-v4-content]",studio),o=selectedObject(),key=selectedBuiltin();
      qa("[data-v4-object]",studio).forEach(el=>el.classList.toggle("selected",selected.kind==="custom"&&el.dataset.v4Object===selected.id));
      qa("[data-v4-page]",studio).forEach(b=>b.classList.toggle("active",+b.dataset.v4Page===activePage));
      if(o){title.textContent=o.type==="text"?"Özel Metin":o.type==="image"?"Özel Görsel":o.type==="box"?"Şekil / Kutu":"Çizgi";content.disabled=o.type!=="text";content.value=o.type==="text"?o.text:"";fillProps(o,false);} else if(key){title.textContent=`Hazır PDF öğesi · ${key}`;content.disabled=true;content.value="Çift tıklayarak PDF üzerinde düzenleyin"; const s=builtStyle();fillProps({fontFamily:s.fontFamily||"Arial",fontSize:s.fontSize||12,fontWeight:s.fontWeight||700,lineHeight:s.lineHeight||1.2,color:s.color||"#222222",align:s.align||"left",opacity:s.opacity??100,borderWidth:s.borderWidth||0,radius:s.radius||0,background:s.background||"transparent",borderColor:s.borderColor||"#333333"},true);}
    },0);
  }
  function fillProps(src,builtin){
    qa("[data-v4-prop]",studio).forEach(el=>{const k=el.dataset.v4Prop;if(builtin&&["x","y","w","h","rotation","z"].includes(k)){el.disabled=true;return;}el.disabled=false;let v=src[k];if(k==="backgroundColor")v=src.background&&src.background!=="transparent"?src.background:"#ffffff";if(v!==undefined&&v!==null)el.value=String(v);});
    qa("[data-v4-align]",studio).forEach(b=>b.classList.toggle("active",b.dataset.v4Align===(src.align||"left")));
    qa("[data-v4-style]",studio).forEach(b=>{const k=b.dataset.v4Style;b.classList.toggle("active",k==="italic"?src.fontStyle==="italic":k==="underline"?!!src.underline:false);});
  }

  function onProperty(e){ const k=e.target.dataset.v4Prop;let v=e.target.type==="number"?+e.target.value:e.target.value;if(k==="backgroundColor")kSet("background",v);else kSet(k,v); }
  function setSelectedProp(k,v){ kSet(k,v); }
  function kSet(k,v){
    if(selected.kind==="custom")saveDoc(d=>{const o=d.objects.find(x=>x.id===selected.id);if(o)o[k]=v;});
    else saveDoc(d=>{d.builtin[selected.id]||={};d.builtin[selected.id][k]=v;});
    applyAll();
  }
  function handleStyle(type){
    if(type==="italic"){const o=selectedObject();const s=o||builtStyle();kSet("fontStyle",s.fontStyle==="italic"?"normal":"italic");}
    if(type==="underline"){const o=selectedObject();const s=o||builtStyle();kSet("underline",!s.underline);}
    if(type==="upper"){
      if(selected.kind==="custom"){const o=selectedObject();kSet("text",(o.text||"").toLocaleUpperCase("tr-TR"));}
      else { const block=q(`[data-ps-block="${CSS.escape(selected.id)}"]`,studio);textLeaves(block).forEach(el=>{const id=leafId(el,selected.id);saveDoc(d=>d.text[id]={text:el.innerText.toLocaleUpperCase("tr-TR")});});applyAll(); }
    }
  }

  function handleAction(a){
    if(a==="delete")return deleteSelected();
    if(a==="restore"){if(selected.kind==="builtin"){saveDoc(d=>{d.builtin[selected.id]||={};d.builtin[selected.id].hidden=false;});const p=proUi();p.hidden[selected.id]=false;writeProUi(p);applyAll();toast("Bölüm geri getirildi.","ok");}return;}
    if(a==="duplicate")return duplicateSelected();
    if(a==="front")return changeZ(1);
    if(a==="back")return changeZ(-1);
    if(a==="lock")return toggleLock();
    if(a==="transparent")return kSet("background","transparent");
    if(a==="rulers"){saveDoc(d=>d.settings.showRulers=d.settings.showRulers===false);applySettings();return;}
    if(a==="margins"){saveDoc(d=>d.settings.showMargins=d.settings.showMargins===false);applySettings();return;}
  }
  function deleteSelected(){
    if(selected.kind==="custom"){saveDoc(d=>d.objects=d.objects.filter(o=>o.id!==selected.id));selected={kind:"builtin",id:activePage===1?"p1-company":"p2-company"};applyAll();toast("Öğe silindi.","ok");}
    else {saveDoc(d=>{d.builtin[selected.id]||={};d.builtin[selected.id].hidden=true;});applyAll();toast("Hazır bölüm gizlendi. 'Geri Getir' ile döndürebilirsiniz.","ok");}
  }
  function duplicateSelected(){const o=selectedObject();if(!o)return toast("Çoğaltma özel eklenen öğelerde kullanılabilir.","warn");const copy={...o,id:uid(),x:round(o.x+4,1),y:round(o.y+4,1),z:o.z+1};saveDoc(d=>d.objects.push(copy));selected={kind:"custom",id:copy.id};applyAll();}
  function changeZ(dir){const o=selectedObject();if(!o)return;saveDoc(d=>{const t=d.objects.find(x=>x.id===o.id);if(t)t.z=clamp(t.z+dir,0,999);});applyAll();}
  function toggleLock(){if(selected.kind==="custom"){const o=selectedObject();kSet("locked",!o.locked);}else{const p=proUi();p.locks[selected.id]=!p.locks[selected.id];writeProUi(p);applyAll();}}

  function onPointerDown(e){
    const el=e.target.closest("[data-v4-object]");if(!el)return;const id=el.dataset.v4Object,o=doc().data.objects.find(x=>x.id===id);if(!o||o.locked)return;selected={kind:"custom",id};activePage=o.page;refreshPanel();
    const page=el.closest(".ps-page"),rect=page.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,start={...o},handle=e.target.closest("[data-v4-handle]")?.dataset.v4Handle,rotate=!!e.target.closest("[data-v4-rotate]");
    if(e.target.closest(".v4-object-text[contenteditable=true]"))return;
    e.preventDefault();e.stopPropagation();
    const move=ev=>{const dx=(ev.clientX-sx)*210/rect.width,dy=(ev.clientY-sy)*297/rect.height;let patch={};
      if(rotate){const cx=rect.left+(start.x+start.w/2)/210*rect.width,cy=rect.top+(start.y+start.h/2)/297*rect.height;patch.rotation=round(Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI+90,0);}
      else if(handle){let x=start.x,y=start.y,w=start.w,h=start.h;if(handle.includes("e"))w=Math.max(2,start.w+dx);if(handle.includes("s"))h=Math.max(2,start.h+dy);if(handle.includes("w")){x=start.x+dx;w=Math.max(2,start.w-dx);}if(handle.includes("n")){y=start.y+dy;h=Math.max(2,start.h-dy);}patch={x:round(x),y:round(y),w:round(w),h:round(h)};}
      else patch={x:round(start.x+dx),y:round(start.y+dy)};
      saveDoc(d=>{const t=d.objects.find(x=>x.id===id);if(t)Object.assign(t,patch);});const latest=doc().data.objects.find(x=>x.id===id);applyObjectStyle(el,latest);refreshPanel();};
    const up=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up,{once:true});
  }

  function scrollPage(page){q(`.ps-page[data-page="${page}"]`,studio)?.closest(".ps-page-stage")?.scrollIntoView({behavior:"smooth",block:"center"});}
  function toast(msg,type="ok"){let r=q(".v4-toast-root");if(!r){r=document.createElement("div");r.className="v4-toast-root";document.body.appendChild(r);}const n=document.createElement("div");n.className=`v4-toast ${type}`;n.textContent=msg;r.appendChild(n);setTimeout(()=>n.remove(),2500);}

  document.addEventListener("keydown",e=>{
    if(!studio||e.target.matches("input,textarea,select,[contenteditable=true]"))return;
    if((e.key==="Delete"||e.key==="Backspace")&&selected){e.preventDefault();deleteSelected();return;}
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="d"&&selected.kind==="custom"){e.preventDefault();duplicateSelected();return;}
    if(selected.kind==="custom"&&["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){const step=e.altKey ? .1 : e.shiftKey ? 5 : .5;const o=selectedObject();if(!o)return;e.preventDefault();const patch={};if(e.key==="ArrowLeft")patch.x=round(o.x-step);if(e.key==="ArrowRight")patch.x=round(o.x+step);if(e.key==="ArrowUp")patch.y=round(o.y-step);if(e.key==="ArrowDown")patch.y=round(o.y+step);saveDoc(d=>Object.assign(d.objects.find(x=>x.id===o.id),patch));applyAll();}
  });

  const observer=new MutationObserver(()=>{if(renderGuard)return;const s=q(".ps-studio");if(s&&!s.dataset.v4)mount(s);else if(s){studio=s;clearTimeout(selectionTimer);selectionTimer=setTimeout(applyAll,80);}});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  addEventListener("hashchange",()=>setTimeout(()=>{studio=q(".ps-studio");if(studio)applyAll();},100));
  const initial=q(".ps-studio");if(initial)mount(initial);
})();