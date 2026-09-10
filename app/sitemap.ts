import { MetadataRoute } from 'next';
import { mangaDatabase } from '../data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://komikaggy.vercel.app'; // Sesuaikan URL domain kamu

  // Halaman Statis
  const routes = ['', '/komik'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  // Halaman Detail Komik
  const mangaRoutes = mangaDatabase.map((manga) => ({
    url: `${baseUrl}/manga/${manga.id}`,
    lastModified: new Date(),
  }));

  return [...routes, ...mangaRoutes];
}