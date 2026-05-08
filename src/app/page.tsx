"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostPreviewSheet } from "@/components/post/PostPreviewSheet";
import { GlobeMap } from "@/components/map/GlobeMap";

// Dummy data for map pins
const DUMMY_POSTS = [
  { id: 1, lat: 37.5665, lng: 126.978, title: "Seoul City Hall" },
  { id: 2, lat: 37.5511, lng: 126.9882, title: "Namsan Tower" },
  { id: 3, lat: 37.5796, lng: 126.977, title: "Gyeongbokgung" },
  { id: 4, lat: 37.511, lng: 127.059, title: "COEX" },
  { id: 5, lat: 48.8566, lng: 2.3522, title: "Paris" },
  { id: 6, lat: 40.7128, lng: -74.006, title: "New York" },
  { id: 7, lat: 35.6762, lng: 139.6503, title: "Tokyo" },
  { id: 8, lat: 51.5074, lng: -0.1278, title: "London" },
];

export default function Home() {
  const [selectedPost, setSelectedPost] = useState<{
    id: number;
    lat: number;
    lng: number;
    title: string;
    image_url?: string;
  } | null>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#00000A] text-white">
      <Navbar variant="transparent" />

      {/* Main Map Container */}
      <div className="absolute inset-0">
        <GlobeMap posts={DUMMY_POSTS} onMarkerClick={setSelectedPost} />
      </div>

      {/* Side Panel Overlay */}
      {selectedPost && (
        <PostPreviewSheet
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
