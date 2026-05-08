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

  // 마커 아이콘 이미지 생성 (Canvas)
  const createMarkerImage = () => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 중앙 및 반지름 설정
    const centerX = 32;
    const centerY = 24;
    const radius = 22; // 상단 원의 반지름

    // Pin shape (SVG 패스 스타일을 캔버스로 재현)
    ctx.fillStyle = "#F5C518";
    ctx.beginPath();
    
    // 아래쪽 뾰족한 부분 (Tip)
    ctx.moveTo(centerX, 60);
    
    // 왼쪽 곡선 및 상단 원형
    ctx.bezierCurveTo(centerX - 22, 40, centerX - radius, centerY + 10, centerX - radius, centerY);
    ctx.arc(centerX, centerY, radius, Math.PI, 0);
    
    // 오른쪽 곡선
    ctx.bezierCurveTo(centerX + radius, centerY + 10, centerX + 22, 40, centerX, 60);
    
    ctx.fill();

    // 테두리 (약간의 입체감)
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner circle (검은색 점)
    ctx.fillStyle = "#0A0A0A";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
    ctx.fill();

    return ctx.getImageData(0, 0, size, size);
  };

  const updateSource = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("posts")) return;

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: posts.map((post) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [post.lng, post.lat],
        },
        properties: {
          ...post,
        },
      })),
    };

    (map.getSource("posts") as maplibregl.GeoJSONSource).setData(geojson);
  }, [posts]);

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

      // 마커 이미지 등록
      const markerImg = createMarkerImage();
      if (markerImg) {
        map.addImage("marker-pin", markerImg);
      }

      // 소스 등록 (클러스터링 활성화)
      map.addSource("posts", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // 클러스터 원형 레이어
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "posts",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#F5C518",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            10,
            25,
            30,
            30
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#000"
        }
      });

      // 클러스터 카운트 숫자 레이어
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "posts",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Noto Sans Bold"],
          "text-size": 12
        },
        paint: {
          "text-color": "#0A0A0A"
        }
      });

      // 개별 마커 레이어
      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "posts",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "marker-pin",
          "icon-size": 0.5,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true
        }
      });

      // 상호작용: 클러스터 클릭 시 확대
      map.on("click", "clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource("posts") as maplibregl.GeoJSONSource;
        const expansionZoom = await source.getClusterExpansionZoom(clusterId);

        map.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: expansionZoom,
          duration: 800
        });
      });

      // 상호작용: 개별 마커 클릭
      map.on("click", "unclustered-point", (e) => {
        const props = e.features?.[0].properties as Post;
        if (props) onMarkerClick(props);
      });

      // 마우스 커서 변경
      map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "unclustered-point", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "unclustered-point", () => { map.getCanvas().style.cursor = ""; });

      updateSource();
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMarkerClick, updateSource]);

  useEffect(() => {
    updateSource();
  }, [posts, updateSource]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ background: "#00000A" }}
    />
  );
};
