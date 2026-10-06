"use client";

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { mangaDatabase } from '../../../../../data';
import { useAuth } from '../../../../../context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';

export default function ChapterReader({ params }: { params: Promise<{ id: string, chapterId: string }> }) {
  const { id, chapterId } = use(params);
  const { user } = useAuth();
  const [showNav, setShowNav] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const current = window.scrollY;
      setShowNav(current <= lastScrollY || current < 50);
      lastScrollY = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScreenClick = () => setShowNav((prev) => !prev);

  const manga = mangaDatabase.find((m) => m.id === id);
  const chapter = manga?.chapters.find((c) => c.chapterId === chapterId);

  useEffect(() => {
    if (manga && chapterId) {
      if (user) {
        setDoc(doc(db, "readingHistory", user.uid, "chapters", manga.id), {
          manga_id: manga.id,
          title: manga.title,
          image: manga.image,
          chapter_id: chapterId,
          updated_at: serverTimestamp(),
        }, { merge: true }).catch((error) => {
          console.error("Gagal simpan riwayat ke Cloud:", error);
        });
      } else {
        const saved = sessionStorage.getItem("komikHistory");
        let historyList = saved ? JSON.parse(saved) : [];
        historyList = historyList.filter((h: any) => h.id !== manga.id);
        historyList.unshift({
          id: manga.id,
          title: manga.title,
          image: manga.image,
          chapterId: chapterId
        });
        if (historyList.length > 10) historyList.pop();
        sessionStorage.setItem("komikHistory", JSON.stringify(historyList));
      }
    }
  }, [id, chapterId, manga, user]);

  if (!manga || !chapter) {
    return <div className="p-8 text-white text-center bg-gray-900 min-h-screen">Chapter tidak ditemukan!</div>;
  }

  const chapterIndex = manga.chapters.findIndex((c) => c.chapterId === chapterId);
  const prevChapter = chapterIndex > 0 ? manga.chapters[chapterIndex - 1].chapterId : null;
  const nextChapter = chapterIndex < manga.chapters.length - 1 ? manga.chapters[chapterIndex + 1].chapterId : null;

  return (
    <main className="min-h-screen bg-black text-gray-300 pb-20" onClick={handleScreenClick}>
      {/* Bagian Navigasi Atas (Tanpa tombol kanan, judul di tengah) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`sticky top-0 bg-gray-900 border-b border-gray-800 p-4 z-10 flex justify-between items-center shadow-md transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <Link href={`/manga/${manga.id}`}>
          <button className="text-blue-400 hover:text-blue-300 font-medium text-sm md:text-base">Kembali</button>
        </Link>
        <h1 className="text-sm md:text-lg font-bold text-white truncate max-w-[70%] text-center">
          {manga.title} - Ch. {chapter.chapterId}
        </h1>
        <div className="w-12"></div> {/* Penyeimbang agar judul persis di tengah */}
      </div>

      {/* Area Gambar Komik */}
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {(chapter.pages as string[]).map((page, index) => (
          <img key={index} src={page} alt={`Hal ${index + 1}`} className="w-full h-auto object-contain block select-none" />
        ))}
      </div>

      {/* Navigasi Bawah yang Menempel di Layar (Sticky Bottom) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-4 flex justify-center gap-4 z-20 shadow-lg transition-transform duration-300 ${showNav ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Tombol Sebelumnya hanya ditampilkan jika prevChapter ada (bukan chapter 1) */}
        {prevChapter && (
          <Link href={`/manga/${manga.id}/chapter/${prevChapter}`}>
            <button className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm font-medium transition-colors">
              Sebelumnya
            </button>
          </Link>
        )}

        {/* Tombol Selanjutnya hanya ditampilkan jika nextChapter ada */}
        {nextChapter && (
          <Link href={`/manga/${manga.id}/chapter/${nextChapter}`}>
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm font-medium transition-colors">
              Selanjutnya
            </button>
          </Link>
        )}
      </div>
    </main>
  );
}