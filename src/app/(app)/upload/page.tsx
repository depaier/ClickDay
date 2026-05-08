import { Button } from "@/components/ui/Button";
import { UploadCloud, Camera, MapPin } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-heading tracking-[0.2em] uppercase mb-2">Upload Photo</h1>
      <p className="text-gray-400 mb-8 border-b border-white/10 pb-6">Upload your photo. EXIF data will be automatically extracted.</p>

      <div className="bg-[#111] border border-dashed border-gray-600 rounded-sm p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--accent)] hover:bg-[#151515] transition-colors mb-8">
        <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
        <p className="font-heading tracking-widest uppercase mb-2">Drag & Drop</p>
        <p className="text-gray-500 text-sm mb-6">or click to browse from your computer (JPEG/HEIC up to 20MB)</p>
        <Button variant="ghost">Select File</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-50 pointer-events-none">
        <div>
          <h2 className="font-heading tracking-wider uppercase flex items-center mb-4 text-sm">
            <Camera className="w-4 h-4 mr-2 text-[var(--accent)]" />
            Extracted EXIF
          </h2>
          <div className="bg-[#111] p-6 space-y-4 text-sm border border-white/5">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">Camera</span>
              <span>-</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">Lens</span>
              <span>-</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-500">Settings</span>
              <span>-</span>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="font-heading tracking-wider uppercase flex items-center mb-4 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-[var(--accent)]" />
            Location
          </h2>
          <div className="bg-[#111] h-[200px] flex items-center justify-center text-gray-500 text-sm border border-white/5">
            Map Preview (Needs GPS Data)
          </div>
        </div>
      </div>
    </div>
  );
}
