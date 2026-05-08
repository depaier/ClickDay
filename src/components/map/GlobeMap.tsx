"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Post {
  id: number;
  lat: number;
  lng: number;
  title: string;
  image_url?: string;
}

interface GlobeMapProps {
  posts: Post[];
  onMarkerClick: (post: Post) => void;
}

export const GlobeMap: React.FC<GlobeMapProps> = ({ posts, onMarkerClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const handleMarkerClick = useCallback(
    (post: Post) => onMarkerClick(post),
    [onMarkerClick]
  );

  // 마커 추가 함수
  const addMarkers = useCallback(
    (map: maplibregl.Map) => {
      // 기존 마커 전부 제거
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      posts.forEach((post) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 32px;
          height: 40px;
          cursor: pointer;
          transition: transform 0.15s ease;
        `;
        el.innerHTML = `
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#F5C518"/>
            <circle cx="16" cy="16" r="6" fill="#0A0A0A"/>
          </svg>
        `;
        el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.2)"; });
        el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });
        el.addEventListener("click", () => handleMarkerClick(post));

        const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([post.lng, post.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    },
    [posts, handleMarkerClick]
  );

  // 지도 초기화 (한 번만)
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: [126.978, 37.5665],
      zoom: 2,
      attributionControl: false,
    });

    map.on("style.load", () => {
      map.setProjection({ type: "globe" });
      addMarkers(map);
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // posts 변경 시 마커 재렌더링
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      addMarkers(map);
    } else {
      map.once("style.load", () => addMarkers(map));
    }
  }, [posts, addMarkers]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ background: "#00000A" }}
    />
  );
};
