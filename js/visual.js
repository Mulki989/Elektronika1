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
  function mount(root) { $$(root, "[data-anim]").forEach(function (el) { var fn = A[el.dataset.anim]; if (fn && !el.dataset.on) { el.dataset.on = 1; el.classList.add("anim"); try { fn(el); } catch (e) { el.textContent = "(animasi gagal dimuat: " + e.message + ")"; } } }); }
  return { gambar: gambar, mount: mount, parseSpec: parseSpec, fR: fR };
})();
