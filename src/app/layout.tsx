import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
import "./globals.css";

const PRETENDARD_GOV_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov-dynamic-subset.min.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "내전.GG",
  description: "5대5 내전 전적 · OP.GG 스타일",
  icons: {
    icon: [{ url: "/naejeon.png", type: "image/png" }],
    apple: [{ url: "/naejeon.png", type: "image/png" }],
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
