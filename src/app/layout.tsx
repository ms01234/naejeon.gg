import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
import "./globals.css";

const PRETENDARD_GOV_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov-dynamic-subset.min.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://naejeon-gg.vercel.app";

const ogImagePath = "/og-image.png?v=5";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "내전.gg",
  description: "내전 전적 사이트",
  icons: {
    icon: [
      { url: "/icon.png?v=2", href: "/icon.png?v=2" },
      { url: "/favicon.ico?v=2", href: "/favicon.ico?v=2" },
    ],
    apple: "/icon.png?v=2",
  },
  openGraph: {
    title: "내전.gg",
    description: "내전 전적 사이트",
    url: siteUrl,
    siteName: "내전.gg",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: "내전.gg 로고",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "내전.gg",
    description: "내전 전적 사이트",
    images: [ogImagePath],
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
        <link rel="icon" href="/icon.png?v=2" type="image/png" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="apple-touch-icon" href="/icon.png?v=2" />
      </head>
      <body className="flex min-h-full flex-col font-sans font-normal leading-relaxed">
        <SiteNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
