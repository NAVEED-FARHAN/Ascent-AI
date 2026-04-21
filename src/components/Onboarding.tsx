import { useState } from 'react';
import { Sparkles, Key, ArrowRight, BookOpen, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface OnboardingProps {
  onComplete: (apiKey: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim().length < 20) {
      alert('Please enter a valid Gemini API key.');
      return;
    }
    setIsSubmitting(true);
    // Add a slight delay for aesthetic effect
    setTimeout(() => {
      onComplete(apiKey.trim());
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="mesh-background" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full"
      >
        <div className="frosted-glass rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-accent-glow/10 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-accent-glow/20 border border-accent-glow/30 flex items-center justify-center text-accent-glow shadow-lg">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-text-secondary/60">Initialize Protocol</h2>
                <h1 className="text-4xl font-serif italic text-white tracking-tight">Ascent AI</h1>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <p className="text-xl text-text-secondary leading-relaxed serif italic">
                Welcome to the high-performance architect for your learning journey. To ensure secure and private generation of your roadmaps, you'll need to provide your own intelligence engine.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-accent-success shrink-0" />
                  <p className="text-xs text-text-secondary">Your key is stored locally in your browser and never sent to our servers.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                  <Zap className="w-5 h-5 text-accent-glow shrink-0" />
                  <p className="text-xs text-text-secondary">Use the Free Tier from Google AI Studio for 0 cost roadmap generation.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">
                  Gemini API Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-accent-glow transition-colors">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key here..."
                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-accent-glow/50 focus:border-accent-glow transition-all font-mono"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-accent-glow hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Get your free key from Google
                  </a>
                  <span className="text-[10px] text-text-secondary/40 font-medium">Encrypted @ LocalStorage</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-accent-glow text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-accent-glow/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Engine
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-text-secondary/30">
          Intelligence Orchestration Protocol v2.5
        </p>
      </motion.div>
    </div>
  );
}
