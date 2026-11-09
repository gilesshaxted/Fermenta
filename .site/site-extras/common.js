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
  // Note pages: the sidebar's "scroll to the current page" nudge can leave the page itself scrolled down; start at the top
  if (!location.hash) {
    var top = function () { if (document.getElementById("quartz-root") && window.scrollY > 0 && !window.__fmMoved) window.scrollTo(0, 0); };
    window.addEventListener("wheel", function () { window.__fmMoved = true; }, { once: true, passive: true });
    window.addEventListener("touchstart", function () { window.__fmMoved = true; }, { once: true, passive: true });
    window.addEventListener("load", function () { [0, 150, 500, 1200].forEach(function (t) { setTimeout(top, t); }); });
  }
  document.addEventListener("DOMContentLoaded", function () {
    var active = document.body.getAttribute("data-active") || "";
    var nav = LINKS.map(function (l) { return '<a href="' + l[1] + '"' + (l[0] === active ? ' class="on"' : "") + ">" + l[0] + "</a>"; }).join("");
    var bar = document.createElement("header");
    bar.className = "fm-top";
    bar.innerHTML = '<div class="fm-top-in"><a class="fm-logo" href="' + (BASE || "") + '/"><svg viewBox="0 0 24 40" aria-hidden="true"><path fill="currentColor" d="M10 1h4v4c0 1.2.6 2.2 1.4 3.1C17 9.9 18 11.8 18 14.5V36a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V14.5c0-2.7 1-4.6 2.6-6.4C9.4 7.2 10 6.2 10 5z"/><rect x="6" y="21" width="12" height="11" fill="#000" opacity=".28"/><rect x="10" y="1" width="4" height="3" fill="#000" opacity=".25"/></svg><span><b>Fermenta</b><small>The Wine Wiki</small></span></a><nav class="fm-nav">' + nav +
      '</nav><button class="fm-toggle" id="fm-toggle" title="Switch light or dark" aria-label="Switch light or dark">◐</button></div>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById("fm-toggle").onclick = function () {
      var n = document.documentElement.getAttribute("saved-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("saved-theme", n);
      try { localStorage.setItem("theme", n); } catch (e) {}
      document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: n } }));
    };
  });
})();
