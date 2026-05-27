
import { Landmark, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, Search, ArrowRight, Activity, Zap, Layers, Sparkles, Target, Compass, ChevronLeft, ChevronRight, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { Roadmap, UserProgress, SubTopic } from '../types';

interface PlannerProps {
  roadmap: Roadmap;
  progress: UserProgress;
  searchQuery?: string;
}

export default function Planner({ roadmap, progress, searchQuery = '' }: PlannerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const pendingSubTopics = useMemo(() => {
    const pending: { nodeTitle: string; subTopic: SubTopic }[] = [];
    roadmap.nodes.forEach(node => {
      node.subTopics.forEach(sub => {
        if (!progress.completedSubTopicIds.includes(sub.id)) {
          pending.push({ nodeTitle: node.title, subTopic: sub });
        }
      });
    });
    return pending;
  }, [roadmap, progress]);

  // Distribute tasks across days (mock schedule for specific dates)
  const scheduledTasks = useMemo(() => {
    const schedule: Record<string, typeof pendingSubTopics> = {};
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    let currentTaskIdx = 0;
    for (let i = 0; i < 30; i++) {
       const date = new Date(startDate);
       date.setDate(startDate.getDate() + i);
       const dateKey = date.toISOString().split('T')[0];
       
       // Assign 1-2 tasks per day roughly
       const dayTasks = pendingSubTopics.slice(currentTaskIdx, currentTaskIdx + 2);
       if (dayTasks.length > 0) {
         schedule[dateKey] = dayTasks;
         currentTaskIdx += dayTasks.length;
       }
    }
    return schedule;
  }, [pendingSubTopics]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    
    const calendarDays: (Date | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= days; i++) {
      calendarDays.push(new Date(year, month, i));
    }
    return calendarDays;
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  return (
    <div className="max-w-[1240px] w-full mx-auto px-6 md:px-10 pt-16 pb-40 space-y-0 relative">
      <div className="absolute top-0 left-0 w-full h-[800px] bg-accent-glow/[0.02] blur-[150px] -z-10" />
      
      {/* Header Slab */}
      <section className="py-20 border-b border-border-primary flex flex-col lg:flex-row items-end justify-between gap-12">
        <div className="space-y-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[11px] font-semibold uppercase tracking-[0.5em] text-accent-glow"
          >
            Tactical Deployment Protocol
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-serif italic text-text-primary tracking-tighter leading-[0.8] -ml-2"
          >
            Chronos <br />
            <span className="text-text-muted/20 font-light text-6xl md:text-8xl">Architecture</span>
          </motion.h1>
        </div>

        <div className="flex items-center gap-4 bg-bg-secondary/80 backdrop-blur-3xl p-2 rounded-2xl border border-border-pill">
           <button onClick={handlePrevMonth} className="p-4 hover:bg-bg-secondary rounded-xl text-text-muted hover:text-text-primary transition-all">
              <ChevronLeft className="w-6 h-6" />
           </button>
           <span className="text-xl font-serif italic text-text-primary px-8 min-w-[200px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
           </span>
           <button onClick={handleNextMonth} className="p-4 hover:bg-bg-secondary rounded-xl text-text-muted hover:text-text-primary transition-all">
              <ChevronRight className="w-6 h-6" />
           </button>
        </div>
      </section>

      {/* Calendar Grid Slab */}
      <section className="py-12">
        <div className="grid grid-cols-7 border border-border-primary rounded-3xl overflow-hidden shadow-3xl bg-bg-secondary/20 backdrop-blur-3xl">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-6 text-center border-b border-r border-border-primary bg-bg-secondary/40">
               <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-text-muted/40">{day}</span>
            </div>
          ))}

          {/* Calendar Cells */}
          {daysInMonth.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="p-6 border-b border-r border-border-primary bg-bg-secondary/5" />;
            
            const dateKey = date.toISOString().split('T')[0];
            const dayTasks = scheduledTasks[dateKey] || [];
            const isToday = dateKey === new Date().toISOString().split('T')[0];

            return (
              <motion.div 
                key={dateKey}
                whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                onClick={() => dayTasks.length > 0 && setSelectedDay(date)}
                className={`min-h-[160px] p-6 border-b border-r border-border-primary relative group cursor-pointer transition-all ${isToday ? 'bg-accent-glow/5' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-2xl font-serif italic ${isToday ? 'text-accent-glow scale-110' : 'text-text-muted/40'}`}>
                    {date.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="w-2 h-2 rounded-full bg-accent-glow animate-pulse" />
                  )}
                </div>

                <div className="space-y-2">
                   {dayTasks.map((t, i) => (
                     <div key={i} className="px-3 py-1.5 rounded-lg bg-accent-glow/10 border border-accent-glow/20 text-[9px] font-black text-accent-glow uppercase tracking-widest line-clamp-1 truncate">
                        {t.subTopic.title}
                     </div>
                   ))}
                </div>

                {isToday && (
                  <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-accent-glow/30 rounded-full" />
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Detail Popup Overlay */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[70] p-12 bg-bg-secondary/95 backdrop-blur-3xl rounded-[2rem] border border-border-pill shadow-4xl"
            >
               <div className="space-y-12">                     <div className="flex justify-between items-start">
                        <div>
                           <h3 className="text-[11px] font-semibold text-accent-glow uppercase tracking-[0.4em] mb-4">Daily Manifest</h3>
                        <h2 className="text-5xl font-serif italic text-text-primary tracking-tighter">
                           {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>
                     </div>
                     <button onClick={() => setSelectedDay(null)} className="p-4 bg-bg-secondary/40 rounded-2xl hover:bg-bg-secondary transition-all text-text-muted">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="space-y-8 max-h-[400px] overflow-y-auto pr-6 scrollbar-hide">
                     {(scheduledTasks[selectedDay.toISOString().split('T')[0]] || []).map((t, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-bg-secondary/40 border border-border-primary space-y-6 group/item hover:border-accent-glow/30 transition-all">
                           <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                 <p className="text-[10px] font-semibold text-text-muted/40 uppercase tracking-widest">{t.nodeTitle}</p>
                                 <h4 className="text-3xl font-serif italic text-text-primary group-hover/item:text-accent-glow transition-colors">{t.subTopic.title}</h4>
                              </div>
                              <div className="px-4 py-2 rounded-xl bg-accent-glow/10 border border-accent-glow/20 text-xs font-semibold text-accent-glow uppercase tracking-tighter">
                                 {t.subTopic.estimatedHours}h Dev
                              </div>
                           </div>
                           <p className="text-base text-text-muted/60 leading-relaxed font-medium italic">
                              {t.subTopic.description}
                           </p>
                           <div className="pt-6 border-t border-border-primary grid grid-cols-2 gap-4">
                              {t.subTopic.resources.slice(0, 2).map((res, ri) => (
                                <a 
                                  key={ri}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary/40 border border-border-primary hover:bg-bg-secondary hover:border-accent-glow/20 transition-all group/link"
                                >
                                   <span className="text-[10px] font-black text-text-primary uppercase tracking-widest truncate max-w-[150px]">{res.title}</span>
                                   <ExternalLink className="w-3 h-3 text-accent-glow group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                </a>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>                     <div className="pt-8 border-t border-border-primary flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <Clock className="w-5 h-5 text-accent-glow/60" />
                        <span className="text-sm font-medium text-text-secondary italic">Synchronize temporal delta</span>
                     </div>
                     <button className="flex items-center gap-3 px-8 py-4 bg-accent-glow text-white rounded-2xl font-semibold text-[10px] uppercase tracking-widest hover:shadow-2xl active:scale-95 transition-all">
                        Launch Sequence <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

