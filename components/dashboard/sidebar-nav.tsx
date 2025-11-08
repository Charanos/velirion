"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Coins,
  Layers,
  LineChart,
  Users,
  Receipt,
  LogOut,
  X,
} from "lucide-react";

const links = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Token", href: "/token", icon: Coins },
  { label: "Presale", href: "/presale", icon: Layers },
  { label: "Staking", href: "/staking", icon: LineChart },
  { label: "DAO", href: "/dao", icon: Users },
  { label: "Transactions", href: "/transactions", icon: Receipt },
];

type SidebarNavProps = {
  open: boolean;
  onToggle: () => void;
  isDesktop: boolean;
};

export function SidebarNav({ open, onToggle, isDesktop }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col justify-between rounded-r-3xl bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950/80 p-8 text-white shadow-2xl transition-transform duration-300 ",
        open ? "translate-x-0" : "-translate-x-[110%]",
        isDesktop ? "" : ""
      )}
    >
      <div className="flex items-center justify-between lg:hidden ">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">
            Velirion
          </p>
          <h2 className="text-2xl font-medium">Testing Hub</h2>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex size-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Close sidebar"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="hidden lg:block">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">
          Velirion
        </p>
        <h2 className="text-2xl font-medium">Testing Hub</h2>
      </div>

      <nav className="mt-6 space-y-2">
        {links.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                  onToggle();
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition font-heading",
                active
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-white/60 hover:bg-white/5 hover:text-white "
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button className="mt-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white">
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}
