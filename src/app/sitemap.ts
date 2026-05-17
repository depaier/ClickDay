import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://clickday.me";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  try {
    const { data: posts } = await supabase
      .from("posts")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (posts) {
      posts.forEach((post) => {
        routes.push({
          url: `${baseUrl}/posts/${post.id}`,
          lastModified: new Date(post.created_at),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      });
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("username, updated_at")
      .limit(500);

    if (profiles) {
      profiles.forEach((profile) => {
        if (profile.username) {
          routes.push({
            url: `${baseUrl}/users/${profile.username}`,
            lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      });
    }
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return routes;
}
