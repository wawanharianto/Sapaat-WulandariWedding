/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Music, 
  Music2, 
  ChevronRight, 
  Instagram, 
  Send,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Gift,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { cn } from './lib/utils';
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  Timestamp,
  getDocFromServer,
  doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { WEDDING_DATA } from './constants';

// ==========================================
// SECTION: ERROR HANDLING & LOGGING
// ==========================================
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// SECTION: TYPES & INTERFACES
// ==========================================
interface Wish {
  id: string;
  name: string;
  message: string;
  date: string;
  attendance: 'Hadir' | 'Tidak Hadir';
  guests: number;
  createdAt?: Timestamp;
}

// ==========================================
// SECTION: UTILITY COMPONENTS
// ==========================================

/**
 * Preloader: Animasi loading saat aplikasi pertama kali dibuka
 */
const Preloader = ({ progress, onComplete }: { progress: number, onComplete: () => void, key?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
      }}
      className="fixed inset-0 z-[9999] bg-maroon-950 flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      {/* Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle,rgba(197,160,89,0.15)_0%,transparent_70%)] blur-[100px]"
      />

      <div className="relative z-10 text-center w-full max-w-xs">
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-gold font-display tracking-[0.6em] text-sm md:text-base mb-2"
          >
            LOADING
          </motion.div>
          <motion.div 
            className="text-5xl md:text-7xl font-display font-bold text-gold/20 relative inline-block"
          >
            {Math.round(progress)}%
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute inset-0 text-gold overflow-hidden whitespace-nowrap border-r-2 border-gold"
            >
              {Math.round(progress)}%
            </motion.div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="w-full h-[2px] bg-gold/10 rounded-full relative overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gold shadow-[0_0_20px_rgba(197,160,89,1)]"
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gold/40 font-display text-[10px] tracking-[0.3em] uppercase"
          >
            ...
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * SafeImage: Komponen gambar dengan fitur retry otomatis dan fallback jika gagal dimuat
 */
const SafeImage = ({ 
  src, 
  alt, 
  className, 
  referrerPolicy = "no-referrer",
  motionProps = {}
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  motionProps?: any;
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleError = () => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        const separator = src.includes('?') ? '&' : '?';
        setImgSrc(`${src}${separator}retry=${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
      }, 2000);
    } else {
      // Fallback to a high-quality placeholder if all retries fail
      setImgSrc(`https://picsum.photos/seed/${alt}/800/1000`);
    }
  };

  useEffect(() => {
    setImgSrc(src);
    setRetryCount(0);
  }, [src]);

  return (
    <motion.img
      {...motionProps}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy={referrerPolicy}
    />
  );
};

/**
 * Ornament: Elemen dekoratif SVG
 */
const Ornament = ({ className }: { className?: string }) => (
  <svg className={cn("w-24 h-24 text-gold/30", className)} viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 95C25.2 95 5 74.8 5 50S25.2 5 50 5s45 20.2 45 45-20.2 45-45 45z"/>
    <path d="M50 15c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35 35-15.7-35-35-35zm0 65c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30z"/>
  </svg>
);

/**
 * Countdown: Komponen penghitung mundur waktu acara
 */
const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const weddingDate = new Date(WEDDING_DATA.eventDate);
      const difference = weddingDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-3 text-center">
      {[
        { label: 'Hari', value: timeLeft.days },
        { label: 'Jam', value: timeLeft.hours },
        { label: 'Menit', value: timeLeft.minutes },
        { label: 'Detik', value: timeLeft.seconds }
      ].map((item, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 + (i * 0.2), type: "spring" }}
          className="bg-maroon-900/80 backdrop-blur-sm text-gold p-3 rounded-xl shadow-xl border border-gold/40 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gold/20" />
          <div className="text-2xl font-bold font-display">{item.value}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-medium text-cream/70">{item.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

// ==========================================
// SECTION: MAIN INVITATION CONTENT
// ==========================================
const InvitationContent = ({ isPlaying, toggleMusic, guestName }: { isPlaying: boolean, toggleMusic: () => void, guestName: string }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  
  // State untuk form ucapan, nama otomatis terisi jika ada guestName dari URL
  const [newWish, setNewWish] = useState({ 
    name: guestName !== 'Tamu Undangan' ? guestName : '', 
    message: '', 
    attendance: 'Hadir' as 'Hadir' | 'Tidak Hadir', 
    guests: 1 
  });
  const [activeSection, setActiveSection] = useState('home');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Animasi Reveal Premium ---
  const premiumReveal = {
    hidden: { opacity: 0, y: 50, rotateX: 45, scale: 0.9, filter: "blur(12px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
    }
  };

  const groomReveal = {
    hidden: { opacity: 0, y: 100, rotateX: 20, scale: 0.8, filter: "blur(30px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 2.2, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2,
        scale: { duration: 2.5, ease: "easeOut", delay: 0.2 }
      }
    }
  };

  const brideReveal = {
    hidden: { opacity: 0, y: 100, rotateX: -20, scale: 0.8, filter: "blur(30px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 2.2, 
        ease: [0.16, 1, 0.3, 1],
        delay: 0.4,
        scale: { duration: 2.5, ease: "easeOut", delay: 0.4 }
      }
    }
  };

  const premiumRevealLeft = {
    hidden: { opacity: 0, x: -30, scale: 0.98, filter: "blur(8px)" },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
    }
  };

  const premiumRevealRight = {
    hidden: { opacity: 0, x: 30, scale: 0.98, filter: "blur(8px)" },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const textContainer = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: 0.08, 
        delayChildren: 0.4 * i 
      },
    }),
  };

  const textChild = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      letterSpacing: "0.1em",
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 80,
      },
    },
    hidden: {
      opacity: 0,
      y: 80,
      rotateX: 90,
      rotateY: 15,
      scale: 0.5,
      letterSpacing: "-0.2em",
      filter: "blur(20px)",
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 80,
      },
    },
  };

  /**
   * AnimatedText: Komponen teks dengan animasi per karakter
   */
  const AnimatedText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
    return (
      <div className="relative inline-block">
        <motion.div
          style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            justifyContent: "center",
            perspective: "1000px"
          }}
          variants={textContainer}
          custom={delay}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className={className}
        >
          {text.split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="inline-flex overflow-hidden mr-[0.25em] py-1">
              {word.split("").map((char, charIndex) => (
                <motion.span
                  key={charIndex}
                  variants={textChild}
                  className="inline-block origin-bottom"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.div>
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: [0, 1, 0], originX: [0, 0, 1] }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.8, ease: "easeInOut", delay: delay + 0.5 }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold z-20 pointer-events-none"
        />
      </div>
    );
  };

  /**
   * RevealImage: Komponen gambar dengan animasi curtain reveal premium
   */
  const RevealImage = ({ src, alt, className, delay = 0.8, objectPosition = "center" }: { src: string, alt: string, className?: string, delay?: number, objectPosition?: string }) => {
    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={cn("relative overflow-hidden cursor-pointer group/img", className)}
      >
        <motion.div
          initial={{ scale: 1.4, opacity: 0, filter: "blur(30px)" }}
          whileInView={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 3, ease: [0.16, 1, 0.3, 1], delay }}
          className="w-full h-full"
        >
          <SafeImage 
            src={src} 
            alt={alt} 
            className={cn("w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-105", `object-${objectPosition}`)} 
          />
        </motion.div>
        
        {/* Premium Curtain Reveal Overlay */}
        <motion.div
          initial={{ y: "0%" }}
          whileInView={{ y: "-100%" }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: delay + 0.2 }}
          className="absolute inset-0 bg-maroon-900 z-10"
        />
        
        {/* Gold Shimmer Line Reveal with Glint */}
        <motion.div
          initial={{ y: "0%", opacity: 0 }}
          whileInView={{ 
            y: "-100%", 
            opacity: [0, 1, 1, 0],
            scaleX: [1, 1.1, 1]
          }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: delay + 0.2 }}
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent z-20 shadow-[0_0_20px_#c5a059]"
        >
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </motion.div>
    );
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef
  });

  useEffect(() => {
    if (guestName && guestName !== 'Tamu Undangan') {
      setNewWish(prev => ({ ...prev, name: guestName }));
    }
  }, [guestName]);

  useEffect(() => {
    const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wishesData: Wish[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt as Timestamp;
        return {
          id: doc.id,
          name: data.name,
          message: data.message,
          attendance: data.attendance,
          guests: data.guests,
          createdAt: createdAt,
          date: createdAt ? new Intl.DateTimeFormat('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(createdAt.toDate()) : 'Baru saja'
        };
      });
      setWishes(wishesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'wishes');
    });

    return () => unsubscribe();
  }, []);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const addWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.name || !newWish.message || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'wishes'), {
        name: newWish.name,
        message: newWish.message,
        attendance: newWish.attendance,
        guests: newWish.guests,
        createdAt: serverTimestamp()
      });
      setNewWish({ name: '', message: '', attendance: 'Hadir', guests: 1 });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'wishes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-maroon-950">
      {/* --- Global Wedding Atmosphere Overlay --- */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {/* Soft Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.3)_100%)]" />
        
        {/* Soft Light Rays */}
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(197,160,89,0.05)_0%,transparent_50%,rgba(197,160,89,0.05)_100%)] animate-pulse" />
      </div>

      {/* --- Progress Bar --- */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gold z-[120] origin-left shadow-[0_0_10px_rgba(197,160,89,0.5)]"
        style={{ scaleX }}
      />

      {/* --- Scroll Indicator --- */}
      <div className="fixed right-2 md:right-4 top-1/2 -translate-y-1/2 z-[110] flex flex-col gap-2 md:gap-3">
        {['home', 'couple', 'event', 'gallery', 'gift', 'rsvp', 'footer'].map((id) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className={cn(
              "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300",
              activeSection === id ? "bg-gold scale-125 md:scale-150 shadow-[0_0_8px_#c5a059]" : "bg-gold/20"
            )}
            title={id.charAt(0).toUpperCase() + id.slice(1)}
          />
        ))}
      </div>

      {/* --- Music Toggle --- */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={toggleMusic}
        className="fixed bottom-24 right-4 md:right-6 z-[110] bg-maroon-900 text-gold p-2.5 md:p-3 rounded-full shadow-2xl border-2 border-gold/50 group active:scale-90 transition-transform"
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-cream/50" />
        )}
        <div className="absolute -top-12 right-0 bg-maroon-900 text-gold text-[10px] px-2 py-1 rounded opacity-0 transition-opacity whitespace-nowrap">
          {isPlaying ? "Matikan Musik" : "Putar Musik"}
        </div>
      </motion.button>

      <motion.div
        key="content"
        ref={scrollContainerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onScroll={(e) => {
          const container = e.currentTarget;
          const sections = ['home', 'couple', 'event', 'gallery', 'gift', 'rsvp', 'footer'];
          const scrollPos = container.scrollTop + container.clientHeight / 2;
          
          for (const id of sections) {
            const el = document.getElementById(id);
            if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
              setActiveSection(id);
              break;
            }
          }
        }}
        className="max-w-md mx-auto bg-cream shadow-2xl relative h-[100dvh] overflow-y-auto scroll-smooth snap-y snap-mandatory custom-scrollbar pb-32"
      >
        {/* Floating Wedding Atmosphere Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Cinematic Light Leaks with Organic Movement */}
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.4, 0.2, 0.4, 0.1],
              scale: [1, 1.3, 1.1, 1.4, 1],
              rotate: [0, 120, 240, 360],
              x: ["-10%", "10%", "-5%", "5%", "-10%"],
              y: ["-10%", "5%", "10%", "-5%", "-10%"]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(circle,rgba(197,160,89,0.2)_0%,transparent_70%)] blur-[120px]"
          />
          <motion.div 
            animate={{ 
              opacity: [0.05, 0.25, 0.15, 0.3, 0.05],
              scale: [1.3, 1, 1.2, 1.1, 1.3],
              rotate: [360, 240, 120, 0],
              x: ["10%", "-10%", "5%", "-5%", "10%"],
              y: ["10%", "-5%", "-10%", "5%", "10%"]
            }}
            transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle,rgba(128,0,0,0.15)_0%,transparent_70%)] blur-[120px]"
          />

          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                x: Math.random() * 100 + "%", 
                y: "110%",
                rotate: 0,
                scale: Math.random() * 0.4 + 0.1
              }}
              animate={{ 
                opacity: [0, 0.8, 0], 
                y: "-10%",
                x: (Math.random() * 100 - 50) + "%",
                rotate: Math.random() * 1080
              }}
              transition={{ 
                duration: Math.random() * 25 + 20, 
                repeat: Infinity, 
                delay: Math.random() * 20,
                ease: "linear"
              }}
              className="absolute"
            >
              <div className="w-1 h-1 bg-gold/50 rounded-full blur-[0.5px] shadow-[0_0_8px_rgba(197,160,89,0.6)]" />
            </motion.div>
          ))}
        </div>

        {/* Hero Section */}
        <section id="home" className="relative h-[100dvh] flex flex-col items-center justify-end pb-32 text-center px-6 overflow-hidden snap-start">
          <div className="absolute inset-0">
            <SafeImage 
              src="https://archive.org/download/hero_20260406_202604/Hero.jpg"
              alt="Hero Couple" 
              className="w-full h-full object-cover object-top"
              motionProps={{
                initial: { scale: 1.2 },
                animate: { scale: 1 },
                transition: { duration: 10 }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/40 to-transparent" />
            <div className="absolute inset-0 bg-pattern opacity-5" />
          </div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative z-10"
          >
            <motion.div variants={itemVariants} className="text-gold font-display tracking-[0.3em] text-xs mb-4">WE ARE GETTING MARRIED</motion.div>
            <AnimatedText text={`${WEDDING_DATA.groom.name} & ${WEDDING_DATA.bride.name}`} className="text-6xl font-cursive text-maroon-900 mb-4 drop-shadow-sm" delay={1} />
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 text-maroon-900/60 tracking-[0.2em] uppercase text-[10px] font-bold">
              <span>{new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(WEDDING_DATA.eventDate))}</span>
              <div className="w-1 h-1 bg-gold rounded-full" />
              <span>{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(WEDDING_DATA.eventDate))}</span>
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

        {/* Couple Section */}
        <section id="couple" className="py-16 md:py-24 px-6 md:px-8 text-center relative snap-start min-h-[100dvh] flex flex-col justify-center overflow-hidden">
          <Ornament className="absolute top-10 left-1/2 -translate-x-1/2 opacity-5 w-48 h-48 md:w-64 md:h-64" />
          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, 50]) }}
            className="absolute inset-0 opacity-5 bg-pattern pointer-events-none" 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mb-12 md:mb-16 relative z-10"
          >
            <Heart className="w-8 h-8 md:w-10 md:h-10 text-gold mx-auto mb-6 md:mb-8 animate-pulse" />
            <AnimatedText text="ASSALAMUALAIKUM WR. WB." className="text-gold font-display tracking-widest text-[10px] md:text-sm mb-4 md:mb-6" delay={0.8} />
            <motion.p 
              variants={premiumReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="italic text-maroon-900/80 mb-6 md:mb-8 leading-relaxed font-serif text-base md:text-lg px-2 md:px-4"
            >
              "{WEDDING_DATA.quotes}"
            </motion.p>
            <motion.p 
              variants={premiumReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-gold font-bold text-sm"
            >
              {WEDDING_DATA.quotesSource}
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
            className="space-y-24 md:space-y-40 relative z-10"
          >
            {/* Groom */}
            <motion.div
              variants={groomReveal}
              className="group will-change-transform"
            >
              <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 md:mb-12">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                  whileInView={{ scale: 1.1, opacity: 1, rotate: 45 }}
                  transition={{ delay: 0.4, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 border-2 border-gold/30 rounded-full" 
                />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                  whileInView={{ scale: 1.05, opacity: 1, rotate: -15 }}
                  transition={{ delay: 0.6, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-2 border border-gold/20 rounded-full" 
                />
                <div className="absolute inset-4 overflow-hidden rounded-full shadow-2xl flex items-center justify-center bg-maroon-900/10 ring-4 ring-gold/10">
                  <RevealImage 
                    src={WEDDING_DATA.groom.image} 
                    alt="Groom" 
                    className="w-full h-full" 
                    objectPosition="top"
                    delay={0.5}
                  />
                </div>
              </div>
              <motion.h3 
                variants={{
                  hidden: { opacity: 0, y: 30, filter: "blur(15px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.8 } }
                }} 
                className="text-3xl md:text-5xl font-cursive text-maroon-800 mb-3 md:mb-4"
              >
                {WEDDING_DATA.groom.fullName}
              </motion.h3>
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.0 } }
                }} 
                className="text-xs md:text-base text-maroon-900/60 italic mb-6 md:mb-8"
              >
                Putra dari {WEDDING_DATA.groom.father} & {WEDDING_DATA.groom.mother}
              </motion.p>
              {/* <motion.a
                href={WEDDING_DATA.groom.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold hover:text-maroon-800 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-sm font-medium">@{WEDDING_DATA.groom.instagram.split('/').pop()}</span>
              </motion.a> */}
            </motion.div>

            <motion.div 
              variants={premiumReveal}
              className="relative py-4 md:py-8"
            >
              <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gold/20" />
              <div className="relative z-10 bg-cream inline-block px-6 md:px-8 text-4xl md:text-6xl font-cursive text-gold">dan</div>
            </motion.div>

            {/* Bride */}
            <motion.div
              variants={brideReveal}
              className="group will-change-transform"
            >
              <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-8 md:mb-12">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                  whileInView={{ scale: 1.1, opacity: 1, rotate: -45 }}
                  transition={{ delay: 0.6, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 border-2 border-gold/30 rounded-full" 
                />
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                  whileInView={{ scale: 1.05, opacity: 1, rotate: 15 }}
                  transition={{ delay: 0.8, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-2 border border-gold/20 rounded-full" 
                />
                <div className="absolute inset-4 overflow-hidden rounded-full shadow-2xl flex items-center justify-center bg-maroon-900/10 ring-4 ring-gold/10">
                  <RevealImage 
                    src={WEDDING_DATA.bride.image} 
                    alt="Bride" 
                    className="w-full h-full" 
                    objectPosition="top"
                    delay={0.7}
                  />
                </div>
              </div>
              <motion.h3 
                variants={{
                  hidden: { opacity: 0, y: 30, filter: "blur(15px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1.0 } }
                }} 
                className="text-3xl md:text-5xl font-cursive text-maroon-800 mb-3 md:mb-4"
              >
                {WEDDING_DATA.bride.fullName}
              </motion.h3>
              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.2 } }
                }} 
                className="text-xs md:text-base text-maroon-900/60 italic mb-6 md:mb-8"
              >
                Putri dari {WEDDING_DATA.bride.father} & {WEDDING_DATA.bride.mother}
              </motion.p>
              {/* <motion.a
                href={WEDDING_DATA.bride.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold hover:text-maroon-800 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-sm font-medium">@{WEDDING_DATA.bride.instagram.split('/').pop()}</span>
              </motion.a> */}
            </motion.div>
          </motion.div>
        </section>

        {/* Event Section */}
        <section id="event" className="py-24 px-8 bg-maroon-950 text-cream relative overflow-hidden snap-start min-h-[100dvh] flex flex-col justify-center">
          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
            className="absolute inset-0 opacity-10 bg-pattern pointer-events-none" 
          />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cream to-transparent opacity-10" />
          
          <div className="relative z-10">
            <motion.div
              variants={premiumReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <AnimatedText text="Save The Date" className="text-5xl font-cursive text-gold mb-2" delay={0.6} />
              <div className="w-16 h-[1px] bg-gold/50 mx-auto mb-6" />
              <Countdown />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-8 flex flex-col items-center relative"
              >
                {/* State-based Interactive Calendar Button */}
                <div className="relative">
                  <motion.div
                    initial={false}
                    animate={activeSection === 'calendar-menu' ? "open" : "closed"}
                    className="flex flex-col items-center"
                  >
                    <AnimatePresence>
                      {activeSection === 'calendar-menu' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: -10, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute bottom-full mb-4 flex flex-col gap-2 w-56 z-[120]"
                        >
                          <motion.a
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            href={`https://www.google.com/calendar/render?action=TEMPLATE&text=The+Wedding+of+${WEDDING_DATA.groom.name}+%26+${WEDDING_DATA.bride.name}&dates=${WEDDING_DATA.calendarStart}/${WEDDING_DATA.calendarEnd}&details=Pernikahan+${WEDDING_DATA.groom.name}+%26+${WEDDING_DATA.bride.name}%0A%0AAcara+dimulai+pukul+${new Date(WEDDING_DATA.eventDate).getHours()}.00+WIB%0ALokasi:+${WEDDING_DATA.location.name}&location=${WEDDING_DATA.location.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 bg-white text-blue-600 py-3 rounded-2xl font-bold shadow-xl border border-blue-100 text-sm"
                          >
                            <img src="https://www.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png" alt="Google" className="w-4 h-4" referrerPolicy="no-referrer" />
                            Google Calendar
                          </motion.a>
                          
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              const icsContent = [
                                "BEGIN:VCALENDAR",
                                "VERSION:2.0",
                                `PRODID:-//Wedding Invitation//${WEDDING_DATA.groom.name} ${WEDDING_DATA.bride.name}//EN`,
                                "METHOD:PUBLISH",
                                "BEGIN:VEVENT",
                                "UID:" + Date.now() + "@wedding-invitation.com",
                                "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
                                `DTSTART:${WEDDING_DATA.calendarStart}`,
                                `DTEND:${WEDDING_DATA.calendarEnd}`,
                                `SUMMARY:The Wedding of ${WEDDING_DATA.groom.name} & ${WEDDING_DATA.bride.name}`,
                                `DESCRIPTION:Pernikahan ${WEDDING_DATA.groom.name} & ${WEDDING_DATA.bride.name}\n\nAcara dimulai pukul ${new Date(WEDDING_DATA.eventDate).getHours()}.00 WIB\nLokasi: ${WEDDING_DATA.location.name}`,
                                `LOCATION:${WEDDING_DATA.location.name}`,
                                "STATUS:CONFIRMED",
                                "SEQUENCE:0",
                                "BEGIN:VALARM",
                                "TRIGGER:-PT5H",
                                "ACTION:DISPLAY",
                                `DESCRIPTION:Pengingat: Pernikahan ${WEDDING_DATA.groom.name} & ${WEDDING_DATA.bride.name} akan dimulai dalam 5 jam`,
                                "END:VALARM",
                                "END:VEVENT",
                                "END:VCALENDAR"
                              ].join("\r\n");
                              const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
                              const url = window.URL.createObjectURL(blob);
                              const link = document.body.appendChild(document.createElement("a"));
                              link.href = url;
                              link.download = `wedding-${WEDDING_DATA.groom.name.toLowerCase()}-${WEDDING_DATA.bride.name.toLowerCase()}.ics`;
                              link.click();
                              setTimeout(() => {
                                window.URL.revokeObjectURL(url);
                                link.remove();
                              }, 100);
                            }}
                            className="flex items-center justify-center gap-3 bg-maroon-900 text-gold py-3 rounded-2xl font-bold shadow-xl border border-gold/30 text-sm"
                          >
                            <Calendar className="w-4 h-4" />
                            Kalender HP (Sistem)
                          </motion.button>
                          
                          {/* Triangle Pointer */}
                          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white self-center -mt-1 shadow-xl" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveSection(activeSection === 'calendar-menu' ? 'event' : 'calendar-menu')}
                      animate={{ 
                        boxShadow: activeSection === 'calendar-menu' 
                          ? "0 0 0 rgba(197,160,89,0)" 
                          : [
                            "0 10px 30px rgba(197,160,89,0.3)", 
                            "0 10px 40px rgba(197,160,89,0.6)", 
                            "0 10px 30px rgba(197,160,89,0.3)"
                          ]
                      }}
                      transition={{ 
                        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className={cn(
                        "inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold transition-all duration-300 relative z-[130]",
                        activeSection === 'calendar-menu' 
                          ? "bg-cream text-maroon-950 border-2 border-gold" 
                          : "bg-gold text-maroon-950"
                      )}
                    >
                      <Calendar className={cn("w-5 h-5", activeSection === 'calendar-menu' && "animate-bounce")} />
                      {activeSection === 'calendar-menu' ? "Pilih Kalender" : "Simpan ke Kalender"}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            <div className="space-y-10">
              <motion.div 
                variants={premiumRevealLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-cream/5 border-l-4 border-gold p-8 rounded-r-3xl backdrop-blur-md relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity">
                  <Calendar size={80} />
                </div>
                <h3 className="text-3xl font-display font-bold text-gold mb-4">Akad Nikah</h3>
                <div className="space-y-3 text-cream/80">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-gold" />
                    <span className="text-lg font-medium">08.00 - 10.00 WIB</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gold" />
                    <span className="text-lg">{new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(WEDDING_DATA.eventDate))}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={premiumRevealRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-cream/5 border-r-4 border-gold p-8 rounded-l-3xl backdrop-blur-md text-right relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 p-4 opacity-10 transition-opacity">
                  <Sparkles size={80} />
                </div>
                <h3 className="text-3xl font-display font-bold text-gold mb-4">Resepsi</h3>
                <div className="space-y-3 text-cream/80">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-lg font-medium">11.00 - Selesai</span>
                    <Clock size={18} className="text-gold" />
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-lg">{new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(WEDDING_DATA.eventDate))}</span>
                    <Calendar size={18} className="text-gold" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={premiumReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-gold/10 border border-gold/30 p-8 rounded-3xl text-center backdrop-blur-md overflow-hidden"
              >
                <MapPin className="w-10 h-10 text-gold mx-auto mb-6 animate-bounce" />
                <h3 className="text-3xl font-display font-bold text-gold mb-4">Lokasi Acara</h3>
                <p className="mb-8 text-cream/90 text-lg leading-relaxed">
                  {WEDDING_DATA.location.name}<br />
                  <span className="text-sm text-cream/60">{WEDDING_DATA.location.address}</span>
                </p>
                
                {/* Embedded Google Maps */}
                <div className="w-full h-64 rounded-2xl overflow-hidden border-2 border-gold/30 mb-8 shadow-2xl">
                  <iframe 
                    src={WEDDING_DATA.location.embedUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Acara"
                  ></iframe>
                </div>

                <motion.a 
                  whileTap={{ scale: 0.95 }}
                  href={WEDDING_DATA.location.mapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gold text-maroon-950 px-8 py-3 rounded-full font-bold shadow-xl transition-colors"
                >
                  Petunjuk Jalan (Google Maps)
                </motion.a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-24 px-4 bg-cream relative snap-start min-h-[100dvh] flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <AnimatedText text="Our Gallery" className="text-5xl font-cursive text-maroon-900 mb-4" delay={0.5} />
            <p className="text-gold font-display tracking-widest text-[10px]">MOMENTS OF LOVE</p>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 gap-3"
          >
            {WEDDING_DATA.gallery.map((img, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={cn(
                  "overflow-hidden rounded-2xl shadow-lg border border-gold/10",
                  (i + 1) % 3 === 0 ? "col-span-2 aspect-video" : "aspect-[3/4]"
                )}
              >
                <RevealImage 
                  src={img} 
                  alt={`Gallery ${i + 1}`} 
                  className="w-full h-full transition-transform duration-1000"
                  delay={i * 0.25}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Digital Envelope Section */}
        <section id="gift" className="py-24 px-8 bg-maroon-900 text-cream relative snap-start min-h-[100dvh] flex flex-col justify-center">
          <div className="absolute inset-0 opacity-10 bg-pattern pointer-events-none" />
          <motion.div 
            variants={premiumReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative z-10 text-center"
          >
            <Gift className="w-12 h-12 text-gold mx-auto mb-6" />
            <AnimatedText text="Kado Digital" className="text-4xl font-cursive text-gold mb-4" delay={0.5} />
            <p className="text-cream/70 mb-12 text-sm leading-relaxed">
              Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, Anda dapat mengirimkannya melalui:
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {WEDDING_DATA.banks.map((item, i) => (
              <motion.div 
                key={i}
                variants={itemVariants}
                className="bg-cream/10 p-6 rounded-2xl border border-gold/20 backdrop-blur-sm"
              >
                <div className="text-gold font-bold text-xl mb-2">{item.bank}</div>
                <div className="text-2xl font-display tracking-widest mb-2">{item.number}</div>
                <div className="text-cream/60 text-sm mb-4">a.n {item.owner}</div>
                <button 
                  onClick={() => copyToClipboard(item.number, item.bank)}
                  className="inline-flex items-center gap-2 text-xs bg-gold/20 text-gold px-4 py-2 rounded-full transition-all"
                >
                  {copied === item.bank ? <Check size={14} /> : <Copy size={14} />}
                  {copied === item.bank ? 'Berhasil Disalin' : 'Salin Rekening'}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* RSVP & Wishes Section */}
        <section id="rsvp" className="py-24 px-8 bg-cream relative snap-start min-h-[100dvh] flex flex-col justify-center">
          <div className="absolute inset-0 opacity-5 bg-pattern pointer-events-none" />
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <div className="text-center mb-16">
              <AnimatedText text="Konfirmasi & Ucapan" className="text-5xl font-cursive text-maroon-900 mb-4" delay={0.5} />
              <p className="text-gold font-display tracking-widest text-[10px]">RSVP & GUEST BOOK</p>
            </div>
            
            <motion.form 
              variants={premiumReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              onSubmit={addWish} 
              className="mb-16 space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gold/10"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-maroon-900/40 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  placeholder="Masukkan nama Anda"
                  required
                  value={newWish.name}
                  onChange={(e) => setNewWish({ ...newWish, name: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gold/20 bg-cream/30 focus:ring-2 focus:ring-gold outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-maroon-900/40 uppercase tracking-widest ml-1">Konfirmasi Kehadiran</label>
                  <div className="flex gap-3">
                    {['Hadir', 'Tidak Hadir'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setNewWish({ ...newWish, attendance: status as any })}
                        className={cn(
                          "flex-1 py-3 rounded-xl border text-sm font-bold transition-all",
                          newWish.attendance === status 
                            ? "bg-maroon-900 text-gold border-maroon-900 shadow-lg" 
                            : "bg-cream/30 border-gold/20 text-maroon-900/60"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-maroon-900/40 uppercase tracking-widest ml-1">Jumlah Tamu</label>
                  <select 
                    value={newWish.guests}
                    onChange={(e) => setNewWish({ ...newWish, guests: parseInt(e.target.value) })}
                    className="w-full p-3.5 rounded-xl border border-gold/20 bg-cream/30 focus:ring-2 focus:ring-gold outline-none transition-all appearance-none"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Orang</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-maroon-900/40 uppercase tracking-widest ml-1">Pesan Ucapan & Doa</label>
                <textarea 
                  placeholder="Tuliskan doa dan harapan terbaik Anda..."
                  rows={4}
                  required
                  value={newWish.message}
                  onChange={(e) => setNewWish({ ...newWish, message: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gold/20 bg-cream/30 focus:ring-2 focus:ring-gold outline-none transition-all resize-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full bg-maroon-900 text-gold py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                <Send size={18} /> {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi & Ucapan'}
              </button>
            </motion.form>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
              {wishes.map((wish) => (
                <motion.div 
                  key={wish.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-gold group transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-maroon-900 text-lg flex items-center gap-2">
                        {wish.name}
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                          wish.attendance === 'Hadir' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {wish.attendance}
                        </span>
                      </h4>
                      {wish.attendance === 'Hadir' && (
                        <p className="text-[10px] text-maroon-900/40 font-bold uppercase mt-1">Membawa {wish.guests} Tamu</p>
                      )}
                    </div>
                    <span className="text-[10px] text-maroon-900/30 font-bold uppercase bg-maroon-900/5 px-2 py-1 rounded">{wish.date}</span>
                  </div>
                  <p className="text-maroon-900/70 leading-relaxed italic">"{wish.message}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer id="footer" className="py-20 text-center bg-maroon-950 text-cream relative overflow-hidden snap-start min-h-[100dvh] flex flex-col justify-center">
          <div className="absolute inset-0 opacity-10 bg-pattern pointer-events-none" />
          <motion.div 
            variants={premiumReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative z-10"
          >
            <AnimatedText text="Terima Kasih" className="text-4xl font-cursive text-gold mb-6" />
            <motion.p variants={premiumReveal} className="text-sm text-cream/60 mb-12 max-w-[280px] mx-auto leading-relaxed">
              Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.
            </motion.p>
            <motion.div variants={premiumReveal} className="text-gold font-display tracking-[0.4em] text-xs mb-4">{WEDDING_DATA.groom.name.toUpperCase()} & {WEDDING_DATA.bride.name.toUpperCase()}</motion.div>
            <motion.div variants={premiumReveal} className="text-[10px] text-cream/30 uppercase tracking-widest">© {new Date().getFullYear()} Digital Invitation by VhiOne Productions</motion.div>
          </motion.div>
        </footer>
      </motion.div>
    </div>
  );
};

// ==========================================
// SECTION: ROOT APP COMPONENT
// ==========================================
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  // State untuk menyimpan nama tamu dari URL
  const [guestName, setGuestName] = useState('Tamu Undangan');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Daftar aset yang harus dimuat sebelum aplikasi siap
    const criticalAssets = [
      ...WEDDING_DATA.gallery.slice(0, 3),
      WEDDING_DATA.groom.image,
      WEDDING_DATA.bride.image,
      WEDDING_DATA.bgMusic
    ];

    let loadedCount = 0;
    const totalAssets = criticalAssets.length;

    const updateProgress = () => {
      loadedCount++;
      const newProgress = (loadedCount / totalAssets) * 100;
      setLoadProgress(newProgress);
      if (loadedCount >= totalAssets) {
        setTimeout(() => setIsAppReady(true), 800);
      }
    };

    criticalAssets.forEach(url => {
      if (url.endsWith('.mp3')) {
        const audio = new Audio();
        audio.src = url;
        audio.oncanplaythrough = updateProgress;
        audio.onerror = updateProgress;
      } else {
        const img = new Image();
        img.src = url;
        img.onload = updateProgress;
        img.onerror = updateProgress;
      }
    });

    const timer = setTimeout(() => {
      if (!isAppReady) setIsAppReady(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fitur: Mengambil nama tamu dari URL
    const getGuestName = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        
        // Bersihkan URL dari parameter 'origin' yang sering muncul di AI Studio
        if (searchParams.has('origin')) {
          searchParams.delete('origin');
          const newRelativePathQuery = window.location.pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
          window.history.replaceState(null, '', newRelativePathQuery);
        }

        const toParam = searchParams.get('to') || searchParams.get('n');
        
        if (toParam) {
          return decodeURIComponent(toParam).trim();
        }

        const path = window.location.pathname;
        if (path && path !== '/' && path !== '/index.html') {
          // Menghapus "/" di awal, decode URL, dan ganti "_" jadi spasi
          const decodedName = decodeURIComponent(path.substring(1)).replace(/_/g, ' ');
          if (decodedName && decodedName.trim() !== '' && !decodedName.includes('?')) {
            return decodedName.trim();
          }
        }
      } catch (e) {
        console.error("Gagal mengambil nama tamu dari URL", e);
      }
      return 'Tamu Undangan';
    };

    setGuestName(getGuestName());

    // Auth state listener (currently just sets ready state since rules are public)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(true);
    });

    // Connection test
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Music play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Music autoplay failed:", e));
      setIsPlaying(true);
    }
  };

  // State untuk efek parallax pada amplop
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 15;
    const y = (clientY / window.innerHeight - 0.5) * 15;
    setMousePos({ x, y });
  };

  return (
    <div className="min-h-screen bg-maroon-950 font-sans text-maroon-900 selection:bg-gold/30 selection:text-gold overflow-x-hidden">
        {/* Audio Player */}
        <audio ref={audioRef} src={WEDDING_DATA.bgMusic} loop />
        
        <AnimatePresence mode="wait">
          {!isAppReady && (
            <Preloader key="preloader" progress={loadProgress} onComplete={() => setIsAppReady(true)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isOpen && isAppReady ? (
            /* --- SECTION: PREMIUM ENVELOPE (COVER) --- */
            <motion.div
              key="cover"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: 0,
                transition: { duration: 1.2, ease: "easeInOut", delay: 0.8 }
              }}
              onMouseMove={handleMouseMove}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-maroon-950 overflow-hidden h-[100dvh] w-full"
              style={{ perspective: "2000px" }}
            >
              <div className="absolute inset-0 opacity-40 bg-pattern pointer-events-none" />
              
              {/* Immersive Light Rays */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(197,160,89,0.1),transparent_70%)] animate-pulse" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(197,160,89,0.25),transparent_70%)]" />

              {/* Light Burst Effect (Triggered on Open) */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={isOpen ? { opacity: 0.4, scale: 4 } : {}}
                transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,transparent_70%)] z-50 pointer-events-none"
              />

              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 100 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: [0, -10, 0],
                  rotateY: mousePos.x,
                  rotateX: -mousePos.y
                }}
                transition={{ 
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 2, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 2, ease: [0.22, 1, 0.36, 1] },
                  rotateY: { duration: 0.1 },
                  rotateX: { duration: 0.1 }
                }}
                className="relative w-full h-full md:max-w-md md:h-auto md:aspect-[3/5] flex items-center justify-center z-10"
              >
                {/* Envelope Back with Shimmer */}
                <div className="absolute inset-0 bg-maroon-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] border-x border-gold/20 md:rounded-sm md:border overflow-hidden">
                  <div className="absolute inset-0 opacity-15 bg-pattern" />
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent skew-x-12"
                  />
                </div>

                {/* Invitation Card (The one that zooms in) */}
                <motion.div
                  exit={{ 
                    scale: 1.5,
                    opacity: 0,
                    transition: { duration: 1, ease: "easeOut" }
                  }}
                  className="absolute inset-0 md:inset-4 bg-maroon-900 md:rounded-sm shadow-inner overflow-hidden z-50 flex flex-col items-center justify-center p-6 md:p-8 border-[10px] border-gold/10"
                >
                  {/* Decorative Border */}
                  <div className="absolute inset-4 border border-gold/50 pointer-events-none" />
                  <div className="absolute inset-6 border-2 border-gold/25 pointer-events-none" />

                  {/* Corner Ornaments */}
                  <div className="absolute top-6 left-6 text-gold/60 rotate-0"><Sparkles size={24} /></div>
                  <div className="absolute top-6 right-6 text-gold/60 rotate-90"><Sparkles size={24} /></div>
                  <div className="absolute bottom-6 left-6 text-gold/60 -rotate-90"><Sparkles size={24} /></div>
                  <div className="absolute bottom-6 right-6 text-gold/60 rotate-180"><Sparkles size={24} /></div>

                  <div className="relative z-10 text-center space-y-8 md:space-y-10 w-full px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5, duration: 1.5 }}
                      className="space-y-3"
                    >
                      <p className="text-gold font-display tracking-[0.4em] text-[9px] md:text-[11px] uppercase opacity-80">The Wedding Invitation of</p>
                      <h1 className="text-5xl md:text-7xl font-cursive text-gold drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{WEDDING_DATA.groom.name} & {WEDDING_DATA.bride.name}</h1>
                    </motion.div>

                    <div className="w-20 md:w-32 h-[1px] bg-gradient-to-r from-transparent via-gold/60 to-transparent mx-auto" />

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.2, duration: 2, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-5"
                    >
                      <div className="inline-block px-5 py-7 md:px-8 md:py-10 border border-gold/40 bg-gold/5 rounded-sm relative w-full max-w-[300px] md:max-w-sm shadow-2xl group">
                        {/* Shimmer Effect Container */}
                        <div className="absolute inset-0 overflow-hidden rounded-sm pointer-events-none">
                          <motion.div 
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 2 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent skew-x-12"
                          />
                        </div>
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-maroon-900 px-4 py-0.5 border border-gold/30 rounded-full text-[9px] md:text-[11px] text-gold font-bold uppercase tracking-[0.2em] whitespace-nowrap z-20">Kepada Yth.</div>
                        <p className="text-gold/70 text-[11px] md:text-sm italic mb-2 font-serif relative z-10">Bapak/Ibu/Saudara/i</p>
                        <h2 className="text-2xl md:text-4xl font-serif font-bold text-cream tracking-tight break-words drop-shadow-md relative z-10">{guestName}</h2>
                      </div>
                    </motion.div>

                    <div className="pt-6 md:pt-10">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        animate={{ 
                          boxShadow: ["0 0 0px 0px rgba(197,160,89,0)", "0 0 20px 5px rgba(197,160,89,0.3)", "0 0 0px 0px rgba(197,160,89,0)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        onClick={handleOpen}
                        className="relative group"
                      >
                        {/* Wax Seal Effect */}
                        <div className="absolute inset-0 bg-maroon-800 rounded-full blur-xl opacity-50 transition-opacity" />
                        <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-maroon-700 via-maroon-900 to-black rounded-full shadow-[0_15px_30px_-5px_rgba(0,0,0,0.8)] border-4 border-gold/40 flex flex-col items-center justify-center text-gold transition-all duration-500">
                          <div className="absolute inset-0 rounded-full border border-gold/20 scale-90 animate-spin-slow" />
                          <Heart className="w-8 h-8 md:w-10 md:h-10 mb-1.5 fill-gold/30 transition-all duration-500" />
                          <span className="text-[9px] font-bold tracking-[0.15em] uppercase">Buka</span>
                        </div>
                        
                        {/* Animated Rings */}
                        <motion.div 
                          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="absolute inset-0 border-2 border-gold/40 rounded-full"
                        />
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                          className="absolute inset-0 border border-gold/20 rounded-full"
                        />
                      </motion.button>
                      <p className="mt-6 text-[9px] md:text-[11px] text-gold font-bold tracking-[0.3em] uppercase animate-pulse opacity-80">Klik untuk membuka</p>
                    </div>
                  </div>
                </motion.div>

                {/* Envelope Flap (Top) */}
                <motion.div 
                  className="absolute top-0 left-0 w-full h-[45%] bg-maroon-800 z-40 origin-top shadow-2xl"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                  exit={{ 
                    rotateX: -110,
                    opacity: 0,
                    transition: { duration: 0.8, ease: "easeInOut" }
                  }}
                >
                   <div className="absolute inset-0 opacity-25 bg-pattern" />
                   <div className="absolute inset-0 border-b-2 border-gold/30" />
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gold/10 rounded-full blur-xl" />
                </motion.div>
                
                {/* Envelope Front (Bottom & Sides) */}
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-full bg-maroon-900 z-30 shadow-inner border-x border-gold/10 md:border md:border-gold/20"
                  style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 92%, 50% 100%, 0 92%)' }}
                  exit={{ 
                    y: "100%",
                    opacity: 0,
                    transition: { duration: 0.8, ease: "easeInOut", delay: 0.1 }
                  }}
                >
                  <div className="absolute inset-0 opacity-15 bg-pattern" />
                  <div className="absolute inset-0 border-t-2 border-gold/20" />
                </motion.div>
              </motion.div>

              {/* Enhanced Floating Wedding Atmosphere - Paling Depan */}
              <div className="absolute inset-0 pointer-events-none z-[200]">
                {/* Varied Petals & Sparkles */}
                {[...Array(45)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0, 
                      x: Math.random() * 100 + "%", 
                      y: -50,
                      rotate: 0,
                      scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      y: "110vh",
                      x: (Math.random() * 100 - 50) + "%",
                      rotate: Math.random() * 720 - 360,
                      skewX: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: Math.random() * 12 + 10, 
                      repeat: Infinity, 
                      delay: Math.random() * 10,
                      ease: "linear",
                      skewX: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute"
                  >
                    {i % 4 === 0 ? (
                      <Heart className="text-red-500/40 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" size={Math.random() * 20 + 15} fill="currentColor" />
                    ) : i % 4 === 1 ? (
                      <Heart className="text-gold/50 drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]" size={Math.random() * 15 + 10} fill="currentColor" />
                    ) : i % 4 === 2 ? (
                      <Sparkles className="text-cream/60" size={Math.random() * 12 + 8} />
                    ) : (
                      <div className="w-2 h-2 bg-gold/40 rounded-full blur-[1px]" />
                    )}
                  </motion.div>
                ))}
                
                {/* Immersive Gold Dust (Explosion on Open) */}
                {[...Array(60)].map((_, i) => (
                  <motion.div
                    key={`dust-${i}`}
                    initial={{ 
                      opacity: 0, 
                      x: "50%", 
                      y: "50%",
                    }}
                    animate={isOpen ? {
                      opacity: [0, 1, 0],
                      x: (Math.random() * 300 - 150) + "vw",
                      y: (Math.random() * 300 - 150) + "vh",
                      scale: [0, 2, 0],
                      rotate: Math.random() * 720
                    } : {}}
                    transition={{ 
                      duration: Math.random() * 3 + 2,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.3
                    }}
                    className="absolute w-2 h-2 bg-gold rounded-full blur-[1.5px] z-50"
                  />
                ))}
              </div>

              {/* Transition Curtain Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isOpen ? { 
                  opacity: [0, 1, 0],
                  transition: { duration: 1.5, times: [0, 0.4, 1], ease: "easeInOut" }
                } : {}}
                className="absolute inset-0 bg-maroon-950 z-[150] pointer-events-none"
              />
            </motion.div>
          ) : (
            /* --- Main Content Reveal --- */
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
              className="relative w-full h-full"
            >
              <InvitationContent isPlaying={isPlaying} toggleMusic={toggleMusic} guestName={guestName} />
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
          
          :root {
            --font-cursive: 'Alex Brush', cursive;
            --font-serif: 'Cormorant Garamond', serif;
            --font-sans: 'Montserrat', sans-serif;
          }

          .font-cursive { font-family: var(--font-cursive); }
          .font-serif { font-family: var(--font-serif); }
          .font-display { font-family: var(--font-sans); }

          .bg-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5a059' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6zM36 4V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c5a059;
            border-radius: 10px;
          }
        `}</style>
      </div>
  );
}
