"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const supabase = createClient();

function LoginForm() {
  const { language } = useLanguage();
  const t = translations[language].auth;
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

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
        window.location.href = returnTo;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
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
          {loading ? t.loggingIn : t.signIn}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#111] px-2 text-gray-500 uppercase tracking-wider">Or</span>
        </div>
      </div>

      <Button 
        variant="ghost" 
        type="button" 
        className="w-full h-12 text-sm flex items-center justify-center gap-2"
        onClick={handleGoogleLogin}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {(t as any).continueWithGoogle || "Continue with Google"}
      </Button>

      <div className="mt-8 text-center text-sm text-gray-400">
        {t.noAccount}{" "}
        <Link href="/signup" className="text-[var(--accent)] hover:underline">
          {t.signup}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md p-8 bg-[#111] border border-white/10 rounded-sm animate-pulse h-[500px]" />}>
      <LoginForm />
    </Suspense>
  );
}
