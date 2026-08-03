import { Landmark, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, Search, ArrowRight, Activity, Zap, Layers, Sparkles, Target, Compass, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { Roadmap, UserProgress, SubTopic } from '../types';
import { auth, googleProvider } from '../lib/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface PlannerProps {
  roadmap: Roadmap;
  progress: UserProgress;
  searchQuery?: string;
}

export default function Planner({ roadmap, progress, searchQuery = '' }: PlannerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSyncGoogleCalendar = async () => {
    setIsSyncing(true);
    setSyncToast(null);
    try {
      let token = localStorage.getItem('google_access_token');
      
      const testTokenValidity = async (t: string) => {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + t);
          return res.ok;
        } catch {
          return false;
        }
      };

      const isValid = token ? await testTokenValidity(token) : false;

      if (!isValid) {
        googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential && credential.accessToken) {
          token = credential.accessToken;
          localStorage.setItem('google_access_token', token);
        } else {
          throw new Error("Authentication failed or access token missing.");
        }
      }

      if (!token) throw new Error("Google Calendar access token not found.");

      // Build full schedule from ALL roadmap nodes (not just pending)
      const allTasks: { nodeTitle: string; subTopic: SubTopic }[] = [];
      roadmap.nodes.forEach(node => {
        node.subTopics.forEach(sub => {
          allTasks.push({ nodeTitle: node.title, subTopic: sub });
        });
      });

      if (allTasks.length === 0) {
        setSyncToast({ type: 'error', message: 'No tasks found in your roadmap to sync.' });
        return;
      }

      // Parse target duration
      const goalText = roadmap.goal.toLowerCase();
      let days = 30;
      const dayMatch = goalText.match(/(\d+)\s*day/);
      const weekMatch = goalText.match(/(\d+)\s*week/);
      const monthMatch = goalText.match(/(\d+)\s*month/);
      if (dayMatch) days = parseInt(dayMatch[1], 10);
      else if (weekMatch) days = parseInt(weekMatch[1], 10) * 7;
      else if (monthMatch) days = parseInt(monthMatch[1], 10) * 30;

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const tasksPerDay = allTasks.length / days;

      let successCount = 0;

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];

        const dayStart = Math.floor(i * tasksPerDay);
        const dayEnd = (i === days - 1) ? allTasks.length : Math.floor((i + 1) * tasksPerDay);
        const dayTasks = allTasks.slice(dayStart, dayEnd);

        for (const task of dayTasks) {
          const event = {
            summary: `📚 ${task.subTopic.title}`,
            description: `🎯 Goal: ${roadmap.goal}\n📂 Phase: ${task.nodeTitle}\n📝 ${task.subTopic.description}\n⏱️ Estimated: ${task.subTopic.estimatedHours} hours\n\n— Synced via Ascent AI`,
            start: { date: dateKey },
            end: { date: new Date(date.getTime() + 86400000).toISOString().split('T')[0] },
            reminders: { useDefault: true }
          };

          const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          });

          if (response.ok) {
            successCount++;
          } else {
            console.error("Failed to create event for:", task.subTopic.title, await response.text());
          }
        }
      }

      setSyncToast({ type: 'success', message: `Added ${successCount} learning tasks to your Google Calendar!` });
      setTimeout(() => setSyncToast(null), 6000);
    } catch (error: any) {
      console.error("Calendar Sync Error:", error);
      setSyncToast({ type: 'error', message: error.message || 'Calendar sync failed.' });
      setTimeout(() => setSyncToast(null), 6000);
    } finally {
      setIsSyncing(false);
    }
  };

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

  // Extract target duration from the roadmap goal (e.g., "learn Python in 30 days" -> 30)
  const targetDays = useMemo(() => {
    const goalText = roadmap.goal.toLowerCase();
    
    // Check for days
    const dayMatch = goalText.match(/(\d+)\s*day/);
    if (dayMatch) return parseInt(dayMatch[1], 10);
    
    // Check for weeks
    const weekMatch = goalText.match(/(\d+)\s*week/);
    if (weekMatch) return parseInt(weekMatch[1], 10) * 7;
    
    // Check for months
    const monthMatch = goalText.match(/(\d+)\s*month/);
    if (monthMatch) return parseInt(monthMatch[1], 10) * 30;
    
    return 30; // default to 30 days
  }, [roadmap.goal]);

  // Distribute tasks across target days evenly (mock schedule for specific dates)
  const scheduledTasks = useMemo(() => {
    const schedule: Record<string, typeof pendingSubTopics> = {};
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const totalTasks = pendingSubTopics.length;
    if (totalTasks === 0) return schedule;
    
    const tasksPerDay = totalTasks / targetDays;
    
    for (let i = 0; i < targetDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayStart = Math.floor(i * tasksPerDay);
      const dayEnd = Math.floor((i + 1) * tasksPerDay);
      const actualEnd = (i === targetDays - 1) ? totalTasks : dayEnd;
      
      const dayTasks = pendingSubTopics.slice(dayStart, actualEnd);
      if (dayTasks.length > 0) {
        schedule[dateKey] = dayTasks;
      }
    }
    return schedule;
  }, [pendingSubTopics, targetDays]);

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

      {/* Sync Toast Notification */}
      <AnimatePresence>
        {syncToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-8 right-8 z-[9999] max-w-md"
          >
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${
              syncToast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {syncToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span className="text-sm font-medium">{syncToast.message}</span>
              <button onClick={() => setSyncToast(null)} className="ml-2 text-white/40 hover:text-white/80 transition-colors text-lg leading-none">×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header Slab */}
      <section className="py-20 border-b border-border-primary flex flex-col lg:flex-row items-end justify-between gap-12 relative">
        <div className="space-y-6 relative pr-24">
          <img src="/mascot_reading.png" alt="Mascot Reading" className="absolute right-0 bottom-0 w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(124,111,250,0.35)] pointer-events-none" />
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[11px] font-black uppercase tracking-[0.5em] text-accent-glow"
          >
            Tactical Deployment Protocol
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-langdon-display text-text-primary -ml-2"
          >
            Chronos <br />
            <span className="text-text-muted/20 font-light text-6xl md:text-8xl">Architecture</span>
          </motion.h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            disabled={isSyncing}
            onClick={handleSyncGoogleCalendar}
            className="group flex items-center justify-center gap-3 px-6 h-[68px] rounded-2xl bg-accent-glow/10 border border-accent-glow/30 hover:bg-accent-glow/20 disabled:bg-accent-glow/5 disabled:border-accent-glow/10 disabled:opacity-50 text-[10px] font-black uppercase tracking-[0.2em] text-accent-glow transition-all duration-300 shadow-[0_0_20px_rgba(124,111,250,0.1)] cursor-pointer"
          >
            {isSyncing ? (
              <Loader2 className="w-4 h-4 text-accent-glow animate-spin" />
            ) : (
              <CalendarIcon className="w-4 h-4 text-accent-glow group-hover:scale-110 transition-transform" />
            )}
            {isSyncing ? 'Syncing...' : 'Sync to Google Calendar'}
          </button>

          <div className="flex items-center gap-4 bg-bg-secondary/80 backdrop-blur-3xl p-2 rounded-2xl border border-border-pill">
             <button onClick={handlePrevMonth} className="p-4 hover:bg-bg-secondary rounded-xl text-text-muted hover:text-text-primary transition-all">
                <ChevronLeft className="w-6 h-6" />
             </button>
             <span className="text-xl font-langdon text-text-primary px-8 min-w-[200px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
             </span>
             <button onClick={handleNextMonth} className="p-4 hover:bg-bg-secondary rounded-xl text-text-muted hover:text-text-primary transition-all">
                <ChevronRight className="w-6 h-6" />
             </button>
          </div>
        </div>
      </section>

      {/* Calendar Grid Slab */}
      <section className="py-12">
        <div className="grid grid-cols-7 border border-border-primary rounded-3xl overflow-hidden shadow-3xl bg-bg-secondary/20 backdrop-blur-3xl">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-6 text-center border-b border-r border-border-primary bg-bg-secondary/40">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted/40">{day}</span>
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
                  <span className={`text-2xl font-langdon ${isToday ? 'text-accent-glow scale-110' : 'text-text-muted/40'}`}>
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
               <div className="space-y-12">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-[11px] font-black text-accent-glow uppercase tracking-[0.4em] mb-4">Daily Manifest</h3>
                        <h2 className="text-5xl font-langdon-display text-text-primary">
                           {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>
                     </div>
                     <button onClick={() => setSelectedDay(null)} className="p-4 bg-bg-secondary/40 rounded-2xl hover:bg-bg-secondary transition-all text-text-muted">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="space-y-8 max-h-[400px] overflow-y-auto pr-6 scrollbar-hide">
                     {(scheduledTasks[selectedDay.toISOString().split('T')[0]] || []).map((t, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-bg-secondary/40 border border-border-primary space-y-6 group/item hover:border-accent-glow/30 transition-all">
                           <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest">{t.nodeTitle}</p>
                                 <h4 className="text-3xl font-langdon text-text-primary group-hover/item:text-accent-glow transition-colors">{t.subTopic.title}</h4>
                              </div>
                              <div className="px-4 py-2 rounded-xl bg-accent-glow/10 border border-accent-glow/20 text-xs font-black text-accent-glow uppercase tracking-tighter">
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
                  </div>

                  <div className="pt-8 border-t border-border-primary flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <Clock className="w-5 h-5 text-accent-glow opacity-40" />
                        <span className="text-sm font-bold text-text-muted underline decoration-accent-glow/20 underline-offset-8 italic">Synchronize temporal delta</span>
                     </div>
                     <button className="flex items-center gap-3 px-8 py-4 bg-accent-glow text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-2xl active:scale-95 transition-all">
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

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

