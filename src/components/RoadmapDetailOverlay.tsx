import React, { useState } from 'react';
import { RoadmapNode, UserProgress, Resource } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CheckCircle2, Play, BookOpen, ArrowUpRight, Edit2, Plus, Trash2, Save } from 'lucide-react';

interface RoadmapDetailOverlayProps {
  node: RoadmapNode;
  progress: UserProgress;
  onClose: () => void;
  onToggleSubTopic: (nodeId: string, subTopicId: string) => void;
  onUpdateSubTopicResources?: (nodeId: string, subTopicId: string, newResources: Resource[]) => void;
}

export default function RoadmapDetailOverlay({
  node,
  progress,
  onClose,
  onToggleSubTopic,
  onUpdateSubTopicResources
}: RoadmapDetailOverlayProps) {
  
  const [editingSubTopicId, setEditingSubTopicId] = useState<string | null>(null);
  const [editingResources, setEditingResources] = useState<Resource[]>([]);

  const isNodeCompleted = (n: RoadmapNode) => {
    return n.subTopics.length > 0 && n.subTopics.every(st => progress.completedSubTopicIds.includes(st.id));
  };

  const optimizeLearningLink = (url: string, title: string, type?: string): string => {
    if (!url) return "#";
    if (url.includes("duckduckgo.com")) return url;

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

  const handleStartEdit = (subTopicId: string, resources: Resource[]) => {
    setEditingSubTopicId(subTopicId);
    setEditingResources([...resources]);
  };

  const handleCancelEdit = () => {
    setEditingSubTopicId(null);
    setEditingResources([]);
  };

  const handleSaveEdit = () => {
    if (onUpdateSubTopicResources && editingSubTopicId) {
      onUpdateSubTopicResources(node.id, editingSubTopicId, editingResources);
    }
    setEditingSubTopicId(null);
  };

  const handleAddResource = () => {
    setEditingResources([...editingResources, { title: '', url: '', type: 'video' }]);
  };

  const handleUpdateResource = (idx: number, field: keyof Resource, value: string) => {
    const newRes = [...editingResources];
    newRes[idx] = { ...newRes[idx], [field]: value } as Resource;
    setEditingResources(newRes);
  };

  const handleDeleteResource = (idx: number) => {
    const newRes = [...editingResources];
    newRes.splice(idx, 1);
    setEditingResources(newRes);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-bg-primary/80 backdrop-blur-md z-[1000]"
      />
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-bg-secondary/95 backdrop-blur-3xl border-l border-border-primary z-[1001] shadow-[-20px_0_100px_rgba(0,0,0,0.5)] p-16 overflow-y-auto scrollbar-hide"
      >
        <div className="space-y-16">
          <header className="space-y-10">
            <div className="flex justify-between items-center">
              <button 
                onClick={onClose} 
                className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-text-primary transition-all"
              >
                <div className="w-8 h-8 rounded-full border border-border-pill flex items-center justify-center group-hover:border-accent-glow/50 transition-colors">
                  <X className="w-4 h-4" />
                </div>
                Dismiss Phase
              </button>
              <div className={`px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] border ${isNodeCompleted(node) ? 'bg-accent-success/5 text-accent-success border-accent-success/20' : 'bg-accent-glow/5 text-accent-glow border-accent-glow/20'}`}>
                {isNodeCompleted(node) ? 'Protocol Mastered' : 'Active Transmission'}
              </div>
            </div>
            
            <div className="space-y-4">
               <span className="text-[10px] font-black text-accent-glow uppercase tracking-[0.5em] opacity-60">Milestone Directive</span>
               <h2 className="text-6xl md:text-7xl font-serif italic text-text-primary tracking-tighter leading-[0.9]">
                 {node.title}
               </h2>
            </div>
          </header>

          <div className="space-y-10 pb-32">
            {node.subTopics.map((sub, idx) => {
              const isDone = progress.completedSubTopicIds.includes(sub.id);
              const isEditing = editingSubTopicId === sub.id;

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-10 rounded-[2.5rem] border transition-all duration-500 ${isDone ? 'bg-accent-success/5 border-accent-success/20' : 'bg-bg-primary/40 border-border-pill hover:border-accent-glow/20'}`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-3">
                      <h4 className="text-3xl font-serif italic text-text-primary leading-tight">{sub.title}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
                        <span className="flex items-center gap-2 bg-bg-secondary px-3 py-1 rounded-lg border border-border-pill">
                          <Clock className="w-3 h-3 text-accent-glow" /> {sub.estimatedHours}h Duration
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleSubTopic(node.id, sub.id)}
                      className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${isDone ? 'bg-accent-success text-white scale-110' : 'bg-bg-secondary text-text-muted border border-border-pill hover:text-accent-glow hover:border-accent-glow/50'}`}
                    >
                      <CheckCircle2 className="w-7 h-7" />
                    </button>
                  </div>

                  <p className="text-lg text-text-secondary leading-relaxed font-medium mb-10 italic">
                    {sub.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Learning Materials</h5>
                    {!isEditing && onUpdateSubTopicResources && (
                      <button 
                        onClick={() => handleStartEdit(sub.id, sub.resources)}
                        className="text-[10px] flex items-center gap-2 text-accent-glow hover:text-white transition-colors uppercase tracking-widest font-black"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Mode
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {editingResources.map((res, ridx) => (
                          <motion.div 
                            key={ridx}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-bg-secondary border border-border-pill rounded-xl p-4 space-y-3 relative group overflow-hidden"
                          >
                            <div className="flex items-center justify-between gap-3">
                               <select 
                                 value={res.type}
                                 onChange={(e) => handleUpdateResource(ridx, 'type', e.target.value)}
                                 className="bg-bg-primary text-text-primary text-xs px-3 py-1.5 rounded border border-border-pill focus:border-accent-glow outline-none"
                               >
                                 <option value="video">Video</option>
                                 <option value="article">Article</option>
                                 <option value="documentation">Documentation</option>
                                 <option value="paid_course">Course</option>
                               </select>
                               
                               <button 
                                 onClick={() => handleDeleteResource(ridx)}
                                 className="text-text-muted hover:text-rose-500 transition-colors"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                            
                            <input 
                              type="text" 
                              value={res.title}
                              onChange={(e) => handleUpdateResource(ridx, 'title', e.target.value)}
                              placeholder="Resource Title..."
                              className="w-full bg-bg-primary text-text-primary text-sm px-4 py-2 rounded-lg border border-border-pill focus:border-accent-glow outline-none placeholder:text-text-muted/50"
                            />
                            
                            <input 
                              type="url" 
                              value={res.url}
                              onChange={(e) => handleUpdateResource(ridx, 'url', e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-bg-primary text-text-primary text-sm px-4 py-2 rounded-lg border border-border-pill focus:border-accent-glow outline-none placeholder:text-text-muted/50"
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <button 
                        onClick={handleAddResource}
                        className="w-full py-3 rounded-xl border border-dashed border-border-pill hover:border-accent-glow hover:bg-accent-glow/5 transition-colors flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-glow"
                      >
                        <Plus className="w-4 h-4" /> Add Material
                      </button>

                      <div className="flex gap-3 pt-4">
                        <button 
                          onClick={handleCancelEdit}
                          className="flex-1 py-3 rounded-xl bg-bg-primary border border-border-pill text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveEdit}
                          className="flex-1 py-3 rounded-xl bg-accent-glow/10 border border-accent-glow/30 text-[10px] font-black uppercase tracking-widest text-accent-glow hover:bg-accent-glow hover:text-white shadow-[0_0_20px_rgba(var(--accent-glow-rgb),0.2)] transition-all"
                        >
                          <div className="flex justify-center items-center gap-2">
                             <Save className="w-4 h-4" /> Save Configuration
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {sub.resources.map((res, ridx) => (
                        <a
                          key={ridx}
                          href={optimizeLearningLink(res.url, res.title, res.type)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-5 rounded-2xl bg-bg-primary/40 border border-border-pill hover:border-accent-glow/30 transition-all group/link relative overflow-hidden"
                        >
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-pill flex items-center justify-center shrink-0">
                              {res.type === 'video' ? <Play className="w-3 h-3 text-accent-glow" /> : <BookOpen className="w-3 h-3 text-accent-glow" />}
                            </div>
                            <span className="text-[10px] font-black text-text-primary uppercase tracking-widest truncate max-w-[120px]" title={res.title}>{res.title}</span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 shrink-0 text-text-muted group-hover/link:text-accent-glow group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all relative z-10" />
                          <div className="absolute inset-0 bg-accent-glow/5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}
