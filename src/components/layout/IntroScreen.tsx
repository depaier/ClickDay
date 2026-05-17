"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type IntroStep = "idle" | "logo-appear" | "reveal-text" | "completed";

interface IntroScreenProps {
  onComplete?: () => void;
  showDebug?: boolean;
}

export function IntroScreen({ onComplete, showDebug = false }: IntroScreenProps) {
  const [step, setStep] = useState<IntroStep>("idle");

  useEffect(() => {
    setStep("idle");

    // 1단계: 150ms 후에 로고 심볼이 스케일업 되며 페이드인 등장
    const timer1 = setTimeout(() => {
      setStep("logo-appear");
    }, 150);

    // 2단계: 로고 등장 완료 후 대기하다가 800ms 시점에 좌측 이동 및 글자 전개 시작
    const timer2 = setTimeout(() => {
      setStep("reveal-text");
    }, 800);

    // 3단계: 글자 전개 완료 후 1800ms 시점에 최종 인트로 완성 상태 진입
    const timer3 = setTimeout(() => {
      setStep("completed");
    }, 1800);

    // 4단계: 인트로 완성 후 부드럽게 퇴장할 수 있도록 부모에게 알림 (2.0초 시점)
    const timer4 = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  // 우아하고 묵직한 easeOutExpo 트랜지션
  const customEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#000002] text-white overflow-hidden select-none z-[70]">
      {/* 백그라운드 미세 성운 글로우 효과 (프리미엄 룩앤필 극대화) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] transition-all duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] transition-all duration-1000" />
      </div>

      {/* 인트로 메인 애니메이션 컨테이너 */}
      <div className="relative flex items-center justify-center z-10 w-full max-w-4xl px-8">
        <div className="flex items-center justify-center gap-3 md:gap-5">
          {/* 1. 로고 심볼 (intro_logo.svg) */}
          <div className="relative w-16 h-10 md:w-28 md:h-18 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.7,
                ease: customEase,
              }}
              className="w-full h-full relative"
            >
              <Image
                src="/intro_logo.svg"
                alt="ClickDay Logo Symbol"
                fill
                priority
                className="object-contain"
              />
            </motion.div>
          </div>

          {/* 2. 브랜드 이름 (intro_clickday.svg) */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: step === "reveal-text" || step === "completed" ? "auto" : 0,
              opacity: step === "reveal-text" || step === "completed" ? 1 : 0,
            }}
            transition={{
              width: { duration: 0.8, ease: customEase },
              opacity: { duration: 0.4, delay: 0.1, ease: "easeOut" },
            }}
            className="relative overflow-hidden flex items-center h-8 md:h-12 flex-shrink-0"
          >
            <div className="relative w-[180px] h-6 md:w-[320px] md:h-10 flex-shrink-0">
              <Image
                src="/intro_clickday.svg"
                alt="ClickDay Brand Name"
                fill
                priority
                className="object-contain"
              />

              {/* 쉬머 글로우 광택 효과 */}
              <AnimatePresence>
                {(step === "reveal-text" || step === "completed") && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none mix-blend-overlay"
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 현재 애니메이션의 진행 단계 표시 (테스트용 디버그 시에만 활성화) */}
      {showDebug && (
        <div className="absolute bottom-24 flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs text-gray-400 z-20">
          <span className="font-mono text-gray-500">STAGE:</span>
          <span className={`font-semibold transition-colors duration-300 ${step === "idle" ? "text-red-400" : step === "logo-appear" ? "text-yellow-400" : step === "reveal-text" ? "text-blue-400" : "text-emerald-400"}`}>
            {step.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
