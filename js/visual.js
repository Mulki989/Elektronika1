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
  function mount(root) { $$(root, "[data-anim]").forEach(function (el) { var fn = A[el.dataset.anim]; if (fn && !el.dataset.on) { el.dataset.on = 1; el.classList.add("anim"); try { fn(el); } catch (e) { el.textContent = "(animasi gagal dimuat: " + e.message + ")"; } } }); }
  return { gambar: gambar, mount: mount, parseSpec: parseSpec, fR: fR };
})();
