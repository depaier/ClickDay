import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  if (typeof window === 'undefined') {
    // SSR: always create a fresh instance
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Client: use singleton stored on window to survive Fast Refresh
  if (!(window as any).__supabase_singleton) {
    (window as any).__supabase_singleton = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return (window as any).__supabase_singleton as ReturnType<typeof createBrowserClient>;
};
