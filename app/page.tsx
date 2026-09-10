"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { mangaDatabase } from '../data'; 

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedHistory = localStorage.getItem('komikHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('komikHistory');
    setHistory([]);
  };

  const mangaReadCounts: { [key: string]: number } = {};
  history.forEach((item) => {
    mangaReadCounts[item.id] = (mangaReadCounts[item.id] || 0) + 1;
  });

  const sortedMangaDatabase = [...mangaDatabase].sort((a, b) => {
    const countA = mangaReadCounts[a.id] || 0;
    const countB = mangaReadCounts[b.id] || 0;
    return countB - countA;
  });

  // Tampilkan hanya 5 teratas di beranda
  const popularManga = sortedMangaDatabase.slice(0, 5);

  // Fungsi untuk memfilter komik berdasarkan ketikan
  const filteredLiveSearch = mangaDatabase.filter((manga) =>
    manga.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      {/* Kolom Pencarian dengan Fitur Live Search Dropdown */}
      <div className="max-w-4xl mx-auto mb-8 relative">
        <input
          type="text"
          placeholder="Cari judul komik..."
          className="w-full px-6 py-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            // Tetap bisa pakai Enter jika ingin lihat semua hasil di halaman daftar komik
            if (e.key === 'Enter' && searchQuery.trim() !== "") {
              window.location.href = `/komik?search=${encodeURIComponent(searchQuery)}`;
            }
          }}
        />

        {/* Kotak Hasil Pencarian (Muncul Otomatis saat mengetik) */}
        {searchQuery.trim() !== "" && (
          <div className="absolute top-full left-0 w-full mt-3 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
            {filteredLiveSearch.slice(0, 5).map((manga) => (
              <Link 
                key={manga.id} 
                href={`/manga/${manga.id}`} 
                className="flex items-center p-3 hover:bg-gray-700 border-b border-gray-700/50 last:border-b-0 transition-colors"
              >
                <img src={manga.image} alt={manga.title} className="w-12 h-16 object-cover rounded shadow-sm mr-4" />
                <div className="flex-grow">
                  <h4 className="text-white font-semibold line-clamp-1">{manga.title}</h4>
                  <p className="text-sm text-gray-400 mt-0.5">{manga.genre}</p>
                </div>
              </Link>
            ))}
            
            {/* Pesan jika komik tidak ditemukan */}
            {filteredLiveSearch.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                Komik "{searchQuery}" tidak ditemukan.
              </div>
            )}
            
            {/* Tombol lihat semua jika hasil lebih dari 5 */}
            {filteredLiveSearch.length > 5 && (
              <Link 
                href={`/komik?search=${encodeURIComponent(searchQuery)}`} 
                className="block w-full p-3 text-center text-sm text-blue-400 hover:bg-gray-700 font-medium transition-colors border-t border-gray-700"
              >
                Lihat semua {filteredLiveSearch.length} hasil pencarian...
              </Link>
            )}
          </div>
        )}
      </div>

      <header className="mb-10 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-400 flex justify-center items-center gap-0.5">
          <span>Komi</span>
          <span className="inline-block scale-x-[-1]">K</span>
          <span>aggy</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base leading-relaxed">
          KomiKaggy adalah situs baca komik, baca manga, baca manhua, dan baca manhwa terpopuler dalam Bahasa Indonesia. Tanpa iklan yang mengganggu dan hanya disini kamu cukup scrolling untuk melihat chapter berikutnya, mudah dan tidak ribet.
        </p>
      </header>

      {/* Riwayat Baca */}
      {isMounted && history.length > 0 && (
        <div className="max-w-4xl mx-auto mb-10 bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Terakhir Dibaca
            </h2>
            <button onClick={clearHistory} className="text-sm text-red-400 hover:text-red-300 transition-colors">
              Hapus Riwayat
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {history.map((item, index) => (
              <Link key={index} href={`/manga/${item.id}/chapter/${item.chapterId}`} className="min-w-[120px] max-w-[120px] flex-shrink-0 bg-gray-900 rounded-md overflow-hidden shadow hover:scale-105 transition-transform duration-200">
                <img src={item.image} alt={item.title} className="w-full h-20 object-cover opacity-80 hover:opacity-100" />
                <div className="p-2">
                  <h3 className="text-xs font-bold text-white truncate">{item.title}</h3>
                  <p className="text-xs text-blue-400 mt-1">Chapter {item.chapterId}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Judul Bagian Komik Terpopuler */}
      <div className="max-w-4xl mx-auto mb-4">
        <h3 className="text-2xl font-bold text-white">Komik Terpopuler</h3>
      </div>

      {/* Menampilkan 5 Komik Teratas */}
      <div className="flex flex-col gap-4 max-w-4xl mx-auto">
        {popularManga.map((manga) => {
          const latestChapter = manga.chapters && manga.chapters.length > 0 
            ? manga.chapters[manga.chapters.length - 1] 
            : null;

          return (
            <div key={manga.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:bg-gray-700 transition-colors duration-200 flex flex-row h-48 md:h-56">
              <Link href={`/manga/${manga.id}`} className="flex-shrink-0 h-full">
                <img src={manga.image} alt={manga.title} className="w-32 md:w-40 h-full object-cover hover:opacity-80 transition-opacity" />
              </Link>
              
              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  <Link href={`/manga/${manga.id}`}>
                    <h2 className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors line-clamp-2">{manga.title}</h2>
                  </Link>
                  <p className="text-sm text-gray-400 mt-1">{manga.genre}</p>
                </div>
                
                <div className="mt-auto self-start mt-4">
                  {latestChapter ? (
                    <Link href={`/manga/${manga.id}/chapter/${latestChapter.chapterId}`}>
                      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors text-sm">
                        Chapter {latestChapter.chapterId}
                      </button>
                    </Link>
                  ) : (
                    <Link href={`/manga/${manga.id}`}>
                      <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-400 font-medium rounded transition-colors text-sm">
                        Belum ada chapter
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Tombol Menuju Halaman "Lihat Komik Lainnya" */}
        <div className="text-center mt-6">
          <Link href="/komik">
            <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-blue-400 font-semibold rounded-lg shadow transition-colors">
              Lihat Komik Lainnya
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}