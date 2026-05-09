"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../providers/LanguageProvider";

interface GeocodedAddressProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export function GeocodedAddress({ latitude, longitude, className }: GeocodedAddressProps) {
  const { language } = useLanguage();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const acceptLang = language === "ko" ? "ko-KR" : "en-US";
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&accept-language=${acceptLang}`,
          {
            headers: {
              'User-Agent': 'ClickDay-App/1.0'
            }
          }
        );
        const data = await response.json();
        if (data && data.address) {
          const { country, city, town, village, state } = data.address;
          const cityName = city || town || village || state;
          
          if (language === "ko") {
            const parts = [];
            if (country) parts.push(country);
            if (cityName) parts.push(cityName);
            setAddress(parts.join(", "));
          } else {
            const parts = [];
            if (cityName) parts.push(cityName);
            if (country) parts.push(country);
            setAddress(parts.join(", "));
          }
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    };

    if (latitude && longitude) {
      fetchAddress();
    }
  }, [latitude, longitude, language]);

  if (!address) return null;

  return <span className={className}>{address}</span>;
}
