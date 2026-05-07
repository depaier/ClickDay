import React from "react";
import { X, MapPin, Camera, Aperture, Clock, Hash } from "lucide-react";
import { Button } from "../ui/Button";

interface Post {
  id: number;
  lat: number;
  lng: number;
  title: string;
  image_url?: string;
  [key: string]: unknown;
}

interface PostPreviewSheetProps {
  post: Post;
  onClose: () => void;
}

export function PostPreviewSheet({ post, onClose }: PostPreviewSheetProps) {
  if (!post) return null;

  return (
    <div className="absolute right-0 top-[60px] bottom-0 w-full md:w-[400px] bg-white text-black shadow-2xl z-50 transform transition-transform duration-300 translate-x-0 border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="font-heading text-lg font-bold tracking-[0.1em] uppercase">Photo Details</h2>
        <button onClick={onClose} className="p-2 hover:bg-[var(--button-bg-hover)] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-0">
        {/* Photo Area */}
        <div className="w-full h-[300px] bg-black flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={post.image_url || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32"} 
            alt="Photography" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 space-y-8">
          {/* Photographer info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
            <div>
              <p className="font-bold text-sm">@photographer_kr</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed">
            Beautiful sunset shot from the Seoul tower. Used my favorite Fujifilm recipe for these colors.
          </p>

          {/* EXIF Data */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs text-gray-400 tracking-[0.167em] uppercase border-b border-gray-200 pb-2">Camera Settings</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Camera className="w-4 h-4 text-[var(--accent-dark)]" />
                <span>Sony α7 IV</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Aperture className="w-4 h-4 text-[var(--accent-dark)]" />
                <span>FE 24-70mm GM</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="font-bold font-mono text-[10px] w-4 text-center text-[var(--accent-dark)]">F</div>
                <span>f/2.8</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-[var(--accent-dark)]" />
                <span>1/500s</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="font-bold font-mono text-[10px] w-4 text-center text-[var(--accent-dark)]">ISO</div>
                <span>ISO 400</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-[var(--accent-dark)]" />
                <span>Namsan Tower</span>
              </div>
            </div>
          </div>

          {/* Recipe */}
          <div className="space-y-4">
            <h3 className="font-heading text-xs text-gray-400 tracking-[0.167em] uppercase border-b border-gray-200 pb-2">Edit Recipe</h3>
            <div className="bg-[var(--button-bg)] p-4 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">Kodak Portra 400</span>
                <span className="text-xs px-2 py-1 bg-white border border-gray-200 uppercase font-heading">Lightroom</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                <div className="flex justify-between"><span>Exposure</span><span>+0.5</span></div>
                <div className="flex justify-between"><span>Contrast</span><span>-10</span></div>
                <div className="flex justify-between"><span>Highlights</span><span>-20</span></div>
                <div className="flex justify-between"><span>Shadows</span><span>+15</span></div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1"><Hash className="w-3 h-3 mr-1"/>Seoul</span>
            <span className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1"><Hash className="w-3 h-3 mr-1"/>NightScape</span>
            <span className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1"><Hash className="w-3 h-3 mr-1"/>SonyAlpha</span>
          </div>

        </div>

        {/* Action Button */}
        <div className="p-6 sticky bottom-0 bg-white border-t border-gray-100">
          <Button variant="accent" className="w-full h-12 text-sm">Save to Bookmarks</Button>
        </div>
      </div>
    </div>
  );
}
