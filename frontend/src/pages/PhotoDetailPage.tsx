import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPhoto } from '../api/photos';
import { getReactionCounts, addReaction } from '../api/reactions';
import { getComments, addComment, deleteComment } from '../api/comments';
import type { PhotoResponse } from '../types/photo';
import type { CommentResponse } from '../types/comment';

const EMOJI_MAP: Record<string, string> = {
  HEART: '❤️', LAUGH: '😂', WOW: '😮', SAD: '😢',
  ANGRY: '😡', LIKE: '👍', DISLIKE: '👎',
};

const PhotoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<PhotoResponse | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!id) return;
    // Pobierz dane zdjęcia/filmu
    const loadPhoto = async () => {
      const res = await getPhoto(Number(id));
      setPhoto({
        ...res,
        isVideo: res.isVideo ?? (res as { video?: boolean }).video ?? false,
      });
    };
    // Pobierz istniejące reakcje (zmapowane na emoji)
    const loadReactions = async () => {
      const counts = await getReactionCounts(Number(id));
      const mapped = Object.fromEntries(
          counts.filter(r => EMOJI_MAP[r.type]).map(r => [EMOJI_MAP[r.type], r.count])
      );
      setReactions(mapped);
    };
    // Pobierz istniejące komentarze
    const loadComments = async () => {
      const res = await getComments(Number(id), 0, 50);
      setComments(res.content);
    };
    loadPhoto();
    loadReactions();
    loadComments();
  }, [id]);

  if (!photo) {
    return <p className="text-center text-brown mt-6">Ładowanie...</p>;
  }

  // Obsługa dodawania reakcji (po wybraniu emotikony)
  const handleAddReaction = async (emoji: string) => {
    const typeEntry = Object.entries(EMOJI_MAP).find(([, e]) => e === emoji);
    if (!typeEntry) return;
    const type = typeEntry[0];
    await addReaction(Number(id), { type });
    // Po dodaniu reakcji odśwież lokalne podsumowanie reakcji
    const counts = await getReactionCounts(Number(id));
    const mapped = Object.fromEntries(
        counts.filter(r => EMOJI_MAP[r.type]).map(r => [EMOJI_MAP[r.type], r.count])
    );
    setReactions(mapped);
    setShowPicker(false);
  };

  // Obsługa dodawania komentarza
  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    await addComment(Number(id), { text: newComment.trim() });
    setNewComment('');
    // Po dodaniu komentarza odśwież listę
    const res = await getComments(Number(id), 0, 50);
    setComments(res.content);
  };
  const handleSendCommentEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  // Obsługa usuwania komentarza (z uwzględnieniem uprawnień)
  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('Nie możesz usunąć tego komentarza – nie należy do Ciebie.');
      } else {
        console.error('Błąd usuwania komentarza:', err);
      }
    }
  };

  return (
      <main className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-brown mb-4 text-center">Podgląd</h1>

        {/* Podgląd zdjęcia lub filmu */}
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

        {/* Sekcja reakcji pod zdjęciem/filmem */}
        <div className="flex justify-center flex-wrap gap-2 mb-3">
          {Object.entries(reactions).map(([emoji, count]) => (
              <div key={emoji} className="text-xl flex items-center gap-1">
                <span>{emoji}</span>
                <span className="text-sm">{count}</span>
              </div>
          ))}
        </div>
        <div className="flex justify-center mb-6">
          {showPicker ? (
              // Paleta emotikon do wyboru (po kliknięciu "Dodaj reakcję")
              <div className="flex gap-2 bg-white shadow px-3 py-2 rounded-full">
                {Object.values(EMOJI_MAP).map(emoji => (
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

        {/* Sekcja komentarzy */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-brown mb-2">Komentarze</h2>
          {comments.length === 0 ? (
              <p className="text-sm text-gray-500">Brak komentarzy</p>
          ) : (
              <ul className="space-y-2">
                {comments.map(comment => (
                    <li key={comment.id} className="flex items-start">
                      {/* Avatar z inicjałem */}
                      <div className="flex-shrink-0 w-8 h-8 bg-brown text-cream font-elegant rounded-full flex items-center justify-center mr-2">
                        {comment.deviceName.charAt(0).toUpperCase()}
                      </div>
                      {/* Treść komentarza */}
                      <div className="bg-white p-2 rounded-xl shadow-sm text-sm flex-1 relative">
                        <div className="text-brown font-medium">{comment.deviceName}</div>
                        <div>{comment.text}</div>
                        {/** Przycisk usuwania komentarza (w prawym górnym rogu pola) */}
                        <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-600 text-xs"
                            title="Usuń komentarz"
                        >
                          🗑️
                        </button>
                      </div>
                    </li>
                ))}
              </ul>
          )}
          {/* Formularz dodawania nowego komentarza */}
          <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={handleSendCommentEnter}
              placeholder="Dodaj komentarz…"
              rows={2}
              className="w-full border rounded-md p-2 text-sm mt-3 focus:outline-none focus:ring focus:border-gold resize-none"
          />
        </section>
      </main>
  );
};

export default PhotoDetailPage;
