import React, { useState, useEffect, useRef } from 'react';
import { Roadmap, UserProgress, RoadmapRecord } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { CheckCircle2, Zap, Activity, ShieldCheck, Sparkles, Terminal, Cpu, History, Trash2, ChevronLeft, ChevronRight, User as UserIcon, FlaskConical, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

function CompletionRing({ pct, size = 44 }: { pct: number, size?: number }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.07} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct === 100 ? '#4ade80' : 'rgba(124,111,250,0.9)'}
        strokeWidth={size * 0.07}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x={size/2} y={size/2 + (size * 0.1)} textAnchor="middle" fill="white" fontSize={size * 0.22} fontWeight="800" fontFamily="monospace">
        {pct}%
      </text>
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchRoadmaps = async () => {
      try {
        const roadmaps = await getUserRoadmaps(user.uid) as RoadmapRecord[];
        // exclude active if needed, but showing all history is fine
        setArchivedRoadmaps(roadmaps.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      } catch (err) {
        console.error('Error fetching roadmap history', err);
      }
    };
    fetchRoadmaps();
  }, [user]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  return (
    <div className="max-w-[1400px] w-full mx-auto px-8 md:px-12 pt-16 pb-40 space-y-0 relative divide-y divide-white/[0.06]">
      <div className="absolute top-0 left-0 w-full h-[800px] bg-accent-glow/[0.012] blur-[150px] -z-10" />

      {/* Header */}
      <header className="pb-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accent-glow animate-ping" />
            <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.35em] text-accent-glow/90">
              Pilot Profile
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif italic text-text-primary tracking-tight">
            Ascent <span className="text-text-muted font-light font-serif opacity-70">Identity</span>
          </h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-6 bg-white/[0.02] border border-white/[0.05] px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-full border-2 border-accent-glow/30 overflow-hidden shrink-0">
              <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black text-text-muted/50 uppercase tracking-[0.2em] mb-0.5">Pilot ID</p>
              <h3 className="text-sm md:text-base font-black text-text-primary uppercase tracking-widest leading-none">
                {user.displayName}
              </h3>
            </div>
          </div>
        )}
      </header>

      {/* Active Blueprint Stats */}
      <section className="py-16">
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.04] mb-8">
          <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-text-primary opacity-80 flex items-center gap-3">
            <Target className="w-5 h-5 text-accent-glow" />
            Active Blueprint
          </h3>
        </div>

        {roadmap && progress ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl flex items-center gap-6 shadow-2xl">
              <CompletionRing pct={progressPercent} size={80} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/50 mb-1">Current Mastery</p>
                <p className="text-sm font-semibold text-text-primary leading-tight line-clamp-2">{roadmap.goal}</p>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl flex flex-col justify-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted/50 mb-2 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-accent-glow" /> Neural Streak
              </p>
              <p className="text-4xl font-serif italic text-accent-glow">{progress.currentStreak} <span className="text-xs font-sans not-italic text-text-muted uppercase tracking-widest">Days</span></p>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl flex flex-col justify-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted/50 mb-2 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-text-primary" /> Nodes Mastered
              </p>
              <p className="text-4xl font-serif italic text-text-primary">{completedSubTopics} <span className="text-xs font-sans not-italic text-text-muted uppercase tracking-widest">/ {totalSubTopics}</span></p>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl flex flex-col justify-center">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted/50 mb-2 flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-text-primary" /> Time Logged
              </p>
              <p className="text-4xl font-serif italic text-text-primary">{hoursSpent} <span className="text-xs font-sans not-italic text-text-muted uppercase tracking-widest">Hrs</span></p>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.01] border border-white/[0.03] p-10 rounded-3xl flex flex-col items-center justify-center text-center text-text-muted/50">
            <Target className="w-10 h-10 mb-4 opacity-20" />
            <p className="text-sm font-black uppercase tracking-widest">No Active Mission</p>
            <p className="text-xs mt-2 max-w-md">Initialize a new Mastery Journey to begin logging telemetry.</p>
          </div>
        )}
      </section>

      {/* Practice & Engagement */}
      {roadmap && progress && (
        <section className="py-16">
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.04] mb-8">
            <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-text-primary opacity-80 flex items-center gap-3">
              <FlaskConical className="w-5 h-5 text-accent-glow" />
              Laboratory Metrics
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-accent-glow/[0.02] border border-accent-glow/20 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-8 h-8 text-accent-glow mb-3" />
              <p className="text-5xl font-serif italic text-white mb-2">{progress.practiceScore || 0}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/70">Verification Score</p>
            </div>
            
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center text-center">
              <Terminal className="w-8 h-8 text-text-muted/40 mb-3" />
              <p className="text-5xl font-serif italic text-white mb-2">
                {progress.completedChallengeIds?.length || 0}
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/70">Challenges Cleared</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center text-center">
              <Sparkles className="w-8 h-8 text-text-muted/40 mb-3" />
              <p className="text-5xl font-serif italic text-white mb-2">
                {/* We don't explicitly track completedQuizzes yet, but we can assume it scales with nodes for now or just display 0 if not tracked */}
                {Math.floor((progress.completedSubTopicIds.length / (totalSubTopics || 1)) * totalQuizzes)}
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/70">Quizzes Passed</p>
            </div>
          </div>
        </section>
      )}

      {/* Blueprint History */}
      <section className="py-16">
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.04] mb-8">
          <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-text-primary opacity-80 flex items-center gap-3">
            <History className="w-5 h-5 text-accent-glow" />
            Ascent History
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">
            {archivedRoadmaps.length} Blueprints
          </span>
        </div>

        {archivedRoadmaps.length > 0 ? (
          <div className="relative group/scroll w-full">
            <button 
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/80 border border-white/10 text-white opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-black hover:scale-110 shadow-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/80 border border-white/10 text-white opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-black hover:scale-110 shadow-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="relative w-full overflow-hidden" 
              style={{ 
                maskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)', 
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)' 
              }}
            >
              <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-6 pt-1 px-6 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {archivedRoadmaps.map((record, i) => {
                  const pct = record.completion || 0;
                  const iconUrl = getTopicIcon(record.goal);
                  const initials = record.goal.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                  const dateLabel = (() => {
                    if (!record.createdAt) return '';
                    const d = (record.createdAt as any).toDate ? (record.createdAt as any).toDate() : new Date(record.createdAt as any);
                    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
                  })();

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                      className="group relative flex-shrink-0 w-[200px] rounded-3xl border border-white/[0.07] overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div className="relative h-[110px] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.015)' }}>
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={record.goal}
                            className="w-16 h-16 object-contain drop-shadow-xl filter saturate-150 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                            style={{
                              background: `hsl(${(i * 67 + 220) % 360}, 60%, 45%)`,
                              boxShadow: `0 4px 20px hsl(${(i * 67 + 220) % 360}, 60%, 45%, 0.4)`
                            }}
                          >
                            {initials}
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <p className="text-[13px] font-semibold text-text-primary leading-snug line-clamp-2 mb-4 h-10">
                          {record.goal}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-3">
                            {dateLabel && <p className="text-[9px] text-text-muted/40 font-mono mb-2">{dateLabel}</p>}
                            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: 0.5 + i * 0.06, duration: 1, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ background: pct === 100 ? '#4ade80' : 'rgba(124,111,250,0.9)' }}
                              />
                            </div>
                          </div>
                          <span className="text-[10px] font-black font-mono text-white mt-4">{pct}%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div className="w-12 flex-shrink-0" />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.01] border border-white/[0.03] p-10 rounded-3xl flex items-center justify-center text-center text-text-muted/30">
            <p className="text-xs font-black uppercase tracking-widest">No Past Blueprints</p>
          </div>
        )}
      </section>
    </div>
  );
}
