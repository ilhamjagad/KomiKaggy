import type { Metadata } from "next";

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
  // Tambahkan bagian verification ini
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