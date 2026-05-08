"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/constants/translations";

const DUMMY_FEED = [
  { id: 1, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80", title: "Seoul City", location: "Seoul, Korea" },
  { id: 2, image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80", title: "Namsan Tower", location: "Seoul, Korea" },
  { id: 3, image: "https://images.unsplash.com/photo-1538681105587-85640961bf8b?auto=format&fit=crop&w=800&q=80", title: "Gyeongbokgung", location: "Seoul, Korea" },
  { id: 4, image: "https://images.unsplash.com/photo-1588602058473-b67ec1655979?auto=format&fit=crop&w=800&q=80", title: "Han River", location: "Seoul, Korea" },
  { id: 5, image: "https://images.unsplash.com/photo-1598509524136-421ebba06d9a?auto=format&fit=crop&w=800&q=80", title: "Busan Beach", location: "Busan, Korea" },
  { id: 6, image: "https://images.unsplash.com/photo-1563514757348-73595eb9170e?auto=format&fit=crop&w=800&q=80", title: "Jeju Island", location: "Jeju, Korea" },
];

export default function FeedPage() {
  const { language } = useLanguage();
  const t = translations[language].feed;

  return (
    <div>
      <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-heading tracking-[0.2em] uppercase">{t.title}</h1>
          <p className="text-gray-400 mt-2">{t.subtitle}</p>
        </div>
        <div className="flex gap-4 font-heading tracking-widest text-sm uppercase">
          <button className="text-[var(--accent)] border-b border-[var(--accent)] pb-1">{t.latest}</button>
          <button className="text-gray-500 hover:text-white transition-colors pb-1">{t.popular}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_FEED.map((item) => (
          <Link href={`/posts/${item.id}`} key={item.id} className="group cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#222]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="font-heading tracking-wider uppercase text-lg">{item.title}</h3>
                <div className="flex items-center text-gray-300 text-sm mt-2">
                  <MapPin className="w-4 h-4 mr-1 text-[var(--accent)]" />
                  {item.location}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
