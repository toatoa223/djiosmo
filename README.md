# 🛒 TroliRantau — Smart Grocery & Budget Safety Tracker (PWA)

Aplikasi web mobile **Progressive Web App (PWA)** bergaya *native mobile application* yang dirancang khusus bagi anak rantau / mahasiswa kos saat berbelanja bulanan di supermarket sambil mendorong troli belanja.

---

## 📱 Arsitektur & Tampilan Mobile

1. **Format Layar Ergonomis**: 
   - Lebar maksimal `430px` (ukuran standar smartphone modern seperti iPhone 15 Pro Max / Galaxy S24 Ultra), terpusat secara rapi di desktop browser, dan *fullscreen edge-to-edge* (100dvh) di perangkat smartphone.
2. **Bottom Navigation Bar (Melayang)**:
   - Navigasi bawah ramah jempol dengan ikon **Lucide Icons** untuk tab:
     - 🛒 **Belanja** (Troli aktif, penghitung badge item keranjang)
     - 📋 **Riwayat** (Sesi belanja bulanan sebelumnya & grafik inflasi pribadi)
     - 🛡️ **Anggaran** (Atur Safety Cap batas dompet & kelola database harga referensi bulan lalu)
3. **Ergonomi Ramah Jempol (Thumb-Friendly)**:
   - Stepper kuantitas (`-` & `+`) berukuran besar (min. target sentuh 44-48px).
   - Chip nominal cepat Rupiah (+5rb, +10rb, +25rb, +50rb) dan chip rekomendasi belanja anak kos (Beras 5kg, Telur 1kg, Minyak 2L, Indomie 5x, Sabun Promo).
   - Tampilan berbasis kartu fleksibel (*card-based layout*), **tanpa layout tabel desktop yang melebar ke samping**.
4. **Dukungan PWA Lengkap**:
   - Web App Manifest ([manifest.json](file:///c:/Users/Student/Documents/djiosmo/manifest.json)) mode `standalone`.
   - Service Worker ([sw.js](file:///c:/Users/Student/Documents/djiosmo/sw.js)) dengan strategi *cache-first offline* agar tetap dapat dipakai di lorong atau lantai *basement* supermarket dengan sinyal minim.
   - Meta tag mobile viewport, `apple-mobile-web-app-capable`, `theme-color`, dan ikon PWA adaptif.

---

## 🎯 Kebutuhan Fungsional (SRS Checklist)

| Kebutuhan Fungsional | Status | Deskripsi & Implementasi |
| :--- | :---: | :--- |
| **Pencatatan Item Belanja Lengkap** | ✅ | Menyimpan nama produk, kategori barang (Bahan Pokok, Makanan, Minuman, Kebersihan, Bumbu, Lainnya), satuan (kg, liter, pcs, pack, botol, sachet, dus), kuantitas (Qty), dan harga satuan. |
| **Perhitungan Kuantitas Otomatis** | ✅ | Perubahan angka Qty melalui tombol stepper langsung mengalikan harga satuan secara realtime ke total baris item dan saldo dompet. |
| **Kalkulator Diskon Bertingkat** | ✅ | Menghitung diskon tunggal (contoh: `25%`), potongan nominal langsung (`Rp 5.000`), maupun diskon bertumpuk supermarket (contoh: `50% + 20%` dengan rumus: $Harga \times (1 - d_1) \times (1 - d_2)$, diskon efektif 60%). Dilengkapi penjelasan langkah matematis transparan langsung di form. |
| **Komparator Harga Realtime vs Bulan Lalu** | ✅ | Menampilkan indikator visual seketika saat harga diinput maupun pada kartu keranjang:<br>• 🔴 **Panah Merah Naik (↑)**: Jika harga naik dibanding bulan lalu (+ selisih & %).<br>• 🟢 **Panah Hijau Turun (↓)**: Jika harga turun dibanding bulan lalu (- selisih & %).<br>• ⚪ **Tanda Setara (=)**: Jika harga stabil/tetap.<br>• 🆕 **Item Baru**: Jika belum ada data bulan lalu. |
| **Pengendali Anggaran (Safety Cap)** | ✅ | Input batas maksimal dompet dengan meter visual di sticky header:<br>• 🟢 **Aman** (< 75%): Santai.<br>• 🟡 **Waspada** (75% - 92%): Mendekati limit.<br>• 🔴 **Bahaya / Over Budget** (> 92%): Menyala merah berkedip (*pulsing*) & peringatan *"🚨 REM BELANJA!"*. |
| **Riwayat & Database Belanja** | ✅ | Tersimpan ke `localStorage`. Dilengkapi tombol *"Checkout Selesai"*, riwayat sesi sebelumnya, dan otomatis memperbarui database acuan resmi untuk belanja bulan depan. |

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi berjalan di web server lokal port 3000:

```bash
# Jalankan web server lokal
node server.js
```

Buka URL di browser:
👉 **`http://localhost:3000/`**

### Pemasangan di Layar Utama Smartphone (PWA A2HS):
1. Buka `http://localhost:3000/` di browser smartphone (Google Chrome di Android atau Safari di iOS).
2. Di Chrome: Tap ikon titik tiga `⋮` → Pilih **"Tambahkan ke Layar Utama" (Add to Home screen)**.
3. Di Safari iOS: Tap tombol **Share** `⎋` → Pilih **"Add to Home Screen"**.
4. Aplikasi akan terpasang sebagai aplikasi native mandiri tanpa address bar browser.