"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";

export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language].auth;

  return (
    <div className="w-full max-w-md p-8 bg-[#111] border border-white/10 rounded-sm">
      <h1 className="text-2xl font-heading tracking-[0.2em] mb-2 text-center uppercase">{t.login}</h1>
      <p className="text-gray-400 text-sm text-center mb-8">{t.welcomeBack}</p>

      <form className="flex flex-col gap-6">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">{t.email}</label>
          <Input variant="onDark" type="email" placeholder={t.emailPlaceholder} />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">{t.password}</label>
          <Input variant="onDark" type="password" placeholder="••••••••" />
        </div>

        <Button variant="accent" className="w-full mt-4 h-12 text-sm">
          {t.signIn}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        {t.noAccount}{" "}
        <Link href="/signup" className="text-[var(--accent)] hover:underline">
          {t.signup}
        </Link>
      </div>
    </div>
  );
}
