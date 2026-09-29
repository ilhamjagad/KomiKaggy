"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: any;
}

export default function ComicComments({ mangaId }: { mangaId: string }) {
  const { user, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "comics", mangaId, "comments"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comms: Comment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(comms);
    });
    return () => unsubscribe();
  }, [mangaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "comics", mangaId, "comments"), {
        userId: user.uid,
        userName: user.displayName || "Pengguna KomiKaggy",
        userAvatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=2563eb&color=fff`,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-white">Komentar ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div>
            <textarea
              rows={3}
              placeholder="Tulis komentar kamu..."
              className="w-full p-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-sm resize-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-medium rounded-full text-xs transition-colors shadow"
              >
                {submitting ? "Mengirim..." : "Kirim Komentar"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg text-center border border-gray-700">
          <p className="text-sm text-gray-300 mb-3">Masuk dengan akun Google untuk ikut memberikan komentar.</p>
          <button
            onClick={signInWithGoogle}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full text-xs transition-colors shadow inline-flex items-center gap-2"
          >
            <span>Masuk Google</span>
          </button>
        </div>
      )}

      {/* List Comments */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 bg-gray-900/60 p-4 rounded-xl border border-gray-700/60">
              <img
                src={comment.userAvatar}
                alt={comment.userName}
                className="w-9 h-9 rounded-full object-cover border border-gray-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-white truncate">{comment.userName}</h4>
                  <span className="text-[10px] text-gray-500">
                    {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "Baru saja"}
                  </span>
                </div>
                <p className="text-sm text-gray-300 break-words">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-6 text-sm">
            Belum ada komentar. Jadilah yang pertama berkomentar!
          </div>
        )}
      </div>
    </div>
  );
}
