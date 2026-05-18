import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = React.useState<'enter' | 'hold' | 'exit'>('enter');

  React.useEffect(() => {
    const holdTimer = setTimeout(() => setPhase('hold'), 1000);
    const exitTimer = setTimeout(() => setPhase('exit'), 2500);
    const doneTimer = setTimeout(() => onComplete(), 3500);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#5B0E1A' }}
          data-testid="loading-screen"
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)' }} />
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
            className="absolute top-[30%] left-1/2 -translate-x-1/2 w-48 h-px"
            style={{ backgroundColor: '#D4AF37' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center gap-2 px-8 text-center"
          >
            <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-xs tracking-[0.5em] mb-1" style={{ color: '#D4AF37' }}>
              ✦ ✦ ✦
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest uppercase" style={{ fontFamily: "'Playfair Display', serif", color: '#D4AF37', letterSpacing: '0.12em' }}>
              FORGIVE ME,
            </h1>
            <span className="text-5xl md:text-6xl -mt-2" style={{ fontFamily: "'Great Vibes', cursive", color: '#D4AF37' }}>
              Sister.
            </span>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }} className="flex flex-col items-center gap-1 mt-3">
              <div className="w-12 h-px mb-2" style={{ backgroundColor: '#D4AF37', opacity: 0.5 }} />
              <p className="text-sm tracking-[0.3em] uppercase" style={{ fontFamily: "'Inter', sans-serif", color: '#C8A2AD', letterSpacing: '0.25em' }}>
                Confess. Heal. Be Free.
              </p>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
            className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-48 h-px"
            style={{ backgroundColor: '#D4AF37' }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
