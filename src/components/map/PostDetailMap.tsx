"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { useLanguage } from "../providers/LanguageProvider";

interface PostDetailMapProps {
  latitude: number;
  longitude: number;
}

export const PostDetailMap: React.FC<PostDetailMapProps> = ({ latitude, longitude }) => {
  const { language } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  // 노란색 핀 이미지 생성 함수
  const createMarkerElement = () => {
    const el = document.createElement("div");
    el.innerHTML = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#F5C518"/>
        <circle cx="16" cy="16" r="6" fill="#0A0A0A"/>
      </svg>
    `;
    return el;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: [longitude, latitude],
      zoom: 13,
      attributionControl: false,
      interactive: false,
    });

    map.on("load", () => {
      map.setProjection({ type: "globe" });
      
      new maplibregl.Marker({
        element: createMarkerElement(),
        anchor: "bottom"
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      setTimeout(() => map.resize(), 100);
    });

    mapRef.current = map;

    // 역지오코딩 (Nominatim 이용)
    const fetchAddress = async () => {
      try {
        const acceptLang = language === "ko" ? "ko" : "en";
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${acceptLang}`
        );
        const data = await response.json();
        if (data) {
          const country = data.countryName;
          const cityName = data.city || data.locality || data.principalSubdivision;
          
          if (language === "ko") {
            // 한국어: 대한민국, 서울시
            const parts = [];
            if (country) parts.push(country);
            if (cityName && cityName !== country) parts.push(cityName);
            setAddress(parts.join(", "));
          } else {
            // 영어: Seoul, South Korea
            const parts = [];
            if (cityName && cityName !== country) parts.push(cityName);
            if (country) parts.push(country);
            setAddress(parts.join(", "));
          }
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    };

    fetchAddress();

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [latitude, longitude, language]);

  return (
    <div className="w-full h-full flex flex-col">
      {address && (
        <div className="mb-2 text-white font-medium text-sm">
          {address}
        </div>
      )}
      <div ref={mapContainer} className="flex-1 rounded-sm overflow-hidden border border-white/5" />
    </div>
  );
};
