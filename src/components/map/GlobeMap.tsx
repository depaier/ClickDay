"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Post {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  image_url?: string;
  [key: string]: any;
}

interface GlobeMapProps {
  posts: Post[];
  onMarkerClick: (post: Post) => void;
}

export const GlobeMap: React.FC<GlobeMapProps> = ({ posts, onMarkerClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // SVG 핀을 이미지로 변환하여 지도에 등록하는 함수
  const addCustomIcon = (map: maplibregl.Map) => {
    const svgString = `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#F5C518"/>
        <circle cx="16" cy="16" r="6" fill="#0A0A0A"/>
      </svg>
    `;
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      if (!map.hasImage("custom-pin")) {
        map.addImage("custom-pin", img);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: [126.978, 37.5665],
      zoom: 2,
      attributionControl: false,
    });

    map.on("load", () => {
      map.setProjection({ type: "globe" });
      addCustomIcon(map);

      // 스타일 내 누락된 이미지로 인한 콘솔 오류 방지
      map.on("styleimagemissing", (e) => {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        map.addImage(e.id, canvas.getContext("2d")!.getImageData(0, 0, 1, 1));
      });

      // GeoJSON 소스 추가 (클러스터링 활성화)
      map.addSource("posts", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: posts.map((post) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [post.lng, post.lat] },
            properties: { ...post },
          })),
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // 1. 클러스터 원 레이어
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "posts",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#F5C518", // 10개 미만
            10,
            "#f1f075", // 10~30개
            30,
            "#f28cb1", // 30개 이상
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20, 10, 30, 30, 40
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff"
        },
      });

      // 2. 클러스터 숫자 레이어
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "posts",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count}",
          "text-font": ["Noto Sans Regular"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#000"
        }
      });

      // 3. 개별 마커 레이어 (기존 핀 사용)
      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "posts",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "custom-pin",
          "icon-size": 0.8,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
      });

      // 클릭 이벤트 처리
      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource("posts") as maplibregl.GeoJSONSource;
        const expansionZoom = await source.getClusterExpansionZoom(clusterId);

        map.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: expansionZoom,
        });
      });

      map.on("click", "unclustered-point", (e) => {
        const props = e.features![0].properties as Post;
        onMarkerClick(props);
      });

      // 마우스 커서 변경
      map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));
      map.on("mouseenter", "unclustered-point", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "unclustered-point", () => (map.getCanvas().style.cursor = ""));
    });

    mapRef.current = map;
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // posts 데이터 업데이트 시 소스 갱신
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateData = () => {
      const source = map.getSource("posts") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: posts.map((post) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [post.lng, post.lat] },
            properties: { ...post },
          })),
        });
      }
    };

    if (map.isStyleLoaded()) {
      updateData();
    } else {
      map.once("styledata", updateData);
    }
  }, [posts]);

  return (
    <div ref={mapContainer} className="w-full h-full bg-[#00000A]" />
  );
};
