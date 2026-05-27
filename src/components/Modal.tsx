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
    warning: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
    error: <AlertTriangle className="w-8 h-8 text-accent-danger" />,
    info: <Info className="w-8 h-8 text-accent-glow" />,
    success: <CheckCircle2 className="w-8 h-8 text-accent-success" />,
    danger: <LogOut className="w-8 h-8 text-accent-danger" />
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-bg-secondary/95 backdrop-blur-3xl rounded-xl p-8 border border-border-pill shadow-2xl overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-glow/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-glow/10 blur-[80px] rounded-full" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-xl bg-bg-secondary border border-border-pill flex items-center justify-center mb-6 shadow-xl">
                {icons[type]}
              </div>
              
              <div className="space-y-4 mb-10">
                <h2 className="text-4xl font-serif italic text-text-primary tracking-tight leading-tight">{title}</h2>
                <p className="text-text-secondary leading-relaxed font-medium">
                  {message}
                </p>
              </div>
              
              <div className="flex gap-4 w-full">
                {onConfirm ? (
                  <>
                    <button
                      onClick={onClose}
                      className="flex-1 py-4 rounded-lg bg-bg-secondary border border-border-pill text-text-muted font-medium text-[10px] uppercase tracking-widest hover:bg-bg-secondary/80 hover:text-text-primary transition-all"
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={() => { onConfirm(); onClose(); }}
                      className={`flex-[2] py-4 rounded-lg font-semibold text-[10px] uppercase tracking-widest transition-all shadow-lg
                        ${type === 'danger' || type === 'error' ? 'bg-accent-danger text-white shadow-accent-danger/20' : 'bg-accent-glow text-white shadow-accent-glow/20'}
                        hover:scale-[1.02] active:scale-[0.98]
                      `}
                    >
                      {confirmText}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-4 rounded-xl bg-accent-glow text-white font-semibold text-[10px] uppercase tracking-widest shadow-lg shadow-accent-glow/20 hover:scale-[1.02] transition-all"
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
