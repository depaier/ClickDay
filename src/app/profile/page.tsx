"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
import { Camera, MapPin, Grid, Heart, Settings, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GeocodedAddress } from "@/components/map/GeocodedAddress";

export default function ProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language].profile;
  const navT = translations[language].nav;
  
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      
      // Failsafe timeout to ensure loading state doesn't get stuck
      const failsafe = setTimeout(() => {
        if (isMounted) setLoading(false);
      }, 5000);
      
      try {
        const [postsRes, savedRes] = await Promise.all([
          supabase
            .from("posts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("bookmarks")
            .select(`post_id, posts (*)`)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        ]);
        
        if (isMounted) {
          if (postsRes.data) setPosts(postsRes.data);
          if (savedRes.data) {
            const formattedSavedPosts = savedRes.data.map((item: any) => item.posts).filter(Boolean);
            setSavedPosts(formattedSavedPosts);
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        clearTimeout(failsafe);
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Handle window focus to refresh data
  useEffect(() => {
    const handleFocus = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user?.id]);


  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-5">
        <Navbar variant="sticky" />
        <h1 className="text-2xl font-heading mb-4 uppercase tracking-widest">Access Denied</h1>
        <p className="text-gray-400 mb-8">Please login to view your profile.</p>
        <Link href="/login" className="px-8 py-3 bg-white text-black font-heading text-xs tracking-widest uppercase hover:bg-[var(--accent)] transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar variant="sticky" />
      
      <main className="max-w-6xl mx-auto px-5 py-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-white/10 bg-zinc-900">
              <Image 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || user?.email?.split('@')[0] || user?.id}`} 
                alt={profile?.username || "avatar"} 
                width={160} 
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-6">
              <h1 className="text-3xl md:text-4xl font-heading font-light tracking-tight uppercase">
                {profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || "Photographer"}
              </h1>
              <div className="flex items-center gap-3">
                <Link href="/settings">
                  <button className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-heading tracking-widest uppercase transition-colors border border-white/5">
                    {t.editProfile}
                  </button>
                </Link>
                <Link href="/settings">
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-white/5">
                    <Settings size={16} />
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-10 mb-6 text-sm">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-zinc-500 uppercase text-[10px] tracking-widest mb-1">{t.myPosts}</span>
                <span className="font-heading text-xl">{posts.length}</span>
              </div>
              {/* Future stats like followers/following can go here */}
            </div>

            <p className="text-zinc-400 text-sm max-w-md text-center md:text-left leading-relaxed mb-4">
              {t.bio}
            </p>

            {profile?.instagram && (
              <div className="flex items-center gap-2 text-zinc-300">
                <Image src="/logos/instagram.svg" alt="Instagram" width={16} height={16} className="opacity-80" />
                <a href={`https://instagram.com/${profile.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  {profile.instagram}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-t border-white/10 mb-10">
          <div className="flex justify-center -mt-px gap-8">
            <button 
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-8 py-4 border-t text-[10px] font-heading tracking-widest uppercase transition-colors ${
                activeTab === "posts" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Grid size={14} />
              {t.myPosts}
            </button>
            <button 
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 px-8 py-4 border-t text-[10px] font-heading tracking-widest uppercase transition-colors ${
                activeTab === "saved" ? "border-white text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Bookmark size={14} />
              {t.savedPosts}
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border border-zinc-500 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (activeTab === "posts" ? posts : savedPosts).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
            {(activeTab === "posts" ? posts : savedPosts).map((post) => (
              <Link 
                key={post.id} 
                href={`/posts/${post.id}`}
                className="relative aspect-square group overflow-hidden bg-zinc-900 border border-white/5"
              >
                <Image 
                  src={post.image_url} 
                  alt={post.location_name || "Photo"} 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Heart size={16} fill="white" />
                      <span className="text-xs font-heading">{post.like_count || 0}</span>
                    </div>
                  </div>
                  {(post.latitude && post.longitude) && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-tighter text-zinc-300">
                      <MapPin size={10} />
                      <GeocodedAddress latitude={post.latitude} longitude={post.longitude} />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg">
            <Camera size={40} className="text-zinc-700 mb-4" />
            <p className="text-zinc-500 text-sm mb-6">No photos shared yet.</p>
            <Link href="/upload" className="text-[10px] font-heading tracking-widest uppercase hover:text-[var(--accent)] transition-colors">
              {navT.upload} +
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
