(function () {
  var D = [], byType = {};
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var rnd = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var norm = function (s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); };
  var ICON = { grape: "🍇", region: "🗺️", style: "🥂", producer: "🏡", shop: "🛒", country: "🌍", continent: "🌍" };
  var LABEL = { grape: "Grape", region: "Region", style: "Style", producer: "Producer", shop: "Shop", country: "Country", continent: "Continent" };
  var PRI = { grape: 0, style: 1, country: 2, region: 3, producer: 4, shop: 5, continent: 6 };

  function sub(r) {
    var j = function (a) { return a.filter(Boolean).join(" · "); };
    if (r.t === "grape") return j([r.c, r.o]);
    if (r.t === "region") return j([r.lv === "sub-region" ? "sub-region" : "", r.co]);
    if (r.t === "style") return j([r.cat, r.c]);
    if (r.t === "producer") return j([r.co, r.cat]);
    if (r.t === "shop") return j([r.cat, r.ar]);
    if (r.t === "country") return r.ct || "";
    return "";
  }
  function extra(r) {
    if (r.t === "grape") return (r.f || []).slice(0, 3).join(", ");
    if (r.t === "region") return r.cl || "";
    if (r.t === "producer") return (r.g || []).slice(0, 3).join(", ");
    if (r.t === "shop") return (r.ar || "");
    return "";
  }

  fetch(FM_BASE + "/fermenta-data.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d;
    D.forEach(function (r) {
      (byType[r.t] = byType[r.t] || []).push(r);
      r._h = norm([r.n, (r.al || []).join(" "), r.co, r.ct, r.ar, r.o, (r.f || []).join(" "), (r.r || []).join(" "), (r.g || []).join(" "), r.cat, r.c, r.cl].join(" | "));
      r._n = norm(r.n);
    });
    stats(); picks(); quiz(); bars(); chips(); search();
    $("ncount").textContent = D.filter(function (r) { return r.nc; }).length;
  });

  function stats() {
    var n = function (t) { return (byType[t] || []).length; };
    var items = [[n("grape"), "grapes"], [n("country"), "countries"], [n("region"), "regions"], [n("style"), "styles"], [n("producer"), "producers"], [n("shop"), "UK shops"]];
    $("stats").innerHTML = items.map(function (i) { return "<div><strong>" + i[0] + "</strong><span>" + i[1] + "</span></div>"; }).join("");
  }

  function card(r) {
    return '<a class="card" href="' + esc(FM_BASE + r.u) + '"><span class="e">' + ICON[r.t] + "</span><strong>" + esc(r.n) + '</strong><span class="s">' + LABEL[r.t] + (sub(r) ? " · " + esc(sub(r)) : "") + '</span><span class="x">' + esc(extra(r)) + "</span></a>";
  }
  function picks() {
    var kinds = ["grape", "region", "style", "producer", "shop"];
    var draw = function () { $("picks").innerHTML = kinds.map(function (k) { return card(rnd(byType[k])); }).join(""); };
    $("shuffle").onclick = draw; draw();
  }

  function quiz() {
    var draw = function () {
      var g = rnd(byType.grape);
      var clues = [["Colour", g.c], ["Body", g.b], ["Acidity", g.a], ["Tannin", g.tn && g.tn !== "none" ? g.tn : null], ["Origin", g.o], ["Tastes of", (g.f || []).slice(0, 4).join(", ")]].filter(function (c) { return c[1]; });
      $("quiz").innerHTML = "<ul>" + clues.map(function (c) { return "<li><strong>" + c[0] + ":</strong> " + esc(c[1]) + "</li>"; }).join("") +
        '</ul><details><summary>Reveal the grape</summary><a href="' + esc(FM_BASE + g.u) + '">' + esc(g.n) + "</a></details>";
    };
    $("another").onclick = draw; draw();
  }

  function count(t, f) {
    var m = {};
    (byType[t] || []).forEach(function (r) { var k = f(r); if (k) m[k] = (m[k] || 0) + 1; });
    return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  }
  function barsHtml(rows) {
    var max = rows.length ? rows[0][1] : 1;
    return rows.map(function (r) { return '<div class="bar"><span class="l" title="' + esc(r[0]) + '">' + esc(r[0]) + '</span><span class="t"><i style="width:' + Math.max(3, Math.round(r[1] / max * 100)) + '%"></i></span><span class="v">' + r[1] + "</span></div>"; }).join("");
  }
  function bars() {
    $("bars").innerHTML = "<div><h3>Producers by country</h3>" + barsHtml(count("producer", function (r) { return r.co; }).slice(0, 10)) + "</div>" +
      "<div><h3>Regions by country</h3>" + barsHtml(count("region", function (r) { return r.co; }).slice(0, 10)) + "</div>" +
      "<div><h3>Grapes by colour</h3>" + barsHtml(count("grape", function (r) { return r.c; })) + "</div>";
  }

  function find(name, type) {
    return D.filter(function (r) { return r.n === name && (!type || r.t === type); })[0];
  }
  function chips() {
    $("continents").innerHTML = (byType.continent || []).map(function (r) { return '<a href="' + esc(FM_BASE + r.u) + '">' + esc(r.n) + "</a>"; }).join("");
    var starts = [["Pinot Noir", "grape"], ["Riesling", "grape"], ["Nebbiolo", "grape"], ["Burgundy", "region"], ["Piedmont", "region"], ["Champagne (style)", "style"], ["Orange wine", "style"], ["Sherry", "style"], ["Natural wine", "style"], ["Georgia", "country"]];
    $("starts").innerHTML = starts.map(function (s) { var r = find(s[0], s[1]) || find(s[0]); return r ? '<a href="' + esc(FM_BASE + r.u) + '">' + esc(s[0].replace(" (style)", "")) + "</a>" : ""; }).join("");
  }

  function search() {
    var q = $("q"), box = $("results"), sel = -1, shown = [];
    function run() {
      var s = norm(q.value).trim();
      if (!s) { box.style.display = "none"; return; }
      var toks = s.split(/\s+/);
      var hits = [];
      D.forEach(function (r) {
        var ok = toks.every(function (t) { return r._h.indexOf(t) >= 0; });
        if (!ok) return;
        var sc = 0;
        if (r._n === s) sc += 100;
        if (r._n.indexOf(s) === 0) sc += 50;
        else if (r._n.indexOf(s) >= 0) sc += 25;
        toks.forEach(function (t) { if (r._n.indexOf(t) >= 0) sc += 5; });
        sc -= PRI[r.t];
        hits.push([sc, r]);
      });
      hits.sort(function (a, b) { return b[0] - a[0] || a[1].n.localeCompare(b[1].n); });
      shown = hits.slice(0, 12).map(function (h) { return h[1]; });
      sel = -1;
      box.innerHTML = shown.length ? shown.map(function (r, i) {
        return '<a href="' + esc(FM_BASE + r.u) + '" data-i="' + i + '"><span>' + ICON[r.t] + '</span><span class="nm">' + esc(r.n) + '<span class="sb">' + esc(sub(r)) + '</span></span><span class="tp">' + LABEL[r.t] + "</span></a>";
      }).join("") + (hits.length > 12 ? '<div class="none">' + (hits.length - 12) + " more matches, keep typing to narrow it down</div>" : "")
        : '<div class="none">No matches for “' + esc(q.value) + "”.</div>";
      box.style.display = "block";
    }
    function mark() { Array.prototype.forEach.call(box.querySelectorAll("a"), function (a, i) { a.className = i === sel ? "sel" : ""; }); }
    q.addEventListener("input", run);
    q.addEventListener("focus", run);
    q.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { sel = Math.min(sel + 1, shown.length - 1); mark(); e.preventDefault(); }
      else if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); mark(); e.preventDefault(); }
      else if (e.key === "Enter" && shown.length) { location.href = FM_BASE + shown[Math.max(sel, 0)].u; }
      else if (e.key === "Escape") { box.style.display = "none"; q.blur(); }
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".searchbox")) box.style.display = "none"; });
    document.addEventListener("keydown", function (e) { if (e.key === "/" && document.activeElement !== q) { e.preventDefault(); q.focus(); } });
  }
})();
