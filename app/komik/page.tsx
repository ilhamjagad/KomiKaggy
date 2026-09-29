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
            className="w-full px-6 py-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Daftar Seluruh Komik */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
          {filteredManga.length > 0 ? (
            filteredManga.map((manga) => {
              const latestChapter = manga.chapters && manga.chapters.length > 0 
                ? manga.chapters[manga.chapters.length - 1] 
                : null;

              const flagMap: Record<string, string> = {
                manga: "https://flagcdn.com/w40/jp.png",
                manhwa: "https://flagcdn.com/w40/kr.png",
                manhua: "https://flagcdn.com/w40/cn.png",
              };
              const flagSrc = flagMap[(manga as any).type] || "";

              return (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 flex flex-col block"
                >
                  <div className="w-full aspect-[2/3] bg-black overflow-hidden flex items-center justify-center relative">
                    {flagSrc && (
                      <img
                        src={flagSrc}
                        alt={(manga as any).type}
                        className="absolute top-1.5 right-1.5 w-7 h-5 md:w-8 md:h-5 object-cover rounded-sm border border-white/20 shadow-md bg-black/20"
                      />
                    )}
                    <img src={manga.image} alt={manga.title} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                  </div>
                  
                  <div className="p-2.5 md:p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <h2 className="text-xs md:text-base font-semibold text-blue-400 hover:text-blue-300 transition-colors line-clamp-1">{manga.title}</h2>
                      <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1 line-clamp-1">Status: {manga.status}</p>
                    </div>
                    
                    <div className="mt-2.5 md:mt-4">
                      {latestChapter ? (
                        <div className="w-full py-1.5 md:py-2 bg-blue-600 text-white font-medium rounded-full text-center text-[10px] md:text-xs">
                          Chapter {latestChapter.chapterId}
                        </div>
                      ) : (
                        <div className="w-full py-1.5 md:py-2 bg-gray-700 text-gray-400 font-medium rounded-full text-center text-[10px] md:text-xs">
                          -
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
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