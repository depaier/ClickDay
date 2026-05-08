"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface LocationPickerModalProps {
  onClose: () => void;
  onSave: (loc: { lat: number; lng: number }) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ onClose, onSave }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [currentCenter, setCurrentCenter] = useState({ lat: 37.5665, lng: 126.978 });

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: [currentCenter.lng, currentCenter.lat],
      zoom: 15,
      attributionControl: false,
    });

    map.on("load", () => {
      map.setProjection({ type: "globe" });
      map.resize();

      // 사용자 현재 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.jumpTo({ center: [longitude, latitude] });
            setCurrentCenter({ lat: latitude, lng: longitude });
          },
          (err) => console.log("Geolocation blocked or failed:", err)
        );
      }
    });

    // 지도가 움직일 때마다 중앙 좌표 업데이트
    map.on("move", () => {
      const center = map.getCenter();
      setCurrentCenter({ lat: center.lat, lng: center.lng });
    });

    // 스타일 이미지 오류 방지
    map.on("styleimagemissing", (e) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      map.addImage(e.id, canvas.getContext("2d")!.getImageData(0, 0, 1, 1));
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  const handleSave = () => {
    onSave(currentCenter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[80vh] bg-[#0A0A0A] border border-white/10 rounded-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#111]">
          <h3 className="font-heading tracking-widest uppercase text-sm">Select Location</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full" />
          
          {/* 중앙 고정 마커 (SVG) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-[40px]">
            <div className="relative transform transition-transform active:scale-110">
              <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#F5C518"/>
                <circle cx="16" cy="16" r="6" fill="#0A0A0A"/>
              </svg>
              {/* 그림자 효과 */}
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[2px] w-2 h-1 bg-black/40 rounded-full blur-[1px]" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#111] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Confirm Location</Button>
        </div>
      </div>
    </div>
  );
};
