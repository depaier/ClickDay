import { MapPin, Heart, Bookmark, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PostDetailPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
      {/* Image Section */}
      <div className="bg-[#111] flex items-center justify-center min-h-[60vh] lg:min-h-[80vh] p-4 relative group rounded-sm border border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80" 
          alt="Post detail" 
          className="max-w-full max-h-[80vh] object-contain"
        />
        
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="bg-black/50 border-none rounded-full w-10 h-10 backdrop-blur-md">
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-black/50 border-none rounded-full w-10 h-10 backdrop-blur-md">
            <Bookmark className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-8">
        {/* User Info & Actions */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800" />
            <div>
              <div className="font-heading tracking-wider uppercase text-sm">@photographer</div>
              <div className="text-gray-500 text-xs">2 hours ago</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-8">Follow</Button>
        </div>

        {/* Description */}
        <div>
          <h1 className="text-xl font-heading tracking-wider uppercase mb-2">Seoul City Night</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Captured this amazing view from the top of the mountain. The lights of the city feel like stars on earth.
          </p>
          <div className="flex gap-2 text-sm text-[var(--accent)] font-mono">
            <span>#seoul</span>
            <span>#nightscape</span>
            <span>#city</span>
          </div>
        </div>

        {/* Exif Info */}
        <div className="bg-[#111] p-6 space-y-4 text-sm border border-white/5 rounded-sm">
          <h3 className="font-heading tracking-wider uppercase flex items-center mb-4 text-[var(--accent)] text-xs">
            <Camera className="w-4 h-4 mr-2" />
            EXIF Data
          </h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Camera</div>
              <div>Sony ILCE-7M4</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Lens</div>
              <div>FE 24-70mm F2.8 GM</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Aperture</div>
              <div>f/2.8</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Shutter</div>
              <div>1/250s</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">Focal Length</div>
              <div>35mm</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs uppercase tracking-widest mb-1">ISO</div>
              <div>ISO 400</div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-[#111] p-6 text-sm border border-white/5 rounded-sm">
          <h3 className="font-heading tracking-wider uppercase flex items-center mb-4 text-[var(--accent)] text-xs">
            <MapPin className="w-4 h-4 mr-2" />
            Location
          </h3>
          <div>Seoul, Jongno-gu</div>
          <div className="mt-4 bg-[#222] h-[150px] flex items-center justify-center text-gray-500 border border-white/5 rounded-sm">
            Map View
          </div>
        </div>
      </div>
    </div>
  );
}
