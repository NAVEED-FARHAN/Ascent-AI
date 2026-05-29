
import React, { useState, useRef } from 'react';
import { Roadmap, UserProgress, RoadmapNode } from '../types';
import {
  CheckCircle2,
  Lock,
  Zap,
  Trophy,
  ArrowRight,
  Activity,
  Eye,
  X,
  Clock,
  BookOpen,
  CheckSquare,
  Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Full Blueprint Preview Modal ──────────────────────────────────────────────
function RoadmapPreviewModal({
  roadmap,
  progress,
  onClose
}: {
  roadmap: Roadmap;
  progress: UserProgress;
  onClose: () => void;
}) {
  const isNodeCompleted = (node: RoadmapNode) =>
    node.subTopics.length > 0 && node.subTopics.every(st => progress.completedSubTopicIds.includes(st.id));

  const totalHours = roadmap.nodes.reduce((acc, n) =>
    acc + n.subTopics.reduce((a, st) => a + (st.estimatedHours || 0), 0), 0);

  const completedSubTopics = progress.completedSubTopicIds.length;
  const totalSubTopics = roadmap.nodes.reduce((acc, n) => acc + n.subTopics.length, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto py-8 px-4"
        style={{ background: 'rgba(4, 4, 13, 0.92)', backdropFilter: 'blur(20px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-4xl rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(12,12,24,0.98) 0%, rgba(8,8,18,0.98) 100%)',
            border: '1px solid rgba(124,111,250,0.15)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.8), 0 0 80px rgba(124,111,250,0.06)'
          }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-white/[0.06]"
            style={{ background: 'rgba(8,8,18,0.97)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-glow/10 border border-accent-glow/20 flex items-center justify-center">
                <Map className="w-5 h-5 text-accent-glow" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-glow/60 mb-0.5">Full Blueprint</p>
                <h2 className="text-lg font-serif italic text-text-primary leading-tight">{roadmap.goal}</h2>
              </div>
            </div>

            {/* Summary chips */}
            <div className="hidden sm:flex items-center gap-3 mr-4">
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-text-muted/60">Phases</p>
                <p className="text-sm font-serif italic text-text-primary">{roadmap.nodes.length}</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-text-muted/60">Modules</p>
                <p className="text-sm font-serif italic text-text-primary">{completedSubTopics}/{totalSubTopics}</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-text-muted/60">Est. Hours</p>
                <p className="text-sm font-serif italic text-text-primary">{totalHours}h</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nodes list */}
          <div className="divide-y divide-white/[0.06]">
            {roadmap.nodes.map((node, idx) => {
              const nodeCompleted = isNodeCompleted(node);
              const nodeHours = node.subTopics.reduce((a, st) => a + (st.estimatedHours || 0), 0);
              const completedInNode = node.subTopics.filter(st => progress.completedSubTopicIds.includes(st.id)).length;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="px-6 md:px-8 py-6"
                >
                  {/* Phase header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-black border transition-all ${
                      nodeCompleted
                        ? 'bg-accent-glow/20 border-accent-glow text-accent-glow shadow-[0_0_16px_rgba(124,111,250,0.3)]'
                        : 'bg-white/[0.04] border-white/[0.08] text-text-muted'
                    }`}>
                      {nodeCompleted ? <CheckSquare className="w-4 h-4" /> : <span>{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[8px] font-black uppercase tracking-[0.25em] ${nodeCompleted ? 'text-accent-glow' : 'text-text-muted/50'}`}>
                          Phase {idx + 1} · {nodeCompleted ? 'Completed' : `${completedInNode}/${node.subTopics.length} done`}
                        </span>
                      </div>
                      <h3 className="text-base font-serif italic text-text-primary truncate">{node.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 text-text-muted/60">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black">{nodeHours}h</span>
                    </div>
                  </div>

                  {/* Subtopics */}
                  <div className="divide-y divide-white/[0.04]">
                    {node.subTopics.map((st) => {
                      const stDone = progress.completedSubTopicIds.includes(st.id);
                      return (
                        <div key={st.id} className="flex items-start gap-3 px-6 py-3">
                          <div className={`w-4 h-4 mt-0.5 flex-shrink-0 rounded-md border flex items-center justify-center transition-all ${
                            stDone
                              ? 'bg-accent-glow border-accent-glow'
                              : 'border-white/[0.12] bg-white/[0.02]'
                          }`}>
                            {stDone && <CheckSquare className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-snug ${stDone ? 'text-text-muted/60 line-through' : 'text-text-secondary'}`}>
                              {st.title}
                            </p>
                            {st.description && (
                              <p className="text-[11px] text-text-muted/40 mt-0.5 leading-relaxed line-clamp-2">{st.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                            <BookOpen className="w-3 h-3 text-text-muted/30" />
                            <span className="text-[10px] text-text-muted/40 font-mono">{st.estimatedHours || 0}h</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-white/[0.06] flex items-center justify-between"
            style={{ background: 'rgba(8,8,18,0.9)' }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40">
              Complete each phase sequentially to unlock the next
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-accent-glow/10 border border-accent-glow/20 text-accent-glow text-[10px] font-black uppercase tracking-widest hover:bg-accent-glow/20 transition-all"
            >
              Close Blueprint
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main RoadmapView ──────────────────────────────────────────────────────────
interface RoadmapViewProps {
  roadmap: Roadmap;
  progress: UserProgress;
  onToggleSubTopic: (nodeId: string, subTopicId: string) => void;
  onNavigateToPractice: () => void;
  searchQuery?: string;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

export default function RoadmapView({
  roadmap,
  progress,
  onNavigateToPractice,
  searchQuery = '',
  setSelectedNodeId
}: RoadmapViewProps) {

  const [showPreview, setShowPreview] = useState(false);
  const [hoveredLockedId, setHoveredLockedId] = useState<string | null>(null);
  const hoverEnterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterLocked = (id: string) => {
    if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
    if (hoveredLockedId === id) return;
    if (hoverEnterTimerRef.current) clearTimeout(hoverEnterTimerRef.current);
    hoverEnterTimerRef.current = setTimeout(() => {
      setHoveredLockedId(id);
    }, 1000);
  };

  const handleMouseLeaveLocked = () => {
    if (hoverEnterTimerRef.current) clearTimeout(hoverEnterTimerRef.current);
    if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
    hoverLeaveTimerRef.current = setTimeout(() => {
      setHoveredLockedId(null);
    }, 3000);
  };

  const handleClickLocked = (id: string) => {
    if (hoverEnterTimerRef.current) clearTimeout(hoverEnterTimerRef.current);
    if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current);
    setHoveredLockedId(id);
  };

  const filteredNodes = roadmap.nodes.filter(node =>
    node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.subTopics.some(st =>
      st.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const isNodeCompleted = (node: RoadmapNode) => {
    return node.subTopics.length > 0 && node.subTopics.every(st => progress.completedSubTopicIds.includes(st.id));
  };

  const isNodeUnlocked = (node: RoadmapNode) => {
    const index = roadmap.nodes.findIndex(n => n.id === node.id);
    if (index === 0) return true;

    const hasExplicitDeps = (node.dependencies || []).length > 0;
    const explicitDepsDone = (node.dependencies || []).every(depId => {
      const depNode = roadmap.nodes.find(n => n.id === depId);
      return depNode ? isNodeCompleted(depNode) : true;
    });

    const prevNodeDone = isNodeCompleted(roadmap.nodes[index - 1]);

    if (hasExplicitDeps) return explicitDepsDone && prevNodeDone;
    return prevNodeDone;
  };

  const calculateProgress = () => {
    const allSubtopicIds = roadmap.nodes.flatMap(n => n.subTopics.map(st => st.id));
    const total = allSubtopicIds.length;
    const completed = progress.completedSubTopicIds.filter(id => allSubtopicIds.includes(id)).length;
    return Math.round((completed / (total || 1)) * 100);
  };

  const getCompletedCount = () => {
    const allSubtopicIds = roadmap.nodes.flatMap(n => n.subTopics.map(st => st.id));
    return progress.completedSubTopicIds.filter(id => allSubtopicIds.includes(id)).length;
  };

  const getTotalSubtopics = () => roadmap.nodes.reduce((acc, n) => acc + n.subTopics.length, 0);

  return (
    <>
      {/* Blueprint Preview Modal */}
      {showPreview && (
        <RoadmapPreviewModal
          roadmap={roadmap}
          progress={progress}
          onClose={() => setShowPreview(false)}
        />
      )}

      <div className="max-w-[1240px] w-full mx-auto space-y-24 pb-48 pt-10 relative px-6 md:px-10">
        {/* Header Summary */}
        <section className="flex flex-col lg:flex-row justify-between items-center gap-16 relative">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-center lg:justify-start gap-3 mb-8"
            >
              <div className="px-4 py-1.5 rounded-full bg-accent-glow/10 border border-border-pill text-accent-glow text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                Operational Phase: {Math.ceil(calculateProgress() / 33) || 1}
              </div>
              {/* View Full Plan button in header */}
              <button
                onClick={() => setShowPreview(true)}
                className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-accent-glow/40 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-accent-glow transition-all duration-300"
              >
                <Eye className="w-3 h-3" />
                View Full Plan
              </button>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-8xl font-serif italic text-text-primary tracking-tighter mb-10 leading-[0.85]"
            >
              The {roadmap.goal.split(' ').slice(0, 2).join(' ')} <br />
              <span className="text-accent-glow relative">
                Ascent
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="absolute -bottom-2 left-0 h-1 bg-accent-glow/30"
                />
              </span>
            </motion.h1>

            <div className="flex flex-col sm:flex-row items-center gap-8 max-w-2xl mx-auto lg:mx-0">
              <div className="flex-1 w-full bg-bg-track h-2 rounded-full overflow-hidden relative border border-border-primary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-accent-glow shadow-[0_0_20px_rgba(99,102,241,0.6)]"
                />
              </div>
              <div className="flex items-baseline gap-2 flex-shrink-0">
                <span className="text-4xl font-serif italic text-text-primary">{calculateProgress()}</span>
                <span className="text-sm font-black text-text-muted uppercase tracking-widest">% Mastery</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <div className="absolute inset-0 bg-accent-glow/5 blur-[80px] -z-10" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-xl p-8 flex flex-col justify-between h-48 group hover:border-accent-glow/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-glow/10 flex items-center justify-center text-accent-glow group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">Decrypted Modules</p>
                <p className="text-4xl font-serif italic text-text-primary leading-none">{getCompletedCount()}<span className="text-lg text-text-muted/20 mx-2">/</span>{getTotalSubtopics()}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-accent-glow rounded-xl p-8 flex flex-col justify-between h-48 shadow-2xl shadow-accent-glow/30 group hover:translate-y-[-5px] transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-bg-secondary/20 border border-border-pill/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Synthesizer Load</p>
                <p className="text-3xl font-serif italic text-white truncate">Advanced</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Roadmap Timeline */}
        <section className="relative pt-10 px-4 md:px-0">
          <div className="absolute left-[34px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-border-primary -translate-x-1/2 z-0" />

          <div className="flex flex-col gap-0 relative z-10">
            {filteredNodes.map((node, index) => {
              const unlocked = isNodeUnlocked(node);
              const completed = isNodeCompleted(node);
              const isEven = index % 2 === 0;
              const isHovered = hoveredLockedId === node.id;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className={`relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-start h-[480px] w-full pt-0`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`absolute left-[34px] lg:left-1/2 -translate-x-1/2 top-0 w-20 h-20 rounded-xl border-2 flex items-center justify-center transition-all duration-700 z-20 ${completed
                        ? 'bg-accent-glow/20 border-accent-glow text-accent-glow shadow-[0_0_40px_rgba(99,102,241,0.4)]'
                        : unlocked
                          ? 'bg-bg-primary border-accent-glow text-accent-glow shadow-[0_0_40px_rgba(99,102,241,0.2)]'
                          : 'bg-bg-secondary border-border-primary text-text-muted/20'
                      }`}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-current opacity-5" />
                    {completed ? <CheckSquare className="w-10 h-10" /> : (
                      <span className="text-2xl font-black">{index + 1}</span>
                    )}
                  </motion.div>

                  <div className={`w-full lg:w-[calc(50%-100px)] ${isEven ? 'lg:text-right' : 'lg:text-left'} pl-24 lg:pl-0`}>
                    {unlocked ? (
                      // ── UNLOCKED: clickable as before ──
                      <motion.button
                        onClick={() => setSelectedNodeId(node.id)}
                        whileHover={{ x: isEven ? -10 : 10 }}
                        className={`w-full group text-left ${isEven ? 'lg:text-right' : 'lg:text-left'} transition-all outline-none`}
                      >
                        <div className={`inline-flex items-center gap-3 mb-6 text-[10px] font-black uppercase tracking-[0.3em] ${completed ? 'text-accent-glow' : 'text-accent-glow'}`}>
                          <Zap className="w-3 h-3 fill-current" />
                          {completed ? 'Protocol Decoded' : 'Active Stream'}
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif italic mb-6 transition-all duration-500 text-text-primary group-hover:text-accent-glow">
                          {node.title}
                        </h3>
                        <ul className={`space-y-3 max-w-sm ${isEven ? 'lg:ml-auto text-right' : 'text-left'}`}>
                          {node.subTopics.slice(0, 4).map((st) => {
                            const stDone = progress.completedSubTopicIds.includes(st.id);
                            return (
                              <li key={st.id} className={`flex items-start gap-3 text-sm ${isEven ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-4 h-4 mt-0.5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${stDone ? 'bg-accent-glow border-accent-glow text-white' : 'border-border-primary bg-bg-secondary'}`}>
                                  {stDone && <CheckSquare className="w-2.5 h-2.5" />}
                                </div>
                                <span className={stDone ? 'text-text-muted/50 line-through' : 'text-text-secondary'}>
                                  {st.title}
                                </span>
                              </li>
                            );
                          })}
                          {node.subTopics.length > 4 && (
                            <li className={`text-xs font-black uppercase tracking-widest text-text-muted/40 ${isEven ? 'mr-7' : 'ml-7'}`}>
                              + {node.subTopics.length - 4} more topics
                            </li>
                          )}
                        </ul>
                      </motion.button>
                    ) : (
                      // ── LOCKED: tooltip + View button ──
                      <div
                        className={`w-full text-left ${isEven ? 'lg:text-right' : 'lg:text-left'} cursor-pointer`}
                        onMouseEnter={() => handleMouseEnterLocked(node.id)}
                        onMouseLeave={handleMouseLeaveLocked}
                        onClick={() => handleClickLocked(node.id)}
                      >
                        <div className={`inline-flex items-center gap-3 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/50`}>
                          <Lock className="w-3 h-3" />
                          Encrypted Phase
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif italic mb-4 text-text-muted/20">
                          {node.title}
                        </h3>

                        {/* Lock message that appears on hover */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              transition={{ duration: 0.2 }}
                              className={`flex flex-col gap-3 ${isEven ? 'lg:items-end' : 'lg:items-start'} items-start`}
                            >
                              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border max-w-xs"
                                style={{
                                  background: 'rgba(12,12,24,0.95)',
                                  borderColor: 'rgba(255,255,255,0.08)',
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                                }}
                              >
                                <Lock className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-text-muted/70 leading-relaxed">
                                  Complete the previous phase to unlock this module.
                                </p>
                              </div>
                              <button
                                onClick={() => setShowPreview(true)}
                                className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] hover:border-accent-glow/40 hover:bg-accent-glow/[0.06] text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-accent-glow transition-all duration-200"
                              >
                                <Eye className="w-3 h-3" />
                                Preview Full Roadmap
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Fallback static description when not hovered */}
                        {!isHovered && (
                          <ul className={`space-y-3 max-w-sm ${isEven ? 'lg:ml-auto text-right' : 'text-left'} opacity-30 pointer-events-none`}>
                            {node.subTopics.slice(0, 4).map((st) => (
                              <li key={st.id} className={`flex items-start gap-3 text-sm ${isEven ? 'flex-row-reverse' : ''}`}>
                                <div className="w-4 h-4 mt-0.5 rounded-full border border-border-primary bg-bg-secondary flex-shrink-0" />
                                <span className="text-text-muted/80 blur-[2px] select-none">
                                  {st.title}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:block lg:w-[calc(50%-100px)]" />
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Insights Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-20 border-t border-border-primary">
          <div className="glass-panel rounded-2xl p-10 flex flex-col justify-between min-h-[300px] group overflow-hidden relative">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-6">Challenge Center</h4>
              <h3 className="text-3xl font-serif italic text-text-primary mb-4">The Logic Paradox</h3>
              <p className="text-text-secondary font-medium max-w-sm">Solve specialized challenges to earn exclusive Architect Badges and validate your progress.</p>
            </div>
            <button
              onClick={onNavigateToPractice}
              className="flex items-center gap-3 text-accent-glow font-black text-[10px] uppercase tracking-widest bg-bg-secondary w-fit px-6 py-3 rounded-lg border border-border-primary hover:border-accent-glow/30 transition-all"
            >
              Enter Laboratory
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-bg-secondary/40 border border-border-primary rounded-2xl p-10 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-glow mb-6">Tactical Validation</h4>
              <h3 className="text-3xl font-serif italic text-text-primary mb-4">Validate Your Knowledge</h3>
              <p className="text-text-secondary font-medium max-w-sm">Every completed module unlocks a new set of practice protocols. Don't just learn—master.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-accent-glow/20 border-2 border-border-primary flex items-center justify-center text-[10px] font-black">{i}</div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">New Challenges Queued</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

