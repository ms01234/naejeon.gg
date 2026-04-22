import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
import "./globals.css";

const PRETENDARD_GOV_CSS =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-gov-dynamic-subset.min.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://naejeon-gg.vercel.app";

const ogImageAbs = `${siteUrl}/og-image.png?v=7`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "내전.GG",
  description: "",
  icons: {
    icon: "/icon.png?v=7",
  },
  openGraph: {
    title: "내전.GG",
    description: "",
    url: siteUrl,
    images: [
      {
        url: ogImageAbs,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary",
    images: [ogImageAbs],
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
        <link rel="icon" href="/icon.png?v=7" type="image/png" />
      </head>
      <body className="flex min-h-full flex-col font-sans font-normal leading-relaxed">
        <SiteNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
