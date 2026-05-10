"use client";

import { useState, Suspense } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { useRouter, useSearchParams } from "next/navigation";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function FilterDrawerContent() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language].feed.filters;
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRegion = searchParams.get("region");
  const currentBrand = searchParams.get("brand");

  const regions = [
    "seoul", "gyeonggi", "incheon", "gangwon", 
    "chungcheong", "jeolla", "gyeongsang", "jeju"
  ];

  const brands = [
    "iphone", "samsung", "sony", "canon", 
    "fujifilm", "nikon", "leica", "hasselblad"
  ];

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("region");
    params.delete("brand");
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
      >
        <SlidersHorizontal size={18} className="text-gray-200" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        >
          {/* Drawer Content */}
          <div 
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-[#0a0a0a] border-l border-white/10 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-xl font-heading tracking-widest uppercase mb-1">{t.advancedFilters}</h2>
                <div className="h-0.5 w-12 bg-[var(--accent)] mb-4" />
                <button 
                  onClick={clearAll}
                  className="text-[10px] tracking-widest uppercase text-[var(--accent)] hover:text-white transition-colors bg-[var(--accent)]/10 px-3 py-1.5 rounded-full border border-[var(--accent)]/20"
                >
                  {t.clearAll}
                </button>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Region Filter */}
            <div className="mb-12">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-6 font-bold flex items-center gap-2">
                <span className="w-1 h-1 bg-[var(--accent)] rounded-full" />
                {t.regions.title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {regions.map((id) => (
                  <button
                    key={id}
                    onClick={() => updateParam("region", currentRegion === id ? null : id)}
                    className={cn(
                      "flex items-center justify-center px-4 py-3 text-[10px] tracking-widest uppercase border transition-all duration-300",
                      currentRegion === id 
                        ? "bg-[var(--accent)] border-[var(--accent)] text-black font-bold shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]" 
                        : "bg-white/5 border-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    {(t.regions as any)[id]}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-12">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-6 font-bold flex items-center gap-2">
                <span className="w-1 h-1 bg-[var(--accent)] rounded-full" />
                {t.brands.title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {brands.map((id) => {
                  const logoPath = {
                    iphone: '/logos/iphone.svg',
                    samsung: '/logos/samsung.svg',
                    canon: '/logos/canon.svg',
                    fujifilm: '/logos/fuji.svg',
                    hasselblad: '/logos/hassel.svg',
                    leica: '/logos/leica.svg',
                    nikon: '/logos/nikon.svg',
                    sony: '/logos/sony.svg'
                  }[id as string];

                  return (
                    <button
                      key={id}
                      onClick={() => updateParam("brand", currentBrand === id ? null : id)}
                      className={cn(
                        "relative group flex items-center justify-center p-3 min-h-[64px] text-[10px] tracking-widest uppercase border transition-all duration-300",
                        currentBrand === id 
                          ? "bg-[var(--accent)] border-[var(--accent)] text-black font-bold shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]" 
                          : "bg-white/5 border-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10"
                      )}
                    >
                      {logoPath ? (
                        <img 
                          src={logoPath} 
                          alt={(t.brands as any)[id]} 
                          className={cn(
                            "h-8 w-auto object-contain transition-all",
                            currentBrand === id ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                          )}
                        />
                      ) : (
                        <span>{(t.brands as any)[id]}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function FilterDrawer() {
  return (
    <Suspense fallback={<div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />}>
      <FilterDrawerContent />
    </Suspense>
  );
}
