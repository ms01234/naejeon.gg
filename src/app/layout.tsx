import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
import "./globals.css";

const PRETENDARD_GOV_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov-dynamic-subset.min.css";

/** 제로 너비 공백 — 메타 설명은 비어 있지 않아 캐시/크롤러가 스킵하기 어렵고, 화면에는 보이지 않음 */
const ZWSP_DESC = "\u200B";

const CANONICAL_SITE = "https://naejeon-gg.vercel.app";
const ogImageUrl = `${CANONICAL_SITE}/og-image.png?v=9`;

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE),
  title: "내전.GG",
  description: ZWSP_DESC,
  icons: {
    icon: "/icon.png?v=9",
  },
  openGraph: {
    title: "내전.GG",
    description: ZWSP_DESC,
    url: CANONICAL_SITE,
    siteName: "내전.GG",
    images: [
      {
        url: ogImageUrl,
        secureUrl: ogImageUrl,
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "내전.GG",
    description: ZWSP_DESC,
    images: [ogImageUrl],
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
        <link rel="icon" href="/icon.png?v=9" type="image/png" />
      </head>
      <body className="flex min-h-full flex-col font-sans font-normal leading-relaxed">
        <SiteNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
