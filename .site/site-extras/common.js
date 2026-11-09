/* Shared by the Fermenta Home and Map pages: theme (shared with Quartz) and the top bar. */
(function () {
  // Folder this site is served from (empty at a domain root, "/Fermenta" on GitHub Pages)
  var src = document.currentScript.src;
  var BASE = new URL(src).pathname.replace(/\/[^\/]*$/, "");
  window.FM_BASE = BASE;
  var dark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  var t = null;
  try { t = localStorage.getItem("theme"); } catch (e) {}
  document.documentElement.setAttribute("saved-theme", t || (dark ? "dark" : "light"));

  var LINKS = [
    ["Grapes", BASE + "/grapes/index.base"], ["Regions", BASE + "/regions/wine-regions.base"], ["Map", BASE + "/map.html"],
    ["Styles", BASE + "/styles/index.base"], ["Producers", BASE + "/producers/index.base"], ["Shops", BASE + "/shops/index.base"]
  ];
  document.addEventListener("DOMContentLoaded", function () {
    var active = document.body.getAttribute("data-active") || "";
    var nav = LINKS.map(function (l) { return '<a href="' + l[1] + '"' + (l[0] === active ? ' class="on"' : "") + ">" + l[0] + "</a>"; }).join("");
    var bar = document.createElement("header");
    bar.className = "fm-top";
    bar.innerHTML = '<div class="fm-top-in"><a class="fm-logo" href="' + (BASE || "") + '/">Fermenta</a><nav class="fm-nav">' + nav +
      '</nav><button class="fm-toggle" id="fm-toggle" title="Switch light or dark" aria-label="Switch light or dark">◐</button></div>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById("fm-toggle").onclick = function () {
      var n = document.documentElement.getAttribute("saved-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("saved-theme", n);
      try { localStorage.setItem("theme", n); } catch (e) {}
    };
  });
})();
