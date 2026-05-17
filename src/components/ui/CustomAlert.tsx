'use client';

import { useAlertStore } from '@/store/useAlertStore';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export const CustomAlert = () => {
  const { isOpen, type, title, message, confirmLabel, cancelLabel, confirmVariant, closeAlert } = useAlertStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      {/* Overlay: 차분하고 깊은 어두운 배경 */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" 
        onClick={() => type !== 'confirm' && closeAlert(false)}
      />
      
      {/* Hasselblad Seamless Dark Web Dialog Card */}
      <div className={cn(
        "relative w-full max-w-[420px] bg-[#0c0c0c] border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.95)] overflow-hidden rounded-none transition-all duration-300 transform text-white",
        isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
      )}>
        {/* Header: 투박한 border-b를 완전히 제거하고 여백과 타이포그래피만으로 위계 형성 */}
        <div className="px-8 pt-8 pb-2 flex items-center justify-between bg-[#0c0c0c]">
          <h2 className="font-heading text-xs font-bold tracking-[0.25em] uppercase text-white/70">
            {title}
          </h2>
        </div>
        
        {/* Body: 헤더와 자연스럽게 이어지는 심리스(Seamless) 캔버스 */}
        <div className="px-8 py-6 bg-[#0c0c0c] text-left flex items-center min-h-[100px]">
          <p className="font-body text-sm tracking-[0.04em] text-gray-300 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Action Buttons: 투박한 border-t와 배경 분리를 없애고 하나의 배경 위에서 우아하게 정렬 */}
        <div className="px-8 pt-4 pb-8 bg-[#0c0c0c] flex items-center justify-end gap-3.5 w-full">
          {type === 'confirm' && (
            <button 
              type="button"
              className="h-10 px-6 bg-transparent border border-white/10 text-gray-400 hover:border-white/30 hover:text-white hover:bg-white/[0.02] tracking-[0.15em] text-xs font-heading uppercase transition-all rounded-none cursor-pointer"
              onClick={() => closeAlert(false)}
            >
              {cancelLabel}
            </button>
          )}
          <button 
            type="button"
            className={cn(
              "h-10 px-7 tracking-[0.15em] text-xs font-heading uppercase transition-all rounded-none border-none cursor-pointer font-medium",
              confirmVariant === 'danger' && "bg-[#cb2d2d] hover:bg-[#a02323] text-white",
              confirmVariant === 'accent' && "bg-[#E8B800] hover:bg-[#BF9700] text-black font-bold",
              (!confirmVariant || confirmVariant === 'primary') && "bg-gradient-to-b from-[#535759] to-[#3b3e40] text-white hover:from-[#6c7073] hover:to-[#535759]"
            )}
            onClick={() => closeAlert(true)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
