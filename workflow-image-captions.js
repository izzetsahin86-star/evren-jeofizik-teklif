(() => {
  const STORAGE_KEY = "evren-jeofizik-teklif-v1";
  const DRAFT_KEY = "evren-workflow-image-captions-draft";
  let queued = false;

  function imageSource(image) {
    if (typeof image === "string") return image;
    return image?.data || image?.src || "";
  }

  function sourceKey(source) {
    const text = String(source || "");
    if (!text) return "";
    let hash = 2166136261;
    const step = Math.max(1, Math.floor(text.length / 2048));
    for (let i = 0; i < text.length; i += step) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return `${text.length}-${(hash >>> 0).toString(36)}`;
  }

  function readDraft() {
    try {
      return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function writeDraft(value) {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    } catch {}
  }

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function editQuoteId() {
    return new URLSearchParams(location.search).get("edit") || "";
  }

  function savedCaptionMap() {
    const state = readState();
    const id = editQuoteId();
    if (!state || !id) return {};
    const quote = (state.quotes || []).find((item) => item.id === id);
    if (!quote) return {};
    const map = {};
    (quote.images || []).forEach((image) => {
      const key = sourceKey(imageSource(image));
      if (key) map[key] = String(image?.caption || "");
    });
    return map;
  }

  function decorate() {
    const figures = [...document.querySelectorAll(".quote-image-grid figure")];
    if (!figures.length) return;

    const draft = readDraft();
    const saved = savedCaptionMap();
    let changed = false;

    figures.forEach((figure) => {
      const img = figure.querySelector("img");
      const src = img?.currentSrc || img?.src || "";
      const key = sourceKey(src);
      if (!key) return;

      let editor = figure.querySelector(".workflow-image-caption-editor");
      if (!editor) {
        editor = document.createElement("label");
        editor.className = "workflow-image-caption-editor";
        editor.innerHTML = '<span>Görsel Başlığı</span><input class="workflow-image-caption-input" type="text" maxlength="100" placeholder="Örn. DES ölçüm noktası" />';
        figure.appendChild(editor);
      }

      const input = editor.querySelector("input");
      input.dataset.imageKey = key;
      if (document.activeElement !== input) {
        input.value = Object.prototype.hasOwnProperty.call(draft, key) ? draft[key] : (saved[key] || "");
      }

      if (!Object.prototype.hasOwnProperty.call(draft, key) && saved[key]) {
        draft[key] = saved[key];
        changed = true;
      }
    });

    if (changed) writeDraft(draft);
  }

  function commitCaptions(fallbackId = "") {
    const state = readState();
    if (!state) return;
    const routeMatch = location.pathname.match(/^\/quotes\/([^/]+)\/?$/);
    const id = routeMatch ? decodeURIComponent(routeMatch[1]) : fallbackId;
    if (!id) return;

    const quote = (state.quotes || []).find((item) => item.id === id);
    if (!quote || !Array.isArray(quote.images)) return;

    const draft = readDraft();
    let changed = false;
    quote.images = quote.images.map((image) => {
      const src = imageSource(image);
      const key = sourceKey(src);
      if (!key || !Object.prototype.hasOwnProperty.call(draft, key)) return image;
      const caption = String(draft[key] || "").trim();
      changed = true;
      if (typeof image === "string") return { data: image, name: "", caption };
      return { ...image, caption };
    });

    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  document.addEventListener("input", (event) => {
    const input = event.target.closest?.(".workflow-image-caption-input");
    if (!input) return;
    const key = input.dataset.imageKey;
    if (!key) return;
    const draft = readDraft();
    draft[key] = input.value;
    writeDraft(draft);
  });

  document.addEventListener("click", (event) => {
    const save = event.target.closest?.('[data-action="save-quote"]');
    if (!save) return;
    const fallbackId = editQuoteId();
    setTimeout(() => commitCaptions(fallbackId), 80);
    setTimeout(() => commitCaptions(fallbackId), 260);
  });

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      decorate();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate, { once: true });
  else decorate();
})();
