"use client";

import React, { useState } from "react";
import { Siren, CheckCircle2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { useLanguage } from "../providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { createReport, ReportTargetType, getReportStatus } from "@/lib/actions/report-actions";
import { cn } from "@/lib/utils";
import { useAuth } from "../providers/AuthProvider";
import { useAlertStore } from "@/store/useAlertStore";

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "ghostDark" | "accent" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function ReportButton({ 
  targetType, 
  targetId, 
  className, 
  variant = "ghost",
  size = "icon",
  showLabel = false 
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = translations[language].report;
  const showAlert = useAlertStore((state) => state.showAlert);

  const reasons = [
    { id: "inappropriate", label: t.reasons.inappropriate },
    { id: "spam", label: t.reasons.spam },
    { id: "sexual", label: t.reasons.sexual },
    { id: "copyright", label: t.reasons.copyright },
    { id: "other", label: t.reasons.other },
  ];

  const handleButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const alreadyReported = await getReportStatus(targetType, targetId);
      if (alreadyReported) {
        showAlert({
          type: "info",
          title: t.title,
          message: t.alreadyReported,
          confirmLabel: translations[language].common.confirm,
        });
        return;
      }
      setIsOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await createReport({
        targetType,
        targetId,
        reason,
        details,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        // Reset state after closing animation
        setTimeout(() => {
          setIsSuccess(false);
          setReason("");
          setDetails("");
        }, 300);
      }, 2000);
    } catch (error: any) {
      console.error(error);
      let message = t.error;
      if (error.message === "ALREADY_REPORTED") message = t.alreadyReported;
      else if (error.message === "LIMIT_REACHED") message = t.limitReached;
      
      showAlert({
        type: "error",
        title: t.title,
        message: message,
        confirmLabel: translations[language].common.confirm,
      });
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 비로그인 사용자는 신고 버튼을 보지 못함 (또는 로그인 유도 가능하지만 여기선 숨김)
  if (!user) return null;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleButtonClick}
        disabled={isChecking}
        className={cn("group transition-all hover:text-rose-500 hover:border-rose-500", className)}
        title={t.title}
      >
        {isChecking ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Siren className={cn("w-5 h-5", showLabel && "mr-2")} />
        )}
        {showLabel && <span>{t.title}</span>}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[440px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden rounded-xl"
            >
              {isSuccess ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 text-white"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <h3 className="text-xl font-heading tracking-wider uppercase mb-2 text-black dark:text-white">{t.success}</h3>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5">
                    <h3 className="font-heading text-lg tracking-wider uppercase text-black dark:text-white">{t.title}</h3>
                    <button 
                      type="button"
                      onClick={() => setIsOpen(false)} 
                      className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-heading tracking-widest text-gray-400 uppercase">{t.reason}</label>
                      <div className="grid grid-cols-1 gap-2">
                        {reasons.map((r) => (
                          <label 
                            key={r.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all",
                              reason === r.id 
                                ? "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30" 
                                : "border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5"
                            )}
                          >
                            <input 
                              type="radio" 
                              name="reportReason" 
                              value={r.id} 
                              checked={reason === r.id}
                              onChange={(e) => setReason(e.target.value)}
                              className="hidden"
                            />
                            <div className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center",
                              reason === r.id ? "border-rose-500 bg-rose-500" : "border-gray-300 dark:border-white/20"
                            )}>
                              {reason === r.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <span className={cn(
                              "text-sm",
                              reason === r.id ? "text-rose-600 dark:text-rose-400 font-bold" : "text-gray-600 dark:text-gray-400"
                            )}>{r.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-heading tracking-widest text-gray-400 uppercase">{t.details}</label>
                      <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder={t.placeholder}
                        className="w-full min-h-[100px] p-4 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-white/5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all resize-none text-black dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50/50 dark:bg-white/5 flex gap-3">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="flex-1 bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400"
                      onClick={() => setIsOpen(false)}
                      disabled={isSubmitting}
                    >
                      {translations[language].common.cancel}
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className={cn("flex-1", reason ? "bg-rose-600 hover:bg-rose-700 text-white border-none" : "opacity-50")}
                      disabled={isSubmitting || !reason}
                    >
                      {isSubmitting ? translations[language].common.loading : t.submit}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
