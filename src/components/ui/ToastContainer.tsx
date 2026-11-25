import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2.5 px-2 sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />,
          error: <AlertCircle className="h-5 w-5 shrink-0 text-[#ef5350]" />,
          warning: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />,
          info: <Info className="h-5 w-5 shrink-0 text-sky-400" />,
        };
        const borderMap = {
          success: 'border-emerald-500/30',
          error: 'border-[#ef5350]/40',
          warning: 'border-amber-500/30',
          info: 'border-sky-500/30',
        };

        return (
          <div
            key={toast.id}
            className={`animate-toast flex items-start gap-3 rounded-xl border ${borderMap[toast.type]} bg-[#161b22]/95 p-3.5 shadow-2xl shadow-black/60 backdrop-blur-md`}
          >
            <div className="mt-0.5">{iconMap[toast.type]}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#e6edf3]">{toast.title}</p>
              {toast.message && (
                <p className="mt-0.5 text-xs leading-relaxed text-[#9aa5b4]">{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-lg p-1 text-[#7d8898] transition hover:bg-white/5 hover:text-white"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
