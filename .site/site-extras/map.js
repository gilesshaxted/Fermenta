(function () {
  var COL = { "Europe": "#B0304A", "North America": "#D98E2B", "South America": "#4E9A57", "Asia": "#3C7FB5", "Africa": "#8A5DB0", "Oceania": "#2AA198" };
  var esc = function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var norm = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
  var map = L.map("map", { worldCopyJump: true, minZoom: 2, zoomControl: true }).setView([30, 10], 2);
  // OpenStreetMap tiles (no key needed). Dark mode darkens them with a CSS filter, see fermenta.css
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors", maxZoom: 19
  }).addTo(map);

  var layer = L.layerGroup().addTo(map), regs = [], hidden = {};
  fetch(FM_BASE + "/fermenta-data.json").then(function (r) { return r.json(); }).then(function (d) {
    regs = d.filter(function (r) { return r.t === "region" && r.ll; });
    regs.forEach(function (r) { r._h = norm(r.n + " " + (r.co || "")); });
    var conts = Object.keys(COL);
    $("mc").innerHTML += conts.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("");
    $("legend").innerHTML = conts.map(function (c) { return '<span data-c="' + c + '"><i style="background:' + COL[c] + '"></i>' + c + "</span>"; }).join("");
    Array.prototype.forEach.call($("legend").querySelectorAll("span"), function (s) {
      s.onclick = function () { var c = s.getAttribute("data-c"); hidden[c] = !hidden[c]; s.style.opacity = hidden[c] ? .35 : 1; draw(false); };
    });
    draw(true);
  });
  function $(id) { return document.getElementById(id); }

  function draw(fit) {
    layer.clearLayers();
    var q = norm($("mq").value).trim(), c = $("mc").value, lv = $("ml").value, pts = [], n = 0;
    regs.forEach(function (r) {
      if (hidden[r.ct]) return;
      if (c && r.ct !== c) return;
      if (lv && r.lv !== lv) return;
      if (q && q.split(/\s+/).some(function (t) { return r._h.indexOf(t) < 0; })) return;
      var main = r.lv !== "sub-region";
      var m = L.circleMarker(r.ll, { radius: main ? 7 : 5, color: "#fff", weight: 1, fillColor: COL[r.ct] || "#888", fillOpacity: main ? .9 : .7 });
      m.bindPopup('<div class="pop"><a class="pop-title" href="' + esc(FM_BASE + r.u) + '">' + esc(r.n) + "</a><small>" + esc(r.co || "") + (r.lv === "sub-region" ? " · sub-region" : "") + "</small>" +
        (r.cl ? "<small>" + esc(r.cl) + "</small>" : "") + (r.g && r.g.length ? '<div class="g">' + esc(r.g.slice(0, 5).join(", ")) + "</div>" : "") + "</div>");
      m.bindTooltip(r.n, { direction: "top" });
      m.addTo(layer); pts.push(r.ll); n++;
    });
    $("count").textContent = n + " region" + (n === 1 ? "" : "s") + " shown";
    if (pts.length && (fit || q || c)) {
      if (q || c) map.fitBounds(L.latLngBounds(pts).pad(0.2), { maxZoom: 9 });
      else map.setView([30, 10], 2);
    }
  }
  ["mq", "mc", "ml"].forEach(function (id) { $(id).addEventListener(id === "mq" ? "input" : "change", function () { draw(true); }); });
})();
