"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function UserMenu() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse border border-gray-700" />
    );
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="flex shrink-0 items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium text-sm transition-all shadow-md active:scale-95 h-12 w-12 p-0 md:h-auto md:w-auto md:px-4 md:py-3"
      >
        <svg className="w-5 h-5 md:w-4 md:h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span className="hidden md:inline whitespace-nowrap">Masuk Google</span>
      </button>
    );
  }

  const avatarUrl =
    user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.displayName || user.email || "User"
    )}&background=2563eb&color=fff`;

  const fullName = user.displayName || "Pengguna KomiKaggy";
  const email = user.email || "";

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Icon / Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500 transition-all focus:outline-none"
        title="Profil Pengguna"
      >
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 shadow-sm"
        />
      </button>

      {/* Profile Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-5 z-50 text-white animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header Info */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-gray-700">
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-base truncate">{fullName}</h4>
              <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
              <div className="inline-flex items-center gap-1 mt-1 bg-green-500/10 text-green-400 text-[11px] font-medium px-2 py-0.5 rounded-full border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span>Tersinkronisasi Cloud</span>
              </div>
            </div>
          </div>

          <div className="py-4">
            <button
              onClick={async () => {
                await signOut();
                setIsOpen(false);
                setTimeout(() => signInWithGoogle(), 100);
              }}
              className="w-full text-left p-2.5 rounded-xl hover:bg-gray-700/60 text-gray-300 hover:text-white flex items-center justify-between transition-colors text-xs font-medium"
            >
              <span>Ganti Akun Google</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Logout Button */}
          <div className="pt-3 border-t border-gray-700">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
