import { MetadataRoute } from 'next';
import { mangaDatabase } from '../data'; // Sesuaikan path menuju file data.ts milikmu

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://komikaggy.vercel.app'; // Ganti sesuai domain Vercel kamu

  // Halaman Statis
  const routes = ['', '/komik'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  // Halaman Dinamis Komik
  const mangaRoutes = mangaDatabase.map((manga) => ({
    url: `${baseUrl}/manga/${manga.id}`,
    lastModified: new Date(),
  }));

  return [...routes, ...mangaRoutes];
}