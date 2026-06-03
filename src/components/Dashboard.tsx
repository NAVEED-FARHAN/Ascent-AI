import React, { useState, useEffect } from 'react';
import { Roadmap, UserProgress, RoadmapRecord } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { ShieldCheck, Sparkles, Terminal, Activity, History, Target, Cpu, Book, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { getUserRoadmaps } from '../lib/firestore';

const TOPIC_ICON_MAP: Record<string, string> = {
  python: 'python/python-original',
  javascript: 'javascript/javascript-original',
  typescript: 'typescript/typescript-original',
  react: 'react/react-original',
  nextjs: 'nextjs/nextjs-original',
  'next.js': 'nextjs/nextjs-original',
  nodejs: 'nodejs/nodejs-original',
  'node.js': 'nodejs/nodejs-original',
  node: 'nodejs/nodejs-original',
  vue: 'vuejs/vuejs-original',
  angular: 'angularjs/angularjs-original',
  java: 'java/java-original',
  kotlin: 'kotlin/kotlin-original',
  swift: 'swift/swift-original',
  flutter: 'flutter/flutter-original',
  dart: 'dart/dart-original',
  rust: 'rust/rust-plain',
  go: 'go/go-original',
  golang: 'go/go-original',
  c: 'c/c-original',
  'c++': 'cplusplus/cplusplus-original',
  cpp: 'cplusplus/cplusplus-original',
  'c#': 'csharp/csharp-original',
  csharp: 'csharp/csharp-original',
  php: 'php/php-original',
  ruby: 'ruby/ruby-original',
  rails: 'rails/rails-original-wordmark',
  docker: 'docker/docker-original',
  kubernetes: 'kubernetes/kubernetes-plain',
  aws: 'amazonwebservices/amazonwebservices-original',
  firebase: 'firebase/firebase-plain',
  mongodb: 'mongodb/mongodb-original',
  postgresql: 'postgresql/postgresql-original',
  postgres: 'postgresql/postgresql-original',
  mysql: 'mysql/mysql-original',
  graphql: 'graphql/graphql-plain',
  tailwind: 'tailwindcss/tailwindcss-plain',
  css: 'css3/css3-original',
  html: 'html5/html5-original',
  figma: 'figma/figma-original',
  tensorflow: 'tensorflow/tensorflow-original',
  pytorch: 'pytorch/pytorch-original',
  linux: 'linux/linux-original',
  git: 'git/git-original',
  django: 'django/django-plain',
  fastapi: 'fastapi/fastapi-original',
  flask: 'flask/flask-original',
  spring: 'spring/spring-original',
  android: 'android/android-original',
  unity: 'unity/unity-original',
  blender: 'blender/blender-original',
};

const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';

function getTopicIcon(goal: string): string | null {
  const lower = goal.toLowerCase();
  const keywords = Object.keys(TOPIC_ICON_MAP).sort((a, b) => b.length - a.length);
  for (const keyword of keywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(lower)) {
      return `${DEVICON_BASE}/${TOPIC_ICON_MAP[keyword]}.svg`;
    }
  }
  return null;
}

function CompletionRing({ pct, size = 44, strokeWidth = 0.07 }: { pct: number, size?: number, strokeWidth?: number }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct === 100 ? '#4ade80' : 'rgba(124,111,250,0.9)'}
        strokeWidth={size * strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  );
}

interface DashboardProps {
  user: FirebaseUser | null;
  roadmap: Roadmap | null;
  progress: UserProgress | null;
}

export default function Dashboard({ user, roadmap, progress }: DashboardProps) {
  const [archivedRoadmaps, setArchivedRoadmaps] = useState<RoadmapRecord[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchRoadmaps = async () => {
      try {
        const roadmaps = await getUserRoadmaps(user.uid) as RoadmapRecord[];
        setArchivedRoadmaps(roadmaps.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      } catch (err) {
        console.error('Error fetching roadmap history', err);
      }
    };
    fetchRoadmaps();
  }, [user]);

  // Active Roadmap Metrics
  let totalSubTopics = 0;
  let completedSubTopics = 0;
  let progressPercent = 0;
  let hoursSpent = 0;
  let totalQuizzes = 0;
  let totalChallenges = 0;

  if (roadmap && progress) {
    totalSubTopics = roadmap.nodes.reduce((acc, n) => acc + n.subTopics.length, 0);
    completedSubTopics = progress.completedSubTopicIds.length;
    progressPercent = Math.round((completedSubTopics / (totalSubTopics || 1)) * 100);

    roadmap.nodes.forEach(node => {
      node.subTopics.forEach(sub => {
        if (progress.completedSubTopicIds.includes(sub.id)) {
          hoursSpent += sub.estimatedHours || 2;
        }
        if (sub.quizzes) totalQuizzes += sub.quizzes.length;
        if (sub.challenges) totalChallenges += sub.challenges.length;
      });
    });
  }

  // Heatmap Data (90 days)
  const today = new Date();
  const heatmapDays = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (89 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      date: dateStr,
      count: progress?.dailyActivity?.[dateStr] || 0
    };
  });
  
  const activeDaysCount = heatmapDays.filter(d => d.count > 0).length;
  // Calculate Level (just a simple mapping from completed topics)
  const userLevel = Math.floor((progress?.completedSubTopicIds.length || 0) / 10) + 1;

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 pt-16 pb-40 space-y-0 relative">
      <div className="absolute top-0 left-0 w-full h-[800px] bg-accent-glow/[0.012] blur-[150px] -z-10" />

      {/* GitHub-Style Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
        
        {/* =========================================
            LEFT SIDEBAR: PILOT IDENTITY
            ========================================= */}
        <aside className="space-y-8">
          {user ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group">
                <div className="absolute inset-0 bg-accent-glow/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay" />
                <img 
                  src={user.photoURL?.replace(/=s\d+(?:-c)?/i, "=s400-c") || ''} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== user.photoURL) {
                      target.src = user.photoURL || '';
                    } else {
                      target.style.display = 'none';
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-black text-text-primary uppercase tracking-wider">{user.displayName}</h1>
                <p className="text-sm font-mono text-accent-glow/70 mt-1">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <p className="text-xs font-black uppercase tracking-widest text-text-muted/40">No Identity</p>
            </div>
          )}

          <div className="py-5 border-y border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-glow/10 flex items-center justify-center border border-accent-glow/20">
                <Zap className="w-4 h-4 text-accent-glow" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/50 mb-0.5">Pilot Level</p>
                <p className="text-sm font-bold text-white tracking-widest">LVL {userLevel < 10 ? `0${userLevel}` : userLevel}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <Activity className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/50 mb-0.5">Neural Streak</p>
                <p className="text-sm font-bold text-white tracking-widest">{progress?.currentStreak || 0} DAYS</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-text-muted/60 mb-4">Laboratory Metrics</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-accent-success" /> Verification</span>
                <span className="font-mono text-white font-bold">{progress?.practiceScore || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted flex items-center gap-2"><Terminal className="w-4 h-4 text-text-muted/70" /> Challenges</span>
                <span className="font-mono text-white">{progress?.completedChallengeIds?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent-glow/70" /> Quizzes</span>
                <span className="font-mono text-white">{Math.floor(((progress?.completedSubTopicIds?.length || 0) / (totalSubTopics || 1)) * totalQuizzes)}</span>
              </div>
            </div>
          </div>
        </aside>


        {/* =========================================
            RIGHT MAIN CONTENT: HEATMAP & HISTORY
            ========================================= */}
        <main className="space-y-12">
          
          {/* Active Blueprint (Sticky at the top like a pinned repo) */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-primary mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-accent-glow" /> Active Blueprint
            </h2>
            {roadmap && progress ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-accent-glow/30 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-serif italic text-white line-clamp-1">{roadmap.goal}</h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-text-muted/70">
                    <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> {completedSubTopics}/{totalSubTopics} Nodes</span>
                    <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> {hoursSpent}h Logged</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/50">Mastery</p>
                    <p className="text-lg font-bold text-white">{progressPercent}%</p>
                  </div>
                  <CompletionRing pct={progressPercent} size={50} strokeWidth={0.08} />
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] text-center">
                <p className="text-xs font-mono text-text-muted/40">No active mission to display.</p>
              </div>
            )}
          </section>

          {/* Neural Sync Heatmap (GitHub Style) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-glow" /> Neural Sync Log
              </h2>
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em]">{activeDaysCount} Active Cycles</span>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/[0.015] border border-white/[0.04] overflow-x-auto scrollbar-hide">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-[3px] w-full">
                  {heatmapDays.map((day, idx) => (
                    <div 
                      key={idx}
                      className={`w-[14px] h-[14px] rounded-[3px] transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer ${
                        day.count === 0 ? 'bg-white/[0.03] hover:bg-white/10' : 
                        day.count < 3 ? 'bg-accent-glow/40 hover:bg-accent-glow/60' : 
                        'bg-accent-glow shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                      }`}
                      title={`${day.date}: ${day.count} activities`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 text-[10px] font-mono text-text-muted">
                  <span>Less</span>
                  <div className="w-[12px] h-[12px] rounded-[2px] bg-white/[0.03]" />
                  <div className="w-[12px] h-[12px] rounded-[2px] bg-accent-glow/40" />
                  <div className="w-[12px] h-[12px] rounded-[2px] bg-accent-glow shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </section>

          {/* Ascent History (List View) */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-text-primary mb-4 flex items-center gap-2">
              <Book className="w-4 h-4 text-accent-glow" /> Ascent History
            </h2>

            {archivedRoadmaps.length > 0 ? (
              <div className="space-y-3">
                {archivedRoadmaps.map((record) => {
                  const pct = record.completion || 0;
                  const iconUrl = getTopicIcon(record.goal);
                  const initials = record.goal.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                  const dateLabel = (() => {
                    if (!record.createdAt) return '';
                    const d = (record.createdAt as any).toDate ? (record.createdAt as any).toDate() : new Date(record.createdAt as any);
                    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  })();

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/10 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        {iconUrl ? (
                          <img src={iconUrl} alt="" className="w-10 h-10 object-contain drop-shadow-lg filter saturate-150 opacity-80 group-hover:opacity-100 transition-opacity" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                            style={{ background: `linear-gradient(135deg, hsl(${(pct * 123) % 360}, 60%, 45%), hsl(${(pct * 321) % 360}, 50%, 30%))` }}
                          >
                            {initials}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white truncate group-hover:text-accent-glow transition-colors">{record.goal}</h3>
                          <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-text-muted/60">
                            {dateLabel && <span>{dateLabel}</span>}
                            {dateLabel && <span className="w-1 h-1 rounded-full bg-white/10" />}
                            <span>{record.nodes?.length || 0} Modules</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 sm:w-48 shrink-0">
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] font-mono mb-1.5">
                            <span className="text-text-muted">Mastery</span>
                            <span className={pct === 100 ? 'text-accent-success' : 'text-accent-glow'}>{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: pct === 100 ? '#4ade80' : 'rgba(124,111,250,0.9)' }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 rounded-2xl bg-white/[0.015] border border-white/[0.04] text-center border-dashed">
                <p className="text-xs font-mono text-text-muted/50">No past blueprints recorded.</p>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
