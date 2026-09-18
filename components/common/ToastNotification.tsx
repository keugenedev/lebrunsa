'use client';

import React from 'react';
import { useInventory } from '@/context/InventoryContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastNotification() {
  const { toasts, dismissToast } = useInventory();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-4 flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-top-3 fade-in"
            role="alert"
          >
            {/* Icon Box matching the user modal's rounded-xl slate box */}
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-800 shrink-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-slate-800" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-slate-800" />}
              {isError && <AlertCircle className="w-4 h-4 text-slate-800" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-slate-800" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {toast.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>

            {/* Close button matching user modal style */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
