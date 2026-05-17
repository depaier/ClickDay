"use client";

import React from "react";

interface GeocodedAddressProps {
  latitude: number;
  longitude: number;
  className?: string;
  fallback?: string | null;
}

export function GeocodedAddress({ className, fallback }: GeocodedAddressProps) {
  // 외부 API 호출 없이, 데이터베이스에 저장되어 있는 fallback(location_name)을 즉시 렌더링합니다.
  // 이를 통해 API Rate Limit(1초 1회 제한) 문제를 원천 차단하고 무제한 무료 + 초고속 렌더링을 달성합니다.
  if (!fallback) return null;
  return <span className={className}>{fallback}</span>;
}
