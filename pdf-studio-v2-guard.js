(() => {
  "use strict";
  const NativeMutationObserver = window.MutationObserver;
  if (!NativeMutationObserver || window.__evrenPdfStudioGuard) return;
  window.__evrenPdfStudioGuard = true;
  window.MutationObserver = class EvrenFilteredMutationObserver extends NativeMutationObserver {
    constructor(callback) {
      super((records, observer) => {
        const meaningful = records.filter((record) => {
          const target = record.target instanceof Element ? record.target : record.target?.parentElement;
          return !target?.closest?.(".ps-studio, .ps-detail-pages");
        });
        if (meaningful.length) callback(meaningful, observer);
      });
    }
  };
})();
