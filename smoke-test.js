const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");

const source = fs.readFileSync("app.js", "utf8");
const routes = [
  ["/", "Ana Panel"],
  ["/quotes", "Teklifler"],
  ["/quotes/new", "Yeni Teklif"],
  ["/quotes/quote-123", "FİYAT TEKLİFİ"],
  ["/quotes/quote-123/edit", "Teklifi Düzenle"],
  ["/customers", "Müşteriler"],
  ["/catalog", "Jeofizik Hizmet Kataloğu"],
  ["/settings", "Teklif Varsayılanları"],
];

for (const [pathname, expected] of routes) {
  const nodes = {
    app: { innerHTML: "", addEventListener() {} },
    "toast-root": { innerHTML: "" },
  };
  const storage = new Map();
  const document = {
    title: "",
    getElementById(id) { return nodes[id] || null; },
    querySelectorAll() { return []; },
    querySelector() { return null; },
  };
  const window = {
    location: { pathname },
    addEventListener() {},
    scrollTo() {},
    print() {},
  };
  const context = {
    console,
    document,
    window,
    history: { pushState() {} },
    localStorage: {
      getItem(key) { return storage.get(key) ?? null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); },
    },
    Intl,
    Date,
    Math,
    JSON,
    Number,
    String,
    Object,
    Array,
    Map,
    FormData: class {},
    FileReader: class {},
    setTimeout,
    clearTimeout,
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "app.js" });
  assert.match(nodes.app.innerHTML, new RegExp(expected), `${pathname} beklenen içeriği üretmedi`);
}

console.log(`${routes.length} temel ekran başarıyla oluşturuldu.`);
