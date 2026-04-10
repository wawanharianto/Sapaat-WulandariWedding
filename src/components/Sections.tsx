import React from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Instagram, 
  Send,
  Clock,
  Gift,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SafeImage } from './SafeImage';
import { AnimatedText } from './AnimatedText';
import { Countdown } from './Countdown';
import { Ornament } from './Ornament';
import { 
  premiumReveal, 
  groomReveal, 
  brideReveal, 
  premiumRevealLeft, 
  premiumRevealRight, 
  containerVariants, 
  itemVariants 
} from '../lib/animations';
import { Wish } from '../types';

export const HeroSection = () => (
  <section id="home" className="relative h-[100dvh] flex flex-col items-center justify-end pb-32 text-center px-6 overflow-hidden snap-start">
    <div className="absolute inset-0">
      <SafeImage 
        src="https://archive.org/download/hero_20260406_202604/Hero.jpg" 
        alt="Hero Couple" 
        className="w-full h-full object-cover object-top"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent" />
      <div className="absolute inset-0 bg-pattern opacity-5" />
    </div>
    
    <motion.div
      variants={premiumReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="relative z-10"
    >
      <motion.div variants={premiumReveal} className="text-gold font-display tracking-[0.3em] text-xs mb-4">WE ARE GETTING MARRIED</motion.div>
      <AnimatedText text="Milea & Dilan" className="text-6xl font-cursive text-maroon-900 mb-4 drop-shadow-sm" />
      <motion.div variants={premiumReveal} className="flex items-center justify-center gap-3 text-maroon-900/60 tracking-[0.2em] uppercase text-[10px] font-bold">
        <span>Rabu</span>
        <div className="w-1 h-1 bg-gold rounded-full" />
        <span>30 Des 2026</span>
      </motion.div>
    </motion.div>

    <motion.div 
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gold/50"
    >
      <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent mx-auto" />
    </motion.div>
  </section>
);

export const CoupleSection = () => (
  <section id="couple" className="py-24 px-8 text-center relative snap-start min-h-[100dvh] flex flex-col justify-center overflow-hidden">
    <Ornament className="absolute top-10 left-1/2 -translate-x-1/2 opacity-10 w-64 h-64" />
    <div className="absolute inset-0 opacity-5 bg-pattern pointer-events-none" />
    
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      className="mb-16 relative z-10"
    >
      <Heart className="w-10 h-10 text-gold mx-auto mb-8 animate-pulse" />
      <AnimatedText text="ASSALAMUALAIKUM WR. WB." className="text-gold font-display tracking-widest text-sm mb-6" />
      <motion.p 
        variants={premiumReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="italic text-maroon-900/80 mb-8 leading-relaxed font-serif text-lg px-4"
      >
        "Maha suci Allah yang telah menciptakan mahluk-Nya berpasang-pasangan. Ya Allah, perkenankanlah kami merangkaikan kasih sayang yang Kau ciptakan dalam ikatan pernikahan."
      </motion.p>
    </motion.div>

    <div className="space-y-24 relative z-10">
      <motion.div variants={groomReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="group">
        <div className="relative w-56 h-56 mx-auto mb-8">
          <motion.div initial={{ scale: 0, opacity: 0, rotate: 0 }} whileInView={{ scale: 1, opacity: 1, rotate: 45 }} transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }} className="absolute inset-0 border-2 border-gold/30 rounded-full group-hover:rotate-90 transition-transform duration-1000" />
          <motion.div initial={{ scale: 0, opacity: 0, rotate: 0 }} whileInView={{ scale: 1, opacity: 1, rotate: -12 }} transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }} className="absolute inset-2 border border-gold/20 rounded-full group-hover:rotate-0 transition-transform duration-1000" />
          <div className="absolute inset-4 overflow-hidden rounded-full shadow-2xl">
            <SafeImage src="https://archive.org/download/foto_wanitaa/foto_priaa.jpg" alt="Groom" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
        <motion.h3 variants={premiumReveal} className="text-4xl font-cursive text-maroon-800 mb-2">Dilan Abdul Rahman</motion.h3>
        <motion.p variants={premiumReveal} className="text-sm text-maroon-900/60 italic mb-4">Putra kedua dari Bapak Fulan & Ibu Fulanah</motion.p>
        <motion.a variants={premiumReveal} href="#" className="inline-flex items-center gap-2 bg-maroon-900/5 px-4 py-2 rounded-full text-gold text-xs font-bold hover:bg-maroon-900 hover:text-cream transition-all">
          <Instagram size={14} /> @dilan_ig
        </motion.a>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: "backOut" }} className="relative py-4">
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gold/20" />
        <div className="relative z-10 bg-cream inline-block px-6 text-5xl font-cursive text-gold">dan</div>
      </motion.div>

      <motion.div variants={brideReveal} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="group">
        <div className="relative w-56 h-56 mx-auto mb-8">
          <motion.div initial={{ scale: 0, opacity: 0, rotate: 0 }} whileInView={{ scale: 1, opacity: 1, rotate: -45 }} transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }} className="absolute inset-0 border-2 border-gold/30 rounded-full group-hover:-rotate-90 transition-transform duration-1000" />
          <motion.div initial={{ scale: 0, opacity: 0, rotate: 0 }} whileInView={{ scale: 1, opacity: 1, rotate: 12 }} transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }} className="absolute inset-2 border border-gold/20 rounded-full group-hover:rotate-0 transition-transform duration-1000" />
          <div className="absolute inset-4 overflow-hidden rounded-full shadow-2xl">
            <SafeImage src="https://archive.org/download/foto_wanitaa/foto_wanitaa.jpg" alt="Bride" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
        <motion.h3 variants={premiumReveal} className="text-4xl font-cursive text-maroon-800 mb-2">Milea Adnan Hussain</motion.h3>
        <motion.p variants={premiumReveal} className="text-sm text-maroon-900/60 italic mb-4">Putri pertama dari Bapak Fulan & Ibu Fulanah</motion.p>
        <motion.a variants={premiumReveal} href="#" className="inline-flex items-center gap-2 bg-maroon-900/5 px-4 py-2 rounded-full text-gold text-xs font-bold hover:bg-maroon-900 hover:text-cream transition-all">
          <Instagram size={14} /> @milea_ig
        </motion.a>
      </motion.div>
    </div>
  </section>
);

export const EventSection = () => (
  <section id="event" className="py-24 px-8 bg-maroon-950 text-cream relative overflow-hidden snap-start min-h-[100dvh] flex flex-col justify-center">
    <div className="absolute inset-0 opacity-10 bg-pattern pointer-events-none" />
    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cream to-transparent opacity-10" />
    
    <div className="relative z-10">
      <motion.div variants={premiumReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
        <AnimatedText text="Save The Date" className="text-5xl font-cursive text-gold mb-4" />
        <div className="w-24 h-[1px] bg-gold/50 mx-auto mb-8" />
        <Countdown />
      </motion.div>

      <div className="space-y-10">
        <motion.div variants={premiumRevealLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-cream/5 border-l-4 border-gold p-8 rounded-r-3xl backdrop-blur-md relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar size={80} /></div>
          <h3 className="text-3xl font-display font-bold text-gold mb-4">Akad Nikah</h3>
          <div className="space-y-3 text-cream/80">
            <div className="flex items-center gap-3"><Clock size={18} className="text-gold" /><span className="text-lg font-medium">08.00 - 10.00 WIB</span></div>
            <div className="flex items-center gap-3"><Calendar size={18} className="text-gold" /><span className="text-lg">Rabu, 30 Desember 2026</span></div>
          </div>
        </motion.div>

        <motion.div variants={premiumRevealRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-cream/5 border-r-4 border-gold p-8 rounded-l-3xl backdrop-blur-md text-right relative group overflow-hidden">
          <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Sparkles size={80} /></div>
          <h3 className="text-3xl font-display font-bold text-gold mb-4">Resepsi</h3>
          <div className="space-y-3 text-cream/80">
            <div className="flex items-center justify-end gap-3"><span className="text-lg font-medium">11.00 - Selesai</span><Clock size={18} className="text-gold" /></div>
            <div className="flex items-center justify-end gap-3"><span className="text-lg">Rabu, 30 Desember 2026</span><Calendar size={18} className="text-gold" /></div>
          </div>
        </motion.div>

        <motion.div variants={premiumReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-gold/10 border border-gold/30 p-8 rounded-3xl text-center backdrop-blur-md overflow-hidden">
          <MapPin className="w-10 h-10 text-gold mx-auto mb-6 animate-bounce" />
          <h3 className="text-3xl font-display font-bold text-gold mb-4">Lokasi Acara</h3>
          <p className="mb-8 text-cream/90 text-lg leading-relaxed">Gedung Serbaguna Jakarta<br /><span className="text-sm text-cream/60">Jl. Mawar No. 123, Jakarta Selatan</span></p>
          <div className="w-full h-64 rounded-2xl overflow-hidden border-2 border-gold/30 mb-8 shadow-2xl">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.273867623!2d106.8271528!3d-6.2293867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e7d2d08d05%3A0x209a0944e9c0f497!2sGedung%20Serbaguna%20Jakarta!5e0!3m2!1sid!2sid!4v1712400000000!5m2!1sid!2sid" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Lokasi Acara"></iframe>
          </div>
          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="https://maps.google.com/?q=Gedung+Serbaguna+Jakarta" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-gold text-maroon-950 px-8 py-3 rounded-full font-bold shadow-xl hover:bg-cream transition-colors">Petunjuk Jalan (Google Maps)</motion.a>
        </motion.div>
      </div>
    </div>
  </section>
);

export const GallerySection = () => (
  <section id="gallery" className="py-24 px-4 bg-cream relative snap-start min-h-[100dvh] flex flex-col justify-center">
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
      <AnimatedText text="Our Gallery" className="text-5xl font-cursive text-maroon-900 mb-4" />
      <p className="text-gold font-display tracking-widest text-[10px]">MOMENTS OF LOVE</p>
    </motion.div>
    <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div key={i} variants={itemVariants} className={cn("overflow-hidden rounded-2xl shadow-lg border border-gold/10", i % 3 === 0 ? "col-span-2 aspect-video" : "aspect-[3/4]")}>
          <SafeImage src={`https://picsum.photos/seed/wedding_gallery_${i}/800/1000`} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export const GiftSection = ({ copyToClipboard, copied }: { copyToClipboard: (text: string, id: string) => void, copied: string | null }) => (
  <section id="gift" className="py-24 px-8 bg-maroon-900 text-cream relative snap-start min-h-[100dvh] flex flex-col justify-center">
    <div className="absolute inset-0 opacity-10 bg-pattern pointer-events-none" />
    <motion.div variants={premiumReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10 text-center">
      <Gift className="w-12 h-12 text-gold mx-auto mb-6" />
      <AnimatedText text="Kado Digital" className="text-4xl font-cursive text-gold mb-4" />
      <p className="text-cream/70 mb-12 text-sm leading-relaxed">Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, Anda dapat mengirimkannya melalui:</p>
    </motion.div>
    <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
      {[
        { bank: 'BCA', acc: '1234567890', name: 'Dilan Abdul Rahman' },
        { bank: 'Mandiri', acc: '0987654321', name: 'Milea Adnan Hussain' }
      ].map((item, i) => (
        <motion.div key={i} variants={itemVariants} className="bg-cream/10 p-6 rounded-2xl border border-gold/20 backdrop-blur-sm">
          <div className="text-gold font-bold text-xl mb-2">{item.bank}</div>
          <div className="text-2xl font-display tracking-widest mb-2">{item.acc}</div>
          <div className="text-cream/60 text-sm mb-4">a.n {item.name}</div>
          <button onClick={() => copyToClipboard(item.acc, item.bank)} className="inline-flex items-center gap-2 text-xs bg-gold/20 text-gold px-4 py-2 rounded-full hover:bg-gold hover:text-maroon-900 transition-all">
            {copied === item.bank ? <Check size={14} /> : <Copy size={14} />}
            {copied === item.bank ? 'Berhasil Disalin' : 'Salin Rekening'}
          </button>
        </motion.div>
      ))}
    </motion.div>
  </section>
);

export const RSVPSection = ({ addWish, newWish, setNewWish, isSubmitting, wishes }: { addWish: (e: React.FormEvent) => void, newWish: any, setNewWish: any, isSubmitting: boolean, wishes: Wish[] }) => (
  <section id="rsvp" className="py-24 px-8 bg-cream relative snap-start min-h-[100dvh] flex flex-col justify-center">
    <div className="absolute inset-0 opacity-5 bg-pattern pointer-events-none" />
    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative z-10">
      <div className="text-center mb-16">
        <AnimatedText text="Konfirmasi & Ucapan" className="text-5xl font-cursive text-maroon-900 mb-4" />
        <p className="text-gold font-display tracking-widest text-[10px]">RSVP & GUEST BOOK</p>
      </div>
      <motion.form variants={premiumReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} onSubmit={addWish} className="mb-16 space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gold/10">
        <div className="space-y-2">
          <label className="text-xs font-bold text-maroon-900/40 uppercase tracking-widest ml-1">Nama Lengkap</label>
          <input type="text" placeholder="Masukkan nama Anda" required value={newWish.name} onChange={(e) => setNewWish({ ...newWish, name: e.target.value })} className="w-full p-4 rounded-xl border border-gold/20 bg-cream/30 focus:ring-2 focus:ring-gold outline-none transition-all" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-maroon-900/40 uppercase tracking-widest ml-1">Konfirmasi Kehadiran</label>
            <div className="flex gap-3">
              {['Hadir', 'Tidak Hadir'].map((status) => (
                <button key={status} type="button" onClick={() => setNewWish({ ...newWish, attendance: status as any })} className={cn("flex-1 py-3 rounded-xl border text-sm font-bold transition-all", newWish.attendance === status ? "bg-maroon-900 text-gold border-maroon-900 shadow-lg" : "bg-cream/30 border-gold/20 text-maroon-900/60 hover:border-gold")}>{status}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-maroon-900/40 uppercase tracking-widest ml-1">Jumlah Tamu</label>
            <select value={newWish.guests} onChange={(e) => setNewWish({ ...newWish, guests: parseInt(e.target.value) })} className="w-full p-3.5 rounded-xl border border-gold/20 bg-cream/30 focus:ring-2 focus:ring-gold outline-none transition-all appearance-none">
              {[1, 2, 3, 4, 5].map(n => (<option key={n} value={n}>{n} Orang</option>))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-maroon-900/40 uppercase tracking-widest ml-1">Pesan Ucapan & Doa</label>
          <textarea placeholder="Tuliskan doa dan harapan terbaik Anda..." rows={4} required value={newWish.message} onChange={(e) => setNewWish({ ...newWish, message: e.target.value })} className="w-full p-4 rounded-xl border border-gold/20 bg-cream/30 focus:ring-2 focus:ring-gold outline-none transition-all resize-none" />
        </div>
        <button type="submit" disabled={isSubmitting} className={cn("w-full bg-maroon-900 text-gold py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-maroon-800 transition-all active:scale-95", isSubmitting && "opacity-50 cursor-not-allowed")}><Send size={18} /> {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi & Ucapan'}</button>
      </motion.form>
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
        {wishes.map((wish) => (
          <motion.div key={wish.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-gold group hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-maroon-900 text-lg flex items-center gap-2">{wish.name}<span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", wish.attendance === 'Hadir' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{wish.attendance}</span></h4>
                {wish.attendance === 'Hadir' && (<p className="text-[10px] text-maroon-900/40 font-bold uppercase mt-1">Membawa {wish.guests} Tamu</p>)}
              </div>
              <span className="text-[10px] text-maroon-900/30 font-bold uppercase bg-maroon-900/5 px-2 py-1 rounded">{wish.date}</span>
            </div>
            <p className="text-maroon-900/70 leading-relaxed italic">"{wish.message}"</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

export const Footer = () => (
  <footer id="footer" className="py-20 text-center bg-maroon-950 text-cream relative overflow-hidden snap-start min-h-[100dvh] flex flex-col justify-center">
    <div className="absolute inset-0 opacity-10 bg-pattern pointer-events-none" />
    <motion.div variants={premiumReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10">
      <AnimatedText text="Terima Kasih" className="text-4xl font-cursive text-gold mb-6" />
      <motion.p variants={premiumReveal} className="text-sm text-cream/60 mb-12 max-w-[280px] mx-auto leading-relaxed">Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.</motion.p>
      <motion.div variants={premiumReveal} className="text-gold font-display tracking-[0.4em] text-xs mb-4">MILEA & DILAN</motion.div>
      <motion.div variants={premiumReveal} className="text-[10px] text-cream/30 uppercase tracking-widest">© 2026 Digital Invitation</motion.div>
    </motion.div>
  </footer>
);
