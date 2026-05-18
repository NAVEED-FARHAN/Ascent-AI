import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import MagicRings from './MagicRings';

export default function LoadingScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-bg-primary flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <MagicRings
            color="#7c6ffa"
            colorTwo="#6366F1"
            ringCount={8}
            speed={0.5}
            attenuation={8}
            lineThickness={2.5}
            baseRadius={0.2}
            radiusStep={0.12}
            scaleRate={0.08}
            opacity={0.6}
            blur={2}
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-glow/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-10">
        {/* Neural Core Synthesis (Glow-Focused) */}
        <div className="relative mb-24">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Ambient Neural Pulsar */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-accent-glow/10 blur-[60px] rounded-full"
            />
            
            {/* Central Core */}
            <div className="relative">
              <motion.div 
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent-glow to-[#a855f7] p-[2px]"
              >
                <div className="w-full h-full rounded-full bg-bg-primary flex items-center justify-center" />
              </motion.div>
              
              {/* External Orbitals (Glow Lines) */}
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: i === 0 ? 360 : -360 }}
                  transition={{ duration: 8 + i * 4, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-accent-glow/10 rounded-full"
                />
              ))}
            </div>

            {/* Neural Sync Particles */}
            <div className="absolute inset-0">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -40, 0],
                    opacity: [0, 0.5, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    delay: i * 0.5,
                    ease: "easeInOut" 
                  }}
                  className="absolute w-1 h-1 bg-accent-glow rounded-full"
                  style={{ 
                    left: `${20 + i * 15}%`, 
                    top: `${40 + (i % 2) * 20}%` 
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-[9px] font-black uppercase tracking-[0.6em] text-accent-glow/50 mb-2">Neural Synthesis Active</h2>
          <h1 className="text-5xl md:text-6xl font-serif italic text-text-primary tracking-tighter leading-none">
            Materializing <span className="text-accent-glow">Architecture</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
            >.</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.2 }}
            >.</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.4 }}
            >.</motion.span>
          </h1>
          <p className="max-w-md mx-auto text-lg text-text-muted font-serif italic leading-relaxed opacity-45 text-center">
            Consulting the neural nodes to architect <br className="hidden sm:inline" /> your optimal learning trajectory.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
