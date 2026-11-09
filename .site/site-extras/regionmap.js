/* A small map on each region page: this region, with its neighbours in the same country. */
(function () {
  var box = document.querySelector(".fm-regmap");
  if (!box || !window.L) return;
  var ll = box.getAttribute("data-ll").split(",").map(Number), me = box.getAttribute("data-name"), country = box.getAttribute("data-country");
  var map = L.map(box, { scrollWheelZoom: false, minZoom: 2 }).setView(ll, 8);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors" }).addTo(map);
  L.circleMarker(ll, { radius: 9, color: "#fff", weight: 2, fillColor: "#B0304A", fillOpacity: 1 }).addTo(map)
    .bindTooltip(me, { permanent: true, direction: "right", offset: [8, 0], className: "fm-lbl" });
  fetch(FM_BASE + "/fermenta-data.json").then(function (r) { return r.json(); }).then(function (d) {
    var pts = [ll];
    d.forEach(function (r) {
      if (r.t !== "region" || !r.ll || r.n === me || r.co !== country) return;
      pts.push(r.ll);
      L.circleMarker(r.ll, { radius: 5, color: "#fff", weight: 1, fillColor: "#8A7A7A", fillOpacity: .8 }).addTo(map)
        .bindTooltip(r.n, { direction: "top" }).on("click", function () { location.href = FM_BASE + r.u; });
    });
    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts).pad(0.25), { maxZoom: 8 });
  });
})();
