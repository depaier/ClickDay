import Link from "next/link";
import { MapPin } from "lucide-react";

export default function BookmarksPage() {
  return (
    <div>
      <div className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-heading tracking-[0.2em] uppercase">Saved Spots</h1>
        <p className="text-gray-400 mt-2">Locations and photos you've saved</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map((item) => (
          <Link href={`/posts/${item}`} key={item} className="group cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#222]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80&sig=${item}`} 
                alt="Saved post" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="font-heading tracking-wider uppercase text-lg">Saved Location</h3>
                <div className="flex items-center text-gray-300 text-sm mt-2">
                  <MapPin className="w-4 h-4 mr-1 text-[var(--accent)]" />
                  Seoul, Korea
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
