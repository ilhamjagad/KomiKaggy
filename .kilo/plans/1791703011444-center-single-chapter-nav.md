# Rencana Penyesuaian Posisi Tombol Navigasi Chapter

## Masalah
Pada pembaca manga (`app/manga/[id]/chapter/[chapterId]/page.tsx`), navigasi bawah menggunakan `flex justify-between`.
- Pada chapter awal (hanya ada tombol "Selanjutnya"), tombol berada di sisi kanan karena ada `<div />` penyeimbang di sisi kiri.
- Pada chapter akhir (hanya ada tombol "Sebelumnya"), tombol berada di sisi kiri.
- Pengguna menginginkan:
  1. Jika hanya ada tombol "Selanjutnya" (chapter awal), tombol posisinya di tengah.
  2. Jika hanya ada tombol "Sebelumnya" (chapter akhir), tombol posisinya di tengah.
  3. Jika kedua tombol ada (chapter tengah), tombol tetap menyebar ke kiri ("Sebelumnya") dan ke kanan ("Selanjutnya").

## Perubahan Kode
File: `app/manga/[id]/chapter/[chapterId]/page.tsx`
Baris target: Area sticky bottom navigation (baris ~101 - 122).

### Detail Perubahan
1. Ubah kelas kontainer navigasi bawah dari fixed `justify-between` menjadi dinamis:
   - Jika `prevChapter && nextChapter`: gunakan `justify-between`
   - Jika hanya salah satu yang ada: gunakan `justify-center`
2. Hapus elemen placeholder `<div />` pada kondisi `!prevChapter`.
3. Render tombol secara bersyarat:
   ```tsx
   <div
     onClick={(e) => e.stopPropagation()}
     className={`fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-4 flex items-center z-20 shadow-lg transition-transform duration-300 ${
       showNav ? 'translate-y-0' : 'translate-y-full'
     } ${prevChapter && nextChapter ? 'justify-between' : 'justify-center'}`}
   >
     {prevChapter && (
       <Link href={`/manga/${manga.id}/chapter/${prevChapter}`}>
         <button className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm font-medium transition-colors">
           Sebelumnya
         </button>
       </Link>
     )}

     {nextChapter && (
       <Link href={`/manga/${manga.id}/chapter/${nextChapter}`}>
         <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm font-medium transition-colors">
           Selanjutnya
         </button>
       </Link>
     )}
   </div>
   ```

## Verifikasi
1. Buka chapter awal (misal chapter pertama suatu manga): periksa tombol "Selanjutnya" tepat di tengah layar bawah.
2. Buka chapter pertengahan: periksa tombol "Sebelumnya" di kiri mentok dan "Selanjutnya" di kanan mentok.
3. Buka chapter terakhir: periksa tombol "Sebelumnya" tepat di tengah layar bawah.
