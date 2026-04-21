
import { useState, FormEvent } from 'react';
import { Search, Sparkles, ArrowRight, Zap, Book, Network, Globe, FileText, Play, X, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Roadmap } from '../types';

interface HomeProps {
  onStart: (goal: string) => void;
  onContinue: () => void;
  roadmap: Roadmap | null;
}

const PRESET_GOALS = [
  "Master Sustainable Architecture",
  "Learn Quantum Computing Basics",
  "Design a High-Conversion Landing Page",
  "Master Prompt Engineering for LLMs",
  "Build a Full-Stack SaaS with React",
  "Master Data Visualization with D3.js"
];

export default function Home({ onStart, onContinue, roadmap }: HomeProps) {
  const [goal, setGoal] = useState('');
  const [activeTab, setActiveTab] = useState<'none' | 'explore' | 'resources'>('none');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (goal.trim()) onStart(goal);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-8 py-5 flex items-center justify-between frosted-glass border-b border-white/5">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
             <Book className="w-8 h-8 text-white stroke-[1.5]" />
             <span className="text-2xl font-black text-white font-serif italic tracking-tighter">Ascent AI</span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab(activeTab === 'explore' ? 'none' : 'explore')}
              className={`text-sm font-semibold transition-colors ${activeTab === 'explore' ? 'text-accent-glow' : 'text-text-secondary hover:text-white'}`}
            >
              Explore
            </button>
            <button 
              onClick={() => setActiveTab(activeTab === 'resources' ? 'none' : 'resources')}
              className={`text-sm font-semibold transition-colors ${activeTab === 'resources' ? 'text-accent-glow' : 'text-text-secondary hover:text-white'}`}
            >
              Resources
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-full gap-2 focus-within:border-accent-glow transition-all">
            <Search className="w-4 h-4 text-text-secondary" />
            <input className="bg-transparent border-none outline-none text-sm w-48 text-white placeholder:text-text-secondary/30" placeholder="Search paths..." />
          </div>
        </div>
      </nav>

      {/* Tab Modals */}
      <AnimatePresence>
        {activeTab !== 'none' && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setActiveTab('none')}
               className="fixed inset-0 bg-bg-base/60 backdrop-blur-xl z-[90] mt-20"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed left-0 right-0 top-20 frosted-glass border-b border-white/10 z-[100] p-10 max-h-[70vh] overflow-y-auto shadow-2xl"
            >
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-serif italic text-white flex items-center gap-4">
                    {activeTab === 'explore' ? (
                      <>
                        <Globe className="w-8 h-8 text-accent-glow" />
                        Ascent Curations
                      </>
                    ) : (
                      <>
                        <FileText className="w-8 h-8 text-accent-glow" />
                        Active Resources
                      </>
                    )}
                  </h2>
                  <button onClick={() => setActiveTab('none')} className="p-2 hover:bg-white/5 rounded-full text-text-secondary">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {activeTab === 'explore' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PRESET_GOALS.map((g, i) => (
                      <button 
                         key={i}
                         onClick={() => { onStart(g); setActiveTab('none'); }}
                         className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-accent-glow hover:bg-accent-glow/5 transition-all text-left group"
                      >
                         <h3 className="text-white font-bold mb-2 group-hover:text-accent-glow">{g}</h3>
                         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary/40">
                           <Zap className="w-3 h-3" />
                           Instant Initiation
                         </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {roadmap ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         {roadmap.nodes.slice(0, 4).map((node, i) => (
                           <div key={i} className="space-y-4">
                              <h3 className="text-accent-glow font-black uppercase tracking-widest text-xs border-b border-white/5 pb-2">
                                {node.title}
                              </h3>
                              <div className="space-y-3">
                                {node.subTopics.flatMap(st => st.resources).slice(0, 3).map((res, ri) => (
                                  <a 
                                    key={ri}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 transition-all text-text-secondary hover:text-white"
                                  >
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                                      {res.type === 'video' ? <Play className="w-4 h-4 fill-current" /> : <FileText className="w-4 h-4" />}
                                    </div>
                                    <span className="text-sm font-medium truncate">{res.title}</span>
                                  </a>
                                ))}
                              </div>
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                         <Map className="w-16 h-16 text-text-secondary/20 mx-auto mb-6" />
                         <p className="text-text-secondary font-serif italic text-xl">Initiate a journey to curate resources here.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="relative px-6 text-center mb-32 overflow-hidden">
          <div className="watermark -top-20 opacity-[0.05]">
             <Zap className="w-full h-full text-accent-glow" strokeWidth={0.5} />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent-glow text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-md"
          >
            <Zap className="w-3 h-3 fill-current" />
            The Guided Ascent
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter text-text-primary leading-[0.9] mb-8">
            Master anything with <br />
            <span className="text-accent-glow relative inline-block">
              Architected Learning
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute -bottom-2 left-0 h-1 bg-accent-glow/30" 
              />
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-text-secondary text-lg font-medium leading-relaxed mb-12">
            Personalized AI-driven roadmaps that transform your intellectual curiosity into structured mastery.
          </p>

          <motion.form 
            onSubmit={handleSubmit}
            className="w-full max-w-2xl mx-auto relative z-10"
          >
            <div className="absolute inset-0 bg-accent-glow/10 blur-[100px] -z-10" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="w-full flex items-center frosted-glass rounded-3xl p-2 pr-4 shadow-2xl focus-within:border-accent-glow/50 transition-all">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What do you want to learn today?"
                  className="flex-1 px-8 py-6 text-xl bg-transparent outline-none text-white placeholder:text-text-secondary/30 font-medium"
                />
                <button
                  type="submit"
                  className="bg-accent-glow text-white px-8 py-4 rounded-2xl flex items-center gap-2 font-black text-sm uppercase tracking-widest hover:bg-accent-glow/80 active:scale-95 transition-all shadow-lg"
                >
                  Start Journey
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {roadmap && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onContinue}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-glow/30 transition-all group"
                >
                   <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-accent-glow">Continue Active Journey:</span>
                   <span className="text-sm font-semibold text-white truncate max-w-[200px]">{roadmap.goal}</span>
                   <ArrowRight className="w-4 h-4 text-accent-glow group-hover:translate-x-1 transition-transform" />
                </motion.button>
              )}
            </div>
          </motion.form>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary/40 py-2">Try starting with:</span>
            {PRESET_GOALS.slice(0, 3).map((s) => (
              <button
                key={s}
                onClick={() => onStart(s)}
                className="px-6 py-2 rounded-xl frosted-glass text-xs font-semibold text-text-secondary hover:text-white hover:bg-white/10 transition-all border-none"
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* Bento Grid: How it works */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="text-left">
              <h2 className="text-4xl font-serif italic text-white mb-4">The Protocol</h2>
              <p className="text-text-secondary max-w-md font-medium">Our intelligence layers work together to craft the most efficient path to your goals.</p>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="w-12 h-1 bg-accent-glow rounded-full" />
              <div className="w-4 h-1 bg-white/10 rounded-full" />
              <div className="w-4 h-1 bg-white/10 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            {/* Intent Mapping */}
            <div className="md:col-span-2 frosted-glass rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                <Network className="w-full h-full text-accent-glow" strokeWidth={0.5} />
              </div>
              <div>
                <div className="w-14 h-14 bg-accent-glow/10 border border-accent-glow/20 text-accent-glow rounded-2xl flex items-center justify-center mb-10 shadow-lg">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-serif italic mb-4 text-white">Intent Mapping</h3>
                <p className="text-text-secondary max-w-sm font-medium">We analyze your knowledge gaps and long-term ambitions to define the perfect starting point.</p>
              </div>
              <div className="flex items-center gap-6 text-accent-glow font-black text-[10px] uppercase tracking-[0.2em]">
                <span>Analyze Gaps</span>
                <ArrowRight className="w-4 h-4" />
                <span>Define Milestones</span>
              </div>
            </div>

            {/* Adaptive Paths */}
            <div className="bg-accent-glow text-white rounded-3xl p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
               <div className="absolute top-[-20%] right-[-20%] p-10 opacity-10">
                <Search className="w-48 h-48" />
              </div>
              <div>
                <div className="w-14 h-14 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10 shadow-xl">
                  <ArrowRight className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-serif italic mb-4">Adaptive Paths</h3>
                <p className="text-white/80 font-medium">Your roadmap adjusts in real-time as you progress or struggle with topics.</p>
              </div>
              <div className="mt-4 bg-white/10 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Rate</span>
                  <span className="text-xs font-bold">98%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-white/80 w-[98%] h-full shadow-[0_0_10px_white]" />
                </div>
              </div>
            </div>

             {/* Elite Curation */}
             <div className="frosted-glass rounded-3xl p-10 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-accent-success/10 border border-accent-success/20 text-accent-success rounded-2xl flex items-center justify-center mb-10 shadow-lg">
                  <Book className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-serif italic mb-4 text-white">Elite Curation</h3>
                <p className="text-text-secondary font-medium">Access high-quality content curated for your specific roadmap.</p>
              </div>
              <div className="flex -space-x-3 mt-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl border-2 border-bg-base overflow-hidden shadow-lg">
                    <img src={`https://picsum.photos/seed/${i}/100/100`} referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-xl bg-white/10 border-2 border-bg-base flex items-center justify-center text-[10px] font-bold text-white shadow-lg">+2k</div>
              </div>
            </div>

            {/* Verified Milestones */}
            <div className="md:col-span-2 bg-accent-glow/5 border border-accent-glow/10 rounded-3xl p-10 relative overflow-hidden flex items-center group">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center w-full">
                <div>
                  <h3 className="text-3xl font-serif italic mb-4 text-white">Verified Progress</h3>
                  <p className="text-text-secondary mb-8 font-medium">Earn cryptographically verified credentials as you conquer each module on your journey.</p>
                  <button className="text-accent-glow font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:translate-x-2 transition-all">
                    View Credentials <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative aspect-square max-w-[180px] mx-auto group-hover:scale-110 transition-transform duration-700">
                  <div className="absolute inset-0 bg-accent-glow rounded-full opacity-5 animate-pulse" />
                  <div className="absolute inset-4 border border-dashed border-accent-glow/20 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-16 h-16 text-accent-glow shadow-[0_0_30px_rgba(99,102,241,0.5)]" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-[#312e81] to-bg-base rounded-[2rem] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl group border border-white/5">
            <div className="absolute inset-0 opacity-20 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-1000">
               <img src="https://picsum.photos/seed/ascent/1920/1080" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="relative z-10">
              <h2 className="text-5xl md:text-7xl font-serif italic text-white mb-8 tracking-tighter">Ready to ascend?</h2>
              <p className="text-text-secondary text-lg mb-12 max-w-xl mx-auto font-medium">Join over 50,000 learners building their future with personalized AI roadmaps.</p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-accent-glow text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Initiate Sequence
              </button>
            </div>
          </div>
          
          <div className="mt-32 pt-12 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-secondary/20">
              © 2024 Ascent AI Technologies Inc. All rights reserved.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
