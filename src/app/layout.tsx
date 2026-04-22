import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
import "./globals.css";

const PRETENDARD_GOV_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov-dynamic-subset.min.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

/**
 * 브라우저가 파비콘을 오래 캐시합니다. `src/app/favicon.ico` 교체 후에도 예전 아이콘이면
 * 이 값만 올려서 새 URL로 강제 갱신하세요. (예: ?v=1 → ?v=2)
 */
const ICON_CACHE_BUST = "1";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "내전.GG",
  description: "5대5 내전 전적 · OP.GG 스타일",
  icons: {
    icon: [
      {
        url: `/favicon.ico?v=${ICON_CACHE_BUST}`,
        sizes: "any",
      },
      {
        url: `/naejeon.png?v=${ICON_CACHE_BUST}`,
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: [{ url: `/favicon.ico?v=${ICON_CACHE_BUST}` }],
    apple: [
      {
        url: `/naejeon.png?v=${ICON_CACHE_BUST}`,
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "내전.GG",
    description: "5대5 내전 전적 · OP.GG 스타일",
    images: [{ url: "/naejeon.png", width: 512, height: 512, alt: "내전.GG" }],
  },
  twitter: {
    card: "summary",
    title: "내전.GG",
    description: "5대5 내전 전적 · OP.GG 스타일",
    images: ["/naejeon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href={PRETENDARD_GOV_CSS}
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans font-normal leading-relaxed">
        <SiteNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
