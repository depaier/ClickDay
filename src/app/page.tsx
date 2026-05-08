"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostPreviewSheet } from "@/components/post/PostPreviewSheet";
import { MapPin } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";

// Dummy data for map pins (More dense for clustering test)
const DUMMY_POSTS = [
  { id: 1, lat: 37.5665, lng: 126.9780, title: "Seoul City Hall" },
  { id: 2, lat: 37.5668, lng: 126.9785, title: "City Hall Near 1" },
  { id: 3, lat: 37.5662, lng: 126.9775, title: "City Hall Near 2" },
  { id: 4, lat: 37.5511, lng: 126.9882, title: "Namsan Tower" },
  { id: 5, lat: 37.5515, lng: 126.9888, title: "Namsan Near 1" },
  { id: 6, lat: 37.5796, lng: 126.9770, title: "Gyeongbokgung" },
  { id: 7, lat: 37.5110, lng: 127.0590, title: "COEX" },
  { id: 8, lat: 37.5115, lng: 127.0595, title: "COEX Near 1" },
];

interface Cluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  postIds: number[];
}

function MapHandler({ onBoundsChange }: { onBoundsChange: (map: google.maps.Map) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const listener = map.addListener("idle", () => {
      onBoundsChange(map);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onBoundsChange]);

  return null;
}

export default function Home() {
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const MapInstanceGetter = () => {
    const map = useMap();
    useEffect(() => {
      if (map) setMapInstance(map);
    }, [map]);
    return null;
  };

  const handleClusterClick = useCallback((cluster: Cluster) => {
    if (!mapInstance) return;

    const bounds = new google.maps.LatLngBounds();
    cluster.postIds.forEach(id => {
      const post = DUMMY_POSTS.find(p => p.id === id);
      if (post) bounds.extend({ lat: post.lat, lng: post.lng });
    });

    const targetCenter = bounds.getCenter();
    const startCenter = mapInstance.getCenter()!;
    const startZoom = mapInstance.getZoom() || 0;
    
    // 타겟 줌 설정
    const targetZoom = Math.min(startZoom + 3.5, 17); 
    const duration = 1000; // 1초 동안 부드럽게 이동
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      // 위도, 경도, 줌을 동시에 보간
      const lat = startCenter.lat() + (targetCenter.lat() - startCenter.lat()) * easeProgress;
      const lng = startCenter.lng() + (targetCenter.lng() - startCenter.lng()) * easeProgress;
      const zoom = startZoom + (targetZoom - startZoom) * easeProgress;

      mapInstance.moveCamera({
        center: { lat, lng },
        zoom: zoom
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [mapInstance]);

  const handleBoundsChange = useCallback((map: google.maps.Map) => {
    const bounds = map.getBounds();
    if (!bounds) return;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // Calculate meters per pixel
    // Width of the map in meters
    const widthInMeters = google.maps.geometry.spherical.computeDistanceBetween(
      sw,
      new google.maps.LatLng(sw.lat(), ne.lng())
    );
    
    const mapDiv = map.getDiv();
    const widthInPixels = mapDiv.offsetWidth;
    const metersPerPixel = widthInMeters / widthInPixels;

    // Clustering threshold (e.g., 40px diameter)
    const thresholdMeters = metersPerPixel * 40;

    // Simple Union-Find based clustering on client-side for demo
    const results = performClustering(DUMMY_POSTS, thresholdMeters);
    setClusters(results);
  }, []);

  const performClustering = (posts: typeof DUMMY_POSTS, threshold: number): Cluster[] => {
    const parent = Array.from({ length: posts.length }, (_, i) => i);
    
    function find(i: number): number {
      if (parent[i] === i) return i;
      return parent[i] = find(parent[i]);
    }

    function union(i: number, j: number) {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) parent[rootI] = rootJ;
    }

    // Compare all pairs
    for (let i = 0; i < posts.length; i++) {
      for (let j = i + 1; j < posts.length; j++) {
        const dist = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(posts[i].lat, posts[i].lng),
          new google.maps.LatLng(posts[j].lat, posts[j].lng)
        );
        if (dist <= threshold) {
          union(i, j);
        }
      }
    }

    // Grouping
    const groups: Record<number, number[]> = {};
    for (let i = 0; i < posts.length; i++) {
      const root = find(i);
      if (!groups[root]) groups[root] = [];
      groups[root].push(i);
    }

    return Object.values(groups).map((indices) => {
      const groupPosts = indices.map(idx => posts[idx]);
      const avgLat = groupPosts.reduce((sum, p) => sum + p.lat, 0) / groupPosts.length;
      const avgLng = groupPosts.reduce((sum, p) => sum + p.lng, 0) / groupPosts.length;

      return {
        id: `cluster-${indices.join("-")}`,
        lat: avgLat,
        lng: avgLng,
        count: indices.length,
        postIds: indices.map(idx => posts[idx].id)
      };
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      <Navbar variant="transparent" />

      {/* Main Map Container */}
      <div className="absolute inset-0">
        {GOOGLE_MAPS_API_KEY ? (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["geometry"]}>
            <Map
              defaultCenter={{ lat: 37.5665, lng: 126.9780 }}
              defaultZoom={13}
              mapId="DEMO_MAP_ID"
              disableDefaultUI={true}
              className="w-full h-full"
            >
              <MapHandler onBoundsChange={handleBoundsChange} />
              <MapInstanceGetter />
              
              {clusters.map((cluster) => (
                <AdvancedMarker
                  key={cluster.id}
                  position={{ lat: cluster.lat, lng: cluster.lng }}
                  onClick={() => {
                    if (cluster.count === 1) {
                      const post = DUMMY_POSTS.find(p => p.id === cluster.postIds[0]);
                      setSelectedPost(post);
                    } else {
                      handleClusterClick(cluster);
                    }
                  }}
                >
                  {cluster.count > 1 ? (
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-10 h-10 bg-[var(--accent)] rounded-full animate-pulse opacity-50" />
                      <div className="relative w-8 h-8 bg-[var(--accent)] rounded-full border-2 border-black flex items-center justify-center shadow-lg">
                        <span className="text-black font-bold text-xs">{cluster.count}</span>
                      </div>
                    </div>
                  ) : (
                    <Pin background={"var(--accent)"} borderColor={"black"} glyphColor={"black"} />
                  )}
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
            </p>
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
