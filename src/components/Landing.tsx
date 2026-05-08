import { motion } from 'motion/react';
import { Zap, Book, ArrowRight, ShieldCheck, Sparkles, Network, Target } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

interface LandingProps {
  onGetStarted: () => void;
  onGoogleSignIn: () => void;
  onLogin: () => void;
  onGuestAccess: () => void;
}

const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function Landing({ onGetStarted, onGoogleSignIn }: LandingProps) {
  return (
    <div className="min-h-screen bg-bg-primary overflow-x-hidden text-text-primary font-sans relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 pointer-events-none bg-accent-glow/5 blur-[120px] rounded-full animate-pulse opacity-20" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-[100] px-10 py-6 flex items-center justify-between border-b border-border-primary bg-bg-primary/40 backdrop-blur-3xl">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-9 h-9 bg-accent-glow/10 border border-accent-glow/20 rounded-xl flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-all">
            <Book className="w-5 h-5 text-accent-glow" />
          </div>
          <span className="text-xl font-black font-serif italic tracking-tighter">Ascent AI</span>
        </div>
        <div className="flex items-center gap-6">
          <AnimatedThemeToggler variant="circle" />
          <button onClick={onGoogleSignIn} className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary transition-colors">Sign In</button>
          <button onClick={onGetStarted} className="px-6 py-2.5 rounded-xl bg-accent-glow text-white font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent-glow/20">Initiate</button>
        </div>
      </nav>

      <main className="relative z-10 pt-40 pb-24 max-w-6xl mx-auto px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-secondary border border-border-primary text-accent-glow text-[9px] font-bold uppercase tracking-[0.3em] mb-10 backdrop-blur-md">
          <Sparkles className="w-3 h-3" /> Intelligence Protocol v2.5
        </motion.div>

        <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter leading-[0.85] mb-12 select-none">
          Architect your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-text-primary to-text-secondary">intellectual destiny.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-text-secondary font-bold leading-relaxed mb-16 italic">
          Personalized AI-driven roadmaps that transform curious minds into master architects. Pure knowledge architecture, refined for mastery.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-32">
          <motion.button onClick={onGetStarted} className="w-full md:w-auto bg-text-primary text-bg-primary px-10 py-5 rounded-2xl flex items-center justify-center gap-4 font-black text-[10px] uppercase tracking-widest transition-all shadow-premium group">
            Start Journey <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button onClick={onGoogleSignIn} className="w-full md:w-auto px-10 py-5 rounded-2xl bg-bg-secondary border border-border-primary text-text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-bg-secondary/80 transition-all flex items-center justify-center gap-4 group backdrop-blur-3xl shadow-premium">
            <GoogleLogo /> Continue with Google
          </motion.button>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
           {[
             { title: "Intent Mapping", icon: Target, desc: "Analyzing your knowledge gaps to map the most efficient path to mastery." },
             { title: "Elite Curation", icon: Book, desc: "A filtered stream of high-fidelity knowledge resources from world-class sources." },
             { title: "Sync Verification", icon: ShieldCheck, desc: "Validate your architectural progress with specialized laboratory challenges." }
           ].map((feature, i) => (
             <SpotlightCard key={i} className="p-10 text-left">
               <div className="w-12 h-12 bg-accent-glow/5 rounded-2xl flex items-center justify-center mb-8 border border-accent-glow/10 group-hover:scale-110 transition-transform">
                 <feature.icon className="w-6 h-6 text-accent-glow" />
               </div>
               <h2 className="text-2xl font-serif italic mb-4 text-text-primary">{feature.title}</h2>
               <p className="text-sm text-text-secondary leading-relaxed font-bold">{feature.desc}</p>
             </SpotlightCard>
           ))}
        </section>

        <section className="relative p-20 rounded-[3.5rem] border border-border-primary overflow-hidden text-center group">
           <div className="absolute inset-0 bg-accent-glow/5 -z-10 group-hover:scale-110 transition-transform duration-1000" />
           <div className="absolute top-0 right-0 p-10 opacity-5"><Network className="w-64 h-64 text-text-primary" /></div>
           <h2 className="text-6xl font-serif italic mb-10 tracking-tighter">Ready to <span className="text-accent-glow">Ascend?</span></h2>
           <motion.button onClick={onGetStarted} className="inline-flex items-center gap-4 bg-text-primary text-bg-primary px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-premium transition-all">
             Launch Neural Path <ArrowRight className="w-4 h-4" />
           </motion.button>
        </section>
      </main>
    </div>
  );
}
