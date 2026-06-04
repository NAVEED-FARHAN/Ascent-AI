import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Layout, ShieldCheck, Terminal, ArrowRight, Zap, Code2, Sparkles, Cpu } from 'lucide-react';
import ArchitectBackground from './ArchitectBackground';

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

const TypewriterText = ({ text, delay = 0, speed = 0.05, className = "" }: { text: string, delay?: number, speed?: number, className?: string }) => {
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: speed, delayChildren: delay } },
        hidden: {},
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span key={`${char}-${index}`} variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const TerminalBootSequence = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const sequence = [
      { delay: 500, step: 1 },
      { delay: 1500, step: 2 },
      { delay: 2500, step: 3 },
      { delay: 3500, step: 4 },
    ];
    sequence.forEach(({ delay, step }) => {
      setTimeout(() => setStep(step), delay);
    });
  }, []);

  return (
    <div className="absolute top-1/4 -right-16 lg:right-0 xl:right-10 w-72 h-64 border border-accent-glow/20 bg-[#04040d]/80 backdrop-blur-md rounded-lg p-4 font-mono text-[10px] text-accent-glow shadow-[0_0_30px_rgba(124,111,250,0.15)] transform rotate-2 hidden md:block">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-accent-glow/20">
        <Terminal className="w-4 h-4" />
        <span className="uppercase tracking-widest font-black">Sys_Boot</span>
      </div>
      <div className="space-y-2 opacity-80">
        <p className="text-white/50">{'>'} initializing cognitive matrix...</p>
        {step >= 1 && <p className="text-emerald-400">[OK] Core systems online</p>}
        {step >= 2 && <p className="text-white/50">{'>'} loading neural pathways v2.5...</p>}
        {step >= 3 && <p className="text-emerald-400">[OK] Pathways mapped</p>}
        {step >= 4 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-accent-glow mt-4 font-black">
            {'>'} AWAITING USER INTENT_
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default function Landing({ onGetStarted, onGoogleSignIn }: LandingProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const dataNodes = [
    { icon: Target, title: "Intent Mapping", desc: "Analyzing your knowledge gaps to map the most efficient path to mastery.", color: "from-[#7c6ffa] to-[#a855f7]" },
    { icon: Layout, title: "Elite Curation", desc: "A filtered stream of high-fidelity knowledge resources from world-class sources.", color: "from-[#56cfb2] to-[#2dd4bf]" },
    { icon: ShieldCheck, title: "Sync Verification", desc: "Validate your architectural progress with specialized laboratory challenges.", color: "from-[#e879f9] to-[#d946ef]" },
  ];

  return (
    <div className="min-h-screen text-[#e8e4f0] font-sans overflow-x-hidden relative bg-[#04040d]">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ArchitectBackground />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,111,250,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-10 h-[62px] flex items-center justify-between border-b border-white/[0.05] bg-[#04040d]/40 backdrop-blur-[30px] shadow-sm">
        <div className="flex items-center gap-4 group cursor-pointer">
          <img src="/logo.ico" alt="Ascent AI Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 object-contain drop-shadow-[0_0_15px_rgba(124,111,250,0.8)]" />
          <span className="text-[15px] font-semibold tracking-tight">Ascent AI</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onGoogleSignIn} className="text-[13.5px] text-white/50 hover:text-white transition-colors">Sign In</button>
          <button onClick={onGetStarted} className="px-5 py-2 rounded-md bg-accent-glow/10 border border-accent-glow/30 text-accent-glow font-black text-[11px] tracking-widest uppercase hover:bg-accent-glow/20 transition-all shadow-[0_0_20px_rgba(124,111,250,0.3)]">
            Initialize
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 pt-40 pb-32 max-w-7xl mx-auto px-8">
        <div className="relative">
          <TerminalBootSequence />
          
          <div className="max-w-4xl relative z-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-glow/5 border border-accent-glow/20 text-accent-glow text-[11px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
            >
              <div className="relative flex items-center justify-center w-2 h-2">
                <div className="absolute inset-0 rounded-full bg-accent-glow animate-ping opacity-75" />
                <div className="relative rounded-full w-1.5 h-1.5 bg-accent-glow shadow-[0_0_10px_#7c6ffa]" />
              </div>
              System V2.5 Online
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-[110px] font-serif italic tracking-tighter leading-[0.9] mb-8">
              <span className="block text-white mb-2">Architect your</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-glow via-purple-400 to-indigo-400 drop-shadow-[0_0_30px_rgba(124,111,250,0.4)]">
                intellectual destiny.
              </span>
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-text-muted font-light leading-relaxed mb-12">
              <TypewriterText text="Personalized AI-driven roadmaps that transform curious minds into master architects. Pure knowledge architecture, refined for mastery." speed={0.02} delay={0.5} />
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Holographic CTA */}
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group w-full sm:w-auto overflow-hidden rounded-2xl p-[2px]"
              >
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(124,111,250,1)_360deg)] animate-[spin_3s_linear_infinite]" />
                <div className="relative bg-[#04040d] px-10 py-5 rounded-2xl flex items-center justify-center gap-4 transition-all group-hover:bg-accent-glow/10">
                  <span className="text-sm font-black uppercase tracking-widest text-white">Start Journey</span>
                  <Zap className="w-5 h-5 text-accent-glow" />
                </div>
              </motion.button>
              
              <button
                onClick={onGoogleSignIn}
                className="group flex items-center gap-4 px-8 py-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-accent-glow/50 hover:bg-white/[0.06] transition-all w-full sm:w-auto"
              >
                <GoogleLogo />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70 group-hover:text-white transition-colors">Continue with Google</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-white/[0.01] border border-white/[0.05] backdrop-blur-xl"
        >
          {[
            { v: "12.8K", l: "Active Architects", i: Sparkles },
            { v: "842K+", l: "Generated Nodes", i: Cpu },
            { v: "99.9%", l: "System Sync", i: ShieldCheck },
            { v: "< 1s", l: "Mapping Latency", i: Code2 },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4">
              <stat.i className="w-5 h-5 text-accent-glow mb-3 opacity-50" />
              <span className="text-3xl font-serif italic text-white mb-1">{stat.v}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{stat.l}</span>
            </div>
          ))}
        </motion.div>

        {/* Data Nodes Section */}
        <div className="mt-40">
          <div className="flex items-center gap-6 mb-16">
            <div className="w-12 h-[1px] bg-accent-glow/40" />
            <h2 className="text-2xl font-serif italic text-white">Core System Architecture</h2>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dataNodes.map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15 }}
                onMouseEnter={() => setHoveredNode(i)}
                onMouseLeave={() => setHoveredNode(null)}
                className="group relative p-8 rounded-3xl bg-white/[0.015] border border-white/[0.05] hover:border-accent-glow/40 transition-all duration-500 overflow-hidden cursor-crosshair"
              >
                {/* Tech Background Pattern */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,1) 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }}
                />
                
                {/* Glow Overlay */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${node.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} 
                />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#04040d] border border-white/10 flex items-center justify-center mb-6 group-hover:border-accent-glow/50 group-hover:shadow-[0_0_20px_rgba(124,111,250,0.2)] transition-all duration-500">
                    <node.icon className="w-6 h-6 text-accent-glow group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{node.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-light">{node.desc}</p>
                </div>

                {/* Decorative Node Numbers */}
                <div className="absolute top-6 right-8 font-mono text-[10px] text-white/10 group-hover:text-accent-glow/40 transition-colors duration-500">
                  NODE_{String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
