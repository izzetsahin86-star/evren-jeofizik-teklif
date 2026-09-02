(() => {
  const STORAGE_KEY = "evren-jeofizik-teklif-v1";
  const REFRESH_KEY = "evren-auto-customer-refresh";
  const nativeSetItem = Storage.prototype.setItem;
  const sessionCustomers = new Map();
  let pendingCustomer = null;

  function normalizeName(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLocaleLowerCase("tr-TR")
      .replace(/[^\p{L}\p{N}]+/gu, "")
      .trim();
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function makeId() {
    return typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `customer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function customerFromQuoteForm() {
    const quoteNo = clean(document.querySelector('[data-model="no"]')?.value);
    const name = clean(document.querySelector('[data-model="customerName"]')?.value);
    if (!quoteNo || !name) return null;

    return {
      quoteNo,
      selectedId: clean(document.querySelector('[data-action="select-customer"]')?.value),
      name,
      contact: clean(document.querySelector('[data-model="contact"]')?.value),
      phone: clean(document.querySelector('[data-model="phone"]')?.value),
      email: clean(document.querySelector('[data-model="email"]')?.value)
    };
  }

  function findCustomer(customers, candidate) {
    if (candidate.selectedId) {
      const byId = customers.find((customer) => customer.id === candidate.selectedId);
      if (byId) return byId;
    }

    const key = normalizeName(candidate.name);
    return customers.find((customer) => normalizeName(customer?.name) === key) || null;
  }

  function mergeCustomer(state, candidate) {
    if (!state || !candidate?.name) return null;
    if (!Array.isArray(state.customers)) state.customers = [];

    let customer = findCustomer(state.customers, candidate);
    if (!customer) {
      customer = {
        id: candidate.selectedId || makeId(),
        name: candidate.name,
        contact: candidate.contact,
        phone: candidate.phone,
        email: candidate.email,
        address: "",
        taxOffice: "",
        taxNo: "",
        notes: ""
      };
      state.customers.push(customer);
    } else {
      customer.name = candidate.name || customer.name;
      if (candidate.contact) customer.contact = candidate.contact;
      if (candidate.phone) customer.phone = candidate.phone;
      if (candidate.email) customer.email = candidate.email;
    }

    if (Array.isArray(state.quotes)) {
      const matches = state.quotes.filter((quote) =>
        clean(quote?.no) === candidate.quoteNo &&
        normalizeName(quote?.customerName) === normalizeName(candidate.name)
      );
      const quote = matches[matches.length - 1];
      if (quote) quote.customerId = customer.id;
    }

    return { ...customer };
  }

  function mergeSessionCustomers(state) {
    if (!Array.isArray(state?.customers)) state.customers = [];
    sessionCustomers.forEach((saved) => {
      let existing = state.customers.find((customer) => customer.id === saved.id);
      if (!existing) {
        existing = state.customers.find((customer) => normalizeName(customer?.name) === normalizeName(saved.name));
      }
      if (existing) Object.assign(existing, saved);
      else state.customers.push({ ...saved });
    });
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    if (this === localStorage && key === STORAGE_KEY) {
      try {
        const state = JSON.parse(String(value));
        mergeSessionCustomers(state);

        if (pendingCustomer) {
          const saved = mergeCustomer(state, pendingCustomer);
          pendingCustomer = null;
          if (saved) {
            sessionCustomers.set(saved.id, saved);
            sessionStorage.setItem(REFRESH_KEY, "1");
          }
        }

        value = JSON.stringify(state);
      } catch (error) {
        console.warn("Teklif müşterisi otomatik kaydedilemedi.", error);
      }
    }

    return nativeSetItem.call(this, key, value);
  };

  function needsFreshState() {
    return sessionStorage.getItem(REFRESH_KEY) === "1";
  }

  function clearFreshStateFlag() {
    sessionStorage.removeItem(REFRESH_KEY);
  }

  if (needsFreshState() && (location.pathname === "/customers" || location.pathname === "/quotes/new")) {
    clearFreshStateFlag();
  }

  document.addEventListener("click", (event) => {
    const saveButton = event.target.closest('[data-action="save-quote"]');
    if (saveButton) {
      pendingCustomer = customerFromQuoteForm();
      return;
    }

    if (!needsFreshState()) return;

    const link = event.target.closest('[data-link], a[href]');
    if (!link) return;
    const href = link.dataset.link || link.getAttribute("href") || "";
    const targetPath = href.split("?")[0].replace(/\/$/, "") || "/";
    if (targetPath !== "/customers" && targetPath !== "/quotes/new") return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    clearFreshStateFlag();
    location.assign(href);
  }, true);

  window.addEventListener("popstate", () => {
    if (!needsFreshState()) return;
    if (location.pathname !== "/customers" && location.pathname !== "/quotes/new") return;
    clearFreshStateFlag();
    location.reload();
  });
})();
