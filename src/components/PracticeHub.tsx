import { Target, Zap, Trophy, ExternalLink, Search, CheckCircle2, FlaskConical, Layers, ShieldCheck, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
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

  // Dynamically resolve any hallucinated URLs to live, verified targets via DuckDuckGo Ducky redirects
  const optimizeLearningLink = (url: string, title: string, type?: string): string => {
    if (!url) return "#";
    if (url.includes("duckduckgo.com")) return url;

    // Clean up title for searching
    const cleanTitle = encodeURIComponent(title.replace(/[^\w\s-]/g, ' ').trim());

    if (type === 'video' || url.includes("youtube.com") || url.includes("youtu.be")) {
      return `https://duckduckgo.com/?q=!ducky+site:youtube.com+${cleanTitle}+Tutorial`;
    }

    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname;
      if (parsedUrl.pathname === "/" || !parsedUrl.pathname) {
        return url;
      }
      return `https://duckduckgo.com/?q=!ducky+site:${domain}+${cleanTitle}`;
    } catch (e) {
      return `https://duckduckgo.com/?q=!ducky+${cleanTitle}`;
    }
  };

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
    <div className="max-w-[1240px] w-full mx-auto px-6 md:px-10 pt-12 pb-32 space-y-12 relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-accent-glow/[0.015] blur-[130px] -z-10" />

      {/* Slab 1: Premium Laboratory Header */}
      <section className="py-10 border-b border-white/[0.06] relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 relative pr-16">
            <img src="/mascot_exploring.png" alt="Mascot Exploring" className="absolute right-0 bottom-0 w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(124,111,250,0.3)] pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-glow animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-glow/85">
                Validation Intelligence Protocol
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-langdon text-text-primary tracking-tight">
              Challenge <span className="text-text-muted font-langdon opacity-70">Laboratory</span>
            </h1>
          </div>

          <div className="relative w-full md:w-80 lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-glow transition-colors" />
            <input 
              type="text"
              placeholder="Search practice protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#08081a]/50 border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-text-primary focus:outline-none focus:border-accent-glow/30 transition-all font-medium text-sm placeholder:text-text-placeholder backdrop-blur-md"
            />
          </div>
        </div>
      </section>

      {/* Slab 2: Pinned Challenge (Modern Blueprint Card) */}
      <section className="py-2">
         <motion.div 
           whileHover={{ y: -2 }}
           className="relative overflow-hidden p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.06] shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-12"
         >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] -z-0 opacity-[0.03] pointer-events-none">
               <svg className="w-full h-full text-text-primary animate-spin-slow" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
               </svg>
            </div>

            <div className="flex-1 space-y-6 relative z-10">
               <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.35em] text-accent-glow/80">Active Directive</span>
                  <h3 className="text-3xl md:text-4xl font-langdon text-text-primary tracking-tight">The Logic Paradox</h3>
               </div>
               <p className="text-base text-text-secondary leading-relaxed max-w-xl italic">
                  Solve the "Optimized Variable Allocation" challenge to earn the <span className="text-accent-glow font-semibold">Architect Badge</span> and sync your neural core.
               </p>
               <button 
                onClick={navigateToChallenges}
                className="flex items-center gap-3 px-6 py-3 bg-white/[0.02] border border-white/[0.08] hover:border-accent-glow/40 rounded-xl text-[10px] font-bold uppercase tracking-widest text-accent-glow transition-all group/btn"
               >
                  Initiate Challenge <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
               </button>
            </div>

            <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl bg-white/[0.01] border border-white/[0.05] flex items-center justify-center relative z-10 shrink-0">
               <FlaskConical className="w-10 h-10 md:w-16 md:h-16 text-accent-glow/80 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
            </div>
         </motion.div>
      </section>

      {/* Slab 3: Validation Grid (Quizzes & Challenges) or Empty State */}
      {allPractice.quizzes.length === 0 && allPractice.challenges.length === 0 ? (
        <section className="py-20 flex flex-col items-center justify-center text-center space-y-6 min-h-[350px] relative overflow-hidden border border-white/[0.06] rounded-3xl bg-white/[0.01]">
          <div className="absolute inset-0 bg-accent-glow/[0.02] blur-[80px] -z-10" />
          <div className="w-16 h-16 rounded-full bg-accent-glow/5 border border-accent-glow/20 flex items-center justify-center text-accent-glow animate-pulse">
             <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-lg px-6">
             <h3 className="text-2xl font-langdon text-text-primary tracking-tight">Protocol Synchronization Required</h3>
             <p className="text-sm text-text-muted leading-relaxed italic">
                Your current roadmap was generated using a legacy layout and lacks practice nodes. Re-generate to unlock validation paths.
             </p>
          </div>
          <button 
             onClick={onNavigateHome}
             className="px-8 py-3.5 bg-accent-glow hover:bg-accent-glow/90 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(99,102,241,0.25)]"
          >
             Re-generate Mastery Journey
          </button>
        </section>
      ) : (
        <section id="challenges-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* Left: Quizzes */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-xl font-langdon text-text-primary flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-accent-glow" />
                Pulse Quizzes
              </h3>
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-50">{filteredQuizzes.length} Found</span>
            </div>

            <div className="space-y-4">
               {filteredQuizzes.map((quiz) => (
                 <motion.div 
                   key={quiz.id}
                   whileHover={{ x: 3 }}
                   className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] group relative transition-all"
                 >
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <div className="space-y-1">
                         <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{quiz.subTopicTitle}</span>
                         <h4 className="text-lg font-langdon text-text-primary group-hover:text-accent-glow transition-colors">{quiz.title}</h4>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0 ${
                        quiz.difficulty === 'Beginner' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 
                        quiz.difficulty === 'Intermediate' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' : 
                        'bg-rose-500/5 text-rose-400 border-rose-500/20'
                      }`}>
                        {quiz.difficulty}
                      </div>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed mb-4">{quiz.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.05] mt-4">
                      <span className="text-[8px] font-black text-text-muted uppercase tracking-widest opacity-40">via {quiz.provider}</span>
                      <a 
                        href={optimizeLearningLink(quiz.url, quiz.title, 'quiz')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[9px] font-bold text-accent-glow uppercase tracking-wider hover:underline"
                      >
                        Start Quiz <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>

          {/* Right: Coding Challenges */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="text-xl font-langdon text-text-primary flex items-center gap-3">
                <Zap className="w-5 h-5 text-accent-glow" />
                Manifest Challenges
              </h3>
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-50">{filteredChallenges.length} Found</span>
            </div>

            <div className="space-y-4">
              {filteredChallenges.map((challenge) => {
                const isCompleted = progress.completedChallengeIds.includes(challenge.id);
                return (
                  <div 
                    key={challenge.id}
                    className={`p-6 rounded-2xl border transition-all ${isCompleted ? 'bg-accent-glow/[0.03] border-accent-glow/20' : 'bg-white/[0.01] border-white/[0.06]'}`}
                  >
                     <div className="flex justify-between items-start mb-3 gap-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2 opacity-60">
                              <Layers className="w-3 h-3 text-accent-glow/50" />
                              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{challenge.type} • {challenge.subTopicTitle}</span>
                           </div>
                           <h4 className="text-lg font-langdon text-text-primary">{challenge.title}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-60 shrink-0">
                           <Trophy className="w-3.5 h-3.5 text-accent-glow" />
                           <span className="text-[8px] font-black text-text-primary uppercase tracking-widest">{challenge.reward}</span>
                        </div>
                     </div>
                     <p className="text-xs text-text-muted leading-relaxed mb-4">
                        {challenge.description}
                     </p>
                     <div className="flex items-center justify-between pt-4 border-t border-white/[0.05] mt-4">
                        {challenge.externalUrl ? (
                          <a 
                            href={optimizeLearningLink(challenge.externalUrl, challenge.title, 'challenge')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[9px] font-bold text-text-primary uppercase tracking-widest hover:text-accent-glow transition-colors"
                          >
                            Workspace <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <div className="w-4" />
                        )}
                        
                        <button 
                          onClick={() => onCompleteChallenge(challenge.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${
                            isCompleted ? 'bg-accent-glow text-white' : 'bg-white/[0.02] text-text-muted border border-white/[0.08] hover:text-accent-glow hover:border-accent-glow/50'
                          }`}
                        >
                           {isCompleted ? <><CheckCircle2 className="w-3 h-3" /> Verified</> : 'Verify'}
                        </button>
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Slab 4: Performance Monitor */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-white/[0.06]">
         <div className="lg:col-span-8 space-y-4">
            <h3 className="text-lg font-langdon text-text-primary">Performance Resonance</h3>
            <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex-1 w-full space-y-3">
                  <div className="flex justify-between items-end">
                     <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Confidence Synchronization</span>
                     <span className="text-2xl font-langdon text-accent-glow">{progress.practiceScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.practiceScore}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-accent-glow shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                     />
                  </div>
               </div>
               <div className="hidden sm:block w-[1px] h-10 bg-white/[0.08]" />
               <div className="text-center shrink-0">
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] opacity-50">Rank</p>
                  <p className="text-lg font-black text-text-primary uppercase tracking-tight">Tactician</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 p-6 bg-accent-glow/[0.03] rounded-2xl border border-accent-glow/10 flex flex-col justify-between gap-4">
            <div className="flex justify-between items-start">
              <Sparkles className="w-6 h-6 text-accent-glow" />
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-accent-glow animate-pulse" />
                 <span className="text-[8px] font-black text-accent-glow uppercase tracking-widest">Resonance Sync</span>
              </div>
            </div>
            <p className="text-xs font-sans text-text-muted leading-relaxed">
               Verified challenges stabilize your Mastery Architecture and boost confidence sync.
            </p>
         </div>
      </section>
    </div>
  );
}
