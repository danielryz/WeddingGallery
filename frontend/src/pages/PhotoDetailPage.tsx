import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPhoto } from '../api/photos';
import type { PhotoResponse } from '../types/photo';
import { getReactionCounts, addReaction } from '../api/reactions';
import type {CommentResponse} from "../types/comment.ts";
import {addComment, deleteComment, getComments} from "../api/comments.ts";

const EMOJI_MAP: Record<string, string> = {
  HEART: '❤️',
  LAUGH: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡',
  LIKE: '👍',
  DISLIKE: '👎',
};

const PhotoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<PhotoResponse | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const loadPhoto = async () => {
    const res = await getPhoto(Number(id));
    // fallback for older backend versions returning `video` field
    setPhoto({
      ...res,
      isVideo: res.isVideo ?? (res as { video?: boolean }).video ?? false,
    });
  };

  const loadReactions = async () => {
    const counts = await getReactionCounts(Number(id));
    const mapped = Object.fromEntries(
        counts
            .filter((r) => EMOJI_MAP[r.type])
            .map((r) => [EMOJI_MAP[r.type], r.count])
    );
    setReactions(mapped);
  };

  const loadComments = async () => {
    const res = await getComments(Number(id), 0, 50);
    setComments(res.content);
  };

  const handleAddReaction = async (emoji: string) => {
    const type = Object.entries(EMOJI_MAP).find(([, e]) => e === emoji)?.[0];
    if (!type) return;
    await addReaction(Number(id), { type });
    await loadReactions();
    setShowPicker(false);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    await addComment(Number(id), { text: newComment.trim() });
    setNewComment('');
    await loadComments();
  };

  const handleSendCommentEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 403) {
        alert('Nie możesz usunąć tego komentarza – nie należy do Ciebie.');
      } else {
        console.error('Błąd usuwania komentarza:', err);
      }
    }
  };

  useEffect(() => {
    if (id) {
      loadPhoto();
      loadReactions();
      loadComments();
    }
    // id is sufficient here; the helper functions do not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!photo) return <p className="text-center mt-6">Ładowanie...</p>;

  return (
      <main className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-brown mb-4 text-center">Podgląd</h1>

        <div className="w-full aspect-square overflow-hidden rounded-lg mb-4">
          {photo.isVideo ? (
              <video
                  src={`${API_URL}/photos/${photo.fileName}`}
                  controls
                  className="w-full h-full object-contain"
              />
          ) : (
              <img
                  src={`${API_URL}/photos/${photo.fileName}`}
                  alt="Photo"
                  className="w-full h-full object-contain"
              />
          )}
        </div>

        <div className="flex justify-center gap-2 mb-3 flex-wrap">
          {Object.entries(reactions).map(([emoji, count]) => (
              <div key={emoji} className="text-xl flex items-center gap-1">
                <span>{emoji}</span>
                <span className="text-sm">{count}</span>
              </div>
          ))}
        </div>

        <div className="flex justify-center mb-6">
          {showPicker ? (
              <div className="flex gap-2 bg-white shadow px-3 py-2 rounded-full">
                {Object.values(EMOJI_MAP).map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => handleAddReaction(emoji)}
                        className="text-xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                ))}
              </div>
          ) : (
              <button
                  onClick={() => setShowPicker(true)}
                  className="px-4 py-2 rounded-full bg-gold text-white font-semibold text-sm"
              >
                Dodaj reakcję
              </button>
          )}
        </div>

        <section className="mt-6 space-y-4">
          <h2 className="text-sm font-semibold text-brown">Komentarze</h2>

          {comments.length === 0 ? (
              <p className="text-sm text-gray-500">Brak komentarzy</p>
          ) : (
              <ul className="space-y-2">
                {comments.map((comment) => (
                    <li
                        key={comment.id}
                        className="bg-white p-2 rounded shadow-sm text-sm flex justify-between items-start"
                    >
                      <div>
                        <div className="text-brown font-medium">{comment.deviceName}</div>
                        <div>{comment.text}</div>
                      </div>
                      <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-400 hover:text-red-600 text-xs ml-2"
                          title="Usuń komentarz"
                      >
                        🗑️
                      </button>
                    </li>
                ))}
              </ul>
          )}

          <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleSendCommentEnter}
              placeholder="Dodaj komentarz…"
              rows={2}
              className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring focus:border-gold resize-none"
          />
        </section>
      </main>
  );
};

export default PhotoDetailPage;
