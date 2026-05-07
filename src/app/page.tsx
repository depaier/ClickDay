"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostPreviewSheet } from "@/components/post/PostPreviewSheet";
import { MapPin } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

// Dummy data for map pins
const DUMMY_POSTS = [
  { id: 1, lat: 37.5665, lng: 126.9780, title: "Seoul City Hall" },
  { id: 2, lat: 37.5511, lng: 126.9882, title: "Namsan Tower" },
  { id: 3, lat: 37.5796, lng: 126.9770, title: "Gyeongbokgung" },
  { id: 4, lat: 37.5110, lng: 127.0590, title: "COEX" },
];

export default function Home() {
  const [selectedPost, setSelectedPost] = useState<{ id: number; lat: number; lng: number; title: string; image_url?: string } | null>(null);

  // You will need a Google Maps API Key in .env.local
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      <Navbar variant="transparent" />

      {/* Main Map Container */}
      <div className="absolute inset-0">
        {GOOGLE_MAPS_API_KEY ? (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={{ lat: 37.5665, lng: 126.9780 }}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              disableDefaultUI={true}
              className="w-full h-full"
            >
              {DUMMY_POSTS.map((post) => (
                <AdvancedMarker 
                  key={post.id} 
                  position={{ lat: post.lat, lng: post.lng }}
                  onClick={() => setSelectedPost(post)}
                >
                  <Pin background={"var(--accent)"} borderColor={"black"} glyphColor={"black"} />
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        ) : (
          <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center text-center p-8">
            <MapPin className="w-16 h-16 text-[var(--accent)] mb-4" />
            <h1 className="font-heading text-2xl mb-2">Map Loading Placeholder</h1>
            <p className="text-gray-400 max-w-md">
              Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local to see the actual map. 
              Clicking the button below simulates clicking a map pin.
            </p>
            <button 
              className="mt-6 px-6 py-3 bg-[var(--accent)] text-black font-heading tracking-[0.1em] hover:bg-[var(--accent-dark)] transition-colors uppercase text-sm"
              onClick={() => setSelectedPost(DUMMY_POSTS[1])}
            >
              Simulate Marker Click
            </button>
          </div>
        )}
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
