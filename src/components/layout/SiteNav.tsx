"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNav() {
  const pathname = usePathname() ?? "";
  const homeActive = pathname === "/" || pathname === "";
  const matchesActive = pathname.startsWith("/matches");

  const navLink = (active: boolean) =>
    [
      "text-sm transition-colors",
      active
        ? "font-semibold text-white"
        : "font-medium text-white/80 hover:text-white",
    ].join(" ");

  return (
    <header className="border-b border-white/15 bg-[#396BF6] shadow-sm shadow-black/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2 sm:px-5 sm:py-2">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-white/95 transition-colors hover:text-white sm:text-base"
        >
          내전.GG
        </Link>
        <nav
          className="flex items-center gap-5 sm:gap-6"
          aria-label="주요 메뉴"
        >
          <Link href="/" className={navLink(homeActive)}>
            홈
          </Link>
          <Link href="/matches" className={navLink(matchesActive)}>
            전적
          </Link>
        </nav>
      </div>
    </header>
  );
}
