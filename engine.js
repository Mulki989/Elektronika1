/* ================= MESIN SOAL (dipakai di aplikasi & Apps Script) =================
 * Format soal di Google Sheet "Bank Soal":
 *  Tipe  : PG (pilihan ganda) | PGK (pilihan ganda kompleks) | BS (benar/salah)
 *          HIT (hitungan, angka acak) | JODOH (mencocokkan) | URUT (mengurutkan)
 *  Variabel : "V=5:24:1; R=100,220,470; I=V/R*1000"
 *             a:b:langkah = acak dalam rentang, a,b,c = pilih salah satu, selain itu = rumus
 *  Syarat   : rumus benar/salah agar angka masuk akal, mis. "R1<R2"
 *  Teks     : {V} = nilai variabel, {=V/R*1000:2} = hasil rumus dengan 2 desimal
 *  Opsi     : dipisah " || "  (JODOH: "kiri => kanan || ...", URUT: urutan BENAR)
 *  Jawaban  : PG "B", PGK "A,C", BS "Benar"/"Salah", HIT rumus mis. "V/R*1000"
 *             PG/BS juga boleh "hitung: rumus" (PG: hasil 1=A, 2=B, ...; BS: hasil ≠0 = Benar)
 *  Pembahasan : langkah dipisah " | "
 *  Acak     : "Tidak" bila urutan opsi PG/PGK harus tetap (mis. 1/8 W, 1/4 W, ...)
 * ================================================================================ */
var Engine = (function () {
  "use strict";
  var FUNCS = {
    sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp, ln: Math.log, log: function (x) { return Math.log(x) / Math.LN10; }, log10: function (x) { return Math.log(x) / Math.LN10; },
    sin: Math.sin, cos: Math.cos, tan: Math.tan, min: Math.min, max: Math.max, floor: Math.floor, ceil: Math.ceil,
    round: function (x, d) { var p = Math.pow(10, d || 0); return Math.round(x * p) / p; },
    par: function () { var s = 0; for (var i = 0; i < arguments.length; i++) s += 1 / arguments[i]; return 1 / s; }
  };
  var CONST = { pi: Math.PI, e: Math.E };

  function tokenize(s) {
    var t = [], i = 0, c;
    s = String(s).replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
    while (i < s.length) {
      c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) { var j = i; while (j < s.length && /[0-9.eE]/.test(s[j]) && !(/[eE]/.test(s[j]) && !/[0-9+-]/.test(s[j + 1] || ""))) { if (/[eE]/.test(s[j]) && /[+-]/.test(s[j + 1])) j++; j++; } t.push({ k: "n", v: parseFloat(s.slice(i, j)) }); i = j; continue; }
      if (/[A-Za-z_]/.test(c)) { var j2 = i; while (j2 < s.length && /[A-Za-z0-9_]/.test(s[j2])) j2++; t.push({ k: "id", v: s.slice(i, j2) }); i = j2; continue; }
      if ("<>=!".indexOf(c) >= 0 && s[i + 1] === "=") { t.push({ k: "op", v: c + "=" }); i += 2; continue; }
      if ("&|".indexOf(c) >= 0 && s[i + 1] === c) { t.push({ k: "op", v: c + c }); i += 2; continue; }
      if ("+-*/^(),<>".indexOf(c) >= 0) { t.push({ k: "op", v: c }); i++; continue; }
      throw new Error("Karakter tidak dikenal dalam rumus: " + c);
    }
    return t;
  }
  // recursive-descent parser -> evaluates directly with vars
  function evaluate(expr, vars) {
    var t = tokenize(expr), p = 0;
    function peek() { return t[p]; }
    function eat(v) { if (!t[p] || t[p].v !== v) throw new Error("Rumus tidak lengkap: diharapkan '" + v + "'"); p++; }
    function primary() {
      var tk = t[p++];
      if (!tk) throw new Error("Rumus terpotong");
      if (tk.k === "n") return tk.v;
      if (tk.v === "(") { var v = orExpr(); eat(")"); return v; }
      if (tk.v === "-") return -power();
      if (tk.v === "+") return power();
      if (tk.k === "id") {
        if (peek() && peek().v === "(") {
          var f = FUNCS[tk.v.toLowerCase()]; if (!f) throw new Error("Fungsi tidak dikenal: " + tk.v);
          p++; var args = [];
          if (peek().v !== ")") { args.push(orExpr()); while (peek() && peek().v === ",") { p++; args.push(orExpr()); } }
          eat(")"); return f.apply(null, args);
        }
        if (vars && Object.prototype.hasOwnProperty.call(vars, tk.v)) return vars[tk.v];
        if (Object.prototype.hasOwnProperty.call(CONST, tk.v.toLowerCase())) return CONST[tk.v.toLowerCase()];
        throw new Error("Variabel belum didefinisikan: " + tk.v);
      }
      throw new Error("Rumus tidak valid di dekat '" + tk.v + "'");
    }
    function power() { var b = primary(); if (peek() && peek().v === "^") { p++; return Math.pow(b, unaryPow()); } return b; }
    function unaryPow() { if (peek() && peek().v === "-") { p++; return -unaryPow(); } return power(); }
    function term() { var v = power(); while (peek() && (peek().v === "*" || peek().v === "/")) { var o = t[p++].v, r = power(); v = o === "*" ? v * r : v / r; } return v; }
    function sum() { var v = term(); while (peek() && (peek().v === "+" || peek().v === "-")) { var o = t[p++].v, r = term(); v = o === "+" ? v + r : v - r; } return v; }
    function cmp() { var v = sum(); while (peek() && ["<", ">", "<=", ">=", "==", "!="].indexOf(peek().v) >= 0) { var o = t[p++].v, r = sum(); v = o === "<" ? v < r : o === ">" ? v > r : o === "<=" ? v <= r : o === ">=" ? v >= r : o === "==" ? Math.abs(v - r) < 1e-9 : Math.abs(v - r) >= 1e-9; v = v ? 1 : 0; } return v; }
    function andExpr() { var v = cmp(); while (peek() && peek().v === "&&") { p++; var r = cmp(); v = v && r ? 1 : 0; } return v; }
    function orExpr() { var v = andExpr(); while (peek() && peek().v === "||") { p++; var r = andExpr(); v = v || r ? 1 : 0; } return v; }
    var out = orExpr();
    if (p < t.length) throw new Error("Rumus tidak valid di dekat '" + t[p].v + "'");
    return out;
  }

  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function newSeed() { return Math.floor(Math.random() * 2147483646) + 1; }

  // format angka gaya Indonesia (koma desimal)
  function fmt(x, d) {
    if (typeof x !== "number" || !isFinite(x)) return String(x);
    if (d == null) { var a = Math.abs(x); d = a === 0 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : 4; }
    var s = x.toFixed(d);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return s.replace(".", ",");
  }

  function genVars(spec, cond, r) {
    var defs = String(spec || "").split(/;|\n/).map(function (x) { return x.trim(); }).filter(Boolean);
    for (var tries = 0; tries < 200; tries++) {
      var v = {};
      for (var i = 0; i < defs.length; i++) {
        var m = defs[i].match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
        if (!m) throw new Error("Format variabel salah: " + defs[i]);
        var name = m[1], rhs = m[2].trim(), rg = rhs.match(/^(-?[\d.,]+)\s*:\s*(-?[\d.,]+)\s*:\s*([\d.,]+)$/);
        if (rg) {
          var lo = parseFloat(rg[1].replace(",", ".")), hi = parseFloat(rg[2].replace(",", ".")), st = parseFloat(rg[3].replace(",", "."));
          var n = Math.floor((hi - lo) / st + 1e-9) + 1; v[name] = +(lo + Math.floor(r() * n) * st).toFixed(10);
        } else if (/^-?[\d.]+(\s*,\s*-?[\d.]+)+$/.test(rhs) || /^-?[\d.]+$/.test(rhs)) {
          var opts = rhs.split(",").map(function (x) { return parseFloat(x); }); v[name] = opts[Math.floor(r() * opts.length)];
        } else v[name] = evaluate(rhs, v);
      }
      if (!cond || evaluate(cond, v)) return v;
    }
    throw new Error("Syarat variabel tidak pernah terpenuhi: " + cond);
  }
  function fill(text, v) {
    return String(text == null ? "" : text).replace(/\{=([^}:]+)(?::(\d+))?\}/g, function (_, e, d) { return fmt(evaluate(e, v), d == null ? undefined : +d); })
      .replace(/\{([A-Za-z_][A-Za-z0-9_]*)(?::(\d+))?\}/g, function (all, n, d) { return Object.prototype.hasOwnProperty.call(v, n) ? fmt(v[n], d == null ? undefined : +d) : all; });
  }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  var split = function (s) { return String(s || "").split("||").map(function (x) { return x.trim(); }).filter(function (x) { return x !== ""; }); };
  var letters = function (s) { return String(s || "").toUpperCase().split(/[,;\s]+/).filter(Boolean).map(function (L) { return L.charCodeAt(0) - 65; }); };

  /** item = baris bank soal (objek dengan kunci: id,tipe,soal,variabel,syarat,opsi,jawaban,satuan,toleransi,pembahasan,visual, ...) */
  function instantiate(item, seed) {
    var r = rng(seed), tipe = String(item.tipe || "PG").toUpperCase().trim();
    var v = genVars(item.variabel, item.syarat, r);
    var out = { id: item.id, tipe: tipe, seed: seed, soal: fill(item.soal, v), satuan: fill(item.satuan || "", v), pembahasan: split(String(item.pembahasan || "").replace(/\s\|\s/g, " || ")).map(function (s) { return fill(s, v); }), visual: null, opsi: [], key: null, meta: { level: item.level, sub: item.sub, materi: item.materi, kesulitan: item.kesulitan } };
    if (item.visual) {
      var vm = String(item.visual).match(/^\s*([A-Za-z0-9_]+)\s*(?:\((.*)\))?\s*$/);
      if (vm) { var pv = {}; (vm[2] || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (kv) { var a = kv.split("="); pv[a[0].trim()] = a.length > 1 ? (isNaN(+a[1]) ? (Object.prototype.hasOwnProperty.call(v, a[1].trim()) ? v[a[1].trim()] : (function () { try { return evaluate(a[1], v); } catch (e) { return a[1].trim(); } })()) : +a[1]) : v[a[0].trim()]; }); out.visual = { name: vm[1], params: pv }; }
    }
    if (tipe === "PG" || tipe === "PGK") {
      var raw = split(item.opsi).map(function (o) { return fill(o, v); });
      var jw = String(item.jawaban || "").trim();
      // jawaban "=rumus" -> nomor opsi benar (1 = A) dihitung dari variabel
      var hj = jw.match(/^(?:=|hitung\s*:)\s*(.+)$/i);
      var correct = hj ? [Math.round(evaluate(hj[1], v)) - 1] : letters(jw);
      var order = raw.map(function (_, i) { return i; });
      if (!/^(tidak|no|n|0)$/i.test(String(item.acak || "").trim())) order = shuffle(order, r);
      out.opsi = order.map(function (i) { return raw[i]; });
      var keys = correct.map(function (c) { return order.indexOf(c); }).sort(function (a, b) { return a - b; });
      out.key = tipe === "PG" ? keys[0] : keys;
    } else if (tipe === "BS") {
      out.opsi = ["Benar", "Salah"]; var jb = String(item.jawaban || "").trim();
      var hb = jb.match(/^(?:=|hitung\s*:)\s*(.+)$/i);
      out.key = hb ? (evaluate(hb[1], v) ? 0 : 1) : (/^b/i.test(jb) ? 0 : 1);
    } else if (tipe === "HIT") {
      out.key = evaluate(item.jawaban, v); out.tol = (parseFloat(String(item.toleransi || "2").replace(",", ".")) || 2) / 100;
      out.jawabanTeks = fmt(out.key);
    } else if (tipe === "JODOH") {
      var pairs = split(item.opsi).map(function (p) { var a = p.split("=>"); return [fill(a[0].trim(), v), fill((a[1] || "").trim(), v)]; });
      out.kiri = pairs.map(function (p) { return p[0]; });
      var ord = shuffle(pairs.map(function (_, i) { return i; }), r);
      out.opsi = ord.map(function (i) { return pairs[i][1]; });
      out.key = pairs.map(function (_, i) { return ord.indexOf(i); });
    } else if (tipe === "URUT") {
      var steps = split(item.opsi).map(function (o) { return fill(o, v); });
      var o2 = shuffle(steps.map(function (_, i) { return i; }), r);
      if (o2.every(function (x, i) { return x === i; }) && o2.length > 1) o2 = o2.slice(1).concat(o2[0]);
      out.opsi = o2.map(function (i) { return steps[i]; });
      out.key = steps.map(function (_, i) { return o2.indexOf(i); });
    } else throw new Error("Tipe soal tidak dikenal: " + tipe);
    return out;
  }
  function parseNum(x) { var t = String(x == null ? "" : x).trim().replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."); return t === "" ? NaN : Number(t); }
  /** skor 0..1 */
  function grade(inst, ans) {
    if (ans == null || ans === "") return 0;
    switch (inst.tipe) {
      case "PG": case "BS": return typeof ans !== "object" && +ans === inst.key ? 1 : 0;
      case "PGK": { var a = (ans || []).map(Number).sort(function (x, y) { return x - y; }); return a.length === inst.key.length && a.every(function (x, i) { return x === inst.key[i]; }) ? 1 : 0; }
      case "HIT": { var n = parseNum(ans); if (isNaN(n)) return 0; return Math.abs(n - inst.key) <= Math.abs(inst.key) * inst.tol + 1e-9 ? 1 : 0; }
      case "JODOH": { var ok = 0; inst.key.forEach(function (k, i) { if (ans[i] != null && ans[i] !== "" && +ans[i] === k) ok++; }); return ok / inst.key.length; }
      case "URUT": { return (ans || []).length === inst.key.length && ans.every(function (x, i) { return x != null && +x === inst.key[i]; }) ? 1 : 0; }
    }
    return 0;
  }
  /** versi untuk ujian: tanpa kunci & pembahasan */
  function publicView(inst) {
    var o = {}; for (var k in inst) if (["key", "pembahasan", "jawabanTeks", "seed", "tol"].indexOf(k) < 0) o[k] = inst[k];
    return o;
  }
  /** jelaskan kunci jawaban dalam teks */
  function keyText(inst) {
    var L = function (i) { return String.fromCharCode(65 + i) + ". " + inst.opsi[i]; };
    switch (inst.tipe) {
      case "PG": case "BS": return L(inst.key);
      case "PGK": return inst.key.map(L).join("; ");
      case "HIT": return inst.jawabanTeks + (inst.satuan ? " " + inst.satuan : "");
      case "JODOH": return inst.kiri.map(function (k, i) { return k + " → " + inst.opsi[inst.key[i]]; }).join("; ");
      case "URUT": return inst.key.map(function (k, i) { return (i + 1) + ") " + inst.opsi[k]; }).join("  ");
    }
  }
  /** pilih soal sesuai kisi-kisi {C2:3,C3:4,...}; hindari id di 'hindari' bila memungkinkan */
  function pick(items, kisi, total, hindari, r) {
    hindari = hindari || []; r = r || Math.random;
    var chosen = [], used = {};
    var pool = function (lv) { return shuffle(items.filter(function (it) { return !used[it.id] && (!lv || String(it.level).toUpperCase().indexOf(lv) === 0); }), r).sort(function (a, b) { return (hindari.indexOf(a.id) >= 0) - (hindari.indexOf(b.id) >= 0); }); };
    Object.keys(kisi || {}).forEach(function (lv) { var n = +kisi[lv] || 0; pool(lv).slice(0, n).forEach(function (it) { used[it.id] = 1; chosen.push(it); }); });
    if (chosen.length < total) pool(null).slice(0, total - chosen.length).forEach(function (it) { used[it.id] = 1; chosen.push(it); });
    return shuffle(chosen, r).slice(0, total);
  }
  return { evaluate: evaluate, genVars: genVars, fill: fill, fmt: fmt, instantiate: instantiate, grade: grade, publicView: publicView, keyText: keyText, pick: pick, newSeed: newSeed, rng: rng, parseNum: parseNum, shuffle: shuffle };
})();
if (typeof module !== "undefined") module.exports = Engine;
