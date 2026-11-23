import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="no-print fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)]">
      {toasts.map((toast) => {
        const tone =
          toast.type === 'error'
            ? 'bg-rose-950 text-white border-rose-700'
            : toast.type === 'info'
            ? 'bg-pastoral-deep text-white border-pastoral-light'
            : 'bg-slate-900 text-white border-slate-700';

        const Icon =
          toast.type === 'error'
            ? AlertTriangle
            : toast.type === 'info'
            ? Info
            : CheckCircle2;

        const iconColor =
          toast.type === 'error'
            ? 'text-rose-400'
            : toast.type === 'info'
            ? 'text-pastoral-cyan'
            : 'text-pastoral-lime';

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all ${tone}`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
