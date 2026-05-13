
import { Roadmap, UserProgress } from '../types';
import { Target, Flame, BarChart3, TrendingUp, Calendar, CheckCircle2, Zap, Activity, Trophy, Network, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  roadmap: Roadmap;
  progress: UserProgress;
}

export default function Dashboard({ roadmap, progress }: DashboardProps) {
  if (!roadmap) return null;
  
  const totalSubTopics = roadmap.nodes.reduce((acc, n) => acc + n.subTopics.length, 0);
  const completedSubTopics = progress.completedSubTopicIds.length;
  const progressPercent = Math.round((completedSubTopics / (totalSubTopics || 1)) * 100);

  const calculateHoursSpent = () => {
    let hours = 0;
    roadmap.nodes.forEach(node => {
      node.subTopics.forEach(sub => {
        if (progress.completedSubTopicIds.includes(sub.id)) {
          hours += sub.estimatedHours || 2;
        }
      });
    });
    return hours;
  };

  const today = new Date();
  const heatmapDays = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (89 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      count: progress.dailyActivity?.[dateStr] || 0
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-10 pt-16 pb-40 space-y-0">
      {/* Slab 1: Dashboard Header */}
      <section className="py-24 border-b border-border-primary relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-glow"
            >
              Strategic Overview Protocol
            </motion.h2>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-serif italic text-text-primary tracking-tighter leading-[0.8] -ml-2"
            >
              Control <br />
              <span className="text-text-muted font-light opacity-30">Dashboard</span>
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-12 bg-bg-secondary/80 backdrop-blur-3xl px-12 py-8 rounded-2xl border border-border-pill shadow-3xl"
          >
             <div className="text-left">
               <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em] mb-3">Ranking</p>
               <p className="text-sm font-black text-text-primary uppercase tracking-widest leading-none">Architect <span className="text-accent-glow">LVL 0{Math.floor(progressPercent / 10) + 1}</span></p>
             </div>
             <div className="w-[1px] h-12 bg-border-primary" />
             <div className="text-left">
               <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em] mb-3">Sync State</p>
               <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-accent-success shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                 <p className="text-xs font-black text-accent-success uppercase tracking-widest">Active</p>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Slab 2: Core Vitals & Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-border-primary">
        <div className="lg:col-span-8 py-24 pr-12 border-r border-border-primary space-y-16">
           <div className="flex flex-col xl:flex-row items-center gap-20">
              <div className="relative w-80 h-80 flex-shrink-0">
                 <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-track)" strokeWidth="4" />
                    <motion.circle 
                       initial={{ pathLength: 0 }}
                       animate={{ pathLength: progressPercent / 100 }}
                       transition={{ duration: 2, ease: "circOut" }}
                       cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" 
                       className="text-accent-glow" strokeLinecap="round"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-9xl font-serif italic text-text-primary leading-none tracking-tighter">{progressPercent}%</span>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.5em] mt-6">Mastery</span>
                 </div>
              </div>

              <div className="flex-1 space-y-10">
                 <div className="space-y-4">
                    <h3 className="text-5xl font-serif italic text-text-primary leading-tight">Neural Sync Velocity</h3>
                    <p className="text-xl text-text-muted leading-relaxed font-medium italic">
                       Optimal growth trajectory detected. Theoretical completion at current intensity reaches stabilization in <span className="text-accent-glow font-bold">1.4 cycles</span>.
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-12">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest">Time Delta</p>
                       <p className="text-4xl font-serif italic text-text-primary">{calculateHoursSpent()} <span className="text-[10px] uppercase font-bold opacity-30">Hrs</span></p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest">Daily Streak</p>
                       <p className="text-4xl font-serif italic text-accent-glow">{progress.currentStreak}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest">Nodes Set</p>
                       <p className="text-4xl font-serif italic text-text-primary">{completedSubTopics}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 py-24 pl-12 flex flex-col justify-between h-full bg-bg-secondary/20">
           <div className="space-y-12">
              <div className="flex items-center justify-between">
                 <h3 className="text-3xl font-serif italic text-text-primary">Sequence Logic</h3>
                 <Sparkles className="w-5 h-5 text-accent-glow" />
              </div>
              <div className="space-y-8">
                 {[
                   { id: '01', label: 'Initialization', status: 'Completed', min: 0 },
                   { id: '02', label: 'Apprentice', status: 'In Progress', min: 25 },
                   { id: '03', label: 'Decipherer', status: 'Locked', min: 50 },
                 ].map((m) => (
                   <div key={m.id} className={`flex items-center gap-6 ${progressPercent >= m.min ? 'opacity-100' : 'opacity-20'}`}>
                      <span className="text-xs font-black text-accent-glow font-mono tracking-tighter">{m.id}</span>
                      <p className="text-xl font-medium text-text-primary tracking-tight">{m.label}</p>
                      <div className="ml-auto h-[1px] flex-1 bg-border-primary mx-4" />
                      {progressPercent >= m.min && <CheckCircle2 className="w-4 h-4 text-accent-success" />}
                   </div>
                 ))}
              </div>
           </div>

           <motion.div 
             whileHover={{ x: 10 }}
             className="flex items-center justify-between p-8 rounded-xl bg-accent-glow text-white shadow-3xl cursor-pointer group mt-16"
           >
              <Zap className="w-5 h-5" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Materialize Next Protocol</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </motion.div>
        </div>
      </section>

      {/* Slab 3: Heatmap & Allocation */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-border-primary">
        <div className="lg:col-span-8 py-24 pr-12 border-r border-border-primary space-y-16">
          <div className="space-y-8">
            <h3 className="text-4xl font-serif italic text-text-primary flex items-center gap-4">
              <Activity className="w-10 h-10 text-accent-glow" />
              Consistency Delta
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(18px,1fr))] gap-3 pt-6">
              {heatmapDays.map((day, idx) => (
                <div 
                  key={idx}
                  className={`aspect-square rounded-[2px] ${
                    day.count === 0 ? 'bg-bg-track' : 
                    day.count < 3 ? 'bg-accent-glow/40' : 
                    'bg-accent-glow shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-text-muted/20 uppercase tracking-[0.4em] pt-4">
              <span>Initialization Phase</span>
              <div className="h-[1px] flex-1 mx-12 bg-border-primary border-t border-dashed" />
              <span>Active Cycle Delay</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 py-24 pl-12 space-y-16">
           <div className="space-y-10">
              <h3 className="text-3xl font-serif italic text-text-primary">Resource Allocation</h3>
              <div className="space-y-8">
                 {[
                   { label: 'Conceptual', value: '45%' },
                   { label: 'Technical', value: '35%' },
                   { label: 'applied', value: '20%' },
                 ].map((item) => (
                   <div key={item.label} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40">{item.label}</span>
                         <span className="text-2xl font-serif italic text-text-muted/20">{item.value}</span>
                      </div>
                      <div className="w-full h-1 bg-bg-track rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: item.value }}
                           transition={{ duration: 1.5, ease: "circOut" }}
                           className="h-full bg-accent-glow/60" 
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 rounded-2xl bg-bg-secondary/40 border border-border-pill">
              <p className="text-[10px] font-black text-accent-glow uppercase tracking-[0.3em] mb-4 opacity-60">Architectural Note</p>
              <p className="text-lg font-serif italic text-text-muted/60 leading-relaxed">
                Increase operational bandwidth in technical modules to stabilize long-term retention benchmarks.
              </p>
           </div>
        </div>
      </section>

      {/* Slab 4: Tactical Proficiency */}
      <section className="grid grid-cols-1 lg:grid-cols-12">
         <div className="lg:col-span-8 py-24 pr-12 border-r border-border-primary space-y-12">
            <h3 className="text-4xl font-serif italic text-text-primary flex items-center gap-4">
               <ShieldCheck className="w-10 h-10 text-accent-glow" />
               Tactical Proficiency
            </h3>
            <div className="bg-bg-secondary/80 backdrop-blur-3xl p-12 rounded-3xl border border-border-pill flex items-center justify-between gap-12">
               <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">Challenge Laboratory Sync</span>
                     <span className="text-5xl font-serif italic text-text-primary">{progress.practiceScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-bg-track rounded-full overflow-hidden p-1 shadow-inner border border-border-primary">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.practiceScore}%` }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-accent-glow shadow-[0_0_20px_rgba(99,102,241,0.6)] rounded-full"
                     />
                  </div>
               </div>
               <div className="w-[1px] h-24 bg-border-primary" />
               <div className="text-center">
                  <p className="text-[10px] font-black text-text-muted/20 uppercase tracking-[0.4em] mb-2">Protocol Verified</p>
                  <p className="text-3xl font-black text-text-primary">{progress.completedChallengeIds.length}</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 py-24 pl-12 flex flex-col justify-center gap-8">
            <div className="space-y-4">
               <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest italic">Current Status</p>
               <h4 className="text-4xl font-serif italic text-text-primary leading-none">The Tactician</h4>
            </div>
            <p className="text-xl text-text-muted/40 leading-relaxed font-medium">
               High resonance detected in practical validation modules. Theoretical concepts are stabilizing with a <span className="text-text-primary">94%</span> success factor.
            </p>
         </div>
      </section>
    </div>
  );
}
