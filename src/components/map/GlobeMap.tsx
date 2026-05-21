"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, memo } from "react";
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
  onMarkerHover?: (post: Post | null) => void;
  onGroupClick?: (posts: Post[]) => void;
  onMapClick?: () => void;
  highlightedPostId?: string | number | null;
  initialCenter?: [number, number];
  initialZoom?: number;
}


export interface GlobeMapRef {
  flyTo: (center: [number, number], zoom?: number) => void;
}

const GlobeMapComponent = forwardRef<GlobeMapRef, GlobeMapProps>(({ 
  posts, 
  onMarkerClick,
  onMarkerHover,
  onGroupClick,
  onMapClick,
  highlightedPostId,
  initialCenter = [126.978, 37.5665],
  initialZoom = 2
}, ref) => {

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const postsRef = useRef(posts);
  const isSettingUpRef = useRef(false);

  useImperativeHandle(ref, () => ({
    flyTo: (center: [number, number], zoom: number = 10) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center,
          zoom,
          essential: true,
          duration: 2000
        });
      }
    }
  }));
  
  // Update ref when posts change
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  // SVG 핀을 이미지로 변환하여 지도에 등록하는 함수
  const addCustomIcon = (map: maplibregl.Map): Promise<void> => {
    return new Promise((resolve) => {
      if (map.hasImage("custom-pin")) return resolve();
      
      const svgString = `
        <svg width="34" height="42" viewBox="-1 -1 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#F5C518" stroke="#000000" stroke-width="1"/>
          <circle cx="16" cy="16" r="6" fill="#0A0A0A"/>
        </svg>
      `;
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        if (!map || !mapRef.current) return resolve();
        if (map.hasImage("custom-pin")) map.removeImage("custom-pin");
        map.addImage("custom-pin", img);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
  };

  const addHighlightedIcon = (map: maplibregl.Map): Promise<void> => {
    return new Promise((resolve) => {
      if (map.hasImage("highlighted-pin")) return resolve();
      
      // Brighter yellow with a white border
      const svgString = `
        <svg width="34" height="42" viewBox="-1 -1 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#FFD700" stroke="#FFFFFF" stroke-width="1.5"/>
          <circle cx="16" cy="16" r="6" fill="#000000"/>
        </svg>
      `;
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        if (!map || !mapRef.current) return resolve();
        if (map.hasImage("highlighted-pin")) map.removeImage("highlighted-pin");
        map.addImage("highlighted-pin", img);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
  };

  const setupSourceAndLayers = async (map: maplibregl.Map) => {
    if (!map || map.getSource("posts") || isSettingUpRef.current) return;
    isSettingUpRef.current = true;

    try {
      await Promise.all([
        addCustomIcon(map),
        addHighlightedIcon(map)
      ]);

      if (!map || map.getSource("posts")) {
        isSettingUpRef.current = false;
        return;
      }

      // GeoJSON 소스 추가 (클러스터링 활성화)
    map.addSource("posts", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: postsRef.current.map((post) => ({
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
          "#F5C518",
          10,
          "#f1f075",
          30,
          "#f28cb1",
        ],
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20, 10, 30, 30, 40
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
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
        "text-size": 12,
        "text-anchor": "center",
        "text-justify": "center",
        "text-offset": [0, 0],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
        "text-pitch-alignment": "viewport",
        "text-rotation-alignment": "viewport",
      },
      paint: {
        "text-color": "#000",
      }
    });

    // 3. 개별 마커 레이어
    map.addLayer({
      id: "unclustered-point",
      type: "symbol",
      source: "posts",
      filter: [
        "all",
        ["!", ["has", "point_count"]],
        ["!=", ["get", "id"], highlightedPostId || ""]
      ],
      layout: {
        "icon-image": "custom-pin",
        "icon-size": 0.8,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
      },
    });

    // 4. 강조된 마커 레이어
    map.addLayer({
      id: "highlighted-point",
      type: "symbol",
      source: "posts",
      filter: ["==", ["get", "id"], highlightedPostId || ""],
      layout: {
        "icon-image": "highlighted-pin",
        "icon-size": 1.1,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      paint: {
        "icon-opacity": 1,
      }
    });

    // 클릭 이벤트 처리
    map.on("click", "clusters", async (e) => {
      // Prevent the click from bubbling to the map
      (e as any)._defaultPrevented = true;
      
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
      // Prevent the click from bubbling to the map
      (e as any)._defaultPrevented = true;
      
      const currentZoom = map.getZoom();
      
      // 주변 마커 검색 (20px 반경) - 줌 레벨이 14보다 클 때만 작동
      if (currentZoom > 14 && onGroupClick) {
        const bbox: [maplibregl.PointLike, maplibregl.PointLike] = [
          [e.point.x - 20, e.point.y - 20],
          [e.point.x + 20, e.point.y + 20],
        ];
        
        const nearbyFeatures = map.queryRenderedFeatures(bbox, {
          layers: ["unclustered-point"],
        });

        if (nearbyFeatures.length > 1) {
          const groupPosts = nearbyFeatures.map(f => {
            const props = f.properties as Post;
            return postsRef.current.find(p => p.id.toString() === props.id.toString()) || props;
          });
          onGroupClick(groupPosts as Post[]);
          return;
        }
      }

      // 줌 레벨이 낮거나 주변에 마커가 없으면 단일 클릭으로 처리
      const props = e.features![0].properties as Post;
      const originalPost = postsRef.current.find(p => p.id.toString() === props.id.toString());
      onMarkerClick(originalPost || props);
    });

    // 지도 빈 곳 클릭 처리
    map.on("click", (e) => {
      if ((e as any)._defaultPrevented) return;
      
      // Check if we clicked on any interactive layer
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters", "unclustered-point"]
      });
      
      if (features.length === 0 && onMapClick) {
        onMapClick();
      }
    });


    // 마우스 커서 및 호버 이벤트 처리
    map.on("mouseenter", "unclustered-point", (e) => {
      map.getCanvas().style.cursor = "pointer";
      if (onMarkerHover) {
        const props = e.features![0].properties as Post;
        const originalPost = postsRef.current.find(p => p.id.toString() === props.id.toString());
        onMarkerHover(originalPost || props);
      }
    });
    
    map.on("mouseleave", "unclustered-point", () => {
      map.getCanvas().style.cursor = "";
      if (onMarkerHover) {
        onMarkerHover(null);
      }
    });

    map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));
    
      isSettingUpRef.current = false;
      // VERY IMPORTANT: Apply any data that arrived while we were waiting for images!
      updateData();
    } catch (error) {
      console.error("GlobeMap: Error setting up layers and sources:", error);
      isSettingUpRef.current = false;
    }
  };

  const updateData = () => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource("posts") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features: postsRef.current.map((post) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [post.lng, post.lat] },
          properties: { ...post },
        })),
      });
    } else {
      if (!map.isStyleLoaded()) {
        // 스타일이 로드되지 않았으면 로드될 때까지 기다림
        map.once("styledata", updateData);
        return;
      }
      setupSourceAndLayers(map);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: false,
      fadeDuration: 0,
      localIdeographFontFamily: "'Noto Sans KR', sans-serif",
      transformRequest: (url, resourceType) => {
        // 폰트(Glyphs) 요청 시 에러가 나는 OpenFreeMap 폰트 주소를 기본 MapLibre 폰트로 가로채서 우회
        if (resourceType === 'Glyphs' && url.includes('tiles.openfreemap.org/fonts')) {
          const rangeMatch = url.match(/\/([^/]+)\.pbf$/);
          const range = rangeMatch ? rangeMatch[1] : '0-255';
          return {
            url: `https://demotiles.maplibre.org/font/Open%20Sans%20Regular/${range}.pbf`
          };
        }
        return { url };
      }
    });

    // 스타일 이미지 오류 방지 (load 전 미리 등록)
    map.on("styleimagemissing", (e) => {
      if (e.id === "custom-pin" || e.id === "highlighted-pin") return;
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      map.addImage(e.id, canvas.getContext("2d")!.getImageData(0, 0, 1, 1));
    });

    map.on("load", () => {
      map.setProjection({ type: "globe" });
      setupSourceAndLayers(map);
    });

    mapRef.current = map;
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // posts 데이터 업데이트 시 소스 갱신
  useEffect(() => {
    updateData();
  }, [posts]);

  // 강조된 마커 업데이트
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      if (map.getLayer("highlighted-point")) {
        map.setFilter("highlighted-point", ["==", ["get", "id"], highlightedPostId || ""]);
      }
      if (map.getLayer("unclustered-point")) {
        map.setFilter("unclustered-point", [
          "all",
          ["!", ["has", "point_count"]],
          ["!=", ["get", "id"], highlightedPostId || ""]
        ]);
      }
    }
  }, [highlightedPostId]);

  return (
    <div ref={mapContainer} className="w-full h-full bg-[var(--bg-primary)]" />
  );
});

GlobeMapComponent.displayName = "GlobeMap";

export const GlobeMap = memo(GlobeMapComponent);

GlobeMap.displayName = "GlobeMap";
