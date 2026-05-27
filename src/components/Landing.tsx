import { motion, useInView } from 'motion/react';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Target, Layout, ShieldCheck } from 'lucide-react';
import { LiquidButton } from '@/components/animate-ui/components/buttons/liquid';

interface LandingProps {
  onGoogleSignIn: () => void;
  isLoggedIn?: boolean;
  onNavigateHome?: () => void;
}


const features = [
  {
    icon: Target,
    title: "Intent Mapping",
    desc: "Analyzing your knowledge gaps to map the most efficient path to mastery.",
    color: "#7c6ffa"
  },
  {
    icon: Layout,
    title: "Elite Curation",
    desc: "A filtered stream of high-fidelity knowledge resources from world-class sources.",
    color: "#56cfb2"
  },
  {
    icon: ShieldCheck,
    title: "Sync Verification",
    desc: "Validate your architectural progress with specialized laboratory challenges.",
    color: "#e879f9"
  },
];

/* ─── Count-up animation hook ─── */
function useCountUp(target: number, duration: number = 2, start: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) { setCount(0); return; }
    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return count;
}

function AnimatedStat({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const numericMatch = value.match(/^[\d,]+(\.\d+)?/);
  const numeric = numericMatch ? parseFloat(numericMatch[0].replace(/,/g, '')) : 0;
  const suffix = value.slice(numericMatch ? numericMatch[0].length : 0);
  const count = useCountUp(numeric, 2.2, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-2"
    >
      <div className="flex items-center gap-2 text-accent-glow">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-lg font-semibold tracking-tight text-text-primary tabular-nums">
          {count.toLocaleString()}{suffix}
        </span>
      </div>
      <span className="text-[10px] font-medium uppercase tracking-widest text-text-muted/50">
        {label}
      </span>
    </motion.div>
  );
}

/* ─── Hero text reveal variants ─── */
const heroContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.15 },
  },
};

const heroLine = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Landing({ onGoogleSignIn, isLoggedIn, onNavigateHome }: LandingProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  /* ── Scroll-aware navbar ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <div className="fixed inset-0 bg-bg-primary -z-50" />

      {/* Cinematic Background Image */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src="/landing-bg.jpg" 
          alt=""
          className="w-full h-full object-cover scale-105"
          style={{ filter: 'saturate(1.1) brightness(0.6) blur(6px)' }}
        />
        {/* Purple tint overlay — colorizes the image */}
        <div className="absolute inset-0 bg-accent-glow/35 mix-blend-soft-light" />
        {/* Subtle dark gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/40 via-bg-primary/10 to-bg-primary/50" />
        {/* Purple accent vignette */}
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-glow/[0.08] via-transparent to-accent-glow/[0.05]" />
      </div>

      {/* Top gradient overlay */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-accent-glow/[0.08] to-transparent z-[1] pointer-events-none" />

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] px-10 h-[68px] flex items-center justify-between border-b transition-all duration-500 ${
          scrolled
            ? "bg-bg-primary/90 backdrop-blur-2xl border-white/[0.08]"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <img src="/logo.ico" alt="Ascent AI Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 object-contain" />
            <div className="absolute inset-0 bg-accent-glow/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-base font-semibold text-text-primary tracking-tight">Ascent AI</span>
        </div>

      </nav>

      <main className="relative z-10 pt-48 pb-24 max-w-6xl mx-auto px-8 text-center">
        {/* ── Hero area with mouse-tracking gradient ── */}
        <div
          className="relative mb-14"
        >

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-glow/10 border border-accent-glow/20 text-accent-glow text-xs font-medium tracking-wide mb-14 backdrop-blur-md"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-accent-glow shadow-[0_0_8px_#7c6ffa] animate-pulse" />
            Intelligence Protocol v2.5
          </motion.div>

          {/* Staggered hero headline */}
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="show"
            className="text-7xl md:text-9xl font-serif italic font-light tracking-tight leading-[0.92] select-none"
          >
            <motion.div variants={heroLine}>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-text-primary via-text-primary to-accent-glow/60">
                Architect your
              </span>
            </motion.div>
            <motion.div variants={heroLine}>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-accent-glow via-accent-glow to-accent-glow/40">
                intellectual destiny.
              </span>
            </motion.div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl mx-auto mt-10 text-lg text-text-secondary font-light leading-relaxed"
          >
            Personalized AI-driven roadmaps that transform curious minds into{' '}
            <span className="relative inline-block italic text-accent-glow font-medium group">
              master architects.
              <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-accent-glow/0 via-accent-glow/60 to-accent-glow/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-center" />
            </span>
          </motion.p>
        </div>

        {/* ── CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-center justify-center gap-5 mb-40"
        >
          {isLoggedIn ? (
            <LiquidButton
              variant="ghost"
              size="lg"
              onClick={onNavigateHome}
              className="px-10 py-4 rounded-xl border border-white/20 text-white font-semibold text-base tracking-wide"
            >
              Return to Dashboard
            </LiquidButton>
          ) : (
            <LiquidButton
              variant="default"
              size="lg"
              onClick={onGoogleSignIn}
              className="px-10 py-4 rounded-xl text-base font-semibold tracking-wide"
            >
              Start Journey
            </LiquidButton>
          )}
        </motion.div>

        {/* ── Animated Stats ── */}
        <div className="flex items-center justify-center gap-16 mb-24">
          {[
            { label: "Active Architects", value: "12,842", icon: Sparkles },
            { label: "Neural Roadmaps", value: "842K+", icon: Target },
            { label: "System Uptime", value: "99.9%", icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i}>
              <AnimatedStat value={stat.value} label={stat.label} icon={stat.icon} />
            </div>
          ))}
        </div>

        {/* ── Section divider ── */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6 max-w-3xl mx-auto mb-16"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-glow/20 to-transparent" />
          <span className="text-xs font-medium tracking-widest text-text-muted/40 uppercase">Core Capabilities</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-glow/20 to-transparent" />
        </motion.div>

        {/* ── Feature cards ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative overflow-hidden p-8 text-left rounded-3xl bg-white/[0.02] border border-white/[0.06] transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04] backdrop-blur-xl group cursor-pointer"
            >
              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/10 group-hover:border-accent-glow/40 transition-colors duration-300" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/10 group-hover:border-accent-glow/40 transition-colors duration-300" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/10 group-hover:border-accent-glow/40 transition-colors duration-300" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/10 group-hover:border-accent-glow/40 transition-colors duration-300" />

              {/* Hover glow */}
              <div
                className="absolute top-[-40px] right-[-40px] w-[120px] h-[120px] rounded-full blur-[40px] opacity-0 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: feature.color,
                  opacity: hoveredIndex === i ? 0.3 : 0
                }}
              />

              {/* Floating icon */}
              <div className="w-11 h-11 bg-white/[0.04] rounded-xl flex items-center justify-center mb-6 border border-white/[0.08] group-hover:bg-accent-glow/10 group-hover:border-accent-glow/30 transition-all duration-300">
                <feature.icon className="w-5 h-5 text-accent-glow group-hover:scale-110 group-hover:animate-pulse-subtle transition-transform duration-300" />
              </div>

              <h3 className="text-xl font-serif italic font-normal mb-3 text-text-primary group-hover:text-white transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed font-light group-hover:text-text-secondary/90 transition-colors duration-300">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </section>
      </main>
    </div>
  );
}
