//Konfigurasi Batas Suhu & Kelembapan
const BATAS_SUHU = {
  A: { min: -25, max: -15 },
  B: { min: 0, max: 8 },
};
const BATAS_KELEMBAPAN = { min: 40, max: 80 };

//Tema Dark Mode
const KUNCI_TEMA = 'tema';
const temaToggleEl = document.getElementById('theme-toggle');
const temaIkonEl = document.getElementById('theme-icon');

//Mengambil data dari file sensors.json
async function muatSensor() {
  const res = await fetch('sensors.json');
  if (!res.ok) throw new Error('Gagal memuat sensors.json');
  return res.json();
}

//Menentukkan status sensor (Prioritas: Offline, lalu Peringatan, lalu Normal)
function getStatus(sensor) {
  if (sensor.koneksi === 'offline') return 'offline';
  const suhu = BATAS_SUHU[sensor.gudang];
  const suhuAman = sensor.suhu >= suhu.min && sensor.suhu <= suhu.max;
  const lembapAman = sensor.kelembapan >= BATAS_KELEMBAPAN.min && sensor.kelembapan <= BATAS_KELEMBAPAN.max;

  return suhuAman && lembapAman ? 'normal' : 'peringatan';
}

//Menghitung total jumlah sensor untuk masing masing status pada summary box di atas
function hitungSummary(sensors) {
  const hasil = { normal: 0, peringatan: 0, offline: 0 };
  sensors.forEach((sensor) => {
    hasil[getStatus(sensor)]++;
  });
  return hasil;
}

//Menampilkan hasi hitungan dari fungsi 'hitungSummary' ke halaman web
function tampilkanSummary(hasil) {
  document.getElementById('count-normal').textContent = hasil.normal;
  document.getElementById('count-peringatan').textContent = hasil.peringatan;
  document.getElementById('count-offline').textContent = hasil.offline;
}

let semuaSensor = [];
let filterAktif = 'semua';
let kataKunci = '';
const pesanKosongEl = document.getElementById('message-empty');
const pesanErrorEl = document.getElementById('message-error');
const tombolCobaLagiEl = document.getElementById('retry-btn');
let gagalMuat = false;
const gridEl = document.getElementById('sensor-grid');
const templateEl = document.getElementById('sensor-card-template');

const LABEL_STATUS = {
  normal: 'Normal',
  peringatan: 'Peringatan',
  offline: 'Offline',
};

// Format tanggal
function formatWaktu(teks) {
  const [tanggal, jam] = teks.split(' ');
  const [tahun, bulan, hari] = tanggal.split('-');
  return `${hari}-${bulan}-${tahun} ${jam}`;
}

//Mencetak satu buah elemen kartu HTML utuh dari data satu sensor
function buatKartu(sensor) {
  const status = getStatus(sensor);
  const kartu = templateEl.content.cloneNode(true);

  kartu.querySelector('.card').classList.add(`card--${status}`);

  const badge = kartu.querySelector('.badge');
  badge.classList.add(`badge--${status}`);
  badge.textContent = LABEL_STATUS[status];

  kartu.querySelector('.card__id').textContent = sensor.id;
  kartu.querySelector('.card__lokasi').textContent = sensor.lokasi;

  // Jika status offline, cetak '--', jika tidak cetak angkanya
  kartu.querySelector('.card__suhu').textContent = status === 'offline' ? '-- °C' : `${sensor.suhu} °C`;
  kartu.querySelector('.card__kelembapan').textContent = status === 'offline' ? '-- %' : `${sensor.kelembapan} %`;

  kartu.querySelector('.card__waktu').textContent = `Update terakhir: ${formatWaktu(sensor.update_terakhir)}`;

  return kartu;
}

//Mengecek apakah kartu sensor cocok dengan kata yang diketik user di kolom pencarian.
function cocokPencarian(sensor) {
  const kunci = kataKunci.trim().toLowerCase();
  if (!kunci) return true;
  return sensor.id.toLowerCase().includes(kunci) || sensor.lokasi.toLowerCase().includes(kunci);
}

//Menyaring dan memasang kartu-kartu sensor yang lolos syarat ke dalam grid layar.
function tampilkanKartu() {
  if (gagalMuat) return;
  gridEl.replaceChildren();

  const tampil = semuaSensor.filter((sensor) => (filterAktif === 'semua' || getStatus(sensor) === filterAktif) && cocokPencarian(sensor));

  pesanKosongEl.hidden = tampil.length > 0;
  tampil.forEach((sensor) => gridEl.appendChild(buatKartu(sensor)));
}

//Menghidupkan interaksi ketikan di kotak pencarian dan klik pada 4 tombol filter.
function pasangPencarian() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', (event) => {
    kataKunci = event.target.value;
    tampilkanKartu();
  });
}

function pasangFilter() {
  const grup = document.getElementById('filter-group');

  grup.addEventListener('click', (event) => {
    const tombol = event.target.closest('.filter__btn');
    if (!tombol) return;

    filterAktif = tombol.dataset.filter;

    grup.querySelectorAll('.filter__btn').forEach((btn) => {
      const aktif = btn === tombol;
      btn.classList.toggle('is-active', aktif);
      btn.setAttribute('aria-pressed', aktif);
    });

    tampilkanKartu();
  });
}
//---------------------------------------//

//Mengubah tampilan layar ketika data sensors.json gagal dimuat
function tampilkanError() {
  gagalMuat = true;
  gridEl.replaceChildren();
  pesanKosongEl.hidden = true;
  pesanErrorEl.hidden = false;

  ['normal', 'peringatan', 'offline'].forEach((status) => {
    document.getElementById(`count-${status}`).textContent = '--';
  });
}

//Mengatur fitur Dark Mode dan Light Mode
function terapkanTema(tema) {
  const gelap = tema === 'dark';
  document.documentElement.dataset.theme = tema;
  temaIkonEl.src = gelap ? 'assets/Icon-Sun.svg' : 'assets/Icon-Moon.svg';
  temaToggleEl.setAttribute('aria-pressed', gelap);
}

function temaAwal() {
  try {
    const tersimpan = localStorage.getItem(KUNCI_TEMA);
    if (tersimpan) return tersimpan;
  } catch {
    /* localStorage tidak tersedia, pakai pengaturan sistem */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function pasangTema() {
  terapkanTema(temaAwal());

  temaToggleEl.addEventListener('click', () => {
    const baru = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    terapkanTema(baru);
    try {
      localStorage.setItem(KUNCI_TEMA, baru);
    } catch {
      /* abaikan kalau penyimpanan gagal */
    }
  });
}
//--------------------------------//

//menyatukan dan menjalankan seluruh alur program dari awal
async function init() {
  pesanErrorEl.hidden = true;

  try {
    semuaSensor = await muatSensor();
  } catch (error) {
    console.error(error);
    tampilkanError();
    return;
  }

  gagalMuat = false;
  tampilkanSummary(hitungSummary(semuaSensor));
  tampilkanKartu();

  // Memperbarui teks waktu di UI setiap kali fungsi ini berjalan
  const sekarang = new Date();
  const formatJam = sekarang.toLocaleTimeString('id-ID');
  document.getElementById('update-info').innerHTML = `Dimuat ${formatJam} &middot; refresh otomatis tiap 30 detik`;
}

tombolCobaLagiEl.addEventListener('click', init);
pasangTema();
pasangFilter();
pasangPencarian();
init();

// Jalankan fungsi init() ulang setiap 30.000 milidetik (30 detik)
setInterval(init, 30000);
