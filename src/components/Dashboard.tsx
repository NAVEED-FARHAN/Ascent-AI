
import { Roadmap, UserProgress } from '../types';
import { Target, Flame, BarChart3, TrendingUp, Calendar, CheckCircle2, Zap, Activity, Trophy, Network, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  roadmap: Roadmap;
  progress: UserProgress;
}

export default function Dashboard({ roadmap, progress }: DashboardProps) {
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
      {/* Slab 1: Performance Header */}
      <section className="py-24 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-glow/5 blur-[150px] -z-10" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
          <div className="space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-glow"
            >
              Mastery Intelligence Protocol
            </motion.h2>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-[10rem] font-serif italic text-white tracking-tighter leading-[0.75] -ml-2"
            >
              Performance <br />
              <span className="text-text-secondary/20 font-light">Architecture</span>
            </motion.h1>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-12 frosted-glass px-12 py-8 rounded-3xl border border-white/10 shadow-3xl"
          >
             <div className="text-left">
               <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.3em] mb-3">Ranking</p>
               <p className="text-sm font-black text-white uppercase tracking-widest leading-none">Architect <span className="text-accent-glow">LVL 0{Math.floor(progressPercent / 10) + 1}</span></p>
             </div>
             <div className="w-[1px] h-12 bg-white/10" />
             <div className="text-left">
               <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-[0.3em] mb-3">Sync State</p>
               <div className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-accent-success shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                 <p className="text-xs font-black text-accent-success uppercase tracking-widest">Active</p>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Slab 2: Core Vitals & Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/5">
        <div className="lg:col-span-8 py-24 pr-12 border-r border-white/5 space-y-16">
           <div className="flex flex-col xl:flex-row items-center gap-20">
              <div className="relative w-80 h-80 flex-shrink-0">
                 <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                    <motion.circle 
                       initial={{ pathLength: 0 }}
                       animate={{ pathLength: progressPercent / 100 }}
                       transition={{ duration: 2, ease: "circOut" }}
                       cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" 
                       className="text-accent-glow" strokeLinecap="round"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-9xl font-serif italic text-white leading-none tracking-tighter">{progressPercent}%</span>
                    <span className="text-[10px] font-black text-text-secondary/30 uppercase tracking-[0.5em] mt-6">Mastery</span>
                 </div>
              </div>

              <div className="flex-1 space-y-10">
                 <div className="space-y-4">
                    <h3 className="text-5xl font-serif italic text-white leading-tight">Neural Sync Velocity</h3>
                    <p className="text-xl text-text-secondary/60 font-medium leading-relaxed max-w-xl italic">
                       Optimal growth trajectory detected. Theoretical completion at current intensity reaches stabilization in <span className="text-accent-glow font-bold">1.4 cycles</span>.
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-12">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Time Delta</p>
                       <p className="text-4xl font-serif italic text-white">{calculateHoursSpent()} <span className="text-[10px] uppercase font-bold opacity-30">Hrs</span></p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Daily Streak</p>
                       <p className="text-4xl font-serif italic text-accent-glow">{progress.currentStreak}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest">Nodes Set</p>
                       <p className="text-4xl font-serif italic text-white">{completedSubTopics}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 py-24 pl-12 flex flex-col justify-between h-full bg-white/[0.01]">
           <div className="space-y-12">
              <div className="flex items-center justify-between">
                 <h3 className="text-3xl font-serif italic text-white">Sequence Logic</h3>
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
                      <p className="text-xl font-medium text-white tracking-tight">{m.label}</p>
                      <div className="ml-auto h-[1px] flex-1 bg-white/5 mx-4" />
                      {progressPercent >= m.min && <CheckCircle2 className="w-4 h-4 text-accent-success" />}
                   </div>
                 ))}
              </div>
           </div>

           <motion.div 
             whileHover={{ x: 10 }}
             className="flex items-center justify-between p-8 rounded-2xl bg-accent-glow text-white shadow-3xl cursor-pointer group mt-16"
           >
              <Zap className="w-5 h-5" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Materialize Next Protocol</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </motion.div>
        </div>
      </section>

      {/* Slab 3: Heatmap & Allocation */}
      <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/5">
        <div className="lg:col-span-8 py-24 pr-12 border-r border-white/5 space-y-16">
          <div className="space-y-8">
            <h3 className="text-4xl font-serif italic text-white flex items-center gap-4">
              <Activity className="w-10 h-10 text-accent-glow" />
              Consistency Delta
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(18px,1fr))] gap-3 pt-6">
              {heatmapDays.map((day, idx) => (
                <div 
                  key={idx}
                  className={`aspect-square rounded-[2px] ${
                    day.count === 0 ? 'bg-white/5' : 
                    day.count < 3 ? 'bg-accent-glow/40' : 
                    'bg-accent-glow shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-text-secondary/20 uppercase tracking-[0.4em] pt-4">
              <span>Initialization Phase</span>
              <div className="h-[1px] flex-1 mx-12 bg-white/5 border-t border-dashed" />
              <span>Active Cycle Delay</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 py-24 pl-12 space-y-16">
           <div className="space-y-10">
              <h3 className="text-3xl font-serif italic text-white">Resource Allocation</h3>
              <div className="space-y-8">
                 {[
                   { label: 'Conceptual', value: '45%' },
                   { label: 'Technical', value: '35%' },
                   { label: 'applied', value: '20%' },
                 ].map((item) => (
                   <div key={item.label} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/40">{item.label}</span>
                         <span className="text-2xl font-serif italic text-white/20">{item.value}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
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

           <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
              <p className="text-[10px] font-black text-accent-glow uppercase tracking-[0.3em] mb-4 opacity-60">Architectural Note</p>
              <p className="text-lg font-serif italic text-text-secondary/60 leading-relaxed">
                Increase operational bandwidth in technical modules to stabilize long-term retention benchmarks.
              </p>
           </div>
        </div>
      </section>

      {/* Slab 4: Tactical Proficiency */}
      <section className="grid grid-cols-1 lg:grid-cols-12">
         <div className="lg:col-span-8 py-24 pr-12 border-r border-white/5 space-y-12">
            <h3 className="text-4xl font-serif italic text-white flex items-center gap-4">
               <ShieldCheck className="w-10 h-10 text-accent-glow" />
               Tactical Proficiency
            </h3>
            <div className="frosted-glass p-12 rounded-[2.5rem] border border-white/10 flex items-center justify-between gap-12 bg-white/[0.01]">
               <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/40">Challenge Laboratory Sync</span>
                     <span className="text-5xl font-serif italic text-white">{progress.practiceScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-1 shadow-inner">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.practiceScore}%` }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="h-full bg-accent-glow shadow-[0_0_20px_rgba(99,102,241,0.6)] rounded-full"
                     />
                  </div>
               </div>
               <div className="w-[1px] h-24 bg-white/5" />
               <div className="text-center">
                  <p className="text-[10px] font-black text-text-secondary/20 uppercase tracking-[0.4em] mb-2">Protocol Verified</p>
                  <p className="text-3xl font-black text-white">{progress.completedChallengeIds.length}</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 py-24 pl-12 flex flex-col justify-center gap-8">
            <div className="space-y-4">
               <p className="text-[10px] font-black text-text-secondary/40 uppercase tracking-widest italic">Current Status</p>
               <h4 className="text-4xl font-serif italic text-white leading-none">The Tactician</h4>
            </div>
            <p className="text-xl text-text-secondary/40 leading-relaxed font-medium">
               High resonance detected in practical validation modules. Theoretical concepts are stabilizing with a <span className="text-white">94%</span> success factor.
            </p>
         </div>
      </section>
    </div>
  );
}
