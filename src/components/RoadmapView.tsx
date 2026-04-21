
import { Roadmap, UserProgress, RoadmapNode, SubTopic } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ExternalLink, 
  Play, 
  Book, 
  FileText, 
  Lock,
  Network,
  Zap,
  Target,
  Trophy,
  ArrowRight,
  X,
  Clock,
  BookOpen,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

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
  onToggleSubTopic, 
  onNavigateToPractice,
  searchQuery = '',
  selectedNodeId,
  setSelectedNodeId
}: RoadmapViewProps) {

  const selectedNode = roadmap.nodes.find(n => n.id === selectedNodeId);

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
    
    // Check explicit dependencies
    const hasExplicitDeps = node.dependencies.length > 0;
    const explicitDepsDone = node.dependencies.every(depId => {
      const depNode = roadmap.nodes.find(n => n.id === depId);
      return depNode ? isNodeCompleted(depNode) : true;
    });
    
    // Check if previous node is done (enforce linear flow)
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
    <div className="max-w-7xl mx-auto space-y-24 pb-48 pt-10 relative px-10">
      {/* Header Summary */}
      <section className="flex flex-col lg:flex-row justify-between items-center gap-16 relative">
        <div className="flex-1 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center lg:justify-start gap-3 mb-8"
          >
            <div className="px-4 py-1.5 rounded-full bg-accent-glow/10 border border-accent-glow/20 text-accent-glow text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
              Operational Phase: {Math.ceil(calculateProgress() / 33) || 1}
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif italic text-white tracking-tighter mb-10 leading-[0.85]"
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
            <div className="flex-1 w-full bg-white/5 h-2 rounded-full overflow-hidden relative border border-white/5">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-accent-glow shadow-[0_0_20px_rgba(99,102,241,0.6)]" 
              />
            </div>
            <div className="flex items-baseline gap-2 flex-shrink-0">
               <span className="text-4xl font-serif italic text-white">{calculateProgress()}</span>
               <span className="text-sm font-black text-text-secondary/40 uppercase tracking-widest">% Mastery</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
           <div className="absolute inset-0 bg-accent-glow/5 blur-[80px] -z-10" />
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4 }}
             className="frosted-glass rounded-2xl p-8 flex flex-col justify-between h-48 group hover:border-accent-success/30 transition-all border border-white/5"
           >
             <div className="w-12 h-12 rounded-xl bg-accent-success/10 flex items-center justify-center text-accent-success group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60 mb-1">Decrypted Modules</p>
               <p className="text-4xl font-serif italic text-white leading-none">{getCompletedCount()}<span className="text-lg opacity-20 mx-2">/</span>{getTotalSubtopics()}</p>
             </div>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.6 }}
             className="bg-accent-glow rounded-2xl p-8 flex flex-col justify-between h-48 shadow-2xl shadow-accent-glow/30 group hover:translate-y-[-5px] transition-all"
           >
             <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
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
        {/* Central Spine */}
        <div className="absolute left-[34px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2 z-0" />
        
        <div className="flex flex-col gap-0 relative z-10">
          {filteredNodes.map((node, index) => {
            const unlocked = isNodeUnlocked(node);
            const completed = isNodeCompleted(node);
            const isEven = index % 2 === 0;

            return (
              <motion.div 
                key={node.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className={`relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-start h-[480px] w-full pt-0`}
              >
                {/* Visual Connector Node - Pinned to absolute top-0 */}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={`absolute left-[34px] lg:left-1/2 -translate-x-1/2 top-0 w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-700 z-20 ${
                    completed 
                      ? 'bg-accent-success/20 border-accent-success text-accent-success shadow-[0_0_40px_rgba(34,197,94,0.4)]' 
                      : unlocked 
                      ? 'bg-bg-base border-accent-glow text-accent-glow shadow-[0_0_40px_rgba(99,102,241,0.2)]'
                      : 'bg-white/5 border-white/10 text-white/20'
                  }`}
                >
                  <div className="absolute inset-0 rounded-2xl bg-current opacity-5" />
                  {completed ? <CheckCircle2 className="w-10 h-10" /> : (
                    <span className="text-2xl font-black">{index + 1}</span>
                  )}
                </motion.div>

                {/* Content Card */}
                <div className={`w-full lg:w-[calc(50%-100px)] ${isEven ? 'lg:text-right' : 'lg:text-left'} pl-24 lg:pl-0`}>
                   <motion.button 
                    disabled={!unlocked}
                    onClick={() => setSelectedNodeId(node.id)}
                    whileHover={unlocked ? { x: isEven ? -10 : 10 } : {}}
                    className={`w-full group text-left ${isEven ? 'lg:text-right' : 'lg:text-left'} transition-all outline-none ${!unlocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                   >
                     <div className={`inline-flex items-center gap-3 mb-6 text-[10px] font-black uppercase tracking-[0.3em] ${completed ? 'text-accent-success' : unlocked ? 'text-accent-glow' : 'text-text-secondary/40'}`}>
                        {unlocked ? <Zap className="w-3 h-3 fill-current" /> : <Lock className="w-3 h-3" />}
                        {completed ? 'Protocol Decoded' : unlocked ? 'Active Stream' : 'Encrypted Phase'}
                     </div>
                     <h3 className={`text-4xl md:text-5xl font-serif italic mb-6 transition-all duration-500 ${unlocked ? 'text-white group-hover:text-accent-glow' : 'text-text-secondary/20'}`}>
                        {node.title}
                     </h3>
                     <p className={`text-text-secondary font-medium leading-relaxed max-w-sm text-lg ${isEven ? 'lg:ml-auto' : ''}`}>
                       {node.description}
                     </p>
                   </motion.button>
                </div>

                {/* Ghost Space for Balanced Layout */}
                <div className="hidden lg:block lg:w-[calc(50%-100px)]" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Insights Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-20 border-t border-white/5">
         <div className="frosted-glass rounded-3xl p-10 flex flex-col justify-between min-h-[300px] group overflow-hidden relative">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary/40 mb-6">Challenge Center</h4>
              <h3 className="text-3xl font-serif italic text-white mb-4">The Logic Paradox</h3>
              <p className="text-text-secondary font-medium max-w-sm">Solve specialized challenges to earn exclusive Architect Badges and validate your progress.</p>
            </div>
            <button 
              onClick={onNavigateToPractice}
              className="flex items-center gap-3 text-accent-glow font-black text-[10px] uppercase tracking-widest bg-white/5 w-fit px-6 py-3 rounded-xl border border-white/5 hover:border-accent-glow/30 transition-all"
            >
              Enter Laboratory
              <ArrowRight className="w-4 h-4" />
            </button>
         </div>

         <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-glow mb-6">Tactical Validation</h4>
              <h3 className="text-3xl font-serif italic text-white mb-4">Validate Your Knowledge</h3>
              <p className="text-text-secondary/60 font-medium max-w-sm">Every completed module unlocks a new set of practice protocols. Don't just learn—master.</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-accent-glow/20 border-2 border-[#121421] flex items-center justify-center text-[10px] font-black">{i}</div>
                  ))}
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/30">New Challenges Queued</span>
            </div>
         </div>
      </section>
    </div>
  );
}
