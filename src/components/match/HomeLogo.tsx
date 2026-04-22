"use client";

import Image from "next/image";
import Link from "next/link";

import { SITE_PUBLIC_LOGO_PATH } from "@/lib/constants";

export function HomeLogo() {
  return (
    <Link
      href="/"
      prefetch={false}
      onClick={(e) => {
        e.preventDefault();
        window.location.assign("/");
      }}
      className="group inline-flex shrink-0 cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--op-accent)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--op-page)]"
      aria-label="내전.GG 홈 (새로고침)"
    >
      <Image
        src={SITE_PUBLIC_LOGO_PATH}
        alt="내전.GG"
        width={280}
        height={112}
        sizes="112px"
        priority
        className="h-auto w-auto max-w-[104px] rounded-lg object-contain sm:max-w-[120px]"
      />
    </Link>
  );
}
