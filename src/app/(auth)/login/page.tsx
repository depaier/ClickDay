"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function LoginPage() {
  const { language } = useLanguage();
  const t = translations[language].auth;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#111] border border-white/10 rounded-sm">
      <h1 className="text-2xl font-heading tracking-[0.2em] mb-2 text-center uppercase">{t.login}</h1>
      <p className="text-gray-400 text-sm text-center mb-8">{t.welcomeBack}</p>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-sm">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">{t.email}</label>
          <Input 
            variant="onDark" 
            type="email" 
            name="email"
            placeholder={t.emailPlaceholder} 
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">{t.password}</label>
          <Input 
            variant="onDark" 
            type="password" 
            name="password"
            placeholder="••••••••" 
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button variant="accent" type="submit" className="w-full mt-4 h-12 text-sm" disabled={loading}>
          {loading ? (language === "ko" ? "로그인 중..." : "Logging in...") : t.signIn}
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
