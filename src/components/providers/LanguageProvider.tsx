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
    // Check local storage or default to English
    const savedLang = localStorage.getItem("app-language") as Language;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      setLanguage("en");
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
