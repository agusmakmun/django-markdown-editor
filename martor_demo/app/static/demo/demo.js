// Theme toggle: auto -> light -> dark, stored under the same localStorage key as django admin,
// so the demo pages and /admin/ share the preference.
(function () {
  var order = ["auto", "light", "dark"];

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".theme-toggle");
    if (!button) return;
    var current = document.documentElement.dataset.theme || "auto";
    var next = order[(order.indexOf(current) + 1) % order.length];
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
  });
})();
