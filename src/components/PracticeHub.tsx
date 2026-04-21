import { Target, Zap, Trophy, ExternalLink, Search, CheckCircle2, FlaskConical, Layout, Layers, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { Roadmap, UserProgress, Challenge, Quiz } from '../types';

interface PracticeHubProps {
  roadmap: Roadmap;
  progress: UserProgress;
  onCompleteChallenge: (challengeId: string) => void;
  onNavigateHome: () => void;
}

export default function PracticeHub({ roadmap, progress, onCompleteChallenge, onNavigateHome }: PracticeHubProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const allPractice = useMemo(() => {
    const quizzes: (Quiz & { nodeTitle: string; subTopicTitle: string })[] = [];
    const challenges: (Challenge & { nodeTitle: string; subTopicTitle: string })[] = [];

    roadmap.nodes.forEach(node => {
      node.subTopics.forEach(sub => {
        if (sub.quizzes) {
          sub.quizzes.forEach(q => quizzes.push({ ...q, nodeTitle: node.title, subTopicTitle: sub.title }));
        }
        if (sub.challenges) {
          sub.challenges.forEach(c => challenges.push({ ...c, nodeTitle: node.title, subTopicTitle: sub.title }));
        }
      });
    });

    return { quizzes, challenges };
  }, [roadmap]);

  const filteredQuizzes = allPractice.quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.subTopicTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChallenges = allPractice.challenges.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.subTopicTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateToChallenges = () => {
    const el = document.getElementById('challenges-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-10 pt-16 pb-40 space-y-0 relative">
      <div className="absolute top-0 left-0 w-full h-[800px] bg-accent-glow/[0.02] blur-[150px] -z-10" />

      {/* Slab 1: Practice Header */}
      <section className="py-24 border-b border-white/5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-glow"
            >
              Validation Intelligence Protocol
            </motion.h2>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-serif italic text-white tracking-tighter leading-[0.8] -ml-2"
            >
              Challenge <br />
              <span className="text-text-secondary/20 font-light">Laboratory</span>
            </motion.h1>
          </div>

          <div className="flex items-center gap-6 frosted-glass p-2 rounded-2xl border border-white/10">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary/40" />
              <input 
                type="text"
                placeholder="Search practice protocols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-xl pl-16 pr-10 py-5 w-[400px] text-white focus:outline-none focus:border-accent-glow/30 transition-all font-medium text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Slab 2: The Logic Paradox (Pinned Challenge) */}
      <section className="py-24 border-b border-white/5">
         <motion.div 
           whileHover={{ scale: 1.01 }}
           className="relative overflow-hidden group p-16 rounded-[2.5rem] bg-[#1a1c2e] border border-white/10 shadow-4xl flex flex-col md:flex-row items-center gap-16"
         >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] -z-0 opacity-10">
               <svg className="w-full h-full text-white animate-spin-slow" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.2" />
               </svg>
            </div>

            <div className="flex-1 space-y-10 relative z-10">
               <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary/40">Challenge of the Week</span>
                  <h3 className="text-6xl md:text-8xl font-serif italic text-white tracking-tighter leading-none">The Logic Paradox</h3>
               </div>
               <p className="text-2xl text-text-secondary/60 font-medium leading-relaxed max-w-2xl italic">
                  Solve the "Optimized Variable Allocation" challenge to earn the <span className="text-accent-glow font-bold">Architect Badge</span> and boost your technical resonance.
               </p>
               <button 
                onClick={navigateToChallenges}
                className="flex items-center gap-4 px-12 py-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-glow/40 rounded-2xl text-[11px] font-black uppercase tracking-widest text-accent-glow transition-all shadow-xl group/btn"
               >
                  Initiate Challenge <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
               </button>
            </div>

            <div className="w-full md:w-80 h-80 frosted-glass rounded-full flex items-center justify-center border border-white/10 relative z-10">
               <FlaskConical className="w-32 h-32 text-accent-glow filter drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]" />
            </div>
         </motion.div>
      </section>

      {/* Slab 3: Validation Grid (Quizzes & Challenges) or Empty State */}
      {allPractice.quizzes.length === 0 && allPractice.challenges.length === 0 ? (
        <section className="py-24 border-b border-white/5 flex flex-col items-center justify-center text-center space-y-10 min-h-[500px] relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-glow/5 blur-[120px] -z-10" />
          <div className="w-24 h-24 rounded-full bg-accent-glow/10 border border-accent-glow/30 flex items-center justify-center text-accent-glow animate-pulse mb-4">
             <Layers className="w-10 h-10" />
          </div>
          <div className="space-y-4 max-w-2xl px-6">
             <h3 className="text-4xl font-serif italic text-white tracking-tight">Protocol Synchronization Required</h3>
             <p className="text-xl text-text-secondary/60 font-medium leading-relaxed italic">
                Your current roadmap was generated using a legacy architecture and lacks practice metadata. To unlock the <span className="text-white">Validation Intelligence</span>, please initiate a new learning protocol.
             </p>
          </div>
          <button 
             onClick={onNavigateHome}
             className="px-12 py-5 bg-accent-glow text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_15px_30px_rgba(99,102,241,0.4)]"
          >
             Re-generate Mastery Journey
          </button>
        </section>
      ) : (
        <section id="challenges-grid" className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/5 min-h-[600px]">
        {/* Left: Quizzes */}
        <div className="lg:col-span-6 py-24 pr-12 border-r border-white/5 space-y-16">
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-serif italic text-white flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-accent-glow" />
              Pulse Quizzes
            </h3>
            <span className="text-[10px] font-black text-text-secondary/20 uppercase tracking-widest">{filteredQuizzes.length} Protocols Found</span>
          </div>

          <div className="space-y-6">
             {filteredQuizzes.map((quiz) => (
               <motion.div 
                 key={quiz.id}
                 whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.02)' }}
                 className="p-8 rounded-3xl border border-white/5 group relative"
               >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">{quiz.subTopicTitle}</span>
                       <h4 className="text-2xl font-serif italic text-white group-hover:text-accent-glow transition-colors">{quiz.title}</h4>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      quiz.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      quiz.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {quiz.difficulty}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
                    <span className="text-[10px] font-black text-text-secondary/20 uppercase tracking-widest">via {quiz.provider}</span>
                    <a 
                      href={quiz.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] font-black text-accent-glow uppercase tracking-tighter hover:underline"
                    >
                      Authenticate Protocol <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
               </motion.div>
             ))}
          </div>
        </div>

        {/* Right: Coding Challenges */}
        <div className="lg:col-span-6 py-24 pl-12 space-y-16">
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-serif italic text-white flex items-center gap-4">
              <Zap className="w-10 h-10 text-accent-glow" />
              Manifest Challenges
            </h3>
          </div>

          <div className="space-y-8">
            {filteredChallenges.map((challenge) => {
              const isCompleted = progress.completedChallengeIds.includes(challenge.id);
              return (
                <div 
                  key={challenge.id}
                  className={`p-10 rounded-[2rem] border transition-all ${isCompleted ? 'bg-accent-glow/5 border-accent-glow/20' : 'bg-white/[0.02] border-white/5'}`}
                >
                   <div className="flex justify-between items-start mb-6">
                      <div className="space-y-3">
                         <div className="flex items-center gap-3">
                            <Layers className="w-4 h-4 text-accent-glow/40" />
                            <span className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">{challenge.type} • {challenge.subTopicTitle}</span>
                         </div>
                         <h4 className="text-3xl font-serif italic text-white">{challenge.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                         <Trophy className="w-5 h-5 text-accent-glow" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-40">{challenge.reward}</span>
                      </div>
                   </div>
                   <p className="text-lg text-text-secondary/40 leading-relaxed font-medium mb-10">
                      {challenge.description}
                   </p>
                   <div className="flex items-center justify-between pt-8 border-t border-white/5">
                      {challenge.externalUrl ? (
                        <a 
                          href={challenge.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-widest hover:text-accent-glow transition-colors"
                        >
                          Access Workspace <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <div className="w-4" />
                      )}
                      
                      <button 
                        onClick={() => onCompleteChallenge(challenge.id)}
                        className={`flex items-center gap-4 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          isCompleted ? 'bg-accent-glow text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
                        }`}
                      >
                         {isCompleted ? <><CheckCircle2 className="w-4 h-4" /> Verified</> : 'Verify Completion'}
                      </button>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Slab 4: Practice Performance Integration */}
      <section className="py-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
         <div className="lg:col-span-8 space-y-8">
            <h3 className="text-4xl font-serif italic text-white">Neural Resonance Performance</h3>
            <div className="frosted-glass p-12 rounded-[2rem] border border-white/5 flex items-center justify-between gap-12">
               <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">Confidence Synchronization</span>
                     <span className="text-4xl font-serif italic text-accent-glow">{progress.practiceScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.practiceScore}%` }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-accent-glow shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                     />
                  </div>
               </div>
               <div className="w-[1px] h-20 bg-white/5" />
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black text-text-secondary/30 uppercase tracking-[0.2em]">Rank</p>
                  <p className="text-2xl font-black text-white uppercase tracking-tighter">Tactician</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 p-12 bg-accent-glow/10 rounded-[2rem] border border-accent-glow/20 flex flex-col justify-between">
            <Sparkles className="w-8 h-8 text-accent-glow mb-6" />
            <p className="text-xl font-serif italic text-text-secondary leading-relaxed mb-8">
               Completion of coding challenges significantly accelerates your <span className="text-white">Mastery Architecture</span> stabilization.
            </p>
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-accent-glow animate-ping" />
               <span className="text-[10px] font-black text-accent-glow uppercase tracking-widest">Live Sync Alpha</span>
            </div>
         </div>
      </section>
    </div>
  );
}
