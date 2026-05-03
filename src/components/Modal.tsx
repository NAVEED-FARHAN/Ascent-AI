import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Info, LogOut, Trash2, CheckCircle2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info' | 'success' | 'danger';
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}: ModalProps) {
  const icons = {
    warning: <AlertTriangle className="w-8 h-8 text-yellow-400" />,
    error: <AlertTriangle className="w-8 h-8 text-red-500" />,
    info: <Info className="w-8 h-8 text-accent-glow" />,
    success: <CheckCircle2 className="w-8 h-8 text-accent-success" />,
    danger: <LogOut className="w-8 h-8 text-red-500" />
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 10, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md frosted-glass rounded-[32px] p-8 border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-accent-glow/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
                {icons[type]}
              </div>
              
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary/40 mb-2">Protocol Action</h2>
              <h1 className="text-2xl font-serif italic text-white mb-4 tracking-tight">{title}</h1>
              <p className="text-text-secondary text-sm leading-relaxed mb-10 font-medium">
                {message}
              </p>
              
              <div className="flex gap-4 w-full">
                {onConfirm ? (
                  <>
                    <button
                      onClick={onClose}
                      className="flex-1 py-4 rounded-xl bg-white/5 border border-white/5 text-text-secondary font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={() => { onConfirm(); onClose(); }}
                      className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg
                        ${type === 'danger' || type === 'error' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-accent-glow text-white shadow-accent-glow/20'}
                        hover:scale-[1.02] active:scale-[0.98]
                      `}
                    >
                      {confirmText}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-4 rounded-xl bg-accent-glow text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-accent-glow/20 hover:scale-[1.02] transition-all"
                  >
                    Acknowledged
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
