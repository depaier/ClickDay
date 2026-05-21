import { Navbar } from "@/components/layout/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar variant="sticky" />
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
