import { Roadmap, UserProgress } from '../types';
import { Clock, Flame, BarChart3, TrendingUp, CheckCircle2, Zap, Activity, ShieldCheck, ArrowRight, Sparkles, Layers } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-32 space-y-12 relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-accent-glow/[0.015] blur-[130px] -z-10" />

      {/* Slab 1: Premium Dashboard Header */}
      <section className="py-10 border-b border-white/[0.06] relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-glow animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-glow/85">
                Strategic Overview Protocol
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-text-primary tracking-tight">
              Control <span className="text-text-muted font-light font-serif opacity-70">Dashboard</span>
            </h1>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-6 bg-[#08081a]/50 border border-white/[0.06] px-6 py-3 rounded-xl shadow-lg backdrop-blur-md"
          >
             <div className="text-left">
               <p className="text-[8px] font-black text-text-muted/50 uppercase tracking-widest mb-1">Ranking</p>
               <p className="text-[11px] font-black text-text-primary uppercase tracking-widest leading-none">
                 Architect <span className="text-accent-glow">LVL 0{Math.floor(progressPercent / 10) + 1}</span>
               </p>
             </div>
             <div className="w-[1px] h-6 bg-white/[0.08]" />
             <div className="text-left">
               <p className="text-[8px] font-black text-text-muted/50 uppercase tracking-widest mb-1">Sync State</p>
               <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-accent-success animate-pulse" />
                 <p className="text-[10px] font-black text-accent-success uppercase tracking-wider">Active</p>
               </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Slab 2: Core Vitals & Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left Side: Circular Progress and Stats */}
        <div className="lg:col-span-8 p-8 rounded-3xl border border-white/[0.06] bg-white/[0.01] flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative w-48 h-48 flex-shrink-0">
             <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.15)]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="5" />
                <motion.circle 
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: progressPercent / 100 }}
                   transition={{ duration: 1.5, ease: "circOut" }}
                   cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" 
                   className="text-accent-glow" strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl md:text-5xl font-serif italic text-text-primary leading-none tracking-tight">{progressPercent}%</span>
                <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mt-2">Mastery</span>
             </div>
          </div>

          <div className="flex-1 space-y-6">
             <div className="space-y-2">
                <h3 className="text-2xl font-serif italic text-text-primary tracking-tight">Neural Sync Velocity</h3>
                <p className="text-sm text-text-muted leading-relaxed italic">
                   Optimal development trajectory. Theoretical completion reaches stable sync in <span className="text-accent-glow font-semibold">1.4 cycles</span>.
                </p>
             </div>
             
             <div className="grid grid-cols-3 gap-6 pt-2 border-t border-white/[0.05]">
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-text-muted/50 uppercase tracking-widest">Time Delta</p>
                   <p className="text-lg font-serif italic text-text-primary">{calculateHoursSpent()} <span className="text-[9px] uppercase font-bold opacity-30">Hrs</span></p>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-text-muted/50 uppercase tracking-widest">Streak</p>
                   <p className="text-lg font-serif italic text-accent-glow">{progress.currentStreak} <span className="text-[9px] uppercase font-bold opacity-30">Days</span></p>
                </div>
                <div className="space-y-1">
                   <p className="text-[8px] font-black text-text-muted/50 uppercase tracking-widest">Nodes Set</p>
                   <p className="text-lg font-serif italic text-text-primary">{completedSubTopics}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Milestones */}
        <div className="lg:col-span-4 p-8 rounded-3xl border border-white/[0.06] bg-white/[0.01] flex flex-col justify-between gap-6">
          <div className="space-y-6">
             <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <h3 className="text-lg font-serif italic text-text-primary">Sequence Logic</h3>
                <Sparkles className="w-4 h-4 text-accent-glow/80" />
             </div>
             <div className="space-y-4">
                {[
                  { id: '01', label: 'Initialization', status: 'Completed', min: 0 },
                  { id: '02', label: 'Apprentice', status: 'In Progress', min: 25 },
                  { id: '03', label: 'Decipherer', status: 'Locked', min: 50 },
                ].map((m) => (
                  <div key={m.id} className={`flex items-center gap-4 ${progressPercent >= m.min ? 'opacity-100' : 'opacity-30'}`}>
                     <span className="text-[10px] font-mono text-accent-glow/85">{m.id}</span>
                     <p className="text-sm font-semibold text-text-primary tracking-tight">{m.label}</p>
                     <div className="ml-auto h-[1px] flex-1 bg-white/[0.05] mx-3" />
                     {progressPercent >= m.min && <CheckCircle2 className="w-3.5 h-3.5 text-accent-success" />}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Slab 3: Heatmap & Allocation */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Consistency Grid */}
        <div className="lg:col-span-8 p-8 rounded-3xl border border-white/[0.06] bg-white/[0.01] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
            <h3 className="text-lg font-serif italic text-text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-glow" />
              Consistency Delta
            </h3>
            <span className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest">Last 90 Days</span>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-2 pt-2">
            {heatmapDays.map((day, idx) => (
              <div 
                key={idx}
                className={`aspect-square rounded-[3px] transition-all ${
                  day.count === 0 ? 'bg-white/[0.02]' : 
                  day.count < 3 ? 'bg-accent-glow/30' : 
                  'bg-accent-glow shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                }`}
                title={`${day.date}: ${day.count} activities`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-[8px] font-black text-text-muted/30 uppercase tracking-widest pt-2">
            <span>Start of Cycle</span>
            <div className="h-[1px] flex-1 mx-6 bg-white/[0.05] border-t border-dashed" />
            <span>Operational Target</span>
          </div>
        </div>

        {/* Resource Allocation */}
        <div className="lg:col-span-4 p-8 rounded-3xl border border-white/[0.06] bg-white/[0.01] space-y-6">
           <div className="space-y-4">
              <h3 className="text-lg font-serif italic text-text-primary pb-3 border-b border-white/[0.05]">Resource Balance</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Conceptual', value: '45%' },
                   { label: 'Technical', value: '35%' },
                   { label: 'Applied', value: '20%' },
                 ].map((item) => (
                   <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between items-end">
                         <span className="text-[8px] font-black uppercase tracking-wider text-text-muted/65">{item.label}</span>
                         <span className="text-xs font-serif italic text-accent-glow">{item.value}</span>
                      </div>
                      <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: item.value }}
                           transition={{ duration: 1.2, ease: "circOut" }}
                           className="h-full bg-accent-glow/60" 
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Slab 4: Tactical Proficiency */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
         <div className="lg:col-span-8 p-8 rounded-3xl border border-white/[0.06] bg-white/[0.01] space-y-6">
            <h3 className="text-lg font-serif italic text-text-primary pb-3 border-b border-white/[0.05] flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-accent-glow" />
               Tactical Proficiency
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex-1 w-full space-y-3">
                  <div className="flex justify-between items-end">
                     <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/50">Laboratory Verification</span>
                     <span className="text-2xl font-serif italic text-text-primary">{progress.practiceScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.05]">
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
                  <p className="text-[8px] font-black text-text-muted/40 uppercase tracking-widest mb-1">Sync count</p>
                  <p className="text-lg font-black text-text-primary">{progress.completedChallengeIds.length}</p>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 p-8 rounded-3xl bg-accent-glow/[0.03] border border-accent-glow/10 flex flex-col justify-center gap-4">
            <div className="space-y-1">
               <p className="text-[8px] font-black text-text-muted/45 uppercase tracking-widest italic">Operational Rank</p>
               <h4 className="text-xl font-serif italic text-text-primary leading-none">The Tactician</h4>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
               High resonance verified in practical sandbox environments. Coding concepts are stabilizing with excellent accuracy.
            </p>
         </div>
      </section>
    </div>
  );
}
