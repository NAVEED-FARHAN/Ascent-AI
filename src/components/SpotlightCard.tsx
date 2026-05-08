import React from 'react';
import { motion } from 'motion/react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  showBorderBeam?: boolean;
}

export default function SpotlightCard({ children, className = '', showBorderBeam = false }: SpotlightCardProps) {
  return (
    <div className={`group relative p-8 rounded-[2.5rem] bg-bg-secondary/40 border border-border-pill overflow-hidden transition-all hover:bg-bg-secondary/60 hover:border-accent-glow/20 shadow-2xl ${className}`}>
      {showBorderBeam && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-glow to-transparent animate-beam" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
