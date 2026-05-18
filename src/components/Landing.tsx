import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Book, ArrowRight, Sparkles, Target, Layout, ShieldCheck } from 'lucide-react';
import { AnimatedThemeToggler } from './AnimatedThemeToggler';
import ArchitectBackground from './ArchitectBackground';
import PremiumButton from './ui/PremiumButton';

interface LandingProps {
  onGetStarted: () => void;
  onGoogleSignIn: () => void;
}

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const features = [
  {
    icon: Target,
    title: "Intent Mapping",
    desc: "Analyzing your knowledge gaps to map the most efficient path to mastery.",
    accent: "from-[#7c6ffa] to-[#a855f7]",
    glow: "rgba(124,111,250,0.3)"
  },
  {
    icon: Layout,
    title: "Elite Curation",
    desc: "A filtered stream of high-fidelity knowledge resources from world-class sources.",
    accent: "from-[#56cfb2] to-[#2dd4bf]",
    glow: "rgba(86,207,178,0.2)"
  },
  {
    icon: ShieldCheck,
    title: "Sync Verification",
    desc: "Validate your architectural progress with specialized laboratory challenges.",
    accent: "from-[#e879f9] to-[#d946ef]",
    glow: "rgba(232,121,249,0.2)"
  },
];

export default function Landing({ onGetStarted, onGoogleSignIn }: LandingProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen text-[#e8e4f0] font-sans overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[#04040d] -z-50" />

      {/* Cinematic Neural Architect Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ArchitectBackground />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-[100] px-10 h-[62px] flex items-center justify-between border-b border-white/[0.055] bg-bg-primary/60 backdrop-blur-[24px] shadow-[0_1px_10px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4 group cursor-pointer">
          <img src="/logo.ico" alt="Ascent AI Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 object-contain drop-shadow-[0_0_10px_rgba(124,111,250,0.6)]" />
          <span className="text-[15px] font-semibold text-text-primary tracking-tight">Ascent AI</span>
        </div>
        <div className="flex items-center gap-6">
          <AnimatedThemeToggler variant="circle" />
          <button onClick={onGoogleSignIn} className="text-[13.5px] text-text-muted hover:text-text-primary transition-colors">Sign In</button>
          <button onClick={onGetStarted} className="px-5 py-2 rounded-lg bg-gradient-to-br from-[#7c6ffa] to-[#a855f7] text-white font-semibold text-[13px] tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-[0_0_24px_rgba(124,111,250,0.45)] hover:shadow-[0_0_35px_rgba(124,111,250,0.6)]">INITIATE</button>
        </div>
      </nav>

      <main className="relative z-10 pt-40 pb-24 max-w-6xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7c6ffa]/10 border border-[#7c6ffa]/30 text-[#a89ff5] text-[11px] font-semibold uppercase tracking-[0.1em] mb-12 backdrop-blur-md"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#7c6ffa] shadow-[0_0_8px_#7c6ffa] animate-pulse" />
          Intelligence Protocol v2.5
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-serif italic font-light tracking-tight leading-[1.0] mb-8 select-none text-transparent bg-clip-text bg-gradient-to-br from-text-primary via-[#7c6ffa] to-[#9d8cfc]">
          Architect your <br /> intellectual destiny.
        </h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto text-[16px] text-text-secondary font-light leading-[1.7] mb-12 tracking-wide animate-float"
        >
          Personalized AI-driven roadmaps that transform curious minds into <span className="italic text-accent-glow font-medium">master architects.</span> Pure knowledge architecture, refined for mastery.
        </motion.p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-32">
          <PremiumButton onClick={onGetStarted}>
            Start Journey
          </PremiumButton>
          
          <motion.button
            onClick={onGoogleSignIn}
            whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full md:w-auto px-8 py-5 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-white/60 font-black text-[11px] tracking-[0.2em] hover:text-white transition-all flex items-center justify-center gap-4 group backdrop-blur-md"
          >
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-all">
              <GoogleLogo />
            </div>
            CONTINUE WITH GOOGLE
          </motion.button>
        </div>

        {/* Live System Metric Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-12 mb-20"
        >
          {[
            { label: "Active Architects", value: "12,842", icon: Sparkles },
            { label: "Neural Roadmaps", value: "842K+", icon: Target },
            { label: "System Uptime", value: "99.9%", icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-accent-glow">
                <stat.icon className="w-3 h-3" />
                <span className="text-sm font-black tracking-tighter text-white">{stat.value}</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        <div className="flex items-center gap-6 max-w-3xl mx-auto mb-16">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#7c6ffa]/20 to-transparent" />
          <span className="text-[11px] font-semibold tracking-[0.1em] text-[#4a4465] uppercase">Core Capabilities</span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#7c6ffa]/20 to-transparent" />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative overflow-hidden p-8 text-left rounded-3xl bg-white/[0.03] border border-white/[0.08] transition-all duration-500 hover:translate-y-[-8px] hover:bg-white/[0.06] backdrop-blur-xl"
              style={{
                borderColor: hoveredIndex === i ? `rgba(124,111,250,0.3)` : undefined
              }}
            >
              {/* Accent Glow */}
              <div
                className="absolute top-[-40px] right-[-40px] w-[120px] h-[120px] rounded-full blur-[40px] opacity-0 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: feature.glow,
                  opacity: hoveredIndex === i ? 0.7 : 0
                }}
              />
              {/* Top Border Accent */}
              <div
                className="absolute top-0 left-6 right-6 h-[1px] opacity-0 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(to right, transparent, ${feature.glow.replace('0.2', '1').replace('0.3', '1')}, transparent)`,
                  opacity: hoveredIndex === i ? 1 : 0
                }}
              />

              <div className={`w-10 h-10 bg-white/[0.05] rounded-xl flex items-center justify-center mb-6 border border-white/[0.08] group-hover:bg-white/[0.09] transition-all`}>
                <feature.icon className="w-5 h-5 text-accent-glow" />
              </div>
              <h2 className="text-[22px] font-serif italic font-normal mb-2 text-[#ede9ff] tracking-tight">{feature.title}</h2>
              <p className="text-[13.5px] text-[#6b6485] leading-[1.7] font-light">{feature.desc}</p>
              <div className="absolute bottom-5 right-5 text-[11px] font-semibold text-white/[0.08] tracking-widest uppercase">0{i + 1}</div>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
