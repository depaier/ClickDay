import Link from "next/link";
import { MapPin } from "lucide-react";
import { MasonryGrid } from "@/components/layout/MasonryGrid";


export default function BookmarksPage() {
  return (
    <div>
      <div className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-heading tracking-[0.2em] uppercase">Saved Spots</h1>
        <p className="text-gray-400 mt-2">Locations and photos you've saved</p>
      </div>

      <MasonryGrid>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <Link href={`/posts/${item}`} key={item} className="group cursor-pointer block mb-6">
            <div className="relative overflow-hidden bg-[#222] rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80&sig=${item}`} 
                alt="Saved post" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 block"
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
      </MasonryGrid>

    </div>
  );
}
