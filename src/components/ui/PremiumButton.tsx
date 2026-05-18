import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface PremiumButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function PremiumButton({ onClick, children, className = "" }: PremiumButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative px-10 py-5 rounded-2xl bg-[#070715]/80 border border-white/[0.06] overflow-hidden transition-all duration-500 hover:border-accent-glow/30 shadow-2xl backdrop-blur-md ${className}`}
    >
      {/* Real-time Cursor Spotlight Background Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(130px circle at ${coords.x}px ${coords.y}px, rgba(124, 111, 250, 0.12), transparent 80%)`
        }}
      />
      
      {/* SVG Interactive Spotlight Border Trace */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl z-20">
        <rect
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="calc(100% - 1px)"
          rx="15"
          fill="none"
          stroke="url(#spotlight-border-gradient)"
          strokeWidth="1.5"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
        <defs>
          <radialGradient
            id="spotlight-border-gradient"
            cx={`${coords.x}px`}
            cy={`${coords.y}px`}
            r="90"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#7c6ffa" stopOpacity="0.8" />
            <stop offset="45%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Technical Blueprint Corner Markers */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-accent-glow/40 transition-colors duration-300 pointer-events-none" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-white/20 group-hover:border-accent-glow/40 transition-colors duration-300 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-white/20 group-hover:border-accent-glow/40 transition-colors duration-300 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-white/20 group-hover:border-accent-glow/40 transition-colors duration-300 pointer-events-none" />

      {/* Internal Content */}
      <div className="relative flex items-center justify-center gap-5 z-10">
        <div className="flex flex-col items-start text-left leading-none">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7c6ffa] mb-1.5">Initiate Mission</span>
          <span className="text-[15px] font-black uppercase tracking-[0.08em] text-white flex items-center gap-2">
            {children}
          </span>
        </div>
        
        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-accent-glow group-hover:border-accent-glow transition-all duration-300 shadow-lg group-hover:shadow-accent-glow/30">
          <motion.div
            animate={isHovered ? {
              x: [0, 24, -24, 0],
              opacity: [1, 0, 0, 1]
            } : { x: 0, opacity: 1 }}
            transition={{
              duration: 0.45,
              times: [0, 0.4, 0.6, 1],
              ease: "easeInOut"
            }}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Hidden ambient backdrop blur glow */}
      <div 
        className="absolute inset-0 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 pointer-events-none"
        style={{
          background: `radial-gradient(100px circle at ${coords.x}px ${coords.y}px, rgba(124,111,250,0.2), transparent)`
        }}
      />
    </motion.button>
  );
}
