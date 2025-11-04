"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { WalletButton } from "@/components/wallet/wallet-button";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
  contentClassName?: string;
};

const DESKTOP_BREAKPOINT = 1024;

export function PageShell({
  title,
  subtitle,
  children,
  rightSlot,
  contentClassName,
}: PageShellProps) {
  // Always start with false to ensure server/client match
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted and initialize based on actual window size
    setMounted(true);
    const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    setIsDesktop(desktop);
    setSidebarOpen(desktop);

    const handleResize = () => {
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const mainClasses = cn(
    "ml-0 flex-1 space-y-8 pb-10 pt-8 transition-[margin] duration-300",
    "px-6 lg:px-12 xl:px-14",
    {
      "lg:ml-[18rem]": sidebarOpen && isDesktop,
      "lg:ml-0": !(sidebarOpen && isDesktop),
    },
    contentClassName
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav
        open={sidebarOpen}
        onToggle={toggleSidebar}
        isDesktop={isDesktop}
      />
      {sidebarOpen && !isDesktop && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}
      <main className={mainClasses}>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-2xl bg-zinc-900/70 text-white transition hover:bg-zinc-800"
              onClick={toggleSidebar}
              aria-label="Toggle navigation"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
              {subtitle ? (
                <p className="text-muted-foreground capitalize">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {rightSlot ?? <WalletButton />}
        </header>

        {children}
      </main>
    </div>
  );
}
