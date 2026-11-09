/* =====================================================================
 * MATERI 1 — Pengantar Elektronika & Dasar Rangkaian Listrik
 * Sub-CPMK-1 (C2, C3): menjelaskan komponen pasif dan aktif serta
 * menerapkan hukum Ohm, KCL, dan KVL pada rangkaian sederhana.
 *
 * Setiap slide:
 *   id     : kode slide → nama file suara audio/m01/m01-<id>.mp3
 *   bab    : nama bagian (untuk daftar isi)
 *   judul  : judul slide
 *   html   : isi slide.  <div data-anim="nama" ...> = animasi interaktif
 *   narasi : naskah suara (dibacakan; juga menjadi teks takarir)
 *   cek    : (opsional) soal cek pemahaman, format sama dengan bank soal
 * ===================================================================== */
window.MATERI = window.MATERI || {};
window.MATERI.M01 = {
  kode: "M01",
  minggu: 1,
  judul: "Pengantar Elektronika & Dasar Rangkaian Listrik",
  sub: "Sub-CPMK-1",
  ringkas: "Komponen pasif & aktif, besaran listrik, hukum Ohm, rangkaian seri-paralel, KCL dan KVL.",
  slides: [
    /* ======================= A. PEMBUKA ======================= */
    {
      id: "s01", bab: "Pembuka", judul: "Selamat datang di Elektronika Dasar",
      html: `
<div class="hero">
  <div class="hero-kicker">Materi 1 · Minggu 1</div>
  <h1>Pengantar Elektronika &amp; Dasar Rangkaian Listrik</h1>
  <p class="lead">Sebelum mempelajari dioda, transistor dan op-amp, kita perlu menguasai "bahasa dasar" rangkaian: komponen, tegangan, arus, resistansi, dan tiga hukum yang selalu dipakai.</p>
</div>
<div class="card">
  <h3>Setelah materi ini Anda mampu:</h3>
  <ol class="tujuan">
    <li>Menjelaskan arti elektronika dan membedakan komponen <b>pasif</b> dan <b>aktif</b>.</li>
    <li>Menjelaskan besaran muatan, arus, tegangan, resistansi, dan daya beserta satuannya.</li>
    <li>Menerapkan <b>hukum Ohm</b> dan rumus daya pada satu resistor.</li>
    <li>Menghitung rangkaian <b>seri</b>, <b>paralel</b>, dan gabungan.</li>
    <li>Menerapkan <b>KCL</b> dan <b>KVL</b> serta memakai multimeter dengan benar.</li>
  </ol>
</div>
<p class="hint">Cara belajar: dengarkan narasi tiap slide sampai bilah kemajuan penuh, coba animasinya, lalu jawab cek pemahaman. Latihan terbuka setelah semua slide selesai.</p>`,
      narasi: "Selamat datang di mata kuliah Elektronika Dasar. Ini adalah materi pertama: pengantar elektronika dan dasar rangkaian listrik. Sebelum kita masuk ke dioda, transistor, dan op-amp, kita perlu menguasai bahasa dasarnya dulu. Ada lima hal yang akan Anda kuasai. Pertama, arti elektronika serta beda komponen pasif dan aktif. Kedua, besaran listrik: muatan, arus, tegangan, resistansi, dan daya. Ketiga, hukum Ohm. Keempat, menghitung rangkaian seri, paralel, dan gabungannya. Kelima, hukum Kirchhoff untuk arus dan tegangan, serta cara memakai multimeter. Dengarkan setiap slide sampai bilah kemajuan penuh, coba animasinya, dan jawab cek pemahaman. Setelah semua selesai, latihan soal akan terbuka."
    },
    {
      id: "s02", bab: "Pembuka", judul: "Elektronika ada di sekitar kita",
      html: `
<p class="lead">Hampir setiap alat yang Anda pegang hari ini berisi rangkaian elektronika.</p>
<div class="grid3">
  <div class="card icon-card"><div class="ico">📱</div><h3>Ponsel</h3><p>Prosesor berisi miliaran transistor, kapasitor penyimpan energi sesaat, dan resistor pengatur arus.</p></div>
  <div class="card icon-card"><div class="ico">🔌</div><h3>Pengisi daya</h3><p>Mengubah listrik PLN 220 V AC menjadi 5 V DC dengan trafo/sakelar, dioda, dan kapasitor.</p></div>
  <div class="card icon-card"><div class="ico">💡</div><h3>Lampu LED</h3><p>LED butuh resistor pembatas arus. Tanpa itu, LED langsung rusak.</p></div>
  <div class="card icon-card"><div class="ico">🌡️</div><h3>Sensor</h3><p>Termometer digital, sensor cahaya, dan sensor gerak mengubah besaran fisik menjadi sinyal listrik kecil.</p></div>
  <div class="card icon-card"><div class="ico">🚗</div><h3>Kendaraan</h3><p>Pengapian, injeksi bahan bakar, dan dasbor dikendalikan modul elektronik (ECU).</p></div>
  <div class="card icon-card"><div class="ico">🏥</div><h3>Alat kesehatan</h3><p>EKG, oksimeter, dan tensimeter digital memperkuat sinyal tubuh yang sangat lemah.</p></div>
</div>`,
      narasi: "Coba lihat sekeliling Anda. Ponsel di tangan Anda berisi prosesor dengan miliaran transistor, ditambah kapasitor dan resistor. Pengisi daya mengubah listrik PLN dua ratus dua puluh volt bolak-balik menjadi lima volt searah. Lampu LED membutuhkan resistor pembatas arus, karena tanpa resistor LED akan langsung rusak. Sensor suhu dan cahaya mengubah besaran fisik menjadi sinyal listrik kecil. Kendaraan dikendalikan oleh modul elektronik, dan alat kesehatan seperti EKG memperkuat sinyal tubuh yang sangat lemah. Semua alat ini dibangun dari komponen dan hukum dasar yang sama, yang akan kita pelajari hari ini."
    },
    {
      id: "s03", bab: "Pembuka", judul: "Apa itu elektronika?",
      html: `
<div class="rumus big">Elektronika = ilmu tentang alat listrik <b>arus lemah</b> yang bekerja dengan <b>mengontrol aliran elektron</b>.</div>
<table class="tabel">
  <tr><th></th><th>Listrik arus kuat</th><th>Elektronika (arus lemah)</th></tr>
  <tr><td>Tujuan utama</td><td>Menyalurkan <b>energi</b></td><td>Mengolah <b>sinyal / informasi</b></td></tr>
  <tr><td>Besar arus</td><td>Ampere sampai kiloampere</td><td>Mikroampere sampai miliampere</td></tr>
  <tr><td>Tegangan khas</td><td>220 V – 500 kV</td><td>1,8 V – 24 V</td></tr>
  <tr><td>Contoh</td><td>Pembangkit, trafo gardu, motor pabrik</td><td>Penguat audio, sensor, mikrokontroler</td></tr>
</table>
<div class="card copper"><b>Kata kunci "mengontrol":</b> komponen elektronika dapat membuka, menutup, memperkuat, atau membentuk aliran elektron sesuai sinyal kecil. Kemampuan inilah yang membedakan elektronika dari kabel dan sakelar biasa.</div>`,
      narasi: "Apa itu elektronika? Elektronika adalah ilmu tentang alat listrik arus lemah yang bekerja dengan mengontrol aliran elektron. Bandingkan dengan listrik arus kuat. Listrik arus kuat bertujuan menyalurkan energi, dengan arus dari ampere sampai kiloampere dan tegangan ratusan volt sampai ratusan kilovolt, misalnya pembangkit dan motor pabrik. Elektronika bertujuan mengolah sinyal atau informasi. Arusnya kecil, dari mikroampere sampai miliampere, dan tegangannya biasanya di bawah dua puluh empat volt. Perhatikan kata kunci mengontrol. Komponen elektronika dapat membuka, menutup, dan memperkuat aliran elektron berdasarkan sinyal kecil. Itulah yang membedakannya dari kabel atau sakelar biasa."
    },
    {
      id: "s04", bab: "Pembuka", judul: "Peta perjalanan satu semester",
      html: `
<p class="lead">Materi hari ini adalah fondasi. Semua materi berikutnya memakai hukum Ohm, KCL, dan KVL.</p>
<div class="roadmap">
  <div class="rm now"><span>1</span>Pengantar &amp; dasar rangkaian</div>
  <div class="rm"><span>2</span>Semikonduktor</div>
  <div class="rm"><span>3</span>Dioda</div>
  <div class="rm"><span>4–5</span>Aplikasi dioda</div>
  <div class="rm"><span>6</span>Transistor BJT</div>
  <div class="rm"><span>7</span>Bias &amp; penguat</div>
  <div class="rm uts"><span>8</span>UTS</div>
  <div class="rm"><span>9</span>FET</div>
  <div class="rm"><span>10</span>Thyristor</div>
  <div class="rm"><span>11–12</span>Op-amp</div>
  <div class="rm"><span>13</span>Rangkaian logika</div>
  <div class="rm"><span>14</span>Analog-digital</div>
  <div class="rm"><span>15</span>IC &amp; mikroprosesor</div>
  <div class="rm uts"><span>16</span>UAS</div>
</div>
<p class="hint">Alur tiap materi di aplikasi ini: <b>Materi</b> → <b>Latihan</b> (boleh diulang) → <b>Ujian</b> → materi berikutnya terbuka.</p>`,
      narasi: "Ini peta perjalanan kita selama satu semester. Kita mulai dari dasar rangkaian, lalu semikonduktor, dioda dan aplikasinya, transistor BJT beserta bias dan penguatnya. Setelah UTS, kita lanjut ke FET, thyristor, op-amp, rangkaian logika, rangkaian analog dan digital, sampai IC dan mikroprosesor. Semua materi itu memakai hukum Ohm, KCL, dan KVL yang kita pelajari hari ini. Jadi kuasai materi ini dengan baik. Di aplikasi ini, setiap materi punya alur yang sama: pelajari materinya, kerjakan latihan yang boleh diulang, lalu ikuti ujian. Setelah ujian selesai, materi berikutnya terbuka."
    },

    /* ======================= B. KOMPONEN ======================= */
    {
      id: "s05", bab: "Komponen", judul: "Komponen pasif dan komponen aktif",
      html: `
<div class="grid2">
  <div class="card">
    <h3>Komponen pasif</h3>
    <p>Tidak dapat menguatkan sinyal dan tidak dapat mengendalikan arus dengan sinyal lain. Hanya menghambat, menyimpan, atau menyalurkan energi.</p>
    <ul><li><b>Resistor (R)</b> – menghambat arus</li><li><b>Kapasitor (C)</b> – menyimpan energi di medan listrik</li><li><b>Induktor (L)</b> – menyimpan energi di medan magnet</li><li><b>Transformator</b> – menaikkan/menurunkan tegangan AC</li></ul>
  </div>
  <div class="card copper">
    <h3>Komponen aktif</h3>
    <p>Dapat <b>mengendalikan</b> arus besar dengan sinyal kecil, sehingga bisa menguatkan atau menjadi sakelar. Memerlukan catu daya.</p>
    <ul><li><b>Dioda</b> – katup satu arah (semikonduktor)</li><li><b>Transistor</b> – penguat dan sakelar</li><li><b>IC</b> – ribuan sampai miliaran transistor dalam satu keping</li></ul>
  </div>
</div>
<div class="rumus">Uji cepat: "Bisakah komponen ini membuat sinyal keluaran <b>lebih besar</b> dari sinyal kendalinya?" Jika bisa → aktif.</div>
<p class="hint">Catatan: dioda sering digolongkan aktif karena terbuat dari semikonduktor dan berperilaku tak linear, walaupun tidak menguatkan.</p>`,
      narasi: "Komponen elektronika dibagi menjadi dua kelompok besar. Komponen pasif tidak dapat menguatkan sinyal dan tidak dapat mengendalikan arus dengan sinyal lain. Komponen pasif hanya menghambat, menyimpan, atau menyalurkan energi. Contohnya resistor yang menghambat arus, kapasitor yang menyimpan energi dalam medan listrik, induktor yang menyimpan energi dalam medan magnet, dan transformator yang menaikkan atau menurunkan tegangan bolak-balik. Komponen aktif dapat mengendalikan arus besar dengan sinyal kecil, sehingga bisa menjadi penguat atau sakelar, dan memerlukan catu daya. Contohnya transistor dan IC. Dioda biasanya juga dimasukkan ke kelompok aktif karena terbuat dari semikonduktor. Uji cepatnya: jika komponen dapat membuat sinyal keluaran lebih besar dari sinyal kendalinya, komponen itu aktif."
    },
    {
      id: "s06", bab: "Komponen", judul: "Resistor dan kode warna",
      html: `
<div class="grid2 wide-left">
  <div>
    <p>Resistor membatasi arus dan membagi tegangan. Nilainya dibaca dari <b>gelang warna</b>.</p>
    <div data-anim="kodewarna"></div>
  </div>
  <div class="card">
    <h3>Tabel warna</h3>
    <table class="tabel warna-tabel">
      <tr><td><i style="background:#111"></i>Hitam</td><td>0</td></tr><tr><td><i style="background:#7a4a1f"></i>Cokelat</td><td>1</td></tr>
      <tr><td><i style="background:#d62828"></i>Merah</td><td>2</td></tr><tr><td><i style="background:#f77f00"></i>Oranye</td><td>3</td></tr>
      <tr><td><i style="background:#f6d02f"></i>Kuning</td><td>4</td></tr><tr><td><i style="background:#2a9d4b"></i>Hijau</td><td>5</td></tr>
      <tr><td><i style="background:#1d4ed8"></i>Biru</td><td>6</td></tr><tr><td><i style="background:#7c3aed"></i>Ungu</td><td>7</td></tr>
      <tr><td><i style="background:#888"></i>Abu-abu</td><td>8</td></tr><tr><td><i style="background:#fff;border:1px solid #999"></i>Putih</td><td>9</td></tr>
    </table>
    <p class="small">Gelang 4: emas ±5%, perak ±10%. Jembatan keledai: <b>Hi-Co-Me-O-K-Hi-B-U-A-P</b>.</p>
  </div>
</div>`,
      narasi: "Resistor adalah komponen yang paling sering dipakai. Fungsinya membatasi arus dan membagi tegangan. Nilai resistor dibaca dari gelang warna. Untuk resistor empat gelang, gelang pertama dan kedua adalah angka, gelang ketiga adalah pengali atau jumlah nol, dan gelang keempat adalah toleransi. Urutan warnanya: hitam nol, cokelat satu, merah dua, oranye tiga, kuning empat, hijau lima, biru enam, ungu tujuh, abu-abu delapan, dan putih sembilan. Gelang emas berarti toleransi lima persen. Silakan coba animasinya: klik setiap gelang untuk mengganti warna, lalu perhatikan nilai resistansinya berubah."
    },
    {
      id: "s07", bab: "Komponen", judul: "Contoh: membaca kode warna langkah demi langkah",
      html: `
<div class="grid2">
  <div><div data-anim="resistor-statis" data-a="4" data-b="7" data-m="2"></div></div>
  <div class="card">
    <h3>Resistor: kuning – ungu – merah – emas</h3>
    <ol class="langkah">
      <li>Gelang 1 <b>kuning</b> = angka <b>4</b>.</li>
      <li>Gelang 2 <b>ungu</b> = angka <b>7</b> → digabung menjadi <b>47</b>.</li>
      <li>Gelang 3 <b>merah</b> = pengali 10² = 100 (tambahkan dua nol).</li>
      <li>R = 47 × 100 = <b>4.700 Ω = 4,7 kΩ</b>.</li>
      <li>Gelang 4 <b>emas</b> = ±5% → 5% × 4.700 = 235 Ω.</li>
      <li>Rentang nilai sebenarnya: 4.700 − 235 = <b>4.465 Ω</b> sampai 4.700 + 235 = <b>4.935 Ω</b>.</li>
    </ol>
  </div>
</div>
<div class="card copper small">Tips: pegang resistor dengan gelang emas/perak di sebelah <b>kanan</b>, lalu baca dari kiri.</div>`,
      narasi: "Mari kita baca satu contoh langkah demi langkah. Warnanya kuning, ungu, merah, dan emas. Langkah pertama, gelang kuning berarti angka empat. Langkah kedua, gelang ungu berarti angka tujuh, jadi kita punya empat puluh tujuh. Langkah ketiga, gelang merah adalah pengali sepuluh pangkat dua, atau seratus. Artinya tambahkan dua nol. Jadi resistansinya empat puluh tujuh kali seratus, yaitu empat ribu tujuh ratus ohm, atau empat koma tujuh kiloohm. Langkah terakhir, gelang emas berarti toleransi lima persen. Lima persen dari empat ribu tujuh ratus adalah dua ratus tiga puluh lima ohm. Jadi nilai sebenarnya bisa berada di antara empat ribu empat ratus enam puluh lima sampai empat ribu sembilan ratus tiga puluh lima ohm. Tipsnya, letakkan gelang emas di sebelah kanan, lalu baca dari kiri."
    },
    {
      id: "s08", bab: "Komponen", judul: "Kapasitor: penyimpan muatan",
      html: `
<div class="grid2 wide-left">
  <div><div data-anim="rc"></div></div>
  <div>
    <div class="card">
      <p>Dua pelat konduktor dipisah isolator (dielektrik). Saat diberi tegangan, muatan berkumpul di pelat.</p>
      <div class="rumus">Q = C × V</div>
      <p class="small">Q = muatan (coulomb), C = kapasitansi (farad, F), V = tegangan (volt). Nilai praktis: pF, nF, µF.</p>
    </div>
    <div class="card copper small">
      <b>Contoh:</b> C = 100 µF diisi sampai 9 V.<br>
      Q = 100 × 10⁻⁶ × 9 = 9 × 10⁻⁴ C = <b>900 µC</b>.
    </div>
    <p class="small">Kapasitor <b>elektrolit</b> berpolaritas: kaki panjang (+). Terbalik dapat menggembung atau meletus.</p>
  </div>
</div>`,
      narasi: "Komponen pasif kedua adalah kapasitor. Kapasitor terdiri dari dua pelat konduktor yang dipisahkan oleh isolator. Ketika diberi tegangan, muatan berkumpul di kedua pelat. Hubungannya Q sama dengan C dikali V. Q adalah muatan dalam coulomb, C adalah kapasitansi dalam farad, dan V adalah tegangan. Contohnya, kapasitor seratus mikrofarad diisi sampai sembilan volt. Muatannya seratus kali sepuluh pangkat minus enam dikali sembilan, yaitu sembilan ratus mikrocoulomb. Sekarang perhatikan animasinya. Tekan tombol isi. Tegangan kapasitor naik cepat di awal, lalu melambat, dan mendekati tegangan sumber. Ini terjadi karena makin penuh kapasitornya, makin kecil arus pengisiannya. Hati-hati, kapasitor elektrolit punya kutub positif dan negatif, dan tidak boleh dipasang terbalik."
    },
    {
      id: "s09", bab: "Komponen", judul: "Induktor dan transformator",
      html: `
<div class="grid2">
  <div class="card">
    <h3>Induktor (L)</h3>
    <p>Kawat yang dililit. Arus yang mengalir menimbulkan <b>medan magnet</b>; energi tersimpan di medan itu. Induktor "menolak" perubahan arus yang mendadak.</p>
    <p class="small">Satuan henry (H). Nilai praktis: µH, mH. Dipakai di filter dan catu daya pensaklaran.</p>
  </div>
  <div class="card">
    <h3>Transformator</h3>
    <div data-anim="trafo"></div>
    <div class="rumus">V<sub>s</sub> / V<sub>p</sub> = N<sub>s</sub> / N<sub>p</sub></div>
  </div>
</div>
<div class="card copper">
  <b>Contoh:</b> trafo 220 V dengan N<sub>p</sub> = 1.100 lilitan, N<sub>s</sub> = 60 lilitan.
  <ol class="langkah"><li>V<sub>s</sub> = V<sub>p</sub> × N<sub>s</sub>/N<sub>p</sub></li><li>V<sub>s</sub> = 220 × 60/1.100</li><li>V<sub>s</sub> = 220 × 0,0545 = <b>12 V</b> (trafo penurun tegangan / step-down)</li></ol>
  Trafo hanya bekerja dengan <b>AC</b>, karena butuh medan magnet yang berubah-ubah.
</div>`,
      narasi: "Komponen pasif berikutnya adalah induktor dan transformator. Induktor adalah kawat yang dililit. Ketika dialiri arus, muncul medan magnet, dan energi tersimpan di medan magnet itu. Induktor cenderung menolak perubahan arus yang mendadak. Satuannya henry. Transformator terdiri dari dua kumparan, primer dan sekunder, yang dililitkan pada inti besi. Perbandingan tegangannya sama dengan perbandingan jumlah lilitan. Contohnya, trafo dua ratus dua puluh volt dengan seribu seratus lilitan primer dan enam puluh lilitan sekunder. Tegangan sekunder sama dengan dua ratus dua puluh dikali enam puluh dibagi seribu seratus, hasilnya dua belas volt. Ini disebut trafo penurun tegangan. Ingat, trafo hanya bekerja dengan arus bolak-balik, karena memerlukan medan magnet yang berubah-ubah."
    },
    {
      id: "s10", bab: "Komponen", judul: "Sekilas komponen aktif",
      html: `
<div class="grid3">
  <div class="card icon-card"><div data-anim="simbol" data-k="dioda"></div><h3>Dioda</h3><p>Mengalirkan arus satu arah, seperti katup. Contoh: penyearah di charger, LED. <i>(Materi 3–5)</i></p></div>
  <div class="card icon-card"><div data-anim="simbol" data-k="transistor"></div><h3>Transistor</h3><p>Arus basis kecil mengendalikan arus kolektor besar → penguat dan sakelar. <i>(Materi 6–7, 9)</i></p></div>
  <div class="card icon-card"><div data-anim="simbol" data-k="ic"></div><h3>IC</h3><p>Banyak transistor, resistor, dan kapasitor dalam satu keping silikon: op-amp, gerbang logika, mikroprosesor. <i>(Materi 11–15)</i></p></div>
</div>
<div class="rumus">Contoh penguatan: arus basis 0,1 mA mengendalikan arus kolektor 10 mA → penguatan arus 10 ÷ 0,1 = <b>100 kali</b>.</div>`,
      narasi: "Sekarang sekilas tentang komponen aktif, yang akan kita bahas mendalam di materi-materi berikutnya. Dioda mengalirkan arus hanya ke satu arah, seperti katup. Dioda dipakai sebagai penyearah di pengisi daya, dan LED adalah dioda yang memancarkan cahaya. Transistor memungkinkan arus basis yang kecil mengendalikan arus kolektor yang besar. Misalnya arus basis nol koma satu miliampere mengendalikan arus kolektor sepuluh miliampere, berarti penguatannya seratus kali. Inilah dasar penguat dan sakelar elektronik. IC atau rangkaian terpadu menggabungkan banyak transistor, resistor, dan kapasitor dalam satu keping silikon, misalnya op-amp, gerbang logika, dan mikroprosesor."
    },
    {
      id: "c01", bab: "Komponen", judul: "Cek pemahaman 1",
      html: `<p class="lead">Jawab dengan benar untuk melanjutkan. Jika salah, baca petunjuknya lalu coba lagi.</p>`,
      narasi: "Saatnya cek pemahaman. Jawab pertanyaan berikut dengan benar untuk melanjutkan. Jika jawaban Anda salah, baca petunjuknya, lalu coba lagi.",
      cek: { id: "M01-C01", tipe: "PGK", soal: "Pilih SEMUA komponen pasif.", opsi: "Resistor || Transformator || Kapasitor || Transistor || IC op-amp", jawaban: "A,B,C", pembahasan: "Pasif: tidak dapat mengendalikan arus dengan sinyal lain (R, C, L, trafo). | Transistor dan IC termasuk aktif." }
    },

    /* ======================= C. BESARAN DASAR ======================= */
    {
      id: "s11", bab: "Besaran dasar", judul: "Muatan dan arus listrik",
      html: `
<div class="grid2 wide-left">
  <div><div data-anim="aliran"></div></div>
  <div>
    <div class="card"><p><b>Arus</b> adalah banyaknya muatan yang mengalir per detik.</p>
      <div class="rumus">I = Q / t</div>
      <p class="small">I = arus (ampere, A) · Q = muatan (coulomb, C) · t = waktu (s). Satu elektron bermuatan 1,6 × 10⁻¹⁹ C.</p></div>
    <div class="card copper small"><b>Dua arah yang perlu dibedakan:</b><br>• <b>Arus konvensional</b>: dari + ke − (di luar sumber). Dipakai di semua rumus dan simbol.<br>• <b>Aliran elektron</b>: dari − ke +, kebalikannya.</div>
  </div>
</div>`,
      narasi: "Kita masuk ke besaran dasar. Arus listrik adalah banyaknya muatan yang mengalir setiap detik. Rumusnya I sama dengan Q dibagi t. I adalah arus dalam ampere, Q adalah muatan dalam coulomb, dan t adalah waktu dalam detik. Satu elektron membawa muatan yang sangat kecil, satu koma enam kali sepuluh pangkat minus sembilan belas coulomb. Ada dua arah yang harus dibedakan. Arus konvensional mengalir dari kutub positif ke kutub negatif di luar sumber. Arah inilah yang dipakai di semua rumus dan simbol rangkaian. Elektron sendiri bergerak dari negatif ke positif, kebalikannya. Pada animasi, tekan tombol untuk berganti tampilan antara arus konvensional dan aliran elektron, dan perhatikan arah titik-titiknya."
    },
    {
      id: "s12", bab: "Besaran dasar", judul: "Contoh: menghitung arus dari muatan",
      html: `
<div class="card">
  <h3>Soal</h3>
  <p>Dalam 4 detik, muatan sebesar 0,02 C melewati penampang sebuah kabel LED. Berapa arusnya dalam mA? Berapa elektron yang lewat?</p>
</div>
<div class="grid2">
  <div class="card"><h3>Arus</h3><ol class="langkah">
    <li>Tulis yang diketahui: Q = 0,02 C, t = 4 s.</li>
    <li>Rumus: I = Q / t.</li>
    <li>I = 0,02 / 4 = 0,005 A.</li>
    <li>Ubah ke mA: 0,005 × 1.000 = <b>5 mA</b>.</li></ol></div>
  <div class="card"><h3>Jumlah elektron</h3><ol class="langkah">
    <li>Muatan satu elektron e = 1,6 × 10⁻¹⁹ C.</li>
    <li>n = Q / e = 0,02 / (1,6 × 10⁻¹⁹).</li>
    <li>n = <b>1,25 × 10¹⁷ elektron</b>.</li>
    <li>Arus 5 mA saja sudah melibatkan ratusan ribu triliun elektron!</li></ol></div>
</div>`,
      narasi: "Mari hitung satu contoh. Dalam empat detik, muatan nol koma nol dua coulomb melewati penampang kabel sebuah LED. Berapa arusnya? Langkah pertama, tulis yang diketahui: Q nol koma nol dua coulomb dan t empat detik. Langkah kedua, gunakan rumus I sama dengan Q dibagi t. Langkah ketiga, nol koma nol dua dibagi empat hasilnya nol koma nol nol lima ampere. Langkah keempat, ubah ke miliampere dengan mengalikan seribu, jadi lima miliampere. Berapa elektron yang lewat? Bagi muatan dengan muatan satu elektron: nol koma nol dua dibagi satu koma enam kali sepuluh pangkat minus sembilan belas. Hasilnya satu koma dua lima kali sepuluh pangkat tujuh belas elektron. Arus lima miliampere saja sudah melibatkan jumlah elektron yang luar biasa banyak."
    },
    {
      id: "s13", bab: "Besaran dasar", judul: "Tegangan: dorongan bagi muatan",
      html: `
<div class="grid2 wide-left">
  <div><div data-anim="air"></div></div>
  <div class="card">
    <p><b>Tegangan</b> (beda potensial) adalah energi per satuan muatan yang mendorong muatan mengalir.</p>
    <div class="rumus">V = W / Q</div>
    <p class="small">V = tegangan (volt, V) · W = energi (joule) · Q = muatan (coulomb). 1 V = 1 J/C.</p>
    <table class="tabel small"><tr><th>Analogi air</th><th>Listrik</th></tr>
      <tr><td>Beda tinggi permukaan air</td><td>Tegangan (V)</td></tr>
      <tr><td>Debit air (L/detik)</td><td>Arus (I)</td></tr>
      <tr><td>Pipa yang menyempit</td><td>Resistansi (R)</td></tr></table>
  </div>
</div>
<p class="hint">Tegangan selalu diukur <b>antara dua titik</b>. "Tegangan di titik A" sebenarnya berarti tegangan A terhadap ground (0 V).</p>`,
      narasi: "Tegangan, atau beda potensial, adalah energi per satuan muatan yang mendorong muatan untuk mengalir. Rumusnya V sama dengan W dibagi Q. Satu volt berarti satu joule energi untuk setiap satu coulomb muatan. Agar mudah dibayangkan, pakai analogi air. Beda tinggi permukaan air di dua tangki sama dengan tegangan. Debit air sama dengan arus. Pipa yang menyempit sama dengan resistansi. Pada animasi, geser beda tinggi airnya. Makin besar beda tinggi, makin deras aliran airnya. Begitu juga di listrik: makin besar tegangan, makin besar arus. Ingat, tegangan selalu diukur di antara dua titik. Jika disebut tegangan di titik A, artinya tegangan titik A terhadap ground atau nol volt."
    },
    {
      id: "s14", bab: "Besaran dasar", judul: "Resistansi: hambatan terhadap arus",
      html: `
<div class="grid2">
  <div class="card">
    <p><b>Resistansi</b> adalah sifat bahan yang menghambat aliran arus. Satuannya ohm (Ω).</p>
    <div class="rumus">R = ρ × L / A</div>
    <p class="small">ρ = resistivitas bahan (Ω·m) · L = panjang (m) · A = luas penampang (m²).</p>
    <ul class="small"><li>Kawat makin <b>panjang</b> → R makin besar.</li><li>Kawat makin <b>tebal</b> → R makin kecil.</li><li>Tembaga ρ = 1,68 × 10⁻⁸ Ω·m (konduktor baik).</li></ul>
  </div>
  <div class="card copper">
    <h3>Contoh</h3>
    <p>Kabel tembaga 50 m, luas penampang 1,5 mm².</p>
    <ol class="langkah">
      <li>Ubah satuan luas: 1,5 mm² = 1,5 × 10⁻⁶ m².</li>
      <li>R = 1,68 × 10⁻⁸ × 50 / (1,5 × 10⁻⁶).</li>
      <li>R = 8,4 × 10⁻⁷ / 1,5 × 10⁻⁶.</li>
      <li>R = <b>0,56 Ω</b>.</li>
    </ol>
    <p class="small">Itu sebabnya kabel panjang ke alat berdaya besar dibuat lebih tebal.</p>
  </div>
</div>`,
      narasi: "Resistansi adalah sifat bahan yang menghambat aliran arus, dengan satuan ohm. Untuk sebuah kawat, R sama dengan rho kali L dibagi A. Rho adalah resistivitas bahan, L adalah panjang, dan A adalah luas penampang. Artinya, kawat yang makin panjang punya resistansi makin besar, dan kawat yang makin tebal punya resistansi makin kecil. Contohnya kabel tembaga sepanjang lima puluh meter dengan luas penampang satu koma lima milimeter persegi. Langkah pertama, ubah luas penampang ke meter persegi: satu koma lima kali sepuluh pangkat minus enam. Langkah kedua, masukkan ke rumus: satu koma enam delapan kali sepuluh pangkat minus delapan, dikali lima puluh, dibagi satu koma lima kali sepuluh pangkat minus enam. Hasilnya nol koma lima enam ohm. Inilah alasan kabel panjang untuk alat berdaya besar dibuat lebih tebal."
    },
    {
      id: "s15", bab: "Besaran dasar", judul: "Satuan dan awalan",
      html: `
<div class="grid2">
  <table class="tabel">
    <tr><th>Awalan</th><th>Simbol</th><th>Nilai</th><th>Contoh</th></tr>
    <tr><td>mega</td><td>M</td><td>10⁶</td><td>1 MΩ = 1.000.000 Ω</td></tr>
    <tr><td>kilo</td><td>k</td><td>10³</td><td>4,7 kΩ = 4.700 Ω</td></tr>
    <tr><td>—</td><td></td><td>10⁰</td><td>1 V</td></tr>
    <tr><td>mili</td><td>m</td><td>10⁻³</td><td>20 mA = 0,02 A</td></tr>
    <tr><td>mikro</td><td>µ</td><td>10⁻⁶</td><td>100 µF = 0,0001 F</td></tr>
    <tr><td>nano</td><td>n</td><td>10⁻⁹</td><td>10 nF</td></tr>
    <tr><td>piko</td><td>p</td><td>10⁻¹²</td><td>22 pF</td></tr>
  </table>
  <div class="card copper">
    <h3>Cara konversi</h3>
    <ol class="langkah">
      <li>Ke satuan lebih <b>kecil</b> (A → mA): kalikan 1.000. Contoh 0,035 A × 1.000 = 35 mA.</li>
      <li>Ke satuan lebih <b>besar</b> (Ω → kΩ): bagi 1.000. Contoh 2.200 Ω ÷ 1.000 = 2,2 kΩ.</li>
      <li>Trik hukum Ohm: <b>mA × kΩ = V</b> dan <b>V ÷ kΩ = mA</b>.</li>
    </ol>
    <p class="small">Huruf besar-kecil penting: <b>m</b> (mili) ≠ <b>M</b> (mega).</p>
  </div>
</div>`,
      narasi: "Di elektronika kita sering bertemu angka yang sangat besar atau sangat kecil, jadi kita memakai awalan satuan. Mega artinya sejuta, kilo artinya seribu, mili artinya seperseribu, mikro artinya sepersejuta, nano sepersemiliar, dan piko sepersetriliun. Cara konversinya mudah. Jika pindah ke satuan yang lebih kecil, misalnya dari ampere ke miliampere, kalikan seribu. Nol koma nol tiga lima ampere menjadi tiga puluh lima miliampere. Jika pindah ke satuan yang lebih besar, misalnya dari ohm ke kiloohm, bagi seribu. Dua ribu dua ratus ohm menjadi dua koma dua kiloohm. Ada trik praktis: miliampere dikali kiloohm langsung menghasilkan volt. Hati-hati juga dengan huruf besar dan kecil. M kecil berarti mili, M besar berarti mega."
    },
    {
      id: "c02", bab: "Besaran dasar", judul: "Cek pemahaman 2",
      html: `<p class="lead">Hitung lalu ketik jawaban dalam angka. Boleh memakai koma atau titik desimal.</p>`,
      narasi: "Cek pemahaman kedua. Hitung, lalu ketik jawaban Anda dalam bentuk angka. Anda boleh memakai koma atau titik sebagai tanda desimal.",
      cek: { id: "M01-C02", tipe: "HIT", soal: "Muatan {Q} C mengalir dalam {t} s. Berapa arusnya dalam mA?", variabel: "Q=0.01:0.09:0.01; t=2,4,5", jawaban: "Q/t*1000", satuan: "mA", toleransi: "1", pembahasan: "I = Q / t = {Q} / {t} = {=Q/t:4} A. | Ubah ke mA: × 1.000 = {=Q/t*1000:2} mA." }
    },

    /* ======================= D. HUKUM OHM ======================= */
    {
      id: "s16", bab: "Hukum Ohm", judul: "Hukum Ohm",
      html: `
<div class="grid2 wide-left">
  <div><div data-anim="ohm"></div></div>
  <div>
    <div class="rumus big">V = I × R</div>
    <div class="card small">
      <p>Arus yang mengalir pada resistor <b>sebanding</b> dengan tegangannya dan <b>berbanding terbalik</b> dengan resistansinya.</p>
      <div class="segitiga"><div class="tri"><span class="v">V</span><span class="i">I</span><span class="r">R</span></div>
      <ul><li>Cari V: tutup V → I × R</li><li>Cari I: tutup I → V / R</li><li>Cari R: tutup R → V / I</li></ul></div>
    </div>
  </div>
</div>`,
      narasi: "Inilah hukum paling penting di elektronika: hukum Ohm. V sama dengan I dikali R. Artinya, arus pada resistor sebanding dengan tegangannya, dan berbanding terbalik dengan resistansinya. Gunakan segitiga V I R untuk mengingatnya. Tutup huruf yang dicari. Untuk mencari V, tutup V, tersisa I kali R. Untuk mencari I, tutup I, tersisa V dibagi R. Untuk mencari R, tutup R, tersisa V dibagi I. Sekarang coba animasinya. Geser tegangan dan resistansi, lalu perhatikan amperemeter dan kecepatan aliran muatan. Coba naikkan tegangan dua kali lipat, maka arus juga naik dua kali lipat. Coba naikkan resistansi dua kali lipat, maka arus turun menjadi setengahnya."
    },
    {
      id: "s17", bab: "Hukum Ohm", judul: "Contoh hukum Ohm: tiga jenis soal",
      html: `
<div class="grid3">
  <div class="card"><h3>1 · Mencari I</h3><p class="small">Sumber 12 V, R = 470 Ω.</p><ol class="langkah">
    <li>I = V / R</li><li>I = 12 / 470</li><li>I = 0,0255 A</li><li>I = <b>25,5 mA</b></li></ol></div>
  <div class="card"><h3>2 · Mencari V</h3><p class="small">I = 15 mA melalui R = 2,2 kΩ.</p><ol class="langkah">
    <li>V = I × R</li><li>Ubah satuan: 0,015 A × 2.200 Ω</li><li>V = <b>33 V</b></li><li>Cek trik: 15 mA × 2,2 kΩ = 33 V ✓</li></ol></div>
  <div class="card"><h3>3 · Mencari R</h3><p class="small">LED pada 9 V, arus diinginkan 20 mA (abaikan tegangan LED).</p><ol class="langkah">
    <li>R = V / I</li><li>R = 9 / 0,020</li><li>R = <b>450 Ω</b></li><li>Pilih nilai standar terdekat di atasnya: 470 Ω</li></ol></div>
</div>
<p class="hint">Kebiasaan baik: tulis diketahui → rumus → substitusi dengan satuan dasar (V, A, Ω) → hasil + satuan.</p>`,
      narasi: "Ada tiga jenis soal hukum Ohm. Pertama, mencari arus. Sumber dua belas volt dan resistor empat ratus tujuh puluh ohm. I sama dengan V dibagi R, dua belas dibagi empat ratus tujuh puluh, hasilnya nol koma nol dua lima lima ampere, atau dua puluh lima koma lima miliampere. Kedua, mencari tegangan. Arus lima belas miliampere melalui dua koma dua kiloohm. Ubah dulu ke satuan dasar: nol koma nol satu lima ampere dikali dua ribu dua ratus ohm, hasilnya tiga puluh tiga volt. Dengan trik miliampere kali kiloohm, hasilnya juga tiga puluh tiga volt. Ketiga, mencari resistansi. LED pada sembilan volt dengan arus dua puluh miliampere. R sama dengan sembilan dibagi nol koma nol dua, hasilnya empat ratus lima puluh ohm. Karena nilai itu tidak dijual, pilih nilai standar di atasnya, yaitu empat ratus tujuh puluh ohm. Biasakan menulis: diketahui, rumus, substitusi, lalu hasil dengan satuannya."
    },
    {
      id: "s18", bab: "Hukum Ohm", judul: "Daya listrik",
      html: `
<div class="grid2">
  <div class="card">
    <p><b>Daya</b> adalah energi yang dipakai per detik. Pada resistor, daya berubah menjadi panas.</p>
    <div class="rumus">P = V × I = I² × R = V² / R</div>
    <p class="small">P dalam watt (W). Ketiga rumus setara; pilih yang besarannya diketahui.</p>
    <p class="small"><b>Rating daya</b> resistor umum: 1/8 W, 1/4 W, 1/2 W, 1 W, 2 W, 5 W. Pilih rating minimal <b>2×</b> daya hitungan.</p>
  </div>
  <div class="card copper">
    <h3>Contoh</h3>
    <p class="small">Resistor 100 Ω pada 9 V. Cukupkah resistor 1/4 W?</p>
    <ol class="langkah">
      <li>P = V² / R = 9² / 100.</li>
      <li>P = 81 / 100 = 0,81 W.</li>
      <li>Bandingkan: 0,81 W &gt; 0,25 W → resistor 1/4 W akan terbakar.</li>
      <li>Rating aman (2×): ≥ 1,62 W → pilih <b>2 W</b>.</li>
      <li>Cek dengan rumus lain: I = 9/100 = 0,09 A; P = V × I = 9 × 0,09 = 0,81 W ✓</li>
    </ol>
  </div>
</div>`,
      narasi: "Daya adalah energi yang dipakai setiap detik. Pada resistor, daya berubah menjadi panas. Ada tiga rumus yang setara: P sama dengan V kali I, P sama dengan I kuadrat kali R, dan P sama dengan V kuadrat dibagi R. Pilih rumus yang besarannya sudah diketahui. Resistor dijual dengan rating daya tertentu, misalnya seperdelapan watt, seperempat watt, setengah watt, satu watt, dan dua watt. Contohnya, resistor seratus ohm dipasang pada sembilan volt. Daya sama dengan sembilan kuadrat dibagi seratus, yaitu delapan puluh satu dibagi seratus, nol koma delapan satu watt. Itu jauh lebih besar dari seperempat watt, jadi resistor seperempat watt akan terbakar. Agar aman, pilih rating minimal dua kali daya hitungan, yaitu satu koma enam dua watt, jadi pilih resistor dua watt. Kita bisa mengecek dengan rumus lain: arusnya nol koma nol sembilan ampere, dikali sembilan volt, hasilnya tetap nol koma delapan satu watt."
    },
    {
      id: "c03", bab: "Hukum Ohm", judul: "Cek pemahaman 3",
      html: `<p class="lead">Terapkan hukum Ohm. Perhatikan satuan yang diminta.</p>`,
      narasi: "Cek pemahaman ketiga. Terapkan hukum Ohm, dan perhatikan satuan yang diminta.",
      cek: { id: "M01-C03", tipe: "HIT", soal: "Resistor {R} Ω dipasang pada sumber {V} V. Berapa arusnya (mA)?", variabel: "V=5:15:1; R=220,330,470,680,1000", jawaban: "V/R*1000", satuan: "mA", toleransi: "2", visual: "ohm(V=V,R=R)", pembahasan: "I = V / R = {V} / {R}. | I = {=V/R:4} A = {=V/R*1000:2} mA." }
    },

    /* ======================= E. SERI & PARALEL ======================= */
    {
      id: "s19", bab: "Seri & paralel", judul: "Rangkaian seri",
      html: `
<div class="grid2 wide-left">
  <div><div data-anim="seri"></div></div>
  <div class="card">
    <p>Komponen disambung <b>berurutan</b>, sehingga hanya ada <b>satu lintasan</b> arus.</p>
    <ul>
      <li>Arus <b>sama</b> di semua komponen.</li>
      <li>R<sub>total</sub> = R<sub>1</sub> + R<sub>2</sub> + … (selalu lebih besar dari yang terbesar).</li>
      <li>Tegangan <b>terbagi</b>: V<sub>s</sub> = V<sub>1</sub> + V<sub>2</sub> + …</li>
      <li>Resistor <b>terbesar</b> mendapat tegangan <b>terbesar</b> (V = I × R).</li>
      <li>Satu komponen putus → seluruh rangkaian mati.</li>
    </ul>
    <div class="rumus">Pembagi tegangan: V<sub>2</sub> = V<sub>s</sub> × R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)</div>
  </div>
</div>`,
      narasi: "Sekarang kita gabungkan beberapa resistor. Pada rangkaian seri, komponen disambung berurutan sehingga hanya ada satu lintasan arus. Akibatnya, arus di semua komponen sama besar. Resistansi totalnya adalah jumlah semua resistor, dan selalu lebih besar dari resistor terbesar. Tegangan sumber terbagi ke setiap resistor, dan jumlahnya sama dengan tegangan sumber. Karena V sama dengan I kali R dan arusnya sama, resistor terbesar mendapat tegangan terbesar. Jika satu komponen putus, lintasan terbuka dan seluruh rangkaian mati. Dari sini lahir rumus pembagi tegangan: V dua sama dengan V sumber dikali R dua dibagi R satu ditambah R dua. Pada animasi, ubah nilai R satu dan R dua, lalu perhatikan tegangan di setiap resistor."
    },
    {
      id: "s20", bab: "Seri & paralel", judul: "Contoh rangkaian seri dan pembagi tegangan",
      html: `
<div class="grid2">
  <div><div data-anim="gambar" data-v="seri2(Vs=12,R1=1000,R2=2000)"></div></div>
  <div class="card">
    <h3>V<sub>s</sub> = 12 V, R<sub>1</sub> = 1 kΩ, R<sub>2</sub> = 2 kΩ</h3>
    <ol class="langkah">
      <li>R<sub>total</sub> = 1 kΩ + 2 kΩ = 3 kΩ.</li>
      <li>I = V<sub>s</sub> / R<sub>total</sub> = 12 V / 3 kΩ = <b>4 mA</b>.</li>
      <li>V<sub>1</sub> = I × R<sub>1</sub> = 4 mA × 1 kΩ = <b>4 V</b>.</li>
      <li>V<sub>2</sub> = I × R<sub>2</sub> = 4 mA × 2 kΩ = <b>8 V</b>.</li>
      <li>Cek dengan pembagi tegangan: V<sub>2</sub> = 12 × 2/(1+2) = 8 V ✓</li>
      <li>Cek KVL: 4 V + 8 V = 12 V = V<sub>s</sub> ✓</li>
    </ol>
  </div>
</div>`,
      narasi: "Contoh rangkaian seri. Sumber dua belas volt, R satu satu kiloohm, dan R dua dua kiloohm. Langkah pertama, hitung resistansi total: satu ditambah dua sama dengan tiga kiloohm. Langkah kedua, arus sama dengan dua belas volt dibagi tiga kiloohm, yaitu empat miliampere. Langkah ketiga, tegangan R satu sama dengan empat miliampere dikali satu kiloohm, yaitu empat volt. Langkah keempat, tegangan R dua sama dengan empat miliampere dikali dua kiloohm, yaitu delapan volt. Kita cek dengan rumus pembagi tegangan: dua belas dikali dua per tiga, hasilnya delapan volt, cocok. Terakhir, cek dengan KVL: empat volt ditambah delapan volt sama dengan dua belas volt, sama dengan tegangan sumber. Selalu biasakan mengecek hasil seperti ini."
    },
    {
      id: "s21", bab: "Seri & paralel", judul: "Rangkaian paralel",
      html: `
<div class="grid2 wide-left">
  <div><div data-anim="paralel"></div></div>
  <div class="card">
    <p>Semua komponen terhubung pada <b>dua titik yang sama</b>, sehingga ada <b>beberapa lintasan</b> arus.</p>
    <ul>
      <li>Tegangan <b>sama</b> di semua cabang.</li>
      <li>Arus <b>terbagi</b>: I<sub>t</sub> = I<sub>1</sub> + I<sub>2</sub> + …</li>
      <li>1/R<sub>p</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub> + … (selalu <b>lebih kecil</b> dari yang terkecil).</li>
      <li>Dua resistor: R<sub>p</sub> = R<sub>1</sub>R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>).</li>
      <li>Resistor <b>terkecil</b> dilalui arus <b>terbesar</b>.</li>
    </ul>
    <div class="rumus">Pembagi arus: I<sub>1</sub> = I<sub>t</sub> × R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>)</div>
  </div>
</div>`,
      narasi: "Pada rangkaian paralel, semua komponen terhubung pada dua titik yang sama, sehingga ada beberapa lintasan arus. Semua cabang mendapat tegangan yang sama. Arus total terbagi ke setiap cabang, dan jumlah arus cabang sama dengan arus total. Resistansi totalnya dihitung dengan satu per R total sama dengan satu per R satu ditambah satu per R dua, dan hasilnya selalu lebih kecil dari resistor terkecil. Untuk dua resistor, ada rumus singkat: R satu kali R dua dibagi R satu ditambah R dua. Resistor terkecil dilalui arus terbesar. Rumus pembagi arus: I satu sama dengan I total dikali R dua dibagi jumlah keduanya. Perhatikan, pembilangnya adalah resistor yang berlawanan. Coba animasinya: tambahkan cabang dan lihat resistansi total turun dan arus total naik."
    },
    {
      id: "s22", bab: "Seri & paralel", judul: "Contoh rangkaian paralel dan pembagi arus",
      html: `
<div class="grid2">
  <div><div data-anim="gambar" data-v="paralel2(R1=300,R2=600,It=30,Vs=6)"></div></div>
  <div class="card">
    <h3>V<sub>s</sub> = 6 V, R<sub>1</sub> = 300 Ω, R<sub>2</sub> = 600 Ω</h3>
    <ol class="langkah">
      <li>R<sub>p</sub> = (300 × 600) / (300 + 600) = 180.000 / 900 = <b>200 Ω</b>.</li>
      <li>I<sub>t</sub> = 6 V / 200 Ω = 0,03 A = <b>30 mA</b>.</li>
      <li>I<sub>1</sub> = 6 / 300 = <b>20 mA</b>; I<sub>2</sub> = 6 / 600 = <b>10 mA</b>.</li>
      <li>Cek pembagi arus: I<sub>1</sub> = 30 × 600/(300+600) = 20 mA ✓</li>
      <li>Cek KCL: 20 + 10 = 30 mA = I<sub>t</sub> ✓</li>
      <li>R<sub>p</sub> = 200 Ω &lt; 300 Ω (resistor terkecil) ✓</li>
    </ol>
  </div>
</div>`,
      narasi: "Contoh rangkaian paralel. Sumber enam volt, R satu tiga ratus ohm, dan R dua enam ratus ohm. Langkah pertama, resistansi paralel sama dengan tiga ratus kali enam ratus dibagi tiga ratus ditambah enam ratus. Seratus delapan puluh ribu dibagi sembilan ratus, hasilnya dua ratus ohm. Langkah kedua, arus total sama dengan enam volt dibagi dua ratus ohm, yaitu tiga puluh miliampere. Langkah ketiga, karena tegangannya sama, arus R satu sama dengan enam dibagi tiga ratus, yaitu dua puluh miliampere, dan arus R dua sama dengan enam dibagi enam ratus, yaitu sepuluh miliampere. Cek dengan pembagi arus: tiga puluh dikali enam ratus per sembilan ratus, hasilnya dua puluh miliampere, cocok. Cek dengan KCL: dua puluh ditambah sepuluh sama dengan tiga puluh. Dan dua ratus ohm memang lebih kecil dari resistor terkecil."
    },
    {
      id: "c04", bab: "Seri & paralel", judul: "Cek pemahaman 4",
      html: `<p class="lead">Pilih semua pernyataan yang benar.</p>`,
      narasi: "Cek pemahaman keempat. Pilih semua pernyataan yang benar. Ingat, bisa lebih dari satu.",
      cek: { id: "M01-C04", tipe: "PGK", soal: "Pilih SEMUA pernyataan yang benar.", opsi: "Pada rangkaian seri, arus di setiap resistor sama || Pada rangkaian paralel, tegangan di setiap cabang sama || Resistansi paralel selalu lebih kecil dari resistor terkecil || Pada rangkaian seri, resistor terkecil mendapat tegangan terbesar || Menambah cabang paralel menaikkan resistansi total", jawaban: "A,B,C", pembahasan: "Seri: I sama, resistor TERBESAR mendapat tegangan terbesar. | Paralel: V sama, Rp < R terkecil, dan menambah cabang MENURUNKAN Rp." }
    },

    /* ======================= F. KIRCHHOFF ======================= */
    {
      id: "s23", bab: "Hukum Kirchhoff", judul: "Hukum Arus Kirchhoff (KCL)",
      html: `
<div class="grid2 wide-left">
  <div><div data-anim="kcl"></div></div>
  <div class="card">
    <div class="rumus big">Σ I<sub>masuk</sub> = Σ I<sub>keluar</sub></div>
    <p>Pada setiap titik cabang (node), muatan tidak menumpuk dan tidak hilang.</p>
    <p class="small">Analogi: simpang pipa air. Air yang masuk per detik sama dengan air yang keluar per detik.</p>
    <div class="card copper small"><b>Contoh:</b> I<sub>1</sub> = 10 mA masuk; I<sub>2</sub> = 4 mA keluar; I<sub>3</sub> keluar = ?<br>10 = 4 + I<sub>3</sub> → I<sub>3</sub> = <b>6 mA</b>.</div>
  </div>
</div>`,
      narasi: "Hukum Kirchhoff yang pertama adalah hukum arus, atau KCL. Jumlah arus yang masuk ke sebuah titik cabang sama dengan jumlah arus yang keluar. Alasannya, muatan tidak bisa menumpuk dan tidak bisa hilang di titik itu. Bayangkan simpang pipa air: air yang masuk setiap detik sama dengan air yang keluar setiap detik. Contohnya, arus sepuluh miliampere masuk ke titik cabang, dan empat miliampere keluar melalui satu cabang. Berapa arus di cabang lainnya? Sepuluh sama dengan empat ditambah I tiga, jadi I tiga sama dengan enam miliampere. Pada animasi, geser arus yang masuk dan pembagiannya, lalu perhatikan bahwa jumlah arus keluar selalu sama dengan arus masuk."
    },
    {
      id: "s24", bab: "Hukum Kirchhoff", judul: "Hukum Tegangan Kirchhoff (KVL)",
      html: `
<div class="grid2 wide-left">
  <div><div data-anim="kvl"></div></div>
  <div class="card">
    <div class="rumus big">Σ V dalam satu loop = 0</div>
    <p>Berjalan mengelilingi lintasan tertutup dan kembali ke titik awal berarti kembali ke potensial yang sama.</p>
    <p class="small">Cara praktis: <b>kenaikan tegangan (sumber) = jumlah penurunan tegangan (beban)</b>.</p>
    <div class="card copper small"><b>Contoh:</b> sumber 12 V, V<sub>1</sub> = 3 V, V<sub>2</sub> = 5 V, V<sub>3</sub> = ?<br>12 − 3 − 5 − V<sub>3</sub> = 0 → V<sub>3</sub> = <b>4 V</b>.</div>
  </div>
</div>`,
      narasi: "Hukum Kirchhoff yang kedua adalah hukum tegangan, atau KVL. Jumlah semua tegangan dalam satu lintasan tertutup sama dengan nol. Bayangkan Anda mendaki dan menuruni bukit lalu kembali ke titik awal. Total naik sama dengan total turun. Di rangkaian, kenaikan tegangan dari sumber sama dengan jumlah penurunan tegangan di semua beban. Contohnya, sumber dua belas volt, tegangan R satu tiga volt, dan tegangan R dua lima volt. Dua belas dikurangi tiga dikurangi lima dikurangi V tiga sama dengan nol, jadi V tiga sama dengan empat volt. Pada animasi, perhatikan titik yang berjalan mengelilingi loop. Grafik di bawahnya menunjukkan potensial naik di sumber, lalu turun di setiap resistor, sampai kembali ke nol."
    },
    {
      id: "s25", bab: "Hukum Kirchhoff", judul: "Contoh gabungan seri-paralel",
      html: `
<div class="grid2">
  <div><div data-anim="gambar" data-v="campur(Vs=12,R1=100,R2=300,R3=600)"></div></div>
  <div class="card">
    <h3>V<sub>s</sub> = 12 V, R<sub>1</sub> = 100 Ω seri dengan (R<sub>2</sub> = 300 Ω ∥ R<sub>3</sub> = 600 Ω)</h3>
    <ol class="langkah">
      <li>Sederhanakan paralel: R<sub>23</sub> = 300 × 600 / 900 = <b>200 Ω</b>.</li>
      <li>Seri: R<sub>t</sub> = 100 + 200 = <b>300 Ω</b>.</li>
      <li>Arus total: I<sub>t</sub> = 12 / 300 = <b>40 mA</b>.</li>
      <li>V<sub>1</sub> = 40 mA × 100 Ω = <b>4 V</b>; V<sub>23</sub> = 40 mA × 200 Ω = <b>8 V</b>.</li>
      <li>I<sub>2</sub> = 8 / 300 = <b>26,7 mA</b>; I<sub>3</sub> = 8 / 600 = <b>13,3 mA</b>.</li>
      <li>Cek KVL: 4 + 8 = 12 V ✓ · Cek KCL: 26,7 + 13,3 = 40 mA ✓</li>
    </ol>
  </div>
</div>
<p class="hint">Strategi umum: sederhanakan dari bagian terjauh dari sumber → hitung arus total → "buka kembali" rangkaian untuk mencari tegangan dan arus tiap komponen.</p>`,
      narasi: "Sekarang gabungkan semuanya. Sumber dua belas volt, R satu seratus ohm diseri dengan R dua tiga ratus ohm yang diparalel dengan R tiga enam ratus ohm. Langkah pertama, sederhanakan bagian paralel: tiga ratus kali enam ratus dibagi sembilan ratus, hasilnya dua ratus ohm. Langkah kedua, resistansi total seri: seratus ditambah dua ratus sama dengan tiga ratus ohm. Langkah ketiga, arus total: dua belas dibagi tiga ratus sama dengan empat puluh miliampere. Langkah keempat, tegangan R satu sama dengan empat puluh miliampere dikali seratus ohm, yaitu empat volt, dan tegangan bagian paralel sama dengan delapan volt. Langkah kelima, arus R dua sama dengan delapan dibagi tiga ratus, sekitar dua puluh enam koma tujuh miliampere, dan arus R tiga sama dengan delapan dibagi enam ratus, sekitar tiga belas koma tiga miliampere. Terakhir, cek KVL: empat ditambah delapan sama dengan dua belas volt. Cek KCL: dua puluh enam koma tujuh ditambah tiga belas koma tiga sama dengan empat puluh miliampere. Strateginya: sederhanakan, hitung arus total, lalu buka kembali rangkaiannya."
    },
    {
      id: "c05", bab: "Hukum Kirchhoff", judul: "Cek pemahaman 5",
      html: `<p class="lead">Gunakan KVL.</p>`,
      narasi: "Cek pemahaman kelima. Gunakan hukum tegangan Kirchhoff.",
      cek: { id: "M01-C05", tipe: "HIT", soal: "Loop pada gambar: sumber {Vs} V, V1 = {V1} V, V2 = {V2} V. Berapa V3 (V)?", variabel: "Vs=9,12,15,24; V1=1:6:0.5; V2=1:6:0.5", syarat: "Vs-V1-V2>=0.5", jawaban: "Vs-V1-V2", satuan: "V", toleransi: "1", visual: "kvl(Vs=Vs,V1=V1,V2=V2)", pembahasan: "KVL: Vs = V1 + V2 + V3. | V3 = {Vs} − {V1} − {V2} = {=Vs-V1-V2:2} V." }
    },

    /* ======================= G. PENUTUP ======================= */
    {
      id: "s26", bab: "Praktik", judul: "Memakai multimeter dengan benar",
      html: `
<div class="grid2 wide-left">
  <div><div data-anim="multimeter"></div></div>
  <div class="card">
    <table class="tabel small">
      <tr><th>Mengukur</th><th>Mode</th><th>Pemasangan</th></tr>
      <tr><td>Tegangan</td><td>V⎓ / V~</td><td><b>Paralel</b> dengan komponen</td></tr>
      <tr><td>Arus</td><td>A / mA</td><td><b>Seri</b> (rangkaian diputus)</td></tr>
      <tr><td>Resistansi</td><td>Ω</td><td>Rangkaian <b>tanpa tegangan</b>, komponen dilepas</td></tr>
    </table>
    <ul class="small">
      <li>Mulai dari rentang <b>terbesar</b>, lalu turunkan.</li>
      <li>Probe hitam selalu di <b>COM</b>. Untuk arus, probe merah pindah ke lubang <b>A/mA</b>.</li>
      <li>Setelah mengukur arus, kembalikan probe merah ke lubang <b>V/Ω</b>.</li>
    </ul>
  </div>
</div>`,
      narasi: "Teori harus bisa dibuktikan dengan pengukuran, jadi mari belajar memakai multimeter. Untuk mengukur tegangan, pilih mode volt dan pasang probe paralel dengan komponen. Untuk mengukur arus, pilih mode ampere atau miliampere, putus rangkaiannya, lalu pasang multimeter secara seri, sehingga arus mengalir melewati meter. Untuk mengukur resistansi, pilih mode ohm, dan pastikan rangkaian tidak bertegangan. Sebaiknya lepas komponennya dulu. Selalu mulai dari rentang terbesar. Probe hitam selalu di lubang COM. Ketika mengukur arus, probe merah dipindah ke lubang A atau miliampere, dan setelah selesai, kembalikan ke lubang volt ohm. Pada animasi, pilih mode dan posisi pemasangan, lalu lihat apakah pengukuran Anda benar atau berbahaya."
    },
    {
      id: "s27", bab: "Praktik", judul: "Keselamatan kerja di laboratorium elektronika",
      html: `
<div class="grid2">
  <div class="card">
    <h3>Sebelum &amp; saat merangkai</h3>
    <ul>
      <li>Rangkai dan ubah rangkaian hanya saat catu daya <b>mati</b>.</li>
      <li>Cek polaritas kapasitor elektrolit, dioda, dan sumber.</li>
      <li>Atur batas arus catu daya laboratorium (current limit) sebelum menyalakan.</li>
      <li>Jangan menyentuh komponen yang baru dipakai: resistor dapat sangat panas.</li>
    </ul>
  </div>
  <div class="card copper">
    <h3>Tanda bahaya → matikan sumber</h3>
    <ul>
      <li>Bau hangus, asap, atau komponen menggembung.</li>
      <li>Arus terbaca jauh lebih besar dari hitungan (hubung singkat).</li>
      <li>Kabel/probe terkelupas.</li>
    </ul>
    <p class="small">Tegangan PLN 220 V dapat mematikan. Praktikum Elektronika Dasar memakai tegangan rendah (≤ 24 V) kecuali dinyatakan lain oleh asisten/dosen.</p>
  </div>
</div>
<div class="rumus">Hitung dulu, ukur kemudian: perkiraan hasil hitungan membantu Anda segera mengenali pengukuran yang tidak wajar.</div>`,
      narasi: "Sebelum praktikum, kita bahas keselamatan kerja. Rangkai dan ubah rangkaian hanya ketika catu daya mati. Periksa polaritas kapasitor elektrolit, dioda, dan sumber. Atur batas arus pada catu daya laboratorium sebelum menyalakannya. Jangan langsung menyentuh resistor yang baru dipakai, karena bisa sangat panas. Segera matikan sumber jika ada bau hangus, asap, komponen menggembung, atau arus yang terbaca jauh lebih besar dari hitungan, karena itu tanda hubung singkat. Ingat juga, tegangan PLN dua ratus dua puluh volt dapat mematikan. Praktikum kita memakai tegangan rendah. Prinsipnya: hitung dulu, baru ukur. Dengan hasil hitungan, Anda bisa segera mengenali pengukuran yang tidak wajar."
    },
    {
      id: "s28", bab: "Praktik", judul: "Ringkasan rumus",
      html: `
<div class="grid2">
  <table class="tabel">
    <tr><th>Konsep</th><th>Rumus</th></tr>
    <tr><td>Arus</td><td>I = Q / t</td></tr>
    <tr><td>Tegangan</td><td>V = W / Q</td></tr>
    <tr><td>Resistansi kawat</td><td>R = ρL / A</td></tr>
    <tr><td>Hukum Ohm</td><td>V = I × R</td></tr>
    <tr><td>Daya</td><td>P = VI = I²R = V²/R</td></tr>
    <tr><td>Kapasitor</td><td>Q = C × V</td></tr>
    <tr><td>Trafo</td><td>V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub></td></tr>
  </table>
  <table class="tabel">
    <tr><th></th><th>Seri</th><th>Paralel</th></tr>
    <tr><td>Arus</td><td>sama</td><td>terbagi (KCL)</td></tr>
    <tr><td>Tegangan</td><td>terbagi (KVL)</td><td>sama</td></tr>
    <tr><td>R total</td><td>R<sub>1</sub> + R<sub>2</sub></td><td>R<sub>1</sub>R<sub>2</sub>/(R<sub>1</sub>+R<sub>2</sub>)</td></tr>
    <tr><td>Pembagi</td><td>V<sub>2</sub> = V<sub>s</sub>R<sub>2</sub>/(R<sub>1</sub>+R<sub>2</sub>)</td><td>I<sub>1</sub> = I<sub>t</sub>R<sub>2</sub>/(R<sub>1</sub>+R<sub>2</sub>)</td></tr>
    <tr><td>KCL</td><td colspan="2">ΣI masuk = ΣI keluar</td></tr>
    <tr><td>KVL</td><td colspan="2">ΣV dalam loop = 0</td></tr>
  </table>
</div>`,
      narasi: "Mari kita rangkum. Arus sama dengan muatan dibagi waktu. Tegangan sama dengan energi dibagi muatan. Resistansi kawat sama dengan rho kali panjang dibagi luas. Hukum Ohm: V sama dengan I kali R. Daya: V kali I, atau I kuadrat R, atau V kuadrat dibagi R. Kapasitor: Q sama dengan C kali V. Trafo: perbandingan tegangan sama dengan perbandingan lilitan. Pada rangkaian seri, arusnya sama dan tegangannya terbagi. Pada rangkaian paralel, tegangannya sama dan arusnya terbagi. Resistansi seri dijumlahkan, sedangkan resistansi paralel dihitung dengan perkalian dibagi penjumlahan. Terakhir, KCL: arus masuk sama dengan arus keluar, dan KVL: jumlah tegangan dalam satu loop sama dengan nol. Simpan ringkasan ini, karena akan dipakai sepanjang semester."
    },
    {
      id: "s29", bab: "Praktik", judul: "Refleksi dan langkah berikutnya",
      html: `
<div class="card">
  <h3>Tanyakan pada diri sendiri</h3>
  <ol>
    <li>Bisakah saya menjelaskan beda komponen pasif dan aktif kepada teman dengan satu contoh?</li>
    <li>Bisakah saya memilih rumus hukum Ohm yang tepat tanpa melihat catatan?</li>
    <li>Bisakah saya menyederhanakan rangkaian seri-paralel lalu mengeceknya dengan KCL dan KVL?</li>
  </ol>
</div>
<div class="grid2">
  <div class="card copper"><h3>Berikutnya: Latihan Materi 1</h3><p>Soal diacak dari bank soal dengan angka yang berbeda setiap kali. Lihat pembahasan langkah demi langkah setelah selesai. Boleh diulang sampai lulus.</p></div>
  <div class="card"><h3>Lalu: Ujian Materi 1</h3><p>Waktu terbatas, layar penuh, satu kesempatan (sesuai pengaturan dosen). Setelah ujian, Materi 2 (Semikonduktor) terbuka.</p></div>
</div>`,
      narasi: "Sebelum lanjut, luangkan waktu sejenak untuk refleksi. Bisakah Anda menjelaskan beda komponen pasif dan aktif kepada teman dengan satu contoh? Bisakah Anda memilih rumus hukum Ohm yang tepat tanpa melihat catatan? Bisakah Anda menyederhanakan rangkaian seri-paralel lalu mengecek hasilnya dengan KCL dan KVL? Jika masih ragu, kembali ke slide yang bersangkutan. Langkah berikutnya adalah latihan materi satu. Soalnya diacak dari bank soal dengan angka yang berbeda setiap kali, dan Anda bisa melihat pembahasan langkah demi langkah. Latihan boleh diulang sampai lulus. Setelah itu, ikuti ujian materi satu. Selamat belajar, dan sampai jumpa di materi semikonduktor."
    }
  ]
};
