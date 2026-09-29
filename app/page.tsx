"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mangaDatabase } from "../data";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../context/AuthContext";
import { collection, query, getDocs, orderBy, limit, doc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const loadHistory = async () => {
      if (user) {
        try {
          const historyRef = collection(db, "readingHistory", user.uid, "chapters");
          const q = query(historyRef, orderBy("updated_at", "desc"), limit(50));
          const snapshot = await getDocs(q);
          const firebaseHistory = snapshot.docs.map((doc) => {
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
          const savedHistory = sessionStorage.getItem("komikHistory");
          if (savedHistory) setHistory(JSON.parse(savedHistory));
        }
      } else {
        const savedHistory = sessionStorage.getItem("komikHistory");
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      }
    };
    loadHistory();
  }, [user]);

  const clearHistory = async () => {
    if (user) {
      try {
        const historyRef = collection(db, "readingHistory", user.uid, "chapters");
        const snap = await getDocs(historyRef);
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(doc(db, "readingHistory", user.uid, "chapters", d.id)));
        await batch.commit();
      } catch (e) {
        console.error("Clear history error:", e);
      }
    } else {
      sessionStorage.removeItem("komikHistory");
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
              <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-blue-400 font-semibold rounded-full shadow transition-colors">
                Lihat Komik Lainnya
              </button>
            </Link>
          </div>
</div>
      </main>

      <p className="text-center text-xs text-gray-500 mb-2 mt-8">
        Note: Masuk dengan akun Google agar riwayat baca tersimpan.
      </p>

      {/* FOOTER DEVELOPER */}
      <footer className="bg-gray-800/80 border-t border-gray-800 py-8 px-4 text-center">
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

          {/* 4. Tautan Media Sosial Horizontal (Logo Only) */}
          <div className="flex items-center gap-4 mt-2">
            <a
              href="https://instagram.com/ilhamjgad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-400 transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/ilhamjagad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="https://github.com/ilhamjagad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
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