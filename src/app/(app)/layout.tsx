import { Navbar } from "@/components/layout/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      <Navbar variant="sticky" />
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
