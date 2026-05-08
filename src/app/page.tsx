"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PostPreviewSheet } from "@/components/post/PostPreviewSheet";
import { GlobeMap } from "@/components/map/GlobeMap";

// Dummy data for map pins (More dense for clustering test)
const DUMMY_POSTS = [
  { id: 1, lat: 37.5665, lng: 126.9780, title: "Seoul City Hall" },
  { id: 2, lat: 37.5511, lng: 126.9882, title: "Namsan Tower" },
  { id: 3, lat: 37.5796, lng: 126.9770, title: "Gyeongbokgung" },
  { id: 4, lat: 37.5110, lng: 127.0590, title: "COEX" },
  { id: 5, lat: 48.8566, lng: 2.3522, title: "Paris" },
  { id: 6, lat: 40.7128, lng: -74.0060, title: "New York" },
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
    <div className="relative w-full h-screen overflow-hidden bg-[#00000A] text-white">
      <Navbar variant="transparent" />

      {/* Main Map Container */}
      <div className="absolute inset-0">
        <GlobeMap
          posts={DUMMY_POSTS}
          onMarkerClick={setSelectedPost}
        />
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
