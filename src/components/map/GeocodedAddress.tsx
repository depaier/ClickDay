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
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=${acceptLang}`,
          { headers: { "User-Agent": "ClickDay Application" } }
        );
        
        if (!response.ok) throw new Error("API error");
        
        const data = await response.json();
        if (data && data.address) {
          const country = data.address.country;
          const province = data.address.province || data.address.state || data.address.region;
          const cityName = data.address.city || data.address.town || data.address.borough || data.address.county;
          const suburb = data.address.suburb || data.address.quarter || data.address.neighbourhood;
          
          let result = "";
          if (language === "ko") {
            const parts = [];
            if (province && province !== country) parts.push(province);
            if (cityName && cityName !== province) parts.push(cityName);
            if (suburb && suburb !== cityName) parts.push(suburb);
            
            // fallback to country if nothing else exists
            if (parts.length === 0 && country) parts.push(country);
            result = parts.join(" ");
          } else {
            const parts = [];
            if (suburb) parts.push(suburb);
            if (cityName && cityName !== suburb) parts.push(cityName);
            if (province && province !== cityName && province !== country) parts.push(province);
            
            if (parts.length === 0 && country) parts.push(country);
            else if (country) parts.push(country);
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
