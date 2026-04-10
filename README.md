

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Link console firebase data:
   `https://console.firebase.google.com/project/gen-lang-client-0510691407/firestore/databases/ai-studio-eec2c967-a2c5-42ce-9f11-e3b78a1b4e16/data`


=========================================
Fitur Utama yang Diimplementasikan:
1. Animasi Amplop Mewah: Pembukaan undangan dengan
efek visual yang elegan.
2. Konfigurasi Terpusat: Seluruh data dikelola melalui satu file (src/constants.ts).
3. Countdown Timer: Penghitung waktu mundur otomatis ke hari pernikahan.
4. Integrasi Google Maps: Peta interaktif (Embed) dan navigasi langsung.
5. Simpan ke Kalender: Dukungan Google Calendar dan file .ics untuk semua perangkat.
6. RSVP & Buku Tamu Digital: Terintegrasi dengan Firebase Firestore untuk penyimpanan pesan secara real-time.
8. Galeri Foto Premium: Slider foto pre-wedding yang responsif.
9. Hadiah Digital: Informasi rekening bank untuk kado digital.
10. Musik Latar Otomatis: Dengan kontrol play/pause yang estetik.
11. Nama Tamu Dinamis: Mendukung kustomisasi nama tamu melalui URL (contoh: ?to=Nama+Tamu).

================================================
Model Data:
1. Model Konfigurasi: Menggunakan objek WEDDING_DATA di src/constants.ts untuk kemudahan kustomisasi tanpa mengubah logika kode.
2. Model Database: Menggunakan koleksi wishes di Firebase Firestore dengan skema yang mencakup nama, pesan, status kehadiran, jumlah tamu, dan stempel waktu.