import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WEDDING_DATA } from '../constants';

export const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const weddingDate = new Date(WEDDING_DATA.eventDate);
    const timer = setInterval(() => {
      const now = new Date();
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
          transition={{ delay: i * 0.1, type: "spring" }}
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

export default React.memo(Countdown);
