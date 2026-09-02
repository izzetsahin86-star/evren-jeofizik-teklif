(() => {
  const STORAGE_KEY = "evren-jeofizik-teklif-v1";
  const AUTH_KEY = "evren-jeofizik-auth";
  const REVISION_KEY = "evren-cloud-sync-revision";
  const ACTIVE_KEY = "evren-cloud-sync-active";
  const API_STATE = "/api/state";
  const API_SESSION = "/api/session";
  const rawSetItem = Storage.prototype.setItem;

  let applyingRemote = false;
  let syncActive = sessionStorage.getItem(ACTIVE_KEY) === "1";
  let revision = Number(sessionStorage.getItem(REVISION_KEY) || 0);
  let pushTimer = 0;
  let pushInFlight = false;
  let queuedPush = false;
  let setupRequired = false;
  let pendingRemote = null;

  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function isEditing() {
    return location.pathname === "/quotes/new"
      || Boolean(document.querySelector("#modal-root, .modal-backdrop"));
  }

  function readLocalState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function stateFingerprint(state) {
    try { return JSON.stringify(state); } catch { return ""; }
  }

  function setRevision(value) {
    revision = Number(value || 0);
    sessionStorage.setItem(REVISION_KEY, String(revision));
  }

  function setActive(value) {
    syncActive = Boolean(value);
    if (syncActive) sessionStorage.setItem(ACTIVE_KEY, "1");
    else sessionStorage.removeItem(ACTIVE_KEY);
  }

  function notice(message, type = "info", timeout = 2600) {
    if (!message) return;
    const root = document.getElementById("toast-root") || document.body;
    const item = document.createElement("div");
    item.textContent = message;
    item.setAttribute("role", "status");
    Object.assign(item.style, {
      position: root === document.body ? "fixed" : "relative",
      right: root === document.body ? "16px" : "auto",
      top: root === document.body ? "16px" : "auto",
      zIndex: "99999",
      maxWidth: "min(360px, calc(100vw - 32px))",
      padding: "11px 14px",
      borderRadius: "10px",
      background: type === "error" ? "#8d2d2d" : type === "success" ? "#285f45" : "#30302f",
      color: "#fff",
      font: "600 13px/1.35 Inter, Arial, sans-serif",
      boxShadow: "0 10px 30px rgba(0,0,0,.18)"
    });
    root.appendChild(item);
    setTimeout(() => item.remove(), timeout);
  }

  async function api(url, options = {}) {
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

  function applyRemoteState(state, nextRevision, reload = true) {
    if (!state || typeof state !== "object") return false;
    const current = readLocalState();
    const changed = stateFingerprint(current) !== stateFingerprint(state);
    applyingRemote = true;
    try {
      rawSetItem.call(localStorage, STORAGE_KEY, JSON.stringify(state));
      setRevision(nextRevision);
    } finally {
      applyingRemote = false;
    }
    if (changed && reload) {
      setTimeout(() => location.reload(), 60);
    }
    return changed;
  }

  async function pullRemote({ reload = true, quiet = true } = {}) {
    if (!syncActive || setupRequired) return null;
    const { response, payload } = await api(API_STATE, { method: "GET" });

    if (response.status === 503 && payload.error === "setup_required") {
      setupRequired = true;
      setActive(false);
      return payload;
    }
    if (response.status === 401) {
      setActive(false);
      return payload;
    }
    if (!response.ok || !payload.ok) return payload;

    if (!payload.initialized) return payload;

    const remoteRevision = Number(payload.revision || 0);
    if (remoteRevision > revision && payload.state) {
      if (isEditing()) {
        pendingRemote = payload;
        if (!quiet) notice("Başka cihazda yeni veri var. Bu düzenleme tamamlanınca senkronlanacak.");
        return payload;
      }
      applyRemoteState(payload.state, remoteRevision, reload);
      if (!reload && !quiet) notice("Veriler merkezden güncellendi.", "success");
    } else if (remoteRevision > revision) {
      setRevision(remoteRevision);
    }
    return payload;
  }

  async function initializeFromMobile() {
    if (!isMobileDevice()) return false;
    const state = readLocalState();
    if (!state) return false;

    const { response, payload } = await api(API_STATE, {
      method: "PUT",
      body: JSON.stringify({
        state,
        initialize: true,
        source: "mobile",
        baseRevision: 0
      })
    });

    if (response.ok && payload.ok) {
      setRevision(payload.revision);
      setActive(true);
      notice("Merkezi senkron mobildeki doğru verilerle etkinleştirildi.", "success", 3400);
      return true;
    }

    if (response.status === 409 && payload.initialized && payload.state) {
      setRevision(payload.revision);
      setActive(true);
      applyRemoteState(payload.state, payload.revision, true);
      return true;
    }
    return false;
  }

  async function activateAndSync() {
    if (sessionStorage.getItem(AUTH_KEY) !== "1") return;
    setActive(true);

    const { response, payload } = await api(API_STATE, { method: "GET" });
    if (response.status === 503 && payload.error === "setup_required") {
      setupRequired = true;
      setActive(false);
      notice("Merkezi senkron için son bağlantı ayarı bekleniyor.");
      return;
    }
    if (response.status === 401) {
      setActive(false);
      return;
    }
    if (!response.ok || !payload.ok) return;

    if (!payload.initialized) {
      if (isMobileDevice()) {
        await initializeFromMobile();
      } else {
        notice("İlk senkron için doğru verilerin olduğu mobil cihazdan bir kez giriş yapın.", "info", 4800);
      }
      return;
    }

    const remoteRevision = Number(payload.revision || 0);
    setActive(true);
    if (payload.state) {
      const changed = stateFingerprint(readLocalState()) !== stateFingerprint(payload.state);
      setRevision(remoteRevision);
      if (changed) {
        applyRemoteState(payload.state, remoteRevision, true);
      } else {
        notice("Merkezi senkron aktif.", "success", 1800);
      }
    }
  }

  async function establishSyncSession(password) {
    if (!password) return false;
    const { response, payload } = await api(API_SESSION, {
      method: "POST",
      body: JSON.stringify({ password })
    });
    if (response.status === 503 && payload.error === "setup_required") {
      setupRequired = true;
      return false;
    }
    if (!response.ok || !payload.ok) return false;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (sessionStorage.getItem(AUTH_KEY) === "1") {
        await activateAndSync();
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    return false;
  }

  async function pushNow() {
    if (!syncActive || setupRequired || applyingRemote) return;
    if (pushInFlight) {
      queuedPush = true;
      return;
    }

    const state = readLocalState();
    if (!state) return;

    pushInFlight = true;
    try {
      const { response, payload } = await api(API_STATE, {
        method: "PUT",
        body: JSON.stringify({
          state,
          initialize: false,
          source: isMobileDevice() ? "mobile" : "desktop",
          baseRevision: revision
        })
      });

      if (response.ok && payload.ok) {
        setRevision(payload.revision);
        return;
      }

      if (response.status === 409 && payload.error === "revision_conflict" && payload.state) {
        setRevision(payload.revision);
        pendingRemote = payload;
        if (!isEditing()) {
          notice("Başka cihazdaki daha yeni kayıt alındı.", "info", 3000);
          applyRemoteState(payload.state, payload.revision, true);
        } else {
          notice("Senkron çakışması: önce diğer cihazdaki yeni kayıt korunuyor.", "error", 4200);
        }
        return;
      }

      if (response.status === 401) {
        setActive(false);
        return;
      }
      if (response.status === 503 && payload.error === "setup_required") {
        setupRequired = true;
        setActive(false);
      }
    } catch (error) {
      console.warn("Merkezi senkron gönderimi başarısız.", error);
    } finally {
      pushInFlight = false;
      if (queuedPush) {
        queuedPush = false;
        setTimeout(pushNow, 150);
      }
    }
  }

  function schedulePush(delay = 260) {
    if (!syncActive || setupRequired || applyingRemote) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, delay);
  }

  Storage.prototype.setItem = function cloudAwareSetItem(key, value) {
    const result = rawSetItem.call(this, key, value);
    if (this === localStorage && key === STORAGE_KEY && !applyingRemote) {
      schedulePush();
    }
    return result;
  };

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (form?.id !== "login-form") return;
    const password = form.querySelector('[name="password"], #login-password')?.value || "";
    if (!password) return;
    establishSyncSession(password).catch((error) => console.warn("Senkron oturumu açılamadı.", error));
  }, true);

  document.addEventListener("click", (event) => {
    if (event.target.closest?.('[data-action="logout"]')) {
      setActive(false);
      setRevision(0);
      fetch(API_SESSION, { method: "DELETE", credentials: "same-origin", keepalive: true }).catch(() => {});
      return;
    }

    if (event.target.closest?.('[data-action="save-quote"]')) {
      setTimeout(() => schedulePush(20), 120);
    }
  }, true);

  window.addEventListener("focus", () => {
    if (!syncActive) return;
    setTimeout(() => {
      if (pendingRemote && !isEditing()) {
        const payload = pendingRemote;
        pendingRemote = null;
        applyRemoteState(payload.state, payload.revision, true);
        return;
      }
      pullRemote({ reload: true, quiet: true }).catch(() => {});
    }, 300);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || !syncActive) return;
    pullRemote({ reload: true, quiet: true }).catch(() => {});
  });

  setInterval(() => {
    if (document.visibilityState !== "visible" || !syncActive || isEditing()) return;
    pullRemote({ reload: true, quiet: true }).catch(() => {});
  }, 30000);

  if (sessionStorage.getItem(AUTH_KEY) === "1") {
    setTimeout(() => activateAndSync().catch(() => {}), 350);
  }
})();
