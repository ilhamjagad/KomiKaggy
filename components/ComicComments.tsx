"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: any;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likes?: string[];
  replies?: Reply[];
  createdAt: any;
}

export default function ComicComments({ mangaId }: { mangaId: string }) {
  const { user, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

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
        userAvatar:
          user.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.displayName || "User"
          )}&background=2563eb&color=fff`,
        text: newComment.trim(),
        likes: [],
        replies: [],
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (comment: Comment) => {
    if (!user) {
      signInWithGoogle();
      return;
    }

    const commentRef = doc(db, "comics", mangaId, "comments", comment.id);
    const hasLiked = comment.likes?.includes(user.uid);

    try {
      if (hasLiked) {
        await updateDoc(commentRef, {
          likes: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(commentRef, {
          likes: arrayUnion(user.uid),
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!replyText.trim() || !user) return;

    setSubmittingReply(true);
    try {
      const commentRef = doc(db, "comics", mangaId, "comments", commentId);
      const newReply: Reply = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.displayName || "Pengguna KomiKaggy",
        userAvatar:
          user.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.displayName || "User"
          )}&background=2563eb&color=fff`,
        text: replyText.trim(),
        createdAt: new Date().toISOString(),
      };

      await updateDoc(commentRef, {
        replies: arrayUnion(newReply),
      });

      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-white">
        Komentar ({comments.length})
      </h3>

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
          <p className="text-sm text-gray-300 mb-3">
            Masuk dengan akun Google untuk ikut memberikan komentar.
          </p>
          <button
            onClick={signInWithGoogle}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full text-xs transition-colors shadow inline-flex items-center gap-2"
          >
            <span>Masuk Google</span>
          </button>
        </div>
      )}

      {/* List Comments */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const hasLiked = user ? comment.likes?.includes(user.uid) : false;
            const likesCount = comment.likes?.length || 0;
            const repliesCount = comment.replies?.length || 0;

            return (
              <div
                key={comment.id}
                className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/60"
              >
                <div className="flex gap-3">
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-9 h-9 rounded-full object-cover border border-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {comment.userName}
                      </h4>
                      <span className="text-[10px] text-gray-500">
                        {comment.createdAt?.toDate
                          ? new Date(comment.createdAt.toDate()).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Baru saja"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 break-words">
                      {comment.text}
                    </p>

                    {/* Action Bar: Suka & Balas */}
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-800/60 text-xs">
                      <button
                        onClick={() => handleLike(comment)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          hasLiked
                            ? "text-red-400 font-semibold"
                            : "text-gray-400 hover:text-red-400"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={hasLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{likesCount > 0 ? likesCount : "Suka"}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (!user) {
                            signInWithGoogle();
                            return;
                          }
                          setReplyingTo(
                            replyingTo === comment.id ? null : comment.id
                          );
                        }}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        <span>
                          {repliesCount > 0
                            ? `Balas (${repliesCount})`
                            : "Balas"}
                        </span>
                      </button>
                    </div>

                    {/* Reply Input Box */}
                    {replyingTo === comment.id && user && (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <textarea
                          rows={2}
                          placeholder={`Balas ${comment.userName}...`}
                          className="w-full p-2.5 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-xs resize-none"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="px-3 py-1.5 text-gray-400 hover:text-gray-200 text-xs"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            disabled={submittingReply || !replyText.trim()}
                            onClick={() => handleReplySubmit(comment.id)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-medium rounded-full text-xs transition-colors"
                          >
                            {submittingReply ? "Mengirim..." : "Kirim"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies List */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-800 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2.5">
                            <img
                              src={reply.userAvatar}
                              alt={reply.userName}
                              className="w-7 h-7 rounded-full object-cover border border-gray-700"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <h5 className="text-xs font-semibold text-white truncate">
                                  {reply.userName}
                                </h5>
                                <span className="text-[9px] text-gray-500">
                                  {reply.createdAt
                                    ? new Date(reply.createdAt).toLocaleDateString(
                                        "id-ID",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )
                                    : "Baru saja"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-300 break-words">
                                {reply.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-6 text-sm">
            Belum ada komentar. Jadilah yang pertama berkomentar!
          </div>
        )}
      </div>
    </div>
  );
}
