"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import Image from "next/image";

const hideShell = new Set(["/planner", "/route"]);

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidden = hideShell.has(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!hidden && (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md text-primary shadow-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <a href="/" className="text-lg font-bold flex items-center">
                  <Image
                    src="/travel-itinerary.png"
                    alt="Travel Itinerary Logo"
                    width={300}
                    height={300}
                    className="inline-block mr-2 w-16"
                  />
                  Travel Itinerary
                </a>
              </div>
              <NavBar />
            </div>
          </div>
        </header>
      )}
      {children}
      {!hidden && <Footer />}
    </div>
  );
}
