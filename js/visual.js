/* =====================================================================
 * GAMBAR RANGKAIAN (untuk soal) & ANIMASI INTERAKTIF (untuk slide)
 *   Visual.gambar(nama, params) -> string SVG
 *   Visual.mount(rootEl)         -> menghidupkan semua [data-anim] di dalamnya
 * ===================================================================== */
var Visual = (function () {
  "use strict";
  var INK = "#1f2a24", COP = "#B0601C", GRN = "#0F3D2E", MUT = "#6b7a72", RED = "#c0392b", BLU = "#1d4ed8";
  var f = function (x, d) { return (typeof Engine !== "undefined" ? Engine.fmt(x, d) : String(x)); };
  function fR(ohm) {
    if (ohm === "?" || ohm == null || isNaN(ohm)) return "?";
    if (ohm >= 1e6) return f(ohm / 1e6) + " MΩ";
    if (ohm >= 1000) return f(ohm / 1000) + " kΩ";
    return f(ohm) + " Ω";
  }
  function svg(w, h, body, cls) { return '<svg class="diag ' + (cls || "") + '" viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg" role="img">' + body + "</svg>"; }
  function line(x1, y1, x2, y2, c, w) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (c || INK) + '" stroke-width="' + (w || 2.2) + '" stroke-linecap="round"/>'; }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 12) + '" fill="' + (o.c || INK) + '" text-anchor="' + (o.a || "middle") + '" font-weight="' + (o.b ? 700 : 500) + '" font-family="JetBrains Mono, monospace">' + s + "</text>"; }
  function poly(pts, c, w) { return '<polyline points="' + pts + '" fill="none" stroke="' + (c || INK) + '" stroke-width="' + (w || 2.2) + '" stroke-linejoin="round" stroke-linecap="round"/>'; }
  // resistor zigzag horizontal (x1->x2 di y) atau vertikal (y1->y2 di x)
  function resH(x1, x2, y, c) { var L = x2 - x1, s = x1 + L * 0.2, e = x2 - L * 0.2, n = 6, p = [x1 + "," + y, s + "," + y]; for (var i = 0; i < n; i++) p.push((s + (e - s) * (i + 0.5) / n) + "," + (y + (i % 2 ? 7 : -7))); p.push(e + "," + y, x2 + "," + y); return poly(p.join(" "), c || COP, 2.4); }
  function resV(x, y1, y2, c) { var L = y2 - y1, s = y1 + L * 0.2, e = y2 - L * 0.2, n = 6, p = [x + "," + y1, x + "," + s]; for (var i = 0; i < n; i++) p.push((x + (i % 2 ? 7 : -7)) + "," + (s + (e - s) * (i + 0.5) / n)); p.push(x + "," + e, x + "," + y2); return poly(p.join(" "), c || COP, 2.4); }
  // baterai vertikal di x, antara y1 (atas, +) dan y2 (bawah)
  function batV(x, y1, y2, label) {
    var m = (y1 + y2) / 2;
    return line(x, y1, x, m - 8) + line(x, m + 8, x, y2) + line(x - 14, m - 8, x + 14, m - 8, INK, 2.6) + line(x - 7, m + 2, x + 7, m + 2, INK, 4) +
      txt(x - 20, m - 10, "+", { size: 13, b: 1 }) + (label ? txt(x + 20, m + 5, label, { a: "start", b: 1 }) : "");
  }
  function batTop(x, y1, y2, label) { var m = (y1 + y2) / 2; return '<rect x="' + (x - 18) + '" y="' + (m - 14) + '" width="36" height="28" fill="#fffdf6"/>' + batV(x, y1, y2, label); }
  function dot(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="3.6" fill="' + INK + '"/>'; }
  function arrow(x1, y1, x2, y2, c) { var a = Math.atan2(y2 - y1, x2 - x1), h = 8; return line(x1, y1, x2, y2, c || BLU, 2.4) + '<polygon points="' + x2 + "," + y2 + " " + (x2 - h * Math.cos(a - 0.45)) + "," + (y2 - h * Math.sin(a - 0.45)) + " " + (x2 - h * Math.cos(a + 0.45)) + "," + (y2 - h * Math.sin(a + 0.45)) + '" fill="' + (c || BLU) + '"/>'; }
  var WARNA = [["#111", "Hitam"], ["#7a4a1f", "Cokelat"], ["#d62828", "Merah"], ["#f77f00", "Oranye"], ["#f6d02f", "Kuning"], ["#2a9d4b", "Hijau"], ["#1d4ed8", "Biru"], ["#7c3aed", "Ungu"], ["#888", "Abu-abu"], ["#fafafa", "Putih"]];
  function resistorBody(a, b, m, opt) {
    opt = opt || {};
    var bands = [WARNA[a], WARNA[b], WARNA[m], ["#c9a227", "Emas"]], xs = [112, 140, 168, 214], s = "";
    s += line(20, 60, 80, 60, "#9aa5a0", 4) + line(240, 60, 300, 60, "#9aa5a0", 4);
    s += '<rect x="80" y="34" width="160" height="52" rx="22" fill="#e9d3a8" stroke="#8a6a3a" stroke-width="2"/>';
    bands.forEach(function (bd, i) {
      s += '<rect class="band" data-i="' + i + '" x="' + (xs[i] - 8) + '" y="35" width="16" height="50" fill="' + bd[0] + '" stroke="' + (bd[0] === "#fafafa" ? "#aaa" : "none") + '"' + (opt.click && i < 3 ? ' style="cursor:pointer"' : "") + "/>";
      s += line(xs[i], 87, xs[i], i % 2 ? 108 : 96, "#c8bfa8", 1) + txt(xs[i], i % 2 ? 120 : 108, bd[1], { size: 10.5, c: MUT });
    });
    return svg(320, 128, s, "res-body");
  }
  /* ---------------- gambar statis untuk soal ---------------- */
  var G = {
    ohm: function (p) {
      var s = line(40, 30, 280, 30) + line(280, 30, 280, 170) + line(40, 170, 280, 170) + batV(40, 30, 170, f(p.V) + " V");
      s += '<circle cx="160" cy="30" r="15" fill="#fff" stroke="' + INK + '" stroke-width="2.2"/>' + txt(160, 35, "A", { b: 1, size: 13 });
      s = s.replace(line(40, 30, 280, 30), line(40, 30, 145, 30) + line(175, 30, 280, 30));
      s += '<rect x="262" y="60" width="36" height="80" fill="#fff"/>' + resV(280, 55, 145) + txt(296, 104, fR(p.R), { a: "start", b: 1 });
      return svg(360, 200, s);
    },
    seri2: function (p) {
      var k = p.u === "k" ? 1000 : 1, R1 = p.R1 === "?" ? "?" : p.R1 * k, R2 = p.R2 === "?" ? "?" : p.R2 * k;
      var s = batV(40, 30, 170, f(p.Vs) + " V") + line(40, 30, 110, 30) + resH(110, 210, 30) + line(210, 30, 280, 30) + line(280, 30, 280, 55) + resV(280, 55, 145) + line(280, 145, 280, 170) + line(40, 170, 280, 170);
      s += txt(160, 18, "R1 = " + fR(R1), { b: 1 }) + txt(292, 104, "R2 = " + fR(R2), { a: "start", b: 1 });
      return svg(380, 200, s);
    },
    paralel2: function (p) {
      var s = batV(40, 30, 170, p.Vs != null ? f(p.Vs) + " V" : "Vs") + line(40, 30, 270, 30) + line(40, 170, 270, 170) + dot(170, 30) + dot(170, 170);
      s += resV(170, 30, 170) + resV(270, 30, 170) + txt(184, 104, "R1 = " + fR(p.R1), { a: "start", b: 1, size: 11 }) + txt(284, 104, "R2 = " + fR(p.R2), { a: "start", b: 1, size: 11 });
      if (p.It != null) s += arrow(70, 18, 120, 18) + txt(95, 12, "It = " + f(p.It) + " mA", { size: 11, c: BLU });
      return svg(380, 200, s);
    },
    campur: function (p) {
      var s = batV(40, 30, 170, f(p.Vs) + " V") + line(40, 30, 80, 30) + resH(80, 160, 30) + line(160, 30, 290, 30) + dot(200, 30) + dot(200, 170);
      s += resV(200, 30, 170) + resV(290, 30, 170) + line(40, 170, 290, 170);
      s += txt(120, 18, "R1 = " + fR(p.R1), { b: 1, size: 11 }) + txt(212, 104, "R2 = " + fR(p.R2), { a: "start", b: 1, size: 11 }) + txt(302, 104, "R3 = " + fR(p.R3), { a: "start", b: 1, size: 11 });
      return svg(400, 200, s);
    },
    kcl: function (p) {
      var s = dot(160, 100) + arrow(30, 100, 150, 100) + arrow(166, 94, 270, 30, COP) + arrow(166, 106, 270, 170, COP);
      s += txt(80, 90, "I1 = " + f(p.I1) + " mA", { b: 1, c: BLU }) + txt(250, 30, "I2 = " + f(p.I2) + " mA", { a: "end", b: 1, c: COP }) + txt(250, 182, "I3 = ?", { a: "end", b: 1, c: COP });
      return svg(320, 200, s);
    },
    kvl: function (p) {
      var s = batV(40, 30, 170, f(p.Vs) + " V") + line(40, 30, 100, 30) + resH(100, 200, 30) + line(200, 30, 280, 30) + line(280, 30, 280, 55) + resV(280, 55, 145) + line(280, 145, 280, 170) + line(280, 170, 200, 170) + resH(100, 200, 170) + line(100, 170, 40, 170);
      s += txt(150, 18, "V1 = " + f(p.V1) + " V", { b: 1 }) + txt(292, 104, "V2 = " + f(p.V2) + " V", { a: "start", b: 1 }) + txt(150, 194, "V3 = ?", { b: 1 });
      s += '<path d="M190 80 A45 30 0 1 1 130 80" fill="none" stroke="' + BLU + '" stroke-width="1.8" stroke-dasharray="4 3"/>' + '<polygon points="130,80 138,73 139,85" fill="' + BLU + '"/>' + txt(160, 106, "loop", { size: 11, c: BLU });
      return svg(380, 205, s);
    },
    warna: function (p) { return resistorBody(p.a, p.b, p.m); },
    grafik: function (p) { return grafik([{ R: p.R, n: "" }]); },
    grafik2: function (p) { return grafik([{ R: p.Ra, n: "A" }, { R: p.Rb, n: "B" }], true); },
    rc: function () {
      var s = axes(40, 170, 260, 140, "t", "Vc"), pts = [];
      for (var i = 0; i <= 50; i++) { var t = i / 50 * 5; pts.push((40 + i / 50 * 260) + "," + (170 - 130 * (1 - Math.exp(-t)))); }
      s += line(40, 40, 300, 40, MUT, 1).replace("/>", ' stroke-dasharray="4 4"/>') + txt(304, 44, "Vs", { a: "start", size: 11, c: MUT }) + poly(pts.join(" "), COP, 2.6);
      return svg(340, 200, s);
    }
  };
  function axes(x0, y0, w, h, xl, yl) { return arrow(x0, y0, x0 + w + 10, y0, INK) + arrow(x0, y0, x0, y0 - h - 10, INK) + txt(x0 + w + 14, y0 + 4, xl, { a: "start", size: 11 }) + txt(x0 - 6, y0 - h - 14, yl, { size: 11 }); }
  function grafik(lines, noVals) {
    var Vmax = 10, Imax = 0;
    lines.forEach(function (l) { Imax = Math.max(Imax, Vmax / l.R * 1000); });
    var nice = [1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500]; var top = nice.filter(function (n) { return n >= Imax; })[0] || Imax;
    var x0 = 50, y0 = 170, W = 250, H = 140, s = axes(x0, y0, W, H, "V (volt)", "I (mA)");
    for (var v = 2; v <= 10; v += 2) s += line(x0 + v / Vmax * W, y0, x0 + v / Vmax * W, y0 - H, "#dfe5e1", 1) + txt(x0 + v / Vmax * W, y0 + 14, v, { size: 10, c: MUT });
    for (var k = 1; k <= 4; k++) { var iv = top * k / 4; s += line(x0, y0 - H * k / 4, x0 + W, y0 - H * k / 4, "#dfe5e1", 1) + (noVals ? "" : txt(x0 - 6, y0 - H * k / 4 + 4, f(iv), { size: 10, c: MUT, a: "end" })); }
    lines.forEach(function (l, i) { var c = i ? COP : BLU, iEnd = Vmax / l.R * 1000; s += line(x0, y0, x0 + W, y0 - iEnd / top * H, c, 2.8); if (l.n) s += txt(x0 + W + 8, y0 - iEnd / top * H + 4, l.n, { b: 1, c: c, a: "start" }); });
    return svg(340, 200, s);
  }
  function parseSpec(spec) {
    var m = String(spec).match(/^\s*([A-Za-z0-9_]+)\s*(?:\((.*)\))?\s*$/); if (!m) return null;
    var p = {}; (m[2] || "").split(",").forEach(function (kv) { var a = kv.split("="); if (a.length > 1) { var v = a[1].trim(); p[a[0].trim()] = isNaN(+v) ? v : +v; } });
    return { name: m[1], params: p };
  }
  function gambar(name, params) { var g = G[name]; return g ? g(params || {}) : ""; }

  /* ---------------- animasi ---------------- */
  function loop(el, fn) { var last = performance.now(); (function step(t) { if (!el.isConnected) return; fn(Math.min(0.05, (t - last) / 1000), t / 1000); last = t; requestAnimationFrame(step); })(last); }
  // titik-titik muatan bergerak di sepanjang path
  function charges(el, path, n, getSpeed, color) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g"); path.parentNode.appendChild(g);
    var L = path.getTotalLength(), ds = [], off = 0;
    for (var i = 0; i < n; i++) { var c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); c.setAttribute("r", 3.4); c.setAttribute("fill", color || BLU); g.appendChild(c); ds.push(c); }
    loop(g, function (dt) { off = (off + getSpeed() * dt * 60 + L) % L; ds.forEach(function (c, i) { var p = path.getPointAtLength((off + i * L / n) % L); c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); }); });
    return g;
  }
  function slider(label, min, max, step, val, unit) { return '<label class="sl"><span>' + label + ' = <b class="val">' + val + "</b> " + (unit || "") + '</span><input type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"></label>'; }
  function $$(el, s) { return Array.prototype.slice.call(el.querySelectorAll(s)); }
  var A = {};
  A.gambar = function (el) { var sp = parseSpec(el.dataset.v); if (sp) el.innerHTML = gambar(sp.name, sp.params); };
  A["resistor-statis"] = function (el) { el.innerHTML = resistorBody(+el.dataset.a, +el.dataset.b, +el.dataset.m); };
  A.kodewarna = function (el) {
    var st = [2, 2, 1];
    function draw() {
      el.innerHTML = resistorBody(st[0], st[1], st[2], { click: 1 }) + '<div class="readout">' + (st[0] * 10 + st[1]) + " × 10<sup>" + st[2] + "</sup> = <b>" + fR((st[0] * 10 + st[1]) * Math.pow(10, st[2])) + '</b> ±5%</div><p class="small center">Klik gelang 1, 2, atau 3 untuk mengganti warna.</p>';
      $$(el, ".band").forEach(function (b) { var i = +b.dataset.i; if (i < 3) b.addEventListener("click", function () { st[i] = (st[i] + 1) % 10; if (i === 0 && st[0] === 0) st[0] = 1; if (i === 2 && st[2] > 6) st[2] = 0; draw(); }); });
    }
    draw();
  };
  A.rc = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 360 230"><g class="ckt"></g><g class="plot"></g></svg><div class="ctrl"><button class="btn sm" data-a="isi">Isi kapasitor</button><button class="btn sm ghost" data-a="buang">Kosongkan</button>' + slider("R", 1, 10, 1, 5, "kΩ") + "</div>";
    var ckt = el.querySelector(".ckt"), plot = el.querySelector(".plot");
    ckt.innerHTML = batV(30, 20, 110, "9 V") + line(30, 20, 60, 20) + resH(60, 130, 20) + line(130, 20, 170, 20) + line(170, 20, 170, 55) + line(155, 55, 185, 55, INK, 3) + line(155, 65, 185, 65, INK, 3) + line(170, 65, 170, 110) + line(30, 110, 170, 110) + txt(95, 12, "R", { size: 11 }) + txt(196, 64, "C = 100 µF", { a: "start", size: 11 }) + '<text class="vc" x="196" y="90" font-size="13" font-weight="700" fill="' + COP + '" font-family="JetBrains Mono">Vc = 0 V</text>';
    plot.innerHTML = axes(40, 215, 280, 80, "t", "Vc") + line(40, 135, 330, 135, MUT, 1) + '<polyline class="cv" fill="none" stroke="' + COP + '" stroke-width="2.6"/>';
    var mode = 0, t = 0, v0 = 0, vc = 0, pts = [], R = 5, sl = el.querySelector("input");
    sl.addEventListener("input", function () { R = +sl.value; el.querySelector(".val").textContent = R; });
    $$(el, "button").forEach(function (b) { b.onclick = function () { mode = b.dataset.a === "isi" ? 1 : -1; t = 0; v0 = vc; pts = []; }; });
    loop(el, function (dt) {
      if (!mode) return; t += dt; var tau = R * 0.1; // R(kΩ)*100µF = R*0.1 s
      vc = mode > 0 ? 9 - (9 - v0) * Math.exp(-t / tau) : v0 * Math.exp(-t / tau);
      if (t < 5) { pts.push((40 + t / 5 * 280) + "," + (215 - vc / 9 * 80)); el.querySelector(".cv").setAttribute("points", pts.join(" ")); }
      el.querySelector(".vc").textContent = "Vc = " + f(vc, 2) + " V";
    });
  };
  A.trafo = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 320 150"><rect x="120" y="20" width="80" height="110" rx="6" fill="none" stroke="#7d8a84" stroke-width="10"/><g class="np"></g><g class="ns"></g><path class="flux" d="M125 25 H195 V125 H125 Z" fill="none" stroke="' + BLU + '" stroke-width="2" stroke-dasharray="6 6"/>' + txt(60, 145, "Primer", { size: 11 }) + txt(260, 145, "Sekunder", { size: 11 }) + '<text class="vs" x="290" y="80" font-size="13" font-weight="700" fill="' + COP + '" text-anchor="middle" font-family="JetBrains Mono"></text>' + txt(30, 80, "220 V~", { size: 12, b: 1 }) + "</svg>" +
      '<div class="ctrl">' + slider("Np", 100, 2000, 100, 1100, "lilitan") + slider("Ns", 20, 2000, 20, 60, "lilitan") + "</div>";
    var ins = $$(el, "input");
    function coils(g, x, n) { var k = Math.max(2, Math.min(12, Math.round(n / 120))), s = ""; for (var i = 0; i < k; i++) { var y = 35 + i * (80 / k); s += '<ellipse cx="' + x + '" cy="' + (y + 40 / k) + '" rx="16" ry="' + (40 / k) + '" fill="none" stroke="' + COP + '" stroke-width="2"/>'; } g.innerHTML = s; }
    function upd() { var np = +ins[0].value, ns = +ins[1].value; $$(el, ".val")[0].textContent = np; $$(el, ".val")[1].textContent = ns; coils(el.querySelector(".np"), 120, np); coils(el.querySelector(".ns"), 200, ns); el.querySelector(".vs").textContent = f(220 * ns / np, 1) + " V"; }
    ins.forEach(function (i) { i.addEventListener("input", upd); }); upd();
    var fl = el.querySelector(".flux"), o = 0; loop(el, function (dt) { o = (o - dt * 40) % 12; fl.setAttribute("stroke-dashoffset", o); });
  };
  A.simbol = function (el) {
    var k = el.dataset.k, s = "";
    if (k === "dioda") s = line(10, 40, 50, 40) + '<polygon points="50,24 50,56 78,40" fill="' + COP + '"/>' + line(80, 22, 80, 58, INK, 3) + line(80, 40, 120, 40) + txt(38, 20, "A", { size: 11 }) + txt(92, 20, "K", { size: 11 });
    else if (k === "transistor") s = '<circle cx="70" cy="40" r="30" fill="none" stroke="' + INK + '" stroke-width="2"/>' + line(20, 40, 58, 40) + line(58, 22, 58, 58, INK, 3.4) + line(58, 32, 84, 14) + line(84, 14, 84, 4) + line(58, 48, 84, 66) + line(84, 66, 84, 76) + '<polygon points="84,66 74,64 79,57" fill="' + INK + '"/>' + txt(14, 36, "B", { size: 10 }) + txt(96, 10, "C", { size: 10 }) + txt(96, 78, "E", { size: 10 });
    else s = '<rect x="35" y="12" width="60" height="58" rx="4" fill="' + GRN + '"/>' + txt(65, 46, "IC", { c: "#fff", b: 1 }) + [0, 1, 2, 3].map(function (i) { return line(25, 20 + i * 14, 35, 20 + i * 14, "#9aa5a0", 3) + line(95, 20 + i * 14, 105, 20 + i * 14, "#9aa5a0", 3); }).join("");
    el.innerHTML = svg(130, 80, s, "sym");
  };
  A.aliran = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 320 200">' + '<path class="p" d="M40 30 H280 V170 H40 Z" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' + batTop(40, 30, 170, "") + '<circle cx="280" cy="100" r="18" fill="#fff8d6" stroke="' + INK + '" stroke-width="2"/>' + line(267, 87, 293, 113, INK, 1.6) + line(293, 87, 267, 113, INK, 1.6) + '<text class="lbl" x="160" y="104" text-anchor="middle" font-size="13" font-weight="700" font-family="JetBrains Mono"></text></svg><div class="ctrl"><button class="btn sm">Ganti: aliran elektron</button></div>';
    var mode = 1, p = el.querySelector(".p"), btn = el.querySelector("button"), lbl = el.querySelector(".lbl");
    var g = charges(el, p, 14, function () { return mode * 1.2; }, BLU);
    function upd() { lbl.textContent = mode > 0 ? "Arus konvensional: + → −" : "Aliran elektron: − → +"; lbl.setAttribute("fill", mode > 0 ? BLU : RED); $$(g, "circle").forEach(function (c) { c.setAttribute("fill", mode > 0 ? BLU : RED); }); btn.textContent = mode > 0 ? "Ganti: aliran elektron" : "Ganti: arus konvensional"; }
    btn.onclick = function () { mode = -mode; upd(); }; upd();
  };
  A.air = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 320 200"><rect x="20" y="30" width="80" height="140" fill="none" stroke="' + INK + '" stroke-width="2"/><rect x="220" y="30" width="80" height="140" fill="none" stroke="' + INK + '" stroke-width="2"/><rect class="w1" x="22" width="76" fill="#7fb3e6"/><rect class="w2" x="222" width="76" fill="#7fb3e6"/><path class="p" d="M100 160 H220" stroke="#cfd8d3" stroke-width="12"/><text class="lb" x="160" y="24" text-anchor="middle" font-size="12" font-weight="700" font-family="JetBrains Mono" fill="' + INK + '"></text></svg><div class="ctrl">' + slider("Beda tinggi (≈ tegangan)", 0, 100, 5, 60, "") + "</div>";
    var s = el.querySelector("input"), h = 60, p = el.querySelector(".p");
    function upd() { h = +s.value; el.querySelector(".val").textContent = h; var a = 100 + h * 0.6, b = 100 - h * 0.4; el.querySelector(".w1").setAttribute("y", 170 - a * 0.68 - 2); el.querySelector(".w1").setAttribute("height", a * 0.68); el.querySelector(".w2").setAttribute("y", 170 - b * 0.68 - 2); el.querySelector(".w2").setAttribute("height", b * 0.68); el.querySelector(".lb").textContent = h ? "Air mengalir → (arus)" : "Tidak ada beda tinggi → tidak mengalir"; }
    s.addEventListener("input", upd); upd(); charges(el, p, 6, function () { return h / 40; }, "#1d4ed8");
  };
  A.ohm = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 320 190">' + '<path class="p" d="M40 30 H280 V160 H40 Z" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' + batTop(40, 30, 160, "") + '<rect x="266" y="55" width="28" height="80" fill="#fffdf6"/>' + resV(280, 55, 135) + '<circle cx="160" cy="30" r="17" fill="#fff" stroke="' + INK + '" stroke-width="2.2"/>' + txt(160, 35, "A", { b: 1 }) + '<text class="vt" x="70" y="100" font-size="13" font-weight="700" font-family="JetBrains Mono" fill="' + INK + '"></text><text class="rt" x="250" y="100" text-anchor="end" font-size="13" font-weight="700" font-family="JetBrains Mono" fill="' + COP + '"></text></svg>' +
      '<div class="readout">I = V / R = <b class="it"></b></div><div class="ctrl">' + slider("V", 0, 24, 1, 12, "V") + slider("R", 100, 2000, 100, 1000, "Ω") + "</div>";
    var ins = $$(el, "input"), I = 0;
    function upd() { var V = +ins[0].value, R = +ins[1].value; I = V / R * 1000; $$(el, ".val")[0].textContent = V; $$(el, ".val")[1].textContent = R; el.querySelector(".vt").textContent = V + " V"; el.querySelector(".rt").textContent = fR(R); el.querySelector(".it").textContent = V + " / " + R + " = " + f(I, 2) + " mA"; }
    ins.forEach(function (i) { i.addEventListener("input", upd); }); upd();
    charges(el, el.querySelector(".p"), 16, function () { return I / 12; });
  };
  A.seri = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 320 190">' + '<path class="p" d="M40 30 H280 V160 H40 Z" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' + batTop(40, 30, 160, "12 V") + '<rect x="100" y="18" width="100" height="24" fill="#fffdf6"/>' + resH(100, 200, 30) + '<rect x="266" y="55" width="28" height="80" fill="#fffdf6"/>' + resV(280, 55, 135) + txt(150, 60, "R1", { b: 1 }) + txt(256, 100, "R2", { b: 1, a: "end" }) + "</svg>" +
      '<div class="bars"><div><span>V1</span><i class="b1"></i><b class="t1"></b></div><div><span>V2</span><i class="b2"></i><b class="t2"></b></div></div><div class="readout">I = <b class="it"></b> (sama di R1 dan R2)</div><div class="ctrl">' + slider("R1", 100, 2000, 100, 1000, "Ω") + slider("R2", 100, 2000, 100, 2000, "Ω") + "</div>";
    var ins = $$(el, "input"), I = 0;
    function upd() { var r1 = +ins[0].value, r2 = +ins[1].value; I = 12 / (r1 + r2) * 1000; var v1 = I * r1 / 1000, v2 = 12 - v1; $$(el, ".val")[0].textContent = r1; $$(el, ".val")[1].textContent = r2; el.querySelector(".b1").style.width = (v1 / 12 * 100) + "%"; el.querySelector(".b2").style.width = (v2 / 12 * 100) + "%"; el.querySelector(".t1").textContent = f(v1, 2) + " V"; el.querySelector(".t2").textContent = f(v2, 2) + " V"; el.querySelector(".it").textContent = "12 / (" + r1 + " + " + r2 + ") = " + f(I, 2) + " mA"; }
    ins.forEach(function (i) { i.addEventListener("input", upd); }); upd();
    charges(el, el.querySelector(".p"), 14, function () { return I / 6; });
  };
  A.paralel = function (el) {
    var Rs = [1000, 2000, 1000, 500], n = 2;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 190"><g class="c"></g></svg><div class="readout pr"></div><div class="ctrl"><button class="btn sm" data-d="1">+ Tambah cabang</button><button class="btn sm ghost" data-d="-1">− Kurangi cabang</button></div>';
    var I = 0;
    function draw() {
      var s = batV(30, 30, 160, "12 V") + line(30, 30, 80 + n * 60, 30) + line(30, 160, 80 + n * 60, 160), it = 0, rows = [];
      for (var i = 0; i < n; i++) { var x = 100 + i * 60, ii = 12 / Rs[i] * 1000; it += ii; s += dot(x, 30) + dot(x, 160) + '<rect x="' + (x - 12) + '" y="55" width="24" height="80" fill="#fffdf6"/>' + resV(x, 30, 160) + txt(x, 180, fR(Rs[i]), { size: 10 }); rows.push("I" + (i + 1) + " = " + f(ii, 1) + " mA"); }
      s += '<path class="p" d="M30 160 V30 H' + (80 + n * 60) + '" fill="none" stroke="none"/>';
      el.querySelector(".c").innerHTML = s; I = it;
      var rp = 12 / it * 1000;
      el.querySelector(".pr").innerHTML = rows.join(" · ") + "<br>I<sub>total</sub> = <b>" + f(it, 1) + " mA</b> · R<sub>p</sub> = 12 / " + f(it / 1000, 4) + " = <b>" + fR(rp) + "</b>";
      var old = el.querySelector(".c g"); charges(el.querySelector(".c"), el.querySelector(".p"), 10, function () { return I / 12; });
    }
    $$(el, "button").forEach(function (b) { b.onclick = function () { n = Math.max(1, Math.min(4, n + +b.dataset.d)); draw(); }; });
    draw();
  };
  A.kcl = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 320 200"><g class="c"></g></svg><div class="readout kr"></div><div class="ctrl">' + slider("I masuk", 2, 40, 1, 10, "mA") + slider("Bagian ke cabang atas", 10, 90, 5, 40, "%") + "</div>";
    var ins = $$(el, "input");
    function upd() {
      var i1 = +ins[0].value, pc = +ins[1].value, i2 = Math.round(i1 * pc) / 100, i3 = i1 - i2; $$(el, ".val")[0].textContent = i1; $$(el, ".val")[1].textContent = pc;
      var w = function (x) { return 1.5 + x / 4; };
      el.querySelector(".c").innerHTML = dot(160, 100) + arrow(30, 100, 150, 100, BLU).replace(/stroke-width="2.4"/, 'stroke-width="' + w(i1) + '"') + arrow(166, 94, 270, 30, COP).replace(/stroke-width="2.4"/, 'stroke-width="' + w(i2) + '"') + arrow(166, 106, 270, 170, COP).replace(/stroke-width="2.4"/, 'stroke-width="' + w(i3) + '"') + txt(80, 88, "I1 = " + f(i1) + " mA", { b: 1, c: BLU }) + txt(260, 22, "I2 = " + f(i2, 2) + " mA", { a: "end", b: 1, c: COP }) + txt(260, 190, "I3 = " + f(i3, 2) + " mA", { a: "end", b: 1, c: COP });
      el.querySelector(".kr").innerHTML = "Masuk = " + f(i1) + " mA · Keluar = " + f(i2, 2) + " + " + f(i3, 2) + " = <b>" + f(i2 + i3, 2) + " mA</b> ✓";
    }
    ins.forEach(function (i) { i.addEventListener("input", upd); }); upd();
  };
  A.kvl = function (el) {
    var V = 12, R = [100, 200, 300], I = V / 600, Vs = R.map(function (r) { return I * r; });
    el.innerHTML = '<svg class="diag" viewBox="0 0 330 300">' + '<path class="p" d="M40 170 V30 H280 V170 Z" fill="none" stroke="' + INK + '" stroke-width="2.2"/>' + batTop(40, 30, 170, "12 V") + '<rect x="100" y="18" width="100" height="24" fill="#fffdf6"/>' + resH(100, 200, 30) + '<rect x="266" y="55" width="28" height="80" fill="#fffdf6"/>' + resV(280, 55, 145) + '<rect x="100" y="158" width="100" height="24" fill="#fffdf6"/>' + resH(100, 200, 170) +
      txt(150, 16, "V1 = " + f(Vs[0]) + " V", { b: 1, size: 11 }) + txt(256, 100, "V2 = " + f(Vs[1]) + " V", { b: 1, a: "end", size: 11 }) + txt(150, 196, "V3 = " + f(Vs[2]) + " V", { b: 1, size: 11 }) +
      '<g class="plot"></g><circle class="walker" r="6" fill="' + RED + '"/><circle class="pm" r="5" fill="' + RED + '"/></svg><div class="readout">+12 − ' + f(Vs[0]) + " − " + f(Vs[1]) + " − " + f(Vs[2]) + " = <b>0</b> ✓</div>";
    var path = el.querySelector(".p"), L = path.getTotalLength(), wk = el.querySelector(".walker"), pm = el.querySelector(".pm"), pos = 0;
    // potensial sepanjang lintasan: naik di baterai (segmen awal), turun di setiap resistor
    var segs = [[0, 140, "bat"], [140, 200, "w"], [200, 300, "r0"], [300, 380, "w"], [380, 405, "w"], [405, 495, "r1"], [495, 520, "w"], [520, 600, "w"], [600, 700, "r2"], [700, 760, "w"]];
    function pot(s) { var v = 0; for (var i = 0; i < segs.length; i++) { var a = segs[i][0], b = segs[i][1], k = segs[i][2], fr = Math.max(0, Math.min(1, (s - a) / (b - a))); if (k === "bat") v += 12 * (s >= 70 ? 1 : 0); else if (k[0] === "r") v -= Vs[+k[1]] * fr; } return v; }
    var pl = el.querySelector(".plot"), pts = [];
    for (var s = 0; s <= L; s += 4) pts.push((40 + s / L * 260) + "," + (290 - pot(s) / 12 * 60));
    pl.innerHTML = axes(40, 290, 260, 60, "lintasan", "V") + poly(pts.join(" "), COP, 2.2);
    loop(el, function (dt) { pos = (pos + dt * 120) % L; var p = path.getPointAtLength(pos); wk.setAttribute("cx", p.x); wk.setAttribute("cy", p.y); pm.setAttribute("cx", 40 + pos / L * 260); pm.setAttribute("cy", 290 - pot(pos) / 12 * 60); });
  };
  A.multimeter = function (el) {
    el.innerHTML = '<div class="mm"><div class="mm-face"><div class="mm-lcd">----</div><div class="mm-modes"><button data-m="V">V⎓</button><button data-m="A">mA</button><button data-m="O">Ω</button></div></div>' +
      '<div class="mm-cfg"><p class="small"><b>1.</b> Mau mengukur:</p><div class="seg" data-g="q"><button data-v="V">Tegangan R</button><button data-v="A">Arus R</button><button data-v="O">Resistansi R</button></div>' +
      '<p class="small"><b>2.</b> Cara memasang:</p><div class="seg" data-g="p"><button data-v="par">Paralel, sumber nyala</button><button data-v="seri">Seri, sumber nyala</button><button data-v="mati">Komponen dilepas, sumber mati</button></div></div></div><div class="mm-msg"></div>';
    var st = { m: null, q: null, p: null }, lcd = el.querySelector(".mm-lcd"), msg = el.querySelector(".mm-msg");
    $$(el, ".mm-modes button").forEach(function (b) { b.onclick = function () { st.m = b.dataset.m; $$(el, ".mm-modes button").forEach(function (x) { x.classList.toggle("on", x === b); }); judge(); }; });
    $$(el, ".seg").forEach(function (g) { $$(g, "button").forEach(function (b) { b.onclick = function () { st[g.dataset.g] = b.dataset.v; $$(g, "button").forEach(function (x) { x.classList.toggle("on", x === b); }); judge(); }; }); });
    var benar = { V: "par", A: "seri", O: "mati" }, hasil = { V: "6,00 V", A: "6,00 mA", O: "1,000 kΩ" };
    function judge() {
      if (!st.m || !st.q || !st.p) { msg.className = "mm-msg"; msg.textContent = "Pilih mode meter, besaran, dan cara memasang. (Rangkaian: 12 V, R = 1 kΩ seri 1 kΩ)"; lcd.textContent = "----"; return; }
      var ok = st.m === st.q && benar[st.q] === st.p, bahaya = st.m === "A" && st.p === "par";
      if (ok) { lcd.textContent = hasil[st.q]; msg.className = "mm-msg ok"; msg.textContent = "Benar! Pengukuran aman dan hasilnya sesuai hitungan."; }
      else if (bahaya) { lcd.textContent = "FUSE"; msg.className = "mm-msg bad"; msg.textContent = "Bahaya: mode arus dipasang paralel = hubung singkat. Sekring meter putus."; }
      else if (st.m === "O" && st.p !== "mati") { lcd.textContent = "Err"; msg.className = "mm-msg bad"; msg.textContent = "Ohmmeter tidak boleh dipakai pada rangkaian bertegangan; hasil salah dan meter bisa rusak."; }
      else if (st.m !== st.q) { lcd.textContent = "????"; msg.className = "mm-msg warn"; msg.textContent = "Mode meter tidak sesuai dengan besaran yang ingin diukur."; }
      else { lcd.textContent = st.p === "mati" ? "0.00" : "----"; msg.className = "mm-msg warn"; msg.textContent = "Cara memasang belum tepat. Ingat: V paralel, A seri, Ω tanpa tegangan."; }
    }
    judge();
  };
  /* =================== ANIMASI MATERI 2: SEMIKONDUKTOR =================== */
  var KULIT = { 5: [2, 3], 6: [2, 4], 13: [2, 8, 3], 14: [2, 8, 4], 15: [2, 8, 5], 29: [2, 8, 18, 1], 31: [2, 8, 18, 3], 32: [2, 8, 18, 4], 33: [2, 8, 18, 5], 51: [2, 8, 18, 18, 5] };
  var UNSUR = { B: 5, C: 6, Al: 13, Si: 14, P: 15, Cu: 29, Ga: 31, Ge: 32, As: 33, Sb: 51 };
  var NAMA = { 5: "Boron (B)", 6: "Karbon (C)", 13: "Aluminium (Al)", 14: "Silikon (Si)", 15: "Fosfor (P)", 29: "Tembaga (Cu)", 31: "Galium (Ga)", 32: "Germanium (Ge)", 33: "Arsen (As)", 51: "Antimon (Sb)" };
  function atomSVG(z, sudut) {
    var sh = KULIT[z] || [2, 8, 4], cx = 160, cy = 150, s = "", n = sh.length, rmax = 135, r0 = n > 4 ? 30 : 38, dr = (rmax - r0) / Math.max(1, n - 1);
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="20" fill="#c0392b"/>' + txt(cx, cy + 4, "+" + z, { c: "#fff", b: 1, size: 12 });
    sh.forEach(function (k, i) {
      var r = r0 + i * dr, val = i === n - 1, a0 = (sudut || 0) * (1.6 / (i + 1));
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + (val ? COP : "#b9c4be") + '" stroke-width="' + (val ? 1.8 : 1.2) + '" stroke-dasharray="' + (val ? "0" : "3 3") + '"/>';
      for (var j = 0; j < k; j++) { var a = a0 + j * 2 * Math.PI / k; s += '<circle cx="' + (cx + r * Math.cos(a)) + '" cy="' + (cy + r * Math.sin(a)) + '" r="' + (val ? 5.5 : 3.6) + '" fill="' + (val ? COP : BLU) + '"/>'; }
    });
    return s;
  }
  G.atom = function (p) { var z = p.Z || UNSUR[p.el] || 14; return svg(320, 300, atomSVG(z, 0.3)); };
  G.pitapn = function () {
    var s = '<rect x="20" y="20" width="110" height="220" fill="#fde8e6" opacity=".6"/><rect x="230" y="20" width="110" height="220" fill="#e3ecfb" opacity=".6"/><rect x="130" y="20" width="100" height="220" fill="#f3efe2"/>';
    s += txt(75, 36, "Tipe P", { b: 1 }) + txt(285, 36, "Tipe N", { b: 1 }) + txt(180, 36, "deplesi", { size: 11, c: MUT });
    var ec = "M20 80 H130 C165 80 195 140 230 140 H340", ev = "M20 160 H130 C165 160 195 220 230 220 H340";
    s += '<path d="' + ec + '" fill="none" stroke="' + BLU + '" stroke-width="2.6"/><path d="' + ev + '" fill="none" stroke="' + COP + '" stroke-width="2.6"/>';
    s += line(20, 180, 340, 180, INK, 1.2).replace("/>", ' stroke-dasharray="6 4"/>') + txt(344, 184, "E_F", { a: "start", size: 11 });
    s += txt(344, 144, "E_c", { a: "start", size: 11, c: BLU }) + txt(344, 224, "E_v", { a: "start", size: 11, c: COP }) + txt(16, 84, "E_c", { a: "end", size: 11, c: BLU }) + txt(16, 164, "E_v", { a: "end", size: 11, c: COP });
    s += arrow(250, 82, 250, 136, RED) + arrow(250, 136, 250, 82, RED) + txt(256, 114, "qV₀ (≈0,7 eV)", { a: "start", size: 11, c: RED });
    s += txt(75, 200, "○ hole mayoritas", { size: 10, c: COP }) + txt(285, 160, "● elektron mayoritas", { size: 10, c: BLU });
    s += txt(180, 258, "Energi elektron ↑   ·   pita membengkok di daerah deplesi", { size: 10, c: MUT });
    return svg(370, 265, s);
  };
  A.atom = function (el) {
    var z = UNSUR[el.dataset.el] || 14, ang = 0, pilihan = (el.dataset.pilih || "Si,Ge,C,Cu,P,B").split(",");
    el.innerHTML = '<svg class="diag" viewBox="0 0 320 300"><g class="g"></g></svg><div class="readout rd"></div><div class="ctrl seg2b">' + pilihan.map(function (k) { return '<button class="btn sm ghost" data-z="' + UNSUR[k] + '">' + k + "</button>"; }).join("") + "</div>";
    function info() { var sh = KULIT[z]; el.querySelector(".rd").innerHTML = NAMA[z] + " · Z = " + z + " · kulit " + sh.join("-") + " · <b>" + sh[sh.length - 1] + " elektron valensi</b> (kulit ke-" + sh.length + ")"; $$(el, "[data-z]").forEach(function (b) { b.classList.toggle("on", +b.dataset.z === z); }); }
    $$(el, "[data-z]").forEach(function (b) { b.onclick = function () { z = +b.dataset.z; info(); }; });
    info(); var g = el.querySelector(".g");
    loop(el, function (dt) { ang += dt * 0.8; g.innerHTML = atomSVG(z, ang); });
  };
  A.kisi = function (el) {
    var C = 5, R = 4, X0 = 46, Y0 = 40, D = 62, mode = el.dataset.mode || "murni";
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 250"><g class="b"></g><g class="f"></g></svg><div class="readout kx"></div><div class="ctrl">' +
      [["murni", "Si murni"], ["panas", "Suhu naik"], ["n", "Tipe N (+ fosfor)"], ["p", "Tipe P (+ boron)"]].map(function (m) { return '<button class="btn sm ghost" data-m="' + m[0] + '">' + m[1] + "</button>"; }).join("") + "</div>";
    var pos = function (i, j) { return [X0 + i * D, Y0 + j * D]; }, slots = [];
    for (var j = 0; j < R; j++) for (var i = 0; i < C; i++) { if (i < C - 1) slots.push([i, j, i + 1, j]); if (j < R - 1) slots.push([i, j, i, j + 1]); }
    var es = [];   // posisi elektron ikatan
    slots.forEach(function (b) { var a = pos(b[0], b[1]), c = pos(b[2], b[3]), h = b[1] === b[3]; [0.38, 0.62].forEach(function (t) { es.push({ x: a[0] + (c[0] - a[0]) * t + (h ? 0 : (t < 0.5 ? -5 : 5)), y: a[1] + (c[1] - a[1]) * t + (h ? (t < 0.5 ? -5 : 5) : 0), ada: true }); }); });
    var bebas = [], hole = -1, tHop = 0, tGen = 0;
    var tengah = [2, 1], pusat = pos(2, 1);
    var info = { murni: "Si murni: setiap atom berbagi 4 elektron valensi dengan 4 tetangga (ikatan kovalen). Hampir tidak ada elektron bebas, jadi daya hantarnya rendah.", panas: "Energi panas memutus sebagian ikatan: elektron menjadi elektron bebas (biru) dan meninggalkan hole (lingkaran merah). Terbentuk pasangan elektron-hole, lalu sesekali berekombinasi.", n: "Atom fosfor (P, 5 elektron valensi) memakai 4 elektron untuk ikatan. Elektron ke-5 menjadi elektron bebas → donor → tipe N. Atom P tertinggal sebagai ion positif yang tidak bergerak.", p: "Atom boron (B, 3 elektron valensi) hanya mengisi 3 ikatan. Ikatan yang kosong adalah hole → akseptor → tipe P. Elektron tetangga melompat mengisinya sehingga hole berpindah." };
    function setMode(m) {
      mode = m; bebas = []; hole = -1; es.forEach(function (e) { e.ada = true; });
      if (m === "n") bebas.push({ x: pusat[0] + 18, y: pusat[1] - 18, vx: 30, vy: 20, ikut: true });
      if (m === "p") { var k = nearest(pusat[0] + 31, pusat[1]); es[k].ada = false; hole = k; }
      $$(el, "[data-m]").forEach(function (b) { b.classList.toggle("on", b.dataset.m === m); }); el.querySelector(".kx").textContent = info[m]; draw();
    }
    function nearest(x, y, skip) { var bi = 0, bd = 1e9; es.forEach(function (e, k) { var d = (e.x - x) * (e.x - x) + (e.y - y) * (e.y - y); if (d < bd && k !== skip) { bd = d; bi = k; } }); return bi; }
    function draw() {
      var s = "";
      slots.forEach(function (b) { var a = pos(b[0], b[1]), c = pos(b[2], b[3]); s += line(a[0], a[1], c[0], c[1], "#c9d2cc", 7); });
      for (var j = 0; j < R; j++) for (var i = 0; i < C; i++) {
        var p = pos(i, j), lab = "Si", col = "#e8eef0", tc = INK;
        if (i === tengah[0] && j === tengah[1] && mode === "n") { lab = "P⁺"; col = "#dbe7fb"; tc = BLU; }
        if (i === tengah[0] && j === tengah[1] && mode === "p") { lab = "B⁻"; col = "#fbe1dc"; tc = RED; }
        s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="17" fill="' + col + '" stroke="#7d8a84" stroke-width="1.5"/>' + txt(p[0], p[1] + 4, lab, { size: 11, b: 1, c: tc });
      }
      es.forEach(function (e, k) { s += e.ada ? '<circle cx="' + e.x + '" cy="' + e.y + '" r="3.3" fill="' + COP + '"/>' : '<circle cx="' + e.x + '" cy="' + e.y + '" r="5.5" fill="none" stroke="' + RED + '" stroke-width="2" stroke-dasharray="3 2"/>'; });
      el.querySelector(".b").innerHTML = s;
    }
    function drawFree() { el.querySelector(".f").innerHTML = bebas.map(function (b) { return '<circle cx="' + b.x + '" cy="' + b.y + '" r="5" fill="' + BLU + '" stroke="#fff" stroke-width="1.5"/>'; }).join(""); }
    $$(el, "[data-m]").forEach(function (b) { b.onclick = function () { setMode(b.dataset.m); }; });
    setMode(mode);
    loop(el, function (dt) {
      bebas.forEach(function (b) { b.x += b.vx * dt; b.y += b.vy * dt; if (Math.random() < 0.03) { b.vx = (Math.random() - 0.5) * 90; b.vy = (Math.random() - 0.5) * 90; } if (b.x < 20 || b.x > 320) b.vx *= -1; if (b.y < 15 || b.y > 235) b.vy *= -1; b.x = Math.max(20, Math.min(320, b.x)); b.y = Math.max(15, Math.min(235, b.y)); });
      if (mode === "panas") {
        tGen += dt;
        if (tGen > 1.6) { tGen = 0;
          if (bebas.length < 3) { var k = Math.floor(Math.random() * es.length); if (es[k].ada) { es[k].ada = false; bebas.push({ x: es[k].x, y: es[k].y, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80, dari: k, umur: 0 }); draw(); } }
          else { var b0 = bebas.shift(); es[b0.dari].ada = true; draw(); }
        }
      }
      if (mode === "p" && hole >= 0) { tHop += dt; if (tHop > 1.3) { tHop = 0; var src = nearest(es[hole].x + (Math.random() - 0.5) * 70, es[hole].y + (Math.random() - 0.5) * 70, hole); es[hole].ada = true; es[src].ada = false; hole = src; draw(); } }
      drawFree();
    });
  };
  A.pita = function (el) {
    var jenis = "semi", T = 40, ph = 0;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 250"><g class="g"></g></svg><div class="readout pr"></div><div class="ctrl">' + [["iso", "Isolator"], ["semi", "Semikonduktor"], ["kond", "Konduktor"]].map(function (m) { return '<button class="btn sm ghost" data-j="' + m[0] + '">' + m[1] + "</button>"; }).join("") + slider("Energi panas/cahaya", 0, 100, 5, T, "%") + "</div>";
    var EG = { iso: [9, "SiO₂ ≈ 9 eV (berlian ≈ 5,5 eV)"], semi: [1.12, "Si = 1,12 eV (Ge 0,66 eV; GaAs 1,42 eV)"], kond: [0, "pita tumpang tindih (Cu, Ag, Au, Al)"] };
    function draw() {
      var top = 30, H = 200, cbH = 55, vbH = 55, gapPx = jenis === "iso" ? 90 : jenis === "semi" ? 40 : -20, vbY = top + cbH + gapPx, s = "";
      s += '<rect x="112" y="' + top + '" width="180" height="' + cbH + '" rx="6" fill="#e3ecfb" stroke="' + BLU + '"/>' + txt(104, top + 26, "Pita", { a: "end", size: 11, c: BLU }) + txt(104, top + 40, "konduksi", { a: "end", size: 11, c: BLU });
      s += '<rect x="112" y="' + vbY + '" width="180" height="' + vbH + '" rx="6" fill="#f6e7d8" stroke="' + COP + '" opacity=".95"/>' + txt(104, vbY + 26, "Pita", { a: "end", size: 11, c: COP }) + txt(104, vbY + 40, "valensi", { a: "end", size: 11, c: COP });
      if (gapPx > 0) s += arrow(306, top + cbH + 2, 306, vbY - 2, INK) + arrow(306, vbY - 2, 306, top + cbH + 2, INK) + txt(312, top + cbH + gapPx / 2 + 4, "E_g", { a: "start", b: 1 });
      else s += txt(298, vbY + 10, "tumpang", { a: "start", size: 10 }) + txt(298, vbY + 24, "tindih", { a: "start", size: 10 });
      var nFree = jenis === "iso" ? 0 : jenis === "semi" ? Math.round(T / 100 * 7) : 12, slotsV = 14;
      for (var i = 0; i < slotsV; i++) { var x = 124 + i * 12, y = vbY + 20 + (i % 2) * 16, isHole = jenis === "semi" && i % 2 === 0 && i / 2 < nFree; s += isHole ? '<circle cx="' + x + '" cy="' + y + '" r="5" fill="none" stroke="' + RED + '" stroke-width="2" stroke-dasharray="3 2"/>' : '<circle cx="' + x + '" cy="' + y + '" r="4.5" fill="' + COP + '"/>'; }
      for (var k = 0; k < nFree; k++) { var fx = 122 + ((k * 37 + ph * (20 + k * 3)) % 160), fy = top + 15 + (k % 3) * 13; s += '<circle cx="' + fx + '" cy="' + fy + '" r="4.5" fill="' + BLU + '"/>'; }
      el.querySelector(".g").innerHTML = s;
      el.querySelector(".pr").innerHTML = "E<sub>g</sub>: " + EG[jenis][1] + " · elektron bebas: <b>" + (jenis === "iso" ? "≈ 0" : jenis === "kond" ? "selalu banyak" : nFree === 0 ? "≈ 0" : "sebanding energi (" + nFree + ")") + "</b>";
      $$(el, "[data-j]").forEach(function (b) { b.classList.toggle("on", b.dataset.j === jenis); });
    }
    $$(el, "[data-j]").forEach(function (b) { b.onclick = function () { jenis = b.dataset.j; draw(); }; });
    var sl = el.querySelector("input"); sl.addEventListener("input", function () { T = +sl.value; el.querySelector(".val").textContent = T; draw(); });
    loop(el, function (dt) { ph += dt; draw(); });
  };
  A.hole = function (el) {
    var N = 9, h = 0, auto = false, t = 0, lompat = -1;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 150"><g class="g"></g></svg><div class="readout hr"></div><div class="ctrl"><button class="btn sm" data-a="step">Langkah →</button><button class="btn sm ghost" data-a="auto">▶ Otomatis</button><button class="btn sm ghost" data-a="reset">Ulang</button></div>';
    function draw() {
      var s = '<rect x="6" y="40" width="26" height="60" rx="4" fill="#fbe1dc" stroke="' + RED + '"/>' + txt(19, 76, "+", { size: 18, b: 1, c: RED }) + '<rect x="308" y="40" width="26" height="60" rx="4" fill="#dbe7fb" stroke="' + BLU + '"/>' + txt(321, 76, "−", { size: 18, b: 1, c: BLU });
      for (var i = 0; i < N; i++) { var x = 50 + i * 31; s += '<circle cx="' + x + '" cy="70" r="12" fill="#eef1ee" stroke="#9aa5a0"/>' + txt(x, 105, "Si", { size: 9, c: MUT }); s += i === h ? '<circle cx="' + x + '" cy="70" r="7" fill="none" stroke="' + RED + '" stroke-width="2.2" stroke-dasharray="3 2"/>' : '<circle cx="' + x + '" cy="70" r="6" fill="#f2c230" stroke="#a37b00"/>'; }
      if (lompat >= 0) s += arrow(50 + (lompat + 1) * 31 - 4, 50, 50 + lompat * 31 + 6, 50, COP);
      s += txt(110, 132, "← elektron valensi melompat", { size: 11, c: COP }) + txt(250, 132, "hole bergerak →", { size: 11, c: RED });
      el.querySelector(".g").innerHTML = s;
      el.querySelector(".hr").innerHTML = "Hole di posisi " + (h + 1) + " dari " + N + ". Elektron hanya berpindah satu jarak atom, tetapi hole tampak berjalan ke arah terminal −.";
    }
    function step() { if (h >= N - 1) { h = 0; lompat = -1; } else { lompat = h; h++; } draw(); }
    $$(el, "button").forEach(function (b) { b.onclick = function () { if (b.dataset.a === "step") step(); if (b.dataset.a === "reset") { h = 0; lompat = -1; draw(); } if (b.dataset.a === "auto") { auto = !auto; b.textContent = auto ? "❚❚ Berhenti" : "▶ Otomatis"; } }; });
    draw(); loop(el, function (dt) { if (!auto) return; t += dt; if (t > 0.9) { t = 0; step(); } });
  };
  A.deplesi = function (el) {
    var cols = 6, rows = 4, w = 0, target = 0, t = 0;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 230"><g class="g"></g></svg><div class="readout dr"></div><div class="ctrl"><button class="btn sm" data-a="go">Satukan P dan N</button><button class="btn sm ghost" data-a="reset">Pisahkan lagi</button></div>';
    function draw() {
      var s = "", cx = 170, cw = 24;
      s += '<rect x="20" y="30" width="150" height="140" fill="#fde8e6" stroke="#e3b5ad"/><rect x="170" y="30" width="150" height="140" fill="#e3ecfb" stroke="#a8bfe6"/>';
      var dw = w * cw; if (dw > 0) s += '<rect x="' + (cx - dw) + '" y="30" width="' + 2 * dw + '" height="140" fill="#f3efe2" stroke="' + COP + '" stroke-dasharray="4 3"/>';
      for (var c = 0; c < cols; c++) for (var r = 0; r < rows; r++) {
        var y = 52 + r * 32, xp = cx - 14 - c * cw, xn = cx + 14 + c * cw, kosong = c < Math.floor(w + 1e-6);
        s += txt(xp, y + 15, "−", { size: 11, c: RED }) + txt(xn, y + 15, "+", { size: 11, c: BLU });   // ion tetap
        if (!kosong) { s += '<circle cx="' + xp + '" cy="' + (y + 2) + '" r="5.5" fill="none" stroke="' + RED + '" stroke-width="2"/>'; s += '<circle cx="' + xn + '" cy="' + (y + 2) + '" r="5" fill="' + BLU + '"/>'; }
      }
      s += txt(95, 22, "Tipe P: hole ○, ion −", { size: 10, b: 1 }) + txt(245, 22, "Tipe N: elektron ●, ion +", { size: 10, b: 1 });
      if (w >= target && target > 0) { s += arrow(cx + dw - 4, 190, cx - dw + 4, 190, RED) + txt(cx, 206, "medan listrik E (dari + ke −)", { size: 10.5, c: RED }) + txt(cx, 222, "barrier potential V₀ ≈ 0,7 V (Si)", { size: 11, b: 1 }); }
      el.querySelector(".g").innerHTML = s;
      el.querySelector(".dr").textContent = target === 0 ? "P dan N masih terpisah: keduanya netral." : w < target ? "Elektron dari N berdifusi ke P dan berekombinasi dengan hole…" : "Setimbang: tersisa ion tetap (+ di sisi N, − di sisi P) = daerah deplesi. Medan listriknya menahan difusi berikutnya.";
    }
    $$(el, "button").forEach(function (b) { b.onclick = function () { if (b.dataset.a === "go") { target = 2; } else { target = 0; w = 0; } draw(); }; });
    draw(); loop(el, function (dt) { if (w < target) { t += dt; if (t > 0.05) { t = 0; w = Math.min(target, w + 0.04); draw(); } } });
  };
  A.bias = function (el) {
    var maju = true, V = 0.5, ph = 0;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 250"><g class="g"></g></svg><div class="readout br"></div><div class="ctrl"><button class="btn sm" data-b="1">Bias maju</button><button class="btn sm ghost" data-b="0">Bias mundur</button>' + slider("V", 0, 0.8, 0.05, V, "V") + "</div>";
    var sl = el.querySelector("input");
    function arus() { return maju ? 1e-9 * (Math.exp(V / 0.0468) - 1) : -1e-9 * (1 - Math.exp(-V / 0.0468)); }
    function draw() {
      var w0 = 26, w = maju ? Math.max(4, w0 * (1 - V / 0.75)) : w0 * Math.sqrt(1 + V / 0.7), cx = 170, s = "";
      s += '<rect x="40" y="30" width="130" height="70" fill="#fde8e6" stroke="#e3b5ad"/><rect x="170" y="30" width="130" height="70" fill="#e3ecfb" stroke="#a8bfe6"/><rect x="' + (cx - w) + '" y="30" width="' + 2 * w + '" height="70" fill="#f3efe2" stroke="' + COP + '" stroke-dasharray="4 3"/>';
      s += txt(80, 70, "P", { size: 20, b: 1, c: RED }) + txt(260, 70, "N", { size: 20, b: 1, c: BLU }) + txt(cx, 116, "deplesi " + (maju ? "menyempit" : "melebar"), { size: 10.5, c: COP });
      var kiri = maju ? "+" : "−", kanan = maju ? "−" : "+";
      s += '<path class="w" d="M40 65 H20 V160 H140" fill="none" stroke="' + INK + '" stroke-width="2"/><path d="M200 160 H320 V65 H300" fill="none" stroke="' + INK + '" stroke-width="2"/>';
      s += line(150, 145, 150, 175, INK, 2.6) + line(160, 152, 160, 168, INK, 4) + line(140, 160, 150, 160) + line(160, 160, 200, 160);
      s += txt(maju ? 142 : 168, 140, "+", { b: 1, size: 13 }) + txt(cx - 15, 192, V.toFixed(2).replace(".", ",") + " V", { size: 12, b: 1 });
      s += txt(26, 56, kiri, { size: 14, b: 1, c: kiri === "+" ? RED : BLU }) + txt(314, 56, kanan, { size: 14, b: 1, c: kanan === "+" ? RED : BLU });
      var I = arus(), mA = I * 1000, frac = maju ? Math.max(0, Math.min(1, Math.log10(1 + mA * 1000) / Math.log10(1 + 30000))) : 0.02;
      s += txt(40, 222, "Arus", { a: "start", size: 11, b: 1 }) + '<rect x="80" y="212" width="220" height="12" rx="6" fill="#e6ebe8"/><rect x="80" y="212" width="' + (220 * frac) + '" height="12" rx="6" fill="' + (maju ? COP : "#9aa5a0") + '"/>';
      el.querySelector(".g").innerHTML = s;
      var teks = maju ? (V < 0.55 ? "Tegangan belum melewati barrier (~0,7 V Si): arus masih sangat kecil." : "Tegangan mendekati/melewati barrier: arus naik tajam.") : "Bias mundur: pembawa mayoritas tertarik menjauhi junction, deplesi melebar, arus ≈ 0 (hanya arus bocor ~nA).";
      el.querySelector(".br").innerHTML = "I ≈ <b>" + (maju ? (mA >= 1 ? Engine.fmt(mA, 2) + " mA" : mA >= 0.001 ? Engine.fmt(mA * 1000, 2) + " µA" : "≈ 0") : "−1 nA (bocor)") + "</b> · " + teks;
      $$(el, "[data-b]").forEach(function (b) { b.classList.toggle("ghost", (b.dataset.b === "1") !== maju); });
    }
    $$(el, "[data-b]").forEach(function (b) { b.onclick = function () { maju = b.dataset.b === "1"; sl.max = maju ? 0.8 : 10; sl.step = maju ? 0.05 : 0.5; if (!maju && V < 1) V = 5; if (maju && V > 0.8) V = 0.5; sl.value = V; el.querySelector(".val").textContent = String(V).replace(".", ","); draw(); }; });
    sl.addEventListener("input", function () { V = +sl.value; el.querySelector(".val").textContent = String(V).replace(".", ","); draw(); });
    draw();
  };
  A.tebakmaterial = function (el) {
    var M = [["Tembaga (Cu)", "Konduktor"], ["Karet", "Isolator"], ["Silikon (Si)", "Semikonduktor"], ["Emas (Au)", "Konduktor"], ["Kaca", "Isolator"], ["Germanium (Ge)", "Semikonduktor"], ["Aluminium (Al)", "Konduktor"], ["Mika", "Isolator"], ["Galium arsenida (GaAs)", "Semikonduktor"]];
    var warna = { Konduktor: "#DDEEE5", Isolator: "#F8E1DE", Semikonduktor: "#F6E7D8" };
    el.innerHTML = '<div class="tebak">' + M.map(function (m, i) { return '<button class="tk" data-i="' + i + '"><b>' + m[0] + '</b><span>klik untuk menebak</span></button>'; }).join("") + '</div><p class="small center">Tebak dulu dalam hati, lalu klik kartunya.</p>';
    $$(el, ".tk").forEach(function (b) { b.onclick = function () { var m = M[+b.dataset.i]; b.style.background = warna[m[1]]; b.querySelector("span").textContent = m[1]; b.classList.add("buka"); }; });
  };
  /* =================== ANIMASI MATERI 3: DIODA =================== */
  // simbol dioda horizontal antara x1..x2 di y; arah 1 = anoda kiri (menunjuk kanan), -1 = menunjuk kiri
  function diodaH(x1, x2, y, arah, warna) {
    var c = warna || INK, m = (x1 + x2) / 2, s = line(x1, y, m - 12, y, c) + line(m + 12, y, x2, y, c);
    if (arah >= 0) s += '<polygon points="' + (m - 12) + "," + (y - 11) + " " + (m - 12) + "," + (y + 11) + " " + (m + 10) + "," + y + '" fill="' + c + '"/>' + line(m + 11, y - 12, m + 11, y + 12, c, 3);
    else s += '<polygon points="' + (m + 12) + "," + (y - 11) + " " + (m + 12) + "," + (y + 11) + " " + (m - 10) + "," + y + '" fill="' + c + '"/>' + line(m - 11, y - 12, m - 11, y + 12, c, 3);
    return s;
  }
  function batTopP(x, y1, y2, label, plusAtas) {   // baterai vertikal; plusAtas=false membalik polaritas
    var m = (y1 + y2) / 2, s = '<rect x="' + (x - 18) + '" y="' + (m - 14) + '" width="36" height="28" fill="#fffdf6"/>' + line(x, y1, x, m - 8) + line(x, m + 8, x, y2);
    if (plusAtas !== false) s += line(x - 14, m - 8, x + 14, m - 8, INK, 2.6) + line(x - 7, m + 2, x + 7, m + 2, INK, 4) + txt(x - 20, m - 10, "+", { size: 13, b: 1 });
    else s += line(x - 7, m - 6, x + 7, m - 6, INK, 4) + line(x - 14, m + 4, x + 14, m + 4, INK, 2.6) + txt(x - 20, m + 18, "+", { size: 13, b: 1 });
    return s + (label ? txt(x + 20, m + 5, label, { a: "start", b: 1 }) : "");
  }
  function rangkaianDioda(V, R, arah, opt) {
    opt = opt || {}; var n = opt.n || 1, s = "";
    s += line(40, 30, 90, 30) + resH(90, 170, 30) + txt(130, 18, "R = " + fR(R), { b: 1, size: 11 });
    var x0 = 170, w = n === 2 ? 62 : 110;
    for (var k = 0; k < n; k++) s += diodaH(x0 + k * w, x0 + (k + 1) * w, 30, arah === "mundur" ? -1 : 1);
    var xe = x0 + n * w;
    if (opt.led) s += arrow(xe - 48, 8, xe - 36, -4 + 8, "#d97706") + arrow(xe - 40, 12, xe - 28, 0 + 4, "#d97706");
    s += line(xe, 30, 300, 30) + line(300, 30, 300, 170) + line(40, 170, 300, 170) + batTopP(40, 30, 170, V == null ? "" : f(V) + " V", true);
    s += txt(x0 + 12, 58, arah === "mundur" ? "K" : "A", { size: 10, c: MUT }) + txt(xe - 12, 58, arah === "mundur" ? "A" : "K", { size: 10, c: MUT });
    return svg(340, 190, s);
  }
  G.rdioda = function (p) { return rangkaianDioda(p.V, p.R, p.arah || "maju"); };
  G.d2seri = function (p) { return rangkaianDioda(p.V, p.R, "maju", { n: 2 }); };
  G.led = function (p) { return rangkaianDioda(p.V, p.R === "?" ? "?" : p.R, "maju", { led: 1 }); };
  G.fisikdioda = function () {
    var s = line(20, 60, 90, 60, "#9aa5a0", 4) + line(250, 60, 320, 60, "#9aa5a0", 4) + '<rect x="90" y="40" width="160" height="40" rx="8" fill="#2b2b2b"/><rect x="215" y="40" width="16" height="40" fill="#d9d9d9"/>';
    s += txt(55, 90, "Anoda (A)", { size: 11 }) + txt(285, 90, "Katode (K)", { size: 11 }) + txt(223, 32, "pita = katode", { size: 10.5, c: COP, b: 1 }) + txt(170, 64, "1N4007", { size: 11, c: "#ddd" });
    s += diodaH(110, 230, 125, 1) + txt(120, 150, "A", { size: 11 }) + txt(222, 150, "K", { size: 11 });
    return svg(340, 160, s);
  };
  G.bandingmodel = function (p) {
    var v = [p.a, p.b, p.c], nm = ["Ideal", "Praktis", "Lengkap"], mx = Math.max.apply(null, v) * 1.15, s = axes(50, 170, 260, 140, "", "I_F (mA)");
    v.forEach(function (x, i) { var h = x / mx * 140, X = 75 + i * 85; s += '<rect x="' + X + '" y="' + (170 - h) + '" width="50" height="' + h + '" fill="' + [BLU, COP, GRN][i] + '"/>' + txt(X + 25, 164 - h, f(x, 2), { size: 11, b: 1 }) + txt(X + 25, 186, nm[i], { size: 11 }); });
    return svg(340, 195, s);
  };
  // kurva Shockley sederhana: Is = 1e-9 A, n·VT = 0,0468 V
  var IS = 1e-9, NVT = 0.0468;
  function titikKerja(V, R) { if (V <= 0) return { vd: V, i: 0 }; var lo = 0, hi = Math.min(V, 1.2); for (var k = 0; k < 60; k++) { var m = (lo + hi) / 2, fx = IS * (Math.exp(m / NVT) - 1) - (V - m) / R; if (fx > 0) hi = m; else lo = m; } var vd = (lo + hi) / 2; return { vd: vd, i: (V - vd) / R }; }
  A.kurvavi = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 230"><g class="g"></g></svg><div class="readout kr"></div><div class="ctrl">' + slider("V_BIAS", 0, 10, 0.1, 3, "V") + slider("R", 220, 2200, 10, 470, "Ω") + "</div>";
    var ins = $$(el, "input"), x0 = 50, y0 = 200, W = 260, H = 170, Vm = 1, Im = 20;
    var base = axes(x0, y0, W, H, "V_F (V)", "I_F (mA)"), pts = [];
    for (var v = 0; v <= 0.84; v += 0.005) { var i = IS * (Math.exp(v / NVT) - 1) * 1000; if (i > Im) break; pts.push((x0 + v / Vm * W) + "," + (y0 - i / Im * H)); }
    for (var t = 0.2; t <= 1; t += 0.2) base += line(x0 + t * W, y0, x0 + t * W, y0 - H, "#e3e8e5", 1) + txt(x0 + t * W, y0 + 14, f(t, 1), { size: 10, c: MUT });
    for (var a = 5; a <= 20; a += 5) base += line(x0, y0 - a / Im * H, x0 + W, y0 - a / Im * H, "#e3e8e5", 1) + txt(x0 - 6, y0 - a / Im * H + 4, a, { size: 10, c: MUT, a: "end" });
    base += line(x0 + 0.7 * W, y0, x0 + 0.7 * W, y0 - H, RED, 1).replace("/>", ' stroke-dasharray="4 4"/>') + txt(x0 + 0.7 * W + 4, y0 - H + 10, "≈0,7 V (lutut)", { a: "start", size: 10, c: RED }) + poly(pts.join(" "), COP, 2.8);
    function upd() {
      var V = +ins[0].value, R = +ins[1].value, tk = titikKerja(V, R), mA = tk.i * 1000;
      $$(el, ".val")[0].textContent = f(V, 1); $$(el, ".val")[1].textContent = R;
      var px = x0 + Math.min(tk.vd, Vm) / Vm * W, py = y0 - Math.min(mA, Im) / Im * H;
      el.querySelector(".g").innerHTML = base + '<circle cx="' + px + '" cy="' + py + '" r="6" fill="' + RED + '" stroke="#fff" stroke-width="2"/>';
      el.querySelector(".kr").innerHTML = "V<sub>F</sub> = <b>" + f(tk.vd, 3) + " V</b> · I<sub>F</sub> = <b>" + f(mA, 2) + " mA</b>" + (mA > Im ? " (di luar grafik)" : "") + " · praktis: (V−0,7)/R = " + (V > 0.7 ? f((V - 0.7) / R * 1000, 2) + " mA" : "0");
    }
    ins.forEach(function (i) { i.addEventListener("input", upd); }); upd();
  };
  A.kurvalengkap = function (el) {
    var zona = "maju";
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 250"><g class="g"></g></svg><div class="readout zr"></div><div class="ctrl">' + [["maju", "Konduksi maju"], ["blokir", "Daerah blokir"], ["bd", "Breakdown"]].map(function (z) { return '<button class="btn sm ghost" data-z="' + z[0] + '">' + z[1] + "</button>"; }).join("") + "</div>";
    var info = { maju: "V<sub>F</sub> ≥ ± 0,7 V: arus maju besar (skala mA). Kurva sangat curam.", blokir: "Antara −V<sub>BR</sub> dan ± 0,7 V: hanya arus bocor sangat kecil (skala µA/nA).", bd: "V<sub>R</sub> ≥ V<sub>BR</sub>: arus balik melonjak. Tanpa pembatas arus, dioda rusak karena panas." };
    function draw() {
      var cx = 230, cy = 125, s = "";
      var hl = { maju: [cx + 40, 20, 80, 105], blokir: [60, 105, cx + 45 - 60, 40], bd: [20, 125, 45, 110] }[zona];
      s += '<rect x="' + hl[0] + '" y="' + hl[1] + '" width="' + hl[2] + '" height="' + hl[3] + '" fill="#f6e7d8" rx="6"/>';
      s += arrow(15, cy, 330, cy, INK) + arrow(cx, 235, cx, 10, INK) + txt(326, cy - 8, "V", { a: "end", size: 11 }) + txt(cx + 6, 18, "I_F", { a: "start", size: 11 }) + txt(cx + 6, 240, "I_R", { a: "start", size: 11 });
      s += txt(cx + 50, cy + 16, "0,7 V", { size: 10, c: MUT }) + txt(40, cy - 8, "−V_BR", { size: 10, c: MUT });
      var p = "M42 235 C 44 180, 46 140, 50 130 L " + (cx - 2) + " 127 L " + (cx + 40) + " 125 C " + (cx + 55) + " 122, " + (cx + 62) + " 90, " + (cx + 70) + " 20";
      s += '<path d="' + p + '" fill="none" stroke="' + COP + '" stroke-width="3"/>';
      s += txt(cx + 72, 60, "maju", { a: "start", size: 10.5, c: COP, b: 1 }) + txt(135, 118, "blokir (bocor)", { size: 10.5, c: COP, b: 1 }) + txt(62, 200, "breakdown", { a: "start", size: 10.5, c: COP, b: 1 });
      s += txt(cx - 20, 150, "skala µA", { size: 9.5, c: MUT, a: "end" }) + txt(cx + 8, 40, "skala mA", { size: 9.5, c: MUT, a: "start" });
      el.querySelector(".g").innerHTML = s; el.querySelector(".zr").innerHTML = info[zona];
      $$(el, "[data-z]").forEach(function (b) { b.classList.toggle("on", b.dataset.z === zona); });
    }
    $$(el, "[data-z]").forEach(function (b) { b.onclick = function () { zona = b.dataset.z; draw(); }; }); draw();
  };
  A.dioda = function (el) {
    var model = "praktis";
    el.innerHTML = '<div class="g"></div><div class="ctrl">' + [["ideal", "Ideal"], ["praktis", "Praktis"], ["lengkap", "Lengkap"]].map(function (m) { return '<button class="btn sm ghost" data-m="' + m[0] + '">' + m[1] + "</button>"; }).join("") + "</div>" +
      '<div class="ctrl">' + slider("V_BIAS", -20, 20, 0.5, 10, "V") + slider("R_LIMIT", 100, 4700, 10, 1000, "Ω") + "</div>" + '<table class="tabel small dr" style="margin:6px 0 0"></table>';
    var ins = $$(el, "input"), rd = 10;
    function upd() {
      var V = +ins[0].value, R = +ins[1].value, maju = V >= 0, s = "";
      $$(el, ".val")[0].textContent = f(V, 1); $$(el, ".val")[1].textContent = R;
      var aV = Math.abs(V), I = 0, VD = 0, ket;
      if (maju) {
        if (model === "ideal") { I = aV / R; VD = 0; }
        else if (aV > 0.7) { I = (aV - 0.7) / (R + (model === "lengkap" ? rd : 0)); VD = 0.7 + (model === "lengkap" ? I * rd : 0); }
        else { I = 0; VD = aV; }
        ket = I > 0 ? "Bias maju: dioda ON." : "Bias maju, tetapi V<sub>BIAS</sub> belum melewati 0,7 V: dioda belum menghantar.";
      } else { I = model === "lengkap" ? 1e-6 : 0; VD = aV - I * R; ket = "Bias mundur: dioda OFF, hampir seluruh tegangan jatuh pada dioda."; }
      var g = rangkaianDioda(null, R, maju ? "maju" : "mundur").replace('viewBox="0 0 340 190"', 'viewBox="0 0 340 200"');
      g = g.replace("</svg>", txt(62, 105, (maju ? "" : "−") + f(aV, 1) + " V", { a: "start", b: 1 }) + (I > 0 && maju ? txt(170, 120, "→ I_F", { size: 12, c: BLU, b: 1 }) : "") + "</svg>");
      el.querySelector(".g").innerHTML = g;
      var mA = I * 1000, ua = I * 1e6;
      el.querySelector(".dr").innerHTML = "<tr><th>Model " + model + "</th><th>Nilai</th></tr>" +
        "<tr><td>" + (maju ? "Arus maju I<sub>F</sub>" : "Arus balik I<sub>R</sub>") + "</td><td><b>" + (maju ? f(mA, 3) + " mA" : f(ua, 2) + " µA") + "</b></td></tr>" +
        "<tr><td>" + (maju ? "Tegangan dioda V<sub>F</sub>" : "Tegangan dioda V<sub>R</sub>") + "</td><td><b>" + f(VD, 3) + " V</b></td></tr>" +
        "<tr><td>Tegangan R<sub>LIMIT</sub></td><td><b>" + f(I * R, 3) + " V</b></td></tr><tr><td colspan=2>" + ket + (model === "lengkap" ? " (r<sub>d</sub>′ = 10 Ω, I<sub>R</sub> = 1 µA)" : "") + "</td></tr>";
      $$(el, "[data-m]").forEach(function (b) { b.classList.toggle("on", b.dataset.m === model); });
    }
    $$(el, "[data-m]").forEach(function (b) { b.onclick = function () { model = b.dataset.m; upd(); }; });
    ins.forEach(function (i) { i.addEventListener("input", upd); }); upd();
  };
  A.ujidioda = function (el) {
    var st = { d: "baik", p: "AK" };
    el.innerHTML = '<div class="mm"><div class="mm-face"><div class="mm-lcd">----</div><div class="small center" style="color:#1b261e;font-weight:700">Mode dioda ▷|</div></div><div class="mm-cfg"><p class="small"><b>Kondisi dioda:</b></p><div class="seg" data-g="d"><button data-v="baik">Baik</button><button data-v="putus">Putus</button><button data-v="short">Hubung singkat</button></div><p class="small"><b>Pemasangan probe:</b></p><div class="seg" data-g="p"><button data-v="AK">Merah ke A, hitam ke K</button><button data-v="KA">Merah ke K, hitam ke A</button></div></div></div><svg class="diag" viewBox="0 0 340 90"><g class="g"></g></svg><div class="mm-msg"></div>';
    function upd() {
      var r = st.d === "baik" ? (st.p === "AK" ? "0.62" : "OL") : st.d === "putus" ? "OL" : "0.00";
      el.querySelector(".mm-lcd").textContent = r;
      var merahKiri = st.p === "AK";
      el.querySelector(".g").innerHTML = diodaH(90, 250, 45, 1) + txt(100, 30, "A", { size: 11 }) + txt(240, 30, "K", { size: 11 }) + '<circle cx="70" cy="45" r="9" fill="' + (merahKiri ? RED : "#222") + '"/><circle cx="270" cy="45" r="9" fill="' + (merahKiri ? "#222" : RED) + '"/>' + txt(70, 75, merahKiri ? "merah" : "hitam", { size: 10 }) + txt(270, 75, merahKiri ? "hitam" : "merah", { size: 10 });
      var m = el.querySelector(".mm-msg");
      if (st.d === "baik") { m.className = "mm-msg ok"; m.textContent = st.p === "AK" ? "Bias maju dari baterai meter: terbaca ± 0,5–0,7 V (silikon). Balik probe untuk memastikan OL." : "Bias mundur: OL (tak hingga). Satu arah terbaca, satu arah OL → dioda BAIK."; }
      else if (st.d === "putus") { m.className = "mm-msg bad"; m.textContent = "OL di kedua arah → dioda PUTUS (terbuka)."; }
      else { m.className = "mm-msg bad"; m.textContent = "Mendekati 0 di kedua arah → dioda HUBUNG SINGKAT."; }
      $$(el, ".seg").forEach(function (g) { $$(g, "button").forEach(function (b) { b.classList.toggle("on", st[g.dataset.g] === b.dataset.v); }); });
    }
    $$(el, ".seg").forEach(function (g) { $$(g, "button").forEach(function (b) { b.onclick = function () { st[g.dataset.g] = b.dataset.v; upd(); }; }); }); upd();
  };
  A.penyearah = function (el) {
    var model = "praktis";
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 210"><g class="g"></g></svg><div class="readout pr"></div><div class="ctrl"><button class="btn sm ghost" data-m="ideal">Ideal</button><button class="btn sm ghost" data-m="praktis">Praktis</button>' + slider("V_p masuk", 2, 20, 0.5, 10, "V") + "</div>";
    var sl = el.querySelector("input");
    function upd() {
      var Vp = +sl.value, vd = model === "ideal" ? 0 : 0.7, x0 = 40, y0 = 105, W = 285, A = 85, sc = A / 20, pin = [], pout = [];
      $$(el, ".val")[0].textContent = f(Vp, 1);
      for (var k = 0; k <= 200; k++) { var th = k / 200 * 4 * Math.PI, vi = Vp * Math.sin(th), vo = Math.max(0, vi - vd); pin.push((x0 + k / 200 * W) + "," + (y0 - vi * sc)); pout.push((x0 + k / 200 * W) + "," + (y0 - vo * sc)); }
      var s = arrow(x0, y0, x0 + W + 10, y0, INK) + arrow(x0, 200, x0, 12, INK) + txt(x0 + W + 12, y0 + 4, "t", { a: "start", size: 11 }) + txt(x0 - 4, 14, "V", { size: 11, a: "end" });
      s += poly(pin.join(" "), "#9aa5a0", 1.8).replace("/>", ' stroke-dasharray="5 4"/>') + poly(pout.join(" "), COP, 3);
      s += txt(x0 + 8, y0 - Vp * sc - 6, "V_in", { a: "start", size: 10.5, c: MUT }) + txt(x0 + 60, y0 - (Vp - vd) * sc - 6, "V_out", { a: "start", size: 10.5, c: COP, b: 1 });
      el.querySelector(".g").innerHTML = s;
      var vpo = Math.max(0, Vp - vd);
      el.querySelector(".pr").innerHTML = "V<sub>p(out)</sub> = " + f(Vp, 1) + " − " + f(vd, 1) + " = <b>" + f(vpo, 2) + " V</b> · V<sub>rata-rata</sub> = V<sub>p(out)</sub>/π = <b>" + f(vpo / Math.PI, 2) + " V</b> · PIV = V<sub>p</sub> = <b>" + f(Vp, 1) + " V</b>";
      $$(el, "[data-m]").forEach(function (b) { b.classList.toggle("on", b.dataset.m === model); });
    }
    $$(el, "[data-m]").forEach(function (b) { b.onclick = function () { model = b.dataset.m; upd(); }; });
    sl.addEventListener("input", upd); upd();
  };
  /* =================== ANIMASI MATERI 4: CATU DAYA =================== */
  function trafoSVG(x, y1, y2, ct) {   // lilitan primer (kiri) & sekunder (kanan) di x..x+40
    var s = "", n = 5, h = (y2 - y1) / n;
    for (var i = 0; i < n; i++) { s += '<path d="M' + x + " " + (y1 + i * h) + " a" + (h / 2) + " " + (h / 2) + " 0 0 1 0 " + h + '" fill="none" stroke="' + COP + '" stroke-width="2"/>'; s += '<path d="M' + (x + 30) + " " + (y1 + i * h) + " a" + (h / 2) + " " + (h / 2) + " 0 0 0 0 " + h + '" fill="none" stroke="' + COP + '" stroke-width="2"/>'; }
    s += line(x + 12, y1, x + 12, y2, "#7d8a84", 2) + line(x + 18, y1, x + 18, y2, "#7d8a84", 2);
    if (ct) s += dot(x + 30, (y1 + y2) / 2);
    return s;
  }
  function hopV(x, y1, yc, y2) { return line(x, y1, x, yc - 7) + '<path d="M' + x + " " + (yc - 7) + " a7 7 0 0 0 0 14\" fill=\"none\" stroke=\"" + INK + '" stroke-width="2.2"/>' + line(x, yc + 7, x, y2); }
  function rectCircuit(mode, fase, opt) {   // fase: 1 = setengah positif, -1 = negatif, 0 = netral
    opt = opt || {};
    var on = function (k) { return fase === 0 ? INK : (k ? COP : "#c7cfca"); }, s = "";
    s += txt(20, 12, "AC", { size: 10, a: "start", c: MUT }) + '<circle cx="22" cy="100" r="14" fill="#fff" stroke="' + INK + '" stroke-width="2"/><path d="M13 100 q4.5 -9 9 0 t9 0" fill="none" stroke="' + INK + '" stroke-width="1.8"/>' + line(22, 86, 22, 40) + line(22, 40, 60, 40) + line(22, 114, 22, 160) + line(22, 160, 60, 160);
    s += trafoSVG(60, 40, 160, mode === "ct");
    var xs = 90;
    if (mode === "half") {
      s += line(xs, 40, 140, 40) + diodaH(140, 210, 40, 1, on(fase > 0)) + line(210, 40, 290, 40) + line(290, 40, 290, 70) + resV(290, 70, 130) + line(290, 130, 290, 160) + line(xs, 160, 290, 160);
      s += txt(150, 25, "D", { size: 10.5, c: MUT });
    } else if (mode === "ct") {
      s += line(xs, 40, 150, 40) + diodaH(150, 220, 40, 1, on(fase > 0)) + line(xs, 160, 150, 160) + diodaH(150, 220, 160, 1, on(fase < 0)) + line(220, 40, 250, 40) + line(220, 160, 250, 160) + line(250, 40, 250, 160) + dot(250, 100) + line(250, 100, 300, 100);
      s += line(xs, 100, 120, 100) + hopV(120, 100, 160, 195) + line(120, 195, 320, 195) + line(300, 100, 320, 100) + resV(320, 100, 195);
      s += txt(185, 25, "D1", { size: 10.5, c: MUT }) + txt(185, 182, "D2", { size: 10.5, c: MUT }) + txt(108, 96, "CT", { size: 9.5, c: MUT });
    } else {
      var T = [175, 52], Bn = [175, 148], R = [228, 100], L = [122, 100];
      var dg = function (a, b, k, lab, lx, ly) { var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, c = on(k); return line(a[0], a[1], b[0], b[1], c, 2.2) + '<g transform="translate(' + mx + "," + my + ") rotate(" + ang + ')"><polygon points="-9,-9 -9,9 8,0" fill="' + c + '"/>' + line(9, -10, 9, 10, c, 3) + "</g>" + txt(lx, ly, lab, { size: 10, c: MUT }); };
      s += line(xs, 40, 175, 40) + line(175, 40, 175, 52) + line(xs, 160, 175, 160) + line(175, 160, 175, 148);
      s += dg(T, R, fase > 0, "D1", 214, 66) + dg(L, Bn, fase > 0, "D2", 136, 140) + dg(Bn, R, fase < 0, "D3", 214, 140) + dg(L, T, fase < 0, "D4", 136, 66);
      s += line(228, 100, 320, 100) + resV(320, 100, 195) + line(320, 195, 122, 195) + hopV(122, 100, 160, 195);
      s += dot(175, 52) + dot(175, 148) + dot(228, 100) + dot(122, 100) + txt(240, 92, "+", { size: 12, b: 1 }) + txt(110, 92, "−", { size: 12, b: 1 });
    }
    return s;
  }
  G.rect = function (p) { return svg(340, 205, rectCircuit(p.mode || "bridge", 0)); };
  G.blokcatu = function () {
    var bl = [["Trafo", "turunkan V", "AC rendah"], ["Penyearah", "dioda", "DC berdenyut"], ["Filter", "kapasitor", "DC + ripple"], ["Regulator", "zener / IC", "DC stabil"]], s = "";
    bl.forEach(function (b, i) {
      var x = 8 + i * 84; s += '<rect x="' + x + '" y="30" width="72" height="48" rx="8" fill="' + (i % 2 ? "#f6e7d8" : "#e3ecfb") + '" stroke="#9aa5a0"/>' + txt(x + 36, 50, b[0], { size: 11, b: 1 }) + txt(x + 36, 66, b[1], { size: 9.5, c: MUT });
      if (i < 3) s += arrow(x + 73, 54, x + 83, 54, INK);
      var wy = 112, pts = [];
      for (var k = 0; k <= 40; k++) { var t = k / 40 * 4 * Math.PI, v = Math.sin(t); var y = i === 0 ? v : i === 1 ? Math.abs(v) : i === 2 ? 0.85 + 0.12 * Math.abs(Math.sin(t)) : 0.9; pts.push((x + 4 + k * 1.6) + "," + (wy - y * 18 + (i === 0 ? 0 : 9))); }
      s += poly(pts.join(" "), i === 3 ? GRN : COP, 1.8) + txt(x + 36, 146, b[2], { size: 8.6, c: MUT });
    });
    return svg(340, 155, s);
  };
  G.zenerkurva = function () {
    var cx = 230, cy = 70, s = arrow(20, cy, 330, cy, INK) + arrow(cx, 165, cx, 10, INK) + txt(326, cy - 6, "V", { size: 11, a: "end" }) + txt(cx + 6, 18, "I", { size: 11, a: "start" });
    s += '<path d="M' + (cx + 40) + ' 10 C ' + (cx + 34) + ' 60, ' + (cx + 28) + ' 68, ' + cx + ' 70 L 90 71 C 80 72, 78 90, 76 165" fill="none" stroke="' + COP + '" stroke-width="3"/>';
    s += line(76, cy, 76, 165, RED, 1).replace("/>", ' stroke-dasharray="4 3"/>') + txt(72, 84, "−V_Z", { size: 10.5, c: RED, a: "end", b: 1 }) + txt(84, 150, "daerah kerja zener", { size: 10, c: COP, a: "start" }) + txt(84, 162, "(V hampir tetap)", { size: 9.5, c: MUT, a: "start" }) + txt(cx + 46, 40, "maju ±0,7 V", { size: 9.5, c: MUT, a: "start" });
    return svg(340, 175, s);
  };
  A.penyearah2 = function (el) {
    var mode = el.dataset.mode || "bridge", Vrms = 12, t = 0, play = true;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 205"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 120"><g class="w"></g></svg><div class="readout rr"></div><div class="ctrl">' + [["half", "Setengah gelombang"], ["ct", "Center-tap"], ["bridge", "Bridge"]].map(function (m) { return '<button class="btn sm ghost" data-m="' + m[0] + '">' + m[1] + "</button>"; }).join("") + '<button class="btn sm ghost" data-a="p">❚❚</button>' + slider("V sekunder", 6, 24, 1, Vrms, "V rms") + "</div>";
    var sl = el.querySelector("input");
    function info() {
      var Vp = Vrms * Math.SQRT2, vo, piv, fd, nd;
      if (mode === "half") { vo = Vp - 0.7; piv = Vp; fd = 50; nd = "1 dioda"; }
      else if (mode === "ct") { vo = Vp - 0.7; piv = 2 * vo + 0.7; fd = 100; nd = "2 dioda (sekunder " + Vrms + "-0-" + Vrms + " V)"; }
      else { vo = Vp - 1.4; piv = vo + 0.7; fd = 100; nd = "4 dioda"; }
      el.querySelector(".rr").innerHTML = nd + " · V<sub>p(sek)</sub> = " + Vrms + "×√2 = " + f(Vp, 2) + " V · V<sub>p(out)</sub> = <b>" + f(vo, 2) + " V</b> · V<sub>avg</sub> = <b>" + f((mode === "half" ? 1 : 2) * vo / Math.PI, 2) + " V</b> · denyut " + fd + " Hz · PIV = " + f(piv, 1) + " V";
      $$(el, "[data-m]").forEach(function (b) { b.classList.toggle("on", b.dataset.m === mode); });
      return { Vp: Vp, vo: vo };
    }
    var I = info();
    function draw() {
      var ph = (t % 1), fase = ph < 0.5 ? 1 : -1;
      el.querySelector(".c").innerHTML = rectCircuit(mode, fase);
      var x0 = 20, y0 = 60, W = 300, A = 45, pin = [], pout = [];
      for (var k = 0; k <= 160; k++) { var th = k / 160 * 4 * Math.PI, vi = Math.sin(th), vo = mode === "half" ? Math.max(0, vi) : Math.abs(vi); vo = Math.max(0, vo - (mode === "bridge" ? 1.4 : 0.7) / I.Vp); pin.push((x0 + k / 160 * W) + "," + (y0 - vi * A)); pout.push((x0 + k / 160 * W) + "," + (y0 - vo * A)); }
      var cx = x0 + (t % 2) / 2 * W;
      el.querySelector(".w").innerHTML = line(x0, y0, x0 + W, y0, "#c7cfca", 1) + poly(pin.join(" "), "#9aa5a0", 1.6).replace("/>", ' stroke-dasharray="5 4"/>') + poly(pout.join(" "), COP, 2.8) + line(cx, 8, cx, 112, RED, 1.4) + txt(x0 + 2, 12, "V_in (putus-putus) · V_out (tembaga)", { a: "start", size: 9.5, c: MUT }) + txt(cx + 4, 112, fase > 0 ? "siklus +" : "siklus −", { a: "start", size: 9.5, c: RED });
    }
    $$(el, "[data-m]").forEach(function (b) { b.onclick = function () { mode = b.dataset.m; I = info(); draw(); }; });
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    sl.addEventListener("input", function () { Vrms = +sl.value; el.querySelector(".val").textContent = Vrms; I = info(); draw(); });
    draw(); loop(el, function (dt) { if (play) { t += dt * 0.35; draw(); } });
  };
  A.filter = function (el) {
    var gel = "penuh", Cv = 2200, RL = 100, Vp = 15.6;
    var Cs = [100, 220, 470, 1000, 2200, 4700, 10000];
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 170"><g class="w"></g></svg><div class="readout fr"></div><div class="ctrl"><button class="btn sm ghost" data-g="setengah">Setengah gel. (50 Hz)</button><button class="btn sm ghost" data-g="penuh">Gel. penuh (100 Hz)</button></div><div class="ctrl">' + slider("C", 0, 6, 1, 4, "µF") + slider("R_L", 20, 1000, 10, RL, "Ω") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      Cv = Cs[+ins[0].value]; RL = +ins[1].value; $$(el, ".val")[0].textContent = Cv; $$(el, ".val")[1].textContent = RL;
      var fr = gel === "penuh" ? 100 : 50, tau = RL * Cv * 1e-6, x0 = 20, y0 = 150, W = 300, H = 130, T = 0.06, N = 600, vc = 0, pr = [], pc = [], vmin = 1e9, vmax = 0;
      for (var k = 0; k <= N; k++) {
        var tt = k / N * T, vi = Vp * Math.sin(2 * Math.PI * 50 * tt), vr = gel === "penuh" ? Math.abs(vi) : Math.max(0, vi);
        vc = Math.max(vr, vc * Math.exp(-(T / N) / tau));
        if (tt > 0.02) { vmin = Math.min(vmin, vc); vmax = Math.max(vmax, vc); }
        pr.push((x0 + k / N * W) + "," + (y0 - vr / 18 * H)); pc.push((x0 + k / N * W) + "," + (y0 - vc / 18 * H));
      }
      var s = line(x0, y0, x0 + W, y0, INK, 1.2) + poly(pr.join(" "), "#9aa5a0", 1.5).replace("/>", ' stroke-dasharray="4 4"/>') + poly(pc.join(" "), COP, 2.8) + txt(x0 + 2, 14, "tanpa filter (putus-putus) · dengan C (tembaga)", { a: "start", size: 9.5, c: MUT });
      el.querySelector(".w").innerHTML = s;
      var vrSim = vmax - vmin, vrRumus = Vp / (fr * RL * Cv * 1e-6);
      el.querySelector(".fr").innerHTML = "V<sub>p</sub> = 15,6 V · ripple simulasi ≈ <b>" + f(vrSim, 2) + " V</b> · rumus V<sub>p</sub>/(f·R<sub>L</sub>·C) = " + f(vrRumus, 2) + " V · V<sub>DC</sub> ≈ <b>" + f(Vp - vrSim / 2, 2) + " V</b>" + (vrRumus > Vp * 0.3 ? " (ripple besar: rumus pendekatan kurang akurat)" : "");
      $$(el, "[data-g]").forEach(function (b) { b.classList.toggle("on", b.dataset.g === gel); });
    }
    $$(el, "[data-g]").forEach(function (b) { b.onclick = function () { gel = b.dataset.g; draw(); }; });
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  A.zenerreg = function (el) {
    var Rs = 470, Vz = 5.1, Pmax = 0.5;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 190"><g class="c"></g></svg><table class="tabel small zr" style="margin:4px 0"></table><div class="ctrl">' + slider("V_in", 4, 20, 0.5, 12, "V") + slider("R_L", 10, 5010, 50, 510, "Ω") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var Vin = +ins[0].value, RL = +ins[1].value; $$(el, ".val")[0].textContent = f(Vin, 1); $$(el, ".val")[1].textContent = RL;
      var Vth = Vin * RL / (Rs + RL), on = Vth > Vz, Vo = on ? Vz : Vth, Is = (Vin - Vo) / Rs, IL = Vo / RL, Iz = on ? Is - IL : 0, Pz = Vz * Iz;
      var s = batV(30, 40, 160, f(Vin, 1) + " V") + line(30, 40, 80, 40) + resH(80, 160, 40) + txt(120, 28, "R_S = 470 Ω", { size: 10.5, b: 1 }) + line(160, 40, 290, 40) + dot(200, 40) + dot(270, 40) + line(30, 160, 290, 160) + dot(200, 160) + dot(270, 160);
      s += line(200, 40, 200, 88) + '<polygon points="189,112 211,112 200,92" fill="' + (on ? COP : "#c7cfca") + '"/>' + '<polyline points="186,86 190,90 210,90 214,94" fill="none" stroke="' + (on ? COP : "#c7cfca") + '" stroke-width="3"/>' + line(200, 112, 200, 160) + txt(186, 104, "Z", { size: 10.5, a: "end", b: 1 }) + txt(186, 118, "5,1 V", { size: 9.5, a: "end", c: MUT });
      s += resV(270, 40, 160) + txt(286, 104, "R_L", { size: 10.5, a: "start", b: 1 }) + txt(300, 30, "V_out = " + f(Vo, 2) + " V", { size: 11, a: "end", b: 1, c: on ? GRN : RED });
      el.querySelector(".c").innerHTML = s;
      var st = !on ? '<span class="tag no">Zener OFF: V_in terlalu kecil atau beban terlalu berat → tidak teregulasi</span>' : Iz < 0.001 ? '<span class="tag mid">I_Z hampir habis → batas regulasi</span>' : Pz > Pmax ? '<span class="tag no">Daya zener ' + f(Pz * 1000, 0) + " mW &gt; 500 mW → zener bisa rusak</span>" : '<span class="tag ok">Teregulasi</span>';
      el.querySelector(".zr").innerHTML = "<tr><th>I<sub>S</sub> = (V<sub>in</sub> − V<sub>out</sub>)/R<sub>S</sub></th><th>I<sub>L</sub> = V<sub>out</sub>/R<sub>L</sub></th><th>I<sub>Z</sub> = I<sub>S</sub> − I<sub>L</sub></th><th>P<sub>Z</sub></th></tr><tr><td>" + f(Is * 1000, 2) + " mA</td><td>" + f(IL * 1000, 2) + " mA</td><td><b>" + f(Iz * 1000, 2) + " mA</b></td><td>" + f(Pz * 1000, 1) + " mW</td></tr><tr><td colspan=4>" + st + "</td></tr>";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  function zregSVG(Vin, Rs, RL, Vz) {
    var s = batV(30, 40, 160, Vin + " V") + line(30, 40, 80, 40) + resH(80, 160, 40) + txt(120, 26, "R_S = " + fR(Rs), { size: 10.5, b: 1 }) + line(160, 40, 290, 40) + dot(200, 40) + dot(270, 40) + line(30, 160, 290, 160) + dot(200, 160) + dot(270, 160);
    s += line(200, 40, 200, 88) + '<polygon points="189,112 211,112 200,92" fill="' + COP + '"/><polyline points="186,86 190,90 210,90 214,94" fill="none" stroke="' + COP + '" stroke-width="3"/>' + line(200, 112, 200, 160) + txt(186, 104, "Z", { size: 10.5, a: "end", b: 1 }) + txt(186, 118, String(Vz).replace(".", ",") + " V", { size: 9.5, a: "end", c: MUT });
    s += resV(270, 40, 160) + txt(286, 100, "R_L", { size: 10.5, a: "start", b: 1 }) + txt(286, 114, fR(RL), { size: 9.5, a: "start", c: MUT });
    return s;
  }
  G.zreg = function (p) { return svg(340, 180, zregSVG(p.Vin || 12, p.Rs || 470, p.RL || 510, p.Vz || 5.1)); };
  G.gel = function (p) {
    var m = p.mode || "full", x0 = 15, y0 = 100, W = 310, pts = [], pin = [], vc = 0;
    for (var k = 0; k <= 300; k++) {
      var th = k / 300 * 4 * Math.PI, vi = Math.sin(th), vr = m === "half" ? Math.max(0, vi) : Math.abs(vi);
      if (m === "filter") { vc = Math.max(vr, vc - 0.0045); vr = vc; }
      pin.push((x0 + k / 300 * W) + "," + (y0 - vi * 70)); pts.push((x0 + k / 300 * W) + "," + (y0 - vr * 70));
    }
    return svg(340, 180, line(x0, y0, x0 + W, y0, "#c7cfca", 1) + poly(pin.join(" "), "#9aa5a0", 1.4).replace("/>", ' stroke-dasharray="4 4"/>') + poly(pts.join(" "), COP, 2.8) + txt(x0, 176, "2 periode input (40 ms)", { size: 9.5, a: "start", c: MUT }));
  };
  /* =================== ANIMASI MATERI 5: LIMITER, CLAMPER, DIODA KHUSUS =================== */
  function diodaV(x, y1, y2, arah, warna) {   // arah 1: arus ke bawah (anoda atas); -1: arus ke atas
    var c = warna || INK, m = (y1 + y2) / 2, s = line(x, y1, x, m - 11, c) + line(x, m + 11, x, y2, c);
    if (arah >= 0) s += '<polygon points="' + (x - 11) + "," + (m - 11) + " " + (x + 11) + "," + (m - 11) + " " + x + "," + (m + 9) + '" fill="' + c + '"/>' + line(x - 12, m + 10, x + 12, m + 10, c, 3);
    else s += '<polygon points="' + (x - 11) + "," + (m + 11) + " " + (x + 11) + "," + (m + 11) + " " + x + "," + (m - 9) + '" fill="' + c + '"/>' + line(x - 12, m - 10, x + 12, m - 10, c, 3);
    return s;
  }
  function acSrc(x, y1, y2, lab) { var m = (y1 + y2) / 2; return line(x, y1, x, m - 14) + line(x, m + 14, x, y2) + '<circle cx="' + x + '" cy="' + m + '" r="14" fill="#fff" stroke="' + INK + '" stroke-width="2"/><path d="M' + (x - 9) + " " + m + " q4.5 -9 9 0 t9 0" + '" fill="none" stroke="' + INK + '" stroke-width="1.8"/>' + (lab ? txt(x + 19, m + 4, lab, { a: "start", size: 10.5, b: 1 }) : ""); }
  function capH(x, y) { return line(x - 4, y - 13, x - 4, y + 13, INK, 3) + line(x + 4, y - 13, x + 4, y + 13, INK, 3); }
  // cabang dioda (+ baterai bias opsional) dari node atas ke ground; pol: +1 limiter/clamper positif-atas
  function cabangD(x, yT, yB, arah, vb, plusAtas, on, noLab) {
    var c = on ? COP : INK;
    if (!vb) return diodaV(x, yT, yB, arah, c);
    return diodaV(x, yT, yT + 58, arah, c) + batTopP(x, yT + 58, yB, noLab ? "" : f(vb, 1) + " V", plusAtas);
  }
  function limiterSVG(mode, vb, st) {   // st: {up:bool, dn:bool} dioda yang sedang menghantar
    st = st || {};
    var s = acSrc(30, 40, 160, "V_in") + line(30, 40, 70, 40) + resH(70, 140, 40) + txt(105, 26, "R1", { size: 10.5, b: 1 }) + line(140, 40, 300, 40) + line(30, 160, 300, 160) + dot(175, 40) + dot(175, 160) + txt(175, 30, "A", { size: 10.5, b: 1, c: MUT });
    if (mode === "pos") s += cabangD(175, 40, 160, 1, 0, true, st.up);
    else if (mode === "neg") s += cabangD(175, 40, 160, -1, 0, true, st.dn);
    else if (mode === "bias") s += cabangD(175, 40, 160, 1, vb, true, st.up);
    else if (mode === "nbias") s += cabangD(175, 40, 160, -1, vb, false, st.dn);
    else { s += cabangD(165, 40, 160, 1, vb, true, st.up, 1) + dot(220, 40) + dot(220, 160) + cabangD(220, 40, 160, -1, vb, false, st.dn); }
    s += resV(285, 40, 160) + txt(300, 104, "R_L", { size: 10.5, a: "start", b: 1 }) + dot(285, 40) + dot(285, 160) + txt(330, 36, "V_out", { size: 10, a: "end", c: COP, b: 1 });
    return s;
  }
  function clamperSVG(mode, vb, on) {
    var s = acSrc(30, 40, 160, "V_in") + line(30, 40, 95, 40) + capH(100, 40) + txt(100, 22, "C", { size: 10.5, b: 1 }) + line(104, 40, 300, 40) + line(30, 160, 300, 160) + dot(175, 40) + dot(175, 160);
    s += cabangD(175, 40, 160, mode === "pos" ? -1 : 1, vb ? Math.abs(vb) : 0, vb >= 0, on);
    s += resV(285, 40, 160) + txt(300, 104, "R_L", { size: 10.5, a: "start", b: 1 }) + dot(285, 40) + dot(285, 160) + txt(330, 36, "V_out", { size: 10, a: "end", c: COP, b: 1 });
    return s;
  }
  function batasLimiter(mode, vb) { var hi = Infinity, lo = -Infinity; if (mode === "pos") hi = 0.7; if (mode === "neg") lo = -0.7; if (mode === "bias") hi = vb + 0.7; if (mode === "nbias") lo = -(vb + 0.7); if (mode === "ganda") { hi = vb + 0.7; lo = -(vb + 0.7); } return { hi: hi, lo: lo }; }
  function gelPlot(fnIn, fnOut, Vmax, opt) {   // plot 2 periode; Vmax = skala
    opt = opt || {}; var x0 = 30, y0 = 90, W = 290, H = 72, pi = [], po = [], s = "";
    for (var k = 0; k <= 240; k++) { var t = k / 240 * 2, x = x0 + k / 240 * W; pi.push(x + "," + (y0 - fnIn(t) / Vmax * H)); po.push(x + "," + (y0 - fnOut(t, k) / Vmax * H)); }
    s += line(x0, y0, x0 + W, y0, "#c7cfca", 1) + txt(x0 - 4, y0 + 4, "0", { size: 9.5, a: "end", c: MUT });
    (opt.levels || []).forEach(function (L) { if (!isFinite(L.v)) return; var y = y0 - L.v / Vmax * H; s += line(x0, y, x0 + W, y, L.c || RED, 1).replace("/>", ' stroke-dasharray="4 3"/>') + txt(x0 + W, y - 3, L.t, { size: 9.5, a: "end", c: L.c || RED, b: 1 }); });
    s += poly(pi.join(" "), "#9aa5a0", 1.5).replace("/>", ' stroke-dasharray="5 4"/>') + poly(po.join(" "), COP, 2.8) + txt(x0, 12, "V_in (putus-putus) · V_out (tembaga)", { size: 9.5, a: "start", c: MUT });
    return s;
  }
  G.limiter = function (p) { return svg(340, 180, limiterSVG(p.mode || "pos", p.Vb || 0)); };
  G.clamper = function (p) { return svg(340, 180, clamperSVG(p.mode || "pos", p.Vb || 0)); };
  G.klip = function (p) {   // gelombang limiter: Vp, mode, Vb
    var Vp = p.Vp || 10, b = batasLimiter(p.mode || "pos", p.Vb || 0), V = Vp * 1.15;
    return svg(340, 180, gelPlot(function (t) { return Vp * Math.sin(2 * Math.PI * t); }, function (t) { return Math.max(b.lo, Math.min(b.hi, Vp * Math.sin(2 * Math.PI * t))); }, V, { levels: [{ v: b.hi, t: "+" + f(b.hi, 1) + " V" }, { v: b.lo, t: f(b.lo, 1) + " V" }] }));
  };
  G.simboldioda = function () {
    var it = [["Biasa", 0], ["Zener", 1], ["LED", 2], ["Fotodioda", 3], ["Schottky", 4], ["Varaktor", 5]], s = "";
    it.forEach(function (d, i) {
      var cx = 60 + (i % 3) * 110, cy = 40 + Math.floor(i / 3) * 85, c = COP;
      s += line(cx - 40, cy, cx - 12, cy) + '<polygon points="' + (cx - 12) + "," + (cy - 12) + " " + (cx - 12) + "," + (cy + 12) + " " + (cx + 10) + "," + cy + '" fill="' + c + '"/>' + line(cx + 11, cy, cx + 40, cy);
      var k = d[1], x = cx + 11;
      if (k === 1) s += '<polyline points="' + (x - 5) + "," + (cy - 16) + " " + x + "," + (cy - 13) + " " + x + "," + (cy + 13) + " " + (x + 5) + "," + (cy + 16) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
      else if (k === 4) s += '<polyline points="' + (x + 6) + "," + (cy - 9) + " " + (x + 6) + "," + (cy - 13) + " " + x + "," + (cy - 13) + " " + x + "," + (cy + 13) + " " + (x - 6) + "," + (cy + 13) + " " + (x - 6) + "," + (cy + 9) + '" fill="none" stroke="' + INK + '" stroke-width="3"/>';
      else s += line(x, cy - 13, x, cy + 13, INK, 3);
      if (k === 5) s += line(x + 7, cy - 13, x + 7, cy + 13, INK, 3) + line(x + 7, cy, x + 29, cy, "#fffdf6", 3) + line(x + 7, cy, cx + 40, cy);
      if (k === 2) s += arrow(cx, cy - 16, cx + 12, cy - 30, "#d97706") + arrow(cx + 8, cy - 14, cx + 20, cy - 28, "#d97706");
      if (k === 3) s += arrow(cx + 12, cy - 30, cx, cy - 16, BLU) + arrow(cx + 20, cy - 28, cx + 8, cy - 14, BLU);
      s += txt(cx, cy + 32, d[0], { size: 11, b: 1 });
    });
    return svg(340, 170, s);
  };
  A.limiter = function (el) {
    var mode = el.dataset.mode || "pos", Vp = 10, vb = 3, t = 0, play = true;
    var ms = [["pos", "Positif"], ["neg", "Negatif"], ["bias", "Berbias +"], ["nbias", "Berbias −"], ["ganda", "Ganda ±"]];
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 180"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 175"><g class="w"></g></svg><div class="readout lr"></div><div class="ctrl">' + ms.map(function (m) { return '<button class="btn sm ghost" data-m="' + m[0] + '">' + m[1] + "</button>"; }).join("") + '<button class="btn sm ghost" data-a="p">❚❚</button></div><div class="ctrl">' + slider("V_p", 2, 20, 1, Vp, "V") + slider("V_bias", 0, 10, 0.5, vb, "V") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var b = batasLimiter(mode, vb), V = Math.max(Vp, isFinite(b.hi) ? b.hi : 0) * 1.15, vi = Vp * Math.sin(2 * Math.PI * t), st = { up: vi > b.hi, dn: vi < b.lo };
      el.querySelector(".c").innerHTML = limiterSVG(mode, /bias|ganda/.test(mode) ? vb : 0, st);
      var cx = 30 + (t % 2) / 2 * 290;
      el.querySelector(".w").innerHTML = gelPlot(function (u) { return Vp * Math.sin(2 * Math.PI * u); }, function (u) { return Math.max(b.lo, Math.min(b.hi, Vp * Math.sin(2 * Math.PI * u))); }, V, { levels: [{ v: b.hi, t: "+" + f(b.hi, 1) + " V" }, { v: b.lo, t: f(b.lo, 1) + " V" }] }) + line(cx, 18, cx, 170, BLU, 1.2);
      var hi = Math.min(Vp, b.hi), lo = Math.max(-Vp, b.lo);
      el.querySelector(".lr").innerHTML = "Batas atas: <b>" + (isFinite(b.hi) ? "+" + f(b.hi, 1) + " V" : "tidak ada") + "</b> · batas bawah: <b>" + (isFinite(b.lo) ? f(b.lo, 1) + " V" : "tidak ada") + "</b> · V<sub>out</sub> dari " + f(lo, 1) + " V sampai +" + f(hi, 1) + " V" + (st.up || st.dn ? ' · <span class="tag mid">dioda menghantar → terpotong</span>' : "");
      $$(el, "[data-m]").forEach(function (x) { x.classList.toggle("on", x.dataset.m === mode); });
    }
    $$(el, "[data-m]").forEach(function (x) { x.onclick = function () { mode = x.dataset.m; draw(); }; });
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    ins.forEach(function (i) { i.addEventListener("input", function () { Vp = +ins[0].value; vb = +ins[1].value; $$(el, ".val")[0].textContent = Vp; $$(el, ".val")[1].textContent = f(vb, 1); draw(); }); });
    draw(); loop(el, function (dt) { if (play) { t += dt * 0.3; draw(); } });
  };
  function simClamp(mode, Vp, vb, tauT, N, per) {   // simulasi clamper dari Vc = 0; tauT = R_L·C / T
    var out = [], vc = 0, L = mode === "pos" ? vb - 0.7 : vb + 0.7, dt = per / N;
    for (var k = 0; k <= N; k++) {
      var t = k * dt, vi = Vp * Math.sin(2 * Math.PI * t);
      vc *= Math.exp(-dt / tauT);
      var vo = vi + vc;
      if (mode === "pos" && vo < L) { vc = L - vi; vo = L; }
      if (mode === "neg" && vo > L) { vc = L - vi; vo = L; }
      out.push(vo);
    }
    return out;
  }
  A.clamper = function (el) {
    var mode = el.dataset.mode || "pos", Vp = 10, vb = 0, ti = 3, taus = [0.2, 1, 10, 100];
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 180"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 190"><g class="w"></g></svg><div class="readout cr"></div><div class="ctrl"><button class="btn sm ghost" data-m="pos">Clamper positif</button><button class="btn sm ghost" data-m="neg">Clamper negatif</button></div><div class="ctrl">' + slider("V_p", 2, 15, 1, Vp, "V") + slider("V_bias", -5, 5, 0.5, vb, "V") + slider("R_L·C / T", 0, 3, 1, ti, "") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      Vp = +ins[0].value; vb = +ins[1].value; var tau = taus[+ins[2].value]; $$(el, ".val")[0].textContent = Vp; $$(el, ".val")[1].textContent = f(vb, 1); $$(el, ".val")[2].textContent = f(tau, 1);
      el.querySelector(".c").innerHTML = clamperSVG(mode, vb, false);
      var N = 480, per = 4, o = simClamp(mode, Vp, vb, tau, N, per), V = 2 * Vp + Math.abs(vb) + 1, x0 = 30, y0 = 95, W = 290, H = 80, pi = [], po = [];
      for (var k = 0; k <= N; k++) { var x = x0 + k / N * W; pi.push(x + "," + (y0 - Vp * Math.sin(2 * Math.PI * k / N * per) / V * H)); po.push(x + "," + (y0 - o[k] / V * H)); }
      var L = mode === "pos" ? vb - 0.7 : vb + 0.7, H2 = mode === "pos" ? L + 2 * Vp : L - 2 * Vp, ss = line(x0, y0, x0 + W, y0, "#c7cfca", 1) + txt(x0 - 4, y0 + 4, "0", { size: 9.5, a: "end", c: MUT });
      [[L, f(L, 1) + " V"], [H2, f(H2, 1) + " V"]].forEach(function (q) { var y = y0 - q[0] / V * H; ss += line(x0, y, x0 + W, y, RED, 1).replace("/>", ' stroke-dasharray="4 3"/>') + txt(x0 + W, y + (q[0] > 0 ? -3 : 11), q[1], { size: 9.5, a: "end", c: RED, b: 1 }); });
      ss += poly(pi.join(" "), "#9aa5a0", 1.5).replace("/>", ' stroke-dasharray="5 4"/>') + poly(po.join(" "), COP, 2.6) + txt(x0, 186, "4 periode sejak dinyalakan (C mula-mula kosong)", { size: 9.5, a: "start", c: MUT });
      el.querySelector(".w").innerHTML = ss;
      el.querySelector(".cr").innerHTML = "Level DC (rata-rata) bergeser dari 0 ke ≈ <b>" + f(mode === "pos" ? L + Vp : L - Vp, 1) + " V</b> · V<sub>out</sub> tunak: <b>" + f(Math.min(L, H2), 1) + " V sampai " + f(Math.max(L, H2), 1) + " V</b> · " + (tau >= 10 ? '<span class="tag ok">R_L·C ≥ 10T: bentuk terjaga</span>' : '<span class="tag no">R_L·C terlalu kecil: C sempat kosong, bentuk rusak</span>');
      $$(el, "[data-m]").forEach(function (x) { x.classList.toggle("on", x.dataset.m === mode); });
    }
    $$(el, "[data-m]").forEach(function (x) { x.onclick = function () { mode = x.dataset.m; draw(); }; });
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  A.varaktor = function (el) {
    var C0 = 200, Lh = 330e-6;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 170"><g class="c"></g></svg><div class="readout vr"></div><div class="ctrl">' + slider("V_R (tegangan balik)", 0, 20, 0.5, 2, "V") + "</div>";
    var sl = el.querySelector("input");
    function draw() {
      var VR = +sl.value; el.querySelector(".val").textContent = f(VR, 1);
      var k = Math.sqrt(1 + VR / 0.7), C = C0 / k, fr = 1 / (2 * Math.PI * Math.sqrt(Lh * C * 1e-12)), w = 14 * k;
      var s = '<rect x="40" y="35" width="' + (130 - w / 2) + '" height="80" fill="#e3ecfb" stroke="#9aa5a0"/><rect x="' + (170 + w / 2) + '" y="35" width="' + (130 - w / 2) + '" height="80" fill="#f6e7d8" stroke="#9aa5a0"/><rect x="' + (170 - w / 2) + '" y="35" width="' + w + '" height="80" fill="#fffdf6" stroke="' + COP + '" stroke-dasharray="4 3"/>';
      s += txt(80, 80, "P", { size: 16, b: 1 }) + txt(260, 80, "N", { size: 16, b: 1 }) + txt(170, 28, "deplesi = dielektrik", { size: 10, c: COP }) + arrow(170 - w / 2 - 2, 128, 170 + w / 2 + 2, 128, COP) + txt(170, 148, "lebar ∝ √(1 + V_R/0,7)", { size: 9.5, c: MUT });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".vr").innerHTML = "C = " + C0 + " pF / " + f(k, 2) + " = <b>" + f(C, 1) + " pF</b> · dengan L = 330 µH: f<sub>r</sub> = 1/(2π√(LC)) = <b>" + f(fr / 1e6, 3) + " MHz</b> (gelombang AM)";
    }
    sl.addEventListener("input", draw); draw();
  };
  var E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
  function e12Atas(R) { var d = Math.pow(10, Math.floor(Math.log10(R)) - 1); for (var i = 0; i < 24; i++) { var v = E12[i % 12] * d * (i >= 12 ? 10 : 1); if (v >= R - 1e-9) return v; } return R; }
  A.led = function (el) {
    var W = [["merah", 2.0, "#ef4444"], ["kuning", 2.1, "#f59e0b"], ["hijau", 2.2, "#22c55e"], ["biru", 3.2, "#3b82f6"], ["putih", 3.2, "#e5e7eb"]], w = 0;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 190"><g class="c"></g></svg><table class="tabel small lt" style="margin:4px 0"></table><div class="ctrl">' + W.map(function (x, i) { return '<button class="btn sm ghost" data-w="' + i + '">' + x[0] + "</button>"; }).join("") + '</div><div class="ctrl">' + slider("V_S", 3, 24, 0.5, 5, "V") + slider("I target", 5, 20, 1, 10, "mA") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var Vs = +ins[0].value, It = +ins[1].value / 1000, c = W[w]; $$(el, ".val")[0].textContent = f(Vs, 1); $$(el, ".val")[1].textContent = It * 1000;
      var R = (Vs - c[1]) / It, ok = Vs > c[1] + 0.2, Rs = ok ? e12Atas(R) : 0, I = ok ? (Vs - c[1]) / Rs : 0, P = I * I * Rs, glow = Math.min(1, I / 0.02);
      var s = batTopP(40, 30, 170, f(Vs, 1) + " V", true) + line(40, 30, 90, 30) + resH(90, 170, 30) + txt(130, 18, ok ? "R = " + fR(Rs) : "R = ?", { b: 1, size: 11 }) + diodaH(170, 260, 30, 1, ok ? c[2] === "#e5e7eb" ? "#94a3b8" : c[2] : "#c7cfca") + line(260, 30, 300, 30) + line(300, 30, 300, 170) + line(40, 170, 300, 170);
      if (ok) s += '<circle cx="215" cy="30" r="' + (16 + 14 * glow) + '" fill="' + c[2] + '" opacity="' + (0.15 + 0.35 * glow) + '"/>';
      s += arrow(210, 12, 222, 0, "#d97706") + arrow(220, 16, 232, 4, "#d97706") + txt(215, 62, "LED " + c[0] + " (V_F ≈ " + f(c[1], 1) + " V)", { size: 10.5, b: 1 });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".lt").innerHTML = ok ? "<tr><th>R hitung = (V<sub>S</sub> − V<sub>F</sub>)/I</th><th>Nilai standar (ke atas)</th><th>I sebenarnya</th><th>P<sub>R</sub></th></tr><tr><td>(" + f(Vs, 1) + " − " + f(c[1], 1) + ")/" + It * 1000 + " mA = " + f(R, 0) + " Ω</td><td><b>" + fR(Rs) + "</b></td><td>" + f(I * 1000, 2) + " mA</td><td>" + f(P * 1000, 1) + " mW" + (P > 0.2 ? ' <span class="tag mid">pakai ½ W</span>' : "") + "</td></tr>" : '<tr><td><span class="tag no">V_S terlalu kecil: LED tidak menyala</span></td></tr>';
      $$(el, "[data-w]").forEach(function (x) { x.classList.toggle("on", +x.dataset.w === w); });
    }
    $$(el, "[data-w]").forEach(function (x) { x.onclick = function () { w = +x.dataset.w; draw(); }; });
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  A.fotodioda = function (el) {
    var Vs = 5, k = 0.05, Id = 0.005;   // µA per lux, arus gelap µA
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 190"><g class="c"></g></svg><div class="readout fd"></div><div class="ctrl">' + slider("Cahaya", 0, 1000, 10, 200, "lux") + slider("R", 1, 220, 1, 47, "kΩ") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var lux = +ins[0].value, R = +ins[1].value * 1000; $$(el, ".val")[0].textContent = lux; $$(el, ".val")[1].textContent = R / 1000;
      var I = (Id + k * lux) * 1e-6, Vo = Math.min(Vs - 0.1, I * R), sat = I * R >= Vs - 0.1;
      var s = batTopP(40, 30, 170, "5 V", true) + line(40, 30, 150, 30) + line(150, 30, 150, 40) + diodaV(150, 40, 100, -1, COP) + line(150, 100, 150, 110) + resV(150, 110, 170) + line(40, 170, 150, 170) + dot(150, 110) + line(150, 110, 260, 110) + txt(165, 145, "R = " + fR(R), { size: 10.5, a: "start", b: 1 }) + txt(205, 102, "V_out = " + f(Vo, 2) + " V", { size: 11, b: 1, c: GRN });
      var n = Math.round(lux / 200);
      for (var i = 0; i < Math.max(1, n); i++) s += arrow(210 - i * 4, 22 + i * 10, 172, 58 + i * 4, lux ? "#d97706" : "#e5e7eb");
      s += txt(214, 20, lux + " lux", { size: 10, a: "start", c: "#d97706", b: 1 }) + txt(128, 74, "K", { size: 9.5, c: MUT }) + txt(128, 96, "A", { size: 9.5, c: MUT });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".fd").innerHTML = "Bias mundur. I<sub>λ</sub> = arus gelap + kepekaan × cahaya = " + f(Id, 3) + " + 0,05 × " + lux + " = <b>" + f(I * 1e6, 2) + " µA</b> · V<sub>out</sub> = I<sub>λ</sub> × R = <b>" + f(Vo, 2) + " V</b>" + (sat ? ' <span class="tag mid">jenuh (mendekati 5 V)</span>' : "");
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  A.schottky = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 170"><g class="c"></g></svg><div class="readout sk"></div><div class="ctrl">' + slider("I beban", 0.5, 5, 0.5, 2, "A") + slider("V_out", 3, 24, 1, 5, "V") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var I = +ins[0].value, Vo = +ins[1].value; $$(el, ".val")[0].textContent = f(I, 1); $$(el, ".val")[1].textContent = Vo;
      var d = [["Silikon pn", 0.7, INK], ["Schottky", 0.3, COP]], s = "", mx = 0.7 * 5;
      d.forEach(function (x, i) { var P = x[1] * I, w = P / mx * 220; s += txt(20, 50 + i * 60, x[0] + " (V_F " + f(x[1], 1) + " V)", { size: 10.5, a: "start", b: 1 }) + '<rect x="20" y="' + (58 + i * 60) + '" width="' + Math.max(2, w) + '" height="22" rx="4" fill="' + x[2] + '"/>' + txt(26 + w, 74 + i * 60, f(P, 2) + " W · η ≈ " + f(Vo / (Vo + x[1]) * 100, 1) + "%", { size: 10.5, a: "start" }); });
      el.querySelector(".c").innerHTML = s + txt(20, 18, "Rugi daya per dioda: P = V_F × I", { size: 10, a: "start", c: MUT });
      el.querySelector(".sk").innerHTML = "Hemat " + f((0.7 - 0.3) * I, 2) + " W per dioda. Pada keluaran " + Vo + " V, efisiensi naik dari " + f(Vo / (Vo + 0.7) * 100, 1) + "% ke " + f(Vo / (Vo + 0.3) * 100, 1) + "%. Makin rendah V<sub>out</sub>, makin besar manfaatnya.";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  /* =================== ANIMASI MATERI 6: TRANSISTOR BJT =================== */
  function bjtSym(x, y, pnp, c, lab) {   // basis di (x-24,y); kolektor (x+22,y-40); emitor (x+22,y+40)
    c = c || INK; var s = line(x - 24, y, x, y, c) + line(x, y - 16, x, y + 16, c, 3.4) + line(x, y - 7, x + 22, y - 22, c) + line(x + 22, y - 22, x + 22, y - 40, c) + line(x, y + 7, x + 22, y + 22, c) + line(x + 22, y + 22, x + 22, y + 40, c);
    var ax = x + 14, ay = y + 16.5, ang = Math.atan2(15, 22) * 180 / Math.PI;
    s += '<g transform="translate(' + (pnp ? x + 6 : ax) + "," + (pnp ? y + 11 : ay) + ") rotate(" + (pnp ? ang + 180 : ang) + ')"><polygon points="-7,-5 -7,5 4,0" fill="' + c + '"/></g>';
    s += '<circle cx="' + (x + 9) + '" cy="' + y + '" r="25" fill="none" stroke="' + c + '" stroke-width="1.4" opacity=".55"/>';
    if (lab !== false) s += txt(x - 28, y - 5, "B", { size: 10, a: "end", c: MUT }) + txt(x + 28, y - 32, "C", { size: 10, a: "start", c: MUT }) + txt(x + 28, y + 38, "E", { size: 10, a: "start", c: MUT });
    return s;
  }
  function ceSVG(p, st) {   // p: VBB, RB, RC, VCC (Ω); st: hasil (opsional) {IB, IC, VCE, on}
    st = st || {}; var on = st.on ? COP : INK;
    var s = batTopP(30, 110, 180, f(p.VBB, 2) + " V", true) + txt(30, 200, "V_BB", { size: 10, c: MUT }) + line(30, 110, 60, 110) + resH(60, 145, 110) + txt(102, 96, "R_B = " + fR(p.RB), { size: 10.5, b: 1 }) + line(145, 110, 156, 110);
    s += bjtSym(180, 110, false, on) + line(202, 70, 202, 64) + resV(202, 22, 64) + txt(214, 46, "R_C = " + fR(p.RC), { size: 10.5, b: 1, a: "start" }) + line(202, 20, 280, 20) + line(202, 22, 202, 20);
    s += batTopP(280, 20, 180, f(p.VCC, 1) + " V", true) + txt(280, 200, "V_CC", { size: 10, c: MUT }) + line(202, 150, 202, 180) + line(30, 180, 280, 180) + dot(202, 180);
    if (st.IB != null) s += arrow(150, 124, 135, 124, BLU) + txt(140, 138, "I_B " + f(st.IB * 1e6, 1) + " µA", { size: 9.5, c: BLU, a: "middle" }) + arrow(190, 52, 190, 68, BLU) + txt(186, 64, "I_C " + f(st.IC * 1000, 2) + " mA", { size: 9.5, c: BLU, a: "end" }) + txt(212, 128, "V_CE = " + f(st.VCE, 2) + " V", { size: 10.5, a: "start", b: 1, c: GRN });
    return s;
  }
  function solveCE(VBB, RB, RC, VCC, beta, VA) {   // model sederhana dengan Early & saturasi halus
    VA = VA || 1e9; var IB = Math.max(0, (VBB - 0.7) / RB);
    var fIC = function (vce) { return beta * IB * (1 + vce / VA) * (1 - Math.exp(-vce / 0.06)); };
    var lo = 0, hi = VCC; for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (VCC - fIC(m) * RC > m) lo = m; else hi = m; }
    var VCE = (lo + hi) / 2, IC = (VCC - VCE) / RC, ICsat = (VCC - 0.2) / RC;
    var reg = IB <= 0 ? "cutoff" : beta * IB >= ICsat ? "saturasi" : "aktif";
    if (reg === "saturasi") { VCE = 0.2; IC = ICsat; } if (reg === "cutoff") { VCE = VCC; IC = 0; } if (reg === "aktif") { IC = beta * IB; VCE = VCC - IC * RC; }
    return { IB: IB, IC: IC, IE: IC + IB, VCE: VCE, reg: reg, ICsat: ICsat, PD: VCE * IC };
  }
  G.ce = function (p) { return svg(340, 205, ceSVG({ VBB: +p.VBB || 2, RB: +p.RB || 100000, RC: +p.RC || 1000, VCC: +p.VCC || 10 })); };
  G.bjtsimbol = function () {
    var s = bjtSym(90, 80, false, COP) + bjtSym(250, 80, true, COP) + txt(100, 150, "NPN", { size: 13, b: 1 }) + txt(260, 150, "PNP", { size: 13, b: 1 }) + txt(100, 166, "panah keluar", { size: 10, c: MUT }) + txt(260, 166, "panah masuk", { size: 10, c: MUT });
    return svg(340, 175, s);
  };
  G.bjtstruktur = function (p) {
    var pnp = p.tipe === "pnp", L = pnp ? ["P", "N", "P"] : ["N", "P", "N"], col = pnp ? ["#f6e7d8", "#e3ecfb", "#f6e7d8"] : ["#e3ecfb", "#f6e7d8", "#e3ecfb"], s = "", xs = [40, 150, 190];
    var w = [110, 40, 110], nm = ["Emitor", "Basis", "Kolektor"], dop = ["doping tinggi", "tipis, doping rendah", "doping sedang, paling lebar"];
    for (var i = 0; i < 3; i++) s += '<rect x="' + xs[i] + '" y="40" width="' + w[i] + '" height="70" fill="' + col[i] + '" stroke="#9aa5a0"/>' + txt(xs[i] + w[i] / 2, 82, L[i] + (i === 0 ? "+" : ""), { size: 18, b: 1 }) + txt(xs[i] + w[i] / 2, 130, nm[i], { size: 11, b: 1 }) + txt(xs[i] + w[i] / 2, i === 1 ? 152 : 144, dop[i], { size: 9, c: MUT });
    s += line(xs[0], 75, 20, 75) + txt(16, 79, "E", { a: "end", size: 11, b: 1 }) + line(170, 40, 170, 20) + txt(170, 14, "B", { size: 11, b: 1 }) + line(300, 75, 320, 75) + txt(324, 79, "C", { a: "start", size: 11, b: 1 });
    s += txt(150, 34, "J_BE", { size: 9, c: COP, a: "end" }) + txt(190, 34, "J_BC", { size: 9, c: COP, a: "start" });
    return svg(340, 160, s);
  };
  G.kurvabasis = function () {
    var x0 = 40, y0 = 150, W = 260, H = 120, s = axes(x0, y0, W, H, "V_BE (V)", "I_B (µA)"), pts = [];
    for (var k = 0; k <= 100; k++) { var v = k / 100 * 1.0, i = 6.8e-4 * (Math.exp(v / 0.0637) - 1); if (i > H) break; pts.push((x0 + v * W) + "," + (y0 - i)); }
    s += poly(pts.join(" "), COP, 3) + line(x0 + 0.7 * W, y0, x0 + 0.7 * W, y0 - H, RED, 1).replace("/>", ' stroke-dasharray="4 3"/>') + txt(x0 + 0.7 * W, y0 + 14, "0,7", { size: 10, c: RED, b: 1 }) + txt(x0 + 0.35 * W, y0 - 20, "I_B ≈ 0 (belum ON)", { size: 9.5, c: MUT });
    return svg(340, 170, s);
  };
  A.bjtarus = function (el) {
    var pnp = false, parts = [], t = 0;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 200"><g class="c"></g></svg><div class="readout ar"></div><div class="ctrl"><button class="btn sm ghost" data-t="npn">NPN</button><button class="btn sm ghost" data-t="pnp">PNP</button></div><div class="ctrl">' + slider("I_B", 0, 100, 5, 20, "µA") + slider("β", 50, 300, 10, 100, "") + "</div>";
    var ins = $$(el, "input");
    for (var i = 0; i < 40; i++) parts.push({ x: Math.random(), y: Math.random(), rek: Math.random() < 0.06 });
    function draw(dt) {
      var IB = +ins[0].value * 1e-6, b = +ins[1].value, IC = b * IB, IE = IC + IB, al = b / (b + 1), sp = IB > 0 ? 0.3 + IB * 6000 : 0;
      $$(el, ".val")[0].textContent = IB * 1e6; $$(el, ".val")[1].textContent = b;
      var L = pnp ? ["P", "N", "P"] : ["N", "P", "N"], cE = pnp ? "#f6e7d8" : "#e3ecfb", cB = pnp ? "#e3ecfb" : "#f6e7d8";
      var s = '<rect x="30" y="50" width="110" height="80" fill="' + cE + '" stroke="#9aa5a0"/><rect x="140" y="50" width="34" height="80" fill="' + cB + '" stroke="#9aa5a0"/><rect x="174" y="50" width="136" height="80" fill="' + cE + '" stroke="#9aa5a0"/>';
      s += txt(85, 46, "Emitor (" + L[0] + "+)", { size: 10.5, b: 1 }) + txt(157, 46, "B (" + L[1] + ")", { size: 10.5, b: 1 }) + txt(242, 46, "Kolektor (" + L[2] + ")", { size: 10.5, b: 1 });
      parts.forEach(function (q) {
        if (sp) { q.x += dt * sp * 0.5; if (q.rek && q.x > 0.42) { q.y -= dt * sp * 1.2; } if (q.x > 1 || q.y < -0.3) { q.x = 0; q.y = Math.random(); q.rek = Math.random() < 1 / (b + 1) * 4; } }
        var X = 30 + q.x * 280, Y = 55 + Math.max(-0.3, q.y) * 70;
        if (q.rek && q.x > 0.42) X = 157;
        s += pnp ? '<circle cx="' + X + '" cy="' + Y + '" r="3.2" fill="#fff" stroke="' + COP + '" stroke-width="1.6"/>' : '<circle cx="' + X + '" cy="' + Y + '" r="3.2" fill="' + BLU + '"/>';
      });
      s += arrow(60, 160, 290, 160, pnp ? COP : BLU) + txt(175, 176, pnp ? "hole bergerak E → C (arus konvensional E → C)" : "elektron bergerak E → C (arus konvensional C → E)", { size: 9.5, c: MUT });
      s += txt(157, 196, "sebagian kecil keluar lewat basis = I_B", { size: 9.5, c: COP });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".ar").innerHTML = "I_C = β·I_B = " + b + " × " + f(IB * 1e6, 0) + " µA = <b>" + f(IC * 1000, 2) + " mA</b> · I_E = I_C + I_B = <b>" + f(IE * 1000, 3) + " mA</b> · α = I_C/I_E = <b>" + f(al, 4) + "</b>";
      $$(el, "[data-t]").forEach(function (x) { x.classList.toggle("on", (x.dataset.t === "pnp") === pnp); });
    }
    $$(el, "[data-t]").forEach(function (x) { x.onclick = function () { pnp = x.dataset.t === "pnp"; draw(0); }; });
    ins.forEach(function (i) { i.addEventListener("input", function () { draw(0); }); });
    draw(0); loop(el, function (dt) { draw(dt); });
  };
  A.kurvakolektor = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 205"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 215"><g class="g"></g></svg><div class="readout kr"></div><div class="ctrl">' + slider("V_BB", 0, 5, 0.1, 2, "V") + slider("R_B", 10, 470, 10, 100, "kΩ") + slider("β", 50, 300, 10, 200, "") + "</div><div class=\"ctrl\">" + slider("R_C", 100, 5000, 100, 1000, "Ω") + slider("V_CC", 5, 20, 1, 10, "V") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var VBB = +ins[0].value, RB = +ins[1].value * 1000, b = +ins[2].value, RC = +ins[3].value, VCC = +ins[4].value;
      [f(VBB, 1), RB / 1000, b, RC, VCC].forEach(function (v, i) { $$(el, ".val")[i].textContent = v; });
      var r = solveCE(VBB, RB, RC, VCC, b);
      el.querySelector(".c").innerHTML = ceSVG({ VBB: VBB, RB: RB, RC: RC, VCC: VCC }, { IB: r.IB, IC: r.IC, VCE: r.VCE, on: r.reg !== "cutoff" });
      var x0 = 44, y0 = 180, W = 250, H = 150, Vm = 20, Im = Math.max(VCC / RC * 1.1, b * r.IB * 1.3) * 1000, nice = [1, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500];
      Im = nice.filter(function (n) { return n >= Im; })[0] || Im;
      var X = function (v) { return x0 + v / Vm * W; }, Y = function (i) { return y0 - i / Im * H; }, s = axes(x0, y0, W, H, "V_CE (V)", "I_C (mA)");
      for (var v = 5; v <= 20; v += 5) s += txt(X(v), y0 + 14, v, { size: 9.5, c: MUT });
      for (var k = 1; k <= 4; k++) s += line(x0, Y(Im * k / 4), x0 + W, Y(Im * k / 4), "#e6ebe8", 1) + txt(x0 - 5, Y(Im * k / 4) + 4, f(Im * k / 4, 1), { size: 9.5, a: "end", c: MUT });
      var step = Math.max(5, Math.ceil(VCC / RC / b * 1e6 / 6 / 5) * 5);
      for (var n = 1; n <= 6; n++) { var ib = n * step * 1e-6, pts = []; for (var q = 0; q <= 60; q++) { var vc = q / 60 * Vm, ic = b * ib * (1 + vc / 150) * (1 - Math.exp(-vc / 0.25)) * 1000; if (ic > Im) break; pts.push(X(vc) + "," + Y(ic)); } if (pts.length > 1) s += poly(pts.join(" "), "#9aa5a0", 1.4) + txt(X(Vm) + 2, Y(b * ib * (1 + Vm / 150) * 1000) + 3, n * step + " µA", { size: 8.5, a: "start", c: MUT }); }
      s += '<rect x="' + x0 + '" y="' + (y0 - H) + '" width="' + (X(0.7) - x0) + '" height="' + H + '" fill="' + RED + '" opacity=".08"/>' + txt(x0 + 3, y0 - H + 10, "saturasi", { size: 9, a: "start", c: RED });
      s += line(X(0), Y(VCC / RC * 1000), X(VCC), Y(0), COP, 2.4) + txt(X(VCC), y0 + 26, "V_CC", { size: 9, c: COP });
      s += '<circle cx="' + X(r.VCE) + '" cy="' + Y(r.IC * 1000) + '" r="6" fill="' + (r.reg === "aktif" ? GRN : RED) + '" stroke="#fff" stroke-width="2"/>' + txt(X(r.VCE) + 8, Y(r.IC * 1000) - 8, "Q", { size: 12, b: 1, a: "start", c: r.reg === "aktif" ? GRN : RED });
      el.querySelector(".g").innerHTML = s + (r.IB > 0 ? (function () { var pq = []; for (var q2 = 0; q2 <= 60; q2++) { var vq = q2 / 60 * Vm, iq = b * r.IB * (1 + vq / 150) * (1 - Math.exp(-vq / 0.25)) * 1000; if (iq > Im) break; pq.push(X(vq) + "," + Y(iq)); } return poly(pq.join(" "), BLU, 1.8).replace("/>", ' stroke-dasharray="5 3"/>'); })() : "") + txt(x0, 208, "tembaga: garis beban · biru: kurva I_B saat ini", { size: 9.5, a: "start", c: MUT });
      var tag = r.reg === "aktif" ? '<span class="tag ok">AKTIF (penguat)</span>' : r.reg === "saturasi" ? '<span class="tag no">SATURASI (saklar ON)</span>' : '<span class="tag mid">CUT-OFF (saklar OFF)</span>';
      el.querySelector(".kr").innerHTML = tag + " I_B = (" + f(VBB, 1) + " − 0,7)/" + fR(RB) + " = <b>" + f(r.IB * 1e6, 1) + " µA</b> · β·I_B = " + f(b * r.IB * 1000, 2) + " mA · I_C(sat) = " + f(r.ICsat * 1000, 2) + " mA → I_C = <b>" + f(r.IC * 1000, 2) + " mA</b> · V_CE = <b>" + f(r.VCE, 2) + " V</b> · P_D = " + f(r.PD * 1000, 1) + " mW";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  A.bjtsaklar = function (el) {
    var on = true;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 210"><g class="c"></g></svg><div class="readout sr"></div><div class="ctrl"><button class="btn sm ghost" data-v="1">V_in = 5 V (HIGH)</button><button class="btn sm ghost" data-v="0">V_in = 0 V (LOW)</button></div><div class="ctrl">' + slider("R_B", 1, 100, 0.1, 4.7, "kΩ") + slider("β", 30, 300, 10, 100, "") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var RB = +ins[0].value * 1000, b = +ins[1].value; $$(el, ".val")[0].textContent = f(RB / 1000, 1); $$(el, ".val")[1].textContent = b;
      var VCC = 5, RC = 150, VL = 2, Vin = on ? 5 : 0, IB = Math.max(0, (Vin - 0.7) / RB), ICs = (VCC - VL - 0.2) / RC, IC = Math.min(b * IB, ICs), sat = b * IB >= ICs && IB > 0, VCE = IB > 0 ? (sat ? 0.2 : VCC - VL - IC * RC) : VCC - VL, glow = IC / ICs;
      var s = txt(30, 100, "V_in", { size: 10, a: "middle", b: 1 }) + '<rect x="14" y="106" width="34" height="20" rx="4" fill="' + (on ? COP : "#c7cfca") + '"/>' + txt(31, 120, on ? "5 V" : "0 V", { size: 10, c: "#fff", b: 1 }) + line(48, 116, 60, 116) + resH(60, 145, 116) + txt(102, 102, "R_B = " + fR(RB), { size: 10.5, b: 1 }) + line(145, 116, 156, 116);
      s += bjtSym(180, 116, false, IB > 0 ? COP : INK) + line(202, 76, 202, 120 - 44) + diodaV(202, 50, 76, 1, glow > 0.05 ? "#ef4444" : "#c7cfca") + resV(202, 10, 50) + txt(214, 30, "R_C = 150 Ω", { size: 10.5, b: 1, a: "start" }) + txt(222, 66, "LED merah", { size: 10, a: "start" }) + line(202, 156, 202, 190) + line(14, 190, 285, 190);
      if (glow > 0.05) s += '<circle cx="202" cy="63" r="' + (10 + 12 * glow) + '" fill="#ef4444" opacity="' + (0.15 + 0.35 * glow) + '"/>';
      s += line(202, 10, 285, 10) + batTopP(285, 10, 190, "5 V", true) + txt(31, 140, "", {}) + line(31, 126, 31, 190);
      el.querySelector(".c").innerHTML = s;
      var st = IB === 0 ? '<span class="tag mid">CUT-OFF: LED padam</span>' : sat ? '<span class="tag ok">SATURASI: LED menyala penuh</span>' : '<span class="tag no">AKTIF: LED redup, transistor panas</span>';
      el.querySelector(".sr").innerHTML = st + " I_B = " + f(IB * 1000, 3) + " mA · β·I_B = " + f(b * IB * 1000, 1) + " mA · I_C(sat) = " + f(ICs * 1000, 1) + " mA → I_C = <b>" + f(IC * 1000, 1) + " mA</b> · V_CE = " + f(VCE, 2) + " V · P_D = " + f(VCE * IC * 1000, 1) + " mW";
      $$(el, "[data-v]").forEach(function (x) { x.classList.toggle("on", (x.dataset.v === "1") === on); });
    }
    $$(el, "[data-v]").forEach(function (x) { x.onclick = function () { on = x.dataset.v === "1"; draw(); }; });
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  A.bjtpenguat = function (el) {
    var t = 0, play = true, RB = 10000, RC = 470, VCC = 10, b = 200;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 215"><g class="g"></g></svg><svg class="diag" viewBox="0 0 340 120"><g class="w"></g></svg><div class="readout pr"></div><div class="ctrl"><button class="btn sm ghost" data-a="p">❚❚</button>' + slider("V_BB (titik Q)", 0.8, 1.8, 0.05, 1.2, "V") + slider("v_in puncak", 0, 0.6, 0.02, 0.2, "V") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var VBB = +ins[0].value, va = +ins[1].value; $$(el, ".val")[0].textContent = f(VBB, 2); $$(el, ".val")[1].textContent = f(va, 2);
      var Q = solveCE(VBB, RB, RC, VCC, b), now = solveCE(VBB + va * Math.sin(2 * Math.PI * t), RB, RC, VCC, b);
      var x0 = 44, y0 = 180, W = 250, H = 150, Im = 25, X = function (v) { return x0 + v / 10 * W; }, Y = function (i) { return y0 - i / Im * H; }, s = axes(x0, y0, W, H, "V_CE (V)", "I_C (mA)");
      for (var v = 2; v <= 10; v += 2) s += txt(X(v), y0 + 14, v, { size: 9.5, c: MUT });
      for (var k = 1; k <= 5; k++) s += txt(x0 - 5, Y(k * 5) + 4, k * 5, { size: 9.5, a: "end", c: MUT });
      s += line(X(0), Y(VCC / RC * 1000), X(VCC), Y(0), COP, 2.4);
      var lo = solveCE(VBB - va, RB, RC, VCC, b), hi = solveCE(VBB + va, RB, RC, VCC, b);
      s += line(X(lo.VCE), Y(lo.IC * 1000), X(hi.VCE), Y(hi.IC * 1000), BLU, 6).replace("/>", ' opacity=".25" stroke-linecap="round"/>');
      s += '<circle cx="' + X(Q.VCE) + '" cy="' + Y(Q.IC * 1000) + '" r="5" fill="none" stroke="' + GRN + '" stroke-width="2"/>' + '<circle cx="' + X(now.VCE) + '" cy="' + Y(now.IC * 1000) + '" r="6" fill="' + BLU + '"/>' + txt(X(Q.VCE) + 8, Y(Q.IC * 1000) - 10, "Q", { size: 12, b: 1, a: "start", c: GRN });
      el.querySelector(".g").innerHTML = s + txt(x0, 208, "titik biru bergerak di garis beban mengikuti sinyal input", { size: 9.5, a: "start", c: MUT });
      var pi = [], po = [], x1 = 30, Wd = 290, clip = false;
      for (var n = 0; n <= 120; n++) { var tt = n / 120 * 2, vi = va * Math.sin(2 * Math.PI * tt), r2 = solveCE(VBB + vi, RB, RC, VCC, b); if (r2.reg !== "aktif") clip = true; pi.push((x1 + n / 120 * Wd) + "," + (60 - vi / 0.6 * 25)); po.push((x1 + n / 120 * Wd) + "," + (60 - (r2.VCE - Q.VCE) / 6 * 50)); }
      el.querySelector(".w").innerHTML = line(x1, 60, x1 + Wd, 60, "#c7cfca", 1) + poly(pi.join(" "), BLU, 1.8) + poly(po.join(" "), COP, 2.6) + txt(x1, 12, "v_in (biru) · perubahan V_CE (tembaga, terbalik)", { size: 9.5, a: "start", c: MUT });
      var Av = va > 0 ? (lo.VCE - hi.VCE) / (2 * va) : b * RC / RB;
      el.querySelector(".pr").innerHTML = "Q: I_C = " + f(Q.IC * 1000, 2) + " mA, V_CE = <b>" + f(Q.VCE, 2) + " V</b> · ayunan V_CE " + f(hi.VCE, 2) + "–" + f(lo.VCE, 2) + " V · penguatan ≈ <b>" + f(Av, 1) + "×</b> (perkiraan β·R_C/R_B = " + f(b * RC / RB, 1) + ")" + (clip ? ' · <span class="tag no">terpotong: Q terlalu dekat saturasi/cut-off atau sinyal terlalu besar</span>' : ' · <span class="tag ok">tidak terpotong</span>');
    }
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    ins.forEach(function (i) { i.addEventListener("input", draw); });
    draw(); loop(el, function (dt) { if (play) { t += dt * 0.4; draw(); } });
  };
  /* =================== ANIMASI MATERI 7: BIAS & PENGUAT BJT =================== */
  function capV(x, y) { return line(x - 13, y - 4, x + 13, y - 4, INK, 3) + line(x - 13, y + 4, x + 13, y + 4, INK, 3); }
  function gnd(x, y) { return line(x - 10, y, x + 10, y, INK, 2) + line(x - 6, y + 4, x + 6, y + 4, INK, 1.6) + line(x - 2, y + 8, x + 2, y + 8, INK, 1.4); }
  function vdbSVG(p, st) {   // bias pembagi tegangan: R1,R2,RC,RE (Ω), VCC
    st = st || {};
    var s = line(70, 15, 200, 15) + txt(135, 10, "+V_CC = " + f(p.VCC, 1) + " V", { size: 10.5, b: 1 }) + resV(70, 15, 100) + txt(82, 58, "R1 = " + fR(p.R1), { size: 10, a: "start", b: 1 }) + line(70, 100, 70, 120) + dot(70, 110) + resV(70, 120, 200) + txt(82, 162, "R2 = " + fR(p.R2), { size: 10, a: "start", b: 1 }) + gnd(70, 200);
    s += line(70, 110, 154, 110) + bjtSym(178, 110, false, COP, false) + resV(200, 15, 66) + line(200, 66, 200, 70) + txt(212, 42, "R_C = " + fR(p.RC), { size: 10, a: "start", b: 1 }) + line(200, 150, 200, 156) + resV(200, 156, 200) + txt(212, 182, "R_E = " + fR(p.RE), { size: 10, a: "start", b: 1 }) + gnd(200, 200);
    if (st.VB != null) s += txt(112, 126, "V_B = " + f(st.VB, 2) + " V", { size: 9.5, c: BLU, a: "middle" }) + txt(212, 150, "V_E = " + f(st.VE, 2) + " V", { size: 9.5, c: BLU, a: "start" }) + txt(212, 80, "V_C = " + f(st.VC, 2) + " V", { size: 9.5, c: BLU, a: "start" }) + txt(320, 116, "V_CE = " + f(st.VCE, 2) + " V", { size: 10.5, c: GRN, a: "end", b: 1 });
    return s;
  }
  function vdbHitung(R1, R2, RC, RE, VCC, b) {
    var VB = VCC * R2 / (R1 + R2), IEc = Math.max(0, (VB - 0.7) / RE), RTH = R1 * R2 / (R1 + R2), IEt = Math.max(0, (VB - 0.7) / (RE + RTH / b)), sat = VCC / (RC + RE);
    var IC = Math.min(IEt, (VCC - 0.2) / (RC + RE)), VE = IEt * RE, VC = VCC - IC * RC;
    return { VB: VB, IEc: IEc, IEt: IEt, RTH: RTH, IC: IC, VE: VE, VC: VC, VCE: VC - VE, VCEc: VCC - IEc * (RC + RE), sat: sat, stiff: b * RE >= 10 * R2 };
  }
  G.vdb = function (p) { return svg(340, 215, vdbSVG({ R1: +p.R1 || 10000, R2: +p.R2 || 5600, RC: +p.RC || 1000, RE: +p.RE || 560, VCC: +p.VCC || 10 })); };
  function ceampSVG(o) {
    o = o || {}; var on = o.C2 !== false;
    var s = acSrc(20, 110, 200) + txt(38, 160, "v_s", { size: 10, a: "start", b: 1 }) + line(20, 110, 28, 110) + resH(28, 66, 110) + txt(47, 98, "R_s", { size: 9.5 }) + line(66, 110, 82, 110) + capH(86, 110) + txt(86, 92, "C1", { size: 9.5, b: 1 }) + line(90, 110, 154, 110) + gnd(20, 200);
    s += line(110, 15, 200, 15) + txt(160, 10, "+V_CC", { size: 10, b: 1 }) + resV(110, 15, 100) + txt(98, 58, "R1", { size: 9.5, a: "end", b: 1 }) + line(110, 100, 110, 120) + dot(110, 110) + resV(110, 120, 200) + txt(98, 162, "R2", { size: 9.5, a: "end", b: 1 }) + gnd(110, 200);
    s += bjtSym(178, 110, false, COP, false) + resV(200, 15, 66) + line(200, 66, 200, 70) + txt(188, 42, "R_C", { size: 9.5, a: "end", b: 1 }) + dot(200, 68) + line(200, 68, 238, 68) + capH(242, 68) + txt(242, 52, "C3", { size: 9.5, b: 1 }) + line(246, 68, 300, 68);
    s += line(200, 150, 200, 156) + resV(200, 156, 200) + txt(188, 182, "R_E", { size: 9.5, a: "end", b: 1 }) + dot(200, 156) + line(200, 156, 240, 156) + line(240, 156, 240, 172) + (on ? capV(240, 176) : '<g opacity=".25">' + capV(240, 176) + "</g>") + line(240, 180, 240, 200) + txt(256, 180, on ? "C2" : "C2 (dilepas)", { size: 9.5, a: "start", b: 1, c: on ? INK : RED }) + gnd(200, 200) + gnd(240, 200);
    if (o.RL !== 0) s += resV(300, 68, 200) + txt(312, 136, o.RLlab || "R_L", { size: 9.5, a: "start", b: 1 }) + gnd(300, 200); else s += txt(304, 72, "v_out", { size: 10, a: "start", b: 1, c: COP });
    return s;
  }
  G.ceamp = function (p) { return svg(340, 215, ceampSVG({ C2: p.C2 !== "tidak", RL: p.RL === "tidak" ? 0 : 1 })); };
  G.vdbcfg = function (p) {   // ilustrasi metode bias lain
    var m = p.m || "base", s = "";
    if (m === "base") s = line(70, 15, 200, 15) + resV(70, 15, 110) + txt(82, 64, "R_B", { size: 10.5, a: "start", b: 1 }) + line(70, 110, 154, 110) + bjtSym(178, 110, false, COP, false) + resV(200, 15, 70) + txt(212, 44, "R_C", { size: 10.5, a: "start", b: 1 }) + line(200, 150, 200, 190) + gnd(200, 190);
    if (m === "emfb") s = line(70, 15, 200, 15) + resV(70, 15, 110) + txt(82, 64, "R_B", { size: 10.5, a: "start", b: 1 }) + line(70, 110, 154, 110) + bjtSym(178, 110, false, COP, false) + resV(200, 15, 70) + txt(212, 44, "R_C", { size: 10.5, a: "start", b: 1 }) + resV(200, 150, 195) + txt(212, 175, "R_E", { size: 10.5, a: "start", b: 1 }) + gnd(200, 195);
    if (m === "cfb") s = line(130, 15, 200, 15) + resV(200, 15, 62) + txt(212, 40, "R_C", { size: 10.5, a: "start", b: 1 }) + line(200, 62, 200, 70) + dot(200, 64) + line(200, 64, 70, 64) + resV(70, 64, 110) + txt(58, 90, "R_B", { size: 10.5, a: "end", b: 1 }) + line(70, 110, 154, 110) + bjtSym(178, 110, false, COP, false) + line(200, 150, 200, 190) + gnd(200, 190) + txt(165, 10, "+V_CC", { size: 10, b: 1 });
    if (m === "eb") s = line(200, 15, 260, 15) + txt(262, 18, "+V_CC", { size: 10, a: "start", b: 1 }) + resV(200, 15, 70) + txt(212, 44, "R_C", { size: 10.5, a: "start", b: 1 }) + gnd(70, 160) + resV(70, 110, 160) + line(70, 110, 154, 110) + txt(58, 138, "R_B", { size: 10.5, a: "end", b: 1 }) + bjtSym(178, 110, false, COP, false) + resV(200, 150, 200) + txt(212, 178, "R_E", { size: 10.5, a: "start", b: 1 }) + line(200, 200, 260, 200) + txt(262, 204, "−V_EE", { size: 10, a: "start", b: 1 });
    if (m !== "cfb" && m !== "eb") s += txt(135, 10, "+V_CC", { size: 10, b: 1 });
    return svg(340, 210, s);
  };
  A.vdbsim = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 215"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 200"><g class="g"></g></svg><table class="tabel small vt" style="margin:4px 0"></table><div class="ctrl">' + slider("R1", 1, 100, 0.1, 10, "kΩ") + slider("R2", 1, 47, 0.1, 5.6, "kΩ") + slider("β", 50, 400, 10, 100, "") + '</div><div class="ctrl">' + slider("R_C", 0.1, 5, 0.1, 1, "kΩ") + slider("R_E", 0.1, 3, 0.01, 0.56, "kΩ") + slider("V_CC", 5, 20, 1, 10, "V") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var v = ins.map(function (i) { return +i.value; }), R1 = v[0] * 1000, R2 = v[1] * 1000, b = v[2], RC = v[3] * 1000, RE = v[4] * 1000, VCC = v[5];
      [f(v[0], 1), f(v[1], 1), b, f(v[3], 1), f(v[4], 2), VCC].forEach(function (x, i) { $$(el, ".val")[i].textContent = x; });
      var r = vdbHitung(R1, R2, RC, RE, VCC, b), r2 = vdbHitung(R1, R2, RC, RE, VCC, b * 2);
      el.querySelector(".c").innerHTML = vdbSVG({ R1: R1, R2: R2, RC: RC, RE: RE, VCC: VCC }, { VB: r.VB, VE: r.VE, VC: r.VC, VCE: r.VCE });
      var x0 = 44, y0 = 170, W = 250, H = 140, Im = r.sat * 1000 * 1.15, X = function (x) { return x0 + x / VCC * W; }, Y = function (i) { return y0 - i / Im * H; }, s = axes(x0, y0, W, H, "V_CE (V)", "I_C (mA)");
      s += line(X(0), Y(r.sat * 1000), X(VCC), Y(0), COP, 2.4) + txt(x0 - 4, Y(r.sat * 1000) + 4, f(r.sat * 1000, 2), { size: 9.5, a: "end", c: COP }) + txt(X(VCC), y0 + 14, f(VCC, 0) + " V", { size: 9.5, c: COP });
      s += '<circle cx="' + X(r2.VCE) + '" cy="' + Y(r2.IC * 1000) + '" r="5" fill="none" stroke="' + BLU + '" stroke-width="2"/>' + '<circle cx="' + X(Math.max(0, r.VCE)) + '" cy="' + Y(r.IC * 1000) + '" r="6" fill="' + GRN + '"/>' + txt(X(Math.max(0, r.VCE)) + 8, Y(r.IC * 1000) - 8, "Q", { size: 12, b: 1, a: "start", c: GRN }) + txt(x0, 196, "lingkaran biru = Q bila β digandakan", { size: 9.5, a: "start", c: MUT });
      el.querySelector(".g").innerHTML = s;
      var dP = (r2.IC - r.IC) / r.IC * 100;
      el.querySelector(".vt").innerHTML = "<tr><th></th><th>Cara cepat (I_B diabaikan)</th><th>Thevenin (akurat)</th></tr><tr><td>I_E ≈ I_C</td><td>" + f(r.IEc * 1000, 2) + " mA</td><td><b>" + f(r.IEt * 1000, 2) + " mA</b></td></tr><tr><td>V_CE</td><td>" + f(r.VCEc, 2) + " V</td><td><b>" + f(r.VCE, 2) + " V</b></td></tr><tr><td colspan=3>" + (r.stiff ? '<span class="tag ok">β·R_E = ' + fR(b * RE) + " ≥ 10·R2 = " + fR(10 * R2) + ": pembagi \"kaku\", cara cepat valid</span>" : '<span class="tag mid">β·R_E = ' + fR(b * RE) + " &lt; 10·R2 = " + fR(10 * R2) + ": pakai Thevenin</span>") + " · β ×2 → I_C berubah <b>" + f(dP, 1) + "%</b>" + (r.VCE < 0.3 ? ' · <span class="tag no">saturasi</span>' : "") + "</td></tr>";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  A.biasbanding = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 210"><g class="c"></g></svg><div class="readout bb"></div><div class="ctrl">' + slider("β transistor pengganti", 50, 400, 10, 200, "") + "</div>";
    var sl = el.querySelector("input");
    var M = [
      ["Base bias", function (b) { return b * (12 - 0.7) / 330000; }],
      ["Emitter-feedback", function (b) { return (12 - 0.7) / (1000 + 470000 / b); }],
      ["Collector-feedback", function (b) { return (10 - 0.7) / (10000 + 180000 / b); }],
      ["Emitter bias", function (b) { return (10 - 0.7) / (10000 + 100000 / b); }],
      ["Pembagi tegangan", function (b) { return (3.59 - 0.7) / (560 + 3590 / b); }]];
    function draw() {
      var b = +sl.value; el.querySelector(".val").textContent = b;
      var s = txt(10, 14, "Perubahan I_C bila β = 100 diganti β = " + b, { size: 10.5, a: "start", b: 1 }), x0 = 130, W = 180, mx = 200;
      M.forEach(function (m, i) {
        var d = (m[1](b) - m[1](100)) / m[1](100) * 100, w = Math.min(W, Math.abs(d) / mx * W), y = 34 + i * 34, c = Math.abs(d) < 10 ? GRN : Math.abs(d) < 40 ? COP : RED;
        s += txt(x0 - 8, y + 14, m[0], { size: 10.5, a: "end", b: 1 }) + '<rect x="' + (d >= 0 ? x0 : x0 - w) + '" y="' + y + '" width="' + Math.max(1, w) + '" height="20" rx="4" fill="' + c + '"/>' + txt(x0 + (d >= 0 ? w + 6 : 6), y + 14, (d >= 0 ? "+" : "") + f(d, 1) + "%", { size: 10.5, a: "start" });
      });
      el.querySelector(".c").innerHTML = s + line(x0, 30, x0, 204, INK, 1);
      el.querySelector(".bb").innerHTML = "Angka memakai komponen contoh di slide masing-masing. Makin pendek batang, makin stabil titik Q terhadap pergantian transistor atau perubahan suhu.";
    }
    sl.addEventListener("input", draw); draw();
  };
  A.ceamp = function (el) {
    var c2 = true, t = 0, play = true, RLs = [0, 10000, 5000, 1000, 100, 8], RC = 1000, RE = 560, re = 6.58;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 215"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 130"><g class="w"></g></svg><div class="readout ca"></div><div class="ctrl"><button class="btn sm ghost" data-c="1">C2 terpasang</button><button class="btn sm ghost" data-c="0">C2 dilepas</button><button class="btn sm ghost" data-a="p">❚❚</button></div><div class="ctrl">' + slider("R_L", 0, 5, 1, 0, "") + slider("v_b puncak", 1, 40, 1, 10, "mV") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var RL = RLs[+ins[0].value], vb = +ins[1].value / 1000, lab = RL ? fR(RL) : "tanpa beban";
      $$(el, ".val")[0].textContent = lab; $$(el, ".val")[1].textContent = vb * 1000;
      var Rc = RL ? RC * RL / (RC + RL) : RC, Av = Rc / (re + (c2 ? 0 : RE)), vc = Av * vb, lim = Math.min(3.58e-3 * Rc, 6.42 - 0.3), clip = vc > lim;
      el.querySelector(".c").innerHTML = ceampSVG({ C2: c2, RL: RL ? 1 : 0, RLlab: "R_L = " + lab });
      var x0 = 20, W = 300, pi = [], po = [], sc = 50 / Math.max(vc, vb * 1, 0.05);
      for (var k = 0; k <= 200; k++) { var th = k / 200 * 4 * Math.PI + t, vi = vb * Math.sin(th), vo = -Math.max(-lim, Math.min(lim, vc * Math.sin(th))); pi.push((x0 + k / 200 * W) + "," + (65 - vi / vb * 12)); po.push((x0 + k / 200 * W) + "," + (65 - vo / Math.max(vc, lim) * 50)); }
      el.querySelector(".w").innerHTML = line(x0, 65, x0 + W, 65, "#c7cfca", 1) + poly(pi.join(" "), BLU, 1.8) + poly(po.join(" "), COP, 2.6) + txt(x0, 12, "v_b (biru, diperbesar) · v_out (tembaga, terbalik)", { size: 9.5, a: "start", c: MUT });
      el.querySelector(".ca").innerHTML = "R_c = " + (RL ? "R_C ∥ R_L = " : "R_C = ") + f(Rc, 1) + " Ω · A_v = R_c/(r'_e" + (c2 ? "" : " + R_E") + ") = " + f(Rc, 1) + "/" + f(re + (c2 ? 0 : RE), 2) + " = <b>" + f(Av, 2) + "</b> · v_out = <b>" + f(Math.min(vc, lim), 3) + " V</b> puncak" + (clip ? ' · <span class="tag no">terpotong: ayunan maksimum ≈ ' + f(lim, 2) + " V</span>" : "");
      $$(el, "[data-c]").forEach(function (x) { x.classList.toggle("on", (x.dataset.c === "1") === c2); });
    }
    $$(el, "[data-c]").forEach(function (x) { x.onclick = function () { c2 = x.dataset.c === "1"; draw(); }; });
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    ins.forEach(function (i) { i.addEventListener("input", draw); });
    draw(); loop(el, function (dt) { if (play) { t += dt * 2; draw(); } });
  };
  /* =================== ANIMASI MATERI 8: FET =================== */
  function jfetSym(x, y, p, c, lab) {   // gate di (x-26,y); drain (x+22,y-40); source (x+22,y+40)
    c = c || INK; var s = line(x, y - 24, x, y + 24, c, 3.4) + line(x, y - 16, x + 22, y - 16, c) + line(x + 22, y - 16, x + 22, y - 40, c) + line(x, y + 16, x + 22, y + 16, c) + line(x + 22, y + 16, x + 22, y + 40, c) + line(x - 26, y + 8, x, y + 8, c);
    s += p ? '<polygon points="' + (x - 18) + "," + (y + 3) + " " + (x - 18) + "," + (y + 13) + " " + (x - 7) + "," + (y + 8) + '" fill="' + c + '" transform="rotate(180 ' + (x - 13) + " " + (y + 8) + ')"/>' : '<polygon points="' + (x - 13) + "," + (y + 3) + " " + (x - 13) + "," + (y + 13) + " " + (x - 2) + "," + (y + 8) + '" fill="' + c + '"/>';
    if (lab !== false) s += txt(x - 30, y + 4, "G", { size: 10, a: "end", c: MUT }) + txt(x + 28, y - 32, "D", { size: 10, a: "start", c: MUT }) + txt(x + 28, y + 38, "S", { size: 10, a: "start", c: MUT });
    return s;
  }
  function mosSym(x, y, tipe, p, c, lab) {   // tipe "e" atau "d"
    c = c || INK; var s = line(x - 8, y - 20, x - 8, y + 20, c, 2.6) + line(x - 30, y + 14, x - 8, y + 14, c);
    s += tipe === "e" ? line(x, y - 22, x, y - 10, c, 3.4) + line(x, y - 5, x, y + 5, c, 3.4) + line(x, y + 10, x, y + 22, c, 3.4) : line(x, y - 22, x, y + 22, c, 3.4);
    s += line(x, y - 16, x + 22, y - 16, c) + line(x + 22, y - 16, x + 22, y - 40, c) + line(x, y + 16, x + 22, y + 16, c) + line(x + 22, y + 16, x + 22, y + 40, c) + line(x, y, x + 22, y, c) + line(x + 22, y, x + 22, y + 16, c);
    s += p ? '<polygon points="' + (x + 4) + "," + y + " " + (x + 14) + "," + (y - 5) + " " + (x + 14) + "," + (y + 5) + '" fill="' + c + '" transform="rotate(180 ' + (x + 9) + " " + y + ')"/>' : '<polygon points="' + (x + 2) + "," + y + " " + (x + 12) + "," + (y - 5) + " " + (x + 12) + "," + (y + 5) + '" fill="' + c + '"/>';
    if (lab !== false) s += txt(x - 34, y + 18, "G", { size: 10, a: "end", c: MUT }) + txt(x + 28, y - 32, "D", { size: 10, a: "start", c: MUT }) + txt(x + 28, y + 38, "S", { size: 10, a: "start", c: MUT });
    return s;
  }
  G.fetsimbol = function () {
    var s = jfetSym(50, 70, false, COP) + jfetSym(130, 70, true, COP) + mosSym(220, 70, "e", false, COP) + mosSym(305, 70, "d", false, COP);
    s += txt(60, 136, "JFET-n", { size: 10.5, b: 1 }) + txt(140, 136, "JFET-p", { size: 10.5, b: 1 }) + txt(230, 136, "E-MOSFET", { size: 10.5, b: 1 }) + txt(312, 136, "D-MOSFET", { size: 10.5, b: 1 });
    s += txt(60, 150, "panah masuk", { size: 9, c: MUT }) + txt(140, 150, "panah keluar", { size: 9, c: MUT }) + txt(230, 150, "kanal terputus", { size: 9, c: MUT }) + txt(312, 150, "kanal utuh", { size: 9, c: MUT });
    return svg(340, 160, s);
  };
  function jfetCkt(p, mode, st) {   // mode "self" / "vdb"
    st = st || {};
    var s = line(120, 15, 200, 15) + txt(160, 10, "+V_DD = " + f(p.VDD, 1) + " V", { size: 10.5, b: 1 }) + resV(200, 15, 66) + txt(212, 42, "R_D = " + fR(p.RD), { size: 10, a: "start", b: 1 }) + line(200, 66, 200, 70) + jfetSym(178, 110, false, COP, false) + line(200, 150, 200, 156) + resV(200, 156, 200) + txt(212, 182, "R_S = " + fR(p.RS), { size: 10, a: "start", b: 1 }) + gnd(200, 200);
    s += line(152, 118, 120, 118) + dot(120, 118) + resV(120, 128, 200) + line(120, 118, 120, 128) + gnd(120, 200);
    if (mode === "vdb") s += resV(120, 15, 108) + line(120, 108, 120, 118) + txt(108, 62, "R1 = " + fR(p.R1), { size: 10, a: "end", b: 1 }) + txt(108, 166, "R2 = " + fR(p.R2), { size: 10, a: "end", b: 1 });
    else s += txt(108, 166, "R_G = " + fR(p.RG || 10e6), { size: 10, a: "end", b: 1 });
    if (st.ID != null) s += txt(212, 80, "V_D = " + f(st.VD, 2) + " V", { size: 9.5, a: "start", c: BLU }) + txt(212, 150, "V_S = " + f(st.VS, 2) + " V", { size: 9.5, a: "start", c: BLU }) + txt(150, 136, "V_G = " + f(st.VG, 2) + " V", { size: 9.5, a: "end", c: BLU }) + txt(330, 116, "I_D = " + f(st.ID * 1000, 2) + " mA", { size: 10.5, a: "end", b: 1, c: GRN });
    return s;
  }
  G.jfetbias = function (p) { return svg(340, 215, jfetCkt({ VDD: +p.VDD || 15, RD: +p.RD || 1000, RS: +p.RS || 220, RG: +p.RG || 10e6, R1: +p.R1 || 6.8e6, R2: +p.R2 || 1e6 }, p.mode || "self")); };
  function shockley(VGS, IDSS, VGSoff) { if (VGS <= VGSoff) return 0; return IDSS * Math.pow(1 - VGS / VGSoff, 2); }
  A.jfetkanal = function (el) {
    var t = 0, IDSS = 12, Voff = -4;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 200"><g class="c"></g></svg><div class="readout jr"></div><div class="ctrl">' + slider("V_GS", -4, 0, 0.1, 0, "V") + slider("V_DS", 0, 15, 0.1, 8, "V") + "</div>";
    var ins = $$(el, "input");
    function draw(dt) {
      var VGS = +ins[0].value, VDS = +ins[1].value; $$(el, ".val")[0].textContent = f(VGS, 1); $$(el, ".val")[1].textContent = f(VDS, 1);
      var VP = -Voff, sat = VDS >= VGS - Voff, ID = VGS <= Voff ? 0 : sat ? shockley(VGS, IDSS, Voff) : IDSS * (2 * (1 - VGS / Voff) * (VDS / VP) - Math.pow(VDS / VP, 2));
      var x0 = 60, x1 = 280, yc = 100, H = 40, s = '<rect x="' + x0 + '" y="' + (yc - H) + '" width="' + (x1 - x0) + '" height="' + 2 * H + '" fill="#e3ecfb" stroke="#9aa5a0"/>';
      var top = [], bot = [];
      for (var k = 0; k <= 20; k++) { var u = k / 20, vloc = Math.min(VDS, VP) * u, w = Math.min(H, H * 0.25 + H * 0.75 * Math.sqrt(Math.max(0, (vloc - VGS)) / VP)); top.push((x0 + u * (x1 - x0)) + "," + (yc - H + w)); bot.push((x0 + u * (x1 - x0)) + "," + (yc + H - w)); }
      s += '<polygon points="' + x0 + "," + (yc - H) + " " + top.join(" ") + " " + x1 + "," + (yc - H) + '" fill="#fffdf6" stroke="' + COP + '" stroke-dasharray="4 3"/>' + '<polygon points="' + x0 + "," + (yc + H) + " " + bot.join(" ") + " " + x1 + "," + (yc + H) + '" fill="#fffdf6" stroke="' + COP + '" stroke-dasharray="4 3"/>';
      s += '<rect x="120" y="' + (yc - H - 16) + '" width="100" height="16" fill="#f6e7d8" stroke="#9aa5a0"/><rect x="120" y="' + (yc + H) + '" width="100" height="16" fill="#f6e7d8" stroke="#9aa5a0"/>' + txt(170, yc - H - 4, "P (gate)", { size: 9.5, b: 1 }) + txt(170, yc + H + 12, "P (gate)", { size: 9.5, b: 1 });
      s += txt(x0 - 6, yc + 4, "S", { size: 12, a: "end", b: 1 }) + txt(x1 + 6, yc + 4, "D", { size: 12, a: "start", b: 1 }) + txt(170, yc + 4, "kanal n", { size: 10, c: MUT });
      t += (dt || 0) * ID / IDSS * 1.2; for (var i = 0; i < 14; i++) { var u2 = ((i / 14) + t) % 1, X = x0 + u2 * (x1 - x0); s += '<circle cx="' + X + '" cy="' + (yc + ((i % 3) - 1) * 6) + '" r="3" fill="' + BLU + '"/>'; }
      s += txt(170, 190, "daerah deplesi (putus-putus) melebar bila V_GS makin negatif", { size: 9.5, c: MUT });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".jr").innerHTML = (VGS <= Voff ? '<span class="tag mid">CUT-OFF: kanal tertutup</span>' : sat ? '<span class="tag ok">Arus konstan (V_DS ≥ V_GS − V_GS(off))</span>' : '<span class="tag no">Daerah ohmik (V_DS kecil)</span>') + " I_DSS = 12 mA, V_GS(off) = −4 V · I_D = <b>" + f(ID, 2) + " mA</b>" + (sat && VGS > Voff ? " = I_DSS(1 − V_GS/V_GS(off))²" : "");
    }
    ins.forEach(function (i) { i.addEventListener("input", function () { draw(0); }); });
    draw(0); loop(el, function (dt) { draw(dt); });
  };
  A.jfetkurva = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 210"><g class="g"></g></svg><div class="readout kr"></div><div class="ctrl">' + slider("I_DSS", 2, 20, 1, 9, "mA") + slider("V_GS(off)", -10, -1, 0.5, -8, "V") + slider("V_GS", -10, 0, 0.1, -1, "V") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var IDSS = +ins[0].value, Vo = +ins[1].value; ins[2].min = Vo; var VGS = Math.max(Vo, +ins[2].value); $$(el, ".val")[0].textContent = IDSS; $$(el, ".val")[1].textContent = f(Vo, 1); $$(el, ".val")[2].textContent = f(VGS, 1);
      var ID = shockley(VGS, IDSS, Vo), xm = 165, y0 = 175, H = 140, Wl = 130, Wr = 140, Y = function (i) { return y0 - i / IDSS * H * 0.95; };
      var s = line(20, y0, xm, y0, INK, 1.5) + line(xm, y0, xm, 25, INK, 1.5) + line(xm, y0, xm + Wr, y0, INK, 1.5) + txt(30, y0 + 16, "V_GS(off)", { size: 9.5, c: MUT, a: "start" }) + txt(xm - 4, y0 + 16, "0", { size: 9.5, c: MUT, a: "end" }) + txt(25, 34, "kurva transfer", { size: 10, b: 1, a: "start" }) + txt(xm + Wr, 34, "kurva drain", { size: 10, b: 1, a: "end" }) + txt(xm + 4, 22, "I_D", { size: 10, a: "start" }) + txt(xm + Wr, y0 + 16, "V_DS", { size: 9.5, a: "end", c: MUT });
      var pt = []; for (var k = 0; k <= 50; k++) { var v = Vo + (0 - Vo) * k / 50; pt.push((xm - (v / Vo) * Wl) + "," + Y(shockley(v, IDSS, Vo))); }
      s += poly(pt.join(" "), COP, 2.8) + txt(xm - 6, Y(IDSS) + 4, "I_DSS", { size: 9.5, a: "end", c: COP });
      var xq = xm - (VGS / Vo) * Wl; s += line(xq, y0, xq, Y(ID), BLU, 1).replace("/>", ' stroke-dasharray="3 3"/>') + line(xq, Y(ID), xm + Wr, Y(ID), BLU, 1).replace("/>", ' stroke-dasharray="3 3"/>') + '<circle cx="' + xq + '" cy="' + Y(ID) + '" r="5" fill="' + BLU + '"/>';
      [0, 0.25, 0.5, 0.75].forEach(function (fr) { var vg = Vo * fr, idd = shockley(vg, IDSS, Vo), vp = -(Vo - vg) / 1, pts = []; for (var q = 0; q <= 30; q++) { var vd = q / 30 * 15, idv = vd < vp ? IDSS * (2 * (1 - vg / Vo) * (vd / -Vo) - Math.pow(vd / -Vo, 2)) : idd; pts.push((xm + vd / 15 * Wr) + "," + Y(Math.max(0, Math.min(idv, idd)))); } s += poly(pts.join(" "), "#9aa5a0", 1.3); });
      var ptsq = []; for (var q2 = 0; q2 <= 30; q2++) { var vd2 = q2 / 30 * 15, vp2 = VGS - Vo, idv2 = vd2 < vp2 ? IDSS * (2 * (1 - VGS / Vo) * (vd2 / -Vo) - Math.pow(vd2 / -Vo, 2)) : ID; ptsq.push((xm + vd2 / 15 * Wr) + "," + Y(Math.max(0, Math.min(idv2, ID)))); }
      s += poly(ptsq.join(" "), BLU, 2.2);
      el.querySelector(".g").innerHTML = s;
      el.querySelector(".kr").innerHTML = "I_D = I_DSS(1 − V_GS/V_GS(off))² = " + IDSS + " × (1 − " + f(VGS, 1) + "/" + f(Vo, 1) + ")² = " + IDSS + " × " + f(Math.pow(1 - VGS / Vo, 2), 4) + " = <b>" + f(ID, 3) + " mA</b> · g_m = " + f(2 * IDSS / -Vo * (1 - VGS / Vo), 3) + " mS";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  A.jfetbiasim = function (el) {
    var mode = el.dataset.mode || "self", IDSS = 12e-3, Vo = -4;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 215"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 180"><g class="g"></g></svg><div class="readout br"></div><div class="ctrl"><button class="btn sm ghost" data-m="self">Self-bias</button><button class="btn sm ghost" data-m="vdb">Pembagi tegangan</button></div><div class="ctrl">' + slider("R_S", 50, 3000, 10, 330, "Ω") + slider("V_G (pembagi)", 0, 6, 0.1, 2, "V") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var RS = +ins[0].value, VG = mode === "vdb" ? +ins[1].value : 0; $$(el, ".val")[0].textContent = RS; $$(el, ".val")[1].textContent = f(VG, 1);
      var lo = Vo, hi = 0; for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2, idm = shockley(m, IDSS, Vo); if (VG - idm * RS > m) lo = m; else hi = m; }   // V_GS = V_G − I_D·R_S
      var VGS = (lo + hi) / 2, ID = shockley(VGS, IDSS, Vo), VDD = 15, RD = 560, VS = ID * RS, VD = VDD - ID * RD;
      el.querySelector(".c").innerHTML = jfetCkt({ VDD: VDD, RD: RD, RS: RS, R1: 6.8e6, R2: 1e6 }, mode, { ID: ID, VD: VD, VS: VS, VG: VG });
      var x0 = 30, xm = 230, y0 = 160, W = xm - x0, H = 130, X = function (v) { return xm + v / -Vo * W; }, Y = function (i) { return y0 - i / IDSS * H; }, s = line(x0, y0, 330, y0, INK, 1.5) + line(xm, y0, xm, 20, INK, 1.5) + txt(xm + 4, 18, "I_D", { size: 10, a: "start" }) + txt(x0, y0 + 14, "−4 V", { size: 9.5, c: MUT, a: "start" }) + txt(330, y0 + 14, "V_GS", { size: 9.5, c: MUT, a: "end" });
      var pt = []; for (var k = 0; k <= 50; k++) { var v = Vo * (1 - k / 50); pt.push(X(v) + "," + Y(shockley(v, IDSS, Vo))); } s += poly(pt.join(" "), COP, 2.8);
      var vA = Vo * 1.05, vB = Math.min(VG, 4); s += line(X(vA), Y((VG - vA) / RS), X(vB), Y(Math.max(0, (VG - vB) / RS)), BLU, 2).replace("/>", ' stroke-dasharray="6 3"/>');
      s += '<circle cx="' + X(VGS) + '" cy="' + Y(ID) + '" r="6" fill="' + GRN + '"/>' + txt(X(VGS) - 8, Y(ID) - 8, "Q", { size: 12, b: 1, a: "end", c: GRN }) + txt(x0, 14, "tembaga: kurva transfer · biru: garis bias", { size: 9.5, a: "start", c: MUT });
      el.querySelector(".g").innerHTML = s;
      el.querySelector(".br").innerHTML = "I_DSS = 12 mA, V_GS(off) = −4 V · garis bias: V_GS = " + (mode === "vdb" ? "V_G − " : "−") + "I_D·R_S · Q: V_GS = <b>" + f(VGS, 2) + " V</b>, I_D = <b>" + f(ID * 1000, 2) + " mA</b> · V_DS = " + f(VD - VS, 2) + " V" + (VD - VS < VGS - Vo ? ' <span class="tag no">ohmik</span>' : "");
      $$(el, "[data-m]").forEach(function (x) { x.classList.toggle("on", x.dataset.m === mode); });
    }
    $$(el, "[data-m]").forEach(function (x) { x.onclick = function () { mode = x.dataset.m; draw(); }; });
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  A.mosfet = function (el) {
    var tipe = "e";
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 170"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 170"><g class="g"></g></svg><div class="readout mr"></div><div class="ctrl"><button class="btn sm ghost" data-t="e">E-MOSFET</button><button class="btn sm ghost" data-t="d">D-MOSFET</button></div><div class="ctrl">' + slider("V_GS", -8, 10, 0.1, 5, "V") + "</div>";
    var sl = el.querySelector("input");
    function draw() {
      var VGS = +sl.value; el.querySelector(".val").textContent = f(VGS, 1);
      var ID, chan, th = 1, K = 500 / 81, IDSS = 10, Vo = -8;
      if (tipe === "e") { ID = VGS > th ? K * Math.pow(VGS - th, 2) : 0; chan = VGS > th ? Math.min(1, (VGS - th) / 6) : 0; }
      else { ID = VGS <= Vo ? 0 : IDSS * Math.pow(1 - VGS / Vo, 2); chan = Math.max(0, Math.min(1, (VGS - Vo) / 12)); }
      var s = '<rect x="40" y="70" width="260" height="80" fill="#f6e7d8" stroke="#9aa5a0"/>' + txt(170, 145, "substrat tipe-p", { size: 10, c: MUT }) + '<rect x="40" y="70" width="60" height="28" fill="#e3ecfb" stroke="#9aa5a0"/><rect x="240" y="70" width="60" height="28" fill="#e3ecfb" stroke="#9aa5a0"/>' + txt(70, 89, "n+ S", { size: 10.5, b: 1 }) + txt(270, 89, "n+ D", { size: 10.5, b: 1 });
      s += '<rect x="100" y="56" width="140" height="10" fill="#d1d5db" stroke="#9aa5a0"/>' + txt(170, 64, "SiO₂", { size: 8.5 }) + '<rect x="100" y="40" width="140" height="16" fill="#9aa5a0"/>' + txt(170, 52, "Gate (logam)", { size: 9.5, c: "#fff", b: 1 });
      if (tipe === "d") s += '<rect x="100" y="70" width="140" height="' + (4 + chan * 12) + '" fill="#bcd2f7" opacity=".9"/>' + txt(170, 110, chan > 0.66 ? "kanal diperkaya (enhancement)" : chan > 0.02 ? "kanal n bawaan (deplesi)" : "kanal habis", { size: 9.5, c: BLU });
      else if (chan > 0) s += '<rect x="100" y="70" width="140" height="' + (3 + chan * 12) + '" fill="#bcd2f7" opacity=".9"/>' + txt(170, 110, "lapisan inversi n terbentuk", { size: 9.5, c: BLU });
      else s += txt(170, 110, "belum ada kanal (V_GS < V_GS(th))", { size: 9.5, c: RED });
      s += txt(170, 22, "V_GS = " + f(VGS, 1) + " V", { size: 11, b: 1, c: VGS >= 0 ? COP : BLU });
      el.querySelector(".c").innerHTML = s;
      var xm = tipe === "e" ? 60 : 200, y0 = 150, x0 = 30, x1 = 320, Im = tipe === "e" ? 500 : 30, X = function (v) { return tipe === "e" ? xm + v / 10 * (x1 - xm) : xm + v / 10 * (x1 - xm) * 1.2; }, Y = function (i) { return y0 - Math.min(i, Im) / Im * 125; };
      var g = line(x0, y0, x1, y0, INK, 1.5) + line(xm, y0, xm, 18, INK, 1.5) + txt(xm + 4, 16, "I_D (mA)", { size: 9.5, a: "start" }) + txt(x1, y0 + 14, "V_GS", { size: 9.5, a: "end", c: MUT }) + txt(xm, y0 + 14, "0", { size: 9.5, c: MUT }), pts = [];
      for (var k = 0; k <= 80; k++) { var v = tipe === "e" ? k / 80 * 10 : -8 + k / 80 * 14, i = tipe === "e" ? (v > th ? K * Math.pow(v - th, 2) : 0) : (v <= Vo ? 0 : IDSS * Math.pow(1 - v / Vo, 2)); if (i > Im) break; pts.push(X(v) + "," + Y(i)); }
      g += poly(pts.join(" "), COP, 2.8) + '<circle cx="' + X(VGS) + '" cy="' + Y(ID) + '" r="5" fill="' + BLU + '"/>';
      if (tipe === "e") g += txt(X(th), y0 + 14, "V_GS(th)", { size: 9, c: RED }); else g += txt(xm - 4, Y(IDSS) + 4, "I_DSS", { size: 9.5, a: "end", c: COP }) + txt(X(-8), y0 + 14, "V_GS(off)", { size: 9, c: RED });
      el.querySelector(".g").innerHTML = g;
      el.querySelector(".mr").innerHTML = tipe === "e" ? "E-MOSFET (2N7008: V_GS(th) = 1 V, K = 6,17 mA/V²) · I_D = K(V_GS − V_GS(th))² = <b>" + f(ID, 1) + " mA</b>" + (VGS <= th ? " (OFF)" : "") : "D-MOSFET (I_DSS = 10 mA, V_GS(off) = −8 V) · I_D = I_DSS(1 − V_GS/V_GS(off))² = <b>" + f(ID, 2) + " mA</b> · mode " + (VGS < 0 ? "deplesi" : "enhancement");
      $$(el, "[data-t]").forEach(function (x) { x.classList.toggle("on", x.dataset.t === tipe); });
    }
    $$(el, "[data-t]").forEach(function (x) { x.onclick = function () { tipe = x.dataset.t; sl.value = tipe === "e" ? 5 : -3; draw(); }; });
    sl.addEventListener("input", draw); draw();
  };
  A.mosfetsaklar = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 200"><g class="c"></g></svg><table class="tabel small ms" style="margin:4px 0"></table><div class="ctrl">' + slider("V_GS dari pin", 0, 10, 0.1, 5, "V") + slider("I beban", 0.5, 10, 0.5, 3, "A") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var VGS = +ins[0].value, IL = +ins[1].value; $$(el, ".val")[0].textContent = f(VGS, 1); $$(el, ".val")[1].textContent = f(IL, 1);
      var th = 1.5, Ron = VGS <= th ? Infinity : VGS >= 4.5 ? 0.025 : 0.025 * Math.pow(3 / (VGS - th), 2), I = isFinite(Ron) ? IL : 0, P = I * I * (isFinite(Ron) ? Ron : 0), Pbjt = IL * 0.3;
      var glow = I / IL, s = line(150, 15, 280, 15) + txt(215, 10, "+12 V", { size: 10, b: 1 }) + '<rect x="185" y="22" width="30" height="44" rx="4" fill="' + (glow > 0.9 ? "#fde68a" : glow > 0.1 ? "#fef3c7" : "#f3f4f6") + '" stroke="#9aa5a0"/>' + txt(200, 48, "beban", { size: 9 }) + line(200, 15, 200, 22) + line(200, 66, 200, 72);
      s += mosSym(178, 112, "e", false, I > 0 ? COP : INK) + line(200, 152, 200, 185) + gnd(200, 185) + line(148, 126, 90, 126) + resH(90, 140, 126).replace(resH(90, 140, 126), resH(100, 140, 126)) + txt(120, 116, "100 Ω", { size: 9 }) + '<rect x="30" y="114" width="60" height="24" rx="4" fill="' + COP + '"/>' + txt(60, 130, "pin " + f(VGS, 1) + " V", { size: 9.5, c: "#fff", b: 1 }) + resV(150, 132, 185) + line(140, 126, 150, 126) + line(150, 126, 150, 132) + txt(162, 165, "10 kΩ", { size: 9, a: "start" }) + gnd(150, 185) + line(90, 126, 100, 126);
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".ms").innerHTML = "<tr><th>R_DS(on)</th><th>I beban</th><th>P MOSFET = I²·R_DS(on)</th><th>Bandingkan BJT (V_CE(sat) 0,3 V)</th></tr><tr><td>" + (isFinite(Ron) ? f(Ron * 1000, 1) + " mΩ" : "∞ (OFF)") + "</td><td>" + f(I, 2) + " A</td><td><b>" + f(P, 3) + " W</b></td><td>" + f(Pbjt, 2) + " W + arus basis besar</td></tr><tr><td colspan=4>" + (VGS <= th ? '<span class="tag mid">V_GS di bawah ambang: MOSFET OFF</span>' : VGS < 4.5 ? '<span class="tag no">V_GS kurang: R_DS(on) besar, MOSFET panas</span>' : '<span class="tag ok">Logic-level ON penuh: hampir tanpa rugi, arus gate ≈ 0</span>') + "</td></tr>";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  /* =================== ANIMASI MATERI 9: THYRISTOR =================== */
  function triD(x, y, c) { return '<polygon points="' + (x - 11) + "," + y + " " + (x + 11) + "," + y + " " + x + "," + (y + 18) + '" fill="' + c + '"/>'; }
  // simbol SCR & kerabat, vertikal: anoda (x, y-34), katoda (x, y+34). o: {shock, gA, gK (default true), light, lab}
  function scrSym(x, y, c, o) {
    c = c || INK; o = o || {}; var gK = o.gK !== false && !o.shock && !o.gA, s = line(x, y - 34, x, y - 9, c) + triD(x, y - 9, c) + line(x - 12, y + 9, x + 12, y + 9, c, 3) + line(x, y + 9, x, y + 34, c);
    if (o.shock) s += line(x - 12, y + 9, x - 12, y + 1, c, 3);
    if (gK || o.two) s += line(x + 6, y + 9, x + 20, y + 22, c) + line(x + 20, y + 22, x + 34, y + 22, c);
    if (o.gA || o.two) s += line(x + 6, y - 9, x + 20, y - 22, c) + line(x + 20, y - 22, x + 34, y - 22, c);
    if (o.light) s += arrow(x - 40, y - 34, x - 18, y - 14, COP) + arrow(x - 44, y - 20, x - 22, y, COP);
    if (o.lab !== false) {
      s += txt(x - 6, y - 26, "A", { size: 10, a: "end", c: MUT }) + txt(x - 6, y + 32, "K", { size: 10, a: "end", c: MUT });
      if (gK && !o.two) s += txt(x + 36, y + 26, "G", { size: 10, a: "start", c: MUT });
      if (o.gA && !o.two) s += txt(x + 36, y - 18, "G", { size: 10, a: "start", c: MUT });
      if (o.two) s += txt(x + 36, y + 26, "G_K", { size: 9.5, a: "start", c: MUT }) + txt(x + 36, y - 18, "G_A", { size: 9.5, a: "start", c: MUT });
    }
    return s;
  }
  // DIAC / TRIAC vertikal: terminal atas (x, y-34) dan bawah (x, y+34)
  function diacSym(x, y, c, gate, lab) {
    c = c || INK; var s = line(x, y - 34, x, y - 12, c) + line(x, y + 12, x, y + 34, c) + line(x - 22, y - 12, x + 22, y - 12, c, 3) + line(x - 22, y + 12, x + 22, y + 12, c, 3);
    s += '<polygon points="' + (x - 21) + "," + (y - 12) + " " + (x - 1) + "," + (y - 12) + " " + (x - 11) + "," + (y + 12) + '" fill="' + c + '"/><polygon points="' + (x + 1) + "," + (y + 12) + " " + (x + 21) + "," + (y + 12) + " " + (x + 11) + "," + (y - 12) + '" fill="' + c + '"/>';
    if (gate) s += line(x + 14, y + 12, x + 28, y + 24, c) + line(x + 28, y + 24, x + 38, y + 24, c);
    if (lab !== false) s += txt(x - 8, y - 26, gate ? "MT2" : "A2", { size: 9.5, a: "end", c: MUT }) + txt(x - 8, y + 32, gate ? "MT1" : "A1", { size: 9.5, a: "end", c: MUT }) + (gate ? txt(x + 40, y + 28, "G", { size: 10, a: "start", c: MUT }) : "");
    return s;
  }
  // UJT: emitor (x-24, y+14); B2 (x+28, y-38); B1 (x+28, y+38)
  function ujtSym(x, y, c, lab) {
    c = c || INK; var s = line(x + 10, y - 24, x + 10, y + 24, c, 3.6) + line(x + 10, y - 16, x + 28, y - 16, c) + line(x + 28, y - 16, x + 28, y - 38, c) + line(x + 10, y + 16, x + 28, y + 16, c) + line(x + 28, y + 16, x + 28, y + 38, c);
    s += line(x - 24, y + 14, x - 12, y + 14, c) + arrow(x - 12, y + 14, x + 8, y + 2, c);
    if (lab !== false) s += txt(x - 26, y + 28, "E", { size: 10, a: "middle", c: MUT }) + txt(x + 34, y - 30, "B2", { size: 10, a: "start", c: MUT }) + txt(x + 34, y + 36, "B1", { size: 10, a: "start", c: MUT });
    return s;
  }
  G.thyrsimbol = function () {
    var X = [40, 128, 216, 304], s = "", it = [
      [scrSym(X[0], 62, COP, { shock: 1 }), "Dioda 4 lapis", "tanpa gate"], [scrSym(X[1], 62, COP), "SCR", "gate di katoda"],
      [scrSym(X[2], 62, COP, { light: 1 }), "LASCR", "dipicu cahaya"], [scrSym(X[3], 62, COP, { two: 1 }), "SCS", "dua gate"],
      [diacSym(X[0], 192, COP, false), "DIAC", "tanpa gate"], [diacSym(X[1], 192, COP, true), "TRIAC", "dengan gate"],
      [ujtSym(X[2] - 8, 192, COP), "UJT", "satu sambungan"], [scrSym(X[3], 192, COP, { gA: 1 }), "PUT", "gate di anoda"]];
    it.forEach(function (a, i) { var x = X[i % 4], y = i < 4 ? 62 : 192; s += a[0] + txt(x + 6, y + 50, a[1], { size: 10.5, b: 1 }) + txt(x + 6, y + 62, a[2], { size: 8.8, c: MUT }); });
    s += line(4, 128, 356, 128, "#e5dfd0", 1);
    return svg(360, 262, s);
  };
  // struktur PNPN + ekivalen dua transistor. st: {on, g} untuk animasi
  function pnpnEkv(dx, dy, st) {
    st = st || {}; var c1 = st.on ? COP : INK, x1 = 60 + dx, x2 = 62 + dx, y1 = 40 + dy, y2 = 120 + dy;
    var s = '<g transform="rotate(180 ' + x1 + " " + y1 + ')">' + bjtSym(x1, y1, true, c1, false) + "</g>" + bjtSym(x2, y2, false, c1, false);
    s += line(x1 - 22, y1 + 40, x1 - 22, y2, st.on ? COP : INK) + line(x1 + 24, y1, x1 + 24, y1 + 40, st.on ? COP : INK) + dot(x1 - 22, y2);
    s += txt(x1 + 34, y1 - 20, "Q1 (PNP)", { size: 9.5, a: "start", c: MUT }) + txt(x2 + 34, y2 + 6, "Q2 (NPN)", { size: 9.5, a: "start", c: MUT });
    if (st.on) s += txt(x1 - 28, y1 + 60, "I_C1 = I_B2", { size: 9, a: "end", c: COP }) + txt(x1 + 30, y1 + 30, "I_C2 = I_B1", { size: 9, a: "start", c: COP });
    return s;
  }
  G.pnpn = function () {
    var s = "", L = [["P", "#f6e7d8"], ["N", "#e3ecfb"], ["P", "#f6e7d8"], ["N", "#e3ecfb"]];
    L.forEach(function (l, i) { s += '<rect x="40" y="' + (34 + i * 40) + '" width="60" height="40" fill="' + l[1] + '" stroke="#9aa5a0"/>' + txt(70, 59 + i * 40, l[0], { size: 14, b: 1 }); });
    s += txt(106, 78, "J1", { size: 9.5, a: "start", c: MUT }) + txt(106, 118, "J2", { size: 9.5, a: "start", c: MUT }) + txt(106, 158, "J3", { size: 9.5, a: "start", c: MUT });
    s += line(70, 14, 70, 34) + txt(80, 20, "A (anoda)", { size: 10, a: "start", b: 1 }) + line(70, 194, 70, 214) + txt(80, 212, "K (katoda)", { size: 10, a: "start", b: 1 }) + line(100, 134, 128, 134, COP) + txt(132, 138, "G", { size: 10, a: "start", b: 1, c: COP });
    s += txt(70, 230, "struktur 4 lapis", { size: 9.5, c: MUT });
    var x1 = 250, y1 = 66, y2 = 146;
    s += pnpnEkv(190, 26) + line(x1 - 22, y1 - 40, x1 - 22, 14) + txt(x1 - 14, 20, "A", { size: 10, a: "start", b: 1 }) + line(x1 + 24, y2 + 40, x1 + 24, 214) + txt(x1 + 34, 212, "K", { size: 10, a: "start", b: 1 }) + line(x1 - 22, y2, x1 - 60, y2, COP) + txt(x1 - 64, y2 + 4, "G", { size: 10, a: "end", b: 1, c: COP });
    s += txt(260, 230, "ekivalen dua transistor", { size: 9.5, c: MUT });
    return svg(360, 238, s);
  };
  G.shockley = function (p) {
    var s = batV(40, 25, 165, f(+p.VB, 1) + " V") + line(40, 25, 110, 25) + resH(110, 200, 25) + txt(155, 13, "R_S = " + fR(+p.RS), { size: 10.5, b: 1 }) + line(200, 25, 250, 25) + line(250, 25, 250, 61) + scrSym(250, 95, COP, { shock: 1 }) + line(250, 129, 250, 165) + line(40, 165, 250, 165);
    if (p.VBR) s += txt(266, 92, "V_BR(F) = " + f(+p.VBR, 1) + " V", { size: 10, a: "start" });
    if (p.IH) s += txt(266, 108, "I_H = " + f(+p.IH, 1) + " mA", { size: 10, a: "start" });
    return svg(380, 185, s);
  };
  G.scrdc = function (p) {
    var s = batV(40, 20, 190, f(+p.V, 1) + " V") + line(40, 20, 230, 20) + resV(230, 20, 74) + txt(242, 50, "R_L = " + fR(+p.RL), { size: 10.5, a: "start", b: 1 }) + line(230, 74, 230, 82) + scrSym(230, 116, COP) + line(230, 150, 230, 190) + line(40, 190, 350, 190);
    s += line(264, 138, 272, 138) + resH(272, 330, 138) + txt(301, 126, "R_G = " + fR(+p.RG), { size: 10, b: 1 }) + line(330, 138, 350, 138) + batV(350, 138, 190, "") + txt(372, 168, f(+p.VG, 1) + " V", { size: 10.5, a: "start", b: 1 });
    return svg(410, 205, s);
  };
  G.crowbar = function (p) {
    var s = '<rect x="14" y="20" width="62" height="150" rx="6" fill="#f3f4f6" stroke="#9aa5a0"/>' + txt(45, 90, "Catu", { size: 10.5, b: 1 }) + txt(45, 104, "DC", { size: 10.5, b: 1 });
    s += line(76, 30, 104, 30) + '<rect x="104" y="23" width="40" height="14" rx="7" fill="#fff" stroke="' + INK + '" stroke-width="1.8"/>' + txt(124, 15, "sekering", { size: 9, c: MUT }) + line(144, 30, 350, 30) + line(76, 160, 350, 160) + txt(350, 24, "ke beban →", { size: 9, a: "end", c: MUT });
    s += line(200, 30, 200, 62) + scrSym(200, 96, COP, { lab: false }) + line(200, 130, 200, 160) + txt(186, 100, "SCR", { size: 9.5, a: "end", b: 1 }) + line(234, 118, 300, 118);
    s += line(300, 30, 300, 46) + diodaV(300, 46, 86, -1, INK) + txt(314, 70, "D_Z " + f(+p.Vz || 5.6, 1) + " V", { size: 9.5, a: "start" }) + line(300, 86, 300, 118) + dot(300, 118) + resV(300, 118, 160) + txt(312, 142, "R_GK", { size: 9.5, a: "start" }) + dot(200, 30) + dot(300, 30) + dot(200, 160) + dot(300, 160);
    return svg(360, 180, s);
  };
  // gelombang kontrol fasa: mode "scr" (setengah) / "triac" (penuh); a dalam derajat
  function fasaSVG(a, mode, ph) {
    var x0 = 20, W = 300, y0 = 92, A = 66, s = line(x0, y0, x0 + W, y0, "#c7cfca", 1), src = [], ld = [x0 + "," + y0];
    for (var k = 0; k <= 240; k++) {
      var th = k / 240 * 720, v = Math.sin(th * Math.PI / 180), X = x0 + k / 240 * W, half = th % 360 < 180 ? 0 : 1, inHalf = th % 180, on = inHalf >= a && (mode === "triac" || half === 0);
      src.push(X + "," + (y0 - v * A)); ld.push(X + "," + (y0 - (on ? v : 0) * A));
    }
    ld.push((x0 + W) + "," + y0);
    s += '<polygon points="' + ld.join(" ") + '" fill="' + COP + '" fill-opacity=".28" stroke="' + COP + '" stroke-width="2.4"/>' + poly(src.join(" "), "#9aa5a0", 1.4).replace("/>", ' stroke-dasharray="4 3"/>');
    for (var h = 0; h < 4; h++) { if (mode !== "triac" && h % 2) continue; if (a >= 180) continue; var xg = x0 + (h * 180 + a) / 720 * W; s += line(xg, 178, xg, 162, BLU, 2) + '<polygon points="' + (xg - 4) + ",164 " + (xg + 4) + ",164 " + xg + ',156" fill="' + BLU + '"/>'; }
    var xa = x0 + a / 720 * W; if (a > 0 && a < 180) s += '<path d="M' + x0 + " " + (y0 + 8) + " L" + xa + " " + (y0 + 8) + '" stroke="' + BLU + '" stroke-width="1.4"/>' + txt((x0 + xa) / 2, y0 + 20, "α", { size: 12, b: 1, c: BLU });
    if (ph != null) { var xp = x0 + ph * W; s += line(xp, 20, xp, 165, GRN, 1.2).replace("/>", ' stroke-dasharray="2 3"/>'); }
    s += txt(x0, 14, "abu: jala-jala · tembaga: beban · biru: pulsa gate", { size: 9, a: "start", c: MUT });
    return s;
  }
  G.fasa = function (p) { return svg(340, 185, fasaSVG(p.a != null ? +p.a : 90, p.mode || "scr")); };
  A.fasa = function (el) {
    var mode = el.dataset.mode || "scr", ph = 0, play = true, Vm = 220 * Math.SQRT2, R = 48.4;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 185"><g class="w"></g></svg><svg class="diag" viewBox="0 0 340 34"><g class="p"></g></svg><div class="readout fr"></div><div class="ctrl"><button class="btn sm ghost" data-m="scr">SCR (setengah gelombang)</button><button class="btn sm ghost" data-m="triac">TRIAC (gelombang penuh)</button><button class="btn sm ghost" data-a="p">❚❚</button></div><div class="ctrl">' + slider("α", 0, 180, 5, 90, "°") + "</div>";
    var sl = el.querySelector("input");
    function hit() {
      var a = +sl.value, r = a * Math.PI / 180, vrms, vavg;
      if (mode === "scr") { vrms = Vm * Math.sqrt((Math.PI - r + Math.sin(2 * r) / 2) / (4 * Math.PI)); vavg = Vm / (2 * Math.PI) * (1 + Math.cos(r)); }
      else { vrms = Vm / Math.SQRT2 * Math.sqrt(Math.max(0, 1 - r / Math.PI + Math.sin(2 * r) / (2 * Math.PI))); vavg = 0; }
      return { a: a, vrms: vrms, vavg: vavg, P: vrms * vrms / R };
    }
    function draw() {
      var h = hit(); el.querySelector(".val").textContent = h.a;
      el.querySelector(".w").innerHTML = fasaSVG(h.a, mode, ph);
      var w = h.P / 1000 * 250; el.querySelector(".p").innerHTML = '<rect x="20" y="8" width="250" height="16" rx="8" fill="#f3f4f6" stroke="#d1d5db"/><rect x="20" y="8" width="' + Math.max(0, w) + '" height="16" rx="8" fill="' + COP + '" fill-opacity="' + (0.35 + 0.65 * h.P / 1000) + '"/>' + txt(280, 21, f(h.P, 0) + " W", { size: 11, a: "start", b: 1 });
      var c = Math.cos(h.a * Math.PI / 180);
      el.querySelector(".fr").innerHTML = "Pemanas 1000 W (R = 48,4 Ω), jala-jala 220 V (V_m = 311 V) · " + (mode === "scr"
        ? "V_avg = V_m/(2π)·(1 + cos α) = 49,5 × (1 + " + f(c, 3) + ") = <b>" + f(h.vavg, 1) + " V</b> · V_rms = <b>" + f(h.vrms, 1) + " V</b>"
        : "V_rms = (V_m/√2)·√(1 − α/π + sin 2α/(2π)) = <b>" + f(h.vrms, 1) + " V</b>") + " · P = V_rms²/R = <b>" + f(h.P, 0) + " W</b>";
      $$(el, "[data-m]").forEach(function (x) { x.classList.toggle("on", x.dataset.m === mode); });
    }
    $$(el, "[data-m]").forEach(function (x) { x.onclick = function () { mode = x.dataset.m; draw(); }; });
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    sl.addEventListener("input", draw); draw();
    loop(el, function (dt) { if (play) { ph = (ph + dt * 0.25) % 1; el.querySelector(".w").innerHTML = fasaSVG(+sl.value, mode, ph); } });
  };
  // simulasi dimmer DIAC–TRIAC: kembalikan sudut penyalaan (derajat) setengah positif & negatif pada siklus tunak
  function dimmerSim(Rk, CnF, VBO) {
    var Vm = 220 * Math.SQRT2, T = 0.02, N = 2000, dt = T / N, RC = Rk * 1e3 * CnF * 1e-9, vc = 0, on = false, prev = 0, aP = null, aN = null, tr = [];
    for (var cyc = 0; cyc < 8; cyc++) for (var i = 0; i < N; i++) {
      var th = i / N * 2 * Math.PI, vs = Vm * Math.sin(th), sg = vs >= 0 ? 1 : -1;
      if (sg !== prev) { on = false; prev = sg; }
      var va = on ? 0 : vs; vc += (va - vc) / RC * dt;
      if (!on && Math.abs(vc) >= VBO) { on = true; vc -= (vc > 0 ? 1 : -1) * 8; if (cyc === 7) { if (sg > 0) aP = i / N * 360; else aN = i / N * 360 - 180; } }
      if (cyc === 7 && i % 10 === 0) tr.push([vs, vc, on ? vs : 0]);
    }
    return { aP: aP, aN: aN, tr: tr };
  }
  A.dimmer = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 400 196"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 185"><g class="w"></g></svg><div class="readout dr"></div><div class="ctrl">' + slider("R potensiometer", 5, 300, 5, 100, "kΩ") + "</div>";
    var sl = el.querySelector("input"), C = 100, VBO = 32;
    function ckt(on) {
      var s = acSrc(30, 30, 180, "220 V") + line(30, 30, 30, 20) + line(30, 20, 220, 20) + line(30, 180, 350, 180);
      s += '<circle cx="220" cy="48" r="15" fill="' + (on ? "#fde68a" : "#fff") + '" stroke="' + INK + '" stroke-width="2"/>' + line(210, 38, 230, 58, INK, 1.4) + line(230, 38, 210, 58, INK, 1.4) + txt(240, 52, "lampu 100 W", { size: 9.5, a: "start" }) + line(220, 20, 220, 33) + line(220, 63, 220, 78);
      s += diacSym(220, 112, on ? COP : INK, true, false) + txt(208, 92, "MT2", { size: 9, a: "end", c: MUT }) + txt(208, 142, "MT1", { size: 9, a: "end", c: MUT }) + txt(176, 116, "TRIAC", { size: 9.5, a: "end", b: 1 }) + line(220, 146, 220, 180);
      s += line(220, 78, 350, 78) + dot(220, 78) + resV(350, 78, 126) + '<polygon points="362,104 372,98 372,110" fill="' + COP + '"/>' + txt(376, 106, "R", { size: 10, a: "start", b: 1 }) + line(350, 126, 350, 146) + dot(350, 136) + capV(350, 150) + line(350, 154, 350, 180) + txt(366, 156, "C", { size: 10, a: "start", b: 1 }) + txt(366, 168, "100 nF", { size: 8.5, a: "start" });
      s += line(258, 136, 266, 136) + '<g transform="rotate(-90 300 136)">' + diacSym(300, 136, on ? COP : INK, false, false) + "</g>" + txt(300, 172, "DIAC", { size: 9.5, c: MUT }) + line(334, 136, 350, 136);
      return s;
    }
    function draw() {
      var Rk = +sl.value; el.querySelector(".val").textContent = Rk;
      var r = dimmerSim(Rk, C, VBO), a = r.aP, x0 = 20, W = 300, y0 = 92, A = 66 / 311, s = line(x0, y0, x0 + W, y0, "#c7cfca", 1), ps = [], pc = [], pl = [x0 + "," + y0];
      r.tr.forEach(function (t, i) { var X = x0 + i / r.tr.length * W; ps.push(X + "," + (y0 - t[0] * A)); pc.push(X + "," + (y0 - t[1] * A)); pl.push(X + "," + (y0 - t[2] * A)); });
      pl.push((x0 + W) + "," + y0);
      s += '<polygon points="' + pl.join(" ") + '" fill="' + COP + '" fill-opacity=".28" stroke="' + COP + '" stroke-width="2.2"/>' + poly(ps.join(" "), "#9aa5a0", 1.3).replace("/>", ' stroke-dasharray="4 3"/>') + poly(pc.join(" "), BLU, 2);
      s += line(x0, y0 - VBO * A, x0 + W, y0 - VBO * A, RED, 1).replace("/>", ' stroke-dasharray="2 3"/>') + line(x0, y0 + VBO * A, x0 + W, y0 + VBO * A, RED, 1).replace("/>", ' stroke-dasharray="2 3"/>') + txt(x0 + W, y0 - VBO * A - 3, "+V_BO DIAC 32 V", { size: 8.5, a: "end", c: RED });
      s += txt(x0, 14, "abu-abu: jala-jala · biru: v_C · tembaga: tegangan lampu", { size: 9, a: "start", c: MUT });
      el.querySelector(".w").innerHTML = s;
      el.querySelector(".c").innerHTML = ckt(a != null);
      var P = 0, Vm = 311.13; if (a != null) { var rr = a * Math.PI / 180; P = Math.pow(Vm / Math.SQRT2, 2) * Math.max(0, 1 - rr / Math.PI + Math.sin(2 * rr) / (2 * Math.PI)) / 484; }
      el.querySelector(".dr").innerHTML = "τ = R·C = " + Rk + " kΩ × 100 nF = " + f(Rk * 0.1, 1) + " ms · " + (a == null ? '<span class="tag mid">v_C tidak pernah mencapai 32 V: TRIAC tidak dipicu, lampu padam</span>' : "sudut penyalaan α ≈ <b>" + f(a, 0) + "°</b> · daya lampu 100 W ≈ <b>" + f(P, 0) + " W</b>" + (a > 150 ? ' <span class="tag mid">redup sekali</span>' : ""));
    }
    sl.addEventListener("input", draw); draw();
  };
  // rangkaian osilator relaksasi UJT / PUT
  function ujtCkt(p, mode, on) {
    var c = on ? COP : INK, s = batV(30, 15, 185, f(p.VBB, 0) + " V") + line(30, 185, 300, 185);
    if (mode === "put") {
      s += line(30, 15, 300, 15) + resV(120, 15, 62) + txt(108, 42, "R " + fR(p.R), { size: 9.5, a: "end", b: 1 }) + line(120, 62, 120, 136) + dot(120, 70) + capV(120, 140) + line(120, 144, 120, 185) + txt(108, 150, "C " + f(p.C, 2) + " µF", { size: 9.5, a: "end", b: 1 });
      s += line(120, 70, 210, 70) + line(210, 70, 210, 76) + scrSym(210, 110, c, { gA: 1, lab: false }) + txt(200, 84, "A", { size: 9.5, a: "end", c: MUT }) + txt(200, 142, "K", { size: 9.5, a: "end", c: MUT }) + line(210, 144, 210, 146) + resV(210, 146, 185) + txt(222, 170, "R_K", { size: 9, a: "start" }) + dot(210, 146) + line(210, 146, 260, 146) + txt(262, 140, "v_out", { size: 9.5, a: "start", c: BLU });
      s += resV(300, 15, 80) + line(300, 80, 300, 96) + dot(300, 88) + resV(300, 96, 185) + line(244, 88, 300, 88) + txt(310, 50, "R1", { size: 9.5, a: "start", b: 1 }) + txt(310, 145, "R2", { size: 9.5, a: "start", b: 1 }) + txt(256, 82, "G", { size: 9.5, c: MUT });
    } else {
      s += line(30, 15, 228, 15) + resV(120, 15, 100) + txt(108, 58, "R " + fR(p.R), { size: 9.5, a: "end", b: 1 }) + line(120, 100, 120, 136) + dot(120, 114) + capV(120, 140) + line(120, 144, 120, 185) + txt(108, 160, "C " + f(p.C, 2) + " µF", { size: 9.5, a: "end", b: 1 });
      s += line(120, 114, 176, 114) + ujtSym(200, 100, c, true) + resV(228, 15, 62) + txt(240, 40, "R_B2", { size: 9, a: "start" }) + resV(228, 138, 185) + txt(240, 168, "R_B1", { size: 9, a: "start" }) + dot(228, 142) + line(228, 142, 290, 142) + txt(292, 136, "v_out", { size: 9.5, a: "start", c: BLU });
    }
    return s;
  }
  function ujtHitung(VBB, Rk, CuF, eta, mode) {
    var VV = mode === "put" ? 1 : 2, VP = eta * VBB + 0.7, RC = Rk * CuF; // ms
    return { VV: VV, VP: VP, RC: RC, T: RC * Math.log((VBB - VV) / (VBB - VP)), T0: RC * Math.log((VBB) / (VBB - VP)), Ta: RC * Math.log(1 / (1 - eta)) };
  }
  G.ujtosc = function (p) { return svg(340, 195, ujtCkt({ VBB: +p.VBB || 12, R: (+p.R || 47) * 1000, C: +p.C || 0.1 }, "ujt")); };
  G.putosc = function (p) {
    var s = ujtCkt({ VBB: +p.VBB || 12, R: (+p.R || 100) * 1000, C: +p.C || 1 }, "put");
    s = s.replace(txt(310, 50, "R1", { size: 9.5, a: "start", b: 1 }), txt(310, 50, "R1 = " + fR((+p.R1 || 10) * 1000), { size: 9.5, a: "start", b: 1 })).replace(txt(310, 145, "R2", { size: 9.5, a: "start", b: 1 }), txt(310, 145, "R2 = " + fR((+p.R2 || 20) * 1000), { size: 9.5, a: "start", b: 1 }));
    return svg(390, 195, s);
  };
  A.ujtosc = function (el) {
    var mode = el.dataset.mode || "ujt", t = 0, play = true;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 195"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 178"><g class="w"></g></svg><div class="readout ur"></div><div class="ctrl"><button class="btn sm ghost" data-m="ujt">UJT</button><button class="btn sm ghost" data-m="put">PUT</button><button class="btn sm ghost" data-a="p">❚❚</button></div><div class="ctrl">' + slider("R", 10, 200, 1, 47, "kΩ") + slider("C", 0.01, 1, 0.01, 0.1, "µF") + slider("η", 0.5, 0.85, 0.01, 0.63, "") + "</div>";
    var ins = $$(el, "input"), VBB = 12;
    function draw() {
      var Rk = +ins[0].value, C = +ins[1].value, eta = +ins[2].value, h = ujtHitung(VBB, Rk, C, eta, mode);
      $$(el, ".val")[0].textContent = Rk; $$(el, ".val")[1].textContent = f(C, 2); $$(el, ".val")[2].textContent = f(eta, 2);
      $$(el, ".sl")[2].querySelector("span").firstChild.textContent = mode === "put" ? "R2/(R1+R2) = " : "η = ";
      var Tt = h.T0 + 3 * h.T, x0 = 30, W = 300, Y = function (v) { return 140 - v / VBB * 118; }, X = function (tm) { return x0 + tm / Tt * W; }, pts = [], fires = [], v0 = 0, tc = 0, ph = (t % 1) * Tt, vNow = 0, fired = false;
      for (var cyc = 0; cyc < 4; cyc++) { var Tc = cyc === 0 ? h.T0 : h.T; for (var k = 0; k <= 40; k++) { var tt = Tc * k / 40, v = VBB - (VBB - v0) * Math.exp(-tt / h.RC); pts.push(X(tc + tt) + "," + Y(v)); if (ph >= tc + tt) vNow = v; } tc += Tc; fires.push(tc); pts.push(X(tc) + "," + Y(h.VV)); v0 = h.VV; if (Math.abs(ph - tc) < Tt * 0.03) fired = true; }
      var s = line(x0, 140, x0 + W, 140, INK, 1.3) + line(x0, 140, x0, 18, INK, 1.3) + txt(x0 + 4, 14, "v_C (V)", { size: 9.5, a: "start" }) + txt(x0 + W, 152, f(Tt, 2) + " ms", { size: 9, a: "end", c: MUT }) + txt(x0, 152, "0", { size: 9, c: MUT });
      s += line(x0, Y(h.VP), x0 + W, Y(h.VP), RED, 1).replace("/>", ' stroke-dasharray="4 3"/>') + txt(x0 + W, Y(h.VP) - 4, "V_P = " + f(h.VP, 2) + " V", { size: 9, a: "end", c: RED }) + line(x0, Y(h.VV), x0 + W, Y(h.VV), "#9aa5a0", 1).replace("/>", ' stroke-dasharray="4 3"/>') + txt(x0 + W, Y(h.VV) + 11, "V_V ≈ " + h.VV + " V", { size: 9, a: "end", c: MUT });
      s += poly(pts.join(" "), COP, 2.4); fires.forEach(function (tf) { s += line(X(tf), 174, X(tf), 156, BLU, 2.6); }); s += txt(x0 - 4, 170, "v_out", { size: 8.5, a: "end", c: BLU });
      s += '<circle cx="' + X(ph) + '" cy="' + Y(vNow) + '" r="4.5" fill="' + GRN + '"/>';
      el.querySelector(".w").innerHTML = s;
      el.querySelector(".c").innerHTML = ujtCkt({ VBB: VBB, R: Rk * 1000, C: C }, mode, fired);
      el.querySelector(".ur").innerHTML = (mode === "put" ? "V_G = V_BB·R2/(R1+R2) = 12 × " + f(eta, 2) + " = " + f(eta * VBB, 2) + " V · V_P = V_G + 0,7" : "V_P = η·V_BB + 0,7 = " + f(eta, 2) + " × 12 + 0,7") + " = <b>" + f(h.VP, 2) + " V</b> · RC = " + f(h.RC, 3) + " ms · T = RC·ln((V_BB − V_V)/(V_BB − V_P)) = <b>" + f(h.T, 3) + " ms</b> → f = <b>" + f(1000 / h.T, 1) + " Hz</b> · pendekatan RC·ln(1/(1 − η)) = " + f(h.Ta, 3) + " ms";
      $$(el, "[data-m]").forEach(function (x) { x.classList.toggle("on", x.dataset.m === mode); });
    }
    $$(el, "[data-m]").forEach(function (x) { x.onclick = function () { mode = x.dataset.m; draw(); }; });
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
    loop(el, function (dt) { if (play) { t += dt * 0.2; draw(); } });
  };
  // SCR mengunci: ekivalen dua transistor dengan tombol gate & plot riwayat
  A.latch = function (el) {
    var on = false, gT = 0, bT = 0, hist = [], VT = 1, IH = 5, VBO = 25;
    el.innerHTML = '<svg class="diag" viewBox="0 0 360 246"><g class="c"></g></svg><svg class="diag" viewBox="0 0 360 120"><g class="h"></g></svg><div class="readout lr"></div><div class="ctrl"><button class="btn sm" data-a="g">⚡ Pulsa gate (0,3 s)</button><button class="btn sm ghost" data-a="b">✂ Putus arus anoda</button></div><div class="ctrl">' + slider("V sumber", 0, 30, 0.5, 12, "V") + "</div>";
    var sl = el.querySelector("input");
    el.querySelector("[data-a=g]").onclick = function () { gT = 0.3; };
    el.querySelector("[data-a=b]").onclick = function () { bT = 0.4; };
    function step(dt) {
      var V = +sl.value; el.querySelector(".val").textContent = f(V, 1); gT = Math.max(0, gT - dt); bT = Math.max(0, bT - dt);
      var g = gT > 0, IAon = Math.max(0, (V - VT) / 1), IG = g ? 4.3 : 0;
      if (bT > 0) on = false; else { if (!on && ((g && IAon >= IH) || V >= VBO)) on = true; if (on && IAon < IH) on = false; }
      var IA = on ? IAon : 0, VAK = bT > 0 ? 0 : on ? VT : V;
      var s = batV(40, 14, 232, "") + txt(60, 128, f(V, 1) + " V", { size: 10.5, a: "start", b: 1 }) + line(40, 14, 238, 14, on ? COP : INK) + resV(238, 14, 58, on ? COP : COP) + txt(250, 34, "R_A = 1 kΩ", { size: 9.5, a: "start" }) + line(238, 58, 238, 60, on ? COP : INK);
      s += pnpnEkv(200, 60, { on: on }) + line(284, 220, 284, 232, on ? COP : INK) + line(40, 232, 284, 232, on ? COP : INK);
      s += line(238, 180, 205, 180, g ? BLU : INK) + resH(150, 205, 180, g ? BLU : COP) + txt(178, 168, "1 kΩ", { size: 9 }) + line(140, 180, 150, 180, g ? BLU : INK) + dot(108, 180) + dot(140, 180) + (g ? line(108, 180, 140, 180, BLU, 2.6) : line(108, 180, 136, 164, INK, 2.2)) + line(95, 180, 108, 180) + batV(95, 180, 232, "") + txt(84, 210, "5 V", { size: 9.5, a: "end" }) + txt(124, 158, "gate", { size: 9, c: MUT });
      if (bT > 0) s += '<rect x="228" y="62" width="20" height="10" fill="#fffdf6"/>' + txt(256, 70, "terputus", { size: 9, a: "start", c: RED });
      s += txt(350, 14, on ? "ON" : "OFF", { size: 14, a: "end", b: 1, c: on ? COP : MUT });
      el.querySelector(".c").innerHTML = s;
      hist.push([IG, IA]); if (hist.length > 360) hist.shift();
      var hs = line(20, 44, 340, 44, "#e5e7eb", 1) + line(20, 110, 340, 110, "#e5e7eb", 1) + txt(20, 12, "I_G", { size: 9.5, a: "start", c: BLU }) + txt(20, 58, "I_A", { size: 9.5, a: "start", c: COP }) + txt(340, 118, "waktu →", { size: 8.5, a: "end", c: MUT }), pg = [], pa = [];
      hist.forEach(function (hh, i) { var X = 340 - (hist.length - 1 - i) * (320 / 360); pg.push(X + "," + (44 - hh[0] / 4.3 * 26)); pa.push(X + "," + (110 - hh[1] / 29 * 48)); });
      hs += line(20, 110 - IH / 29 * 48, 340, 110 - IH / 29 * 48, RED, 1).replace("/>", ' stroke-dasharray="3 3"/>') + txt(336, 106 - IH / 29 * 48, "I_H = 5 mA", { size: 8.5, a: "end", c: RED });
      if (pg.length > 1) hs += poly(pg.join(" "), BLU, 2) + poly(pa.join(" "), COP, 2.4);
      el.querySelector(".h").innerHTML = hs;
      el.querySelector(".lr").innerHTML = (on ? '<span class="tag ok">SCR ON</span>' : '<span class="tag mid">SCR OFF</span>') + " I_A = " + (on ? "(V − V_T)/R_A = (" + f(V, 1) + " − 1)/1 kΩ = <b>" + f(IA, 1) + " mA</b>" : "<b>0 mA</b>") + " · V_AK = " + f(VAK, 1) + " V" + (on && !g ? " · pulsa gate sudah hilang, tetapi SCR tetap ON (mengunci)" : "") + (!on && V >= 1 && IAon < IH ? " · arus yang mungkin < I_H: SCR tidak bisa bertahan ON" : "") + (V >= VBO ? " · V ≥ V_BR(F) 25 V: breakover tanpa gate" : "");
    }
    step(0); loop(el, function (dt) { step(dt); });
  };
  // kurva karakteristik SCR / dioda 4 lapis dengan titik kerja (histeresis)
  A.scrkurva = function (el) {
    var shock = el.dataset.mode === "shockley", on = false, IH = 5;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 235"><g class="g"></g></svg><div class="readout sr"></div><div class="ctrl">' + (shock ? "" : slider("I_G", 0, 4, 0.5, 0, "mA")) + slider("V sumber (R = 2 kΩ)", 0, 120, 1, 40, "V") + "</div>";
    var ins = $$(el, "input");
    function VBO(ig) { return 100 - 22 * ig; }
    function draw() {
      var IG = shock ? 0 : +ins[0].value, V = +ins[shock ? 0 : 1].value, vbo = VBO(IG); $$(el, ".val").forEach(function (v, i) { v.textContent = shock ? f(V, 0) : i === 0 ? f(IG, 1) : f(V, 0); });
      var Ion = (V - 1) / 2; if (!on && V >= vbo) on = true; if (on && Ion < IH) on = false;
      var xo = 110, yo = 160, X = function (v) { return v >= 0 ? xo + v * 1.85 : xo + v * 0.8; }, Y = function (i) { return yo - i * 2.2; };
      var s = line(18, yo, 336, yo, INK, 1.3) + line(xo, 20, xo, 228, INK, 1.3) + txt(334, yo - 6, "V_AK", { size: 9.5, a: "end" }) + txt(xo + 4, 18, "I_A (mA)", { size: 9.5, a: "start" });
      var fam = shock ? [0] : [0, 1, 2, 3, 4];
      fam.forEach(function (ig) { var vb = VBO(ig), c = ig === IG ? COP : "#c7cfca", w = ig === IG ? 2.6 : 1.3; s += poly(X(0) + "," + Y(0) + " " + X(vb) + "," + Y(1.2), c, w) + line(X(vb), Y(1.2), X(1.2), Y(IH), c, 1.2).replace("/>", ' stroke-dasharray="3 3"/>'); if (!shock) s += txt(X(vb), Y(1.2) + 12, "I_G=" + ig, { size: 8, c: ig === IG ? COP : "#9aa5a0" }); });
      var cp = []; for (var i = 0; i <= 30; i++) { var I = IH + i / 30 * (58 - IH); cp.push(X(0.9 + I / 58 * 2.2) + "," + Y(I)); } s += poly(cp.join(" "), COP, 2.8);
      s += poly(X(0) + "," + Y(0) + " " + X(-100) + "," + Y(-0.8) + " " + X(-104) + "," + Y(-30), "#9aa5a0", 2);
      s += line(xo - 4, Y(IH), xo + 26, Y(IH), RED, 1) + txt(xo - 6, Y(IH) + 4, "I_H", { size: 9, a: "end", c: RED }) + txt(X(vbo), yo + 26, "V_BR(F) = " + vbo + " V", { size: 9, c: COP });
      s += txt(xo + 30, 40, "konduksi maju (ON)", { size: 9, a: "start", c: COP }) + txt(220, yo - 14, "blocking maju (OFF)", { size: 9, c: MUT }) + txt(60, yo + 14, "blocking mundur", { size: 9, c: MUT }) + txt(40, 214, "avalanche mundur", { size: 9, c: MUT, a: "start" });
      var px = on ? X(0.9 + Ion / 58 * 2.2) : X(V), py = on ? Y(Ion) : Y(V / vbo * 1.2);
      if (V > 0) { var v1 = V / 2 > 58 ? V - 116 : 0; s += line(X(v1), Y((V - v1) / 2), X(V), Y(0), BLU, 1).replace("/>", ' stroke-dasharray="5 3"/>'); }
      s += '<circle cx="' + px + '" cy="' + py + '" r="6" fill="' + (on ? GRN : BLU) + '"/>';
      el.querySelector(".g").innerHTML = s;
      el.querySelector(".sr").innerHTML = (shock ? "Dioda 4 lapis: V_BR(F) = 100 V" : "I_G = " + f(IG, 1) + " mA → V_BR(F) turun menjadi " + vbo + " V") + " · " + (on ? '<span class="tag ok">ON</span> I_A = (V − 1)/2 kΩ = <b>' + f(Ion, 1) + " mA</b>, V_AK ≈ 1 V" : '<span class="tag mid">OFF</span> I_A ≈ 0, V_AK = <b>' + f(V, 0) + " V</b>") + " · I_H = 5 mA (mati bila V < " + f(1 + 2 * IH, 0) + " V)";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  G.ivsim = function (p) {
    var tr = p.mode === "triac", cx = 170, cy = 105, s = line(20, cy, 330, cy, INK, 1.3) + line(cx, 15, cx, 195, INK, 1.3) + txt(328, cy - 6, "V", { size: 10, a: "end" }) + txt(cx + 6, 18, "I", { size: 10, a: "start" });
    function br(v, c, w) { return poly(cx + "," + cy + " " + (cx + v) + "," + (cy - 4) + " " + (cx + v - 22) + "," + (cy - 14) + " " + (cx + v - 17) + "," + (cy - 82), c, w) + poly(cx + "," + cy + " " + (cx - v) + "," + (cy + 4) + " " + (cx - v + 22) + "," + (cy + 14) + " " + (cx - v + 17) + "," + (cy + 82), c, w); }
    if (tr) { s += br(95, "#c7cfca", 1.4) + br(68, "#c7cfca", 1.4) + txt(cx + 68, cy + 14, "|I_G| naik", { size: 8.5, c: MUT }); }
    s += br(125, COP, 2.6) + txt(cx + 125, cy + 16, "+V_BO", { size: 9.5, c: COP }) + txt(cx - 125, cy - 8, "−V_BO", { size: 9.5, c: COP });
    s += txt(cx + 112, cy - 22, "breakback", { size: 8.5, a: "start", c: MUT }) + txt(cx + 40, 40, tr ? "kuadran I (MT2 +)" : "kuadran I", { size: 9, a: "start", c: MUT }) + txt(24, 196, tr ? "kuadran III (MT2 −)" : "kuadran III", { size: 9, a: "start", c: MUT });
    s += txt(170, 214, tr ? "TRIAC: dua arah; V_BO turun bila |I_G| naik" : "DIAC: simetris, tanpa gate", { size: 9.5, b: 1 });
    return svg(340, 222, s);
  };
  G.scsop = function () {
    var x1 = 180, y1 = 80, y2 = 160, s = pnpnEkv(120, 40);
    s += line(x1 - 22, y1 - 40, x1 - 22, 18) + txt(x1 - 14, 22, "A", { size: 10, a: "start", b: 1 }) + line(x1 + 24, y2 + 40, x1 + 24, 226) + txt(x1 + 32, 224, "K", { size: 10, a: "start", b: 1 });
    s += line(x1 - 22, y2, 104, y2, COP) + txt(100, y2 + 4, "G_K", { size: 10, a: "end", b: 1, c: COP }) + dot(x1 + 24, y1 + 20) + line(x1 + 24, y1 + 20, 290, y1 + 20, BLU) + txt(294, y1 + 24, "G_A", { size: 10, a: "start", b: 1, c: BLU });
    s += txt(20, 200, "ON : G_K + atau G_A −", { size: 9.5, a: "start", b: 1, c: GRN }) + txt(20, 216, "OFF: G_A + atau G_K −", { size: 9.5, a: "start", b: 1, c: RED });
    return svg(340, 234, s);
  };
  G.ujtekv = function () {
    var s = '<rect x="60" y="30" width="30" height="150" fill="#e3ecfb" stroke="#9aa5a0"/>' + txt(75, 160, "n", { size: 13, b: 1 }) + '<rect x="46" y="60" width="14" height="22" fill="#f6e7d8" stroke="#9aa5a0"/>' + txt(53, 96, "p", { size: 11, b: 1 });
    s += line(75, 10, 75, 30) + txt(84, 16, "B2", { size: 10, a: "start", b: 1 }) + line(75, 180, 75, 200) + txt(84, 198, "B1", { size: 10, a: "start", b: 1 }) + line(18, 71, 46, 71) + txt(16, 66, "E", { size: 10, a: "start", b: 1 }) + txt(75, 216, "struktur", { size: 9, c: MUT });
    s += line(270, 10, 270, 26) + txt(278, 16, "B2", { size: 10, a: "start", b: 1 }) + resV(270, 26, 84) + txt(282, 58, "r_B2", { size: 10, a: "start" }) + line(270, 84, 270, 104) + dot(270, 94) + resV(270, 104, 170) + arrow(252, 160, 288, 114, COP) + txt(292, 140, "r_B1", { size: 10, a: "start" }) + txt(292, 152, "(variabel)", { size: 8.5, a: "start", c: MUT }) + line(270, 170, 270, 200) + txt(278, 198, "B1", { size: 10, a: "start", b: 1 });
    s += line(150, 94, 186, 94) + diodaH(186, 236, 94, 1, COP) + line(236, 94, 270, 94) + txt(146, 98, "E", { size: 10, a: "end", b: 1 }) + txt(222, 216, "η = r_B1/(r_B1 + r_B2)", { size: 9.5, c: COP, b: 1 });
    return svg(350, 222, s);
  };
  G.ujtkurva = function () {
    var x0 = 40, y0 = 185, s = line(x0, y0, 330, y0, INK, 1.3) + line(x0, y0, x0, 15, INK, 1.3) + txt(328, y0 + 14, "I_E", { size: 10, a: "end" }) + txt(x0 + 4, 14, "V_E", { size: 10, a: "start" });
    s += '<path d="M' + x0 + " 170 L56 50 Q60 40 66 46 Q120 150 212 152 Q270 152 330 128" + '" fill="none" stroke="' + COP + '" stroke-width="2.6"/>';
    s += line(x0, 43, 62, 43, MUT, 1).replace("/>", ' stroke-dasharray="3 3"/>') + txt(x0 - 4, 47, "V_P", { size: 9.5, a: "end" }) + line(x0, 152, 212, 152, MUT, 1).replace("/>", ' stroke-dasharray="3 3"/>') + txt(x0 - 4, 156, "V_V", { size: 9.5, a: "end" });
    s += '<circle cx="62" cy="43" r="4.5" fill="' + RED + '"/><circle cx="212" cy="152" r="4.5" fill="' + BLU + '"/>' + txt(72, 34, "titik puncak (I_P, V_P)", { size: 9, a: "start", c: RED }) + txt(212, 172, "titik lembah (I_V, V_V)", { size: 9, c: BLU });
    s += txt(122, 92, "resistansi negatif", { size: 9.5, a: "start", c: COP, b: 1 }) + txt(290, 116, "saturasi", { size: 9, c: MUT }) + txt(50, 120, "cut-off", { size: 9, a: "start", c: MUT });
    return svg(340, 200, s);
  };
  /* =================== ANIMASI MATERI 10: OP-AMP I =================== */
  // segitiga op-amp: kiri di x, tengah y; masukan atas (x, y-15), bawah (x, y+15); keluaran (x+60, y)
  function opTri(x, y, c, plusTop, lab) {
    c = c || INK; var s = '<polygon points="' + x + "," + (y - 32) + " " + x + "," + (y + 32) + " " + (x + 60) + "," + y + '" fill="#fff" stroke="' + c + '" stroke-width="2.4" stroke-linejoin="round"/>';
    s += txt(x + 9, y - 10, plusTop ? "+" : "−", { size: 15, b: 1 }) + txt(x + 9, y + 20, plusTop ? "−" : "+", { size: 15, b: 1 });
    if (lab) s += txt(x + 24, y + 4, lab, { size: 9, c: MUT });
    return s;
  }
  var VSAT = 13;
  function clip(v, l) { l = l || VSAT; return Math.max(-l, Math.min(l, v)); }
  function fV(v) { var a = Math.abs(v); return a >= 1 ? f(v, 2) + " V" : a >= 1e-3 ? f(v * 1000, 2) + " mV" : f(v * 1e6, 1) + " µV"; }
  // plot gelombang: daftar [fungsi(θ), warna, tebal]; skala V
  function gelOp(fns, Vs, opt) {
    opt = opt || {}; var x0 = 20, W = 300, y0 = opt.h ? opt.h / 2 : 70, A = (opt.h ? opt.h / 2 : 70) - 12, s = line(x0, y0, x0 + W, y0, "#c7cfca", 1);
    if (opt.sat) s += line(x0, y0 - VSAT / Vs * A, x0 + W, y0 - VSAT / Vs * A, RED, 1).replace("/>", ' stroke-dasharray="3 3"/>') + line(x0, y0 + VSAT / Vs * A, x0 + W, y0 + VSAT / Vs * A, RED, 1).replace("/>", ' stroke-dasharray="3 3"/>') + txt(x0 + W, y0 - VSAT / Vs * A - 3, "+V_sat", { size: 8.5, a: "end", c: RED });
    fns.forEach(function (fn) { var p = []; for (var k = 0; k <= 160; k++) { var th = k / 160 * 4 * Math.PI, v = fn[0](th); p.push((x0 + k / 160 * W) + "," + (y0 - Math.max(-1.08, Math.min(1.08, v / Vs)) * A)); } s += poly(p.join(" "), fn[1], fn[2] || 2.2); });
    if (opt.cap) s += txt(x0, 11, opt.cap, { size: 9, a: "start", c: MUT });
    return s;
  }
  // rangkaian penguat: mode "noninv" | "inv" | "fol"
  function opCkt(mode, p, st) {
    st = st || {}; var s = "", x = 170, y = 90, on = st.on;
    if (mode === "inv") {
      s += opTri(x, y, INK, false) + line(x, y + 15, 150, y + 15) + line(150, y + 15, 150, 120) + gnd(150, 120);
      s += acSrc(40, 75, 185, "") + txt(40, 200, "v_in", { size: 10, b: 1, c: BLU }) + line(40, 75, 80, 75) + resH(80, 140, 75) + txt(110, 62, "R_i " + fR(p.Ri), { size: 10, b: 1 }) + line(140, 75, x, 75) + dot(150, 75) + gnd(40, 185);
      s += line(150, 75, 150, 35) + line(150, 35, 180, 35) + resH(180, 240, 35) + txt(210, 22, "R_f " + fR(p.Rf), { size: 10, b: 1 }) + line(240, 35, 260, 35) + line(260, 35, 260, 90) + line(x + 60, y, 320, y) + dot(260, 90) + txt(322, 84, "v_out", { size: 10, a: "end", b: 1, c: COP });
      if (st.vn != null) s += txt(150, 142, "v− = 0 V (ground maya)", { size: 9, c: GRN }) + (st.i != null ? arrow(86, 88, 132, 88, BLU) + txt(110, 103, "i = " + fV(st.i).replace("V", "A"), { size: 9, c: BLU }) + arrow(190, 48, 232, 48, BLU) : "");
    } else if (mode === "fol") {
      s += opTri(x, y, INK, true) + acSrc(40, 75, 185, "") + gnd(40, 185) + txt(40, 200, "sumber", { size: 9.5, c: MUT });
      s += line(40, 75, 70, 75) + resH(70, 130, 75) + txt(100, 62, "R_s " + fR(p.Rs), { size: 10, b: 1 }) + line(130, 75, x, 75) + line(x, y + 15, 150, y + 15) + line(150, y + 15, 150, 135) + line(150, 135, 260, 135) + line(260, 135, 260, 90) + line(x + 60, y, 290, y) + dot(260, 90) + resV(290, 90, 170) + line(290, 170, 290, 185) + gnd(290, 185) + txt(302, 134, "R_L", { size: 10, a: "start", b: 1 });
    } else {
      s += opTri(x, y, INK, true) + acSrc(60, 75, 185, "") + gnd(60, 185) + txt(60, 200, "v_in", { size: 10, b: 1, c: BLU }) + line(60, 75, x, 75);
      s += line(x, y + 15, 140, y + 15) + line(140, y + 15, 140, 140) + dot(140, 140) + line(140, 140, 165, 140) + resH(165, 235, 140) + txt(200, 162, "R_f " + fR(p.Rf), { size: 10, b: 1 }) + line(235, 140, 260, 140) + line(260, 140, 260, 90) + dot(260, 90) + resV(140, 140, 185) + gnd(140, 185) + txt(128, 166, "R_i " + fR(p.Ri), { size: 10, a: "end", b: 1 }) + line(x + 60, y, 320, y) + txt(322, 84, "v_out", { size: 10, a: "end", b: 1, c: COP });
      if (st.vn != null) s += txt(96, 68, "v+ = " + fV(st.vp), { size: 9, a: "start", c: GRN }) + txt(72, 114, "v− = " + fV(st.vn), { size: 9, a: "start", c: GRN });
    }
    if (on) s += '<circle cx="' + (x + 30) + '" cy="' + y + '" r="4" fill="' + COP + '"/>';
    return s;
  }
  G.opsimbol = function () {
    var s = opTri(96, 70, COP, false) + line(6, 55, 96, 55) + line(6, 85, 96, 85) + line(156, 70, 180, 70) + line(126, 25, 126, 54) + line(126, 86, 126, 115) + txt(132, 30, "+V_CC", { size: 9.5, a: "start" }) + txt(132, 116, "−V_EE", { size: 9.5, a: "start" });
    s += txt(6, 49, "inverting (v₁)", { size: 8.5, a: "start", c: MUT }) + txt(6, 99, "non-inv. (v₂)", { size: 8.5, a: "start", c: MUT }) + txt(160, 62, "keluaran", { size: 8.5, a: "start", c: MUT }) + txt(110, 138, "simbol", { size: 9, c: MUT });
    var bx = 300, by = 22; s += '<rect x="' + bx + '" y="' + by + '" width="64" height="104" rx="4" fill="#2b2b2b"/><path d="M' + (bx + 24) + " " + by + " a8 8 0 0 0 16 0" + '" fill="#fff"/>' + txt(bx + 32, by + 58, "741", { size: 11, c: "#fff", b: 1 });
    var L = ["Offset null", "In −", "In +", "−V_EE"], R = ["NC", "+V_CC", "Output", "Offset null"];
    for (var i = 0; i < 4; i++) { var yy = by + 16 + i * 24; s += '<rect x="' + (bx - 8) + '" y="' + (yy - 4) + '" width="8" height="8" fill="#bbb"/><rect x="' + (bx + 64) + '" y="' + (yy - 4) + '" width="8" height="8" fill="#bbb"/>' + txt(bx - 12, yy + 4, (i + 1) + " " + L[i], { size: 8.5, a: "end" }) + txt(bx + 76, yy + 4, (8 - i) + " " + R[i], { size: 8.5, a: "start" }); }
    s += txt(bx + 32, 142, "pin LM741 (DIP-8)", { size: 9, c: MUT });
    return svg(450, 150, s);
  };
  G.opblok = function () {
    var s = "", B = [["Penguat", "diferensial", "masukan, CMRR"], ["Penguat", "tegangan", "penguatan besar"], ["Penguat", "keluaran", "push-pull, R_o kecil"]];
    B.forEach(function (b, i) { var x = 30 + i * 108; s += '<rect x="' + x + '" y="36" width="96" height="64" rx="8" fill="' + (i === 1 ? "#f6e7d8" : "#e3ecfb") + '" stroke="#9aa5a0"/>' + txt(x + 48, 56, b[0], { size: 9.5, b: 1 }) + txt(x + 48, 70, b[1], { size: 9.5, b: 1 }) + txt(x + 48, 88, b[2], { size: 8, c: MUT }); if (i < 2) s += arrow(x + 96, 68, x + 108, 68, INK); });
    s += arrow(4, 56, 30, 56, BLU) + arrow(4, 80, 30, 80, BLU) + txt(2, 50, "v₁", { size: 9, a: "start", c: BLU }) + txt(2, 94, "v₂", { size: 9, a: "start", c: BLU }) + arrow(342, 68, 356, 68, COP);
    s += txt(180, 124, "LM741: ± 20 transistor + kapasitor kompensasi 30 pF", { size: 9, c: MUT });
    return svg(360, 135, s);
  };
  G.opmodel = function () {
    var s = '<rect x="40" y="20" width="270" height="150" rx="8" fill="none" stroke="#9aa5a0" stroke-dasharray="5 4"/>' + line(10, 50, 80, 50) + line(10, 140, 80, 140) + txt(8, 44, "v₁ (−)", { size: 9.5, a: "start", b: 1 }) + txt(8, 156, "v₂ (+)", { size: 9.5, a: "start", b: 1 });
    s += line(80, 50, 80, 62) + resV(80, 62, 128) + line(80, 128, 80, 140) + txt(92, 98, "R_i", { size: 10, a: "start", b: 1 }) + txt(66, 98, "v_d", { size: 10, a: "end", c: BLU });
    s += '<polygon points="200,72 222,95 200,118 178,95" fill="#fff" stroke="' + COP + '" stroke-width="2.2"/>' + txt(200, 99, "A·v_d", { size: 9, b: 1, c: COP }) + line(200, 40, 200, 72) + line(200, 118, 200, 160) + gnd(200, 160);
    s += line(200, 40, 220, 40) + resH(220, 280, 40) + txt(250, 28, "R_o", { size: 10, b: 1 }) + line(280, 40, 340, 40) + txt(342, 34, "v_o", { size: 10, a: "end", b: 1, c: COP });
    s += txt(176, 186, "v_o = A·v_d = A(v₂ − v₁)", { size: 11, b: 1, c: COP });
    return svg(350, 195, s);
  };
  G.opmode = function () {
    var s = "", P = [["single-ended", 1, "satu sinyal"], ["diferensial", 2, "dua sinyal berlawanan"], ["common-mode", 3, "sinyal sama di kedua masukan"]];
    P.forEach(function (pp, i) {
      var x = 10 + i * 126, y = 62; s += opTri(x + 44, y, INK, false) + line(x + 104, y, x + 114, y);
      var a = '<path d="M' + (x + 4) + " " + (y - 15) + " q4 -8 8 0 t8 0" + '" fill="none" stroke="' + BLU + '" stroke-width="1.8"/>', b = '<path d="M' + (x + 4) + " " + (y + 15) + " q4 -8 8 0 t8 0" + '" fill="none" stroke="' + BLU + '" stroke-width="1.8"/>', bInv = '<path d="M' + (x + 4) + " " + (y + 15) + " q4 8 8 0 t8 0" + '" fill="none" stroke="' + RED + '" stroke-width="1.8"/>';
      s += line(x + 22, y - 15, x + 44, y - 15) + line(x + 22, y + 15, x + 44, y + 15);
      if (pp[1] === 1) s += a + gnd(x + 22, y + 15).replace("", ""); else if (pp[1] === 2) s += a + bInv; else s += a + b;
      s += txt(x + 74, 112, pp[1] === 3 ? "keluaran ≈ 0" : "diperkuat", { size: 9, c: pp[1] === 3 ? RED : COP, b: 1 }) + txt(x + 60, 132, pp[0], { size: 10, b: 1 }) + txt(x + 60, 146, pp[2], { size: 8, c: MUT });
    });
    return svg(390, 152, s);
  };
  G.fbblok = function () {
    var s = '<circle cx="70" cy="60" r="14" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' + txt(70, 65, "Σ", { size: 14, b: 1 }) + arrow(10, 60, 56, 60, BLU) + txt(14, 52, "v_in", { size: 10, a: "start", c: BLU }) + txt(52, 52, "+", { size: 12, b: 1 }) + txt(58, 88, "−", { size: 14, b: 1 });
    s += arrow(84, 60, 130, 60, INK) + '<rect x="130" y="40" width="80" height="40" rx="6" fill="#f6e7d8" stroke="#9aa5a0"/>' + txt(170, 65, "A (op-amp)", { size: 10, b: 1 }) + arrow(210, 60, 330, 60, COP) + txt(326, 52, "v_out", { size: 10, a: "end", c: COP });
    s += line(280, 60, 280, 120) + dot(280, 60) + arrow(280, 120, 210, 120, INK) + '<rect x="130" y="102" width="80" height="36" rx="6" fill="#e3ecfb" stroke="#9aa5a0"/>' + txt(170, 125, "β (R_i, R_f)", { size: 10, b: 1 }) + line(130, 120, 70, 120) + arrow(70, 120, 70, 74, INK);
    s += txt(170, 158, "A_cl = A/(1 + Aβ) ≈ 1/β bila Aβ ≫ 1", { size: 10.5, b: 1, c: GRN });
    return svg(340, 168, s);
  };
  G.noninv = function (p) { return svg(340, 210, opCkt("noninv", { Ri: +p.Ri, Rf: +p.Rf })); };
  G.inv = function (p) { return svg(340, 210, opCkt("inv", { Ri: +p.Ri, Rf: +p.Rf })); };
  G.fol = function (p) { return svg(340, 210, opCkt("fol", { Rs: +p.Rs || 10000 })); };
  // A.oploop: penguat loop terbuka & saturasi
  A.oploop = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 200"><g class="g"></g></svg><div class="readout or"></div><div class="ctrl"><button class="btn sm ghost" data-a="1e4">A = 10⁴</button><button class="btn sm ghost" data-a="1e5">A = 10⁵</button><button class="btn sm ghost" data-a="2e5">A = 2×10⁵ (741)</button></div><div class="ctrl">' + slider("v_d = v₂ − v₁", -200, 200, 1, 40, "µV") + "</div>";
    var A0 = 2e5, sl = el.querySelector("input");
    function draw() {
      var vd = +sl.value * 1e-6; el.querySelector(".val").textContent = sl.value;
      var raw = A0 * vd, vo = clip(raw), cx = 170, cy = 100, X = function (u) { return cx + u / 200 * 150; }, Y = function (v) { return cy - v / 15 * 85; };
      var s = line(15, cy, 330, cy, INK, 1.3) + line(cx, 12, cx, 190, INK, 1.3) + txt(328, cy + 14, "v_d (µV)", { size: 9, a: "end" }) + txt(cx + 4, 14, "v_out (V)", { size: 9, a: "start" }) + txt(X(-200), cy + 14, "−200", { size: 8.5, c: MUT }) + txt(X(200) - 6, cy - 6, "+200", { size: 8.5, c: MUT });
      var pts = []; for (var k = -200; k <= 200; k += 2) pts.push(X(k) + "," + Y(clip(A0 * k * 1e-6))); s += poly(pts.join(" "), COP, 2.6);
      s += line(15, Y(VSAT), 330, Y(VSAT), RED, 1).replace("/>", ' stroke-dasharray="3 3"/>') + line(15, Y(-VSAT), 330, Y(-VSAT), RED, 1).replace("/>", ' stroke-dasharray="3 3"/>') + txt(20, Y(VSAT) - 4, "+V_sat ≈ +13 V", { size: 8.5, a: "start", c: RED }) + txt(330, Y(-VSAT) + 12, "−V_sat ≈ −13 V", { size: 8.5, a: "end", c: RED });
      var lin = VSAT / A0 * 1e6; s += '<rect x="' + X(-lin) + '" y="12" width="' + (X(lin) - X(-lin)) + '" height="178" fill="' + BLU + '" opacity=".07"/>' + txt(cx, 186, "daerah linier ±" + f(lin, 1) + " µV", { size: 8.5, c: BLU });
      s += '<circle cx="' + X(+sl.value) + '" cy="' + Y(vo) + '" r="6" fill="' + GRN + '"/>';
      el.querySelector(".g").innerHTML = s;
      el.querySelector(".or").innerHTML = "v_out = A·v_d = " + f(A0, 0) + " × " + f(+sl.value, 0) + " µV = " + f(raw, 2) + " V" + (Math.abs(raw) > VSAT ? ' → <span class="tag no">SATURASI: v_out = ' + f(vo, 0) + " V</span>" : ' <span class="tag ok">linier</span>') + " · v_d yang membuat saturasi hanya 13 V / A = <b>" + f(lin, 1) + " µV</b>";
      $$(el, "[data-a]").forEach(function (x) { x.classList.toggle("on", +x.dataset.a === A0); });
    }
    $$(el, "[data-a]").forEach(function (x) { x.onclick = function () { A0 = +x.dataset.a; draw(); }; });
    sl.addEventListener("input", draw); draw();
  };
  // A.cmrr: derau common-mode 50 Hz + sinyal diferensial kecil
  A.cmrr = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 120"><g class="i"></g></svg><svg class="diag" viewBox="0 0 340 120"><g class="o"></g></svg><div class="readout cr"></div><div class="ctrl">' + slider("CMRR", 20, 120, 1, 40, "dB") + slider("derau common-mode", 0, 2, 0.1, 1, "V") + "</div>";
    var ins = $$(el, "input"), Ad = 100, vs = 0.01;
    function draw() {
      var db = +ins[0].value, vn = +ins[1].value; $$(el, ".val")[0].textContent = db; $$(el, ".val")[1].textContent = f(vn, 1);
      var cm = Math.pow(10, db / 20), Acm = Ad / cm, sig = function (t) { return vs * Math.sin(t * 8); }, noi = function (t) { return vn * Math.sin(t); };
      el.querySelector(".i").innerHTML = gelOp([[function (t) { return noi(t) + sig(t) / 2; }, BLU, 1.8], [function (t) { return noi(t) - sig(t) / 2; }, RED, 1.4]], 2.2, { h: 120, cap: "masukan: v₂ (biru) dan v₁ (merah) = derau 50 Hz yang sama + sinyal kecil" });
      el.querySelector(".o").innerHTML = gelOp([[function (t) { return Ad * sig(t); }, "#9aa5a0", 1.2], [function (t) { return Ad * sig(t) + Acm * noi(t); }, COP, 2.4]], Math.max(1.2, Ad * vs + Acm * vn) * 1.05, { h: 120, cap: "keluaran: ideal (abu-abu) vs nyata (tembaga)" });
      var en = Acm * vn, es = Ad * vs;
      el.querySelector(".cr").innerHTML = "A_d = 100, CMRR = " + db + " dB = " + f(cm, 0) + " → A_cm = A_d/CMRR = " + f(Acm, 4) + " · sinyal keluar = 100 × 10 mV = <b>" + f(es, 2) + " V</b> · derau keluar = " + f(Acm, 4) + " × " + f(vn, 1) + " V = <b>" + fV(en) + "</b>" + (en > 0.1 * es ? ' <span class="tag no">derau mengganggu</span>' : ' <span class="tag ok">derau tertekan</span>');
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  // A.offset: tegangan offset diperkuat
  A.offset = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 150"><g class="w"></g></svg><div class="readout fr"></div><div class="ctrl">' + slider("V_OS", -5, 5, 0.1, 2, "mV") + slider("penguatan A_cl", 1, 1000, 1, 100, "") + slider("trimpot nulling", -5, 5, 0.1, 0, "mV") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var vos = +ins[0].value, G = +ins[1].value, nul = +ins[2].value; $$(el, ".val")[0].textContent = f(vos, 1); $$(el, ".val")[1].textContent = G; $$(el, ".val")[2].textContent = f(nul, 1);
      var err = G * (vos - nul) / 1000, amp = Math.min(10, G * 0.05);
      el.querySelector(".w").innerHTML = gelOp([[function (t) { return amp * Math.sin(t); }, "#9aa5a0", 1.2], [function (t) { return clip(amp * Math.sin(t) + err); }, COP, 2.4]], 15, { h: 150, sat: 1, cap: "abu-abu: keluaran ideal · tembaga: keluaran dengan offset" });
      el.querySelector(".fr").innerHTML = "V_out(error) = A_cl × (V_OS − koreksi) = " + G + " × " + f(vos - nul, 1) + " mV = <b>" + fV(err) + "</b>" + (Math.abs(err) > 1 ? ' <span class="tag no">bergeser besar</span>' : ' <span class="tag ok">kecil</span>') + " · LM741: trimpot 10 kΩ di pin 1–5, wiper ke −V_EE";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  // A.slew: keterbatasan slew rate
  A.slew = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 160"><g class="w"></g></svg><div class="readout sr"></div><div class="ctrl"><button class="btn sm ghost" data-s="0.5">741 (0,5 V/µs)</button><button class="btn sm ghost" data-s="13">TL071 (13 V/µs)</button></div><div class="ctrl">' + slider("frekuensi", 1, 100, 1, 20, "kHz") + slider("V_p keluaran", 1, 12, 0.5, 10, "V") + "</div>";
    var ins = $$(el, "input"), SR = 0.5;
    function draw() {
      var fk = +ins[0].value, Vp = +ins[1].value; $$(el, ".val")[0].textContent = fk; $$(el, ".val")[1].textContent = f(Vp, 1);
      var fmax = SR * 1e6 / (2 * Math.PI * Vp) / 1000, N = 600, dt = 2 / (fk * 1000) / N, v = 0, ideal = [], real = [], x0 = 20, W = 300, y0 = 82, Aa = 66 / 12;
      for (var k = 0; k <= N * 2; k++) { var t = k * dt, vi = Vp * Math.sin(2 * Math.PI * fk * 1000 * t), dv = vi - v, mx = SR * 1e6 * dt; v += Math.max(-mx, Math.min(mx, dv)); if (k >= N) { var X = x0 + (k - N) / N * W; ideal.push(X + "," + (y0 - vi * Aa)); real.push(X + "," + (y0 - v * Aa)); } }
      el.querySelector(".w").innerHTML = line(x0, y0, x0 + W, y0, "#c7cfca", 1) + poly(ideal.join(" "), "#9aa5a0", 1.3).replace("/>", ' stroke-dasharray="4 3"/>') + poly(real.join(" "), COP, 2.4) + txt(x0, 12, "abu-abu: yang seharusnya · tembaga: keluaran nyata (2 periode)", { size: 9, a: "start", c: MUT });
      el.querySelector(".sr").innerHTML = "Laju maksimum sinus = 2π·f·V_p = 2π × " + fk + " kHz × " + f(Vp, 1) + " V = " + f(2 * Math.PI * fk * 1e3 * Vp / 1e6, 2) + " V/µs · f_maks = SR/(2πV_p) = <b>" + f(fmax, 2) + " kHz</b> " + (fk > fmax ? '<span class="tag no">terdistorsi menjadi segitiga</span>' : '<span class="tag ok">tidak terbatasi SR</span>');
      $$(el, "[data-s]").forEach(function (x) { x.classList.toggle("on", +x.dataset.s === SR); });
    }
    $$(el, "[data-s]").forEach(function (x) { x.onclick = function () { SR = +x.dataset.s; draw(); }; });
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  // A.gbw: diagram Bode sederhana
  A.gbw = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 200"><g class="g"></g></svg><div class="readout gr"></div><div class="ctrl">' + slider("A_cl", 1, 1000, 1, 100, "") + slider("log f sinyal", 0, 6, 0.1, 3, "") + "</div>";
    var ins = $$(el, "input"), GBW = 1e6, A0 = 2e5;
    function Aol(fq) { return A0 / Math.sqrt(1 + Math.pow(fq / (GBW / A0), 2)); }
    function draw() {
      var Acl = +ins[0].value, lf = +ins[1].value, fq = Math.pow(10, lf); $$(el, ".val")[0].textContent = Acl; $$(el, ".val")[1].textContent = f(lf, 1) + " (" + (fq >= 1000 ? f(fq / 1000, 1) + " kHz" : f(fq, 0) + " Hz") + ")";
      var x0 = 40, y0 = 180, X = function (l) { return x0 + l / 7 * 290; }, Y = function (db) { return y0 - db / 110 * 165; };
      var s = line(x0, y0, 335, y0, INK, 1.3) + line(x0, y0, x0, 10, INK, 1.3) + txt(x0 + 4, 12, "penguatan (dB)", { size: 9, a: "start" }) + txt(335, y0 - 4, "f (Hz, log)", { size: 9, a: "end" });
      for (var d = 0; d <= 7; d++) s += txt(X(d), y0 + 12, d === 0 ? "1" : d < 3 ? String(Math.pow(10, d)) : d < 6 ? Math.pow(10, d - 3) + "k" : Math.pow(10, d - 6) + "M", { size: 8, c: MUT });
      for (var db = 0; db <= 100; db += 20) s += txt(x0 - 4, Y(db) + 3, String(db), { size: 8, a: "end", c: MUT });
      var p = [], q = []; for (var k = 0; k <= 140; k++) { var l = k / 20, ff = Math.pow(10, l), a = Aol(ff); p.push(X(l) + "," + Y(20 * Math.log10(a))); var acl = Acl / Math.sqrt(1 + Math.pow(ff / (GBW / Acl), 2)); q.push(X(l) + "," + Y(Math.max(0, 20 * Math.log10(acl)))); }
      s += poly(p.join(" "), "#9aa5a0", 1.6) + txt(X(1.2), Y(106) + 4, "loop terbuka (741)", { size: 8.5, a: "start", c: MUT }) + poly(q.join(" "), COP, 2.6);
      var fc = GBW / Acl, gNow = Acl / Math.sqrt(1 + Math.pow(fq / fc, 2));
      s += line(X(Math.log10(fc)), y0, X(Math.log10(fc)), Y(20 * Math.log10(Acl) - 3), BLU, 1).replace("/>", ' stroke-dasharray="3 3"/>') + txt(X(Math.log10(fc)), y0 - 6, "f_c", { size: 9, c: BLU, b: 1 });
      s += '<circle cx="' + X(lf) + '" cy="' + Y(Math.max(0, 20 * Math.log10(gNow))) + '" r="5" fill="' + GRN + '"/>';
      el.querySelector(".g").innerHTML = s;
      el.querySelector(".gr").innerHTML = "GBW 741 = 1 MHz · f_c = GBW/A_cl = 1 MHz/" + Acl + " = <b>" + (fc >= 1000 ? f(fc / 1000, 2) + " kHz" : f(fc, 1) + " Hz") + "</b> · pada f sinyal ini penguatan = <b>" + f(gNow, 2) + "</b> (" + f(20 * Math.log10(gNow), 1) + " dB)";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  // A.feedback: A_cl = A/(1 + Aβ)
  A.feedback = function (el) {
    el.innerHTML = '<div class="fbg"></div><table class="tabel small fb" style="margin:4px 0"></table><div class="ctrl">' + slider("log A (loop terbuka)", 2, 6, 0.1, 5.3, "") + slider("β = R_i/(R_i + R_f)", 0.01, 1, 0.01, 0.1, "") + "</div>";
    el.querySelector(".fbg").innerHTML = G.fbblok();
    var ins = $$(el, "input");
    function draw() {
      var A0 = Math.pow(10, +ins[0].value), b = +ins[1].value; $$(el, ".val")[0].textContent = f(+ins[0].value, 1) + " (A = " + f(A0, 0) + ")"; $$(el, ".val")[1].textContent = f(b, 2);
      var Acl = A0 / (1 + A0 * b), ideal = 1 / b, err = (ideal - Acl) / ideal * 100, A2 = A0 / 2, Acl2 = A2 / (1 + A2 * b);
      el.querySelector(".fb").innerHTML = "<tr><th>Besaran</th><th>Nilai</th></tr><tr><td>Aβ (penguatan loop)</td><td>" + f(A0 * b, 0) + "</td></tr><tr><td>A_cl = A/(1 + Aβ)</td><td><b>" + f(Acl, 4) + "</b></td></tr><tr><td>Ideal 1/β</td><td>" + f(ideal, 4) + "</td></tr><tr><td>Selisih</td><td>" + f(err, 4) + " %</td></tr><tr><td>Bila A turun separuh (suhu, sampel lain)</td><td>A_cl = " + f(Acl2, 4) + " (berubah " + f((Acl - Acl2) / Acl * 100, 4) + " %)</td></tr>";
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  // A.penguat: penguat non-inverting / inverting dengan gelombang
  A.penguat = function (el) {
    var mode = el.dataset.mode || "noninv";
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 210"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 140"><g class="w"></g></svg><div class="readout pr"></div><div class="ctrl"><button class="btn sm ghost" data-m="noninv">Non-inverting</button><button class="btn sm ghost" data-m="inv">Inverting</button></div><div class="ctrl">' + slider("R_i", 1, 100, 1, 10, "kΩ") + slider("R_f", 0, 470, 1, 100, "kΩ") + slider("v_in puncak", 0.05, 3, 0.05, 0.5, "V") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var Ri = +ins[0].value, Rf = +ins[1].value, vi = +ins[2].value; $$(el, ".val")[0].textContent = Ri; $$(el, ".val")[1].textContent = Rf; $$(el, ".val")[2].textContent = f(vi, 2);
      var Av = mode === "inv" ? -Rf / Ri : 1 + Rf / Ri, vo = Av * vi, sat = Math.abs(vo) > VSAT, i = vi / Ri / 1000;
      el.querySelector(".c").innerHTML = opCkt(mode, { Ri: Ri * 1000, Rf: Rf * 1000 }, mode === "inv" ? { vn: 0, i: i } : { vp: vi, vn: vi });
      el.querySelector(".w").innerHTML = gelOp([[function (t) { return vi * Math.sin(t); }, BLU, 1.8], [function (t) { return clip(Av * vi * Math.sin(t)); }, COP, 2.4]], Math.max(vi * 1.1, Math.min(15, Math.abs(vo) * 1.1)), { h: 140, sat: Math.abs(vo) > VSAT * 0.8, cap: "biru: v_in · tembaga: v_out" + (mode === "inv" ? " (terbalik 180°)" : " (sefase)") });
      el.querySelector(".pr").innerHTML = (mode === "inv" ? "A_v = −R_f/R_i = −" + Rf + "/" + Ri + " = <b>" + f(Av, 3) + "</b> · i = v_in/R_i = " + f(vi, 2) + " V/" + Ri + " kΩ = " + f(i * 1e6, 1) + " µA mengalir terus lewat R_f" : "A_v = 1 + R_f/R_i = 1 + " + Rf + "/" + Ri + " = <b>" + f(Av, 3) + "</b> · v− = v+ = v_in (hubung singkat maya)") + " · v_out puncak = " + f(Av, 3) + " × " + f(vi, 2) + " = <b>" + f(vo, 2) + " V</b>" + (sat ? ' <span class="tag no">melebihi ±13 V → terpotong</span>' : "");
      $$(el, "[data-m]").forEach(function (x) { x.classList.toggle("on", x.dataset.m === mode); });
    }
    $$(el, "[data-m]").forEach(function (x) { x.onclick = function () { mode = x.dataset.m; draw(); }; });
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  // A.buffer: efek pembebanan dengan/tanpa pengikut tegangan
  A.buffer = function (el) {
    var buf = true;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 210"><g class="c"></g></svg><div class="readout br"></div><div class="ctrl"><button class="btn sm ghost" data-b="0">Tanpa buffer</button><button class="btn sm ghost" data-b="1">Dengan voltage follower</button></div><div class="ctrl">' + slider("R_s sumber", 1, 1000, 1, 100, "kΩ") + slider("R_L beban", 0.1, 100, 0.1, 1, "kΩ") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var Rs = +ins[0].value, RL = +ins[1].value, Vs = 1; $$(el, ".val")[0].textContent = Rs; $$(el, ".val")[1].textContent = f(RL, 1);
      var VL = buf ? Vs : Vs * RL / (Rs + RL), s;
      if (buf) s = opCkt("fol", { Rs: Rs * 1000 }) + txt(290, 205, "R_L " + fR(RL * 1000), { size: 9.5, c: MUT });
      else s = acSrc(40, 75, 185, "") + gnd(40, 185) + line(40, 75, 70, 75) + resH(70, 130, 75) + txt(100, 62, "R_s " + fR(Rs * 1000), { size: 10, b: 1 }) + line(130, 75, 290, 75) + resV(290, 75, 170) + line(290, 170, 290, 185) + gnd(290, 185) + txt(302, 126, "R_L " + fR(RL * 1000), { size: 10, a: "start", b: 1 }) + txt(40, 200, "sumber", { size: 9.5, c: MUT });
      s += txt(320, 30, "V_L = " + f(VL, 3) + " V", { size: 12, a: "end", b: 1, c: VL > 0.9 ? GRN : RED });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".br").innerHTML = "Sumber 1 V (mis. sensor) · " + (buf ? "follower: I masuk op-amp ≈ 0 → tidak ada tegangan hilang di R_s → V_L = V_s = <b>1 V</b> (100 %)" : "pembagi tegangan: V_L = V_s·R_L/(R_s + R_L) = 1 × " + f(RL, 1) + "/(" + Rs + " + " + f(RL, 1) + ") = <b>" + f(VL, 4) + " V</b> (" + f(VL * 100, 2) + " %)");
      $$(el, "[data-b]").forEach(function (x) { x.classList.toggle("on", (x.dataset.b === "1") === buf); });
    }
    $$(el, "[data-b]").forEach(function (x) { x.onclick = function () { buf = x.dataset.b === "1"; draw(); }; });
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  /* =================== ANIMASI MATERI 11: OP-AMP II (PRODUK) =================== */
  // penjumlah inverting: ins = [{lab, R}], Rf
  function sumCkt(ins, Rf, opt) {
    opt = opt || {}; var x = 210, y = 100, s = opTri(x, y, INK, false), ys = [], n = ins.length, top = 50, step = n > 3 ? 34 : 44;
    s += line(x, y + 15, 192, y + 15) + line(192, y + 15, 192, 128) + gnd(192, 128);
    ins.forEach(function (it, i) { var yy = top + i * step; ys.push(yy); s += txt(8, yy + 4, it.lab, { size: 9.5, a: "start", b: 1, c: it.on === false ? MUT : BLU }) + line(54, yy, 66, yy) + resH(66, 126, yy, it.on === false ? "#c7cfca" : COP) + txt(96, yy - 9, fR(it.R), { size: 9 }) + line(126, yy, 150, yy) + dot(150, yy); });
    var yb = Math.max(ys[ys.length - 1], y - 15); s += line(150, 22, 150, yb) + line(150, y - 15, x, y - 15) + dot(150, y - 15);
    s += line(150, 22, 196, 22) + resH(196, 256, 22) + txt(226, 12, "R_f " + fR(Rf), { size: 9.5, b: 1 }) + line(256, 22, 290, 22) + line(290, 22, 290, y) + dot(290, y) + line(x + 60, y, 334, y) + txt(334, y - 6, "v_out", { size: 10, a: "end", b: 1, c: COP });
    if (opt.vo != null) s += txt(334, y + 18, f(opt.vo, 3) + " V", { size: 11, a: "end", b: 1, c: COP });
    return s;
  }
  G.penjumlah = function (p) { var L = []; ["V1", "V2", "V3", "V4"].forEach(function (k, i) { if (p["R" + (i + 1)]) L.push({ lab: (p[k] != null ? f(+p[k], 2) + " V" : "v" + (i + 1)), R: +p["R" + (i + 1)] }); }); return svg(340, Math.max(190, 60 + L.length * 40), sumCkt(L, +p.Rf)); };
  // A.mixer: mixer audio 3 kanal
  A.mixer = function (el) {
    var t = 0, play = true, ch = [["Vokal", BLU, function (u) { return 0.65 * Math.sin(6 * u) + 0.16 * Math.sin(18 * u); }], ["Gitar", GRN, function (u) { return 0.52 * (Math.sin(3 * u) + 0.4 * Math.sin(9 * u + 1)); }], ["Bass", RED, function (u) { return 0.8 * Math.sin(u); }]];
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 190"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 150"><g class="w"></g></svg><div class="readout mx"></div><div class="ctrl"><button class="btn sm ghost" data-a="p">❚❚</button></div><div class="ctrl">' + slider("Fader vokal (R_f/R₁)", 0, 10, 0.1, 2, "×") + slider("Fader gitar (R_f/R₂)", 0, 10, 0.1, 1.5, "×") + slider("Fader bass (R_f/R₃)", 0, 10, 0.1, 1, "×") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var g = ins.map(function (i) { return +i.value; }); g.forEach(function (v, i) { $$(el, ".val")[i].textContent = f(v, 1); });
      var Rf = 10000, out = function (u) { return clip(-(g[0] * ch[0][2](u) + g[1] * ch[1][2](u) + g[2] * ch[2][2](u))); };
      var pk = 0; for (var k = 0; k < 200; k++) pk = Math.max(pk, Math.abs(-(g[0] * ch[0][2](k / 200 * 6.283) + g[1] * ch[1][2](k / 200 * 6.283) + g[2] * ch[2][2](k / 200 * 6.283))));
      el.querySelector(".c").innerHTML = sumCkt(ch.map(function (c, i) { return { lab: c[0], R: g[i] > 0 ? Rf / g[i] : 1e9, on: g[i] > 0 }; }), Rf);
      var x0 = 20, W = 300, s = "", lane = function (fn, y0, A, c, w) { var p = []; for (var k = 0; k <= 150; k++) { var u = t + k / 150 * 2 * Math.PI; p.push((x0 + k / 150 * W) + "," + (y0 - fn(u) * A)); } return poly(p.join(" "), c, w); };
      ch.forEach(function (c, i) { s += txt(x0, 12 + i * 20, c[0], { size: 8.5, a: "start", c: c[1] }) + lane(c[2], 10 + i * 20, 8, c[1], 1.2); });
      var Ao = 34 / Math.max(2, Math.min(VSAT, pk)); s += line(x0, 110, x0 + W, 110, "#c7cfca", 1) + (pk > VSAT * 0.8 ? line(x0, 110 - VSAT * Ao, x0 + W, 110 - VSAT * Ao, RED, 0.8).replace("/>", ' stroke-dasharray="3 3"/>') + line(x0, 110 + VSAT * Ao, x0 + W, 110 + VSAT * Ao, RED, 0.8).replace("/>", ' stroke-dasharray="3 3"/>') : "") + lane(out, 110, Ao, COP, 2.4) + txt(x0, 72, "keluaran mixer (terbalik, ke power amp)", { size: 8.5, a: "start", c: COP });
      el.querySelector(".w").innerHTML = s;
      el.querySelector(".mx").innerHTML = "v_out = −(R_f/R₁·v₁ + R_f/R₂·v₂ + R_f/R₃·v₃) · R_f = 10 kΩ → R₁ = " + (g[0] ? fR(Rf / g[0]) : "∞") + ", R₂ = " + (g[1] ? fR(Rf / g[1]) : "∞") + ", R₃ = " + (g[2] ? fR(Rf / g[2]) : "∞") + " · puncak keluaran ≈ <b>" + f(pk, 2) + " V</b>" + (pk > VSAT ? ' <span class="tag no">terpotong (clipping)</span>' : ' <span class="tag ok">aman</span>');
    }
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
    loop(el, function (dt) { if (play) { t += dt * 2; draw(); } });
  };
  // A.dac: DAC 4-bit berbobot biner
  A.dac = function (el) {
    var bits = [1, 0, 1, 1], mode = "manual", code = 0, acc = 0, hist = [];
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 210"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 120"><g class="w"></g></svg><div class="readout dr"></div><div class="ctrl">' + [0, 1, 2, 3].map(function (i) { return '<button class="btn sm ghost" data-b="' + i + '">b' + (3 - i) + "</button>"; }).join("") + '</div><div class="ctrl"><button class="btn sm ghost" data-m="manual">Manual</button><button class="btn sm ghost" data-m="tangga">Hitung 0–15</button><button class="btn sm ghost" data-m="sinus">Putar "musik" (sinus)</button></div>';
    var R = 10000;
    function vo(b) { return -(b[0] + b[1] / 2 + b[2] / 4 + b[3] / 8); }
    function draw() {
      var n = bits[0] * 8 + bits[1] * 4 + bits[2] * 2 + bits[3], v = vo(bits);
      el.querySelector(".c").innerHTML = sumCkt(bits.map(function (b, i) { return { lab: "b" + (3 - i) + "=" + b, R: R * Math.pow(2, i), on: !!b }; }), R, { vo: v });
      var s = line(20, 10, 20, 112, INK, 1) + line(20, 112, 330, 112, INK, 1) + txt(24, 10, "|v_out| (V)", { size: 8.5, a: "start" }), p = [];
      hist.forEach(function (h, i) { var X = 20 + i * (310 / 48), Y = 112 - h / 1.875 * 95; p.push(X + "," + Y, (X + 310 / 48) + "," + Y); });
      if (p.length) s += poly(p.join(" "), COP, 2.2);
      if (mode === "sinus") { var q = []; for (var k = 0; k <= 48; k++) q.push((20 + k * 310 / 48) + "," + (112 - (0.9375 + 0.9375 * Math.sin((acc - 48 + k) / 16 * 2 * Math.PI)) / 1.875 * 95)); s += poly(q.join(" "), "#9aa5a0", 1).replace("/>", ' stroke-dasharray="3 3"/>'); }
      el.querySelector(".w").innerHTML = s;
      el.querySelector(".dr").innerHTML = "Kode biner <b>" + bits.join("") + "</b> = " + n + " · v_out = −(b3 + b2/2 + b1/4 + b0/8) × 1 V = −(" + bits[0] + " + " + f(bits[1] / 2, 2) + " + " + f(bits[2] / 4, 2) + " + " + f(bits[3] / 8, 3) + ") = <b>" + f(v, 3) + " V</b> · resolusi (1 LSB) = 0,125 V";
      $$(el, "[data-b]").forEach(function (x) { x.classList.toggle("on", !!bits[+x.dataset.b]); });
      $$(el, "[data-m]").forEach(function (x) { x.classList.toggle("on", x.dataset.m === mode); });
    }
    function push() { hist.push(-vo(bits)); if (hist.length > 48) hist.shift(); }
    $$(el, "[data-b]").forEach(function (x) { x.onclick = function () { mode = "manual"; bits[+x.dataset.b] ^= 1; push(); draw(); }; });
    $$(el, "[data-m]").forEach(function (x) { x.onclick = function () { mode = x.dataset.m; draw(); }; });
    push(); draw();
    var tm = 0; loop(el, function (dt) { if (mode === "manual") return; tm += dt; if (tm < 0.12) return; tm = 0; acc++; if (mode === "tangga") code = (code + 1) % 16; else code = Math.round(7.5 + 7.5 * Math.sin(acc / 16 * 2 * Math.PI)); bits = [code >> 3 & 1, code >> 2 & 1, code >> 1 & 1, code & 1]; push(); draw(); });
  };
  // penguat pengurang (diferensial)
  function diffCkt(p, st) {
    st = st || {}; var x = 210, y = 100, s = opTri(x, y, INK, false);
    s += txt(8, 89, "v₁", { size: 10, a: "start", b: 1, c: RED }) + line(24, 85, 70, 85) + resH(70, 130, 85) + txt(100, 74, "R₁ " + fR(p.R1), { size: 9.5, b: 1 }) + line(130, 85, x, 85) + dot(150, 85);
    s += txt(8, 119, "v₂", { size: 10, a: "start", b: 1, c: BLU }) + line(24, 115, 70, 115) + resH(70, 130, 115) + txt(100, 134, "R₃ " + fR(p.R3), { size: 9.5, b: 1 }) + line(130, 115, x, 115) + dot(170, 115) + resV(170, 115, 175) + gnd(170, 175) + txt(182, 160, "R₄ " + fR(p.R4), { size: 9.5, a: "start", b: 1 });
    s += line(150, 85, 150, 40) + line(150, 40, 196, 40) + resH(196, 256, 40) + txt(226, 28, "R₂ " + fR(p.R2), { size: 9.5, b: 1 }) + line(256, 40, 290, 40) + line(290, 40, 290, y) + dot(290, y) + line(x + 60, y, 334, y) + txt(334, y - 6, "v_out", { size: 10, a: "end", b: 1, c: COP });
    if (st.vo != null) s += txt(334, y + 18, f(st.vo, 3) + " V", { size: 11, a: "end", b: 1, c: COP });
    return s;
  }
  G.pengurang = function (p) { return svg(340, 190, diffCkt({ R1: +p.R1, R2: +p.R2, R3: +p.R3, R4: +p.R4 })); };
  A.diffamp = function (el) {
    var t = 0;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 190"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 130"><g class="w"></g></svg><div class="readout fr"></div><div class="ctrl">' + slider("ketidakcocokan R₄", 0, 10, 0.5, 0, "%") + slider("derau common-mode 50 Hz", 0, 2, 0.1, 1, "V") + "</div>";
    var ins = $$(el, "input"), R1 = 10000, R2 = 100000, R3 = 10000;
    function draw(dt) {
      t += dt || 0; var e = +ins[0].value / 100, vn = +ins[1].value; $$(el, ".val")[0].textContent = f(+ins[0].value, 1); $$(el, ".val")[1].textContent = f(vn, 1);
      var R4 = R2 * (1 + e), kp = R4 / (R3 + R4) * (1 + R2 / R1), km = R2 / R1, vd = 0.05, out = function (u) { var cm = vn * Math.sin(u), d = vd * Math.sin(7 * u); return clip(kp * (cm + d / 2) - km * (cm - d / 2)); };
      var Acm = kp - km, Ad = (kp + km) / 2;
      el.querySelector(".c").innerHTML = diffCkt({ R1: R1, R2: R2, R3: R3, R4: R4 });
      el.querySelector(".w").innerHTML = gelOp([[function (u) { return vn * Math.sin(u + t) + vd / 2 * Math.sin(7 * (u + t)); }, BLU, 1.3], [function (u) { return out(u + t); }, COP, 2.4]], Math.max(1.2, vn + 0.1, Ad * vd * 1.2), { h: 130, cap: "biru: v₂ (derau 50 Hz + sinyal 50 mV) · tembaga: v_out" });
      el.querySelector(".fr").innerHTML = "A_d = R₂/R₁ = 10 · A_cm = " + f(Acm, 4) + " · derau keluar = " + fV(Math.abs(Acm) * vn) + " vs sinyal keluar = 10 × 50 mV = <b>0,5 V</b>" + (Math.abs(Acm) * vn > 0.05 ? ' <span class="tag no">resistor tidak cocok → derau lolos</span>' : ' <span class="tag ok">derau 50 Hz hilang</span>') + (Acm ? " · CMRR rangkaian ≈ " + f(20 * Math.log10(Ad / Math.abs(Acm)), 1) + " dB" : " · CMRR rangkaian ideal (∞)");
    }
    ins.forEach(function (i) { i.addEventListener("input", function () { draw(0); }); }); draw(0); loop(el, function (dt) { draw(dt * 2); });
  };
  // penguat instrumentasi 3 op-amp
  function inaCkt(p) {
    var s = opTri(110, 50, INK, true) + opTri(110, 170, INK, false) + opTri(250, 110, INK, true);
    s += txt(6, 39, "v₂ (+)", { size: 9.5, a: "start", b: 1, c: BLU }) + line(50, 35, 110, 35) + txt(6, 189, "v₁ (−)", { size: 9.5, a: "start", b: 1, c: RED }) + line(50, 185, 110, 185);
    s += line(110, 65, 90, 65) + line(90, 65, 90, 92) + dot(90, 92) + resV(90, 92, 128) + dot(90, 128) + line(90, 128, 90, 155) + line(90, 155, 110, 155) + txt(80, 114, "R_G " + fR(p.RG), { size: 9.5, a: "end", b: 1, c: COP });
    s += line(90, 92, 120, 92) + resH(120, 170, 92) + txt(145, 108, "R 25 kΩ", { size: 8.5 }) + line(170, 92, 185, 92) + line(185, 92, 185, 50) + line(170, 50, 220, 50) + dot(185, 50);
    s += line(90, 128, 120, 128) + resH(120, 170, 128) + txt(145, 122, "", {}) + line(170, 128, 185, 128) + line(185, 128, 185, 170) + line(170, 170, 220, 170) + dot(185, 170) + txt(145, 146, "R 25 kΩ", { size: 8.5 });
    s += line(220, 50, 220, 95) + line(220, 95, 250, 95) + line(220, 170, 220, 125) + line(220, 125, 250, 125) + line(310, 110, 334, 110) + txt(334, 102, "v_out", { size: 10, a: "end", b: 1, c: COP }) + txt(280, 158, "pengurang (R₂/R₁ = 1)", { size: 8.5, c: MUT });
    return s;
  }
  G.ina = function (p) { return svg(340, 210, inaCkt({ RG: +p.RG || 1000 })); };
  // A.timbangan: timbangan digital
  A.timbangan = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 150"><g class="p"></g></svg><svg class="diag" viewBox="0 0 340 210"><g class="c"></g></svg><div class="readout tb"></div><div class="ctrl">' + slider("beban", 0, 5, 0.05, 2, "kg") + slider("R_G", 50, 2000, 10, 110, "Ω") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var kg = +ins[0].value, RG = +ins[1].value; $$(el, ".val")[0].textContent = f(kg, 2); $$(el, ".val")[1].textContent = RG;
      var vb = 2 * kg / 1000, G = 1 + 50000 / RG, vo = Math.min(5, G * vb), cnt = Math.round(vo / 5 * 1023), disp = cnt / 1023 * 5 / (2 / 1000 * G), sat = G * vb > 5;
      var s = '<rect x="20" y="96" width="140" height="10" rx="3" fill="#9aa5a0"/><rect x="80" y="106" width="20" height="30" fill="#d1d5db"/><rect x="30" y="136" width="120" height="8" rx="2" fill="#9aa5a0"/>';
      var h = 6 + kg * 9; s += '<rect x="' + (90 - 10 - kg * 4) + '" y="' + (96 - h) + '" width="' + (20 + kg * 8) + '" height="' + h + '" rx="3" fill="' + COP + '"/>' + txt(90, 92 - h, f(kg, 2) + " kg", { size: 9.5, b: 1 });
      s += txt(90, 124, "load cell", { size: 7.5, c: MUT });
      s += '<rect x="200" y="40" width="120" height="56" rx="8" fill="#1f2a24"/><rect x="210" y="50" width="100" height="36" rx="4" fill="#bde3c8"/>' + txt(260, 76, sat ? "OVER" : f(disp, 2), { size: 20, b: 1, c: "#1f2a24" }) + txt(305, 84, sat ? "" : "kg", { size: 8, a: "end", c: "#1f2a24" }) + txt(260, 112, "ADC 10-bit: " + cnt, { size: 9, c: MUT });
      s += arrow(160, 70, 196, 70, BLU) + txt(178, 62, f(vb * 1000, 2) + " mV", { size: 8.5, c: BLU });
      el.querySelector(".p").innerHTML = s;
      el.querySelector(".c").innerHTML = inaCkt({ RG: RG });
      el.querySelector(".tb").innerHTML = "Jembatan strain gauge: 2 mV/kg → v_d = 2 × " + f(kg, 2) + " = " + f(vb * 1000, 2) + " mV · G = 1 + 2R/R_G = 1 + 50 kΩ/" + RG + " Ω = <b>" + f(G, 1) + "</b> · v_out = " + f(G, 1) + " × " + f(vb * 1000, 2) + " mV = <b>" + f(G * vb, 3) + " V</b>" + (sat ? ' <span class="tag no">melebihi 5 V ADC: kecilkan G</span>' : "");
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  // kaskade: tipe "ni2" (contoh 6) atau "inv3" (contoh 7)
  G.kaskade = function (p) {
    var s = "";
    if (p.tipe === "inv3") {
      s += txt(6, 44, "v₁", { size: 10, a: "start", b: 1, c: BLU }) + line(20, 40, 30, 40) + resH(30, 70, 40) + txt(50, 30, "2 kΩ", { size: 8.5 }) + line(70, 40, 92, 40) + opTri(92, 55, INK, false) + line(92, 70, 84, 70) + gnd(84, 70) + line(80, 40, 80, 14) + line(80, 14, 100, 14) + resH(100, 140, 14) + txt(120, 8, "6 kΩ", { size: 8.5 }) + line(140, 14, 160, 14) + line(160, 14, 160, 55) + line(152, 55, 175, 55) + txt(158, 70, "a", { size: 9, b: 1 });
      s += txt(6, 144, "v₂", { size: 10, a: "start", b: 1, c: BLU }) + line(20, 140, 30, 140) + resH(30, 70, 140) + txt(50, 130, "4 kΩ", { size: 8.5 }) + line(70, 140, 92, 140) + opTri(92, 155, INK, false) + line(92, 170, 84, 170) + gnd(84, 170) + line(80, 140, 80, 114) + line(80, 114, 100, 114) + resH(100, 140, 114) + txt(120, 108, "8 kΩ", { size: 8.5 }) + line(140, 114, 160, 114) + line(160, 114, 160, 155) + line(152, 155, 175, 155) + txt(158, 170, "b", { size: 9, b: 1 });
      s += resH(175, 215, 55) + txt(195, 45, "5 kΩ", { size: 8.5 }) + resH(175, 215, 155) + txt(195, 145, "15 kΩ", { size: 8.5 }) + line(215, 55, 230, 55) + line(215, 155, 230, 155) + line(230, 55, 230, 155) + line(230, 90, 250, 90) + opTri(250, 105, INK, false) + line(250, 120, 242, 120) + gnd(242, 128);
      s += line(240, 90, 240, 70) + line(240, 70, 262, 70) + resH(262, 302, 70) + txt(282, 62, "10 kΩ", { size: 8.5 }) + line(302, 70, 318, 70) + line(318, 70, 318, 105) + line(310, 105, 338, 105) + txt(338, 98, "v_o", { size: 10, a: "end", b: 1, c: COP }) + line(242, 120, 242, 128);
      return svg(340, 185, s);
    }
    s += txt(6, 64, "20 mV", { size: 9.5, a: "start", b: 1, c: BLU }) + line(20, 70, 70, 70) + opTri(70, 85, INK, true) + line(70, 100, 56, 100) + line(56, 100, 56, 120) + dot(56, 120) + resV(56, 120, 170) + gnd(56, 170) + txt(44, 150, "3 kΩ", { size: 8.5, a: "end" }) + line(56, 120, 80, 120) + resH(80, 120, 120) + txt(100, 135, "12 kΩ", { size: 8.5 }) + line(120, 120, 140, 120) + line(140, 120, 140, 85) + line(130, 85, 190, 85) + txt(150, 78, "a", { size: 9, b: 1 });
    s += line(190, 85, 190, 70) + line(190, 70, 200, 70) + opTri(200, 85, INK, true) + line(200, 100, 186, 100) + line(186, 100, 186, 120) + dot(186, 120) + resV(186, 120, 170) + gnd(186, 170) + txt(174, 150, "4 kΩ", { size: 8.5, a: "end" }) + line(186, 120, 210, 120) + resH(210, 250, 120) + txt(230, 135, "10 kΩ", { size: 8.5 }) + line(250, 120, 270, 120) + line(270, 120, 270, 85) + line(260, 85, 330, 85) + txt(330, 78, "v_o", { size: 10, a: "end", b: 1, c: COP }) + arrow(240, 146, 214, 146, BLU) + txt(228, 160, "i_o", { size: 8.5, c: BLU });
    return svg(340, 185, s);
  };
  // integrator / diferensiator
  function idCkt(mode, p) {
    var x = 190, y = 90, s = opTri(x, y, INK, false) + line(x, y + 15, 172, y + 15) + line(172, y + 15, 172, 122) + gnd(172, 122) + txt(6, 79, "v_in", { size: 10, a: "start", b: 1, c: BLU }) + line(30, 75, 80, 75);
    s += mode === "dif" ? line(80, 75, 104, 75) + capH(108, 75) + line(112, 75, 140, 75) + txt(108, 60, "C " + f(p.C, 2) + " µF", { size: 9.5, b: 1 }) : resH(80, 140, 75) + txt(110, 62, "R " + fR(p.R), { size: 9.5, b: 1 });
    s += line(140, 75, x, 75) + dot(150, 75) + line(150, 75, 150, 30) + line(150, 30, 200, 30) + (mode === "dif" ? resH(200, 250, 30) + txt(225, 18, "R " + fR(p.R), { size: 9.5, b: 1 }) + line(250, 30, 250, 30) : line(200, 30, 221, 30) + capH(225, 30) + line(229, 30, 250, 30) + txt(225, 14, "C " + f(p.C, 2) + " µF", { size: 9.5, b: 1 })) + line(250, 30, 270, 30) + line(270, 30, 270, y) + dot(270, y) + line(x + 60, y, 330, y) + txt(330, y - 6, "v_out", { size: 10, a: "end", b: 1, c: COP });
    return s;
  }
  G.integrator = function (p) { return svg(340, 140, idCkt("int", { R: +p.R, C: +p.C })); };
  G.diferensiator = function (p) { return svg(340, 140, idCkt("dif", { R: +p.R, C: +p.C })); };
  A.integ = function (el) {
    var mode = el.dataset.mode || "int", wf = "kotak";
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 140"><g class="c"></g></svg><svg class="diag" viewBox="0 0 340 150"><g class="w"></g></svg><div class="readout ir"></div><div class="ctrl"><button class="btn sm ghost" data-m="int">Integrator</button><button class="btn sm ghost" data-m="dif">Diferensiator</button></div><div class="ctrl"><button class="btn sm ghost" data-w="kotak">Kotak</button><button class="btn sm ghost" data-w="segitiga">Segitiga</button><button class="btn sm ghost" data-w="sinus">Sinus</button></div><div class="ctrl">' + slider("R", 1, 100, 1, 10, "kΩ") + slider("C", 0.01, 1, 0.01, 0.1, "µF") + "</div>";
    var ins = $$(el, "input"), fq = 500, Vp = 1;
    function vin(tt) { var ph = (tt * fq) % 1; return wf === "kotak" ? (ph < 0.5 ? Vp : -Vp) : wf === "segitiga" ? (ph < 0.5 ? -Vp + 4 * Vp * ph : 3 * Vp - 4 * Vp * ph) : Vp * Math.sin(2 * Math.PI * ph); }
    function draw() {
      var Rk = +ins[0].value, C = +ins[1].value; $$(el, ".val")[0].textContent = Rk; $$(el, ".val")[1].textContent = f(C, 2);
      var RC = Rk * 1e3 * C * 1e-6, T = 1 / fq, N = 400, dt = 2 * T / N, ys = [], v = 0, prev = vin(0), xs = [];
      // integrator: mulai dari nilai rata-rata 0 (seperti dengan R_f besar paralel C)
      var off = 0; if (mode === "int") { var tmp = 0, mn = 0, mx = 0; for (var k = 0; k <= N; k++) { tmp += -vin(k * dt) / RC * dt; mn = Math.min(mn, tmp); mx = Math.max(mx, tmp); } off = -(mn + mx) / 2; }
      for (var j = 0; j <= N; j++) { var tt = j * dt, x = vin(tt), o; if (mode === "int") { v += -x / RC * dt; o = v + off; } else { o = -RC * (x - prev) / dt; prev = x; if (j === 0) o = 0; } ys.push(clip(o)); xs.push(x); }
      var pk = Math.max.apply(null, ys.map(Math.abs)), sc = Math.max(1.2, Math.min(14, pk * 1.1)), x0 = 20, W = 300, y0 = 82, A = 64, pi = [], po = [];
      ys.forEach(function (o, j) { var X = x0 + j / N * W; pi.push(X + "," + (y0 - xs[j] / sc * A)); po.push(X + "," + (y0 - o / sc * A)); });
      el.querySelector(".w").innerHTML = line(x0, y0, x0 + W, y0, "#c7cfca", 1) + poly(pi.join(" "), BLU, 1.6) + poly(po.join(" "), COP, 2.4) + txt(x0, 12, "biru: v_in (±1 V, 500 Hz) · tembaga: v_out (skala ±" + f(sc, 1) + " V)", { size: 8.5, a: "start", c: MUT });
      el.querySelector(".c").innerHTML = idCkt(mode, { R: Rk * 1000, C: C });
      el.querySelector(".ir").innerHTML = "RC = " + Rk + " kΩ × " + f(C, 2) + " µF = <b>" + f(RC * 1000, 3) + " ms</b> · " + (mode === "int" ? "v_out = −(1/RC)∫v_in dt · masukan kotak ±1 V → laju = 1 V/" + f(RC * 1000, 3) + " ms; selama ½ periode (1 ms) berubah " + f(1e-3 / RC, 3) + " V → segitiga " + f(1e-3 / RC, 3) + " V p-p" : "v_out = −RC·dv_in/dt · segitiga ±1 V, 500 Hz → kemiringan 4 V/ms → |v_out| = RC × 4 V/ms = " + f(RC * 4000, 3) + " V (kotak)") + (pk > VSAT ? ' <span class="tag no">saturasi</span>' : "");
      $$(el, "[data-m]").forEach(function (x) { x.classList.toggle("on", x.dataset.m === mode); });
      $$(el, "[data-w]").forEach(function (x) { x.classList.toggle("on", x.dataset.w === wf); });
    }
    $$(el, "[data-m]").forEach(function (x) { x.onclick = function () { mode = x.dataset.m; wf = mode === "int" ? "kotak" : "segitiga"; draw(); }; });
    $$(el, "[data-w]").forEach(function (x) { x.onclick = function () { wf = x.dataset.w; draw(); }; });
    ins.forEach(function (i) { i.addEventListener("input", draw); }); if (mode === "dif") wf = "segitiga"; draw();
  };
  // A.fungen: generator fungsi (Schmitt + integrator)
  A.fungen = function (el) {
    var t = 0, play = true;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 120"><g class="p"></g></svg><svg class="diag" viewBox="0 0 340 150"><g class="w"></g></svg><div class="readout gr"></div><div class="ctrl"><button class="btn sm ghost" data-a="p">❚❚</button></div><div class="ctrl">' + slider("R (integrator)", 1, 100, 1, 10, "kΩ") + slider("C", 0.01, 1, 0.01, 0.1, "µF") + slider("R₂/R₁ (Schmitt)", 1.5, 10, 0.5, 2, "") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var Rk = +ins[0].value, C = +ins[1].value, k = +ins[2].value; $$(el, ".val")[0].textContent = Rk; $$(el, ".val")[1].textContent = f(C, 2); $$(el, ".val")[2].textContent = f(k, 1);
      var RC = Rk * C / 1000, fr = k / (4 * RC), Vt = VSAT / k, x0 = 20, W = 300, y1 = 40, y2 = 108, ps = [], pt = [], ph0 = t % 1;
      for (var j = 0; j <= 200; j++) { var ph = (ph0 + j / 200 * 2) % 1, sq = ph < 0.5 ? 1 : -1, tri = ph < 0.5 ? -1 + 4 * ph : 3 - 4 * ph, X = x0 + j / 200 * W; ps.push(X + "," + (y1 - sq * 24)); pt.push(X + "," + (y2 - tri * Vt / VSAT * 34)); }
      el.querySelector(".w").innerHTML = txt(x0, 10, "keluaran kotak (Schmitt) ±13 V", { size: 8.5, a: "start", c: BLU }) + line(x0, y1, x0 + W, y1, "#e5e7eb", 1) + poly(ps.join(" "), BLU, 2) + txt(x0, 70, "keluaran segitiga (integrator) ±" + f(Vt, 2) + " V", { size: 8.5, a: "start", c: COP }) + line(x0, y2, x0 + W, y2, "#e5e7eb", 1) + poly(pt.join(" "), COP, 2.4);
      var s = '<rect x="20" y="10" width="300" height="100" rx="10" fill="#2b2f2c"/><rect x="36" y="24" width="150" height="44" rx="4" fill="#9fe0b4"/>' + txt(111, 54, fr >= 1000 ? f(fr / 1000, 3) + " kHz" : f(fr, 1) + " Hz", { size: 18, b: 1, c: "#1f2a24" }) + txt(36, 90, "GENERATOR FUNGSI", { size: 9, a: "start", c: "#eee", b: 1 });
      s += '<circle cx="230" cy="50" r="18" fill="#555" stroke="#888"/><line x1="230" y1="50" x2="' + (230 + 14 * Math.cos(-2.4 + Rk / 100 * 4.8)) + '" y2="' + (50 + 14 * Math.sin(-2.4 + Rk / 100 * 4.8)) + '" stroke="#fff" stroke-width="3"/>' + txt(230, 84, "FREQ", { size: 8, c: "#eee" }) + '<circle cx="290" cy="50" r="10" fill="' + COP + '"/>' + txt(290, 84, "OUT", { size: 8, c: "#eee" });
      el.querySelector(".p").innerHTML = s;
      el.querySelector(".gr").innerHTML = "Ambang Schmitt = ±V_sat·R₁/R₂ = ±13/" + f(k, 1) + " = ±" + f(Vt, 2) + " V · f = R₂/(4R₁·RC) = " + f(k, 1) + "/(4 × " + f(RC * 1000, 3) + " ms) = <b>" + (fr >= 1000 ? f(fr / 1000, 3) + " kHz" : f(fr, 1) + " Hz") + "</b>";
    }
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
    loop(el, function (dt) { if (play) { t += dt * 0.5; draw(); } });
  };
  // A.lampu: lampu taman otomatis (komparator + LDR)
  A.lampu = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 200"><g class="c"></g></svg><div class="readout lr"></div><div class="ctrl">' + slider("cahaya", 1, 1000, 1, 300, "lux") + slider("V_ref (trimpot)", 0.5, 4.5, 0.05, 2.5, "V") + "</div>";
    var ins = $$(el, "input");
    function draw() {
      var lux = +ins[0].value, vr = +ins[1].value; $$(el, ".val")[0].textContent = lux; $$(el, ".val")[1].textContent = f(vr, 2);
      var Rl = 500e3 * Math.pow(lux, -0.75), vin = 5 * Rl / (Rl + 10000), on = vin > vr, sky = Math.min(1, lux / 600);
      var s = '<rect x="0" y="0" width="340" height="200" fill="rgb(' + Math.round(30 + 190 * sky) + "," + Math.round(40 + 190 * sky) + "," + Math.round(70 + 170 * sky) + ')" opacity=".25"/>';
      s += line(30, 20, 120, 20) + txt(30, 14, "+5 V", { size: 9.5, a: "start", b: 1 }) + resV(60, 20, 70) + txt(72, 46, "10 kΩ", { size: 9, a: "start" }) + line(60, 70, 60, 84) + dot(60, 84) + '<rect x="50" y="100" width="20" height="40" rx="8" fill="#f6e7d8" stroke="' + INK + '" stroke-width="1.6"/>' + txt(60, 124, "LDR", { size: 7.5 }) + line(60, 84, 60, 100) + line(60, 140, 60, 170) + gnd(60, 170) + txt(70, 194, "R_LDR " + fR(Rl), { size: 9, a: "start", c: MUT });
      s += arrow(20, 96, 42, 108, "#d8a106") + arrow(16, 116, 40, 124, "#d8a106");
      s += line(60, 84, 150, 84) + txt(100, 78, f(vin, 2) + " V", { size: 9, c: BLU }) + opTri(150, 99, INK, true);
      s += resV(110, 120, 170) + gnd(110, 170) + line(110, 114, 150, 114) + line(110, 114, 110, 120) + txt(100, 132, "V_ref", { size: 9, a: "end", c: GRN }) + txt(100, 144, f(vr, 2) + " V", { size: 9, a: "end", c: GRN });
      s += line(210, 99, 240, 99) + resH(240, 270, 99) + line(270, 99, 280, 99) + '<circle cx="292" cy="99" r="12" fill="' + (on ? "#fde047" : "#e5e7eb") + '" stroke="' + INK + '" stroke-width="1.6"/>' + (on ? '<circle cx="292" cy="99" r="26" fill="#fde047" opacity=".35"/>' : "") + line(292, 111, 292, 170) + gnd(292, 170) + txt(292, 76, on ? "LAMPU ON" : "lampu off", { size: 10, b: 1, c: on ? "#a16207" : MUT });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".lr").innerHTML = "R_LDR = " + fR(Rl) + " → v₊ = 5 × R_LDR/(R_LDR + 10 kΩ) = <b>" + f(vin, 2) + " V</b> · komparator: v₊ " + (on ? "&gt;" : "&lt;") + " V_ref (" + f(vr, 2) + " V) → keluaran " + (on ? "+V_sat → <b>lampu ON</b> (gelap)" : "0 V → lampu OFF (terang)");
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  // A.schmitt: komparator vs Schmitt trigger pada masukan berderau
  A.schmitt = function (el) {
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 210"><g class="w"></g></svg><div class="readout sr"></div><div class="ctrl">' + slider("R₁ (umpan balik)", 10, 200, 5, 100, "kΩ") + slider("derau", 0, 1, 0.05, 0.4, "V") + "</div>";
    var ins = $$(el, "input"), R2 = 10;
    function rnd(k) { var x = Math.sin(k * 127.1) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; }
    function draw() {
      var R1 = +ins[0].value, nz = +ins[1].value; $$(el, ".val")[0].textContent = R1; $$(el, ".val")[1].textContent = f(nz, 2);
      var UTP = VSAT * R2 / (R1 + R2), x0 = 20, W = 300, N = 300, pin = [], pc = [], ps = [], st = -1, sc = -1, tc = 0, ts = 0;
      for (var j = 0; j <= N; j++) { var u = j / N * 4 * Math.PI, v = 2 * Math.sin(u) + nz * rnd(j), X = x0 + j / N * W, c = v > 0 ? -1 : 1; if (c !== sc) { tc++; sc = c; } if (v > UTP && st !== -1) { st = -1; ts++; } else if (v < -UTP && st !== 1) { st = 1; ts++; } if (j === 0) st = v > 0 ? -1 : 1; pin.push(X + "," + (50 - v / 2.6 * 38)); pc.push(X + "," + (126 - c * 18)); ps.push(X + "," + (184 - st * 18)); }
      var s = txt(x0, 10, "masukan: sinus 2 V + derau", { size: 8.5, a: "start", c: BLU }) + line(x0, 50, x0 + W, 50, "#e5e7eb", 1) + poly(pin.join(" "), BLU, 1.4) + line(x0, 50 - UTP / 2.6 * 38, x0 + W, 50 - UTP / 2.6 * 38, RED, 1).replace("/>", ' stroke-dasharray="3 3"/>') + line(x0, 50 + UTP / 2.6 * 38, x0 + W, 50 + UTP / 2.6 * 38, RED, 1).replace("/>", ' stroke-dasharray="3 3"/>') + txt(x0 + W, 50 - UTP / 2.6 * 38 - 3, "UTP", { size: 8, a: "end", c: RED }) + txt(x0 + W, 50 + UTP / 2.6 * 38 + 10, "LTP", { size: 8, a: "end", c: RED });
      s += txt(x0, 100, "komparator biasa (ambang 0 V): " + tc + " kali berpindah", { size: 8.5, a: "start", c: MUT }) + poly(pc.join(" "), "#9aa5a0", 1.8) + txt(x0, 158, "Schmitt trigger: " + ts + " kali berpindah", { size: 8.5, a: "start", c: COP }) + poly(ps.join(" "), COP, 2.4);
      el.querySelector(".w").innerHTML = s;
      el.querySelector(".sr").innerHTML = "UTP = +V_sat·R₂/(R₁ + R₂) = 13 × 10/(" + R1 + " + 10) = <b>+" + f(UTP, 2) + " V</b>, LTP = −" + f(UTP, 2) + " V · histeresis = <b>" + f(2 * UTP, 2) + " V</b> · " + (2 * UTP > 2 * nz ? '<span class="tag ok">histeresis &gt; derau: keluaran bersih</span>' : '<span class="tag no">histeresis terlalu kecil</span>');
    }
    ins.forEach(function (i) { i.addEventListener("input", draw); }); draw();
  };
  // A.vumeter: indikator level audio dengan 10 komparator
  A.vumeter = function (el) {
    var t = 0, play = true;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 200"><g class="c"></g></svg><div class="readout vr"></div><div class="ctrl"><button class="btn sm ghost" data-a="p">❚❚</button></div><div class="ctrl">' + slider("volume", 0, 1.2, 0.01, 0.7, "") + "</div>";
    var sl = el.querySelector("input");
    function draw() {
      var vol = +sl.value; el.querySelector(".val").textContent = f(vol, 2);
      var env = vol * (0.55 + 0.3 * Math.abs(Math.sin(t * 2.1)) + 0.15 * Math.abs(Math.sin(t * 7.3))), vin = 1.2 * env, n = 0, s = line(20, 20, 20, 185) + txt(20, 14, "V_ref 1,2 V", { size: 8.5, a: "start" });
      for (var i = 0; i < 10; i++) { var ref = 0.12 * (i + 1), y = 180 - i * 16, on = vin > ref; if (on) n++; s += resV(20, y - 16, y).replace(/stroke-width="2.4"/, 'stroke-width="1.4"') + line(20, y - 8, 120, y - 8, "#c7cfca", 1) + txt(118, y - 10, f(ref, 2) + " V", { size: 7.5, a: "end", c: MUT }) + '<polygon points="130,' + (y - 16) + " 130," + y + " 152," + (y - 8) + '" fill="#fff" stroke="' + INK + '" stroke-width="1.2"/>' + line(152, y - 8, 200, y - 8, "#c7cfca", 1) + '<rect x="210" y="' + (y - 14) + '" width="40" height="12" rx="3" fill="' + (on ? (i > 7 ? "#ef4444" : i > 5 ? "#f59e0b" : "#22c55e") : "#e5e7eb") + '" stroke="#9aa5a0"/>'; }
      s += arrow(300, 180 - vin / 1.2 * 160, 262, 180 - vin / 1.2 * 160, BLU) + txt(306, 184 - vin / 1.2 * 160, f(vin, 2) + " V", { size: 9, a: "start", c: BLU }) + txt(290, 194, "sinyal", { size: 8.5, c: BLU });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".vr").innerHTML = "Tangga resistor membagi 1,2 V menjadi 10 ambang (0,12 V per langkah). Tiap komparator menyalakan LED bila v_sinyal &gt; V_ambang-nya · sekarang " + f(vin, 2) + " V → <b>" + n + " LED</b> menyala (prinsip IC LM3914)";
    }
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    sl.addEventListener("input", draw); draw();
    loop(el, function (dt) { if (play) { t += dt; draw(); } });
  };
  // G.ivconv: pengubah arus–tegangan (fotodioda)
  G.ivconv = function (p) {
    var x = 190, y = 90, s = opTri(x, y, INK, false) + line(x, y + 15, 172, y + 15) + line(172, y + 15, 172, 122) + gnd(172, 122);
    s += diodaV(80, 75, 135, -1, COP) + line(80, 75, x, 75) + line(80, 135, 80, 150) + gnd(80, 150) + arrow(40, 90, 64, 100, "#d8a106") + arrow(36, 108, 62, 114, "#d8a106") + txt(96, 120, "fotodioda", { size: 9, a: "start", c: MUT }) + arrow(120, 66, 145, 66, BLU) + txt(132, 60, "I", { size: 9.5, b: 1, c: BLU });
    s += dot(150, 75) + line(150, 75, 150, 30) + line(150, 30, 200, 30) + resH(200, 250, 30) + txt(225, 18, "R_f " + fR(+p.Rf || 100000), { size: 9.5, b: 1 }) + line(250, 30, 270, 30) + line(270, 30, 270, y) + dot(270, y) + line(x + 60, y, 330, y) + txt(330, y - 6, "v_out", { size: 10, a: "end", b: 1, c: COP }) + txt(330, y + 20, "v_out = −I·R_f", { size: 9.5, a: "end", b: 1, c: COP });
    return svg(340, 160, s);
  };
  G.schmittckt = function (p) {
    var x = 170, y = 90, s = opTri(x, y, INK, false) + txt(6, 79, "v_in", { size: 10, a: "start", b: 1, c: BLU }) + line(30, 75, x, 75);
    s += line(x, y + 15, 150, y + 15) + line(150, y + 15, 150, 120) + dot(150, 120) + resV(150, 120, 170) + gnd(150, 170) + txt(138, 150, "R₂ " + fR(+p.R2 || 10000), { size: 9.5, a: "end", b: 1 });
    s += line(150, 120, 200, 120) + resH(200, 260, 120) + txt(230, 138, "R₁ " + fR(+p.R1 || 100000), { size: 9.5, b: 1 }) + line(260, 120, 280, 120) + line(280, 120, 280, y) + dot(280, y) + line(x + 60, y, 330, y) + txt(330, y - 6, "v_out", { size: 10, a: "end", b: 1, c: COP });
    return svg(340, 185, s);
  };
  /* =================== ANIMASI MATERI 12: RANGKAIAN LOGIKA + PERMAINAN =================== */
  var HI = "#16a34a", LO = "#9aa5a0";
  function lg(t, a) {
    var all = a.every(function (x) { return x; }), any = a.some(function (x) { return x; }), par = a.reduce(function (s, x) { return s ^ x; }, 0);
    return { BUF: a[0], NOT: 1 - a[0], AND: all ? 1 : 0, OR: any ? 1 : 0, NAND: all ? 0 : 1, NOR: any ? 0 : 1, XOR: par, XNOR: 1 - par }[t];
  }
  var GNAMA = { BUF: "Buffer", NOT: "NOT", AND: "AND", OR: "OR", NAND: "NAND", NOR: "NOR", XOR: "X-OR", XNOR: "X-NOR" };
  var GRUMUS = { BUF: "Y = A", NOT: "Y = A'", AND: "Y = A·B", OR: "Y = A + B", NAND: "Y = (A·B)'", NOR: "Y = (A + B)'", XOR: "Y = A ⊕ B", XNOR: "Y = (A ⊕ B)'" };
  // simbol gerbang: tepi kiri x, tengah y, n masukan. Kembalikan {s, ins, out}
  function gateSym(t, x, y, n, opt) {
    opt = opt || {}; n = (t === "NOT" || t === "BUF") ? 1 : (n || 2);
    var h = Math.max(36, n * 13 + 10), s = "", fill = opt.fill || "#fff", c = opt.c || INK, xr, ins = [];
    if (t === "AND" || t === "NAND") { s += '<path d="M' + x + " " + (y - h / 2) + " L" + (x + 22) + " " + (y - h / 2) + " A" + h / 2 + " " + h / 2 + " 0 0 1 " + (x + 22) + " " + (y + h / 2) + " L" + x + " " + (y + h / 2) + ' Z" fill="' + fill + '" stroke="' + c + '" stroke-width="2.2"/>'; xr = x + 22 + h / 2; }
    else if (t === "NOT" || t === "BUF") { s += '<polygon points="' + x + "," + (y - 16) + " " + x + "," + (y + 16) + " " + (x + 32) + "," + y + '" fill="' + fill + '" stroke="' + c + '" stroke-width="2.2"/>'; xr = x + 32; }
    else { s += '<path d="M' + x + " " + (y - h / 2) + " Q" + (x + h * 0.32) + " " + y + " " + x + " " + (y + h / 2) + " Q" + (x + 30) + " " + (y + h / 2) + " " + (x + 50) + " " + y + " Q" + (x + 30) + " " + (y - h / 2) + " " + x + " " + (y - h / 2) + ' Z" fill="' + fill + '" stroke="' + c + '" stroke-width="2.2"/>'; xr = x + 50; if (t === "XOR" || t === "XNOR") s += '<path d="M' + (x - 7) + " " + (y - h / 2) + " Q" + (x - 7 + h * 0.32) + " " + y + " " + (x - 7) + " " + (y + h / 2) + '" fill="none" stroke="' + c + '" stroke-width="2.2"/>'; }
    var bub = t === "NOT" || t === "NAND" || t === "NOR" || t === "XNOR";
    if (bub) s += '<circle cx="' + (xr + 4.5) + '" cy="' + y + '" r="4.5" fill="#fff" stroke="' + c + '" stroke-width="2"/>';
    for (var i = 0; i < n; i++) ins.push([x, n === 1 ? y : y + (i - (n - 1) / 2) * ((h - 14) / (n - 1))]);
    if (opt.lab !== false) s += txt(x + (t === "NOT" || t === "BUF" ? 11 : 20), y + 3.5, opt.lab || (t === "BUF" || t === "NOT" ? "" : t), { size: 8, c: MUT, b: 1 });
    return { s: s, ins: ins, out: [xr + (bub ? 9 : 0), y] };
  }
  function kawat(x1, y1, x2, y2, v, mx) { var c = v == null ? INK : v ? HI : LO; mx = mx == null ? (x1 + x2) / 2 : mx; return '<polyline points="' + x1 + "," + y1 + " " + mx + "," + y1 + " " + mx + "," + y2 + " " + x2 + "," + y2 + '" fill="none" stroke="' + c + '" stroke-width="' + (v ? 2.8 : 2.2) + '" stroke-linejoin="round"/>'; }
  function lampu(x, y, v, lab) { return (v ? '<circle cx="' + x + '" cy="' + y + '" r="20" fill="#fde047" opacity=".35"/>' : "") + '<circle cx="' + x + '" cy="' + y + '" r="12" fill="' + (v ? "#fde047" : "#e5e7eb") + '" stroke="' + INK + '" stroke-width="1.8"/>' + line(x - 6, y - 6, x + 6, y + 6, INK, 1.2) + line(x + 6, y - 6, x - 6, y + 6, INK, 1.2) + (lab ? txt(x, y + 26, lab, { size: 9.5, b: 1 }) : "") + txt(x, y + (lab ? 38 : 26), String(v), { size: 10, b: 1, c: v ? HI : MUT }); }
  function saklarBox(x, y, nm, v, key) { return '<g data-in="' + key + '" style="cursor:pointer"><rect x="' + (x - 24) + '" y="' + (y - 13) + '" width="38" height="26" rx="7" fill="' + (v ? "#dcfce7" : "#f3f4f6") + '" stroke="' + (v ? HI : "#9aa5a0") + '" stroke-width="2"/>' + txt(x - 5, y + 4.5, nm + "=" + v, { size: 10.5, b: 1, c: v ? HI : INK }) + "</g>"; }
  // rangkaian umum: def = {ins:[{n,y}], g:[{id,t,in:[...],x,y,slot?}], outs:[{src,lab,x,y}]}, vals = {A:0,...}
  function evalCkt(def, vals, types) {
    var v = {}; def.ins.forEach(function (i) { v[i.n] = vals[i.n] ? 1 : 0; });
    def.g.forEach(function (g) { var t = (types && types[g.id]) || g.t; v[g.id] = t ? lg(t, g.in.map(function (k) { return v[k]; })) : 0; });
    return v;
  }
  function drawCkt(def, vals, opt) {
    opt = opt || {}; var v = evalCkt(def, vals, opt.types), pos = {}, s = "", gs = "", X0 = def.x0 || 54;
    def.ins.forEach(function (i) { pos[i.n] = [X0, i.y]; });
    def.g.forEach(function (g) { var t = (opt.types && opt.types[g.id]) || g.t || "AND", sy = gateSym(t, g.x, g.y, g.in.length, { lab: g.slot ? (opt.types && opt.types[g.id] ? t : "?") : undefined, fill: g.slot ? "#fff7ed" : "#fff", c: g.slot ? COP : INK }); if (g.slot && !(opt.types && opt.types[g.id])) sy.s = '<rect x="' + (g.x - 4) + '" y="' + (g.y - 22) + '" width="58" height="44" rx="8" fill="#fff7ed" stroke="' + COP + '" stroke-width="2.2" stroke-dasharray="5 3"/>' + txt(g.x + 25, g.y + 6, "?", { size: 18, b: 1, c: COP }); g._p = sy; pos[g.id] = sy.out; if (g.slot) gs += '<rect data-slot="' + g.id + '" x="' + (g.x - 6) + '" y="' + (g.y - 26) + '" width="64" height="52" fill="transparent" style="cursor:pointer"/>'; });
    def.g.forEach(function (g) { g.in.forEach(function (k, j) { var a = pos[k], b = g._p.ins[j]; s += kawat(a[0], a[1], b[0] + (/OR/.test((opt.types && opt.types[g.id]) || g.t || "") ? 5 : 0), b[1], v[k], b[0] - 12 - j * 5); }); });
    def.g.forEach(function (g) { s += g._p.s; });
    def.outs.forEach(function (o) { var a = pos[o.src]; s += kawat(a[0], a[1], o.x - 12, o.y, v[o.src], (a[0] + o.x) / 2) + (o.dev ? o.dev(v[o.src]) : lampu(o.x, o.y, v[o.src], o.lab)); });
    def.ins.forEach(function (i) { s += saklarBox(30, i.y, i.n, v[i.n], i.n); });
    return { s: s + gs, v: v };
  }
  function tabelKebenaran(names, fnOut, cur, outName, extra) {
    var n = names.length, h = "<tr>" + names.map(function (x) { return "<th>" + x + "</th>"; }).join("") + (extra ? extra.map(function (e) { return "<th>" + e[0] + "</th>"; }).join("") : "") + "<th>" + (outName || "Y") + "</th></tr>";
    for (var r = 0; r < (1 << n); r++) { var b = names.map(function (x, i) { return (r >> (n - 1 - i)) & 1; }), y = fnOut(b), on = cur === r; h += '<tr style="' + (on ? "background:#fef3c7;font-weight:700" : "") + '">' + b.map(function (x) { return "<td>" + x + "</td>"; }).join("") + (extra ? extra.map(function (e) { return "<td>" + e[1](b) + "</td>"; }).join("") : "") + '<td style="color:' + (y ? HI : "#6b7a72") + ';font-weight:700">' + y + "</td></tr>"; }
    return '<table class="tabel small tk" style="margin:4px auto;width:auto">' + h + "</table>";
  }
  // A.gerbang: penjelajah gerbang
  A.gerbang = function (el) {
    var t = el.dataset.mode || "AND", n = 2, val = [0, 0, 0, 0], list = (el.dataset.list || "BUF,NOT,AND,OR,NAND,NOR,XOR,XNOR").split(",");
    el.innerHTML = '<div class="ctrl">' + list.map(function (g) { return '<button class="btn sm ghost" data-g="' + g + '">' + GNAMA[g] + "</button>"; }).join("") + '</div><svg class="diag" viewBox="0 0 340 170"><g class="c"></g></svg><div class="ctrl"><button class="btn sm ghost" data-n="2">2 masukan</button><button class="btn sm ghost" data-n="3">3 masukan</button><button class="btn sm ghost" data-n="4">4 masukan</button></div><div class="tb"></div><div class="readout gr"></div>';
    function draw() {
      var nn = (t === "NOT" || t === "BUF") ? 1 : n, names = ["A", "B", "C", "D"].slice(0, nn), a = val.slice(0, nn), y = lg(t, a), cy = 80, s = "";
      var gs = gateSym(t, 150, cy, nn, { lab: false });
      names.forEach(function (nm, i) { var p = gs.ins[i], yy = nn === 1 ? cy : 30 + i * (100 / Math.max(1, nn - 1)); if (nn === 1) yy = cy; s += kawat(64, yy, p[0] + (/OR/.test(t) ? 5 : 0), p[1], a[i], 120 - i * 6) + saklarBox(42, yy, nm, a[i], i); });
      s += gs.s + kawat(gs.out[0], cy, 258, cy, y, 230) + lampu(272, cy, y, "Y") + txt(170, 160, GRUMUS[t].replace("A·B", names.join("·")).replace("A + B", names.join(" + ")).replace("A ⊕ B", names.join(" ⊕ ")), { size: 12, b: 1, c: COP });
      if ((t === "AND" || t === "OR") && nn === 2) { var ser = t === "AND"; s += txt(300, 14, ser ? "analogi: saklar seri" : "analogi: saklar paralel", { size: 8.5, a: "end", c: MUT }); }
      el.querySelector(".c").innerHTML = s;
      var r = 0; a.forEach(function (x) { r = r * 2 + x; });
      el.querySelector(".tb").innerHTML = tabelKebenaran(names, function (b) { return lg(t, b); }, r);
      el.querySelector(".gr").innerHTML = "<b>" + GNAMA[t] + "</b>: " + ({ BUF: "keluaran = masukan (penyangga)", NOT: "keluaran = kebalikan masukan", AND: "1 hanya bila SEMUA masukan 1", OR: "1 bila SALAH SATU masukan 1", NAND: "kebalikan AND: 0 hanya bila semua masukan 1", NOR: "kebalikan OR: 1 hanya bila semua masukan 0", XOR: "1 bila jumlah masukan bernilai 1 GANJIL (2 masukan: berbeda)", XNOR: "kebalikan X-OR: 1 bila masukan sama" })[t] + " · " + nn + " masukan → 2^" + nn + " = <b>" + (1 << nn) + "</b> baris tabel kebenaran";
      $$(el, "[data-g]").forEach(function (b) { b.classList.toggle("on", b.dataset.g === t); });
      $$(el, "[data-n]").forEach(function (b) { b.classList.toggle("on", +b.dataset.n === n); b.style.display = (t === "NOT" || t === "BUF") ? "none" : ""; });
    }
    el.addEventListener("click", function (e) { var k = e.target.closest("[data-in]"); if (k) { val[+k.dataset.in] ^= 1; draw(); } });
    $$(el, "[data-g]").forEach(function (b) { b.onclick = function () { t = b.dataset.g; draw(); }; });
    $$(el, "[data-n]").forEach(function (b) { b.onclick = function () { n = +b.dataset.n; draw(); }; });
    draw();
  };
  // A.timing: diagram waktu
  A.timing = function (el) {
    var t = "AND", ph = 0, play = true;
    el.innerHTML = '<div class="ctrl">' + ["AND", "OR", "NAND", "NOR", "XOR", "XNOR"].map(function (g) { return '<button class="btn sm ghost" data-g="' + g + '">' + GNAMA[g] + "</button>"; }).join("") + '<button class="btn sm ghost" data-a="p">❚❚</button></div><svg class="diag" viewBox="0 0 340 170"><g class="w"></g></svg><div class="readout tr"></div>';
    function sig(fn, y0, c, lab) { var p = []; for (var k = 0; k <= 16; k++) { var v = fn(k); p.push((40 + k * 18) + "," + (y0 - v * 26)); if (k < 16) p.push((40 + (k + 1) * 18) + "," + (y0 - v * 26)); } return txt(30, y0 - 8, lab, { size: 11, a: "end", b: 1, c: c }) + poly(p.join(" "), c, 2.4); }
    function draw() {
      var A0 = function (k) { return (k >> 1) & 1; }, B0 = function (k) { return (k >> 2) & 1; }, Y = function (k) { return lg(t, [A0(k), B0(k)]); };
      var s = sig(A0, 40, BLU, "A") + sig(B0, 85, BLU, "B") + sig(Y, 140, HI, "Y");
      for (var k = 0; k <= 16; k += 2) s += line(40 + k * 18, 8, 40 + k * 18, 150, "#e5e7eb", 1);
      var xc = 40 + ph * 288, kk = Math.min(15, Math.floor(ph * 16)); s += line(xc, 6, xc, 152, COP, 1.4) + txt(xc + 3, 160, "A=" + A0(kk) + " B=" + B0(kk) + " → Y=" + Y(kk), { size: 9, a: xc > 240 ? "end" : "start", c: COP, b: 1 });
      el.querySelector(".w").innerHTML = s;
      el.querySelector(".tr").innerHTML = "Diagram waktu gerbang <b>" + GNAMA[t] + "</b>: baca kolom demi kolom seperti tabel kebenaran yang berjalan terhadap waktu. Teknik ini dipakai saat membaca osiloskop/logic analyzer.";
      $$(el, "[data-g]").forEach(function (b) { b.classList.toggle("on", b.dataset.g === t); });
    }
    $$(el, "[data-g]").forEach(function (b) { b.onclick = function () { t = b.dataset.g; draw(); }; });
    el.querySelector("[data-a=p]").onclick = function () { play = !play; this.textContent = play ? "❚❚" : "▶"; };
    draw(); loop(el, function (dt) { if (play) { ph = (ph + dt * 0.08) % 1; draw(); } });
  };
  // A.demorgan
  A.demorgan = function (el) {
    var mode = "nor", v = { A: 0, B: 0 };
    el.innerHTML = '<div class="ctrl"><button class="btn sm ghost" data-m="nor">(A + B)\' = A\'·B\'</button><button class="btn sm ghost" data-m="nand">(A·B)\' = A\' + B\'</button></div><svg class="diag" viewBox="0 0 340 230"><g class="c"></g></svg><div class="tb"></div><div class="readout dr"></div>';
    var D = {
      nor: [{ ins: [{ n: "A", y: 30 }, { n: "B", y: 70 }], g: [{ id: "g", t: "NOR", in: ["A", "B"], x: 150, y: 50 }], outs: [{ src: "g", x: 290, y: 50, lab: "kiri" }] }, { ins: [{ n: "A", y: 140 }, { n: "B", y: 190 }], g: [{ id: "na", t: "NOT", in: ["A"], x: 90, y: 140 }, { id: "nb", t: "NOT", in: ["B"], x: 90, y: 190 }, { id: "g", t: "AND", in: ["na", "nb"], x: 180, y: 165 }], outs: [{ src: "g", x: 290, y: 165, lab: "kanan" }] }],
      nand: [{ ins: [{ n: "A", y: 30 }, { n: "B", y: 70 }], g: [{ id: "g", t: "NAND", in: ["A", "B"], x: 150, y: 50 }], outs: [{ src: "g", x: 290, y: 50, lab: "kiri" }] }, { ins: [{ n: "A", y: 140 }, { n: "B", y: 190 }], g: [{ id: "na", t: "NOT", in: ["A"], x: 90, y: 140 }, { id: "nb", t: "NOT", in: ["B"], x: 90, y: 190 }, { id: "g", t: "OR", in: ["na", "nb"], x: 180, y: 165 }], outs: [{ src: "g", x: 290, y: 165, lab: "kanan" }] }]
    };
    function draw() {
      var d = D[mode], r1 = drawCkt(d[0], v), r2 = drawCkt(d[1], v), same = r1.v.g === r2.v.g;
      el.querySelector(".c").innerHTML = r1.s + line(10, 104, 330, 104, "#e5e7eb", 1) + r2.s;
      var nor = mode === "nor";
      el.querySelector(".tb").innerHTML = tabelKebenaran(["A", "B"], function (b) { return nor ? lg("NOR", b) : lg("NAND", b); }, v.A * 2 + v.B, nor ? "(A+B)'" : "(A·B)'", [["A'", function (b) { return 1 - b[0]; }], ["B'", function (b) { return 1 - b[1]; }], [nor ? "A'·B'" : "A' + B'", function (b) { return nor ? (1 - b[0]) * (1 - b[1]) : Math.max(1 - b[0], 1 - b[1]); }]]);
      el.querySelector(".dr").innerHTML = (same ? '<span class="tag ok">kiri = kanan</span>' : '<span class="tag no">berbeda</span>') + " · Klik saklar A/B: kedua rangkaian selalu sama untuk keempat kombinasi → De Morgan terbukti. " + (nor ? "NOR = AND dengan masukan terbalik." : "NAND = OR dengan masukan terbalik.");
      $$(el, "[data-m]").forEach(function (b) { b.classList.toggle("on", b.dataset.m === mode); });
    }
    el.addEventListener("click", function (e) { var k = e.target.closest("[data-in]"); if (k) { v[k.dataset.in] ^= 1; draw(); } });
    $$(el, "[data-m]").forEach(function (b) { b.onclick = function () { mode = b.dataset.m; draw(); }; });
    draw();
  };
  // A.boole: F = A'BC' + (A+B)C (tabel materi)
  var DEF_BOOLE = { ins: [{ n: "A", y: 30 }, { n: "B", y: 80 }, { n: "C", y: 150 }], g: [{ id: "nA", t: "NOT", in: ["A"], x: 84, y: 30 }, { id: "nC", t: "NOT", in: ["C"], x: 84, y: 150 }, { id: "g1", t: "AND", in: ["nA", "B", "nC"], x: 175, y: 50 }, { id: "g2", t: "OR", in: ["A", "B"], x: 125, y: 112 }, { id: "g3", t: "AND", in: ["g2", "C"], x: 205, y: 135 }, { id: "F", t: "OR", in: ["g1", "g3"], x: 275, y: 92 }], outs: [{ src: "F", x: 348, y: 92, lab: "F" }] };
  A.boole = function (el) {
    var v = { A: 0, B: 1, C: 0 };
    el.innerHTML = '<svg class="diag" viewBox="0 0 370 190"><g class="c"></g></svg><div class="tb"></div><div class="readout br"></div>';
    function draw() {
      var r = drawCkt(DEF_BOOLE, v); el.querySelector(".c").innerHTML = r.s;
      el.querySelector(".tb").innerHTML = tabelKebenaran(["A", "B", "C"], function (b) { return ((1 - b[0]) & b[1] & (1 - b[2])) | ((b[0] | b[1]) & b[2]); }, v.A * 4 + v.B * 2 + v.C, "F", [["A'B", function (b) { return (1 - b[0]) & b[1]; }], ["A'BC'", function (b) { return (1 - b[0]) & b[1] & (1 - b[2]); }], ["A+B", function (b) { return b[0] | b[1]; }], ["(A+B)C", function (b) { return (b[0] | b[1]) & b[2]; }]]);
      el.querySelector(".br").innerHTML = "F = A'·B·C' + (A + B)·C · sekarang A=" + v.A + ", B=" + v.B + ", C=" + v.C + " → A'BC' = " + r.v.g1 + ", (A+B)C = " + r.v.g3 + " → <b>F = " + r.v.F + "</b>";
    }
    el.addEventListener("click", function (e) { var k = e.target.closest("[data-in]"); if (k) { v[k.dataset.in] ^= 1; draw(); } });
    draw();
  };
  // A.ic74: simulator IC TTL 74xx
  var IC74 = {
    "7400": { t: "NAND", g: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]] }, "7402": { t: "NOR", g: [[2, 3, 1], [5, 6, 4], [8, 9, 10], [11, 12, 13]] },
    "7404": { t: "NOT", g: [[1, 2], [3, 4], [5, 6], [9, 8], [11, 10], [13, 12]] }, "7408": { t: "AND", g: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]] },
    "7432": { t: "OR", g: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]] }, "7486": { t: "XOR", g: [[1, 2, 3], [4, 5, 6], [9, 10, 8], [12, 13, 11]] }
  };
  A.ic74 = function (el) {
    var ic = "7408", pin = {}, vcc = true;
    el.innerHTML = '<div class="ctrl">' + Object.keys(IC74).map(function (k) { return '<button class="btn sm ghost" data-ic="' + k + '">' + k + " " + IC74[k].t + "</button>"; }).join("") + '</div><svg class="diag" viewBox="0 0 340 210"><g class="c"></g></svg><div class="ctrl"><button class="btn sm ghost" data-v="1">Catu 5 V terpasang</button></div><div class="readout ir"></div>';
    function px(p) { return p <= 7 ? 50 + (p - 1) * 40 : 50 + (14 - p) * 40; }
    function py(p) { return p <= 7 ? 160 : 50; }
    function draw() {
      var d = IC74[ic], isIn = {}, out = {}; d.g.forEach(function (g) { for (var i = 0; i < g.length - 1; i++) isIn[g[i]] = 1; var a = g.slice(0, -1).map(function (p) { return pin[p] ? 1 : 0; }); out[g[g.length - 1]] = vcc ? lg(d.t, a) : 0; });
      var s = '<rect x="30" y="68" width="280" height="74" rx="6" fill="#2b2b2b"/><path d="M30 95 a10 10 0 0 1 0 20" fill="#fff"/>' + txt(170, 102, "SN" + ic + "  (" + IC74[ic].t + ")", { size: 13, b: 1, c: "#eee" }) + txt(170, 122, d.t === "NOT" ? "6 gerbang" : "4 gerbang × 2 masukan", { size: 9, c: "#bbb" });
      for (var p = 1; p <= 14; p++) {
        var x = px(p), y = py(p), top = p > 7, lab = p === 7 ? "GND" : p === 14 ? "VCC" : isIn[p] ? "in" : out[p] != null ? "out" : "", v = isIn[p] ? (pin[p] ? 1 : 0) : out[p];
        s += '<rect x="' + (x - 7) + '" y="' + (top ? 52 : 142) + '" width="14" height="16" fill="#c0c0c0"/>' + txt(x, top ? 64 : 154, String(p), { size: 8.5, b: 1 });
        if (isIn[p]) s += '<g data-pin="' + p + '" style="cursor:pointer"><rect x="' + (x - 15) + '" y="' + (top ? 18 : 172) + '" width="30" height="22" rx="6" fill="' + (v ? "#dcfce7" : "#f3f4f6") + '" stroke="' + (v ? HI : "#9aa5a0") + '" stroke-width="2"/>' + txt(x, top ? 33 : 187, String(v), { size: 11, b: 1, c: v ? HI : INK }) + "</g>" + line(x, top ? 40 : 160, x, top ? 52 : 172, v ? HI : LO, 2);
        else if (out[p] != null) s += line(x, top ? 36 : 158, x, top ? 52 : 174, v ? HI : LO, 2) + '<circle cx="' + x + '" cy="' + (top ? 28 : 182) + '" r="9" fill="' + (v ? "#ef4444" : "#e5e7eb") + '" stroke="' + INK + '" stroke-width="1.4"/>' + (v ? '<circle cx="' + x + '" cy="' + (top ? 28 : 182) + '" r="14" fill="#ef4444" opacity=".25"/>' : "");
        else s += txt(x, top ? 36 : 186, lab, { size: 8.5, b: 1, c: p === 14 ? (vcc ? RED : MUT) : INK });
        s += txt(x, top ? 12 : 206, isIn[p] ? "in" : out[p] != null ? "LED" : "", { size: 7.5, c: MUT });
      }
      el.querySelector(".c").innerHTML = s;
      var g0 = d.g[0], a0 = g0.slice(0, -1).map(function (p) { return pin[p] ? 1 : 0; });
      el.querySelector(".ir").innerHTML = "Klik kotak masukan (pin in). Gerbang 1: pin " + g0.slice(0, -1).join(", ") + " = " + a0.join(", ") + " → pin " + g0[g0.length - 1] + " = <b>" + (vcc ? lg(d.t, a0) : 0) + "</b>" + (vcc ? "" : ' <span class="tag no">tanpa VCC (pin 14) dan GND (pin 7) IC tidak bekerja!</span>') + (ic === "7402" ? ' · <span class="tag mid">awas: pin keluaran 7402 berbeda (1, 4, 10, 13)</span>' : "");
      $$(el, "[data-ic]").forEach(function (b) { b.classList.toggle("on", b.dataset.ic === ic); });
      var bv = el.querySelector("[data-v]"); bv.classList.toggle("on", vcc); bv.textContent = vcc ? "Catu 5 V terpasang" : "Catu dilepas";
    }
    el.addEventListener("click", function (e) { var k = e.target.closest("[data-pin]"); if (k) { pin[+k.dataset.pin] ^= 1; draw(); } });
    $$(el, "[data-ic]").forEach(function (b) { b.onclick = function () { ic = b.dataset.ic; pin = {}; draw(); }; });
    el.querySelector("[data-v]").onclick = function () { vcc = !vcc; draw(); };
    draw();
  };
  // A.aplikasi: lampu tangga, alarm mobil, voting, half adder
  function buzzer(v, x, y, lab) { return '<rect x="' + (x - 14) + '" y="' + (y - 14) + '" width="28" height="28" rx="14" fill="' + (v ? "#ef4444" : "#e5e7eb") + '" stroke="' + INK + '" stroke-width="1.6"/>' + txt(x, y + 4, v ? "🔊" : "🔈", { size: 12 }) + txt(x, y + 30, lab, { size: 9.5, b: 1 }) + txt(x, y + 42, String(v), { size: 10, b: 1, c: v ? HI : MUT }); }
  var APL = {
    tangga: { nama: "Lampu tangga 2 saklar", def: { ins: [{ n: "S1", y: 50 }, { n: "S2", y: 110 }], g: [{ id: "Y", t: "XOR", in: ["S1", "S2"], x: 160, y: 80 }], outs: [{ src: "Y", x: 290, y: 80, lab: "lampu" }] }, ket: "S1 di bawah tangga, S2 di atas. Mengubah SALAH SATU saklar selalu membalik keadaan lampu → X-OR: Y = S1 ⊕ S2." },
    alarm: { nama: "Alarm mobil", def: { ins: [{ n: "K", y: 30 }, { n: "P", y: 80 }, { n: "G", y: 130 }], g: [{ id: "o", t: "OR", in: ["P", "G"], x: 120, y: 105 }, { id: "Y", t: "AND", in: ["K", "o"], x: 210, y: 70 }], outs: [{ src: "Y", x: 300, y: 70, dev: function (v) { return buzzer(v, 300, 70, "sirine"); } }] }, ket: "K = alarm aktif (kunci remote), P = pintu terbuka, G = sensor goncangan. Sirine = K·(P + G): berbunyi hanya bila alarm aktif DAN ada pintu terbuka ATAU goncangan." },
    voting: { nama: "Voting 3 juri (mayoritas)", def: { ins: [{ n: "J1", y: 30 }, { n: "J2", y: 90 }, { n: "J3", y: 150 }], g: [{ id: "a", t: "AND", in: ["J1", "J2"], x: 120, y: 40 }, { id: "b", t: "AND", in: ["J2", "J3"], x: 120, y: 95 }, { id: "c", t: "AND", in: ["J1", "J3"], x: 120, y: 150 }, { id: "Y", t: "OR", in: ["a", "b", "c"], x: 210, y: 95 }], outs: [{ src: "Y", x: 300, y: 95, lab: "LOLOS" }] }, ket: "Peserta lolos bila minimal 2 dari 3 juri setuju: Y = J1·J2 + J2·J3 + J1·J3 (fungsi mayoritas)." },
    adder: { nama: "Half adder (penjumlah 1-bit)", def: { ins: [{ n: "A", y: 50 }, { n: "B", y: 120 }], g: [{ id: "S", t: "XOR", in: ["A", "B"], x: 160, y: 50 }, { id: "C", t: "AND", in: ["A", "B"], x: 160, y: 130 }], outs: [{ src: "S", x: 290, y: 50, lab: "S (sum)" }, { src: "C", x: 290, y: 130, lab: "C (carry)" }] }, ket: "Menjumlahkan dua bit: 1 + 1 = 10₂ → S = A ⊕ B, C = A·B. Dasar penjumlah di dalam mikroprosesor (Materi 13–14)." }
  };
  A.aplikasi = function (el) {
    var mode = el.dataset.mode || "tangga", v = {};
    el.innerHTML = '<div class="ctrl">' + Object.keys(APL).map(function (k) { return '<button class="btn sm ghost" data-m="' + k + '">' + APL[k].nama + "</button>"; }).join("") + '</div><svg class="diag" viewBox="0 0 340 200"><g class="c"></g></svg><div class="readout ar"></div>';
    function draw() {
      var a = APL[mode], r = drawCkt(a.def, v); el.querySelector(".c").innerHTML = r.s;
      el.querySelector(".ar").innerHTML = "<b>" + a.nama + "</b>: " + a.ket + (mode === "adder" ? " · sekarang " + (v.A ? 1 : 0) + " + " + (v.B ? 1 : 0) + " = <b>" + r.v.C + r.v.S + "₂</b> (= " + (r.v.C * 2 + r.v.S) + ")" : "");
      $$(el, "[data-m]").forEach(function (b) { b.classList.toggle("on", b.dataset.m === mode); });
    }
    el.addEventListener("click", function (e) { var k = e.target.closest("[data-in]"); if (k) { v[k.dataset.in] = v[k.dataset.in] ? 0 : 1; draw(); } });
    $$(el, "[data-m]").forEach(function (b) { b.onclick = function () { mode = b.dataset.m; v = {}; draw(); }; });
    draw();
  };
  // gambar statis untuk soal
  G.gerbang = function (p) { var t = p.t || "AND", n = +p.n || 2, gs = gateSym(t, 120, 60, n, { lab: false }), s = ""; ["A", "B", "C", "D"].slice(0, t === "NOT" || t === "BUF" ? 1 : n).forEach(function (nm, i) { var q = gs.ins[i]; s += line(50, q[1], q[0] + (/OR/.test(t) ? 5 : 0), q[1]) + txt(40, q[1] + 4, nm, { size: 11, b: 1, a: "end" }); }); return svg(260, 120, s + gs.s + line(gs.out[0], 60, 220, 60) + txt(226, 64, "Y", { size: 11, b: 1, a: "start" })); };
  G.boole = function () { var r = drawCkt(DEF_BOOLE, { A: 0, B: 0, C: 0 }); return svg(370, 190, r.s.replace(/#16a34a|#9aa5a0/g, INK)); };
  G.notbjt = function (p) {
    var s = line(40, 20, 240, 20) + txt(40, 14, "+V_CC 5 V", { size: 9.5, a: "start", b: 1 }) + resV(200, 20, 70) + txt(212, 48, "R_C " + fR(+p.RC || 1000), { size: 9.5, a: "start", b: 1 }) + line(200, 70, 200, 86) + dot(200, 80) + line(200, 80, 270, 80) + txt(274, 84, "Y = A'", { size: 10.5, a: "start", b: 1, c: COP });
    s += bjtSym(178, 126, false, INK, false) + line(200, 166, 200, 180) + gnd(200, 180) + txt(14, 130, "A", { size: 11, b: 1, a: "start", c: BLU }) + line(26, 126, 60, 126) + resH(60, 120, 126) + txt(90, 114, "R_B " + fR(+p.RB || 10000), { size: 9.5, b: 1 }) + line(120, 126, 154, 126);
    return svg(330, 195, s);
  };

  /* ---------------- PERMAINAN (JEDA MAIN) ---------------- */
  function gameHead(judul, sub) { return '<div class="gm-head"><span class="gm-badge">🎮 JEDA MAIN</span><b>' + judul + '</b><span class="gm-sub">' + sub + "</span></div>"; }
  // Game 1: Gerbang Misterius
  A.game_tebak = function (el) {
    var pool = ["AND", "OR", "NAND", "NOR", "XOR", "XNOR"], R = 8, ronde = 0, skor = 0, streak = 0, t, v, uji, done, msg = "";
    function baru() { t = pool[Math.floor(Math.random() * pool.length)]; v = [0, 0]; uji = {}; uji["00"] = 1; done = false; msg = "Klik saklar A dan B untuk menguji kotak misterius, lalu tebak gerbangnya."; }
    el.innerHTML = gameHead("Gerbang Misterius", "uji kotak tersembunyi, lalu tebak gerbangnya") + '<svg class="diag" viewBox="0 0 340 150"><g class="c"></g></svg><div class="ctrl gm-pilih">' + pool.map(function (g) { return '<button class="btn sm" data-t="' + g + '">' + GNAMA[g] + "</button>"; }).join("") + '</div><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm ghost" data-a="lanjut">Ronde berikut ▶</button><button class="btn sm ghost" data-a="ulang">Main lagi ↺</button></div>';
    function draw() {
      var y = lg(t, v), s = "";
      s += kawat(64, 45, 140, 45, v[0], 100) + kawat(64, 105, 140, 105, v[1], 100) + saklarBox(42, 45, "A", v[0], 0) + saklarBox(42, 105, "B", v[1], 1);
      if (done) { var gs = gateSym(t, 150, 75, 2, { lab: false }); s += kawat(140, 45, 150 + (/OR/.test(t) ? 5 : 0), gs.ins[0][1], v[0], 145) + kawat(140, 105, 150 + (/OR/.test(t) ? 5 : 0), gs.ins[1][1], v[1], 145) + gs.s + kawat(gs.out[0], 75, 268, 75, y, 240) + txt(175, 132, GNAMA[t], { size: 12, b: 1, c: COP }); }
      else s += '<rect x="140" y="25" width="100" height="100" rx="12" fill="#1f2a24"/>' + txt(190, 88, "?", { size: 46, b: 1, c: "#fde047" }) + kawat(240, 75, 268, 75, y, 254);
      s += lampu(284, 75, y, "Y");
      var tested = Object.keys(uji).length; s += txt(330, 145, "kombinasi diuji: " + tested + "/4", { size: 9, a: "end", c: MUT });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".gm-msg").innerHTML = (ronde >= R ? "🏁 <b>Selesai!</b> Skor akhir <b>" + skor + "</b> dari " + R * 10 + (skor >= R * 9 ? " · Luar biasa! 🏆" : skor >= R * 6 ? " · Bagus! ⭐" : " · Coba lagi untuk skor lebih tinggi.") : "Ronde <b>" + (ronde + 1) + "/" + R + "</b> · Skor <b>" + skor + "</b>" + (streak > 1 ? " · 🔥 beruntun " + streak : "") + "<br>" + msg);
      $$(el, ".gm-pilih button").forEach(function (b) { b.disabled = done || ronde >= R; });
    }
    el.addEventListener("click", function (e) {
      var k = e.target.closest("[data-in]"); if (k && !done && ronde < R) { v[+k.dataset.in] ^= 1; uji["" + v[0] + v[1]] = 1; draw(); return; }
      var g = e.target.closest("[data-t]"); if (g && !done && ronde < R) {
        var benar = g.dataset.t === t, tested = Object.keys(uji).length; done = true;
        if (benar) { var p = tested <= 2 ? 10 : tested === 3 ? 8 : 6; skor += 10 === p ? 10 : p; streak++; msg = "✅ Benar, itu <b>" + GNAMA[t] + "</b>! +" + p + " poin" + (tested <= 2 ? " (hemat uji, hebat!)" : ""); }
        else { streak = 0; msg = "❌ Belum tepat. Kotak itu <b>" + GNAMA[t] + "</b> (" + GRUMUS[t] + "). Tips: uji keempat kombinasi agar yakin."; }
        draw(); return;
      }
      var a = e.target.closest("[data-a]"); if (a) { if (a.dataset.a === "ulang") { ronde = 0; skor = 0; streak = 0; baru(); } else if (done) { ronde++; if (ronde < R) baru(); } draw(); }
    });
    baru(); draw();
  };
  // Game 2: Nyalakan Lampu
  var LV_LAMPU = [
    { judul: "Pemanasan", start: {}, def: { ins: [{ n: "A", y: 50 }, { n: "B", y: 110 }], g: [{ id: "Y", t: "AND", in: ["A", "B"], x: 160, y: 80 }], outs: [{ src: "Y", x: 290, y: 80, lab: "Y" }] } },
    { judul: "Kebalikan", start: { A: 1, B: 1 }, def: { ins: [{ n: "A", y: 50 }, { n: "B", y: 110 }], g: [{ id: "Y", t: "NOR", in: ["A", "B"], x: 160, y: 80 }], outs: [{ src: "Y", x: 290, y: 80, lab: "Y" }] } },
    { judul: "Penjaga", start: { C: 1 }, def: { ins: [{ n: "A", y: 30 }, { n: "B", y: 80 }, { n: "C", y: 145 }], g: [{ id: "o", t: "OR", in: ["A", "B"], x: 110, y: 55 }, { id: "n", t: "NOT", in: ["C"], x: 110, y: 145 }, { id: "Y", t: "AND", in: ["o", "n"], x: 210, y: 100 }], outs: [{ src: "Y", x: 300, y: 100, lab: "Y" }] } },
    { judul: "Beda itu indah", start: {}, def: { ins: [{ n: "A", y: 30 }, { n: "B", y: 80 }, { n: "C", y: 145 }], g: [{ id: "x", t: "XOR", in: ["A", "B"], x: 120, y: 55 }, { id: "Y", t: "AND", in: ["x", "C"], x: 210, y: 100 }], outs: [{ src: "Y", x: 300, y: 100, lab: "Y" }] } },
    { judul: "Dua lampu", start: {}, def: { ins: [{ n: "A", y: 30 }, { n: "B", y: 90 }, { n: "C", y: 150 }], g: [{ id: "p", t: "NAND", in: ["A", "B"], x: 120, y: 50 }, { id: "q", t: "OR", in: ["B", "C"], x: 120, y: 130 }, { id: "Y", t: "AND", in: ["p", "q"], x: 210, y: 60 }, { id: "Z", t: "XNOR", in: ["q", "A"], x: 210, y: 140 }], outs: [{ src: "Y", x: 300, y: 60, lab: "Y" }, { src: "Z", x: 300, y: 140, lab: "Z" }] }, dua: true },
    { judul: "Bos terakhir", start: { D: 1 }, def: { ins: [{ n: "A", y: 22 }, { n: "B", y: 66 }, { n: "C", y: 112 }, { n: "D", y: 158 }], g: [{ id: "p", t: "XOR", in: ["A", "B"], x: 105, y: 44 }, { id: "q", t: "NOR", in: ["C", "D"], x: 105, y: 135 }, { id: "r", t: "NAND", in: ["p", "q"], x: 190, y: 90 }, { id: "Y", t: "NOT", in: ["r"], x: 255, y: 90 }], outs: [{ src: "Y", x: 315, y: 90, lab: "Y" }] } }
  ];
  A.game_lampu = function (el) {
    var lv = 0, v, klik, bintang = [], selesai;
    function mulai() { v = {}; var st = LV_LAMPU[lv].start; Object.keys(st).forEach(function (k) { v[k] = st[k]; }); klik = 0; selesai = false; }
    function minKlik(L) {
      var names = L.def.ins.map(function (i) { return i.n; }), best = 99;
      for (var m = 0; m < (1 << names.length); m++) { var vv = {}, d = 0; names.forEach(function (n, i) { vv[n] = (m >> i) & 1; if (vv[n] !== (L.start[n] || 0)) d++; }); if (ok(L, vv)) best = Math.min(best, d); }
      return best;
    }
    function ok(L, vv) { var r = evalCkt(L.def, vv); return L.dua ? r.Y === 1 && r.Z === 1 : r.Y === 1; }
    el.innerHTML = gameHead("Nyalakan Lampu!", "atur saklar sampai lampu menyala, dengan klik sesedikit mungkin") + '<div class="readout gm-lv"></div><svg class="diag" viewBox="0 0 340 185"><g class="c"></g></svg><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm ghost" data-a="ulang">Ulangi level ↺</button><button class="btn sm" data-a="lanjut">Level berikut ▶</button></div>';
    function draw() {
      var L = LV_LAMPU[lv], r = drawCkt(L.def, v), m = minKlik(L), sukses = ok(L, v);
      if (sukses && !selesai) { selesai = true; bintang[lv] = klik <= m ? 3 : klik <= m + 2 ? 2 : 1; }
      el.querySelector(".c").innerHTML = r.s;
      el.querySelector(".gm-lv").innerHTML = LV_LAMPU.map(function (x, i) { return '<span class="tag ' + (i === lv ? "ok" : bintang[i] ? "mid" : "") + '">L' + (i + 1) + (bintang[i] ? " " + "★".repeat(bintang[i]) : "") + "</span>"; }).join(" ") + " · <b>Level " + (lv + 1) + ": " + L.judul + "</b>" + (L.dua ? " (nyalakan Y DAN Z)" : "");
      el.querySelector(".gm-msg").innerHTML = selesai ? "🎉 <b>Lampu menyala!</b> Klik: " + klik + " (minimum " + m + ") → " + "★".repeat(bintang[lv]) + "☆".repeat(3 - bintang[lv]) + (lv === LV_LAMPU.length - 1 ? " · 🏆 Semua level selesai! Total bintang: " + bintang.reduce(function (a, b) { return a + (b || 0); }, 0) + "/18" : "") : "Klik kotak saklar di kiri. Kabel hijau = 1, abu-abu = 0. Klik: " + klik + " · Target bintang 3: " + m + " klik";
      el.querySelector("[data-a=lanjut]").disabled = !selesai || lv === LV_LAMPU.length - 1;
    }
    el.addEventListener("click", function (e) {
      var k = e.target.closest("[data-in]"); if (k && !selesai) { v[k.dataset.in] = v[k.dataset.in] ? 0 : 1; klik++; draw(); return; }
      var a = e.target.closest("[data-a]"); if (a) { if (a.dataset.a === "lanjut" && lv < LV_LAMPU.length - 1) lv++; mulai(); draw(); }
    });
    mulai(); draw();
  };
  // Game 3: Pasang Gerbang
  var LV_PASANG = [
    { def: { ins: [{ n: "A", y: 50 }, { n: "B", y: 110 }], g: [{ id: "s1", slot: 1, in: ["A", "B"], x: 160, y: 80 }], outs: [{ src: "s1", x: 290, y: 80, lab: "Y" }] }, out: "s1", target: { s1: "XOR" } },
    { def: { ins: [{ n: "A", y: 50 }, { n: "B", y: 110 }], g: [{ id: "s1", slot: 1, in: ["A", "B"], x: 160, y: 80 }], outs: [{ src: "s1", x: 290, y: 80, lab: "Y" }] }, out: "s1", target: { s1: "NOR" } },
    { def: { ins: [{ n: "A", y: 30 }, { n: "B", y: 80 }, { n: "C", y: 145 }], g: [{ id: "s1", slot: 1, in: ["A", "B"], x: 110, y: 55 }, { id: "Y", t: "AND", in: ["s1", "C"], x: 210, y: 100 }], outs: [{ src: "Y", x: 300, y: 100, lab: "Y" }] }, out: "Y", target: { s1: "NAND" } },
    { def: { ins: [{ n: "A", y: 30 }, { n: "B", y: 80 }, { n: "C", y: 145 }], g: [{ id: "s1", slot: 1, in: ["A", "B"], x: 110, y: 55 }, { id: "s2", slot: 1, in: ["s1", "C"], x: 210, y: 100 }], outs: [{ src: "s2", x: 300, y: 100, lab: "Y" }] }, out: "s2", target: { s1: "XOR", s2: "OR" } },
    { def: { ins: [{ n: "A", y: 30 }, { n: "B", y: 90 }, { n: "C", y: 150 }], g: [{ id: "s1", slot: 1, in: ["A", "B"], x: 110, y: 50 }, { id: "s2", slot: 1, in: ["B", "C"], x: 110, y: 130 }, { id: "s3", slot: 1, in: ["s1", "s2"], x: 210, y: 90 }], outs: [{ src: "s3", x: 300, y: 90, lab: "Y" }] }, out: "s3", target: { s1: "AND", s2: "AND", s3: "OR" } }
  ];
  A.game_pasang = function (el) {
    var lv = 0, types, urut = ["AND", "OR", "NAND", "NOR", "XOR", "XNOR"], skor = [], coba;
    function mulai() { types = {}; coba = 0; }
    function tabel(L, tp) { var names = L.def.ins.map(function (i) { return i.n; }), o = []; for (var m = 0; m < (1 << names.length); m++) { var vv = {}; names.forEach(function (n, i) { vv[n] = (m >> (names.length - 1 - i)) & 1; }); o.push(evalCkt(L.def, vv, tp)[L.out]); } return o; }
    el.innerHTML = gameHead("Pasang Gerbang", "klik kotak ? untuk mengganti jenis gerbang sampai tabel cocok dengan target") + '<div class="readout gm-lv"></div><svg class="diag" viewBox="0 0 340 185"><g class="c"></g></svg><div class="tb"></div><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm ghost" data-a="ulang">Ulangi ↺</button><button class="btn sm" data-a="lanjut">Level berikut ▶</button></div>';
    function draw() {
      var L = LV_PASANG[lv], names = L.def.ins.map(function (i) { return i.n; }), slots = L.def.g.filter(function (g) { return g.slot; }), full = slots.every(function (g) { return types[g.id]; });
      var tg = tabel(L, L.target), cur = full ? tabel(L, types) : null, cocok = full && tg.every(function (x, i) { return x === cur[i]; });
      if (cocok && skor[lv] == null) skor[lv] = coba;
      el.querySelector(".c").innerHTML = drawCkt(L.def, {}, { types: types }).s.replace(/data-in="[^"]*"/g, "");
      var h = "<tr>" + names.map(function (n) { return "<th>" + n + "</th>"; }).join("") + "<th>target Y</th><th>rangkaianmu</th></tr>";
      tg.forEach(function (y, m) { var c = cur ? cur[m] : "?", okr = cur && c === y; h += "<tr>" + names.map(function (n, i) { return "<td>" + ((m >> (names.length - 1 - i)) & 1) + "</td>"; }).join("") + '<td style="font-weight:700">' + y + '</td><td style="font-weight:700;background:' + (cur ? (okr ? "#dcfce7" : "#fee2e2") : "") + '">' + c + "</td></tr>"; });
      el.querySelector(".tb").innerHTML = '<table class="tabel small" style="margin:4px auto;width:auto">' + h + "</table>";
      el.querySelector(".gm-lv").innerHTML = LV_PASANG.map(function (x, i) { return '<span class="tag ' + (i === lv ? "ok" : skor[i] != null ? "mid" : "") + '">L' + (i + 1) + (skor[i] != null ? " ✓" : "") + "</span>"; }).join(" ") + " · <b>Level " + (lv + 1) + "</b> · " + slots.length + " kotak kosong";
      el.querySelector(".gm-msg").innerHTML = cocok ? "🎉 <b>Cocok!</b> " + slots.map(function (g) { return GNAMA[types[g.id]]; }).join(" + ") + " · pergantian: " + coba + (lv === LV_PASANG.length - 1 ? " · 🏆 Semua level selesai!" : "") : full ? "Belum cocok: baris merah berbeda dari target. Klik kotak gerbang untuk mengganti." : "Klik kotak <b>?</b> (berulang) untuk memilih gerbang: AND → OR → NAND → NOR → X-OR → X-NOR.";
      el.querySelector("[data-a=lanjut]").disabled = !cocok || lv === LV_PASANG.length - 1;
    }
    el.addEventListener("click", function (e) {
      var k = e.target.closest("[data-slot]"); if (k) { var id = k.dataset.slot, i = urut.indexOf(types[id]); types[id] = urut[(i + 1) % urut.length]; coba++; draw(); return; }
      var a = e.target.closest("[data-a]"); if (a) { if (a.dataset.a === "lanjut" && lv < LV_PASANG.length - 1) lv++; mulai(); draw(); }
    });
    mulai(); draw();
  };
  // Game 4: Kilat 30 detik
  A.game_kilat = function (el) {
    var pool = ["NOT", "AND", "OR", "NAND", "NOR", "XOR", "XNOR"], main = false, sisa = 30, skor = 0, salah = 0, soal, best = 0, umpan = "";
    try { best = +(localStorage.getItem("ed_kilat_best") || 0); } catch (e) { }
    function baru() { var t = pool[Math.floor(Math.random() * pool.length)], n = t === "NOT" ? 1 : Math.random() < 0.3 ? 3 : 2, a = []; for (var i = 0; i < n; i++) a.push(Math.random() < 0.5 ? 1 : 0); soal = { t: t, a: a, y: lg(t, a) }; }
    el.innerHTML = gameHead("Kilat 30 Detik", "jawab keluaran gerbang secepat mungkin (tombol atau tekan 0/1)") + '<svg class="diag" viewBox="0 0 340 150"><g class="c"></g></svg><div class="ctrl"><button class="btn gm-big" data-j="0">0</button><button class="btn gm-big" data-j="1">1</button></div><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm" data-a="mulai">Mulai ▶</button></div>';
    function draw() {
      var s = "";
      if (main && soal) { var gs = gateSym(soal.t, 150, 70, soal.a.length, { lab: false }); soal.a.forEach(function (x, i) { var q = gs.ins[i]; s += kawat(70, q[1], q[0] + (/OR/.test(soal.t) ? 5 : 0), q[1], x, 110) + txt(56, q[1] + 5, String(x), { size: 16, b: 1, c: x ? HI : MUT, a: "end" }); }); s += gs.s + line(gs.out[0], 70, 250, 70, INK, 2.2) + txt(270, 78, "?", { size: 26, b: 1, c: COP }) + txt(175, 130, GNAMA[soal.t], { size: 12, b: 1, c: COP }); }
      else s += txt(170, 70, sisa <= 0 ? "Waktu habis!" : "Siap?", { size: 26, b: 1, c: COP }) + txt(170, 100, "Tekan Mulai", { size: 11, c: MUT });
      s += '<rect x="10" y="140" width="320" height="6" rx="3" fill="#e5e7eb"/><rect x="10" y="140" width="' + (320 * Math.max(0, sisa) / 30) + '" height="6" rx="3" fill="' + (sisa > 10 ? HI : RED) + '"/>';
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".gm-msg").innerHTML = "⏱ " + Math.max(0, Math.ceil(sisa)) + " s · Skor <b>" + skor + "</b> · salah " + salah + " · rekor <b>" + best + "</b>" + (umpan ? "<br>" + umpan : "");
      el.querySelector("[data-a=mulai]").textContent = main ? "Sedang main…" : "Mulai ▶";
    }
    function jawab(j) { if (!main) return; if (j === soal.y) { skor++; umpan = "✅ benar"; } else { salah++; umpan = "❌ " + GNAMA[soal.t] + "(" + soal.a.join(",") + ") = " + soal.y; } baru(); draw(); }
    $$(el, "[data-j]").forEach(function (b) { b.onclick = function () { jawab(+b.dataset.j); }; });
    el.querySelector("[data-a=mulai]").onclick = function () { if (main) return; main = true; sisa = 30; skor = 0; salah = 0; umpan = ""; baru(); draw(); };
    var kb = function (e) { if (!document.body.contains(el)) { document.removeEventListener("keydown", kb); return; } if (e.key === "0" || e.key === "1") jawab(+e.key); };
    document.addEventListener("keydown", kb);
    draw();
    loop(el, function (dt) { if (!main) return; sisa -= dt; if (sisa <= 0) { main = false; var naik = skor > best; if (naik) { best = skor; try { localStorage.setItem("ed_kilat_best", String(best)); } catch (e) { } } umpan = "🏁 Selesai! Skor " + skor + (naik ? " · 🏆 REKOR BARU!" : "") + (skor >= 25 ? " · Master gerbang!" : skor >= 15 ? " · Hebat!" : " · Ayo coba lagi!"); } draw(); });
  };
  /* =================== ANIMASI MATERI 13: ANALOG–DIGITAL & SISTEM BILANGAN =================== */
  function hr13(a, b, c) { var h = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return h - Math.floor(h); }
  function gs13(a, b, c) { var u = Math.max(1e-9, hr13(a, b, c)), v = hr13(a + 0.37, b + 1.7, c + 17.3); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function erfc13(x) { var z = Math.abs(x), t = 1 / (1 + 0.5 * z), r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; }
  function Q13(x) { return 0.5 * erfc13(x / Math.SQRT2); }
  var SIG13 = {
    sinus: { nama: "Sinus", f: function (t) { return 0.9 * Math.sin(2 * Math.PI * t); } },
    suara: { nama: "Suara", f: function (t) { return 0.55 * Math.sin(2 * Math.PI * t) + 0.28 * Math.sin(2 * Math.PI * 3.1 * t + 1) + 0.14 * Math.sin(2 * Math.PI * 7.3 * t); } },
    suhu: { nama: "Suhu (lambat)", f: function (t) { return 0.75 * Math.sin(Math.PI * 0.5 * t) + 0.12 * Math.sin(2 * Math.PI * 1.3 * t); } }
  };
  function bin13(v, n) { var s = ""; for (var i = n - 1; i >= 0; i--) s += (v >> i) & 1; return s; }
  function dB13(x) { return x > 1e9 ? "> 90" : f(10 * Math.log10(x), 1); }

  // A.anadig — analog vs digital dalam satu layar
  A.anadig = function (el) {
    var sig = "sinus", sd = 0.1, k = 3, nb = 4, N = 32, ph = 0, play = true, acc = 0;
    el.innerHTML = '<div class="ctrl">' + Object.keys(SIG13).map(function (s) { return '<button class="btn sm ghost" data-s="' + s + '">' + SIG13[s].nama + "</button>"; }).join("") + '<button class="btn sm ghost" data-a="p">❚❚ jeda</button></div>' +
      '<svg class="diag wide" viewBox="0 0 700 330"><g class="c"></g></svg>' +
      '<div class="ctrl">' + slider("Derau saluran σ", 0, 0.4, 0.01, sd, "") + slider("Penguat ulang / salinan k", 1, 10, 1, k, "") + slider("Bit ADC n", 1, 8, 1, nb, "bit") + slider("Sampel per jendela", 8, 64, 4, N, "") + "</div>" +
      '<div class="ad-r" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="readout ra" style="text-align:left"></div><div class="readout rd" style="text-align:left"></div></div>';
    var ins = $$(el, ".sl input");
    function plot(fn, x0, yc, sc, c, w) { var p = []; for (var i = 0; i <= 300; i++) { var v = fn(i); p.push((x0 + i * 320 / 300).toFixed(1) + "," + (yc - Math.max(-1.4, Math.min(1.4, v)) * sc).toFixed(1)); } return poly(p.join(" "), c, w || 1.8); }
    function draw() {
      var F = SIG13[sig].f, s = "", L = 1 << nb, D = 2 / L, sc = 26;
      var tA = function (i) { return ph + i / 150; }, gi = function (i) { return Math.round(ph * 150) + i; };
      // ---------- ANALOG ----------
      var ana = function (i) { var x = F(tA(i)), z = 0; for (var h = 0; h < k; h++) z += gs13(gi(i), h, 3); return x + sd * z; };
      s += txt(175, 18, "ANALOG", { size: 15, b: 1, c: COP }) + txt(525, 18, "DIGITAL", { size: 15, b: 1, c: BLU }) + line(350, 8, 350, 322, "#d6cfbd", 1.5);
      [62, 160, 262].forEach(function (y) { s += line(15, y, 335, y, "#e5e0d2", 1) + line(365, y, 685, y, "#e5e0d2", 1); });
      s += txt(15, 34, "1. Sinyal asli (kontinu)", { size: 10, a: "start", c: MUT, b: 1 }) + plot(function (i) { return F(tA(i)); }, 15, 62, sc, COP, 2.2);
      s += txt(15, 128, "2. Setelah " + k + " penguat ulang (derau menumpuk)", { size: 10, a: "start", c: MUT, b: 1 }) + plot(ana, 15, 160, sc, COP, 1.4);
      s += txt(15, 228, "3. Hasil (oranye) vs asli (garis putus)", { size: 10, a: "start", c: MUT, b: 1 }) + plot(ana, 15, 262, sc, COP, 1.4) + plot(function (i) { return F(tA(i)); }, 15, 262, sc, INK, 1).replace("<polyline", '<polyline stroke-dasharray="4 3"');
      // ---------- DIGITAL ----------
      var g0 = Math.floor(ph * N / 2), samp = {};
      function sampel(j) { // j indeks global sampel
        if (samp[j]) return samp[j];
        var x = F(j * 2 / N), q = Math.max(0, Math.min(L - 1, Math.floor((x + 1) / D))), bits = [], rx = [], err = 0, out = 0;
        for (var b = nb - 1; b >= 0; b--) {
          var bit = (q >> b) & 1, cur = bit, last = 0;
          for (var h = 0; h < k; h++) { last = cur + sd * gs13(j, b, h + 11); cur = last > 0.5 ? 1 : 0; }
          bits.push(cur); rx.push({ b: bit, r: last, d: cur }); if (cur !== bit) err++; out = out * 2 + cur;
        }
        return (samp[j] = { x: x, q: q, out: out, rx: rx, err: err });
      }
      var jOf = function (i) { return Math.floor(tA(i) * N / 2); };
      s += txt(365, 34, "1. Disampel " + N + " titik, dikuantisasi " + nb + " bit (" + L + " level)", { size: 10, a: "start", c: MUT, b: 1 });
      s += plot(function (i) { return F(tA(i)); }, 365, 62, sc, "#c9c2b0", 1.2) + plot(function (i) { var q = sampel(jOf(i)).q; return -1 + (q + 0.5) * D; }, 365, 62, sc, BLU, 2);
      // baris bit (24 bit pertama)
      var nbit = Math.min(24, Math.max(nb, Math.floor(24 / nb) * nb)), bw = 320 / nbit, ns = nbit / nb, errV = 0, totV = 0;
      s += txt(365, 128, "2. Bit di saluran (" + nbit + " bit), ambang 0,5", { size: 10, a: "start", c: MUT, b: 1 });
      var yb = 160, pts = [];
      for (var m = 0; m < ns; m++) {
        var S = sampel(g0 + m);
        S.rx.forEach(function (o, bi) {
          var X = 365 + (m * nb + bi) * bw, ry = function (r) { return yb + 16 - Math.max(-0.5, Math.min(1.5, r)) * 32; };
          for (var u = 0; u < 4; u++) pts.push((X + u * bw / 3).toFixed(1) + "," + ry(o.r + (u === 1 ? 0 : sd * 0.6 * gs13(g0 + m, bi * 7 + u, 41))).toFixed(1));
          var er = o.d !== o.b; totV++; if (er) errV++;
          s += txt(X + bw / 2, yb + 33, String(o.d), { size: 9, b: 1, c: er ? RED : HI });
          if (er) s += '<rect x="' + X + '" y="' + (yb - 22) + '" width="' + bw + '" height="44" fill="' + RED + '" opacity=".12"/>';
        });
        if (m) s += line(365 + m * nb * bw, yb - 22, 365 + m * nb * bw, yb + 22, "#cfc6b1", 1);
      }
      s += poly(pts.join(" "), BLU, 1.4) + '<line x1="365" y1="' + yb + '" x2="685" y2="' + yb + '" stroke="' + COP + '" stroke-dasharray="4 3" stroke-width="1"/>' + txt(687, yb + 3, "0,5", { size: 8, a: "start", c: COP });
      s += txt(365, 228, "3. Hasil rekonstruksi (biru) vs asli (garis putus)", { size: 10, a: "start", c: MUT, b: 1 });
      s += plot(function (i) { return -1 + (sampel(jOf(i)).out + 0.5) * D; }, 365, 262, sc, BLU, 1.8) + plot(function (i) { return F(tA(i)); }, 365, 262, sc, INK, 1).replace("<polyline", '<polyline stroke-dasharray="4 3"');
      el.querySelector(".c").innerHTML = s;
      // ---------- angka (teori) ----------
      var Ps = 0; for (var i = 0; i < 400; i++) { var v = F(i / 100); Ps += v * v; } Ps /= 400;
      var snrA = Ps / (sd * sd * k + 1e-12), pe1 = sd > 0 ? Q13(0.5 / sd) : 0, pe = 1 - Math.pow(1 - pe1, k);
      var eq = D * D / 12, eb = pe * D * D * (Math.pow(4, nb) - 1) / 3, snrD = Ps / (eq + eb);
      el.querySelector(".ra").innerHTML = "<b style='color:" + COP + "'>ANALOG</b><br>derau total = σ√k = " + f(sd, 2) + "×√" + k + " = <b>" + f(sd * Math.sqrt(k), 3) + "</b><br>SNR = P<sub>s</sub>/(kσ²) = <b>" + dB13(snrA) + " dB</b><br>" + (snrA < 10 ? '<span class="tag no">derau mengganggu, tak bisa dipisahkan</span>' : snrA < 100 ? '<span class="tag mid">berdesis</span>' : '<span class="tag ok">jernih</span>');
      el.querySelector(".rd").innerHTML = "<b style='color:" + BLU + "'>DIGITAL</b><br>Δ = 2/2<sup>" + nb + "</sup> = " + f(D, 4) + " · peluang bit salah/tahap = Q(0,5/σ) = " + (pe1 < 1e-9 ? "≈ 0" : pe1 < 1e-3 ? pe1.toExponential(1).replace(".", ",") : f(pe1, 3)) + "<br>bit salah di layar: <b>" + errV + "/" + totV + "</b> · SNR ≈ <b>" + dB13(snrD) + " dB</b><br>" + (pe1 > 0.01 ? '<span class="tag no">derau melewati ambang: bit salah (efek tebing)</span>' : nb <= 2 ? '<span class="tag mid">regenerasi sempurna, tapi kuantisasi kasar</span>' : '<span class="tag ok">regenerasi: derau dibuang tiap tahap</span>');
    }
    ins.forEach(function (inp, i) { inp.oninput = function () { var v = +inp.value; inp.parentNode.querySelector(".val").textContent = i === 0 ? f(v, 2) : v; if (i === 0) sd = v; else if (i === 1) k = v; else if (i === 2) nb = v; else N = v; draw(); }; });
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-s]"); if (b) { sig = b.dataset.s; mark(); draw(); } var a = e.target.closest("[data-a=p]"); if (a) { play = !play; a.textContent = play ? "❚❚ jeda" : "▶ jalan"; } });
    function mark() { $$(el, "[data-s]").forEach(function (b) { b.classList.toggle("on", b.dataset.s === sig); }); }
    mark(); draw();
    loop(el, function (dt) { if (!play) return; ph += dt * 0.35; acc += dt; if (acc > 0.08) { acc = 0; draw(); } });
  };

  // A.cliff — TV analog vs TV digital (efek tebing)
  A.cliff = function (el) {
    var n = 20;
    el.innerHTML = '<svg class="diag wide" viewBox="0 0 700 300"><g class="c"></g></svg><div class="ctrl">' + slider("Gangguan / jarak dari pemancar", 0, 100, 1, n, "%") + '</div><div class="readout cr"></div>';
    function scene(x, y) {
      return '<rect x="' + x + '" y="' + y + '" width="220" height="130" fill="#7dd3fc"/><circle cx="' + (x + 170) + '" cy="' + (y + 32) + '" r="16" fill="#fde047"/><polygon points="' + x + "," + (y + 130) + " " + (x + 60) + "," + (y + 60) + " " + (x + 110) + "," + (y + 110) + " " + (x + 150) + "," + (y + 70) + " " + (x + 220) + "," + (y + 130) + '" fill="#15803d"/><rect x="' + (x + 30) + '" y="' + (y + 95) + '" width="36" height="28" fill="#f8fafc"/><polygon points="' + (x + 26) + "," + (y + 96) + " " + (x + 48) + "," + (y + 80) + " " + (x + 70) + "," + (y + 96) + '" fill="' + COP + '"/>';
    }
    function tv(x, y, judul) { return '<rect x="' + (x - 10) + '" y="' + (y - 10) + '" width="240" height="150" rx="10" fill="#1f2a24"/>' + txt(x + 110, y - 18, judul, { size: 12, b: 1 }) + '<rect x="' + (x + 90) + '" y="' + (y + 140) + '" width="40" height="10" fill="#1f2a24"/>'; }
    function draw() {
      var s = "", x1 = 40, x2 = 400, y = 40, seed = Math.floor(performance.now() / 120);
      s += tv(x1, y, "TV analog") + scene(x1, y) + tv(x2, y, "TV digital") ;
      // analog: kontras turun + semut
      s += '<rect x="' + x1 + '" y="' + y + '" width="220" height="130" fill="#9ca3af" opacity="' + (n / 115).toFixed(2) + '"/>';
      var dots = Math.round(n * n * 0.09);
      for (var i = 0; i < dots; i++) { var px = x1 + hr13(i, seed, 1) * 218, py = y + hr13(i, seed, 2) * 128, g = hr13(i, seed, 3) > 0.5; s += '<rect x="' + px.toFixed(0) + '" y="' + py.toFixed(0) + '" width="2.4" height="2" fill="' + (g ? "#fff" : "#111") + '"/>'; }
      // digital
      if (n < 55) s += scene(x2, y);
      else if (n < 70) { s += scene(x2, y); var nb = Math.round((n - 54) * 3); for (var j = 0; j < nb; j++) { var bx = x2 + Math.floor(hr13(j, 9, 1) * 11) * 20, by = y + Math.floor(hr13(j, 9, 2) * 6.5) * 20; s += '<rect x="' + bx + '" y="' + by + '" width="20" height="' + Math.min(20, y + 130 - by) + '" fill="' + ["#7dd3fc", "#15803d", "#a3a3a3", "#f8fafc", "#0f3d2e"][Math.floor(hr13(j, 9, 3) * 5)] + '"/>'; } s += txt(x2 + 110, y + 124, "gambar patah-patah / beku", { size: 10, b: 1, c: "#fff" }); }
      else s += '<rect x="' + x2 + '" y="' + y + '" width="220" height="130" fill="#111"/>' + txt(x2 + 110, y + 70, "TIDAK ADA SINYAL", { size: 13, b: 1, c: "#fff" });
      // grafik kualitas
      var gx = 40, gy = 210, gw = 580, gh = 70, qa = function (v) { return Math.max(0, 100 - v * 1.0); }, qd = function (v) { return v < 55 ? 100 : v < 70 ? 100 - (v - 55) * 6.6 : 0; };
      s += line(gx, gy + gh, gx + gw, gy + gh, INK, 1.4) + line(gx, gy, gx, gy + gh, INK, 1.4) + txt(gx - 4, gy + 8, "100", { size: 8, a: "end", c: MUT }) + txt(gx + gw, gy + gh + 13, "gangguan →", { size: 9, a: "end", c: MUT }) + txt(gx + 4, gy - 4, "kualitas gambar", { size: 9, a: "start", c: MUT });
      var pa = [], pd = []; for (var v = 0; v <= 100; v += 2) { pa.push((gx + v * gw / 100) + "," + (gy + gh - qa(v) * gh / 100)); pd.push((gx + v * gw / 100) + "," + (gy + gh - qd(v) * gh / 100)); }
      s += poly(pa.join(" "), COP, 2.4) + poly(pd.join(" "), BLU, 2.4) + txt(gx + gw + 6, gy + gh - qa(100) * gh / 100, "analog", { size: 9, a: "start", c: COP, b: 1 }) + txt(gx + 270, gy + 30, "digital: “tebing”", { size: 9, a: "start", c: BLU, b: 1 });
      s += line(gx + n * gw / 100, gy - 2, gx + n * gw / 100, gy + gh, RED, 1.5) + '<circle cx="' + (gx + n * gw / 100) + '" cy="' + (gy + gh - qa(n) * gh / 100) + '" r="4" fill="' + COP + '"/><circle cx="' + (gx + n * gw / 100) + '" cy="' + (gy + gh - qd(n) * gh / 100) + '" r="4" fill="' + BLU + '"/>';
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".cr").innerHTML = "Gangguan " + n + "% → analog " + Math.round(qa(n)) + "%, digital " + Math.round(qd(n)) + "% · " + (n < 55 ? "Digital masih <b>sempurna</b> karena derau di bawah ambang; analog sudah <b>berkurang sedikit demi sedikit</b>." : n < 70 ? "Digital mulai <b>runtuh mendadak</b> (bit salah melebihi kemampuan koreksi): efek tebing." : "Digital <b>hilang total</b>; analog masih terlihat walau buram. Inilah kelemahan digital: kualitas jatuh mendadak.");
    }
    var inp = el.querySelector("input"); inp.oninput = function () { n = +inp.value; inp.parentNode.querySelector(".val").textContent = n; draw(); };
    var acc = 0; draw(); loop(el, function (dt) { acc += dt; if (acc > 0.15) { acc = 0; draw(); } });
  };

  // A.biner — pengubah biner/desimal/heksa/oktal
  A.biner = function (el) {
    var nb = 8, v = 22, mode = "bit";
    el.innerHTML = '<div class="ctrl"><button class="btn sm ghost" data-m="bit">Biner → desimal</button><button class="btn sm ghost" data-m="bagi">Desimal → biner (bagi 2)</button><button class="btn sm ghost" data-m="hex">Heksa & oktal</button></div><div class="bn-bits" style="display:flex;justify-content:center;gap:4px;flex-wrap:wrap;margin:8px 0"></div><div class="ctrl">' + slider("Nilai desimal", 0, 255, 1, v, "") + '</div><div class="bn-x" style="overflow-x:auto"></div><div class="readout br"></div>';
    function draw() {
      var h = "";
      for (var i = nb - 1; i >= 0; i--) { var b = (v >> i) & 1; h += '<button class="btn sm ' + (b ? "" : "ghost") + '" data-b="' + i + '" style="flex-direction:column;min-width:52px;padding:4px 6px;gap:0' + (b ? ";background:#16a34a" : "") + '"><span style="font-size:10px;opacity:.8">2<sup>' + i + "</sup>=" + (1 << i) + '</span><span style="font-size:22px;font-family:var(--f-mono)">' + b + '</span><span style="font-size:9px;opacity:.75">' + (i === nb - 1 ? "MSB" : i === 0 ? "LSB" : "&nbsp;") + "</span></button>"; }
      el.querySelector(".bn-bits").innerHTML = h;
      var x = "";
      if (mode === "bit") {
        var parts = [], sum = [];
        for (var j = nb - 1; j >= 0; j--) { var bb = (v >> j) & 1; parts.push(bb + "×" + (1 << j)); if (bb) sum.push(1 << j); }
        x = '<ol class="langkah small"><li>Tulis bobot tiap bit: dari kanan 1, 2, 4, 8, … (2⁰, 2¹, 2², …).</li><li>Kalikan bit dengan bobotnya: ' + parts.join(" + ") + '.</li><li>Jumlahkan bobot yang bitnya 1: ' + (sum.length ? sum.join(" + ") : "0") + " = <b>" + v + "</b>.</li></ol>";
      } else if (mode === "bagi") {
        var rows = "", n = v, st = [];
        if (n === 0) rows = "<tr><td>0</td><td>0</td><td>0</td></tr>";
        while (n > 0) { st.push(n % 2); rows += "<tr><td>" + n + " ÷ 2</td><td>" + Math.floor(n / 2) + "</td><td><b>" + (n % 2) + "</b></td></tr>"; n = Math.floor(n / 2); }
        x = '<table class="tabel small" style="width:auto;margin:4px auto"><tr><th>Pembagian</th><th>Hasil</th><th>Sisa</th></tr>' + rows + '</table><p class="small center">Baca sisa dari <b>bawah ke atas</b>: ' + (st.length ? st.slice().reverse().join("") : "0") + "₂ = " + v + "₁₀</p>";
      } else {
        var hi = v >> 4, lo = v & 15, HX = "0123456789ABCDEF", oc = v.toString(8);
        x = '<ol class="langkah small"><li>Heksadesimal (basis 16): kelompokkan <b>4 bit</b> dari kanan: <b>' + bin13(hi, 4) + "</b> | <b>" + bin13(lo, 4) + "</b>.</li><li>" + bin13(hi, 4) + " = " + hi + " → " + HX[hi] + "; " + bin13(lo, 4) + " = " + lo + " → " + HX[lo] + " (10–15 ditulis A–F).</li><li>Hasil: <b>" + HX[hi] + HX[lo] + "₁₆</b> = " + hi + "×16 + " + lo + " = " + v + '.</li><li>Oktal (basis 8): kelompokkan <b>3 bit</b>: ' + bin13(v, 9).match(/.../g).join(" | ") + " → <b>" + oc + "₈</b>.</li></ol>";
      }
      el.querySelector(".bn-x").innerHTML = x;
      el.querySelector(".br").innerHTML = "<b>" + bin13(v, nb) + "₂</b> = <b>" + v + "₁₀</b> = <b>" + v.toString(16).toUpperCase() + "₁₆</b> = <b>" + v.toString(8) + "₈</b> · klik bit untuk membalik";
      var inp = el.querySelector("input"); inp.value = v; inp.parentNode.querySelector(".val").textContent = v;
      $$(el, "[data-m]").forEach(function (b) { b.classList.toggle("on", b.dataset.m === mode); });
    }
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-b]"); if (b) { v ^= 1 << +b.dataset.b; draw(); } var m = e.target.closest("[data-m]"); if (m) { mode = m.dataset.m; draw(); } });
    el.querySelector("input").oninput = function () { v = +this.value; draw(); };
    if (el.dataset.mode) mode = el.dataset.mode; if (el.dataset.v) v = +el.dataset.v;
    draw();
  };

  // A.sampling — Nyquist & aliasing
  A.sampling = function (el) {
    var fq = 3, fs = 20;
    el.innerHTML = '<svg class="diag" viewBox="0 0 340 170"><g class="c"></g></svg><div class="ctrl">' + slider("Frekuensi sinyal f", 1, 30, 1, fq, "Hz") + slider("Laju sampel f_s", 4, 80, 1, fs, "Hz") + '</div><div class="readout sr"></div>';
    function draw() {
      var s = "", x0 = 20, w = 300, yc = 80, a = 50, k = Math.round(fq / fs), fa = fq - k * fs, p = [], r = [];
      s += line(x0, yc, x0 + w, yc, "#ddd", 1) + txt(x0 + w, 160, "waktu 1 detik →", { size: 9, a: "end", c: MUT });
      for (var i = 0; i <= 600; i++) { var t = i / 600; p.push((x0 + t * w).toFixed(1) + "," + (yc - a * Math.sin(2 * Math.PI * fq * t)).toFixed(1)); r.push((x0 + t * w).toFixed(1) + "," + (yc - a * Math.sin(2 * Math.PI * fa * t)).toFixed(1)); }
      s += poly(p.join(" "), "#c9c2b0", 1.4) + poly(r.join(" "), fs >= 2 * fq ? HI : RED, 2);
      for (var n = 0; n <= fs; n++) { var tt = n / fs, yy = yc - a * Math.sin(2 * Math.PI * fq * tt); s += line(x0 + tt * w, yc, x0 + tt * w, yy, BLU, 1) + '<circle cx="' + (x0 + tt * w).toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="3" fill="' + BLU + '"/>'; }
      s += txt(x0, 16, "abu = asli · biru = sampel · " + (fs >= 2 * fq ? "hijau" : "merah") + " = hasil", { size: 9, a: "start", c: MUT });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".sr").innerHTML = "Syarat Nyquist: f<sub>s</sub> ≥ 2f = 2×" + fq + " = " + 2 * fq + " Hz · f<sub>s</sub> = " + fs + " Hz → " + (fs >= 2 * fq ? '<span class="tag ok">terpenuhi</span> sinyal ' + fq + " Hz terekam benar" : '<span class="tag no">tidak terpenuhi</span> muncul <b>alias</b> |f − ' + k + "f<sub>s</sub>| = |" + fq + " − " + k * fs + "| = <b>" + Math.abs(fa) + " Hz</b>");
    }
    $$(el, "input").forEach(function (inp, i) { inp.oninput = function () { inp.parentNode.querySelector(".val").textContent = inp.value; if (i) fs = +inp.value; else fq = +inp.value; draw(); }; });
    draw();
  };

  // A.adc — kuantisasi dan kode ADC
  A.adc = function (el) {
    var vr = 5, nb = 3, vin = 3.2;
    el.innerHTML = '<div class="ctrl"><button class="btn sm ghost" data-r="5">V<sub>ref</sub> = 5 V</button><button class="btn sm ghost" data-r="3.3">V<sub>ref</sub> = 3,3 V</button></div><svg class="diag" viewBox="0 0 340 200"><g class="c"></g></svg><div class="ctrl">' + slider("Jumlah bit n", 1, 10, 1, nb, "bit") + slider("Tegangan masukan V_in", 0, 5, 0.01, vin, "V") + '</div><div class="adc-x"></div>';
    function draw() {
      var L = 1 << nb, D = vr / L, c = Math.min(L - 1, Math.floor(vin / D + 1e-9)), s = "", x0 = 40, y0 = 175, w = 280, h = 150;
      s += line(x0, y0, x0 + w + 6, y0, INK, 1.4) + line(x0, y0, x0, y0 - h - 6, INK, 1.4) + txt(x0 + w, y0 + 16, "V_in (0 … " + f(vr, 1) + " V)", { size: 9, a: "end", c: MUT }) + txt(x0 - 4, y0 - h - 10, "kode", { size: 9, a: "start", c: MUT });
      var p = []; for (var q = 0; q < L; q++) { var xa = x0 + q * D / vr * w, xb = x0 + (q + 1) * D / vr * w, yy = y0 - q / (L - 1 || 1) * h; p.push(xa.toFixed(1) + "," + yy.toFixed(1) + " " + xb.toFixed(1) + "," + yy.toFixed(1)); }
      s += poly(p.join(" "), BLU, 2) + line(x0, y0, x0 + w, y0 - h, "#c9c2b0", 1);
      if (L <= 16) for (var q2 = 0; q2 < L; q2++) s += txt(x0 - 4, y0 - q2 / (L - 1 || 1) * h + 3, bin13(q2, nb), { size: L > 8 ? 6.5 : 8, a: "end", c: MUT });
      var vx = x0 + Math.min(vin, vr) / vr * w, vy = y0 - c / (L - 1 || 1) * h;
      s += line(vx, y0, vx, vy, RED, 1.4) + '<circle cx="' + vx + '" cy="' + vy + '" r="4.5" fill="' + RED + '"/>' + txt(vx + 6, vy - 6, "kode " + c, { size: 10, b: 1, c: RED, a: "start" });
      el.querySelector(".c").innerHTML = s;
      var vo = c * D;
      el.querySelector(".adc-x").innerHTML = '<ol class="langkah small"><li>Jumlah level = 2<sup>n</sup> = 2<sup>' + nb + "</sup> = <b>" + L + "</b>.</li><li>Resolusi Δ = V<sub>ref</sub>/2<sup>n</sup> = " + f(vr, 2) + "/" + L + " = <b>" + f(D * 1000, 2) + " mV</b> per langkah.</li><li>Kode = ⌊V<sub>in</sub>/Δ⌋ = ⌊" + f(vin, 2) + "/" + f(D, 5) + "⌋ = ⌊" + f(vin / D, 2) + "⌋ = <b>" + c + "</b>" + (vin >= vr ? " (dibatasi maksimum " + (L - 1) + ")" : "") + " = <b>" + bin13(c, nb) + "₂</b> = " + c.toString(16).toUpperCase() + "₁₆.</li><li>Bila dikembalikan oleh DAC: V = kode × Δ = " + c + " × " + f(D * 1000, 2) + " mV = <b>" + f(vo, 3) + " V</b>; galat = " + f((vin - vo) * 1000, 1) + " mV (≤ Δ = " + f(D * 1000, 1) + " mV).</li></ol>";
      $$(el, "[data-r]").forEach(function (b) { b.classList.toggle("on", +b.dataset.r === vr); });
    }
    var ins = $$(el, "input");
    ins[0].oninput = function () { nb = +this.value; this.parentNode.querySelector(".val").textContent = nb; draw(); };
    ins[1].oninput = function () { vin = +this.value; this.parentNode.querySelector(".val").textContent = f(vin, 2); draw(); };
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-r]"); if (b) { vr = +b.dataset.r; ins[1].max = vr; if (vin > vr) { vin = vr; ins[1].value = vr; ins[1].parentNode.querySelector(".val").textContent = f(vr, 2); } draw(); } });
    draw();
  };

  // A.rantai — aplikasi: sensor → ADC → mikrokontroler → DAC/tampilan
  var RANTAI = {
    termo: { nama: "Termometer digital", sl: ["Suhu", 0, 100, 1, 37, "°C"], blok: ["Sensor LM35", "Penguat op-amp ×5", "ADC 10 bit (5 V)", "Mikrokontroler", "Layar 7-segmen"],
      val: function (T) { var v1 = T * 0.01, v2 = v1 * 5, c = Math.min(1023, Math.floor(v2 / (5 / 1024))), tt = c * 5 / 1024 / 0.05; return ["10 mV/°C → " + f(v1 * 1000, 0) + " mV", "→ " + f(v2, 3) + " V", "kode " + c + " = " + bin13(c, 10), "T = kode×4,883 mV/50 mV", f(tt, 1) + " °C"]; },
      ket: function (T) { var v2 = T * 0.05, c = Math.min(1023, Math.floor(v2 / (5 / 1024))); return "Langkah: V<sub>sensor</sub> = " + T + " × 10 mV = " + f(T * 10, 0) + " mV → ×5 = " + f(v2, 3) + " V → kode = ⌊" + f(v2, 3) + "/4,883 mV⌋ = " + c + " → T = " + c + " × 4,883/50 = " + f(c * 5 / 1024 / 0.05, 2) + " °C. Resolusi tampilan ≈ 0,1 °C."; } },
    audio: { nama: "Pemutar musik", sl: ["Volume", 0, 100, 1, 60, "%"], blok: ["File MP3 (memori)", "Mikrokontroler (decoder)", "DAC 16 bit", "Penguat daya", "Speaker"],
      val: function (vol, t) { var x = Math.sin(2 * Math.PI * 0.7 * t), c = Math.round((x * 0.5 + 0.5) * 65535), v = c / 65535 * 3.3, o = (v - 1.65) * vol / 100 * 6; return ["data biner", "44.100 sampel/s", "kode " + c, f(v, 2) + " V → ×" + f(vol * 0.06, 1), f(o, 2) + " V ke speaker"]; },
      ket: function () { return "Lagu disimpan sebagai angka biner (44.100 sampel per detik × 16 bit × 2 kanal = 1.411.200 bit/s sebelum dikompresi). DAC mengubah tiap kode kembali menjadi tegangan, lalu penguat op-amp/daya (analog!) menggerakkan speaker."; } },
    cuaca: { nama: "Stasiun informasi cuaca", sl: ["Gas CO di udara", 0, 50, 1, 8, "ppm"], blok: ["Sensor gas & suhu", "Datalogger (ADC + MCU)", "Modem GSM", "Server / pusat data", "Papan informasi LED"],
      val: function (p) { var st = p < 9 ? "BAIK" : p < 15 ? "SEDANG" : p < 30 ? "TIDAK SEHAT" : "BERBAHAYA"; return ["CO = " + p + " ppm", "kode ADC " + Math.round(p / 50 * 1023), "dikirim tiap 5 menit", "simpan & olah", "CO : " + st]; },
      ket: function (p) { return "Sesuai contoh materi: stasiun di lapangan mengukur gas (CO, NO₂, SO₂, O₃) dan cuaca, datalogger mengubahnya menjadi data digital, modem GSM mengirim data, lalu papan LED di kota menampilkan status. Kategori CO " + p + " ppm: <b>" + (p < 9 ? "BAIK" : p < 15 ? "SEDANG" : p < 30 ? "TIDAK SEHAT" : "BERBAHAYA") + "</b>."; } }
  };
  A.rantai = function (el) {
    var mode = el.dataset.mode || "termo", x = RANTAI[mode].sl[4], t = 0, acc = 0;
    el.innerHTML = '<div class="ctrl">' + Object.keys(RANTAI).map(function (k) { return '<button class="btn sm ghost" data-m="' + k + '">' + RANTAI[k].nama + "</button>"; }).join("") + '</div><svg class="diag" viewBox="0 0 700 170"><g class="c"></g></svg><div class="ctrl rt-sl"></div><div class="readout rr" style="text-align:left"></div>';
    function setup() { var S = RANTAI[mode].sl; x = S[4]; el.querySelector(".rt-sl").innerHTML = slider(S[0], S[1], S[2], S[3], x, S[5]); var inp = el.querySelector(".rt-sl input"); inp.oninput = function () { x = +inp.value; inp.parentNode.querySelector(".val").textContent = x; draw(); }; $$(el, "[data-m]").forEach(function (b) { b.classList.toggle("on", b.dataset.m === mode); }); }
    function draw() {
      var R = RANTAI[mode], V = R.val(x, t), s = "", bw = 112, gap = 30;
      R.blok.forEach(function (b, i) {
        var X = 12 + i * (bw + gap), dig = mode === "termo" ? i >= 2 : mode === "audio" ? i <= 2 : i >= 1;
        s += '<rect x="' + X + '" y="40" width="' + bw + '" height="60" rx="10" fill="' + (dig ? "#dbeafe" : "#fde7d4") + '" stroke="' + (dig ? BLU : COP) + '" stroke-width="2"/>';
        var w = b.split(" "), l1 = w.slice(0, Math.ceil(w.length / 2)).join(" "), l2 = w.slice(Math.ceil(w.length / 2)).join(" ");
        s += txt(X + bw / 2, 66, l1, { size: 10.5, b: 1 }) + txt(X + bw / 2, 81, l2, { size: 10.5, b: 1 }) + txt(X + bw / 2, 32, dig ? "digital" : "analog", { size: 8.5, b: 1, c: dig ? BLU : COP });
        s += txt(X + bw / 2, 122, V[i], { size: 9, c: INK });
        if (i < R.blok.length - 1) { s += arrow(X + bw + 2, 70, X + bw + gap - 2, 70, MUT); var ph = (t * 1.2 + i * 0.2) % 1; s += '<circle cx="' + (X + bw + 2 + ph * (gap - 6)) + '" cy="70" r="3.5" fill="' + (dig ? BLU : COP) + '"/>'; }
      });
      s += '<rect x="12" y="150" width="14" height="10" fill="#fde7d4" stroke="' + COP + '"/>' + txt(30, 159, "bagian analog", { size: 9, a: "start" }) + '<rect x="130" y="150" width="14" height="10" fill="#dbeafe" stroke="' + BLU + '"/>' + txt(148, 159, "bagian digital", { size: 9, a: "start" }) + txt(690, 159, "Hampir semua produk = analog + digital", { size: 9, a: "end", c: MUT, b: 1 });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".rr").innerHTML = R.ket(x);
    }
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-m]"); if (b) { mode = b.dataset.m; setup(); draw(); } });
    setup(); draw(); loop(el, function (dt) { t += dt; acc += dt; if (acc > 0.1) { acc = 0; draw(); } });
  };

  // A.mcu — mikroprosesor vs mikrokomputer vs mikrokontroler
  A.mcu = function (el) {
    var mode = el.dataset.mode || "mp";
    var INFO = { mp: ["Mikroprosesor", "Hanya CPU dalam satu chip (ALU, unit kendali, register, kendali bus). Memori dan I/O di luar chip. Contoh: Intel 4004, 8086, Core i5."], mk: ["Mikrokomputer", "Mikroprosesor + memori (ROM, RAM) + I/O + clock dipasang bersama di satu papan. Contoh: PC, laptop, Raspberry Pi."], mc: ["Mikrokontroler", "CPU, RAM, ROM/flash, port I/O, timer, port serial, ADC semuanya dalam SATU chip: komputer kecil untuk mengendalikan alat. Contoh: AT89S51 (MCS-51), ATmega328 (Arduino), PIC16F877, ESP32."] };
    el.innerHTML = '<div class="ctrl">' + Object.keys(INFO).map(function (k) { return '<button class="btn sm ghost" data-m="' + k + '">' + INFO[k][0] + "</button>"; }).join("") + '</div><svg class="diag" viewBox="0 0 360 210"><g class="c"></g></svg><div class="readout mr"></div>';
    function box(x, y, w, h, t, on, sub) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + (on ? "#dbeafe" : "#f3f4f6") + '" stroke="' + (on ? BLU : "#b8b2a2") + '" stroke-width="1.8"/>' + txt(x + w / 2, y + h / 2 + (sub ? -1 : 4), t, { size: 10, b: 1, c: on ? INK : MUT }) + (sub ? txt(x + w / 2, y + h / 2 + 11, sub, { size: 7.5, c: MUT }) : ""); }
    function draw() {
      var s = "", mk = mode === "mk", mc = mode === "mc", all = mk || mc;
      s += '<rect x="130" y="70" width="100" height="70" rx="8" fill="#dbeafe" stroke="' + BLU + '" stroke-width="2"/>' + txt(180, 84, "CPU", { size: 11, b: 1 });
      s += box(138, 90, 40, 20, "ALU", true) + box(182, 90, 40, 20, "CU", true) + box(138, 114, 84, 20, "Register", true);
      s += box(30, 40, 80, 34, "ROM/flash", all, "program") + box(30, 88, 80, 34, "RAM", all, "data") + box(250, 40, 80, 34, "Port I/O", all) + box(250, 88, 80, 34, "Timer", mc || mk) + box(30, 136, 80, 34, "Serial", mc || mk) + box(250, 136, 80, 34, "ADC", mc) + box(140, 160, 80, 26, "Clock", all);
      [[110, 57, 130, 85], [110, 105, 130, 105], [250, 57, 230, 85], [250, 105, 230, 105], [110, 153, 130, 125], [250, 153, 230, 125], [180, 160, 180, 140]].forEach(function (a) { s += line(a[0], a[1], a[2], a[3], all ? BLU : "#cfc6b1", 1.6); });
      if (mode === "mp") s += '<rect x="122" y="62" width="116" height="86" rx="10" fill="none" stroke="' + COP + '" stroke-width="2.6" stroke-dasharray="7 4"/>' + txt(180, 56, "1 chip", { size: 10, b: 1, c: COP });
      else if (mk) s += '<rect x="20" y="28" width="320" height="166" rx="12" fill="none" stroke="' + COP + '" stroke-width="2.6" stroke-dasharray="7 4"/>' + txt(180, 22, "1 papan (beberapa chip)", { size: 10, b: 1, c: COP });
      else s += '<rect x="20" y="28" width="320" height="166" rx="12" fill="#B0601C" opacity=".06"/><rect x="20" y="28" width="320" height="166" rx="12" fill="none" stroke="' + COP + '" stroke-width="3.2"/>' + txt(180, 22, "SEMUA dalam 1 chip", { size: 10, b: 1, c: COP });
      s += txt(350, 205, mode === "mc" ? "+ sensor, motor, LED di pin I/O" : mode === "mk" ? "+ keyboard, layar, disk" : "butuh chip memori & I/O luar", { size: 8.5, a: "end", c: MUT });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".mr").innerHTML = "<b>" + INFO[mode][0] + "</b>: " + INFO[mode][1];
      $$(el, "[data-m]").forEach(function (b) { b.classList.toggle("on", b.dataset.m === mode); });
    }
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-m]"); if (b) { mode = b.dataset.m; draw(); } });
    draw();
  };

  // Gambar statis M13
  G.sinyal13 = function (p) {
    var dig = p.mode === "digital", s = "", pts = [];
    s += line(20, 100, 330, 100, INK, 1.4) + line(20, 20, 20, 105, INK, 1.4) + txt(330, 116, "t", { size: 11, c: MUT }) + txt(14, 18, "V", { size: 11, c: MUT });
    if (!dig) { for (var i = 0; i <= 300; i++) pts.push((20 + i) + "," + (60 - 32 * Math.sin(i / 300 * 4 * Math.PI) * (0.7 + 0.3 * Math.sin(i / 37))).toFixed(1)); s += poly(pts.join(" "), COP, 2.6) + txt(175, 135, "berubah sedikit demi sedikit (kontinu)", { size: 10, c: MUT }); }
    else { var b = [0, 1, 1, 0, 1, 0, 0, 1, 1, 1], w = 25; b.forEach(function (x, i) { var y = x ? 35 : 90; pts.push((20 + i * w) + "," + y + " " + (20 + (i + 1) * w) + "," + y); s += txt(35 + i * w, 30, String(x), { size: 10, b: 1, c: BLU }); }); s += poly(pts.join(" "), BLU, 2.6) + txt(336, 39, "tinggi (1)", { size: 8.5, a: "end", c: MUT }) + txt(336, 86, "rendah (0)", { size: 8.5, a: "end", c: MUT }) + txt(175, 135, "hanya dua keadaan, berubah secara diskrit", { size: 10, c: MUT }); }
    return svg(340, 145, s);
  };
  G.nilaitempat = function (p) {
    var d = String(p.d || 4521).split(""), bs = +p.b || 10, s = "", n = d.length, w = 300 / n;
    d.forEach(function (c, i) {
      var X = 25 + i * w, e = n - 1 - i, val = parseInt(c, bs), wt = Math.pow(bs, e);
      s += '<rect x="' + X + '" y="18" width="' + (w - 6) + '" height="30" rx="6" fill="#fde7d4" stroke="' + COP + '"/>' + txt(X + w / 2 - 3, 38, bs + "^" + e, { size: 11, b: 1 }).replace(bs + "^" + e, bs + "<tspan baseline-shift='super' font-size='8'>" + e + "</tspan>");
      s += '<rect x="' + X + '" y="56" width="' + (w - 6) + '" height="34" rx="6" fill="#fff" stroke="' + INK + '"/>' + txt(X + w / 2 - 3, 80, c, { size: 18, b: 1, c: BLU });
      s += arrow(X + w / 2 - 3, 92, X + w / 2 - 3, 110, MUT) + txt(X + w / 2 - 3, 126, val + "×" + wt, { size: 10 }) + txt(X + w / 2 - 3, 142, String(val * wt), { size: 11, b: 1, c: COP });
      if (i < n - 1) s += txt(X + w - 3, 134, "+", { size: 12, b: 1, c: MUT });
    });
    var tot = parseInt(d.join(""), bs);
    if (bs === 2) s += txt(25, 12, "MSB", { size: 9, b: 1, a: "start", c: RED }) + txt(319, 12, "LSB", { size: 9, b: 1, a: "end", c: RED });
    s += txt(175, 166, "= " + tot + (bs === 10 ? "" : "₁₀"), { size: 13, b: 1 });
    return svg(345, 175, s);
  };

  /* -------- PERMAINAN M13 -------- */
  // Game 1: Analog atau Digital?
  var PILAH = [
    ["🕰️", "Jam dinding berjarum", "A", "jarum bergerak mulus melewati semua posisi"], ["⌚", "Jam tangan angka LCD", "D", "angka berubah melompat per detik"],
    ["🌡️", "Termometer air raksa", "A", "tinggi raksa naik turun kontinu"], ["🤒", "Termometer digital", "D", "suhu ditampilkan sebagai angka hasil ADC"],
    ["💿", "Lagu di CD / MP3", "D", "lagu disimpan sebagai deretan bit"], ["📀", "Piringan hitam", "A", "alur piringan meniru gelombang suara"],
    ["📼", "Kaset pita", "A", "kemagnetan pita sebanding sinyal suara"], ["🚗", "Speedometer jarum", "A", "jarum menunjuk nilai kontinu"],
    ["🎤", "Keluaran mikrofon", "A", "tegangannya mengikuti tekanan udara suara"], ["💾", "Flashdisk", "D", "menyimpan data 0/1 dalam sel memori"],
    ["📻", "Siaran radio FM", "A", "frekuensi pembawa dimodulasi sinyal suara"], ["📺", "TV digital DVB-T2", "D", "gambar dikirim sebagai data biner"],
    ["🔳", "QR code", "D", "kotak hitam-putih = bit"], ["🗣️", "Suara manusia", "A", "getaran udara bersifat kontinu"],
    ["🎚️", "Potensiometer volume", "A", "hambatan berubah halus"], ["🔘", "Tombol keyboard", "D", "ditekan (1) atau tidak (0)"],
    ["📟", "Multimeter digital", "D", "menampilkan angka hasil ADC"], ["🧭", "Multimeter jarum (analog)", "A", "simpangan jarum sebanding arus"],
    ["💬", "Pesan WhatsApp", "D", "teks dikodekan menjadi bit"], ["☀️", "Cahaya matahari", "A", "intensitas berubah kontinu"]
  ];
  A.game_pilah = function (el) {
    var R = 10, ronde, skor, streak, urut, dijawab, msg;
    function mulai() { urut = PILAH.map(function (x, i) { return i; }).sort(function () { return Math.random() - 0.5; }).slice(0, R); ronde = 0; skor = 0; streak = 0; dijawab = false; msg = "Pilih: benda/sinyal ini analog atau digital?"; }
    el.innerHTML = gameHead("Analog atau Digital?", "pilah benda di sekitar kita") + '<div class="pl-card" style="text-align:center;padding:10px"></div><div class="ctrl"><button class="btn gm-big" data-j="A" style="background:#B0601C">〰️ Analog</button><button class="btn gm-big" data-j="D" style="background:#1d4ed8">▮▯▮ Digital</button></div><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm ghost" data-a="lanjut">Berikutnya ▶</button><button class="btn sm ghost" data-a="ulang">Main lagi ↺</button></div>';
    function draw() {
      var it = PILAH[urut[Math.min(ronde, R - 1)]];
      el.querySelector(".pl-card").innerHTML = ronde >= R ? '<div style="font-size:54px">🏁</div><b>Skor ' + skor + "/" + R * 10 + "</b>" + (skor >= 90 ? " 🏆 Ahli sinyal!" : skor >= 60 ? " ⭐ Bagus!" : " Coba lagi!") : '<div style="font-size:64px;line-height:1.1">' + it[0] + '</div><div style="font-size:20px;font-weight:700">' + it[1] + '</div><div class="small muted">Soal ' + (ronde + 1) + "/" + R + " · skor " + skor + (streak > 1 ? " · 🔥 " + streak : "") + "</div>";
      el.querySelector(".gm-msg").innerHTML = msg;
      $$(el, "[data-j]").forEach(function (b) { b.disabled = dijawab || ronde >= R; });
      el.querySelector("[data-a=lanjut]").disabled = !dijawab || ronde >= R;
    }
    el.addEventListener("click", function (e) {
      var j = e.target.closest("[data-j]"); if (j && !dijawab && ronde < R) { var it = PILAH[urut[ronde]], ok = j.dataset.j === it[2]; dijawab = true; if (ok) { streak++; skor += 10; msg = "✅ Benar, <b>" + (it[2] === "A" ? "analog" : "digital") + "</b>: " + it[3] + "."; } else { streak = 0; msg = "❌ Itu <b>" + (it[2] === "A" ? "analog" : "digital") + "</b>: " + it[3] + "."; } draw(); return; }
      var a = e.target.closest("[data-a]"); if (a) { if (a.dataset.a === "ulang") mulai(); else if (dijawab) { ronde++; dijawab = false; msg = ronde >= R ? "Selesai! Ingat: dunia nyata analog, pengolahan & penyimpanan modern digital." : "Pilih: analog atau digital?"; } draw(); }
    });
    mulai(); draw();
  };

  // Game 2: Kunci Biner (60 detik)
  A.game_biner = function (el) {
    var v = 0, tgt = 0, main = false, sisa = 60, skor = 0, best = 0, umpan = "", acc = 0;
    try { best = +(localStorage.getItem("ed_biner_best") || 0); } catch (e) { }
    function maxNow() { return skor < 3 ? 15 : skor < 7 ? 63 : 255; }
    function baru() { var m = maxNow(), t; do { t = 1 + Math.floor(Math.random() * m); } while (t === tgt); tgt = t; v = 0; }
    el.innerHTML = gameHead("Kunci Biner", "nyalakan bit sampai nilainya sama dengan angka target") + '<div class="readout gb-t" style="font-size:20px"></div><div class="gb-bits" style="display:flex;justify-content:center;gap:4px;flex-wrap:wrap;margin:8px 0"></div><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm" data-a="mulai">Mulai ▶</button></div>';
    function draw() {
      var h = ""; for (var i = 7; i >= 0; i--) { var b = (v >> i) & 1, aktif = (1 << i) <= maxNow(); h += '<button class="btn sm ' + (b ? "" : "ghost") + '" data-b="' + i + '" ' + (!main || !aktif ? "disabled" : "") + ' style="flex-direction:column;min-width:52px;padding:4px 6px;gap:0' + (b ? ";background:#16a34a" : "") + '"><span style="font-size:10px;opacity:.8">' + (1 << i) + '</span><span style="font-size:24px;font-family:var(--f-mono)">' + b + "</span></button>"; }
      el.querySelector(".gb-bits").innerHTML = h;
      el.querySelector(".gb-t").innerHTML = main ? "Target: <b style='font-size:30px;color:" + COP + "'>" + tgt + "</b> · nilai bitmu: <b>" + v + "</b>" : sisa <= 0 ? "⏰ Waktu habis! Skor <b>" + skor + "</b>" : "Tekan <b>Mulai</b>. Kamu punya 60 detik.";
      el.querySelector(".gm-msg").innerHTML = "⏱ " + Math.max(0, Math.ceil(sisa)) + " s · Skor <b>" + skor + "</b> · rekor <b>" + best + "</b> · tingkat: " + (maxNow() === 15 ? "4 bit" : maxNow() === 63 ? "6 bit" : "8 bit") + (umpan ? "<br>" + umpan : "");
      el.querySelector("[data-a=mulai]").textContent = main ? "Sedang main…" : "Mulai ▶";
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-b]"); if (b && main) { v ^= 1 << +b.dataset.b; if (v === tgt) { skor++; umpan = "✅ " + tgt + " = " + bin13(tgt, maxNow() === 15 ? 4 : maxNow() === 63 ? 6 : 8) + "₂"; baru(); } draw(); return; }
      var a = e.target.closest("[data-a=mulai]"); if (a && !main) { main = true; sisa = 60; skor = 0; umpan = ""; tgt = 0; baru(); draw(); }
    });
    draw();
    loop(el, function (dt) { if (!main) return; sisa -= dt; acc += dt; if (sisa <= 0) { main = false; if (skor > best) { best = skor; try { localStorage.setItem("ed_biner_best", best); } catch (e) { } umpan = "🏆 Rekor baru!"; } draw(); } else if (acc > 0.25) { acc = 0; draw(); } });
  };

  // Game 3: Tebak Kode ADC
  A.game_adc = function (el) {
    var R = 8, ronde, skor, soal, dijawab, msg;
    function baru() {
      var n = [3, 4, 8, 10][Math.floor(Math.random() * 4)], vr = Math.random() < 0.5 ? 5 : 3.3, L = 1 << n, D = vr / L, vin = Math.round(Math.random() * vr * 0.95 * 100) / 100, c = Math.min(L - 1, Math.floor(vin / D + 1e-9)), op = [c];
      [c + 1, c - 1, Math.round(vin / vr * (L - 1)), c + 2, c - 2, Math.floor(c / 2)].forEach(function (x) { if (op.length < 4 && x >= 0 && x <= L - 1 && op.indexOf(x) < 0) op.push(x); });
      while (op.length < 4) { var r = Math.floor(Math.random() * L); if (op.indexOf(r) < 0) op.push(r); }
      op.sort(function (a, b) { return a - b; }); soal = { n: n, vr: vr, L: L, D: D, vin: vin, c: c, op: op }; dijawab = false; msg = "Hitung Δ = V<sub>ref</sub>/2<sup>n</sup>, lalu kode = ⌊V<sub>in</sub>/Δ⌋.";
    }
    function mulai() { ronde = 0; skor = 0; baru(); }
    el.innerHTML = gameHead("Tebak Kode ADC", "kode digital berapa yang keluar dari ADC?") + '<div class="readout ga-q" style="font-size:16px"></div><div class="ctrl ga-op"></div><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm ghost" data-a="lanjut">Soal berikut ▶</button><button class="btn sm ghost" data-a="ulang">Main lagi ↺</button></div>';
    function draw() {
      var S = soal;
      el.querySelector(".ga-q").innerHTML = ronde >= R ? "🏁 Selesai! Skor <b>" + skor + "/" + R * 10 + "</b>" + (skor >= 70 ? " 🏆" : skor >= 50 ? " ⭐" : "") : "Soal " + (ronde + 1) + "/" + R + " · skor " + skor + "<br>ADC <b>" + S.n + " bit</b>, V<sub>ref</sub> = <b>" + f(S.vr, 1) + " V</b>, V<sub>in</sub> = <b>" + f(S.vin, 2) + " V</b>";
      el.querySelector(".ga-op").innerHTML = ronde >= R ? "" : S.op.map(function (x) { return '<button class="btn gm-big" data-o="' + x + '" ' + (dijawab ? "disabled" : "") + ' style="min-width:110px;font-size:18px' + (dijawab && x === S.c ? ";background:#16a34a" : "") + '">' + x + (S.n <= 4 ? '<small style="display:block;font-size:11px;opacity:.8">' + bin13(x, S.n) + "₂</small>" : "") + "</button>"; }).join("");
      el.querySelector(".gm-msg").innerHTML = msg;
      el.querySelector("[data-a=lanjut]").disabled = !dijawab || ronde >= R;
    }
    el.addEventListener("click", function (e) {
      var o = e.target.closest("[data-o]"); if (o && !dijawab) { var S = soal, ok = +o.dataset.o === S.c; dijawab = true; if (ok) skor += 10; msg = (ok ? "✅ Tepat! " : "❌ Belum. ") + "Δ = " + f(S.vr, 1) + "/" + S.L + " = " + f(S.D * 1000, 3) + " mV → " + f(S.vin, 2) + "/" + f(S.D, 6) + " = " + f(S.vin / S.D, 2) + " → dibulatkan ke bawah = <b>" + S.c + "</b>" + (S.n <= 10 ? " = " + bin13(S.c, S.n) + "₂" : ""); draw(); return; }
      var a = e.target.closest("[data-a]"); if (a) { if (a.dataset.a === "ulang") mulai(); else if (dijawab) { ronde++; if (ronde < R) baru(); else msg = "Ingat dua rumus: Δ = V<sub>ref</sub>/2<sup>n</sup> dan kode = ⌊V<sub>in</sub>/Δ⌋."; } draw(); }
    });
    mulai(); draw();
  };

  // Game 4: Kirim Sinyal (penguat ulang / repeater)
  var LV_KIRIM = [
    { L: 40, bud: 3, mode: "D", judul: "Kabel 40 km" },
    { L: 75, bud: 6, mode: "D", judul: "Antar kota 75 km" },
    { L: 90, bud: 7, mode: "D", judul: "Melewati laut & hutan", boleh: [10, 20, 25, 40, 45, 55, 70, 80] },
    { L: 60, bud: 5, mode: "A", judul: "Tantangan analog 60 km", target: 10 }
  ];
  var SG13 = 0.08, AT13 = 25;
  function hopsK(L, reps) { var p = [0].concat(reps.slice().sort(function (a, b) { return a - b; })).concat([L]), h = []; for (var i = 1; i < p.length; i++) h.push(p[i] - p[i - 1]); return h; }
  function evalK(Lv, reps) {
    var h = hopsK(Lv.L, reps), res = { h: h };
    if (Lv.mode === "D") { res.mata = h.map(function (x) { return Math.exp(-x / AT13) / (2 * SG13); }); res.ber = h.reduce(function (s, x) { return s + Q13(Math.exp(-x / AT13) / (2 * SG13)); }, 0); res.ok = res.mata.every(function (m) { return m >= 3; }); }
    else { var inv = h.reduce(function (s, x) { return s + SG13 * SG13 / Math.exp(-2 * x / AT13); }, 0); res.snr = 10 * Math.log10(1 / inv); res.ok = res.snr >= Lv.target; }
    return res;
  }
  function spotsK(Lv) { if (Lv.boleh) return Lv.boleh; var o = []; for (var x = 5; x < Lv.L; x += 5) o.push(x); return o; }
  function minK(Lv) { var sp = spotsK(Lv), best = 99; for (var m = 0; m < (1 << sp.length); m++) { var r = sp.filter(function (x, i) { return (m >> i) & 1; }); if (r.length < best && r.length <= Lv.bud && evalK(Lv, r).ok) best = r.length; } return best; }
  A.game_kirim = function (el) {
    var lv = 0, reps, hasil, anim = -1, bintang = [], mins = LV_KIRIM.map(minK), MSG = "HALO DUNIA";
    function mulai() { reps = []; hasil = null; anim = -1; }
    el.innerHTML = gameHead("Kirim Sinyal", "pasang penguat ulang di sepanjang kabel agar pesan sampai utuh") + '<div class="readout gm-lv"></div><svg class="diag wide" viewBox="0 0 700 200"><g class="c"></g></svg><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm" data-a="kirim">Kirim ▶</button><button class="btn sm ghost" data-a="ulang">Ulangi ↺</button><button class="btn sm" data-a="lanjut">Level berikut ▶</button></div>';
    function draw() {
      var Lv = LV_KIRIM[lv], s = "", x0 = 70, x1 = 630, sc = (x1 - x0) / Lv.L, E = evalK(Lv, reps), sp = spotsK(Lv), dig = Lv.mode === "D";
      s += '<rect x="12" y="62" width="52" height="40" rx="8" fill="#0F3D2E"/>' + txt(38, 87, "Kirim", { size: 10, b: 1, c: "#fff" }) + '<rect x="636" y="62" width="56" height="40" rx="8" fill="#0F3D2E"/>' + txt(664, 87, "Terima", { size: 10, b: 1, c: "#fff" });
      if (Lv.boleh) { s += '<rect x="' + (x0 + 26 * sc) + '" y="40" width="' + (13 * sc) + '" height="84" fill="#bae6fd" opacity=".6"/>' + txt(x0 + 32.5 * sc, 136, "laut", { size: 9, c: BLU }) + '<rect x="' + (x0 + 56 * sc) + '" y="40" width="' + (13 * sc) + '" height="84" fill="#bbf7d0" opacity=".7"/>' + txt(x0 + 62.5 * sc, 136, "hutan", { size: 9, c: HI }); }
      var p = [0].concat(reps.slice().sort(function (a, b) { return a - b; })).concat([Lv.L]);
      E.h.forEach(function (hh, i) {
        var good = dig ? E.mata[i] >= 3 : true, c = dig ? (good ? HI : RED) : COP;
        s += line(x0 + p[i] * sc, 82, x0 + p[i + 1] * sc, 82, c, 4) + txt(x0 + (p[i] + p[i + 1]) / 2 * sc, 70, hh + " km", { size: 9, b: 1, c: c });
        if (dig) s += txt(x0 + (p[i] + p[i + 1]) / 2 * sc, 104, "mata " + f(E.mata[i], 1), { size: 8, c: c });
        else s += txt(x0 + (p[i] + p[i + 1]) / 2 * sc, 104, "SNR " + f(10 * Math.log10(Math.exp(-2 * hh / AT13) / (SG13 * SG13)), 1) + " dB", { size: 8, c: c });
      });
      sp.forEach(function (x) { var on = reps.indexOf(x) >= 0; s += '<g data-k="' + x + '" style="cursor:pointer"><rect x="' + (x0 + x * sc - 11) + '" y="' + (on ? 70 : 76) + '" width="22" height="' + (on ? 24 : 12) + '" rx="4" fill="' + (on ? (dig ? BLU : COP) : "#fff") + '" stroke="' + (dig ? BLU : COP) + '" stroke-width="1.6"/>' + (on ? txt(x0 + x * sc, 86, "R", { size: 10, b: 1, c: "#fff" }) : "") + "</g>" + txt(x0 + x * sc, 150, String(x), { size: 8, c: MUT }); });
      s += txt(x0, 150, "0", { size: 8, c: MUT }) + txt(x1, 150, Lv.L + " km", { size: 8, c: MUT });
      if (anim >= 0) { var ax = x0 + Math.min(1, anim) * (x1 - x0); s += '<circle cx="' + ax + '" cy="82" r="7" fill="#fde047" stroke="' + INK + '"/>'; }
      // hasil di penerima
      if (hasil) {
        if (dig) { var out = MSG.split("").map(function (ch, i) { var code = ch.charCodeAt(0), bad = false; for (var b = 0; b < 8; b++) if (hr13(i, b, lv + reps.length * 3) < hasil.ber) { code ^= 1 << b; bad = true; } return bad ? '<tspan fill="' + RED + '">' + String.fromCharCode(Math.max(33, Math.min(126, code))).replace(/[<&>]/g, "?") + "</tspan>" : ch; }).join(""); s += txt(350, 182, "Diterima: " + out, { size: 15, b: 1 }); }
        else s += txt(350, 182, "Kualitas suara di penerima: " + f(hasil.snr, 1) + " dB" + (hasil.ok ? " (cukup)" : " (terlalu berdesis)"), { size: 13, b: 1, c: hasil.ok ? HI : RED });
      }
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".gm-lv").innerHTML = LV_KIRIM.map(function (x, i) { return '<span class="tag ' + (i === lv ? "ok" : bintang[i] ? "mid" : "") + '">L' + (i + 1) + (bintang[i] ? " " + "★".repeat(bintang[i]) : "") + "</span>"; }).join(" ") + " · <b>" + Lv.judul + "</b> · sinyal <b>" + (dig ? "DIGITAL" : "ANALOG") + "</b> · penguat ulang " + reps.length + "/" + Lv.bud;
      var m = "";
      if (hasil && anim < 0) m = hasil.ok ? "🎉 <b>Berhasil!</b> " + (dig ? "Tiap penguat ulang digital meregenerasi bit (derau dibuang). Peluang bit salah total ≈ " + (hasil.ber < 1e-6 ? "< 10⁻⁶" : hasil.ber.toExponential(1).replace(".", ",")) + "." : "Tetapi perhatikan: SNR analog tak bisa jauh di atas ±11 dB, karena tiap penguat ikut memperkuat derau. Kabel yang sama dengan sinyal digital bisa nyaris tanpa galat!") + " Penguat dipakai " + reps.length + " (minimum " + mins[lv] + ") → " + "★".repeat(bintang[lv]) + "☆".repeat(3 - bintang[lv]) : "❌ " + (dig ? "Ada ruas merah: sinyal melemah terlalu jauh sehingga “mata” < 3 dan bit salah. Perpendek ruas itu." : "SNR belum mencapai " + Lv.target + " dB. Atur jarak antar penguat.");
      else m = dig ? "Klik kotak di kabel untuk memasang/melepas penguat ulang (R). Ruas digital aman bila “mata” ≥ 3 (sinyal ≥ 6× derau)." : "Target: SNR penerima ≥ " + Lv.target + " dB. Penguat analog memperkuat sinyal DAN derau, jadi derau tiap ruas menumpuk.";
      el.querySelector(".gm-msg").innerHTML = m;
      el.querySelector("[data-a=lanjut]").disabled = !(hasil && hasil.ok) || lv === LV_KIRIM.length - 1;
    }
    el.addEventListener("click", function (e) {
      var k = e.target.closest("[data-k]"); if (k && anim < 0) { var x = +k.dataset.k, i = reps.indexOf(x), Lv = LV_KIRIM[lv]; if (i >= 0) reps.splice(i, 1); else if (reps.length < Lv.bud) reps.push(x); hasil = null; draw(); return; }
      var a = e.target.closest("[data-a]"); if (!a) return;
      if (a.dataset.a === "kirim" && anim < 0) { hasil = evalK(LV_KIRIM[lv], reps); if (hasil.ok) { var bs = reps.length <= mins[lv] ? 3 : reps.length <= mins[lv] + 1 ? 2 : 1; bintang[lv] = Math.max(bintang[lv] || 0, bs); } anim = 0; draw(); }
      else if (a.dataset.a === "ulang") { mulai(); draw(); }
      else if (a.dataset.a === "lanjut" && lv < LV_KIRIM.length - 1) { lv++; mulai(); draw(); }
    });
    mulai(); draw();
    loop(el, function (dt) { if (anim >= 0) { anim += dt * 0.9; if (anim > 1) anim = -1; draw(); } });
  };

  /* =================== ANIMASI MATERI 14: IC & MIKROPROSESOR =================== */
  // ---------- Mesin CPU pendidikan "EDU-8" ----------
  var EDU = (function () {
    var CYC = { MOV: 1, ADD: 1, SUB: 1, AND: 1, OR: 1, XOR: 1, CMP: 1, INC: 1, DEC: 1, NOT: 1, SHL: 1, SHR: 1, JMP: 2, JZ: 2, JNZ: 2, JC: 2, JNC: 2, DJNZ: 2, IN: 1, OUT: 1, NOP: 1, HLT: 1 };
    function num(t) {
      t = String(t).trim().toLowerCase(); var v = NaN;
      if (/^0x[0-9a-f]+$/.test(t)) v = parseInt(t.slice(2), 16);
      else if (/^0b[01]+$/.test(t)) v = parseInt(t.slice(2), 2);
      else if (/^[0-9][0-9a-f]*h$/.test(t)) v = parseInt(t.slice(0, -1), 16);
      else if (/^[01]+b$/.test(t)) v = parseInt(t.slice(0, -1), 2);
      else if (/^-?\d+$/.test(t)) v = parseInt(t, 10);
      return v;
    }
    function opd(t) {
      t = t.trim(); var u = t.toUpperCase(), m;
      if (u === "A") return { k: "A" };
      if ((m = u.match(/^R([0-3])$/))) return { k: "R", i: +m[1] };
      if (u === "P0" || u === "P1") return { k: "P", i: +u[1] };
      if (t[0] === "#") { var v = num(t.slice(1)); return isNaN(v) ? { k: "?", t: t } : { k: "#", v: v & 255 }; }
      if ((m = t.match(/^\[(.+)\]$/))) { var a = num(m[1]); return isNaN(a) || a < 0 || a > 15 ? { k: "?", t: t } : { k: "M", i: a }; }
      if (/^[a-z_][a-z0-9_]*$/i.test(t)) return { k: "L", t: t.toLowerCase() };
      return { k: "?", t: t };
    }
    function rakit(src) {
      var prog = [], lab = {}, err = [];
      String(src).split("\n").forEach(function (raw, ln) {
        var s = raw.replace(/;.*$/, "").trim(); if (!s) return;
        var m = s.match(/^([a-z_][a-z0-9_]*)\s*:\s*(.*)$/i);
        if (m) { lab[m[1].toLowerCase()] = prog.length; s = m[2].trim(); if (!s) return; }
        var sp = s.search(/\s/), op = (sp < 0 ? s : s.slice(0, sp)).toUpperCase(), rest = sp < 0 ? "" : s.slice(sp + 1);
        var args = rest ? rest.split(",").map(opd) : [];
        if (!(op in CYC)) err.push("Baris " + (ln + 1) + ": instruksi '" + op + "' tidak dikenal");
        args.forEach(function (a) { if (a.k === "?") err.push("Baris " + (ln + 1) + ": operand '" + a.t + "' tidak dikenal"); });
        prog.push({ op: op, a: args, teks: s, ln: ln + 1 });
      });
      prog.forEach(function (p) { p.a.forEach(function (a) { if (a.k === "L" && !(a.t in lab)) err.push("Baris " + p.ln + ": label '" + a.t + "' tidak ada"); }); });
      return { prog: prog, lab: lab, err: err };
    }
    function baru() { return { A: 0, R: [0, 0, 0, 0], PC: 0, IR: "—", Z: 0, C: 0, N: 0, M: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], P0: 0, P1: 0, halt: false, cyc: 0, n: 0, outs: [], pesan: "" }; }
    function hx(v) { return ("0" + (v & 255).toString(16).toUpperCase()).slice(-2) + "h"; }
    function nama(a) { return a.k === "A" ? "A" : a.k === "R" ? "R" + a.i : a.k === "P" ? "P" + a.i : a.k === "#" ? "#" + a.v : a.k === "M" ? "[" + a.i + "]" : a.t; }
    function baca(s, a) { return a.k === "A" ? s.A : a.k === "R" ? s.R[a.i] : a.k === "#" ? a.v : a.k === "M" ? s.M[a.i] : a.k === "P" ? (a.i === 0 ? s.P0 : s.P1) : 0; }
    function tulis(s, a, v) { v &= 255; if (a.k === "A") s.A = v; else if (a.k === "R") s.R[a.i] = v; else if (a.k === "M") s.M[a.i] = v; else if (a.k === "P" && a.i === 1) { s.P1 = v; s.outs.push(v); } }
    function zn(s, v) { s.Z = (v & 255) === 0 ? 1 : 0; s.N = (v >> 7) & 1; }
    function fl(s) { return "Z=" + s.Z + " C=" + s.C + " N=" + s.N; }
    function langkah(s, R) {
      var L = [];
      if (s.halt) return ["CPU berhenti (HLT). Tekan Reset untuk mengulang."];
      if (s.PC >= R.prog.length) { s.halt = true; s.pesan = "Program habis tanpa HLT"; return ["PC = " + s.PC + " melewati akhir program → CPU berhenti."]; }
      var p = R.prog[s.PC], a = p.a, op = p.op, pc0 = s.PC, next = s.PC + 1, d = a[0], sr = a[1], v, r, x;
      s.IR = p.teks; s.n++; s.cyc += CYC[op] || 1;
      L.push("FETCH  : IR ← mem[" + hx(pc0) + "] = “" + p.teks + "”, PC ← " + hx(next));
      L.push("DECODE : opcode " + op + (a.length ? ", operand " + a.map(nama).join(", ") : "") + " (" + (CYC[op] || 1) + " siklus)");
      var E = "";
      switch (op) {
        case "MOV": v = baca(s, sr); tulis(s, d, v); E = nama(d) + " ← " + nama(sr) + " = " + v + " (" + hx(v) + ")"; break;
        case "ADD": x = baca(s, sr); r = s.A + x; s.C = r > 255 ? 1 : 0; E = "A = " + s.A + " + " + x + " = " + r + (r > 255 ? " → lebih dari 255, simpan C=1, A = " + (r & 255) : ""); s.A = r & 255; zn(s, s.A); break;
        case "SUB": x = baca(s, sr); r = s.A - x; s.C = r < 0 ? 1 : 0; E = "A = " + s.A + " − " + x + " = " + r + (r < 0 ? " → pinjam (C=1), A = " + (r & 255) : ""); s.A = r & 255; zn(s, s.A); break;
        case "CMP": x = baca(s, sr); r = s.A - x; s.C = r < 0 ? 1 : 0; zn(s, r); E = "bandingkan A − " + nama(sr) + " = " + s.A + " − " + x + " = " + r + " (A tidak berubah) → " + (r === 0 ? "sama" : r < 0 ? "A lebih kecil" : "A lebih besar"); break;
        case "AND": case "OR": case "XOR": x = baca(s, sr); r = op === "AND" ? s.A & x : op === "OR" ? s.A | x : s.A ^ x; E = "A = " + bin13(s.A, 8) + " " + op + " " + bin13(x, 8) + " = " + bin13(r, 8) + " (" + r + ")"; s.A = r; s.C = 0; zn(s, r); break;
        case "NOT": r = (~s.A) & 255; E = "A = NOT " + bin13(s.A, 8) + " = " + bin13(r, 8) + " (" + r + ")"; s.A = r; zn(s, r); break;
        case "SHL": s.C = (s.A >> 7) & 1; r = (s.A << 1) & 255; E = "geser kiri: " + bin13(s.A, 8) + " → " + bin13(r, 8) + " (= ×2), bit keluar → C=" + s.C; s.A = r; zn(s, r); break;
        case "SHR": s.C = s.A & 1; r = s.A >> 1; E = "geser kanan: " + bin13(s.A, 8) + " → " + bin13(r, 8) + " (= ÷2), bit keluar → C=" + s.C; s.A = r; zn(s, r); break;
        case "INC": case "DEC": x = baca(s, d); r = (x + (op === "INC" ? 1 : -1)) & 255; tulis(s, d, r); zn(s, r); E = nama(d) + " = " + x + (op === "INC" ? " + 1" : " − 1") + " = " + r; break;
        case "JMP": next = R.lab[d.t]; E = "lompat ke '" + d.t + "' → PC ← " + hx(next); break;
        case "JZ": case "JNZ": case "JC": case "JNC":
          var cond = op === "JZ" ? s.Z === 1 : op === "JNZ" ? s.Z === 0 : op === "JC" ? s.C === 1 : s.C === 0;
          if (cond) next = R.lab[d.t];
          E = "syarat " + (op === "JZ" ? "Z=1" : op === "JNZ" ? "Z=0" : op === "JC" ? "C=1" : "C=0") + " → " + (cond ? "terpenuhi, PC ← " + hx(next) + " ('" + d.t + "')" : "tidak terpenuhi, lanjut ke " + hx(next)); break;
        case "DJNZ": x = s.R[d.i]; r = (x - 1) & 255; s.R[d.i] = r; if (r !== 0) next = R.lab[sr.t]; E = "R" + d.i + " = " + x + " − 1 = " + r + (r !== 0 ? " ≠ 0 → ulangi, PC ← " + hx(next) : " = 0 → keluar dari loop"); break;
        case "IN": v = s.P0; tulis(s, d, v); E = nama(d) + " ← port P0 (saklar) = " + bin13(v, 8) + " (" + v + ")"; break;
        case "OUT": v = baca(s, sr || { k: "A" }); s.P1 = v & 255; s.outs.push(s.P1); E = "port P1 (LED) ← " + bin13(v, 8) + " (" + v + ")"; break;
        case "NOP": E = "tidak melakukan apa-apa (1 siklus)"; break;
        case "HLT": s.halt = true; next = pc0; E = "CPU berhenti"; break;
      }
      s.PC = next;
      L.push("EXECUTE: " + E + " · " + fl(s));
      return L;
    }
    function jalankan(src, maks, P0) { var R = rakit(src), s = baru(), n = 0; if (P0 != null) s.P0 = P0; if (R.err.length) return { err: R.err, s: s }; while (!s.halt && n < (maks || 1000)) { langkah(s, R); n++; } if (!s.halt) s.pesan = "Melebihi " + (maks || 1000) + " langkah: kemungkinan loop tak berujung"; return { s: s, R: R }; }
    return { rakit: rakit, baru: baru, langkah: langkah, jalankan: jalankan, hx: hx, CYC: CYC };
  })();
  var CONTOH14 = {
    jumlah: ["Penjumlahan 5 + 3", "; Menjumlahkan dua bilangan\n        MOV A,#5      ; A = 5\n        MOV R0,#3     ; R0 = 3\n        ADD A,R0      ; A = A + R0\n        OUT P1,A      ; tampilkan di LED\n        HLT"],
    mundur: ["Hitung mundur 5 → 0", "; Hitung mundur, tampilkan di LED\n        MOV A,#5\nulang:  OUT P1,A      ; tampilkan A\n        DEC A         ; A = A - 1, set flag Z\n        JNZ ulang     ; ulangi selama A belum 0\n        OUT P1,A\n        HLT"],
    kali: ["Perkalian 4 × 3 (loop)", "; Perkalian = penjumlahan berulang\n        MOV A,#0      ; hasil = 0\n        MOV R0,#4     ; bilangan\n        MOV R1,#3     ; pengali (pencacah)\nloop:   ADD A,R0      ; hasil += 4\n        DJNZ R1,loop  ; R1--, ulangi bila belum 0\n        MOV [0],A     ; simpan ke RAM alamat 0\n        OUT P1,A\n        HLT"],
    saklar: ["Saklar > 100 → LED", "; Baca saklar P0, LED menyala bila nilai > 100\n        IN A,P0       ; baca 8 saklar\n        CMP A,#101    ; A - 101\n        JC  kecil     ; C=1 berarti A < 101\n        MOV A,#0xFF   ; semua LED nyala\n        JMP tampil\nkecil:  MOV A,#0      ; LED mati\ntampil: OUT P1,A\n        HLT"],
    jalan: ["LED berjalan", "; Satu LED berjalan dari kanan ke kiri\n        MOV A,#1\nlagi:   OUT P1,A\n        SHL A         ; geser kiri = x2\n        JNC lagi      ; berhenti saat bit keluar (C=1)\n        HLT"],
    flag: ["Uji flag carry", "; 200 + 100 melebihi 8 bit\n        MOV A,#200\n        ADD A,#100    ; 300 > 255 -> C = 1, A = 44\n        JC  luap\n        HLT\nluap:   MOV A,#0xFF\n        OUT P1,A\n        HLT"]
  };

  // A.cpu — simulator assembly lengkap
  A.cpu = function (el) {
    var key = el.dataset.prog || "jumlah", src = CONTOH14[key][1], R, s, log = [], run = false, acc = 0, mode = "edit";
    el.innerHTML = '<div class="ctrl"><select class="cp-sel">' + Object.keys(CONTOH14).map(function (k) { return '<option value="' + k + '">' + CONTOH14[k][0] + "</option>"; }).join("") + '</select><button class="btn sm" data-a="rakit">⚙ Rakit &amp; reset</button><button class="btn sm" data-a="step">▶ Langkah</button><button class="btn sm ghost" data-a="run">⏩ Jalankan</button><button class="btn sm ghost" data-a="edit">✎ Edit kode</button></div>' +
      '<div class="cp-grid" style="display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:10px">' +
      '<div><textarea class="cp-src mono" spellcheck="false" style="width:100%;min-height:230px;font-size:13px;line-height:1.45;border:1px solid #d6cfbd;border-radius:8px;padding:8px;background:#fffdf6"></textarea><div class="cp-list mono small" style="border:1px solid #d6cfbd;border-radius:8px;padding:6px;background:#fffdf6;min-height:230px"></div></div>' +
      '<div class="cp-reg"></div></div><div class="readout cp-log mono" style="text-align:left;font-size:12px;line-height:1.5;white-space:pre-wrap;max-height:170px;overflow:auto"></div>';
    var ta = el.querySelector(".cp-src"), sel = el.querySelector(".cp-sel"); ta.value = src; sel.value = key;
    function rakit() { src = ta.value; R = EDU.rakit(src); var p0 = s ? s.P0 : 0; s = EDU.baru(); s.P0 = p0; log = R.err.length ? R.err.map(function (e) { return "⚠ " + e; }) : ["Program dirakit: " + R.prog.length + " instruksi, label: " + (Object.keys(R.lab).join(", ") || "—") + ". CPU direset: semua register 0, PC = 00h."]; mode = R.err.length ? "edit" : "list"; run = false; }
    function reg(nm, v, w) { return '<div style="border:1px solid #d6cfbd;border-radius:8px;padding:4px 6px;background:#fff' + (w ? ";grid-column:span 2" : "") + '"><div class="small muted" style="font-size:11px">' + nm + '</div><div class="mono" style="font-size:15px;font-weight:700">' + v + "</div></div>"; }
    function draw() {
      ta.style.display = mode === "edit" ? "" : "none"; var li = el.querySelector(".cp-list"); li.style.display = mode === "edit" ? "none" : "";
      if (mode !== "edit" && R) li.innerHTML = R.prog.map(function (p, i) { var lb = Object.keys(R.lab).filter(function (k) { return R.lab[k] === i; }); return '<div style="padding:1px 4px;border-radius:4px' + (i === s.PC && !s.halt ? ";background:#fde68a;font-weight:700" : "") + '"><span style="color:#9aa5a0">' + EDU.hx(i) + "</span> " + (lb.length ? '<span style="color:' + COP + '">' + lb[0] + ":</span> " : "") + p.teks.replace(/^[a-z_][a-z0-9_]*\s*:\s*/i, "") + (i === s.PC && !s.halt ? " ◀ PC" : "") + "</div>"; }).join("");
      var S = s, h = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">';
      h += reg("A (akumulator)", S.A + " · " + EDU.hx(S.A), true) + reg("PC", EDU.hx(S.PC)) + reg("Siklus", S.cyc + " (" + S.cyc + " µs @1 MHz)");
      for (var i = 0; i < 4; i++) h += reg("R" + i, S.R[i] + " · " + EDU.hx(S.R[i]));
      h += '<div style="grid-column:span 4;border:1px solid #d6cfbd;border-radius:8px;padding:4px 6px;background:#fff"><span class="small muted">IR (instruksi): </span><b class="mono">' + esc13(S.IR) + "</b></div>";
      h += '<div style="grid-column:span 4;display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="small muted">Flag:</span>' + [["Z", "zero"], ["C", "carry"], ["N", "negatif"]].map(function (f2) { var on = S[f2[0]]; return '<span class="tag ' + (on ? "ok" : "") + '" title="' + f2[1] + '">' + f2[0] + "=" + on + "</span>"; }).join("") + '<span class="small muted">A biner: <b class="mono">' + bin13(S.A, 8) + "</b></span></div>";
      h += '<div style="grid-column:span 4"><span class="small muted">RAM [0..15]:</span><div class="mono" style="display:grid;grid-template-columns:repeat(8,1fr);gap:2px;font-size:11px">' + S.M.map(function (v, i) { return '<span style="border:1px solid #e5e0d2;border-radius:3px;text-align:center;background:' + (v ? "#dbeafe" : "#fff") + '" title="alamat ' + i + '">' + i + ":" + v + "</span>"; }).join("") + "</div></div>";
      h += '<div style="grid-column:span 4"><span class="small muted">Port P1 → LED (keluaran):</span><div style="display:flex;gap:4px;margin:2px 0">' + [7, 6, 5, 4, 3, 2, 1, 0].map(function (b) { var on = (S.P1 >> b) & 1; return '<span style="width:20px;height:20px;border-radius:50%;display:inline-block;background:' + (on ? "#ef4444" : "#e5e7eb") + ";box-shadow:" + (on ? "0 0 8px #ef4444" : "none") + '"></span>'; }).join("") + '<span class="mono small">= ' + S.P1 + "</span></div>";
      h += '<span class="small muted">Port P0 ← saklar (masukan, klik):</span><div style="display:flex;gap:4px">' + [7, 6, 5, 4, 3, 2, 1, 0].map(function (b) { var on = (S.P0 >> b) & 1; return '<button class="btn sm ' + (on ? "" : "ghost") + '" data-sw="' + b + '" style="min-width:26px;padding:2px 4px">' + on + "</button>"; }).join("") + '<span class="mono small" style="align-self:center">= ' + S.P0 + "</span></div></div>";
      h += "</div>" + (S.halt ? '<div class="hint">' + (S.pesan || "CPU berhenti (HLT).") + " Total " + S.n + " instruksi, " + S.cyc + " siklus clock.</div>" : "");
      el.querySelector(".cp-reg").innerHTML = h;
      var lg = el.querySelector(".cp-log"); lg.textContent = log.slice(-24).join("\n"); lg.scrollTop = lg.scrollHeight;
      el.querySelector("[data-a=run]").textContent = run ? "⏸ Berhenti" : "⏩ Jalankan";
    }
    function step() { if (!R || R.err.length) { rakit(); if (R.err.length) return draw(); } if (mode === "edit") mode = "list"; if (s.halt) { run = false; log.push("CPU sudah berhenti. Tekan ⚙ Rakit & reset."); return draw(); } var L = EDU.langkah(s, R); log.push("— Langkah " + s.n + " —"); log = log.concat(L); if (s.n > 500 && !s.halt) { s.halt = true; s.pesan = "Dihentikan setelah 500 langkah (loop tak berujung?)"; } if (s.halt) run = false; draw(); }
    el.addEventListener("click", function (e) {
      var w = e.target.closest("[data-sw]"); if (w) { s.P0 ^= 1 << +w.dataset.sw; log.push("Saklar P0 diubah → P0 = " + s.P0 + " (" + bin13(s.P0, 8) + ")"); draw(); return; }
      var a = e.target.closest("[data-a]"); if (!a) return;
      if (a.dataset.a === "rakit") { rakit(); draw(); }
      else if (a.dataset.a === "step") step();
      else if (a.dataset.a === "run") { if (!R || mode === "edit") rakit(); run = !run && !R.err.length; draw(); }
      else if (a.dataset.a === "edit") { run = false; mode = "edit"; draw(); }
    });
    sel.onchange = function () { ta.value = CONTOH14[sel.value][1]; rakit(); draw(); };
    rakit(); draw();
    loop(el, function (dt) { if (!run) return; acc += dt; if (acc > 0.45) { acc = 0; step(); } });
  };
  function esc13(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // A.moore — Hukum Moore
  var CHIP14 = [["Intel 4004", 1971, 2300], ["Intel 8080", 1974, 6000], ["Intel 8086", 1978, 29000], ["Intel 80386", 1985, 275000], ["Pentium", 1993, 3100000], ["Pentium 4", 2000, 42000000], ["Core 2 Duo", 2006, 291000000], ["Core i7 (2011)", 2011, 1160000000], ["Apple M1", 2020, 16000000000], ["Apple M2 Ultra", 2023, 134000000000]];
  function besar14(n) { return n >= 1e9 ? f(n / 1e9, n >= 1e10 ? 0 : 2) + " miliar" : n >= 1e6 ? f(n / 1e6, n >= 1e7 ? 0 : 1) + " juta" : n >= 1e3 ? f(n / 1e3, n >= 1e4 ? 0 : 1) + " ribu" : f(n, 0); }
  A.moore = function (el) {
    var th = 2011, T = 2;
    el.innerHTML = '<svg class="diag" viewBox="0 0 360 220"><g class="c"></g></svg><div class="ctrl">' + slider("Tahun", 1971, 2030, 1, th, "") + slider("Waktu berlipat dua", 1.5, 3, 0.1, T, "tahun") + '</div><div class="mo-x"></div>';
    function draw() {
      var x0 = 46, y0 = 190, w = 300, h = 170, X = function (y) { return x0 + (y - 1970) / 60 * w; }, Y = function (n) { return y0 - (Math.log10(n) - 3) / 9 * h; }, s = "";
      s += line(x0, y0, x0 + w, y0, INK, 1.3) + line(x0, y0, x0, y0 - h, INK, 1.3);
      for (var e = 3; e <= 12; e += 3) s += line(x0, Y(Math.pow(10, e)), x0 + w, Y(Math.pow(10, e)), "#eee", 1) + txt(x0 - 4, Y(Math.pow(10, e)) + 3, "10" + "⁰¹²³⁴⁵⁶⁷⁸⁹".charAt(0).repeat(0) + ["³", "⁶", "⁹", "¹²"][e / 3 - 1], { size: 9, a: "end", c: MUT });
      for (var yy = 1970; yy <= 2030; yy += 10) s += txt(X(yy), y0 + 13, String(yy), { size: 8.5, c: MUT });
      var p = []; for (var y = 1971; y <= 2030; y++) { var n = 2300 * Math.pow(2, (y - 1971) / T); if (n < 1e12) p.push(X(y).toFixed(1) + "," + Y(n).toFixed(1)); }
      s += poly(p.join(" "), COP, 2).replace("<polyline", '<polyline stroke-dasharray="5 3"');
      CHIP14.forEach(function (c) { s += '<circle cx="' + X(c[1]) + '" cy="' + Y(c[2]) + '" r="3.5" fill="' + BLU + '"><title>' + c[0] + "</title></circle>"; });
      var nP = 2300 * Math.pow(2, (th - 1971) / T);
      s += line(X(th), y0, X(th), y0 - h, RED, 1.2) + (nP < 1e12 ? '<circle cx="' + X(th) + '" cy="' + Y(nP) + '" r="5" fill="' + RED + '"/>' : "");
      s += txt(x0 + 4, 14, "jumlah transistor per chip (skala log)", { size: 9, a: "start", c: MUT }) + txt(x0 + w, y0 - 6, "titik biru = chip nyata, garis = ramalan Moore", { size: 8, a: "end", c: MUT });
      el.querySelector(".c").innerHTML = s;
      var dek = CHIP14.reduce(function (b, c) { return Math.abs(c[1] - th) < Math.abs(b[1] - th) ? c : b; });
      el.querySelector(".mo-x").innerHTML = '<ol class="langkah small"><li>Rumus: N = N₀ × 2<sup>(t − t₀)/T</sup>, dengan N₀ = 2.300 (Intel 4004, t₀ = 1971) dan T = ' + f(T, 1) + " tahun.</li><li>t − t₀ = " + th + " − 1971 = " + (th - 1971) + " tahun → " + f((th - 1971) / T, 2) + " kali berlipat dua.</li><li>N = 2.300 × 2<sup>" + f((th - 1971) / T, 2) + "</sup> = <b>" + besar14(nP) + "</b> transistor.</li><li>Chip nyata terdekat: <b>" + dek[0] + "</b> (" + dek[1] + ") ≈ " + besar14(dek[2]) + " transistor.</li></ol>";
    }
    $$(el, "input").forEach(function (inp, i) { inp.oninput = function () { var v = +inp.value; inp.parentNode.querySelector(".val").textContent = i ? f(v, 1) : v; if (i) T = v; else th = v; draw(); }; });
    draw();
  };

  // A.siklus — fetch, decode, execute (aliran data di bus)
  A.siklus = function (el) {
    var PRG = [["MOV A,#7", "3E 07"], ["ADD A,#5", "C6 05"], ["OUT P1,A", "D3 01"]], ins = 0, fase = 0, A0 = 0, PC = 0, IR = "—", auto = false, acc = 0;
    var FASE = ["FETCH 1: PC dikirim ke bus alamat", "FETCH 2: memori mengirim instruksi lewat bus data ke IR; PC + 1", "DECODE: unit kendali menerjemahkan opcode", "EXECUTE: ALU/register mengerjakan perintah"];
    el.innerHTML = '<svg class="diag wide" viewBox="0 0 640 250"><g class="c"></g></svg><div class="ctrl"><button class="btn sm" data-a="s">▶ Fase berikut</button><button class="btn sm ghost" data-a="o">⏩ Otomatis</button><button class="btn sm ghost" data-a="r">↺ Reset</button></div><div class="readout sk-r"></div>';
    function draw() {
      var s = "", hi = function (on) { return on ? "#fde68a" : "#fff"; };
      s += '<rect x="20" y="20" width="330" height="210" rx="12" fill="#dbeafe" opacity=".35" stroke="' + BLU + '" stroke-width="2"/>' + txt(185, 40, "CPU", { size: 13, b: 1, c: BLU });
      s += '<rect x="40" y="55" width="90" height="40" rx="6" fill="' + hi(fase === 0 || fase === 1) + '" stroke="' + INK + '"/>' + txt(85, 72, "PC", { size: 11, b: 1 }) + txt(85, 88, EDU.hx(PC), { size: 11 });
      s += '<rect x="150" y="55" width="180" height="40" rx="6" fill="' + hi(fase === 1 || fase === 2) + '" stroke="' + INK + '"/>' + txt(240, 72, "IR (register instruksi)", { size: 10, b: 1 }) + txt(240, 88, IR, { size: 11 });
      s += '<rect x="40" y="115" width="140" height="45" rx="6" fill="' + hi(fase === 2) + '" stroke="' + INK + '"/>' + txt(110, 135, "Unit kendali (CU)", { size: 10, b: 1 }) + txt(110, 151, fase === 2 ? "menerjemahkan…" : "", { size: 9, c: COP });
      s += '<rect x="200" y="115" width="130" height="45" rx="6" fill="' + hi(fase === 3) + '" stroke="' + INK + '"/>' + txt(265, 135, "ALU", { size: 11, b: 1 }) + txt(265, 151, fase === 3 && ins < 3 && /ADD/.test(PRG[ins][0]) ? A0 + " + 5" : "", { size: 9, c: COP });
      s += '<rect x="40" y="178" width="140" height="38" rx="6" fill="' + hi(fase === 3) + '" stroke="' + INK + '"/>' + txt(110, 202, "A = " + A0, { size: 12, b: 1 });
      s += '<rect x="200" y="178" width="130" height="38" rx="6" fill="#fff" stroke="' + INK + '"/>' + txt(265, 202, "Flag: Z=" + (A0 === 0 ? 1 : 0), { size: 11 });
      // memori
      s += '<rect x="470" y="30" width="150" height="190" rx="10" fill="#fde7d4" stroke="' + COP + '" stroke-width="2"/>' + txt(545, 50, "Memori program", { size: 11, b: 1, c: COP });
      PRG.forEach(function (p, i) { var on = i === ins && fase < 2; s += '<rect x="482" y="' + (62 + i * 34) + '" width="126" height="28" rx="5" fill="' + (on ? "#fde68a" : "#fff") + '" stroke="#c9b28f"/>' + txt(492, 80 + i * 34, EDU.hx(i), { size: 9, a: "start", c: MUT }) + txt(600, 80 + i * 34, p[0], { size: 9.5, a: "end", b: 1 }); });
      // bus
      var aOn = fase === 0, dOn = fase === 1;
      s += line(350, 75, 470, 75, aOn ? RED : "#cfc6b1", aOn ? 5 : 3) + txt(410, 68, "bus alamat", { size: 9, b: 1, c: aOn ? RED : MUT }) + (aOn ? arrow(400, 75, 466, 75, RED) : "");
      s += line(350, 140, 470, 140, dOn ? HI : "#cfc6b1", dOn ? 5 : 3) + txt(410, 133, "bus data", { size: 9, b: 1, c: dOn ? HI : MUT }) + (dOn ? arrow(460, 140, 354, 140, HI) : "");
      s += line(350, 200, 470, 200, fase === 1 ? BLU : "#cfc6b1", 3) + txt(410, 193, "bus kendali (RD)", { size: 9, b: 1, c: fase === 1 ? BLU : MUT });
      s += '<rect x="370" y="225" width="250" height="20" rx="5" fill="#111"/>' + txt(495, 239, "P1 (LED): " + (ins >= 3 || (ins === 2 && fase === 3) ? A0 : "—"), { size: 10, b: 1, c: "#fde047" });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".sk-r").innerHTML = ins >= 3 ? "Program selesai: 3 instruksi × 4 fase. Setiap instruksi selalu melalui siklus <b>ambil → terjemahkan → jalankan</b>." : "Instruksi " + (ins + 1) + "/3 (<b>" + PRG[ins][0] + "</b>, kode mesin " + PRG[ins][1] + ") · <b>" + FASE[fase] + "</b>";
    }
    function maju() {
      if (ins >= 3) return;
      fase++;
      if (fase === 1) { IR = PRG[ins][0]; PC = ins + 1; }
      if (fase === 3) { if (ins === 0) A0 = 7; else if (ins === 1) A0 = 12; }
      if (fase > 3) { fase = 0; ins++; }
      draw();
    }
    el.addEventListener("click", function (e) { var a = e.target.closest("[data-a]"); if (!a) return; if (a.dataset.a === "s") maju(); else if (a.dataset.a === "o") { auto = !auto; a.textContent = auto ? "⏸ Berhenti" : "⏩ Otomatis"; } else { ins = 0; fase = 0; A0 = 0; PC = 0; IR = "—"; draw(); } });
    draw(); loop(el, function (dt) { if (!auto) return; acc += dt; if (acc > 1.1) { acc = 0; if (ins >= 3) { ins = 0; fase = 0; A0 = 0; PC = 0; IR = "—"; draw(); } else maju(); } });
  };

  // A.timing14 — analisis timing siklus baca memori
  A.timing14 = function (el) {
    var fM = 8, tacc = 250;
    el.innerHTML = '<svg class="diag wide" viewBox="0 0 640 210"><g class="c"></g></svg><div class="ctrl">' + slider("Clock CPU", 1, 40, 1, fM, "MHz") + slider("Waktu akses memori t_acc", 20, 500, 5, tacc, "ns") + '</div><div class="tm-x"></div>';
    function draw() {
      var T = 1000 / fM, tad = 20, tsu = 10, avail = 3 * T - tad - tsu, w = Math.max(0, Math.ceil((tacc - avail) / T)), nT = 3 + w, s = "", x0 = 90, W = 520, px = W / nT;
      var rows = [["CLK", 30], ["Alamat", 75], ["RD", 115], ["Data", 160]];
      rows.forEach(function (r) { s += txt(x0 - 10, r[1] + 4, r[0], { size: 11, b: 1, a: "end" }); });
      var p = []; for (var i = 0; i < nT; i++) { var x = x0 + i * px; p.push(x + ",40 " + x + ",20 " + (x + px / 2) + ",20 " + (x + px / 2) + ",40 " + (x + px) + ",40"); s += txt(x + px / 2, 12, i < 2 ? "T" + (i + 1) : i < 2 + w ? "Tw" : "T3", { size: 9, b: 1, c: i >= 2 && i < 2 + w ? RED : MUT }); s += line(x, 8, x, 190, "#eee", 1); }
      s += poly(p.join(" "), INK, 1.6);
      var xa = x0 + tad / T * px;
      s += poly(x0 + ",75 " + xa + ",75", "#bbb", 1.5) + '<polygon points="' + xa + ",65 " + (x0 + nT * px - 4) + ",65 " + (x0 + nT * px) + ",75 " + (x0 + nT * px - 4) + ",85 " + xa + ",85 " + (xa - 4) + ',75" fill="#dbeafe" stroke="' + BLU + '"/>' + txt((xa + x0 + nT * px) / 2, 79, "alamat stabil", { size: 9, c: BLU });
      s += poly(x0 + ",105 " + (x0 + px * 0.5) + ",105 " + (x0 + px * 0.5) + ",125 " + (x0 + nT * px - px * 0.2) + ",125 " + (x0 + nT * px - px * 0.2) + ",105 " + (x0 + nT * px) + ",105", INK, 1.6);
      var xd = xa + tacc / T * px, xs = x0 + nT * px - tsu / T * px;
      s += '<polygon points="' + Math.min(xd, x0 + nT * px) + ",150 " + (x0 + nT * px) + ",150 " + (x0 + nT * px) + ",170 " + Math.min(xd, x0 + nT * px) + ',170" fill="' + (xd <= xs ? "#dcfce7" : "#fee2e2") + '" stroke="' + (xd <= xs ? HI : RED) + '"/>' + txt(Math.min(xd, x0 + nT * px - 30) + 4, 164, "data sah", { size: 9, a: "start", c: xd <= xs ? HI : RED });
      s += line(xa, 180, Math.min(xd, x0 + nT * px), 180, COP, 1.5) + txt((xa + Math.min(xd, x0 + nT * px)) / 2, 196, "t_acc = " + tacc + " ns", { size: 9, c: COP });
      s += line(xs, 140, xs, 190, RED, 1.4) + txt(xs - 3, 205, "batas baca (setup " + tsu + " ns)", { size: 8.5, a: "end", c: RED });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".tm-x").innerHTML = '<ol class="langkah small"><li>Periode clock T = 1/f = 1/' + fM + " MHz = <b>" + f(T, 1) + " ns</b>. Siklus baca normal = 3T = " + f(3 * T, 1) + " ns.</li><li>Waktu tersedia untuk memori = 3T − t<sub>alamat</sub> − t<sub>setup</sub> = " + f(3 * T, 1) + " − " + tad + " − " + tsu + " = <b>" + f(avail, 1) + " ns</b>.</li><li>Memori butuh t<sub>acc</sub> = " + tacc + " ns → " + (tacc <= avail ? '<span class="tag ok">cukup cepat</span>, sisa ' + f(avail - tacc, 1) + " ns, tanpa wait state." : '<span class="tag no">terlalu lambat</span> kurang ' + f(tacc - avail, 1) + " ns → tambah ⌈" + f(tacc - avail, 1) + "/" + f(T, 1) + "⌉ = <b>" + w + " wait state</b> (Tw), siklus baca menjadi " + nT + "T = " + f(nT * T, 0) + " ns.") + "</li></ol>";
    }
    $$(el, "input").forEach(function (inp, i) { inp.oninput = function () { inp.parentNode.querySelector(".val").textContent = inp.value; if (i) tacc = +inp.value; else fM = +inp.value; draw(); }; });
    draw();
  };

  // A.mcusim — perancangan hardware mikrokontroler: pin mapping, kode, simulasi lingkungan
  var PROYEK14 = {
    lampu: { nama: "Lampu taman otomatis",
      pins: [["LDR + R 10 kΩ (pembagi tegangan)", "A0", "INPUT analog", "makin terang, tegangan makin besar"], ["Transistor BC547 → relay → lampu", "D8", "OUTPUT digital", "R basis 1 kΩ, dioda flyback di relay"]],
      env: [["Cahaya lingkungan", 1, 1000, 1, 20, "lux"]], par: [["Ambang ADC (AMBANG)", 50, 900, 10, 300, ""]],
      code: function (p) { return "const int PIN_LDR   = A0;\nconst int PIN_LAMPU = 8;\nconst int AMBANG    = " + p[0] + ";   // di bawah ini = gelap\n\nvoid setup() {\n  pinMode(PIN_LAMPU, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int nilai = analogRead(PIN_LDR);      // 0..1023\n  if (nilai < AMBANG) digitalWrite(PIN_LAMPU, HIGH);  // gelap: lampu ON\n  else                digitalWrite(PIN_LAMPU, LOW);\n  Serial.println(nilai);\n  delay(200);\n}"; },
      sim: function (e, p) { var lux = e[0], R = 10 * Math.pow(100 / lux, 0.7), V = 5 * 10 / (R + 10), c = Math.min(1023, Math.floor(V * 1024 / 5)), on = c < p[0];
        return { st: { A0: f(V, 2) + " V", D8: on }, on: { D8: on }, serial: String(c), info: "R<sub>LDR</sub> ≈ 10 kΩ × (100/" + lux + ")<sup>0,7</sup> = " + f(R, 2) + " kΩ → V<sub>A0</sub> = 5 × 10/(" + f(R, 2) + " + 10) = <b>" + f(V, 3) + " V</b> → analogRead = ⌊" + f(V, 3) + " × 1024/5⌋ = <b>" + c + "</b> → " + c + (on ? " &lt; " : " ≥ ") + p[0] + " → lampu <b>" + (on ? "MENYALA" : "MATI") + "</b>." }; } },
    kipas: { nama: "Kipas otomatis (suhu)",
      pins: [["Sensor suhu LM35 (10 mV/°C)", "A1", "INPUT analog", "kaki tengah ke A1"], ["MOSFET IRLZ44N → motor kipas DC", "D9 ~", "OUTPUT PWM", "pin bertanda ~ bisa PWM"]],
      env: [["Suhu ruangan", 15, 50, 1, 33, "°C"]], par: [["Suhu mulai (T_MIN)", 20, 35, 1, 28, "°C"], ["Suhu penuh (T_MAX)", 30, 45, 1, 38, "°C"]],
      code: function (p) { return "const int PIN_SUHU  = A1;\nconst int PIN_KIPAS = 9;      // pin PWM (~)\nconst int T_MIN = " + p[0] + ", T_MAX = " + p[1] + ";\n\nvoid setup() { pinMode(PIN_KIPAS, OUTPUT); Serial.begin(9600); }\n\nvoid loop() {\n  int kode  = analogRead(PIN_SUHU);\n  int suhu  = kode * 500L / 1024;          // 10 mV/°C, Vref 5 V\n  int duty  = map(suhu, T_MIN, T_MAX, 0, 255);\n  duty = constrain(duty, 0, 255);\n  analogWrite(PIN_KIPAS, duty);            // PWM 0..255\n  Serial.print(suhu); Serial.print(\" C, duty \"); Serial.println(duty);\n  delay(500);\n}"; },
      sim: function (e, p) { var T = e[0], c = Math.floor(T * 0.01 * 1024 / 5), su = Math.floor(c * 500 / 1024), d0 = p[1] > p[0] ? Math.trunc((su - p[0]) * 255 / (p[1] - p[0])) : 0, d = Math.max(0, Math.min(255, d0));
        return { st: { A1: f(T * 0.01, 2) + " V", "D9 ~": d }, on: { "D9 ~": d > 0 }, serial: su + " C, duty " + d, duty: d / 255, info: "V<sub>A1</sub> = " + T + " × 10 mV = " + f(T * 10, 0) + " mV → kode = ⌊" + f(T * 0.01, 2) + " × 1024/5⌋ = " + c + " → suhu = " + c + " × 500/1024 = <b>" + su + " °C</b> → duty = map(" + su + ", " + p[0] + ", " + p[1] + ", 0, 255) = " + d0 + " → dibatasi <b>" + d + "</b> (" + Math.round(d / 2.55) + "%) → kipas " + (d ? "berputar " + Math.round(d / 2.55) + "% kecepatan" : "diam") + "." }; } },
    parkir: { nama: "Sensor parkir ultrasonik",
      pins: [["HC-SR04 Trig", "D7", "OUTPUT digital", "pulsa 10 µs"], ["HC-SR04 Echo", "D6", "INPUT digital", "lebar pulsa = waktu pantul"], ["Buzzer aktif", "D5", "OUTPUT digital", ""], ["LED hijau + R 220 Ω", "D4", "OUTPUT digital", ""], ["LED merah + R 220 Ω", "D3", "OUTPUT digital", ""]],
      env: [["Jarak mobil ke tembok", 2, 200, 1, 35, "cm"]], par: [["Jarak bahaya (BAHAYA)", 10, 40, 1, 20, "cm"], ["Jarak waspada (WASPADA)", 30, 100, 5, 50, "cm"]],
      code: function (p) { return "const int TRIG = 7, ECHO = 6, BUZZ = 5, HIJAU = 4, MERAH = 3;\nconst int BAHAYA = " + p[0] + ", WASPADA = " + p[1] + ";   // cm\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);\n  pinMode(BUZZ, OUTPUT); pinMode(HIJAU, OUTPUT); pinMode(MERAH, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(TRIG, LOW); delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);\n  long durasi = pulseIn(ECHO, HIGH);        // mikrodetik\n  int jarak = durasi * 0.0343 / 2;          // cm\n  bool bahaya = jarak < BAHAYA, waspada = jarak < WASPADA;\n  digitalWrite(HIJAU, !waspada);\n  digitalWrite(MERAH, waspada);\n  digitalWrite(BUZZ, bahaya || (waspada && millis() % 400 < 200));\n  Serial.println(jarak);\n  delay(60);\n}"; },
      sim: function (e, p, t) { var d = e[0], us = Math.round(2 * d / 0.0343), j = Math.trunc(us * 0.0343 / 2), b = j < p[0], w = j < p[1], bz = b || (w && (t % 0.4) < 0.2);
        return { st: { D7: "pulsa", D6: us + " µs", D5: bz, D4: !w, D3: w }, on: { D5: bz, D4: !w, D3: w, D7: true, D6: true }, serial: String(j), info: "Waktu pantul = 2 × " + d + " cm / 0,0343 cm/µs = <b>" + us + " µs</b> → jarak = " + us + " × 0,0343/2 = <b>" + j + " cm</b> → " + (b ? "&lt; " + p[0] + " cm: <b>BAHAYA</b>, LED merah + buzzer terus" : w ? "&lt; " + p[1] + " cm: <b>WASPADA</b>, LED merah + buzzer berkedip" : "aman: LED hijau") + "." }; } },
    alarm: { nama: "Alarm pintu",
      pins: [["Saklar reed pintu (ke GND)", "D2", "INPUT_PULLUP", "pintu tertutup = LOW"], ["Tombol aktifkan (ke GND)", "D3", "INPUT_PULLUP", "ditekan = LOW"], ["Buzzer aktif", "D5", "OUTPUT digital", ""], ["LED status (on-board)", "D13", "OUTPUT digital", "menyala = alarm siaga"]],
      env: [["Pintu (0 = tertutup, 1 = terbuka)", 0, 1, 1, 0, ""], ["Sistem (0 = mati, 1 = siaga)", 0, 1, 1, 1, ""]], par: [],
      code: function () { return "const int REED = 2, TOMBOL = 3, BUZZ = 5, LED = 13;\nbool siaga = false;\n\nvoid setup() {\n  pinMode(REED, INPUT_PULLUP);     // resistor pull-up internal ±20-50 kΩ\n  pinMode(TOMBOL, INPUT_PULLUP);\n  pinMode(BUZZ, OUTPUT); pinMode(LED, OUTPUT);\n}\n\nvoid loop() {\n  if (digitalRead(TOMBOL) == LOW) { siaga = !siaga; delay(300); } // debounce\n  bool terbuka = digitalRead(REED) == HIGH;   // magnet menjauh -> HIGH\n  digitalWrite(LED, siaga);\n  digitalWrite(BUZZ, siaga && terbuka);\n}"; },
      sim: function (e) { var buka = e[0] === 1, sg = e[1] === 1, bz = sg && buka;
        return { st: { D2: buka ? "HIGH" : "LOW", D3: "HIGH", D5: bz, D13: sg }, on: { D5: bz, D13: sg, D2: buka }, serial: "", info: "Pintu " + (buka ? "terbuka → magnet menjauh, saklar reed terbuka → pull-up menarik D2 ke <b>HIGH</b>" : "tertutup → saklar reed menyambung D2 ke GND → <b>LOW</b>") + ". Sistem " + (sg ? "siaga" : "mati") + " → buzzer = siaga AND terbuka = " + (sg ? 1 : 0) + " AND " + (buka ? 1 : 0) + " = <b>" + (bz ? "BERBUNYI" : "diam") + "</b> (gerbang AND, Materi 12)." }; } }
  };
  A.mcusim = function (el) {
    var key = el.dataset.mode || "lampu", env, par, t = 0, acc = 0, ang = 0;
    el.innerHTML = '<div class="ctrl">' + Object.keys(PROYEK14).map(function (k) { return '<button class="btn sm ghost" data-p="' + k + '">' + PROYEK14[k].nama + "</button>"; }).join("") + '</div><svg class="diag wide" viewBox="0 0 660 230"><g class="c"></g></svg><div class="ctrl ms-env"></div><div class="readout ms-info" style="text-align:left"></div><div class="ms-bawah" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:10px"><div class="ms-pin"></div><div><div class="small muted">Kode program (dibuat otomatis dari parameter):</div><pre class="mono ms-code" style="font-size:11.5px;line-height:1.4;background:#0F3D2E;color:#e8f5ee;border-radius:8px;padding:8px;max-height:260px;overflow:auto;white-space:pre"></pre></div></div>';
    function setup() {
      var P = PROYEK14[key]; env = P.env.map(function (x) { return x[4]; }); par = P.par.map(function (x) { return x[4]; });
      el.querySelector(".ms-env").innerHTML = P.env.map(function (x) { return slider("🌍 " + x[0], x[1], x[2], x[3], x[4], x[5]); }).join("") + P.par.map(function (x) { return slider("⚙ " + x[0], x[1], x[2], x[3], x[4], x[5]); }).join("");
      $$(el, ".ms-env input").forEach(function (inp, i) { inp.oninput = function () { inp.parentNode.querySelector(".val").textContent = inp.value; if (i < env.length) env[i] = +inp.value; else par[i - env.length] = +inp.value; draw(); }; });
      el.querySelector(".ms-pin").innerHTML = '<div class="small muted">Pemetaan pin (pin mapping):</div><table class="tabel small"><tr><th>Komponen</th><th>Pin</th><th>Mode</th></tr>' + P.pins.map(function (r) { return "<tr><td>" + r[0] + (r[3] ? '<br><span class="muted" style="font-size:11px">' + r[3] + "</span>" : "") + "</td><td><b>" + r[1] + "</b></td><td>" + r[2] + "</td></tr>"; }).join("") + '<tr><td>Catu</td><td><b>5V, GND</b></td><td>bersama untuk semua modul</td></tr></table>';
      $$(el, "[data-p]").forEach(function (b) { b.classList.toggle("on", b.dataset.p === key); });
    }
    function draw() {
      var P = PROYEK14[key], S = P.sim(env, par, t), s = "", n = P.pins.length, y0 = 30, dy = Math.min(40, 170 / n);
      s += '<rect x="20" y="15" width="200" height="200" rx="12" fill="#0e5e8a"/>' + txt(120, 120, "ARDUINO UNO", { size: 13, b: 1, c: "#fff" }) + txt(120, 138, "ATmega328P · 16 MHz", { size: 9, c: "#cde" }) + '<rect x="45" y="150" width="70" height="30" rx="3" fill="#111"/>' + txt(80, 169, "MCU", { size: 9, c: "#fff" });
      P.pins.forEach(function (r, i) {
        var y = y0 + i * dy + 10, on = S.on[r[1]], kom = r[0].split(" (")[0].split(" + ")[0];
        s += '<rect x="212" y="' + (y - 8) + '" width="44" height="16" rx="3" fill="#fde047" stroke="#333"/>' + txt(234, y + 4, r[1], { size: 9, b: 1 });
        s += line(256, y, 400, y, on ? RED : "#94a3b8", on ? 3 : 2);
        if (/OUTPUT/.test(r[2])) s += arrow(330, y, 345, y, on ? RED : "#94a3b8"); else s += arrow(345, y, 330, y, on ? RED : "#94a3b8");
        s += '<rect x="400" y="' + (y - 13) + '" width="190" height="26" rx="6" fill="' + (on ? "#fee2e2" : "#f8fafc") + '" stroke="' + (on ? RED : "#94a3b8") + '"/>' + txt(495, y + 4, kom.length > 28 ? kom.slice(0, 27) + "…" : kom, { size: 9.5, b: 1 });
        var stv = S.st[r[1]]; s += txt(600, y + 4, stv === true ? "ON" : stv === false ? "OFF" : String(stv), { size: 9, a: "start", c: stv === true ? RED : MUT, b: 1 });
      });
      s += line(20, 222, 640, 222, "#e5e0d2", 1) + txt(330, 228, "panah → keluaran dari MCU, ← masukan ke MCU · merah = aktif/HIGH", { size: 8.5, c: MUT });
      if (key === "kipas") { ang += S.duty * 30; var cx = 630, cy = 30; s += '<g transform="rotate(' + ang.toFixed(0) + " " + cx + " " + cy + ')">' + [0, 120, 240].map(function (a) { return '<ellipse cx="' + cx + '" cy="' + (cy - 11) + '" rx="5" ry="11" fill="' + BLU + '" transform="rotate(' + a + " " + cx + " " + cy + ')"/>'; }).join("") + "</g>"; }
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".ms-info").innerHTML = "<b>Perilaku sistem:</b> " + S.info + (S.serial ? ' <span class="muted">Serial Monitor: <span class="mono">' + S.serial + "</span></span>" : "");
      el.querySelector(".ms-code").textContent = P.code(par);
    }
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (b) { key = b.dataset.p; setup(); draw(); } });
    setup(); draw(); loop(el, function (dt) { t += dt; acc += dt; if (acc > 0.1) { acc = 0; if (key === "kipas" || key === "parkir") draw(); } });
  };

  // A.trouble — studi kasus troubleshooting
  var KASUS14 = [
    { judul: "LED di D13 tidak menyala", gejala: "Program <span class='mono'>digitalWrite(13, HIGH)</span> sudah diunggah dan Serial Monitor menunjukkan program berjalan, tetapi LED eksternal (dengan R 220 Ω) di pin 13 tetap padam.",
      ukur: [["Tegangan pin D13 terhadap GND", "5,02 V (pin sudah HIGH)"], ["Tegangan pada R 220 Ω", "0 V (tidak ada arus mengalir)"], ["Tegangan pada kaki LED", "5,0 V, sisi kaki panjang terhubung ke GND"], ["Tegangan catu 5V board", "5,03 V normal"]],
      opsi: ["LED terpasang terbalik (anoda ke GND)", "Pin D13 rusak", "Resistor terlalu besar", "Program belum diunggah"], benar: 0,
      bahas: "Pin sudah 5 V tetapi arus nol dan seluruh 5 V jatuh di LED → LED dibias mundur. Kaki panjang (anoda) harus ke arah pin, kaki pendek (katoda) ke GND. Arus setelah diperbaiki: (5 − 2)/220 ≈ 13,6 mA (aman, &lt; 20 mA)." },
    { judul: "Arduino reset setiap relay aktif", gejala: "Saat relay 5 V (kumparan 70 mA) menyala, Arduino reset dan program mulai dari awal. Relay digerakkan transistor dari pin D8; semua dicatu dari USB laptop.",
      ukur: [["Tegangan 5V board saat relay OFF", "4,98 V"], ["Tegangan 5V board saat relay berubah ON/OFF (osiloskop)", "turun sesaat ke 3,6 V dan ada lonjakan ±30 V di kolektor saat relay OFF"], ["Komponen paralel kumparan relay", "tidak ada dioda"], ["Pin D8 saat relay ON", "4,9 V"]],
      opsi: ["Tidak ada dioda flyback dan catu kurang stabil → tegangan jatuh/lonjakan memicu reset", "Program memiliki error sintaks", "Pin D8 terlalu lemah, ganti ke D9", "Relay harus diganti LED"], benar: 0,
      bahas: "Kumparan relay adalah induktor: saat dimatikan muncul lonjakan V = L·di/dt. Pasang dioda 1N4148/1N4007 terbalik paralel kumparan (Materi 3–5), kapasitor 100 µF + 100 nF di catu, dan bila perlu catu relay terpisah." },
    { judul: "Tombol terbaca acak", gejala: "Tombol di D2 ke 5V. Saat tidak ditekan, Serial Monitor menampilkan 0 dan 1 bergantian secara acak, bahkan bila tangan mendekat.",
      ukur: [["Kode setup()", "pinMode(2, INPUT);"], ["Tegangan D2 saat tombol dilepas", "berubah-ubah 0,8–3,1 V"], ["Tegangan D2 saat tombol ditekan", "5,0 V stabil"], ["Resistor pada D2", "tidak ada resistor ke GND"]],
      opsi: ["Masukan mengambang: perlu resistor pull-down 10 kΩ, atau tombol ke GND + INPUT_PULLUP", "Tombol rusak", "Arduino butuh catu 12 V", "Harus memakai pin analog"], benar: 0,
      bahas: "Masukan CMOS impedansinya sangat tinggi sehingga tanpa resistor ia menangkap derau (sama seperti Materi 12). Solusi termudah: tombol ke GND, pinMode(2, INPUT_PULLUP), logika terbalik (ditekan = LOW)." },
    { judul: "Regulator 7805 sangat panas", gejala: "Catu 12 V adaptor masuk ke 7805 (tanpa heatsink) untuk mencatu Arduino + modul + LED strip, total arus 0,8 A. Regulator terlalu panas untuk disentuh lalu tegangan keluaran turun.",
      ukur: [["V masuk 7805", "12,1 V"], ["V keluar 7805", "turun dari 5,0 V ke 3,9 V setelah 2 menit"], ["Arus beban", "0,80 A"], ["Heatsink", "tidak ada"]],
      opsi: ["Daya hilang (12 − 5) × 0,8 = 5,6 W terlalu besar tanpa heatsink → proteksi panas aktif; pakai heatsink besar atau buck converter", "7805 palsu, harus diganti", "Arus beban terlalu kecil", "Adaptor harus 24 V"], benar: 0,
      bahas: "P = (V<sub>in</sub> − V<sub>out</sub>) × I = (12,1 − 5) × 0,8 = 5,68 W. Kemasan TO-220 tanpa heatsink hanya ±1–2 W. Efisiensi 5/12 = 42%. Buck converter (efisiensi ±90%) jauh lebih dingin." },
    { judul: "LED berkedip 2× lebih lambat", gejala: "Program kedip yang di Arduino Uno 1 kali/detik dipindah ke chip ATmega328P di papan buatan sendiri (tanpa kristal). LED berkedip setiap 2 detik.",
      ukur: [["Periode kedip (stopwatch)", "2,0 s (seharusnya 1,0 s)"], ["Kristal 16 MHz pada papan", "tidak dipasang"], ["Setelan fuse chip", "clock RC internal 8 MHz"], ["Board yang dipilih di Arduino IDE", "Arduino Uno (16 MHz)"]],
      opsi: ["Clock sebenarnya 8 MHz, tetapi program dikompilasi untuk 16 MHz → semua waktu ×2", "LED rusak", "delay() tidak bekerja di chip mandiri", "Program terlalu panjang"], benar: 0,
      bahas: "delay() dihitung dari jumlah siklus clock. T<sub>sebenarnya</sub> = T<sub>program</sub> × 16/8 = 1 s × 2 = 2 s. Pilih board/clock 8 MHz di IDE atau pasang kristal 16 MHz + 2 kapasitor 22 pF." }
  ];
  A.trouble = function (el) {
    var k = 0, dibuka, jawab, skor = [];
    function mulai() { dibuka = []; jawab = -1; KASUS14.forEach(function (K) { if (!K.ord) K.ord = [0, 1, 2, 3].sort(function () { return Math.random() - 0.5; }); }); }
    el.innerHTML = '<div class="ctrl tr-tab"></div><div class="card tr-c"></div>';
    function draw() {
      var K = KASUS14[k];
      el.querySelector(".tr-tab").innerHTML = KASUS14.map(function (x, i) { return '<button class="btn sm ' + (i === k ? "" : "ghost") + '" data-k="' + i + '">Kasus ' + (i + 1) + (skor[i] != null ? " (" + skor[i] + ")" : "") + "</button>"; }).join("");
      var h = "<h3>🔧 " + K.judul + '</h3><p class="small"><b>Gejala:</b> ' + K.gejala + '</p><p class="small"><b>1. Ukur dulu</b> (pilih pengukuran; teknisi yang baik hemat mengukur):</p><div class="ctrl" style="justify-content:flex-start">' + K.ukur.map(function (u, i) { return '<button class="btn sm ' + (dibuka.indexOf(i) >= 0 ? "" : "ghost") + '" data-u="' + i + '">📏 ' + u[0] + "</button>"; }).join("") + "</div>";
      if (dibuka.length) h += '<ul class="small">' + dibuka.map(function (i) { return "<li>" + K.ukur[i][0] + ": <b>" + K.ukur[i][1] + "</b></li>"; }).join("") + "</ul>";
      h += '<p class="small"><b>2. Diagnosis:</b></p><div style="display:grid;gap:6px">' + K.ord.map(function (i, pos) { var o = K.opsi[i], c = jawab < 0 ? "ghost" : i === K.benar || i === jawab ? "" : "ghost"; return '<button class="btn sm ' + c + '" data-j="' + i + '" ' + (jawab >= 0 ? "disabled" : "") + ' style="text-align:left;justify-content:flex-start' + (jawab >= 0 && i === K.benar ? ";background:#16a34a" : jawab === i && i !== K.benar ? ";background:#dc2626" : "") + '">' + String.fromCharCode(65 + pos) + ". " + o + "</button>"; }).join("") + "</div>";
      if (jawab >= 0) h += '<div class="hint">' + (jawab === K.benar ? "✅ Tepat! " : "❌ Belum tepat. ") + "Skor kasus: <b>" + skor[k] + "</b>/100 (−10 tiap pengukuran lebih dari 2, −50 bila diagnosis salah).<br>" + K.bahas + "</div>";
      el.querySelector(".tr-c").innerHTML = h;
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-k]"); if (b) { k = +b.dataset.k; mulai(); draw(); return; }
      var u = e.target.closest("[data-u]"); if (u && jawab < 0) { var i = +u.dataset.u; if (dibuka.indexOf(i) < 0) dibuka.push(i); draw(); return; }
      var j = e.target.closest("[data-j]"); if (j && jawab < 0) { jawab = +j.dataset.j; skor[k] = Math.max(0, 100 - Math.max(0, dibuka.length - 2) * 10 - (jawab === KASUS14[k].benar ? 0 : 50)); draw(); }
    });
    mulai(); draw();
  };

  // Gambar statis M14
  G.prosesic = function () {
    var L = [["1. Wafer", "irisan silikon", "murni ±0,7 mm"], ["2. Oksidasi", "lapisan SiO₂", "isolator tipis"], ["3. Litografi", "pola disinari", "UV lewat masker"], ["4. Etsa+doping", "atom P/B →", "daerah n dan p"], ["5. Metalisasi", "jalur logam", "penghubung"], ["6. Uji+potong", "ratusan die", "per wafer"], ["7. Kemasan", "die dikawat", "lalu dibungkus"]], s = "";
    L.forEach(function (x, i) { var X = 8 + i * 98; s += '<rect x="' + X + '" y="30" width="88" height="58" rx="8" fill="' + (i % 2 ? "#dbeafe" : "#fde7d4") + '" stroke="' + (i % 2 ? BLU : COP) + '" stroke-width="1.6"/>' + txt(X + 44, 49, x[0], { size: 9, b: 1 }) + txt(X + 44, 65, x[1], { size: 8, c: MUT }) + txt(X + 44, 77, x[2], { size: 8, c: MUT }); if (i < L.length - 1) s += arrow(X + 89, 59, X + 97, 59, MUT); });
    s += '<circle cx="80" cy="128" r="30" fill="#c0c7d0" stroke="#64748b"/>'; for (var a = -24; a <= 24; a += 8) for (var b = -24; b <= 24; b += 8) if (a * a + b * b < 700) s += '<rect x="' + (80 + a - 3) + '" y="' + (128 + b - 3) + '" width="6" height="6" fill="#64748b" opacity=".5"/>';
    s += txt(80, 172, "wafer berisi banyak die", { size: 8.5, c: MUT }) + '<rect x="250" y="108" width="60" height="40" rx="3" fill="#1f2937"/>'; for (var k = 0; k < 7; k++) s += '<rect x="' + (253 + k * 8) + '" y="100" width="3" height="8" fill="#9ca3af"/><rect x="' + (253 + k * 8) + '" y="148" width="3" height="8" fill="#9ca3af"/>';
    s += '<circle cx="257" cy="115" r="2.5" fill="#9ca3af"/>' + txt(280, 172, "IC jadi (DIP)", { size: 8.5, c: MUT }) + arrow(120, 128, 240, 128, MUT) + txt(180, 122, "dipotong & dikemas", { size: 8.5, c: MUT });
    s += txt(500, 120, "Transistor terkecil kini ± beberapa nm;", { size: 9, c: INK }) + txt(500, 135, "rambut manusia ± 70.000 nm.", { size: 9, c: INK });
    return svg(700, 180, s);
  };
  G.kemasan = function () {
    var s = "", K = [["DIP", "kaki tembus (breadboard)", 20], ["SOIC", "SMD, kaki bersayap", 190], ["QFP", "SMD, kaki di 4 sisi", 360], ["BGA", "bola solder di bawah chip", 530]];
    K.forEach(function (k) {
      var X = k[2];
      if (k[0] === "DIP") { s += '<rect x="' + (X + 20) + '" y="40" width="110" height="50" rx="3" fill="#1f2937"/><path d="M' + (X + 20) + ' 58 a7 7 0 0 1 0 14" fill="#9ca3af"/>'; for (var i = 0; i < 7; i++) s += '<rect x="' + (X + 28 + i * 14) + '" y="90" width="5" height="12" fill="#9ca3af"/><rect x="' + (X + 28 + i * 14) + '" y="28" width="5" height="12" fill="#9ca3af"/>'; s += txt(X + 30, 112, "1", { size: 8, c: RED, b: 1 }) + txt(X + 30, 24, "14", { size: 8, c: MUT }) + txt(X + 118, 112, "7", { size: 8, c: MUT }); }
      else if (k[0] === "SOIC") { s += '<rect x="' + (X + 40) + '" y="45" width="70" height="40" rx="2" fill="#1f2937"/><circle cx="' + (X + 48) + '" cy="77" r="2.5" fill="#9ca3af"/>'; for (var j = 0; j < 4; j++) s += '<rect x="' + (X + 47 + j * 16) + '" y="85" width="5" height="8" fill="#9ca3af"/><rect x="' + (X + 47 + j * 16) + '" y="37" width="5" height="8" fill="#9ca3af"/>'; }
      else if (k[0] === "QFP") { s += '<rect x="' + (X + 45) + '" y="35" width="60" height="60" fill="#1f2937"/><circle cx="' + (X + 53) + '" cy="43" r="2.5" fill="#9ca3af"/>'; for (var q = 0; q < 8; q++) { var o = 39 + q * 7; s += '<rect x="' + (X + 39) + '" y="' + o + '" width="6" height="3" fill="#9ca3af"/><rect x="' + (X + 105) + '" y="' + o + '" width="6" height="3" fill="#9ca3af"/><rect x="' + (X + 10 + o) + '" y="29" width="3" height="6" fill="#9ca3af"/><rect x="' + (X + 10 + o) + '" y="95" width="3" height="6" fill="#9ca3af"/>'; } }
      else { s += '<rect x="' + (X + 45) + '" y="35" width="60" height="60" fill="#e5e7eb" stroke="#9ca3af"/>'; for (var u = 0; u < 6; u++) for (var v = 0; v < 6; v++) s += '<circle cx="' + (X + 52 + u * 9.5) + '" cy="' + (42 + v * 9.5) + '" r="3" fill="#94a3b8"/>'; }
      s += txt(X + 75, 128, k[0], { size: 12, b: 1 }) + txt(X + 75, 143, k[1], { size: 8.5, c: MUT });
    });
    s += txt(345, 168, "Penomoran pin: mulai dari tanda takik/titik (pin 1), berlawanan arah jarum jam dilihat dari atas.", { size: 9.5, c: INK });
    return svg(690, 178, s);
  };
  G.blokcpu = function () {
    var s = "";
    s += '<rect x="20" y="30" width="170" height="120" rx="10" fill="#dbeafe" stroke="' + BLU + '" stroke-width="2"/>' + txt(105, 48, "CPU (mikroprosesor)", { size: 10.5, b: 1, c: BLU });
    [["ALU", 30, 60], ["Kendali (CU)", 110, 60], ["Register", 30, 100], ["PC, IR, Flag", 110, 100]].forEach(function (b) { s += '<rect x="' + b[1] + '" y="' + b[2] + '" width="72" height="32" rx="5" fill="#fff" stroke="' + INK + '"/>' + txt(b[1] + 36, b[2] + 20, b[0], { size: 8.5, b: 1 }); });
    [["Memori program (ROM/flash)", 330, 25], ["Memori data (RAM)", 330, 75], ["I/O (port, timer, ADC)", 330, 125]].forEach(function (b) { s += '<rect x="' + b[1] + '" y="' + b[2] + '" width="160" height="36" rx="6" fill="#fde7d4" stroke="' + COP + '"/>' + txt(b[1] + 80, b[2] + 22, b[0], { size: 9, b: 1 }); });
    [[60, "bus alamat", RED], [95, "bus data ⇄", HI], [130, "bus kendali", BLU]].forEach(function (b) { s += line(190, b[0], 312, b[0], b[2], 4) + txt(251, b[0] - 6, b[1], { size: 8.5, c: b[2], b: 1 }); });
    s += line(312, 43, 312, 143, "#94a3b8", 2) + [43, 93, 143].map(function (y) { return line(312, y, 330, y, "#94a3b8", 2); }).join("");
    s += '<rect x="515" y="65" width="145" height="50" rx="6" fill="#f3f4f6" stroke="#94a3b8"/>' + txt(587, 86, "Perangkat luar", { size: 10, b: 1 }) + txt(587, 101, "sensor, LED, motor", { size: 8.5, c: MUT }) + line(490, 143, 540, 115, "#94a3b8", 1.5);
    s += '<rect x="20" y="158" width="80" height="20" rx="4" fill="#111"/>' + txt(60, 172, "Clock", { size: 9, c: "#fde047", b: 1 });
    return svg(670, 185, s);
  };
  G.arsitektur = function (p) {
    var hv = p.mode === "harvard", s = '<rect x="120" y="20" width="110" height="60" rx="8" fill="#dbeafe" stroke="' + BLU + '" stroke-width="2"/>' + txt(175, 55, "CPU", { size: 13, b: 1 });
    if (!hv) { s += '<rect x="120" y="120" width="110" height="50" rx="8" fill="#fde7d4" stroke="' + COP + '" stroke-width="2"/>' + txt(175, 142, "Memori", { size: 11, b: 1 }) + txt(175, 158, "program + data", { size: 9, c: MUT }) + line(175, 80, 175, 120, INK, 5) + txt(185, 104, "1 bus bersama", { size: 9, a: "start", c: RED, b: 1 }); s += txt(175, 190, "Von Neumann: instruksi & data bergantian (“bottleneck”)", { size: 9, c: MUT }); }
    else { s += '<rect x="20" y="120" width="110" height="50" rx="8" fill="#fde7d4" stroke="' + COP + '" stroke-width="2"/>' + txt(75, 142, "Memori", { size: 11, b: 1 }) + txt(75, 158, "program (flash)", { size: 9, c: MUT }) + '<rect x="220" y="120" width="110" height="50" rx="8" fill="#fde7d4" stroke="' + COP + '" stroke-width="2"/>' + txt(275, 142, "Memori", { size: 11, b: 1 }) + txt(275, 158, "data (RAM)", { size: 9, c: MUT }) + line(150, 80, 90, 120, INK, 4) + line(200, 80, 260, 120, INK, 4) + txt(175, 110, "2 bus terpisah", { size: 9, c: HI, b: 1 }); s += txt(175, 190, "Harvard: ambil instruksi & data bersamaan (AVR, PIC)", { size: 9, c: MUT }); }
    return svg(350, 200, s);
  };

  /* -------- PERMAINAN M14 -------- */
  // Game 1: Garis Waktu Evolusi
  var EVO14 = [["🔆", "Tabung hampa (dioda Fleming)", 1904], ["🔺", "Transistor pertama (Bell Labs)", 1947], ["🧩", "IC pertama (Jack Kilby)", 1958], ["🧠", "Mikroprosesor Intel 4004", 1971], ["🖥️", "IBM PC (Intel 8088)", 1981], ["📱", "Ponsel pintar dengan SoC", 2007], ["🔬", "Chip proses 3 nm", 2022]];
  A.game_evolusi = function (el) {
    var urut, idx, salah, msg, t0, sel = false;
    function mulai() { urut = EVO14.map(function (x, i) { return i; }).sort(function () { return Math.random() - 0.5; }); idx = 0; salah = 0; msg = "Klik kartu dari yang PALING LAMA ke yang paling baru."; t0 = 0; sel = false; }
    el.innerHTML = gameHead("Garis Waktu Elektronika", "urutkan penemuan dari yang tertua") + '<div class="ev-line" style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:52px;margin:6px 0"></div><div class="ev-card" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px"></div><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm ghost" data-a="ulang">Main lagi ↺</button></div>';
    function draw() {
      el.querySelector(".ev-line").innerHTML = EVO14.slice(0, idx).map(function (x) { return '<span class="tag ok" style="font-size:13px">' + x[0] + " " + x[2] + "</span>"; }).join(" → ") || '<span class="muted small">garis waktu masih kosong</span>';
      el.querySelector(".ev-card").innerHTML = urut.map(function (i) { var x = EVO14[i], done = i < idx; return '<button class="btn ' + (done ? "" : "ghost") + '" data-e="' + i + '" ' + (done ? "disabled" : "") + ' style="flex-direction:column;padding:8px;min-height:74px' + (done ? ";opacity:.45" : "") + '"><span style="font-size:24px">' + x[0] + '</span><span style="font-size:12.5px">' + x[1] + "</span></button>"; }).join("");
      el.querySelector(".gm-msg").innerHTML = msg;
    }
    el.addEventListener("click", function (e) {
      var c = e.target.closest("[data-e]"); if (c && idx < EVO14.length) { if (!t0) t0 = Date.now(); var i = +c.dataset.e; if (i === idx) { idx++; msg = "✅ " + EVO14[i][1] + " (" + EVO14[i][2] + ")."; if (idx === EVO14.length) { var dt = Math.round((Date.now() - t0) / 1000), b = salah === 0 ? 3 : salah <= 2 ? 2 : 1; msg = "🏁 Selesai dalam " + dt + " s dengan " + salah + " salah → " + "★".repeat(b) + "☆".repeat(3 - b) + ". Dari tabung hampa ke chip 3 nm hanya ±120 tahun!"; } } else { salah++; msg = "❌ Belum. " + EVO14[i][1] + " terjadi tahun " + EVO14[i][2] + "; masih ada yang lebih dulu."; } draw(); return; }
      if (e.target.closest("[data-a=ulang]")) { mulai(); draw(); }
    });
    mulai(); draw();
  };

  // Game 2: Tebak Isi Register
  A.game_register = function (el) {
    var R = 8, ronde, skor, soal, dijawab, msg;
    function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
    function buat() {
      var t = rnd(0, 5), a = rnd(2, 60), b = rnd(2, 30), src, tanya = "A";
      if (t === 0) src = "MOV A,#" + a + "\nADD A,#" + b + "\nSUB A,#" + rnd(1, a);
      else if (t === 1) { a = rnd(120, 250); b = rnd(20, 200); src = "MOV A,#" + a + "\nMOV R0,#" + b + "\nADD A,R0"; tanya = Math.random() < 0.5 ? "C" : "A"; }
      else if (t === 2) src = "MOV A,#" + rnd(1, 40) + "\nSHL A\nSHL A";
      else if (t === 3) src = "MOV A,#" + rnd(16, 255) + "\nAND A,#0x0F";
      else if (t === 4) src = "MOV R1,#" + rnd(2, 5) + "\nMOV A,#0\nloop: ADD A,#" + rnd(2, 9) + "\nDJNZ R1,loop";
      else { a = rnd(5, 30); b = Math.random() < 0.4 ? a : rnd(5, 30); src = "MOV A,#" + a + "\nCMP A,#" + b; tanya = Math.random() < 0.5 ? "Z" : "C"; }
      var r = EDU.jalankan(src + "\nHLT", 200).s, ans = tanya === "A" ? r.A : r[tanya], op = [ans];
      if (tanya === "A") [ans + 1, ans - 1, ans * 2, (ans + 256) % 256 === ans ? ans + 256 : ans, Math.max(0, ans - 10), ans + 10].forEach(function (x) { if (op.length < 4 && x >= 0 && op.indexOf(x) < 0) op.push(x); });
      else op = [0, 1];
      while (op.length < 4 && tanya === "A") { var z = rnd(0, 255); if (op.indexOf(z) < 0) op.push(z); }
      op.sort(function (x, y) { return x - y; });
      soal = { src: src, tanya: tanya, ans: ans, op: op, s: r }; dijawab = false; msg = "Jalankan program di kepala, instruksi demi instruksi.";
    }
    function mulai() { ronde = 0; skor = 0; buat(); }
    el.innerHTML = gameHead("Tebak Isi Register", "berapa isi register/flag setelah program selesai?") + '<div class="gr-q" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:center"></div><div class="ctrl gr-op"></div><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm ghost" data-a="lanjut">Soal berikut ▶</button><button class="btn sm ghost" data-a="ulang">Main lagi ↺</button></div>';
    function draw() {
      var S = soal;
      el.querySelector(".gr-q").innerHTML = ronde >= R ? '<div class="readout" style="grid-column:span 2">🏁 Skor <b>' + skor + "/" + R * 10 + "</b>" + (skor >= 70 ? " 🏆 Kamu CPU manusia!" : "") + "</div>" : '<pre class="mono" style="background:#0F3D2E;color:#e8f5ee;border-radius:8px;padding:8px;margin:0;font-size:14px">' + S.src + '</pre><div class="readout" style="font-size:16px">Soal ' + (ronde + 1) + "/" + R + " · skor " + skor + "<br>Setelah program selesai, berapa <b>" + (S.tanya === "A" ? "isi akumulator A" : "flag " + S.tanya + (S.tanya === "Z" ? " (zero)" : " (carry/borrow)")) + "</b>?</div>";
      el.querySelector(".gr-op").innerHTML = ronde >= R ? "" : S.op.map(function (x) { return '<button class="btn gm-big" data-o="' + x + '" ' + (dijawab ? "disabled" : "") + ' style="min-width:90px;font-size:18px' + (dijawab && x === S.ans ? ";background:#16a34a" : "") + '">' + x + "</button>"; }).join("");
      el.querySelector(".gm-msg").innerHTML = msg;
      el.querySelector("[data-a=lanjut]").disabled = !dijawab || ronde >= R;
    }
    el.addEventListener("click", function (e) {
      var o = e.target.closest("[data-o]"); if (o && !dijawab) { dijawab = true; var ok = +o.dataset.o === soal.ans; if (ok) skor += 10; msg = (ok ? "✅ Benar! " : "❌ Jawaban: <b>" + soal.ans + "</b>. ") + "Akhir: A = " + soal.s.A + " (" + bin13(soal.s.A, 8) + "), Z = " + soal.s.Z + ", C = " + soal.s.C + (soal.src.indexOf("SHL") >= 0 ? " · SHL = kali 2" : soal.src.indexOf("AND") >= 0 ? " · AND 0x0F = ambil 4 bit bawah" : soal.src.indexOf("CMP") >= 0 ? " · CMP: Z=1 bila sama, C=1 bila A lebih kecil" : soal.src.indexOf("R0") >= 0 ? " · hasil > 255 → C=1 dan A = hasil − 256" : ""); draw(); return; }
      var a = e.target.closest("[data-a]"); if (a) { if (a.dataset.a === "ulang") mulai(); else if (dijawab) { ronde++; if (ronde < R) buat(); else msg = "Selesai! Coba program serupa di simulator untuk memeriksa."; } draw(); }
    });
    mulai(); draw();
  };

  // Game 3: Colok Pin Arduino
  var PIN14 = { pwm: [3, 5, 6, 9, 10, 11] };
  var KOMP14 = {
    led: ["💡 LED indikator", function (p) { return /^D([2-9]|1[0-3])$/.test(p) || /^A[0-5]$/.test(p); }, "LED cukup pin digital mana pun (D2–D13; A0–A5 juga bisa digital)."],
    tombol: ["🔘 Tombol", function (p) { return /^D([2-9]|1[0-3])$/.test(p) || /^A[0-5]$/.test(p); }, "Tombol = masukan digital (D2–D13), pakai INPUT_PULLUP."],
    pot: ["🎚️ Potensiometer", function (p) { return /^A[0-5]$/.test(p); }, "Nilai analog harus dibaca ADC: hanya pin A0–A5."],
    lm35: ["🌡️ Sensor suhu LM35", function (p) { return /^A[0-5]$/.test(p); }, "Keluaran LM35 analog (10 mV/°C) → pin A0–A5."],
    pwmled: ["🔅 LED redup-terang", function (p) { return /^D(3|5|6|9|10|11)$/.test(p); }, "Redup-terang butuh analogWrite (PWM): hanya pin bertanda ~ (3, 5, 6, 9, 10, 11)."],
    motor: ["🌀 Kecepatan motor DC (lewat MOSFET)", function (p) { return /^D(3|5|6|9|10|11)$/.test(p); }, "Kecepatan diatur PWM: pin ~ (3, 5, 6, 9, 10, 11)."],
    sda: ["📟 LCD I2C — SDA", function (p) { return p === "A4"; }, "Pada Uno, SDA (data I2C) adalah A4."],
    scl: ["📟 LCD I2C — SCL", function (p) { return p === "A5"; }, "Pada Uno, SCL (clock I2C) adalah A5."],
    rpm: ["⚙️ Sensor putaran (interupsi)", function (p) { return p === "D2" || p === "D3"; }, "Interupsi eksternal (attachInterrupt) Uno hanya di D2 (INT0) dan D3 (INT1)."]
  };
  var LV_PIN14 = [["led", "tombol", "pot"], ["pwmled", "lm35", "motor", "tombol"], ["sda", "scl", "rpm", "pwmled", "pot"]];
  A.game_pin = function (el) {
    var lv = 0, pasang, pilih, salah, msg, bintang = [];
    function mulai() { pasang = {}; pilih = null; salah = 0; msg = "1) Klik komponen, 2) klik pin Arduino yang cocok."; }
    el.innerHTML = gameHead("Colok Pin Arduino", "hubungkan komponen ke pin yang tepat") + '<div class="readout gm-lv"></div><div class="gp-k ctrl"></div><svg class="diag wide" viewBox="0 0 660 150"><g class="c"></g></svg><div class="readout gm-msg"></div><div class="ctrl"><button class="btn sm ghost" data-a="ulang">Ulangi ↺</button><button class="btn sm" data-a="lanjut">Level berikut ▶</button></div>';
    function semua() { return LV_PIN14[lv].every(function (k) { return pasang[k]; }); }
    function draw() {
      var L = LV_PIN14[lv], dipakai = {}; Object.keys(pasang).forEach(function (k) { dipakai[pasang[k]] = k; });
      el.querySelector(".gm-lv").innerHTML = LV_PIN14.map(function (x, i) { return '<span class="tag ' + (i === lv ? "ok" : bintang[i] ? "mid" : "") + '">L' + (i + 1) + (bintang[i] ? " " + "★".repeat(bintang[i]) : "") + "</span>"; }).join(" ") + " · salah: " + salah;
      el.querySelector(".gp-k").innerHTML = L.map(function (k) { var d = pasang[k]; return '<button class="btn sm ' + (pilih === k ? "" : "ghost") + '" data-c="' + k + '" ' + (d ? "disabled" : "") + (d ? ' style="background:#16a34a;color:#fff"' : "") + ">" + KOMP14[k][0] + (d ? " → " + d : "") + "</button>"; }).join("");
      var s = '<rect x="10" y="20" width="640" height="110" rx="10" fill="#0e5e8a"/>' + txt(330, 85, "ARDUINO UNO", { size: 14, b: 1, c: "#cde" });
      for (var i = 0; i <= 13; i++) { var p = "D" + i, X = 620 - i * 40, pw = PIN14.pwm.indexOf(i) >= 0, u = dipakai[p]; s += '<g data-pin="' + p + '" style="cursor:pointer"><rect x="' + (X - 14) + '" y="28" width="28" height="22" rx="3" fill="' + (u ? "#16a34a" : i < 2 ? "#64748b" : "#111") + '"/>' + txt(X, 43, (pw ? "~" : "") + i, { size: 10, b: 1, c: "#fde047" }) + "</g>"; if (u) s += txt(X, 64, KOMP14[u][0].split(" ")[0], { size: 12 }); }
      s += txt(640, 16, "DIGITAL (~ = PWM)", { size: 9, a: "end", c: MUT }) + txt(62, 64, "0,1 = USB serial", { size: 8, c: "#cde" });
      for (var j = 0; j <= 5; j++) { var q = "A" + j, X2 = 360 + j * 46, u2 = dipakai[q]; s += '<g data-pin="' + q + '" style="cursor:pointer"><rect x="' + (X2 - 15) + '" y="100" width="30" height="22" rx="3" fill="' + (u2 ? "#16a34a" : "#111") + '"/>' + txt(X2, 115, q, { size: 10, b: 1, c: "#fde047" }) + "</g>"; if (u2) s += txt(X2, 96, KOMP14[u2][0].split(" ")[0], { size: 12 }); }
      s += txt(360, 145, "ANALOG IN (A4 = SDA, A5 = SCL)", { size: 9, a: "start", c: MUT }) + '<rect x="40" y="100" width="120" height="22" rx="3" fill="#7f1d1d"/>' + txt(100, 115, "5V  GND  VIN", { size: 10, b: 1, c: "#fff" });
      el.querySelector(".c").innerHTML = s;
      el.querySelector(".gm-msg").innerHTML = msg;
      el.querySelector("[data-a=lanjut]").disabled = !semua() || lv === LV_PIN14.length - 1;
    }
    el.addEventListener("click", function (e) {
      var c = e.target.closest("[data-c]"); if (c) { pilih = c.dataset.c; msg = "Pilih pin untuk <b>" + KOMP14[pilih][0] + "</b>."; draw(); return; }
      var p = e.target.closest("[data-pin]"); if (p) {
        var pin = p.dataset.pin;
        if (!pilih) { msg = "Klik komponen dulu."; }
        else if (pin === "D0" || pin === "D1") { salah++; msg = "❌ D0/D1 dipakai komunikasi USB (Serial). Hindari untuk komponen."; }
        else if (Object.keys(pasang).some(function (k) { return pasang[k] === pin; })) { msg = "Pin " + pin + " sudah terpakai."; }
        else if (KOMP14[pilih][1](pin)) { pasang[pilih] = pin; msg = "✅ " + KOMP14[pilih][0] + " → <b>" + pin + "</b>. " + KOMP14[pilih][2]; pilih = null; if (semua()) { var b = salah === 0 ? 3 : salah <= 2 ? 2 : 1; bintang[lv] = Math.max(bintang[lv] || 0, b); msg += "<br>🎉 Level selesai! " + "★".repeat(b) + "☆".repeat(3 - b); } }
        else { salah++; msg = "❌ " + pin + " kurang tepat untuk " + KOMP14[pilih][0] + ". " + KOMP14[pilih][2]; }
        draw(); return;
      }
      var a = e.target.closest("[data-a]"); if (a) { if (a.dataset.a === "ulang") mulai(); else if (semua() && lv < LV_PIN14.length - 1) { lv++; mulai(); } draw(); }
    });
    mulai(); draw();
  };

  // Game 4: Kode Rahasia (tantangan assembly)
  var LV_KODE14 = [
    { judul: "Tampilkan angka 9 di LED (port P1)", maks: 3, opt: 2, cek: function (s) { return s.outs[s.outs.length - 1] === 9; }, tips: "MOV A,#9 lalu OUT P1,A." },
    { judul: "Tampilkan 16, tetapi angka langsung (#n) paling besar 4", maks: 6, opt: 4, imm: 4, cek: function (s) { return s.outs[s.outs.length - 1] === 16; }, tips: "4 + 4 = 8, 8 + 8 = 16: ADD A,A atau SHL A melipatgandakan A." },
    { judul: "Hitung 6 × 7 dengan loop, hasil 42 di LED (#n paling besar 7)", maks: 7, opt: 4, imm: 7, perlu: /DJNZ|JNZ/, cek: function (s) { return s.outs[s.outs.length - 1] === 42; }, tips: "R1 = 7 sebagai pencacah; ulangi ADD A,#6 lalu DJNZ R1,loop." },
    { judul: "LED berjalan: keluarkan 1, 2, 4, 8 berurutan lalu berhenti", maks: 7, opt: 5, perlu: /J|DJNZ/, cek: function (s) { return s.outs.join(",") === "1,2,4,8"; }, tips: "MOV A,#1, lalu loop: OUT P1,A; SHL A; CMP A,#16; JNZ loop." }
  ];
  A.game_kode = function (el) {
    var lv = 0, bintang = [], msg = "";
    el.innerHTML = gameHead("Kode Rahasia", "tulis program assembly EDU-8 yang memenuhi tantangan") + '<div class="readout gm-lv"></div><textarea class="gk-src mono" spellcheck="false" style="width:100%;min-height:150px;font-size:14px;border:1px solid #d6cfbd;border-radius:8px;padding:8px;background:#fffdf6"></textarea><div class="ctrl"><button class="btn sm" data-a="uji">▶ Jalankan &amp; periksa</button><button class="btn sm ghost" data-a="tips">💡 Petunjuk</button><button class="btn sm" data-a="lanjut">Level berikut ▶</button></div><div class="readout gm-msg" style="text-align:left"></div><div class="small muted">Instruksi: MOV, ADD, SUB, INC, DEC, AND, OR, XOR, NOT, SHL, SHR, CMP, JMP, JZ, JNZ, JC, JNC, DJNZ, IN, OUT, NOP, HLT · register A, R0–R3 · label diakhiri titik dua.</div>';
    var ta = el.querySelector(".gk-src");
    function draw() {
      var L = LV_KODE14[lv];
      el.querySelector(".gm-lv").innerHTML = LV_KODE14.map(function (x, i) { return '<span class="tag ' + (i === lv ? "ok" : bintang[i] ? "mid" : "") + '">L' + (i + 1) + (bintang[i] ? " " + "★".repeat(bintang[i]) : "") + "</span>"; }).join(" ") + "<br>🎯 <b>" + L.judul + "</b> · maksimal " + L.maks + " baris instruksi";
      el.querySelector(".gm-msg").innerHTML = msg || "Tulis program, lalu tekan Jalankan. HLT boleh ditulis atau tidak.";
      el.querySelector("[data-a=lanjut]").disabled = !bintang[lv] || lv === LV_KODE14.length - 1;
    }
    el.addEventListener("click", function (e) {
      var a = e.target.closest("[data-a]"); if (!a) return; var L = LV_KODE14[lv];
      if (a.dataset.a === "tips") msg = "💡 " + L.tips;
      else if (a.dataset.a === "lanjut") { if (bintang[lv] && lv < LV_KODE14.length - 1) { lv++; ta.value = ""; msg = ""; } }
      else {
        var R = EDU.rakit(ta.value), n = R.prog.filter(function (p) { return p.op !== "HLT"; }).length;
        if (R.err.length) msg = "⚠ " + R.err.join("<br>⚠ ");
        else if (!n) msg = "Program masih kosong.";
        else if (n > L.maks) msg = "❌ Terlalu panjang: " + n + " baris (maksimal " + L.maks + ").";
        else if (L.imm && R.prog.some(function (p) { return p.a.some(function (x) { return x.k === "#" && x.v > L.imm; }); })) msg = "❌ Ada angka langsung lebih dari #" + L.imm + ".";
        else if (L.perlu && !R.prog.some(function (p) { return L.perlu.test(p.op); })) msg = "❌ Tantangan ini wajib memakai loop (lompatan).";
        else {
          var r = EDU.jalankan(ta.value, 600), s = r.s, ok = !s.pesan || /HLT/.test(s.pesan) || /habis/.test(s.pesan) ? L.cek(s) : false;
          msg = "Hasil: LED menampilkan [" + (s.outs.join(", ") || "tidak ada OUT") + "], A = " + s.A + ", " + s.n + " instruksi dijalankan, " + s.cyc + " siklus." + (s.pesan && !/habis/.test(s.pesan) ? " ⚠ " + s.pesan + "." : "");
          if (ok) { var b = n <= L.opt ? 3 : n <= L.opt + 1 ? 2 : 1; bintang[lv] = Math.max(bintang[lv] || 0, b); msg = "🎉 <b>Berhasil!</b> " + "★".repeat(b) + "☆".repeat(3 - b) + " (" + n + " baris; solusi terpendek ±" + L.opt + ")<br>" + msg; }
          else msg = "❌ Belum memenuhi target. " + msg;
        }
      }
      draw();
    });
    draw();
  };

  function mount(root) { $$(root, "[data-anim]").forEach(function (el) { var fn = A[el.dataset.anim]; if (fn && !el.dataset.on) { el.dataset.on = 1; el.classList.add("anim"); try { fn(el); } catch (e) { el.textContent = "(animasi gagal dimuat: " + e.message + ")"; } } }); }
  return { gambar: gambar, mount: mount, parseSpec: parseSpec, fR: fR };
})();
