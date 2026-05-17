'use client';

import { useAlertStore } from '@/store/useAlertStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export const Toast = () => {
  const { isToastOpen, toastMessage, toastType, toastDuration, closeToast } = useAlertStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isToastOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        closeToast();
      }, toastDuration);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isToastOpen, toastDuration, closeToast]);

  if (!isVisible && !isToastOpen) return null;

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[toastType];

  const iconColors = {
    success: 'text-emerald-500 dark:text-emerald-600',
    error: 'text-rose-500 dark:text-rose-600',
    warning: 'text-amber-500 dark:text-amber-600',
    info: 'text-blue-500 dark:text-blue-600',
  }[toastType];

  return (
    <div className={cn(
      "fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3.5 px-6 py-3.5 rounded-full bg-zinc-900/95 dark:bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/15 dark:border-black/10 text-white dark:text-zinc-900 transition-all duration-300 transform max-w-[90vw] md:max-w-md",
      isToastOpen ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95 pointer-events-none"
    )}>
      <div className={cn("flex-shrink-0", iconColors)}>
        <Icon size={20} strokeWidth={2.5} />
      </div>

      <p className="text-sm font-medium tracking-wide flex-1 whitespace-pre-wrap leading-snug">
        {toastMessage}
      </p>

      <button
        onClick={() => closeToast()}
        className="p-1 rounded-full hover:bg-white/10 dark:hover:bg-black/5 text-zinc-400 dark:text-zinc-500 hover:text-white dark:hover:text-black transition-colors flex-shrink-0"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
};
