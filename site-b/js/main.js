/**
 * Site B — shared helpers
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var yearEl = document.querySelector("[data-year]");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  });
})();
