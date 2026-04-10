/**
 * KONFIGURASI UNDANGAN DIGITAL
 * Silakan ubah variabel di bawah ini untuk menyesuaikan isi undangan.
 */

const images = Object.entries(
  import.meta.glob('./assets/*.{jpg,jpeg,png}', { eager: true }) // ⚠️ pastikan path sesuai
)
  .sort(([a], [b]) => a.localeCompare(b)) // ✅ biar urut
  .map(([, mod]: any) => mod.default);

export const WEDDING_DATA = {
  // Informasi Mempelai
  groom: {
    name: "Sapaat",
    fullName: "Sapaat",
    father: "Bpk. Sukirto",
    mother: "Ibu Masanah",
    instagram: "https://instagram.com/nama_laki_laki",
    image: "https://archive.org/download/foto_wanitaa/foto_priaa.jpg",
  },
  bride: {
    name: "Wulan",
    fullName: "Wulandari",
    father: "Bpk. Mohammad Ismail",
    mother: "Ibu Sri Wati",
    instagram: "https://instagram.com/nama_perempuan",
    image: "https://archive.org/download/foto_wanitaa/foto_wanitaa.jpg",
  },

  // Waktu Acara (Format: YYYY-MM-DDTHH:mm:ss)
  // Digunakan untuk Countdown dan Kalender
  eventDate: "2026-06-04T08:00:00", 
  eventDateEnd: "2026-06-04T20:00:00",
  
  // Format Kalender (YYYYMMDDTHHMMSSZ) - UTC
  calendarStart: "20260604T080000Z",
  calendarEnd: "20260604T200000Z",

  // Lokasi Acara
  location: {
    name: "Rumah Kediaman (RT 01 RW 02)",
    address: "Kampung Idaman, Turirejo, Demak, Jawa Tengah",
    mapsUrl: " https://maps.app.goo.gl/zmk8fWGPtYoGGPfn9?g_st=iw",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3961.423915104299!2d110.66967397499572!3d-6.839673293158432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNsKwNTAnMjIuOCJTIDExMMKwNDAnMjAuMSJF!5e0!3m2!1sen!2sid!4v1775761637936!5m2!1sen!2sid",
  },

  // Informasi Tambahan
  quotes: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang.",
  quotesSource: "QS. Ar-Rum: 21",

  // Rekening Hadiah Digital
  banks: [
    {
      bank: "BRI",
      number: "030601015162532",
      owner: "Wulandari",
    },

  ],

  // Musik Latar (URL file audio)
  bgMusic: "https://archive.org/download/tiara-andini-arsy-widianto-lagu-pernikahan-kita-official-music-video_202604/Tiara%20Andini%2C%20Arsy%20Widianto%20-%20Lagu%20Pernikahan%20Kita%20(Official%20Music%20Video).mp3",

  // Galeri Foto
  gallery: [
    ...images,
  ],
};
