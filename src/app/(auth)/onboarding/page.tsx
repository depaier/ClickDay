"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Camera, Map, User, Shield, Image as ImageIcon, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";

export default function OnboardingPage() {
  const { language } = useLanguage();
  const t = translations[language].onboarding;
  
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const INTEREST_CATEGORIES = useMemo(() => [
    { id: "landscape", label: t.landscape, icon: <Map size={18} />, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80" },
    { id: "street", label: t.street, icon: <Camera size={18} />, image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" },
    { id: "portrait", label: t.portrait, icon: <User size={18} />, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80" },
    { id: "architecture", label: t.architecture, icon: <Shield size={18} />, image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" },
    { id: "night", label: t.night, icon: <ImageIcon size={18} />, image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80" },
    { id: "film", label: t.film, icon: <Heart size={18} />, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80" },
  ], [t]);

  // Username validation logic
  useEffect(() => {
    const cleanUsername = username.trim();
    const nicknameRegex = /^[a-zA-Z0-9_.]+$/;
    const isFormatValid = cleanUsername.length >= 2 && cleanUsername.length <= 15 && nicknameRegex.test(cleanUsername);

    if (!isFormatValid) {
      setIsUsernameValid(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", cleanUsername)
          .neq("id", user?.id ?? "")
          .maybeSingle();

        if (!data && !error) {
          setIsUsernameValid(true);
        } else {
          setIsUsernameValid(false);
        }
      } catch (err) {
        console.error("Username check error:", err);
        setIsUsernameValid(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, supabase]);

  const handleComplete = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          interests: selectedInterests,
          onboarded: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      router.replace("/");
    } catch (err) {
      console.error("Onboarding completion error:", err);
      alert(t.error);
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const nextStep = () => setStep((s) => s + 1);

  return (
    <div className="w-full max-w-2xl mx-auto py-8 md:py-12 font-sans">
      <div className="w-full flex flex-col items-center">
        {/* Progress Bar */}
        <div className="flex gap-1.5 mb-12 justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-[1px] w-12 transition-all duration-500 ${
                step >= i ? "bg-[var(--accent)]" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full space-y-10"
            >
              <div className="text-center space-y-3">
                <h1 className="text-2xl md:text-3xl font-heading tracking-[0.2em] uppercase break-keep">{t.welcome}</h1>
                <p className="text-white/40 text-sm tracking-wide">{t.welcomeSubtitle}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-[#111] border border-white/5 p-6 flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <Shield size={20} className="text-[var(--accent)] mt-1 shrink-0" />
                    <div>
                      <p className="text-[14px] font-heading tracking-widest uppercase mb-1">{t.termsTitle}</p>
                      <p className="text-xs text-white/30 leading-relaxed">{t.termsDesc}</p>
                    </div>
                  </div>
                  <div className="h-[1px] bg-white/5 w-full" />
                  <div className="flex items-start gap-4">
                    <Shield size={20} className="text-[var(--accent)] mt-1 shrink-0" />
                    <div>
                      <p className="text-[14px] font-heading tracking-widest uppercase mb-1">{t.privacyTitle}</p>
                      <p className="text-xs text-white/30 leading-relaxed">{t.privacyDesc}</p>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 p-5 bg-[#111] border border-white/5 cursor-pointer hover:bg-[#161616] transition-colors group">
                  <div className={`w-5 h-5 border flex items-center justify-center transition-colors ${agreed ? "bg-[var(--accent)] border-[var(--accent)]" : "border-white/20"}`}>
                    {agreed && <Check size={12} strokeWidth={3} className="text-black" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-[13px] tracking-wide text-white/60 group-hover:text-white transition-colors">{t.agreeAll}</span>
                </label>
              </div>

              <button
                disabled={!agreed}
                onClick={nextStep}
                className="w-full bg-[var(--accent)] text-black py-4 font-heading tracking-[0.2em] uppercase text-[13px] flex items-center justify-center gap-2 hover:bg-[var(--accent-dark)] transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
              >
                {t.next}
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full space-y-10"
            >
              <div className="text-center space-y-3">
                <h1 className="text-2xl md:text-3xl font-heading tracking-[0.2em] uppercase break-keep">{t.identityTitle}</h1>
                <p className="text-white/40 text-sm tracking-wide">{t.identitySubtitle}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-heading tracking-[0.2em] text-white/30 uppercase block ml-1">{t.nicknameLabel}</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        const val = e.target.value;
                        // 한글 자모를 영문 쿼티로 매핑
                        const koToEnMap: { [key: string]: string } = {
                          'ㄱ': 'r', 'ㄴ': 's', 'ㄷ': 'e', 'ㄹ': 'f', 'ㅁ': 'a', 'ㅂ': 'q', 'ㅅ': 't', 'ㅇ': 'd', 'ㅈ': 'w', 'ㅊ': 'c',
                          'ㅋ': 'z', 'ㅌ': 'x', 'ㅍ': 'v', 'ㅎ': 'g', 'ㅏ': 'k', 'ㅑ': 'i', 'ㅓ': 'j', 'ㅕ': 'u', 'ㅗ': 'h', 'ㅛ': 'y',
                          'ㅜ': 'n', 'ㅠ': 'b', 'ㅡ': 'm', 'ㅣ': 'l', 'ㅐ': 'o', 'ㅒ': 'O', 'ㅔ': 'p', 'ㅖ': 'P', 'ㅃ': 'Q', 'ㅉ': 'W',
                          'ㄸ': 'E', 'ㄲ': 'R', 'ㅆ': 'T'
                        };
                        const converted = val.split('').map(char => koToEnMap[char] || char).join('');
                        const filtered = converted.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();
                        setUsername(filtered);
                      }}
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      style={{ imeMode: 'disabled' } as any}
                      placeholder={t.nicknamePlaceholder}
                      className="w-full bg-transparent border-b border-white/10 py-3 px-1 text-lg focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-white/10"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                      {isCheckingUsername ? (
                        <div className="w-5 h-5 border border-white/20 border-t-[var(--accent)] rounded-full animate-spin" />
                      ) : isUsernameValid === true ? (
                        <Check className="text-[var(--accent)]" size={22} strokeWidth={3} />
                      ) : isUsernameValid === false && username.length >= 2 ? (
                        <span className="text-[var(--red-error)] text-[10px] font-heading tracking-widest uppercase">{t.nicknameTaken}</span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-[11px] text-white/20 tracking-wider leading-relaxed">{t.nicknameHint}</p>
                </div>
              </div>

              <button
                disabled={!isUsernameValid}
                onClick={nextStep}
                className="w-full bg-[var(--accent)] text-black py-4 font-heading tracking-[0.2em] uppercase text-[13px] flex items-center justify-center gap-2 hover:bg-[var(--accent-dark)] transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
              >
                {t.next}
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full space-y-10"
            >
              <div className="text-center space-y-3">
                <h1 className="text-2xl md:text-3xl font-heading tracking-[0.2em] uppercase break-keep">{t.discoveryTitle}</h1>
                <p className="text-white/40 text-sm tracking-wide">{t.discoverySubtitle}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTEREST_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleInterest(cat.id)}
                    className={`relative overflow-hidden aspect-square group transition-all duration-500 border ${
                      selectedInterests.includes(cat.id)
                        ? "border-[var(--accent)] scale-[0.98]"
                        : "border-white/5 grayscale opacity-50 hover:opacity-100 hover:grayscale-0"
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col items-start gap-1">
                      <span className="text-[11px] font-heading tracking-[0.2em] uppercase text-white/80">{cat.label}</span>
                      <div className={`h-[1px] bg-[var(--accent)] transition-all duration-500 ${selectedInterests.includes(cat.id) ? "w-8" : "w-0 group-hover:w-4"}`} />
                    </div>
                    {selectedInterests.includes(cat.id) && (
                      <div className="absolute top-3 right-3 bg-[var(--accent)] text-black p-0.5">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-white/5 border border-white/10 py-4 font-heading tracking-[0.2em] uppercase text-[11px] hover:bg-white/10 transition-all"
                >
                  {t.back}
                </button>
                <button
                  disabled={selectedInterests.length === 0 || isSubmitting}
                  onClick={handleComplete}
                  className="flex-[2] bg-[var(--accent)] text-black py-4 font-heading tracking-[0.2em] uppercase text-[13px] flex items-center justify-center gap-2 hover:bg-[var(--accent-dark)] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      {t.complete}
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
