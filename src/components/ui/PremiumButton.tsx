import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface PremiumButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function PremiumButton({ onClick, children, className = "" }: PremiumButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative px-10 py-5 rounded-2xl bg-[#0a0a1a] border border-white/10 overflow-hidden transition-all duration-500 hover:border-accent-glow/50 shadow-2xl ${className}`}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-glow/20 via-transparent to-[#a855f7]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated Shimmer Line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            translateX: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] w-1/2"
        />
      </div>

      {/* Internal Content */}
      <div className="relative flex items-center justify-center gap-4 z-10">
        <div className="flex flex-col items-start text-left leading-none">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-glow/60 group-hover:text-accent-glow transition-colors mb-1">Initiate Mission</span>
          <span className="text-[15px] font-black uppercase tracking-[0.1em] text-white flex items-center gap-2">
            {children}
          </span>
        </div>
        
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent-glow group-hover:border-accent-glow transition-all duration-500 shadow-lg group-hover:shadow-accent-glow/40">
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Subtle Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-accent-glow/0 group-hover:border-accent-glow/50 transition-all duration-500" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-accent-glow/0 group-hover:border-accent-glow/50 transition-all duration-500" />
      
      {/* Radial Glow on Hover */}
      <div className="absolute -inset-1 bg-accent-glow/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
    </motion.button>
  );
}
