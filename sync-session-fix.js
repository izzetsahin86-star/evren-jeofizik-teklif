(() => {
  const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isMobileDevice) return;

  const STORAGE_KEY = "evren-jeofizik-teklif-v1";
  const AUTH_KEY = "evren-jeofizik-auth";
  const REVISION_KEY = "evren-cloud-sync-revision";
  const ACTIVE_KEY = "evren-cloud-sync-active";
  const API_SESSION = "/api/session";
  const API_STATE = "/api/state";

  let working = false;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function notice(message, type = "info", timeout = 3200) {
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
      maxWidth: "min(390px, calc(100vw - 32px))",
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

  async function waitForLocalLogin() {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (sessionStorage.getItem(AUTH_KEY) === "1") return true;
      await sleep(80);
    }
    return false;
  }

  function applyRemoteState(payload) {
    if (!payload?.initialized || !payload.state || typeof payload.state !== "object") return false;

    let current = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      current = raw ? JSON.parse(raw) : null;
    } catch {}

    let changed = true;
    try { changed = JSON.stringify(current) !== JSON.stringify(payload.state); } catch {}

    sessionStorage.setItem(REVISION_KEY, String(Number(payload.revision || 0)));
    sessionStorage.setItem(ACTIVE_KEY, "1");

    if (!changed) {
      notice("Merkezi senkron aktif.", "success", 1800);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.state));
    notice("Telefondaki kayıtlar PC'ye alındı.", "success", 2200);
    setTimeout(() => location.reload(), 120);
    return true;
  }

  async function establishAndPull(password) {
    if (!password || working) return;
    working = true;

    try {
      const loggedIn = await waitForLocalLogin();
      if (!loggedIn) return;

      let sessionReady = false;
      let lastPayload = {};

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const { response, payload } = await request(API_SESSION, {
          method: "POST",
          body: JSON.stringify({ password })
        });
        lastPayload = payload;

        if (response.ok && payload.ok) {
          sessionReady = true;
          break;
        }

        if (response.status === 503 && payload.error === "setup_required") {
          notice("Merkezi senkron bağlantı ayarı eksik.", "error", 4200);
          return;
        }

        await sleep(250 * (attempt + 1));
      }

      if (!sessionReady) {
        notice(`Senkron oturumu açılamadı${lastPayload?.error ? `: ${lastPayload.error}` : "."}`, "error", 4600);
        return;
      }

      let stateResult = await request(API_STATE, { method: "GET" });
      if (stateResult.response.status === 401) {
        await sleep(250);
        const retrySession = await request(API_SESSION, {
          method: "POST",
          body: JSON.stringify({ password })
        });
        if (retrySession.response.ok && retrySession.payload.ok) {
          stateResult = await request(API_STATE, { method: "GET" });
        }
      }

      const { response, payload } = stateResult;
      if (!response.ok || !payload.ok) {
        notice(`Merkezi kayıtlar alınamadı${payload?.error ? `: ${payload.error}` : "."}`, "error", 4800);
        return;
      }

      if (!payload.initialized) {
        notice("Merkezi kayıt henüz başlatılmamış.", "info", 3600);
        return;
      }

      applyRemoteState(payload);
    } catch (error) {
      console.warn("PC senkron oturum düzeltmesi başarısız.", error);
      notice("Merkezi senkron bağlantısında geçici hata oluştu.", "error", 4200);
    } finally {
      working = false;
    }
  }

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (form?.id !== "login-form") return;
    const password = form.querySelector('[name="password"], #login-password')?.value || "";
    if (!password) return;
    setTimeout(() => establishAndPull(password), 0);
  }, true);
})();
