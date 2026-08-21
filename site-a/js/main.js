(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();
