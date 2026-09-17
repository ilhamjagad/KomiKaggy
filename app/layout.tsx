import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KomiKaggy - Baca Komik, Manga, Manhua & Manhwa Indonesia",
    template: "%s | KomiKaggy",
  },
  description: "KomiKaggy adalah situs baca komik, manga, manhua, dan manhwa Bahasa Indonesia terlengkap, cepat, dan bebas iklan.",
  keywords: [
    "KomiKaggy",
    "komikaggy",
    "baca komik",
    "baca manga",
    "baca manhwa",
    "komik indo",
    "komikaggy vercel",
  ],
  authors: [{ name: "MUHAMMAD ILHAM JAGAD" }],
  verification: {
    google: "zG3YgtO_VUHaIe41NVD1E0xZL2_SAN3_G7F6ZFA5ud0",
  },
  openGraph: {
    title: "KomiKaggy - Baca Komik Online Gratis",
    description: "Situs baca komik, manga, dan manhwa Bahasa Indonesia tanpa iklan yang mengganggu.",
    url: "https://komikaggy.vercel.app",
    siteName: "KomiKaggy",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Schema JSON-LD untuk memandu Google menampilkan nama situs "KomiKaggy"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KomiKaggy",
    "alternateName": ["komikaggy", "Komi Kaggy"],
    "url": "https://komikaggy.vercel.app"
  };

  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}