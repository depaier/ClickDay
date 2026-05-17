"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Camera, Check, X } from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";
import { motion } from "framer-motion";

// Helper: create a throwaway Supabase client with a fixed access token.
// This client never acquires the internal auth refresh lock, so it works
// correctly even after the user alt-tabs away and back.
function createMutationClient(accessToken: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, session, profile, signOut, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const t = translations[language].settings;
  const { showToast, showConfirm } = useAlertStore();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    instagram: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || "",
        display_name: profile?.display_name || "",
        bio: profile?.bio || "",
        instagram: profile?.instagram || "",
      });
      setAvatarUrl(profile?.avatar_url || null);
      setIsUsernameValid(true); // Initial state is valid since it's their current username
    }
  }, [profile, user]);

  // Username uniqueness check logic
  useEffect(() => {
    const checkUsername = async () => {
      const cleanUsername = formData.username.trim();
      
      // If it's the current username, it's valid
      if (cleanUsername === profile?.username) {
        setIsUsernameValid(true);
        setIsCheckingUsername(false);
        return;
      }

      if (cleanUsername.length < 2) {
        setIsUsernameValid(false);
        setIsCheckingUsername(false);
        return;
      }

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
        console.error("Error checking username:", err);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.username.trim() !== profile?.username) {
        checkUsername();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, profile?.username, user?.id, supabase]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const accessToken = session?.access_token;
    if (!accessToken) {
      showToast({ message: "세션이 만료됐습니다. 다시 로그인해 주세요.", type: "error" });
      return;
    }

    setUploading(true);
    try {
      const db = createMutationClient(accessToken);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await db.storage.from('clickday').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = db.storage.from('clickday').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);

      const { error: updateError } = await db
        .from("profiles")
        .upsert({
          id: user.id,
          username: profile?.username || user.email?.split('@')[0] || `user_${Date.now()}`,
          avatar_url: publicUrl,
        }, { onConflict: 'id' });

      if (updateError) throw updateError;
      await refreshProfile();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showToast({ message: t.error, type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!isUsernameValid) {
      showToast({ message: translations[language].onboarding.nicknameTaken, type: "error" });
      return;
    }

    const accessToken = session?.access_token;
    if (!accessToken) {
      showToast({ message: "세션이 만료됐습니다. 다시 로그인해 주세요.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const db = createMutationClient(accessToken);
      const { error } = await db.from("profiles").update({
        username: formData.username || user.user_metadata?.username || user.email?.split('@')[0] || `user_${Date.now()}`,
        display_name: formData.display_name || null,
        bio: formData.bio,
        instagram: formData.instagram,
      }).eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      showToast({ message: t.success, type: "success" });
      router.push(`/users/@${formData.username || profile?.username}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast({ message: t.error, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Default avatar using DiceBear if no avatarUrl
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'Felix'}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-heading tracking-[0.2em] uppercase mb-8 border-b border-white/10 pb-4">
        {t.title}
      </h1>
      
      <div className="space-y-12">
        {/* Profile Settings */}
        <section>
          <h2 className="text-xl font-heading tracking-widest uppercase mb-6 text-[var(--accent)]">
            {t.profile}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="relative w-24 h-24 group">
                <div className="w-full h-full rounded-full overflow-hidden border border-white/10 bg-[#111]">
                  <img 
                    src={avatarUrl || defaultAvatar} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*"
              />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-white">{formData.username || profile?.username || user?.user_metadata?.username}</p>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? t.uploading : t.changeAvatar}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                {t.displayNameLabel}
              </label>
              <Input 
                variant="onDark" 
                type="text" 
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder={t.displayNamePlaceholder}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                {t.usernameLabel}
              </label>
              <div className="flex items-center border-b border-white/50 focus-within:border-[var(--accent)] transition-colors relative group">
                <span className="text-white/40 pb-1 pl-1 text-sm font-sans tracking-[0.04em]">@</span>
                <Input 
                  variant="onDark" 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[^a-zA-Z0-9_.]/g, '');
                    setFormData({ ...formData, username: filtered });
                  }}
                  placeholder={t.usernamePlaceholder}
                  className="border-none focus-visible:ring-0 px-1 py-1"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-2">
                  {isCheckingUsername ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white/20" />
                  ) : isUsernameValid === true && formData.username !== profile?.username ? (
                    <Check className="w-4 h-4 text-[var(--accent)]" strokeWidth={3} />
                  ) : isUsernameValid === false ? (
                    <X className="w-4 h-4 text-red-500" strokeWidth={3} />
                  ) : null}
                </div>
              </div>
              <p className={`text-[11px] mt-2 tracking-wider ${isUsernameValid === false ? 'text-red-500' : 'text-white/20'}`}>
                {isUsernameValid === false ? translations[language].onboarding.nicknameTaken : t.usernameHint}
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                {t.instagram}
              </label>
              <div className="flex items-center border-b border-white/50 focus-within:border-[var(--accent)] transition-colors">
                <span className="text-white pb-1 pl-1 text-sm font-sans tracking-[0.04em]">@</span>
                <Input 
                  variant="onDark" 
                  type="text" 
                  value={formData.instagram ? formData.instagram.replace(/^@/, '') : ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^@/, '');
                    setFormData({ ...formData, instagram: val ? '@' + val : '' });
                  }}
                  placeholder={t.usernamePlaceholder}
                  className="border-none focus-visible:ring-0 px-1 py-1"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                {t.bio}
              </label>
              <textarea 
                className="w-full bg-transparent border-b border-white/20 text-white p-2 text-sm focus:outline-none focus:border-[var(--accent)] placeholder:text-gray-600 resize-none font-sans tracking-[0.04em] transition-colors"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={t.bioPlaceholder}
              />
            </div>

            <Button 
              type="submit"
              variant="primary" 
              className="w-fit mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.saving}
                </>
              ) : t.saveProfile}
            </Button>
          </form>
        </section>

        {/* Account Settings */}
        <section>
          <h2 className="text-xl font-heading tracking-widest uppercase mb-6 text-[var(--accent)] border-t border-white/10 pt-12">
            {t.account}
          </h2>
          <div className="space-y-6">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">{t.email}</div>
              <div className="text-white text-sm opacity-60">{user?.email}</div>
            </div>
            
            <Button 
              variant="ghostDark" 
              className="border-red-500 text-red-500 hover:bg-red-500/10"
              onClick={async () => {
                const confirmed = await showConfirm({
                  title: translations[language].nav.logout,
                  message: t.signOutConfirm,
                  confirmLabel: translations[language].nav.logout,
                  cancelLabel: translations[language].common.cancel,
                  confirmVariant: 'danger'
                });
                if (confirmed) signOut();
              }}

            >
              {t.signOut}
            </Button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
