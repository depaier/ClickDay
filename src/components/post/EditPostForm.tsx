"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Camera, MapPin, Save, ArrowLeft } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { UploadMap } from "@/components/map/UploadMap";
import { LocationPickerModal } from "@/components/map/LocationPickerModal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import { useAlertStore } from "@/store/useAlertStore";

interface EditPostFormProps {
  post: any;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const tUpload = translations[language].upload;
  const tPost = translations[language].post;
  const tCommon = translations[language].common;
  
  const [locationName, setLocationName] = useState(post.location_name || "");
  const [title, setTitle] = useState(post.title || post.location_name || "");
  const [description, setDescription] = useState(post.description || "");
  const [location, setLocation] = useState({ lat: post.latitude, lng: post.longitude });

  useEffect(() => {
    const fetchAddress = async () => {
      let detectedName = "";
      const acceptLang = language === "ko" ? "ko" : "en";

      // 1. Nominatim API (No custom headers -> Simple GET request, no CORS preflight)
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1&accept-language=${acceptLang}`
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (nomData && nomData.address) {
            const country = nomData.address.country;
            const province = nomData.address.province || nomData.address.state || nomData.address.region;
            const cityName = nomData.address.city || nomData.address.town || nomData.address.borough || nomData.address.county;
            const suburb = nomData.address.suburb || nomData.address.quarter || nomData.address.neighbourhood;

            const parts = [];
            if (country) parts.push(country);
            if (province && province !== country) parts.push(province);
            if (cityName && cityName !== province) parts.push(cityName);
            if (suburb && suburb !== cityName) parts.push(suburb);

            if (parts.length > 0) {
              const separator = language === "ko" ? " " : ", ";
              detectedName = parts.join(separator);
            }
          }
        }
      } catch (e) {
        console.warn("Nominatim fetch failed in edit form, trying BigDataCloud fallback...", e);
      }

      // 2. Fallback to BigDataCloud
      if (!detectedName) {
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lng}&localityLanguage=${acceptLang}`
          );
          if (res.ok) {
            const data = await res.json();
            const parts = [];
            if (data.countryName) parts.push(data.countryName);
            if (data.principalSubdivision && data.principalSubdivision !== data.countryName) parts.push(data.principalSubdivision);
            if (data.locality && data.locality !== data.principalSubdivision) parts.push(data.locality);
            else if (data.city && data.city !== data.principalSubdivision) parts.push(data.city);

            if (parts.length > 0) {
              const separator = language === "ko" ? " " : ", ";
              detectedName = parts.join(separator);
            } else if (data.countryName) {
              detectedName = data.countryName;
            }
          }
        } catch (e) {
          console.warn("BigDataCloud fetch also failed in edit form", e);
        }
      }

      if (detectedName) {
        setLocationName(detectedName);
      }
    };
    if (location.lat !== post.latitude || location.lng !== post.longitude) {
      fetchAddress();
    }
  }, [location, language, post.latitude, post.longitude]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useAlertStore();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: title,
          location_name: locationName,
          description: description,
          latitude: location.lat,
          longitude: location.lng,
        })
        .eq('id', post.id);

      if (error) throw error;

      showToast({
        message: tPost.editSuccess,
        type: "success"
      });
      router.push(`/posts/${post.id}`);
      router.refresh();
    } catch (error: any) {
      showToast({
        message: error.message || tPost.editError,
        type: "error"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading tracking-[0.2em] uppercase mb-2">{tPost.edit}</h1>
        <p className="text-gray-400 mb-8 border-b border-white/10 pb-6">{tPost.editSubtitle}</p>
      </div>

      {/* Image Preview */}
      <div className="relative aspect-video w-full bg-[#111] rounded-sm overflow-hidden border border-white/5">
        <img src={post.image_url} alt="Post" className="w-full h-full object-contain" />
      </div>

      {/* Input Fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">{tUpload.photoTitle}</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#111] border border-white/5 rounded-sm p-4 text-sm focus:border-[var(--accent)] outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">{tUpload.description}</label>
          <textarea 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#111] border border-white/5 rounded-sm p-4 text-sm focus:border-[var(--accent)] outline-none transition-colors resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* EXIF Data */}
        <div>
          <h2 className="font-heading tracking-wider uppercase flex items-center mb-4 text-sm">
            <Camera className="w-4 h-4 mr-2 text-[var(--accent)]" />
            {tUpload.exifTitle}
          </h2>
          <div className="bg-[#111] p-6 space-y-4 text-sm border border-white/5">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">{tUpload.camera}</span>
              <span>{post.camera_model || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">{tPost.aperture}</span>
              <span>{post.aperture ? `f/${post.aperture}` : "-"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">{tPost.shutter}</span>
              <span>{post.shutter_speed || "-"}</span>
            </div>
          </div>
        </div>

        {/* Location Picker */}
        <div>
          <h2 className="font-heading tracking-wider uppercase flex items-center mb-4 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-[var(--accent)]" />
            {tUpload.locationTitle}
          </h2>
          <div className="bg-[#111] h-[200px] border border-white/5 relative overflow-hidden">
            <UploadMap location={location} onLocationChange={setLocation} />
            <div 
              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <p className="text-white text-xs uppercase tracking-tighter">{tPost.clickToChangeLoc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-8 border-t border-white/10">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {tCommon.cancel}
        </Button>
        <Button 
          className="px-12 py-6 text-sm font-heading tracking-[0.2em] uppercase flex items-center gap-2"
          onClick={handleSubmit}
          disabled={isUpdating}
        >
          <Save className="w-4 h-4" /> {isUpdating ? tPost.updating : tPost.save}
        </Button>
      </div>

      {isModalOpen && (
        <LocationPickerModal 
          onClose={() => setIsModalOpen(false)}
          onSave={(loc) => setLocation(loc)}
        />
      )}
    </div>
  );
}
