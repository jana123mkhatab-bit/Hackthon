import type { ReactNode } from "react";
import { Sidebar } from "@/components/app/sidebar";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { Topbar } from "@/components/app/topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-warm">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-5 pb-28 pt-5 md:px-10 md:pt-8 lg:pb-12">
          <div className="mx-auto w-full max-w-[1160px]">{children}</div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
