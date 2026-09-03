(() => {
  const STORAGE_KEY = "evren-jeofizik-teklif-v1";
  const AUTH_KEY = "evren-jeofizik-auth";
  const META_KEY = "evren-controlled-sync-meta-v2";
  const LAST_SYNC_KEY = "evren-controlled-sync-last-v2";
  const API_STATE = "/api/state";
  const API_SESSION = "/api/session";
  const HOUR = 60 * 60 * 1000;

  let busy = false;
  let hourlyTimer = 0;
  let hourlyKickoff = 0;

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function readMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY) || "{}") || {}; }
    catch { return {}; }
  }

  function writeMeta(meta) {
    try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch {}
  }

  function stable(value) {
    try { return JSON.stringify(value); } catch { return ""; }
  }

  function hashText(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function hashValue(value) { return hashText(stable(value)); }
  function itemKey(item, index) { return String(item?.id || item?.no || `index-${index}`); }

  function baselineFor(state) {
    const result = { settings: hashValue(state?.settings || {}) };
    for (const key of ["quotes", "customers", "companies", "services"]) {
      result[key] = {};
      (Array.isArray(state?.[key]) ? state[key] : []).forEach((item, index) => {
        result[key][itemKey(item, index)] = hashValue(item);
      });
    }
    return result;
  }

  function isEditing() {
    return location.pathname === "/quotes/new"
      || Boolean(document.querySelector("#modal-root, .modal-backdrop, .pdf-modal"));
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      cache: "no-store",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    let payload = {};
    try { payload = await response.json(); } catch {}
    return { response, payload };
  }

  function ensurePanel() {
    let panel = document.getElementById("controlled-sync");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = "controlled-sync";
    panel.className = "controlled-sync";
    panel.innerHTML = `
      <button type="button" class="controlled-sync-btn" data-controlled-sync>
        <span class="controlled-sync-icon" aria-hidden="true">↻</span>
        <span>Senkronize Et</span>
      </button>
      <div class="controlled-sync-meta">
        <span class="controlled-sync-status" data-sync-status>Hazır</span>
        <span class="controlled-sync-last" data-sync-last>Son: —</span>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelector("[data-controlled-sync]")?.addEventListener("click", () => {
      fullSync({ reason: "manual", allowReload: true }).catch(() => {});
    });
    updateVisibility();
    updateLastLabel();
    return panel;
  }

  function updateVisibility() {
    const panel = document.getElementById("controlled-sync");
    if (panel) panel.hidden = sessionStorage.getItem(AUTH_KEY) !== "1";
  }

  function setStatus(text, tone = "idle") {
    const panel = ensurePanel();
    const status = panel.querySelector("[data-sync-status]");
    const button = panel.querySelector("[data-controlled-sync]");
    if (status) {
      status.textContent = text;
      status.dataset.tone = tone;
    }
    if (button) button.disabled = busy;
  }

  function updateLastLabel() {
    const el = document.querySelector("[data-sync-last]");
    if (!el) return;
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    if (!raw) { el.textContent = "Son: —"; return; }
    const date = new Date(raw);
    el.textContent = Number.isNaN(date.getTime())
      ? "Son: —"
      : `Son: ${date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`;
  }

  function markSynced(state, revision) {
    const now = new Date().toISOString();
    writeMeta({ revision: Number(revision || 0), baseline: baselineFor(state), at: now });
    localStorage.setItem(LAST_SYNC_KEY, now);
    updateLastLabel();
  }

  function mergeSettings(localSettings, remoteSettings, baselineHash) {
    const local = localSettings || {};
    const remote = remoteSettings || {};
    const lh = hashValue(local);
    const rh = hashValue(remote);
    if (lh === rh) return { value: local, conflict: 0 };
    if (!baselineHash) return { value: remote, conflict: 0 };
    const localChanged = lh !== baselineHash;
    const remoteChanged = rh !== baselineHash;
    if (localChanged && !remoteChanged) return { value: local, conflict: 0 };
    if (remoteChanged && !localChanged) return { value: remote, conflict: 0 };
    return { value: local, conflict: 1 };
  }

  function mergeObjectArray(localItems, remoteItems, baselineMap = {}) {
    const local = Array.isArray(localItems) ? localItems : [];
    const remote = Array.isArray(remoteItems) ? remoteItems : [];
    const localMap = new Map(local.map((item, index) => [itemKey(item, index), item]));
    const remoteMap = new Map(remote.map((item, index) => [itemKey(item, index), item]));
    const keys = new Set([...remoteMap.keys(), ...localMap.keys()]);
    const merged = [];
    let conflicts = 0;

    keys.forEach((key) => {
      const l = localMap.get(key);
      const r = remoteMap.get(key);
      if (!l) { merged.push(r); return; }
      if (!r) { merged.push(l); return; }

      const lh = hashValue(l);
      const rh = hashValue(r);
      if (lh === rh) { merged.push(l); return; }

      const base = baselineMap?.[key];
      if (!base) {
        // İlk kontrollü senkronda aynı ID farklıysa merkezi sürüm güvenli başlangıçtır.
        // Bu cihazdaki sadece yerel olan kayıtlar yukarıdaki birleşimle ayrıca korunur.
        merged.push(r);
        return;
      }

      const localChanged = lh !== base;
      const remoteChanged = rh !== base;
      if (localChanged && !remoteChanged) { merged.push(l); return; }
      if (remoteChanged && !localChanged) { merged.push(r); return; }

      const lTime = Date.parse(l?.updatedAt || l?.modifiedAt || "") || 0;
      const rTime = Date.parse(r?.updatedAt || r?.modifiedAt || "") || 0;
      if (lTime || rTime) merged.push(lTime >= rTime ? l : r);
      else {
        // İki cihaz aynı kaydı değiştirdiyse körlemesine silme yapma;
        // kullanıcının şu an kullandığı cihazdaki sürümü koru ve uyarı ver.
        merged.push(l);
        conflicts += 1;
      }
    });

    return { items: merged, conflicts };
  }

  function mergeStates(localState, remoteState, baseline = {}) {
    const local = localState || {};
    const remote = remoteState || {};
    let conflicts = 0;
    const settings = mergeSettings(local.settings, remote.settings, baseline.settings);
    conflicts += settings.conflict;

    const result = { ...remote, ...local, settings: settings.value };
    for (const key of ["quotes", "customers", "companies", "services"]) {
      const part = mergeObjectArray(local[key], remote[key], baseline?.[key]);
      result[key] = part.items;
      conflicts += part.conflicts;
    }
    return { state: result, conflicts };
  }

  async function putState(state, baseRevision) {
    return request(API_STATE, {
      method: "PUT",
      body: JSON.stringify({
        state,
        initialize: false,
        source: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? "mobile" : "desktop",
        baseRevision: Number(baseRevision || 0)
      })
    });
  }

  async function fullSync({ reason = "manual", allowReload = false } = {}) {
    if (busy || sessionStorage.getItem(AUTH_KEY) !== "1") return;
    if (isEditing()) {
      if (reason === "manual") setStatus("Önce teklifi kaydedin", "warn");
      return;
    }

    busy = true;
    setStatus("Senkronize ediliyor…", "working");

    try {
      const local = readState();
      if (!local) throw new Error("local_state_missing");

      const current = await request(API_STATE, { method: "GET" });
      if (current.response.status === 401) {
        setStatus("Oturum kapalı · tekrar giriş yapın", "error");
        return;
      }
      if (current.response.status === 503 && current.payload?.error === "setup_required") {
        setStatus("Senkron bağlantısı eksik", "error");
        return;
      }
      if (!current.response.ok || !current.payload?.ok || !current.payload?.initialized || !current.payload?.state) {
        setStatus("Merkezi kayıt alınamadı", "error");
        return;
      }

      const meta = readMeta();
      let merged = mergeStates(local, current.payload.state, meta.baseline || {});
      let remoteRevision = Number(current.payload.revision || 0);
      let save = await putState(merged.state, remoteRevision);

      if (save.response.status === 409 && save.payload?.state) {
        remoteRevision = Number(save.payload.revision || remoteRevision);
        merged = mergeStates(merged.state, save.payload.state, meta.baseline || {});
        save = await putState(merged.state, remoteRevision);
      }

      if (!save.response.ok || !save.payload?.ok) {
        if (save.response.status === 401) setStatus("Oturum kapalı · tekrar giriş yapın", "error");
        else setStatus("Senkron tamamlanamadı", "error");
        return;
      }

      const changedOnDevice = stable(local) !== stable(merged.state);
      writeState(merged.state);
      markSynced(merged.state, save.payload.revision);

      if (merged.conflicts > 0) setStatus(`${merged.conflicts} çakışma · bu cihaz korundu`, "warn");
      else setStatus("Senkron tamamlandı", "success");

      if (allowReload && changedOnDevice) {
        // Sadece girişte veya kullanıcının Senkronize Et butonuna basmasında tek seferlik yenileme.
        // Saatlik kontrol hiçbir zaman location.reload çağırmaz.
        setTimeout(() => location.reload(), 450);
      }
    } catch (error) {
      console.warn("Kontrollü senkron hatası:", error);
      setStatus("Senkron bağlantı hatası", "error");
    } finally {
      busy = false;
      const button = document.querySelector("[data-controlled-sync]");
      if (button) button.disabled = false;
    }
  }

  async function hourlySync() {
    if (busy || sessionStorage.getItem(AUTH_KEY) !== "1" || isEditing()) return;
    const local = readState();
    if (!local) return;
    const meta = readMeta();

    try {
      const current = await request(API_STATE, { method: "GET" });
      if (!current.response.ok || !current.payload?.ok || !current.payload?.initialized) return;

      const remoteRevision = Number(current.payload.revision || 0);
      const knownRevision = Number(meta.revision || 0);

      if (!knownRevision) {
        setStatus("Senkron için butona basın", "warn");
        return;
      }

      if (remoteRevision > knownRevision) {
        // Başka cihazda değişiklik varsa otomatik olarak ekrana dokunma/yükleme yapma.
        // Kullanıcı tek bir manuel senkronla güvenli birleşimi başlatır.
        setStatus("Yeni kayıt var · Senkronize Et", "warn");
        return;
      }

      const localChanged = hashValue(meta.baseline || {}) !== hashValue(baselineFor(local));
      if (!localChanged) {
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        updateLastLabel();
        setStatus("Saatlik kontrol tamam", "success");
        return;
      }

      // Merkez değişmemişse bu cihazdaki kaydı güvenle gönder.
      const save = await putState(local, remoteRevision);
      if (save.response.ok && save.payload?.ok) {
        markSynced(local, save.payload.revision);
        setStatus("Saatlik senkron tamam", "success");
      } else if (save.response.status === 409) {
        setStatus("Yeni kayıt var · Senkronize Et", "warn");
      }
    } catch {
      // Saatlik kontrol sessizdir ve sistem kullanımını hiçbir zaman engellemez.
    }
  }

  async function establishSession(password) {
    if (!password) return false;
    const result = await request(API_SESSION, {
      method: "POST",
      body: JSON.stringify({ password })
    });
    return Boolean(result.response.ok && result.payload?.ok);
  }

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (form?.id !== "login-form") return;
    const password = form.querySelector('[name="password"], #login-password')?.value || "";
    if (!password) return;

    setTimeout(async () => {
      for (let i = 0; i < 40; i += 1) {
        if (sessionStorage.getItem(AUTH_KEY) === "1") break;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      updateVisibility();
      if (sessionStorage.getItem(AUTH_KEY) !== "1") return;
      const ready = await establishSession(password);
      if (ready) await fullSync({ reason: "login", allowReload: true });
      else setStatus("Senkron oturumu açılamadı", "error");
    }, 0);
  }, true);

  document.addEventListener("click", (event) => {
    if (!event.target.closest?.('[data-action="logout"]')) return;
    fetch(API_SESSION, { method: "DELETE", credentials: "same-origin", keepalive: true }).catch(() => {});
    setTimeout(updateVisibility, 50);
  }, true);

  ensurePanel();
  updateVisibility();

  // İlk otomatik kontrol bir sonraki saat başında, sonra her saat bir kez çalışır.
  const untilNextHour = HOUR - (Date.now() % HOUR);
  hourlyKickoff = window.setTimeout(() => {
    hourlySync().catch(() => {});
    hourlyTimer = window.setInterval(() => hourlySync().catch(() => {}), HOUR);
  }, untilNextHour);

  window.addEventListener("beforeunload", () => {
    if (hourlyKickoff) clearTimeout(hourlyKickoff);
    if (hourlyTimer) clearInterval(hourlyTimer);
  }, { once: true });
})();