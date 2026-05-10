'use client';

import { useAlertStore } from '@/store/useAlertStore';
import { Button } from './Button';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export const CustomAlert = () => {
  const { isOpen, type, title, message, confirmLabel, cancelLabel, confirmVariant, closeAlert } = useAlertStore();
  const [isVisible, setIsVisible] = useState(false);

  // 애니메이션 종료 후 언마운트를 위한 상태 관리
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    confirm: Info,
  }[type];

  const colors = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
    confirm: 'text-zinc-500',
  }[type];

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      {/* Overlay: 배경 클릭 시 confirm 타입이 아니면 닫기 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={() => type !== 'confirm' && closeAlert(false)}
      />
      
      {/* Modal Card */}
      <div className={cn(
        "relative w-full max-w-[360px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 transform border border-white/20 dark:border-white/10",
        isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
      )}>
        <div className="flex flex-col items-center text-center">
          {/* Icon Section */}
          <div className={cn("mb-6 p-4 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700", colors)}>
            <Icon size={32} strokeWidth={1.5} />
          </div>
          
          {/* Text Section */}
          <h2 className="text-xl font-heading font-normal mb-3 tracking-wider uppercase">
            {title}
          </h2>
          
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-10 whitespace-pre-wrap">
            {message}
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            {type === 'confirm' && (
              <Button 
                variant="ghostDark" 
                className="flex-1 py-6 text-xs tracking-[0.2em] border-zinc-200 dark:border-zinc-700 dark:text-white"
                onClick={() => closeAlert(false)}
              >
                {cancelLabel}
              </Button>
            )}
            <Button 
              variant={confirmVariant || 'primary'} 
              className="flex-1 py-6 text-xs tracking-[0.2em]"
              onClick={() => closeAlert(true)}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
