"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ACTIVE = "#F28BA8";
const MUTED  = "#C4ACB4";

const tabs: { href: string; label: string; match?: string[]; icon: (active: boolean) => React.ReactNode }[] = [
  {
    href: "/",
    label: "首页",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"
        stroke={active ? ACTIVE : MUTED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12L12 3l9 9" />
        <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
      </svg>
    ),
  },
  {
    href: "/news",
    label: "新闻",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"
        stroke={active ? ACTIVE : MUTED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" />
        <path d="M17 20v-8H7v8M7 8h3" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "研报",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"
        stroke={active ? ACTIVE : MUTED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    href: "/space",
    label: "日记",
    // 心情日记、成长记录和解锁页都属于"日记"
    match: ["/space", "/record", "/mood", "/unlock"],
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"
        stroke={active ? ACTIVE : MUTED} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5V5a2 2 0 012-2h13v16H6.5A2.5 2.5 0 004 21.5v-2z" />
        <path d="M4 19.5A2.5 2.5 0 016.5 17H19M9 7h6" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,248,246,0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(249,216,228,0.6)",
        boxShadow: "0 -4px 24px rgba(242,139,168,0.08)",
      }}
    >
      <div className="max-w-lg mx-auto flex h-16 items-end pb-2">
        {tabs.map((tab) => {
          const active = (tab.match ?? [tab.href]).some((p) => p === "/" ? pathname === "/" : pathname.startsWith(p));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-1 transition-opacity active:opacity-60"
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? ACTIVE : MUTED }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
