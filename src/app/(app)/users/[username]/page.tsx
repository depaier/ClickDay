import Link from "next/link";
import { Grid, Bookmark, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UserProfilePage() {
  return (
    <div>
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16 pb-12 border-b border-white/10">
        <div className="w-32 h-32 rounded-full bg-[#222] flex-shrink-0" />
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-2xl font-heading tracking-widest uppercase">@photographer</h1>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8">Edit Profile</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-start gap-8 mb-4 font-heading tracking-wider uppercase text-sm">
            <div><span className="font-bold mr-1">42</span> <span className="text-gray-400">Posts</span></div>
            <div><span className="font-bold mr-1">1,200</span> <span className="text-gray-400">Followers</span></div>
            <div><span className="font-bold mr-1">350</span> <span className="text-gray-400">Following</span></div>
          </div>
          
          <div className="text-gray-300 text-sm max-w-md mx-auto md:mx-0">
            <p className="font-bold text-white mb-1">John Doe</p>
            <p className="mb-2">Landscape & Street Photographer based in Seoul. Sony a7IV.</p>
            <a href="#" className="text-[var(--link-color)] hover:underline">johndoe.com</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-12 font-heading tracking-widest uppercase text-sm border-b border-white/10 mb-8">
        <button className="flex items-center gap-2 pb-4 border-b-2 border-[var(--accent)] text-white">
          <Grid className="w-4 h-4" />
          Posts
        </button>
        <button className="flex items-center gap-2 pb-4 text-gray-500 hover:text-white transition-colors">
          <Bookmark className="w-4 h-4" />
          Saved
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {[1,2,3,4,5,6].map((i) => (
          <Link href={`/posts/${i}`} key={i} className="aspect-square bg-[#111] relative group border border-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80&sig=${i}`}
              alt={`Post ${i}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <span className="font-heading tracking-widest uppercase text-sm text-white drop-shadow-md">View</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
