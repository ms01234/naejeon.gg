import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
import {
  SITE_CANONICAL_URL,
  SITE_META_DESCRIPTION_PLACEHOLDER,
  SITE_TITLE,
  siteIconPath,
  siteOgImageAbsoluteUrl,
} from "@/lib/constants";
import "./globals.css";

const PRETENDARD_GOV_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov-dynamic-subset.min.css";

const ogImageUrl = siteOgImageAbsoluteUrl();
const iconPath = siteIconPath();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CANONICAL_URL),
  title: SITE_TITLE,
  description: SITE_META_DESCRIPTION_PLACEHOLDER,
  icons: {
    icon: iconPath,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_META_DESCRIPTION_PLACEHOLDER,
    url: SITE_CANONICAL_URL,
    siteName: SITE_TITLE,
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
    title: SITE_TITLE,
    description: SITE_META_DESCRIPTION_PLACEHOLDER,
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
        <link rel="icon" href={iconPath} type="image/png" />
      </head>
      <body className="flex min-h-full flex-col font-sans font-normal leading-relaxed">
        <SiteNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
