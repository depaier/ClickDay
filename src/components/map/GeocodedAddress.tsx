"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../providers/LanguageProvider";

interface GeocodedAddressProps {
  latitude: number;
  longitude: number;
  className?: string;
  fallback?: string | null;
}

// Simple in-memory cache for reverse geocoding
const addressCache = new Map<string, string>();

export function GeocodedAddress({ latitude, longitude, className, fallback }: GeocodedAddressProps) {
  const { language } = useLanguage();
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cacheKey = `${latitude},${longitude},${language}`;
    if (addressCache.has(cacheKey)) {
      setAddress(addressCache.get(cacheKey)!);
      return;
    }

    const fetchAddress = async () => {
      try {
        setIsLoading(true);
        const acceptLang = language === "ko" ? "ko" : "en";
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${acceptLang}`
        );
        
        if (!response.ok) throw new Error("API error");
        
        const data = await response.json();
        if (data) {
          const country = data.countryName;
          const cityName = data.city || data.locality || data.principalSubdivision;
          
          let result = "";
          if (language === "ko") {
            const parts = [];
            if (country) parts.push(country);
            if (cityName && cityName !== country) parts.push(cityName);
            result = parts.join(", ");
          } else {
            const parts = [];
            if (cityName && cityName !== country) parts.push(cityName);
            if (country) parts.push(country);
            result = parts.join(", ");
          }
          
          if (result) {
            setAddress(result);
            addressCache.set(cacheKey, result);
          }
        }
      } catch (error) {
        // Silently fail to avoid console noise, fallback will be shown
      } finally {
        setIsLoading(false);
      }
    };

    if (latitude && longitude) {
      fetchAddress();
    }
  }, [latitude, longitude, language]);

  if (!address && !isLoading) return fallback ? <span className={className}>{fallback}</span> : null;
  if (isLoading && !address) return fallback ? <span className={className}>{fallback}</span> : <span className={className}>...</span>;

  return <span className={className}>{address}</span>;
}
