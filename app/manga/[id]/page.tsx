"use client";

import Link from "next/link";
import { use, useState } from "react";
import { mangaDatabase } from "../../../data";

export default function MangaDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [chapterSearch, setChapterSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"terbaru" | "terlama">("terbaru");

  const manga = mangaDatabase.find((m) => m.id === id);

  if (!manga) {
    return (
      <div className="p-8 text-white text-center text-xl bg-gray-900 min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4">Komik tidak ditemukan!</p>
        <Link href="/" className="text-blue-400 hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const filteredChapters = manga.chapters.filter(
    (chapter) =>
      chapter.chapterId.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      chapter.title.toLowerCase().includes(chapterSearch.toLowerCase()),
  );

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    const numA = parseFloat(a.chapterId) || 0;
    const numB = parseFloat(b.chapterId) || 0;
    if (sortOrder === "terbaru") {
      return numB - numA;
    } else {
      return numA - numB;
    }
  });

  const genres = manga.genre ? manga.genre.split(",").map((g) => g.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Baru */}
      <header className="w-full bg-gray-800 border-b border-gray-700 py-4 px-4 sm:px-6 sticky top-0 z-10 shadow-md">
        <div className="w-full flex items-center">
          <Link 
            href="/" 
            className="text-base font-normal text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
          >
            Beranda
          </Link>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="p-8 max-w-4xl mx-auto">
        {/* Profil Manga */}
        <div className="flex flex-col md:flex-row gap-8 bg-gray-800 p-6 rounded-lg shadow-lg">
          <img
            src={manga.image}
            alt={manga.title}
            className="w-full md:w-64 rounded-md object-cover"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">
              {manga.title}
            </h1>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
              <p>
                <strong>Author:</strong> {manga.author}
              </p>
              <p>
                <strong>Status:</strong> {manga.status}
              </p>
            </div>

            <div className="mb-8">
              <span className="text-sm text-gray-300 font-semibold block mb-2">
                Genre:
              </span>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-blue-300 text-xs font-medium rounded-full border border-gray-600"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2">Sinopsis</h3>
            <p className="text-gray-400 leading-relaxed">{manga.synopsis}</p>
          </div>
        </div>

        {/* Bagian Daftar Chapter */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Daftar Chapter</h2>

            {/* Kontainer Kolom Cari (Kiri) & Tombol Urut (Kanan) dengan proporsi 50:50 */}
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              {/* Kolom Pencarian Chapter di Kiri */}
              <input
                type="text"
                placeholder="Cari Chapter ..."
                className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
              />

              {/* Tombol Urutkan Terbaru / Terlama di Kanan */}
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "terbaru" ? "terlama" : "terbaru")
                }
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors border border-gray-600 flex items-center justify-center gap-2 truncate"
              >
                <span>
                  {sortOrder === "terbaru" ? "Urutan: Terbaru" : "Urutan: Terlama"}
                </span>
              </button>
            </div>
          </div>

          {/* Daftar Item Chapter */}
          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
            {sortedChapters.length > 0 ? (
              sortedChapters.map((chapter) => (
                <Link
                  key={chapter.chapterId}
                  href={`/manga/${manga.id}/chapter/${chapter.chapterId}`}
                >
                  <div className="flex flex-col bg-gray-700 hover:bg-gray-600 p-4 rounded transition-colors gap-1">
                    <span className="font-medium text-white">
                      {chapter.chapterId}. {chapter.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {chapter.date}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">
                Chapter tidak ditemukan!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}