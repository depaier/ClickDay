"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface UploadMapProps {
  location: { lat: number; lng: number } | null;
  onLocationChange: (loc: { lat: number; lng: number }) => void;
}

export const UploadMap: React.FC<UploadMapProps> = ({ location, onLocationChange }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // 노란색 핀 이미지 생성 함수 (GlobeMap과 동일 디자인)
  const createMarkerElement = () => {
    const el = document.createElement("div");
    el.innerHTML = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#F5C518"/>
        <circle cx="16" cy="16" r="6" fill="#0A0A0A"/>
      </svg>
    `;
    el.style.cursor = "default";
    return el;
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initialCenter: [number, number] = location 
      ? [location.lng, location.lat] 
      : [126.978, 37.5665];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: initialCenter,
      zoom: location ? 15 : 2,
      attributionControl: false,
      localIdeographFontFamily: "'Noto Sans KR', sans-serif",
    });

    // 스타일 이미지 오류 방지
    map.on("styleimagemissing", (e) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      map.addImage(e.id, canvas.getContext("2d")!.getImageData(0, 0, 1, 1));
    });

    map.on("load", () => {
      // 폰트 에러 방지
      const style = map.getStyle();
      if (style) {
        style.glyphs = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf";
        map.setStyle(style);
      }
      
      map.setProjection({ type: "globe" });
      setTimeout(() => {
        if (mapRef.current) map.resize();
      }, 100);
    });  // 미리보기 지도이므로 클릭 이벤트(위치 변경)는 제거합니다.
    // 위치 수정이 필요할 경우 팝업을 이용하도록 설계합니다.

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // location 변경 시 마커 업데이트 및 지도 이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!location) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([location.lng, location.lat]);
    } else {
      const marker = new maplibregl.Marker({
        element: createMarkerElement(),
        draggable: false, // 드래그 비활성화
        anchor: "bottom"
      })
        .setLngLat([location.lng, location.lat])
        .addTo(map);

      markerRef.current = marker;
    }

    map.flyTo({ 
      center: [location.lng, location.lat], 
      zoom: 15,
      duration: 1000 
    });
    
    map.resize();
  }, [location]);

  return <div ref={mapContainer} className="w-full h-full rounded-sm overflow-hidden" />;
};
