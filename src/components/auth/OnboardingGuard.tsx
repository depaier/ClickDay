"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user is logged in but not onboarded, and not already on the onboarding page
    if (!loading && user && profile && !profile.onboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [user, profile, loading, pathname, router]);

  return <>{children}</>;
}
