"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { UploadCloud, Camera, MapPin, X } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";
import exifr from "exifr";
import { UploadMap } from "@/components/map/UploadMap";
import { LocationPickerModal } from "@/components/map/LocationPickerModal";
import { supabase } from "@/lib/supabase/client";
import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@/components/providers/AuthProvider";

interface ExifData {
  make?: string;
  model?: string;
  lens?: string;
  fNumber?: number;
  exposureTime?: string;
  iso?: number;
}

export default function UploadPage() {
  const { language } = useLanguage();
  const t = translations[language].upload;
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifData | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) return;

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    try {
      const data = await exifr.parse(selectedFile, {
        gps: true,
        tiff: true,
      });
      
      if (data) {
        setExif({
          make: data.Make,
          model: data.Model,
          lens: data.LensModel || data.LensInfo,
          fNumber: data.FNumber ? Math.round(data.FNumber * 100) / 100 : undefined,
          exposureTime: data.ExposureTime ? `1/${Math.round(1 / data.ExposureTime)}` : undefined,
          iso: data.ISO,
        });

        const lat = data.latitude;
        const lng = data.longitude;

        if (lat !== undefined && lng !== undefined) {
          setLocation({ lat, lng });
        } else {
          setLocation(null);
        }
      }
    } catch (error) {
      console.error("EXIF parsing error:", error);
      setExif(null);
      setLocation(null);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const resetUpload = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setExif(null);
    setLocation(null);
    setLocationName("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!file || !location || !user) {
      alert("Please select a photo, location, and ensure you are logged in.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. 이미지 업로드
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clickday')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('clickday')
        .getPublicUrl(uploadData.path);

      // 3. DB 데이터 삽입
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Attempting to upload with User ID:", user?.id);
      
      const { error: dbError } = await supabase.from('posts').insert({
        user_id: user.id,
        latitude: location.lat,
        longitude: location.lng,
        location_name: locationName || "",
        image_url: publicUrl,
        camera_model: exif?.model,
        aperture: exif?.fNumber,
        shutter_speed: exif?.exposureTime,
        iso: exif?.iso,
        description: description,
        user_id: user?.id, // 작성자 ID 추가
      });

      if (dbError) throw dbError;

      alert("Post uploaded successfully!");
      resetUpload();
    } catch (error: any) {
      console.error("Upload error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        ...error
      });
      alert(error.message || "Failed to upload post.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-32">
      <h1 className="text-3xl font-heading tracking-[0.2em] uppercase mb-2">{t.title}</h1>
      <p className="text-gray-400 mb-8 border-b border-white/10 pb-6">{t.subtitle}</p>

      {/* Upload Area */}
      {!previewUrl ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-[#111] border border-dashed rounded-sm p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all mb-8 ${
            isDragging ? "border-[var(--accent)] bg-[#151515]" : "border-gray-600 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/jpeg,image/heic,image/png"
            className="hidden"
          />
          <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? "text-[var(--accent)]" : "text-gray-400"}`} />
          <p className="font-heading tracking-widest uppercase mb-2">{t.dragDrop}</p>
          <p className="text-gray-500 text-sm mb-6">{t.browse}</p>
          <Button variant="ghost">{t.selectFile}</Button>
        </div>
      ) : (
        <div className="relative aspect-video w-full bg-[#111] rounded-sm overflow-hidden mb-8 group border border-white/5">
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
          <button
            onClick={resetUpload}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input Fields */}
      <div className={`space-y-6 mb-12 ${!file ? "opacity-50 pointer-events-none" : ""}`}>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">{t.photoTitle}</label>
          <input 
            type="text" 
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Sunset in Seoul"
            className="w-full bg-[#111] border border-white/5 rounded-sm p-4 text-sm focus:border-[var(--accent)] outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">{t.description}</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share your story..."
            className="w-full bg-[#111] border border-white/5 rounded-sm p-4 text-sm focus:border-[var(--accent)] outline-none transition-colors resize-none"
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* EXIF Panel */}
        <div className={!file ? "opacity-50 pointer-events-none" : ""}>
          <h2 className="font-heading tracking-wider uppercase flex items-center mb-4 text-sm">
            <Camera className="w-4 h-4 mr-2 text-[var(--accent)]" />
            {t.exifTitle}
          </h2>
          <div className="bg-[#111] p-6 space-y-4 text-sm border border-white/5">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">{t.camera}</span>
              <span className="text-right">{exif?.model ? `${exif.make} ${exif.model}` : "-"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">{t.lens}</span>
              <span className="text-right">{exif?.lens || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">{t.settings}</span>
              <span className="text-right">
                {exif ? `f/${exif.fNumber} • ${exif.exposureTime}s • ISO ${exif.iso}` : "-"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Location Panel */}
        <div className={!file ? "opacity-50 pointer-events-none" : ""}>
          <h2 className="font-heading tracking-wider uppercase flex items-center mb-4 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-[var(--accent)]" />
            {t.locationTitle}
          </h2>
          <div className="bg-[#111] h-[200px] border border-white/5 relative overflow-hidden">
            {file && (
              <>
                <UploadMap location={location} onLocationChange={setLocation} />
                {!location && (
                  <div 
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:bg-black/40 transition-colors"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <p className="text-white text-sm mb-2">{t.mapPreview}</p>
                    <p className="text-[var(--accent)] text-xs uppercase tracking-tighter italic font-medium">Click to pick location</p>
                  </div>
                )}
              </>
            )}
            {!file && <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">{t.mapPreview}</div>}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {file && (
        <div className="mt-12 flex justify-center">
          <Button 
            className="px-12 py-6 text-lg font-heading tracking-[0.2em] uppercase"
            onClick={handleSubmit}
            disabled={isUploading || !location}
          >
            {isUploading ? "Uploading..." : "Publish Post"}
          </Button>
        </div>
      )}

      {isModalOpen && (
        <LocationPickerModal 
          onClose={() => setIsModalOpen(false)}
          onSave={(loc) => setLocation(loc)}
        />
      )}
    </div>
  );
}
