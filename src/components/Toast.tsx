import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void; key?: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const bgClasses = {
    success: 'bg-emerald-50/95 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 shadow-xl shadow-emerald-500/5',
    error: 'bg-rose-50/95 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 shadow-xl shadow-rose-500/5',
    info: 'bg-sky-50/95 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/60 text-sky-800 dark:text-sky-200 shadow-xl shadow-sky-500/5',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-550" />,
    error: <AlertCircle className="w-5 h-5 text-rose-550" />,
    info: <Info className="w-5 h-5 text-sky-550" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${bgClasses[toast.type]} backdrop-blur-md`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium tracking-wide">
        {toast.text}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 cursor-pointer p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 opacity-70" />
      </button>
    </motion.div>
  );
}
