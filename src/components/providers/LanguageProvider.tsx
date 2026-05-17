"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "ko";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // 1. 로컬 스토리지에 저장된 언어 확인
    const savedLang = localStorage.getItem("app-language") as Language;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      // 2. 저장된 언어가 없다면 사용자의 기기/브라우저 언어 자동 감지
      const browserLang = window.navigator.language || (window.navigator.languages && window.navigator.languages[0]) || "en";
      if (browserLang.toLowerCase().startsWith("ko")) {
        setLanguage("ko");
      } else {
        setLanguage("en");
      }
    }
  }, []);

  useEffect(() => {
    // Update the html lang attribute
    document.documentElement.lang = language;
    localStorage.setItem("app-language", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
