"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mangaDatabase } from "../data";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Load history from Firebase (if logged in) or localStorage
  useEffect(() => {
    setIsMounted(true);
    const loadHistory = async () => {
      if (user) {
        try {
          const historyRef = collection(db, "readingHistory", user.uid, "chapters");
          const q = query(historyRef, orderBy("updated_at", "desc"), limit(50));
          const snapshot = await getDocs(q);
          const firebaseHistory = snapshot.docs.map(doc => {
            const d = doc.data() as any;
            return {
              id: d.manga_id || d.id,
              title: d.title,
              image: d.image,
              chapterId: d.chapter_id || d.chapterId,
            };
          });
          setHistory(firebaseHistory);
        } catch (error) {
          console.error("Error loading history from Firebase:", error);
          // Fallback to localStorage
          const savedHistory = localStorage.getItem("komikHistory");
          if (savedHistory) setHistory(JSON.parse(savedHistory));
        }
      } else {
        const savedHistory = localStorage.getItem("komikHistory");
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      }
    };
    loadHistory();
  }, [user]);

  const clearHistory = async () => {
    if (user) {
      // Could implement Firebase clear, for now just localStorage
      localStorage.removeItem("komikHistory");
    } else {
      localStorage.removeItem("komikHistory");
    }
    setHistory([]);
  };

  const mangaReadCounts: { [key: string]: number } = {};
  history.forEach((item) => {
    mangaReadCounts[item.manga_id || item.id] = (mangaReadCounts[item.manga_id || item.id] || 0) + 1;
  });

  const sortedMangaDatabase = [...mangaDatabase].sort((a, b) => {
    const countA = mangaReadCounts[a.id] || 0;
    const countB = mangaReadCounts[b.id] || 0;
    return countB - countA;
  });

  const popularManga = sortedMangaDatabase.slice(0, 5);

  const filteredLiveSearch = mangaDatabase.filter((manga) =>
    manga.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between">
      <main className="p-8">
        <header className="mb-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-400 flex justify-center items-center gap-0.5">
            <span>Komi</span>
            <span className="inline-block scale-x-[-1]">K</span>
            <span>aggy</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base leading-relaxed">
            KomiKaggy adalah situs baca komik, baca manga, baca manhua, dan baca
            manhwa terpopuler dalam Bahasa Indonesia. Tanpa iklan yang mengganggu
            dan hanya disini kamu cukup scrolling untuk melihat chapter
            berikutnya, mudah dan tidak ribet.
          </p>
        </header>

        {/* Kolom Pencarian dengan Fitur Live Search Dropdown + Profile Icon */}
        <div className="max-w-4xl mx-auto mb-8 relative">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Cari judul komik..."
              className="flex-1 px-6 py-4 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim() !== "") {
                  router.push(`/komik?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
            />
            <UserMenu />
          </div>

          {/* Kotak Hasil Pencarian */}
          {searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 w-full mt-3 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              {filteredLiveSearch.slice(0, 5).map((manga) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="flex items-center p-3 hover:bg-gray-700 border-b border-gray-700/50 last:border-b-0 transition-colors"
                >
                  <img
                    src={manga.image}
                    alt={manga.title}
                    className="w-12 h-16 object-cover rounded shadow-sm mr-4"
                  />
                  <div className="flex-grow">
                    <h4 className="text-white font-semibold line-clamp-1">
                      {manga.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-0.5">{manga.genre}</p>
                  </div>
                </Link>
              ))}

              {filteredLiveSearch.length === 0 && (
                <div className="p-4 text-center text-gray-400 text-sm">
                  Komik "{searchQuery}" tidak ditemukan.
                </div>
              )}

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

        {/* Riwayat Baca */}
        {isMounted && history.length > 0 && (
          <div className="max-w-4xl mx-auto mb-10 bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Terakhir Dibaca
              </h2>
              <button
                onClick={clearHistory}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Hapus Riwayat
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {history.map((item, index) => (
                <Link
                  key={index}
                  href={`/manga/${item.id}/chapter/${item.chapterId}`}
                  className="min-w-[120px] max-w-[120px] flex-shrink-0 bg-gray-900 rounded-md overflow-hidden shadow hover:scale-105 transition-transform duration-200"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-20 object-cover opacity-80 hover:opacity-100"
                  />
                  <div className="p-2">
                    <h3 className="text-xs font-bold text-white truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-blue-400 mt-1">
                      Chapter {item.chapterId}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Judul Bagian Komik Terpopuler */}
        <div className="max-w-6xl mx-auto mb-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
            Terpopuler Minggu Ini
          </h3>
          <div className="flex overflow-x-auto snap-x gap-4 pb-4 md:pb-0 md:grid md:grid-cols-5 md:gap-6 scrollbar-thin">
            {popularManga.map((manga, index) => {
              const latestChapter =
                manga.chapters && manga.chapters.length > 0
                  ? manga.chapters[manga.chapters.length - 1]
                  : null;

              return (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:bg-gray-700 transition-all duration-300 flex flex-col w-[170px] flex-shrink-0 snap-start md:w-auto"
                >
                  <div className="relative">
                    <img
                      src={manga.image}
                      alt={manga.title}
                      className="w-full h-48 md:h-60 object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                      #{index + 1}
                    </div>
                    <div className="absolute top-2 right-2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-md">
                      Terpopuler
                    </div>
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h2 className="text-sm md:text-base font-bold text-white line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                      {manga.title}
                    </h2>
                    <p className="text-xs text-gray-400 mb-3">{manga.genre}</p>
                    <div className="mt-auto">
                      {latestChapter ? (
                        <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                          Chapter {latestChapter.chapterId}
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-700 text-gray-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                          Belum ada chapter
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/komik">
              <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-blue-400 font-semibold rounded-lg shadow transition-colors">
                Lihat Komik Lainnya
              </button>
            </Link>
          </div>
        </div>
      </main>

{/* FOOTER DEVELOPER */}
      <footer className="mt-16 bg-gray-800/80 border-t border-gray-800 py-8 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3">
          {/* 1. Logo (Paling Atas) */}
          <img
            src="/favicon.ico"
            alt="KomiKaggy Logo"
            className="w-12 h-12 object-contain rounded-lg"
          />

          {/* 2. Nama Brand (Teks Bold) */}
          <h2 className="text-xl font-bold text-white tracking-wide">
            KomiKaggy
          </h2>

          {/* 3. Developer Info */}
          <p className="text-sm text-gray-300">
            Developed by <span className="font-semibold text-white">Ilham Jagad</span>
          </p>

          {/* 4. Tautan Media Sosial Vertikal (Tanpa Ikon) */}
          <div className="flex flex-col items-center gap-2.5 mt-2">
            <a
              href="https://instagram.com/ilhamjgad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              Instagram
            </a>

            <a
              href="https://linkedin.com/in/ilhamjagad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              LinkedIn
            </a>

            <a
              href="https://github.com/ilhamjagad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} KomiKaggy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}