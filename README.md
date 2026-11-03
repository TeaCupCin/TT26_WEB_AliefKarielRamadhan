# 📦 SmartWarehouse - Monitoring Gudang TaggIoT

Repositori ini berisi hasil pengerjaan Tes Teknis untuk posisi **Junior Web Developer Specialist** pada Program Magang TaggIoT 2026. Aplikasi web ini berfungsi sebagai _dashboard_ pemantauan kondisi suhu dan kelembapan sensor di dua gudang (Gudang A - Beku, dan Gudang B - Segar).

**Disusun oleh:** Alief Kariel Ramadhan (Kode Tes: TT26-01-WEB)

---

## 🛠️ Cara Menjalankan Proyek

Aplikasi ini dibangun menggunakan HTML, CSS (Vanilla dengan CSS Variables), dan JavaScript murni.

Karena aplikasi memuat data secara asinkron dari file lokal (`sensors.json`) menggunakan metode `fetch()`, halaman ini **tidak bisa dibuka langsung dengan mengklik dua kali file `index.html`** (akan memicu _CORS / Cross-Origin Request Blocked error_).

Untuk menjalankannya dengan benar:

1. Pada GitHub klik tombol **<> Code**, pilih opsi "Download Zip".
2. Setelah didownload ekstrak folder di dalam PC anda.
3. Buka folder proyek ini di **Visual Studio Code (VS Code)**.
4. Pastikan sudah menginstal ekstensi **Live Server**.
5. Klik kanan pada file `index.html` lalu pilih **"Open with Live Server"** (atau tekan tombol _Go Live_ di pojok kanan bawah VS Code).
6. Web akan otomatis terbuka di browser pada alamat `http://127.0.0.1:5500`.

## 📂 Struktur Folder

```text
TT26_WEB_AliefKarielRamadhan/
│
├── assets/                  # Folder berisi kumpulan ikon SVG & Logo
├── index.html               # Struktur utama antarmuka web (Semantic HTML)
├── style.css                # Styling menggunakan Vanilla CSS & Dark Mode support
├── script.js                # Logika filter, manipulasi DOM, & auto-refresh
├── sensors.json             # Data dummy sensor (simulasi dari backend)
└── README.md                # Dokumentasi proyek
```

---

## 🧠 Penjelasan Logika Status Sensor

Penentuan status sensor (Normal, Peringatan, Offline) tidak _hardcoded_ di HTML, melainkan dihitung secara dinamis di sisi klien menggunakan fungsi JavaScript `getStatus(sensor)` dengan hierarki prioritas berikut:

1. **Prioritas 1 (Koneksi Terputus):**
   Jika _field_ `koneksi` di JSON bernilai `"offline"`, status otomatis menjadi **Offline (Abu-abu)** mengabaikan nilai suhu/kelembapan.
2. **Prioritas 2 (Di Luar Batas Aman):**
   Sistem akan mengecek batas aman berdasarkan jenis gudang.
   - **Gudang A (Beku):** Suhu -25°C s/d -15°C | Kelembapan 40% - 80%
   - **Gudang B (Segar):** Suhu 0°C s/d 8°C | Kelembapan 40% - 80%
     Jika suhu **ATAU** kelembapan berada di luar batas inklusif tersebut, status menjadi **Peringatan (Oranye)**.
3. **Prioritas 3 (Kondisi Ideal):**
   Jika sensor berstatus `"online"` dan seluruh nilai suhu serta kelembapan masuk dalam rentang batas aman, maka status dikategorikan sebagai **Normal (Hijau)**.

---

## ✨ Fitur Tambahan

Selain menyelesaikan _Use Case_ utama, proyek ini juga mengimplementasikan seluruh tugas opsional (Nilai Tambah):

- **Mode Gelap (Dark Mode):** Dapat diaktifkan melalui ikon ☀️/🌙 di header. Preferensi disimpan menggunakan `localStorage` agar tidak hilang saat halaman di-refresh.
- **Fitur Pencarian Real-time:** Memungkinkan pencarian kartu secara cepat berdasarkan ID Sensor (mis. "SNS-A01") atau Lokasi (mis. "Rak 1").
- **Auto-Refresh Data:** Data di-_fetch_ dan di-_render_ ulang secara otomatis setiap 30 detik tanpa me-_reload_ halaman, dilengkapi dengan indikator waktu _update_ visual di bagian atas grid.

---

## 📱 Screenshot Tampilan

### Tampilan Desktop (Light Mode)

![Screenshot Desktop](link_ke_gambar_desktop.png)

### Tampilan Mobile (Dark Mode)

![Screenshot Mobile](link_ke_gambar_mobile.png)

---

_© 2026 PT Teknologi Tata Data (TaggIoT)_
