import { useState, useEffect } from 'react';
import { Sparkles, Key, ArrowRight, Clipboard, ExternalLink, ShieldCheck, Zap, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingProps {
  onComplete: (apiKey: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const steps = [
    {
      title: "The Ascent Awaits",
      subtitle: "Protocol Initiation",
      description: "Experience the most powerful AI roadmap architect. Total privacy. Zero cost.",
      icon: Sparkles
    },
    {
      title: "Secure Intelligence",
      subtitle: "Privacy First",
      description: "Your API key never leaves this machine. No servers, no tracking.",
      icon: ShieldCheck
    },
    {
      title: "Get Your Engine",
      subtitle: "1-Click Hand-off",
      description: "Click generate to open Google AI Studio. We'll wait here for your key.",
      icon: ExternalLink
    },
    {
      title: "Finalizing Sync",
      subtitle: "Detection Mode",
      description: "Copy your key from Google, then click finalize below to launch.",
      icon: Zap
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleMagicRedirect = () => {
    window.open('https://aistudio.google.com/app/apikey', '_blank');
    // Automatically jump to the final step
    setStep(3);
  };

  // Automatically try to detect when user comes back to the tab
  useEffect(() => {
    const handleFocus = () => {
      if (step === 3 && !apiKey) {
        handleFinalize();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [step, apiKey]);

  const handleFinalize = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length >= 20) {
        setApiKey(text.trim());
        setIsSubmitting(true);
        onComplete(text.trim());
      }
    } catch (err) {
      // If blocked or empty, just show the manual box immediately
      setShowManual(true);
    }
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-bg-base font-sans">
      <div className="mesh-background opacity-30" />
      
      {/* Top Brand Marker */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <Zap className="w-5 h-5 text-accent-glow fill-current" />
        <span className="text-xl font-serif italic text-white tracking-tighter">Ascent AI</span>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step + (showManual ? '-manual' : '')}
            initial={{ opacity: 0, y: 40, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -40, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* Step Icon */}
            <div className="mb-10 relative">
              <div className="absolute inset-0 bg-accent-glow/20 blur-[80px] rounded-full animate-pulse" />
              <div className="relative z-10 w-32 h-32 flex items-center justify-center">
                 {isSubmitting ? (
                   <CheckCircle2 className="w-24 h-24 text-accent-success animate-bounce" />
                 ) : isDetecting ? (
                   <Loader2 className="w-24 h-24 text-accent-glow animate-spin" />
                 ) : showManual ? (
                   <Key className="w-24 h-24 text-accent-glow" />
                 ) : (
                   <Icon className="w-24 h-24 text-accent-glow" />
                 )}
              </div>
            </div>

            {/* Typography */}
            <div className="mb-14">
               <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-accent-glow/60 mb-5">
                 {showManual ? "Manual Override" : currentStep.subtitle}
               </h2>
               <h1 className="text-6xl md:text-9xl font-serif italic text-white tracking-tighter leading-[0.85] mb-10">
                {isSubmitting ? "Success" : isDetecting ? "Detecting" : showManual ? "Paste Key" : currentStep.title}
               </h1>
               <p className="max-w-xl mx-auto text-xl md:text-3xl text-text-secondary font-serif italic leading-relaxed opacity-80">
                {isSubmitting 
                  ? "Intelligence Sync Complete. Launching..." 
                  : showManual 
                  ? "Clipboard access was denied. Please paste your secret key below to proceed." 
                  : currentStep.description}
               </p>
            </div>

            {/* Actions */}
            <div className="w-full max-w-md">
              {step < 2 && (
                <button
                  onClick={handleNext}
                  className="px-16 py-7 rounded-full bg-white text-black font-black text-sm uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                >
                  Continue
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={handleMagicRedirect}
                  className="w-full py-8 rounded-full bg-accent-glow text-white font-black text-sm uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-accent-glow/20 flex items-center justify-center gap-4 group"
                >
                  <ExternalLink className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  Generate Key
                </button>
              )}

              {step === 3 && !showManual && (
                <button
                  onClick={handleFinalize}
                  disabled={isSubmitting || isDetecting}
                  className={`
                    w-full py-8 rounded-full font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl
                    ${isSubmitting ? 'bg-accent-success text-white shadow-accent-success/20' : 'bg-white text-black shadow-white/10'}
                    hover:scale-105 active:scale-95 disabled:opacity-50
                  `}
                >
                  {isSubmitting ? "Synchronized" : isDetecting ? "Scanning..." : "Finalize Ascent"}
                  {!isSubmitting && !isDetecting && <Clipboard className="w-5 h-5" />}
                </button>
              )}

              {step === 3 && showManual && (
                <div className="space-y-6">
                  <input
                    type="password"
                    autoFocus
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Key Manually..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-6 px-10 text-white placeholder:text-text-secondary/20 focus:outline-none focus:ring-2 focus:ring-accent-glow/50 focus:border-accent-glow transition-all font-mono text-center tracking-widest shadow-2xl"
                  />
                  <button
                    onClick={() => onComplete(apiKey.trim())}
                    disabled={apiKey.length < 20}
                    className="w-full py-6 rounded-full bg-accent-glow text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-xl shadow-accent-glow/20"
                  >
                    Confirm & Launch
                  </button>
                </div>
              )}


              {step > 0 && step < 3 && (
                <button
                  onClick={handleBack}
                  className="mt-10 text-[10px] font-black uppercase tracking-[0.5em] text-text-secondary/40 hover:text-white transition-colors"
                >
                  Go Back
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Technical Progress Dashboard */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-end px-1">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-accent-glow uppercase tracking-[0.4em] mb-1.5">Protocol Stage</span>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentStep.subtitle}</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                {step + 1} / {steps.length}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 h-2">
            {steps.map((_, i) => (
              <div key={i} className="flex-1 relative overflow-hidden rounded-full bg-white/5">
                <motion.div 
                  className="absolute inset-0 bg-accent-glow"
                  animate={{ 
                    x: i <= step ? '0%' : '-100%',
                    opacity: i <= step ? 1 : 0
                  }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
                {i === step && (
                  <motion.div 
                    className="absolute inset-0 bg-white/20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




