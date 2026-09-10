"use client";

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; 
import { mangaDatabase } from '../../data';

function KomikListContent() {
  const searchParams = useSearchParams();
  const searchURL = searchParams.get('search');

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchURL) {
      setSearchQuery(searchURL);
    }
  }, [searchURL]);

  const reversedMangaDatabase = [...mangaDatabase].reverse();

  const filteredManga = reversedMangaDatabase.filter((manga) =>
    manga.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header Navigasi Atas (Sticky Header) */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 z-10 flex justify-between items-center shadow-md">
        <Link href="/">
          <button className="text-blue-400 hover:text-blue-300 font-medium text-sm md:text-base">Kembali</button>
        </Link>
        <h1 className="text-sm md:text-lg font-bold text-white truncate text-center">
          Semua Komik
        </h1>
        <div className="w-16"></div> {/* Penyeimbang agar judul persis di tengah */}
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <p className="text-gray-400 text-sm md:text-base">Daftar lengkap seluruh koleksi manga, manhua, dan manhwa yang ada di KomiKaggy.</p>
        </header>

        {/* Kolom Pencarian */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Cari judul komik..."
            className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Daftar Seluruh Komik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filteredManga.length > 0 ? (
            filteredManga.map((manga) => {
              const latestChapter = manga.chapters && manga.chapters.length > 0 
                ? manga.chapters[manga.chapters.length - 1] 
                : null;

              return (
                <div key={manga.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 flex flex-col">
                  <Link href={`/manga/${manga.id}`}>
                    <div className="w-full aspect-square bg-black flex items-center justify-center">
                      <img src={manga.image} alt={manga.title} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                    </div>
                  </Link>
                  
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <Link href={`/manga/${manga.id}`}>
                        <h2 className="text-base font-semibold text-blue-400 hover:text-blue-300 transition-colors line-clamp-1">{manga.title}</h2>
                      </Link>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{manga.genre}</p>
                    </div>
                    
                    <div className="mt-4">
                      {latestChapter ? (
                        <Link href={`/manga/${manga.id}/chapter/${latestChapter.chapterId}`}>
                          <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors text-xs">
                            Chapter {latestChapter.chapterId}
                          </button>
                        </Link>
                      ) : (
                        <Link href={`/manga/${manga.id}`}>
                          <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-400 font-medium rounded transition-colors text-xs">
                            Belum ada chapter
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-gray-400 py-10">
              Komik tidak ditemukan!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SemuaKomik() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white p-8 text-center">Memuat komik...</div>}>
      <KomikListContent />
    </Suspense>
  );
}