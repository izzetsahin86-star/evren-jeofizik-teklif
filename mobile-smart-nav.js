(() => {
  const NAV_ID = "mobile-smart-nav";

  const icons = {
    home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.4a.8.8 0 0 1-.8.8h-5.4v-6.2H9.2V21H3.8a.8.8 0 0 1-.8-.8z"/><path d="M9.2 21v-6.2h5.6V21"/></svg>`,
    file: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.8h8l4 4V21H6z"/><path d="M14 2.8v4h4M9 11h6M9 15h6"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
    users: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 19c.5-4 2.4-6 5.5-6s5 2 5.5 6"/><circle cx="17" cy="9" r="2.3"/><path d="M15.7 14.2c2.9-.3 4.5 1.3 4.8 4.3"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>`
  };

  function makeNav() {
    let nav = document.getElementById(NAV_ID);
    if (nav) return nav;

    nav = document.createElement("nav");
    nav.id = NAV_ID;
    nav.className = "mobile-smart-nav";
    nav.setAttribute("aria-label", "Mobil hızlı menü");
    nav.innerHTML = `
      <a href="/" data-link="/" data-mobile-key="dashboard" class="mobile-smart-item mobile-smart-home" aria-label="Ana Panel">
        <span class="mobile-smart-icon">${icons.home}</span><span class="mobile-smart-label">Ana Sayfa</span>
      </a>
      <a href="/quotes" data-link="/quotes" data-mobile-key="quotes" class="mobile-smart-item mobile-smart-quotes" aria-label="Teklifler">
        <span class="mobile-smart-icon">${icons.file}</span><span class="mobile-smart-label">Teklifler</span>
      </a>
      <a href="/quotes/new" data-link="/quotes/new" data-mobile-key="new" class="mobile-smart-item mobile-smart-create" aria-label="Yeni Teklif">
        <span class="mobile-smart-create-orbit"></span><span class="mobile-smart-create-icon">${icons.plus}</span><span class="mobile-smart-label">Yeni Teklif</span>
      </a>
      <a href="/customers" data-link="/customers" data-mobile-key="customers" class="mobile-smart-item mobile-smart-customers" aria-label="Müşteriler">
        <span class="mobile-smart-icon">${icons.users}</span><span class="mobile-smart-label">Müşteriler</span>
      </a>
      <button type="button" data-action="open-menu" data-mobile-key="menu" class="mobile-smart-item mobile-smart-menu" aria-label="Menü">
        <span class="mobile-smart-icon">${icons.menu}</span><span class="mobile-smart-label">Menü</span>
      </button>`;

    document.body.appendChild(nav);
    return nav;
  }

  function currentKey() {
    const path = location.pathname.replace(/\/$/, "") || "/";
    if (path === "/quotes/new") return "new";
    if (path === "/quotes" || path.startsWith("/quotes/")) return "quotes";
    if (path === "/customers") return "customers";
    if (path === "/") return "dashboard";
    return "menu";
  }

  function syncNav() {
    const nav = makeNav();
    const appShell = document.getElementById("app-shell");
    const pdfOpen = Boolean(document.querySelector(".pdf-preview-backdrop"));
    nav.classList.toggle("is-visible", Boolean(appShell) && !pdfOpen);

    const activeKey = currentKey();
    nav.querySelectorAll("[data-mobile-key]").forEach((item) => {
      const active = item.dataset.mobileKey === activeKey;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  }

  function init() {
    makeNav();
    syncNav();

    const app = document.getElementById("app");
    if (app) {
      new MutationObserver(syncNav).observe(app, { childList: true, subtree: true });
    }

    window.addEventListener("popstate", syncNav);
    window.addEventListener("resize", syncNav, { passive: true });
    document.addEventListener("click", (event) => {
      if (event.target.closest(`#${NAV_ID}`)) requestAnimationFrame(syncNav);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
