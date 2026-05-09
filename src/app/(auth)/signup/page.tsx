"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const { language } = useLanguage();
  const t = translations[language].auth;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError(language === "ko" ? "비밀번호가 일치하지 않습니다." : "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
        },
      });

      if (signupError) throw signupError;

      if (data.user) {
        alert(language === "ko" 
          ? "회원가입이 완료되었습니다. 이메일을 확인해주세요." 
          : "Signup successful. Please check your email for verification.");
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#111] border border-white/10 rounded-sm">
      <h1 className="text-2xl font-heading tracking-[0.2em] mb-2 text-center uppercase">{t.createAccount}</h1>
      <p className="text-gray-400 text-sm text-center mb-8">{t.joinCommunity}</p>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-sm">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">{t.username}</label>
          <Input 
            variant="onDark" 
            type="text" 
            name="username"
            placeholder={t.usernamePlaceholder} 
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
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
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">{t.confirmPassword}</label>
          <Input 
            variant="onDark" 
            type="password" 
            name="confirmPassword"
            placeholder="••••••••" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <Button variant="accent" type="submit" className="w-full mt-4 h-12 text-sm" disabled={loading}>
          {loading ? (language === "ko" ? "처리 중..." : "Processing...") : t.signup}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        {t.haveAccount}{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          {t.signInShort}
        </Link>
      </div>
    </div>
  );
}
