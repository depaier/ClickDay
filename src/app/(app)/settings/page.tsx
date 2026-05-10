"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Camera } from "lucide-react";

const supabase = createClient();

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const t = translations[language].settings;
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    instagram: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || "",
        bio: profile?.bio || "",
        instagram: profile?.instagram || "",
      });
      setAvatarUrl(profile?.avatar_url || null);
    }
  }, [profile, user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('clickday')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('clickday')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ 
          id: user.id,
          username: profile?.username || user.email?.split('@')[0] || `user_${Date.now()}`,
          avatar_url: publicUrl 
        }, { onConflict: 'id' });

      if (updateError) throw updateError;
      await refreshProfile();
      
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert(t.error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: formData.username || user.user_metadata?.username || user.email?.split('@')[0] || `user_${Date.now()}`,
          bio: formData.bio,
          instagram: formData.instagram,
        }, { onConflict: 'id' });

      if (error) throw error;
      await refreshProfile();
      alert(t.success);
      router.push(`/users/@${formData.username || profile?.username || user.id}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  // Default avatar using DiceBear if no avatarUrl
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'Felix'}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
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
                Username (닉네임)
              </label>
              <Input 
                variant="onDark" 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Your username"
                required
              />
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
                  placeholder="username"
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
                placeholder="Tell us about yourself..."
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
                  Saving...
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
              onClick={() => signOut()}
            >
              {t.signOut}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
