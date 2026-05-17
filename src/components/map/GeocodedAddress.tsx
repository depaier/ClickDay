"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../providers/LanguageProvider";

interface GeocodedAddressProps {
  latitude?: number;
  longitude?: number;
  className?: string;
  fallback?: string | null;
}

const memoryCache = new Map<string, string>();

export function GeocodedAddress({ latitude, longitude, className, fallback }: GeocodedAddressProps) {
  const { language } = useLanguage();
  // 1. 초기값으로 DB에 저장된 fallback을 즉시 렌더링하여 로딩 지연 0초 달성
  const [address, setAddress] = useState<string | null>(fallback || null);

  useEffect(() => {
    if (fallback) setAddress(fallback);
  }, [fallback]);

  useEffect(() => {
    if (!latitude || !longitude) return;

    const cacheKey = `${latitude},${longitude},${language}`;
    
    // 2. 메모리 캐시 확인
    if (memoryCache.has(cacheKey)) {
      setAddress(memoryCache.get(cacheKey)!);
      return;
    }

    // 3. 로컬 스토리지 캐시 확인 (브라우저 재접속 시에도 API 호출 0건 유지)
    try {
      const cached = localStorage.getItem(`geo_${cacheKey}`);
      if (cached) {
        memoryCache.set(cacheKey, cached);
        setAddress(cached);
        return;
      }
    } catch (e) {}

    // 4. 백그라운드에서 조용히 다국어 주소 변환 (SWR 패턴)
    const fetchAddress = async () => {
      try {
        const acceptLang = language === "ko" ? "ko" : "en";
        let detected = "";

        // 1차: Nominatim API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=${acceptLang}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const country = data.address.country;
              const province = data.address.province || data.address.state || data.address.region;
              const city = data.address.city || data.address.town || data.address.borough || data.address.county;
              const suburb = data.address.suburb || data.address.quarter || data.address.neighbourhood;

              const parts = [];
              if (country) parts.push(country);
              if (province && province !== country) parts.push(province);
              if (city && city !== province) parts.push(city);
              if (suburb && suburb !== city) parts.push(suburb);

              if (parts.length > 0) {
                detected = parts.join(language === "ko" ? " " : ", ");
              }
            }
          }
        } catch (e) {}

        // 2차: BigDataCloud Fallback
        if (!detected) {
          try {
            const bdc = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${acceptLang}`
            );
            if (bdc.ok) {
              const bdcData = await bdc.json();
              const parts = [];
              if (bdcData.countryName) parts.push(bdcData.countryName);
              if (bdcData.principalSubdivision && bdcData.principalSubdivision !== bdcData.countryName) parts.push(bdcData.principalSubdivision);
              if (bdcData.locality && bdcData.locality !== bdcData.principalSubdivision) parts.push(bdcData.locality);
              else if (bdcData.city && bdcData.city !== bdcData.principalSubdivision) parts.push(bdcData.city);

              if (parts.length > 0) {
                detected = parts.join(language === "ko" ? " " : ", ");
              } else {
                detected = bdcData.countryName || "";
              }
            }
          } catch (e) {}
        }

        if (detected) {
          memoryCache.set(cacheKey, detected);
          try { localStorage.setItem(`geo_${cacheKey}`, detected); } catch (e) {}
          setAddress(detected);
        }
      } catch (e) {}
    };

    fetchAddress();
  }, [latitude, longitude, language]);

  if (!address) return null;
  return <span className={className}>{address}</span>;
}
