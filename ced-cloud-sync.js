(() => {
  const STORAGE_KEY = "evren-jeofizik-ced-v1";
  const REVISION_KEY = "evren-ced-cloud-revision";
  const INITIALIZED_KEY = "evren-ced-cloud-initialized-v1";
  const API_STATE = "/api/ced-state";
  const rawSetItem = Storage.prototype.setItem;

  let applyingRemote = false;
  let revision = Number(sessionStorage.getItem(REVISION_KEY) || 0);
  let baseline = [];
  let dirty = false;
  let pushTimer = 0;
  let pushInFlight = false;
  let queuedPush = false;
  let syncReady = false;

  function readLocal() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function fingerprint(value) {
    try { return JSON.stringify(value); } catch { return ""; }
  }

  function setRevision(value) {
    revision = Number(value || 0);
    sessionStorage.setItem(REVISION_KEY, String(revision));
  }

  function isEditing() {
    return Boolean(document.querySelector('[data-action="save"]'));
  }

  function notice(message) {
    const toast = document.getElementById("ced-toast");
    if (!toast || !message) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._cedSyncTimer);
    toast._cedSyncTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  async function api(options = {}) {
    const response = await fetch(API_STATE, {
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

  function updatedAt(item) {
    const value = Date.parse(item?.updatedAt || "");
    return Number.isFinite(value) ? value : 0;
  }

  function mergeRecords(remote, local) {
    const map = new Map();
    for (const item of Array.isArray(remote) ? remote : []) {
      if (!item?.id) continue;
      map.set(item.id, item);
    }
    for (const item of Array.isArray(local) ? local : []) {
      if (!item?.id) continue;
      const current = map.get(item.id);
      if (!current || updatedAt(item) >= updatedAt(current)) map.set(item.id, item);
    }
    return [...map.values()];
  }

  function writeLocal(records, reload = false) {
    const current = readLocal();
    const changed = fingerprint(current) !== fingerprint(records);
    applyingRemote = true;
    try {
      rawSetItem.call(localStorage, STORAGE_KEY, JSON.stringify(records));
    } finally {
      applyingRemote = false;
    }
    if (changed && reload && !isEditing()) setTimeout(() => location.reload(), 60);
    return changed;
  }

  function deletedIdsSinceBaseline(local) {
    const localIds = new Set(local.map((item) => item?.id).filter(Boolean));
    return new Set(baseline.map((item) => item?.id).filter((id) => id && !localIds.has(id)));
  }

  async function initializeOrPull() {
    const local = readLocal();
    const { response, payload } = await api({ method: "GET" });

    if (response.status === 401) {
      notice("ÇED senkron oturumu yenilenmeli. Normal sistemden çıkış yapıp tekrar giriş yapın.");
      return;
    }
    if (!response.ok || !payload.ok) {
      if (response.status === 503) notice("ÇED merkezi senkron bağlantısı hazır değil.");
      return;
    }

    if (!payload.initialized) {
      const result = await api({
        method: "PUT",
        body: JSON.stringify({ state: local, initialize: true, baseRevision: 0 })
      });
      if (result.response.ok && result.payload.ok) {
        setRevision(result.payload.revision);
        baseline = local;
        localStorage.setItem(INITIALIZED_KEY, "1");
        syncReady = true;
        notice("ÇED teklifleri merkezi senkrona bağlandı.");
      } else if (result.response.status === 409) {
        await initializeOrPull();
      }
      return;
    }

    const remote = Array.isArray(payload.state) ? payload.state : [];
    setRevision(payload.revision);

    if (localStorage.getItem(INITIALIZED_KEY) !== "1") {
      const merged = mergeRecords(remote, local);
      baseline = remote;
      if (fingerprint(merged) !== fingerprint(remote)) {
        const result = await api({
          method: "PUT",
          body: JSON.stringify({ state: merged, initialize: false, baseRevision: revision })
        });
        if (result.response.ok && result.payload.ok) {
          setRevision(result.payload.revision);
          baseline = merged;
          localStorage.setItem(INITIALIZED_KEY, "1");
          syncReady = true;
          writeLocal(merged, true);
          notice("Bu cihazdaki ÇED teklifleri merkezde birleştirildi.");
          return;
        }
        if (result.response.status === 409) {
          await initializeOrPull();
          return;
        }
      }
      baseline = merged;
      localStorage.setItem(INITIALIZED_KEY, "1");
      syncReady = true;
      writeLocal(merged, true);
      return;
    }

    baseline = remote;
    syncReady = true;
    writeLocal(remote, true);
  }

  async function pushNow() {
    if (!syncReady || applyingRemote) return;
    if (pushInFlight) {
      queuedPush = true;
      return;
    }

    pushInFlight = true;
    try {
      const local = readLocal();
      const deletedIds = deletedIdsSinceBaseline(local);
      const { response, payload } = await api({
        method: "PUT",
        body: JSON.stringify({ state: local, initialize: false, baseRevision: revision })
      });

      if (response.ok && payload.ok) {
        setRevision(payload.revision);
        baseline = local;
        dirty = false;
        return;
      }

      if (response.status === 409 && payload.error === "revision_conflict" && Array.isArray(payload.state)) {
        setRevision(payload.revision);
        const merged = mergeRecords(payload.state, local).filter((item) => !deletedIds.has(item?.id));
        const retry = await api({
          method: "PUT",
          body: JSON.stringify({ state: merged, initialize: false, baseRevision: revision })
        });
        if (retry.response.ok && retry.payload.ok) {
          setRevision(retry.payload.revision);
          baseline = merged;
          dirty = false;
          writeLocal(merged, false);
          return;
        }
      }
    } catch (error) {
      console.warn("ÇED merkezi senkron gönderimi başarısız.", error);
    } finally {
      pushInFlight = false;
      if (queuedPush) {
        queuedPush = false;
        setTimeout(pushNow, 120);
      }
    }
  }

  function schedulePush(delay = 220) {
    if (!syncReady || applyingRemote) return;
    dirty = true;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, delay);
  }

  async function pullRemote() {
    if (!syncReady || dirty || pushInFlight || isEditing()) return;
    try {
      const { response, payload } = await api({ method: "GET" });
      if (!response.ok || !payload.ok || !payload.initialized || !Array.isArray(payload.state)) return;
      const remoteRevision = Number(payload.revision || 0);
      if (remoteRevision <= revision) return;
      setRevision(remoteRevision);
      baseline = payload.state;
      writeLocal(payload.state, true);
    } catch {}
  }

  Storage.prototype.setItem = function cedCloudAwareSetItem(key, value) {
    const result = rawSetItem.call(this, key, value);
    if (this === localStorage && key === STORAGE_KEY && !applyingRemote) schedulePush();
    return result;
  };

  window.addEventListener("focus", () => setTimeout(() => pullRemote(), 250));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") pullRemote();
  });
  setInterval(() => {
    if (document.visibilityState === "visible") pullRemote();
  }, 12000);

  setTimeout(() => initializeOrPull().catch((error) => console.warn("ÇED merkezi senkron başlatılamadı.", error)), 300);
})();
