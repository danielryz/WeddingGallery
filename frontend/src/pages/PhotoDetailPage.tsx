import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {getPhoto, updateDescription, updateVisibility} from '../api/photos';
import { getReactionCounts, addReaction } from '../api/reactions';
import { getComments, addComment, deleteComment } from '../api/comments';
import type {PhotoResponse} from '../types/photo';
import type {CommentResponse} from '../types/comment';
import './PhotoDetailPage.css';
import {isAdmin, isThisDevice} from "../utils/authUtils.ts";

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
    const loadPhoto = async () => {
      const res = await getPhoto(Number(id));
      setPhoto({
        ...res,
        isVideo: res.isVideo ?? (res as { video?: boolean }).video ?? false,
      });
    };
    const loadReactions = async () => {
      const counts = await getReactionCounts(Number(id));
      const mapped = Object.fromEntries(
          counts.filter(r => EMOJI_MAP[r.type]).map(r => [EMOJI_MAP[r.type], r.count])
      );
      setReactions(mapped);
    };
    const loadComments = async () => {
      const res = await getComments(Number(id), 0, 50);
      setComments(res.content);
    };
    loadPhoto();
    loadReactions();
    loadComments();
  }, [id]);

  if (!photo) {
    return <p className="loading-text">Ładowanie...</p>;
  }

  const handleAddReaction = async (emoji: string) => {
    const typeEntry = Object.entries(EMOJI_MAP).find(([, e]) => e === emoji);
    if (!typeEntry) return;
    const type = typeEntry[0];
    await addReaction(Number(id), { type });
    const counts = await getReactionCounts(Number(id));
    const mapped = Object.fromEntries(
        counts.filter(r => EMOJI_MAP[r.type]).map(r => [EMOJI_MAP[r.type], r.count])
    );
    setReactions(mapped);
    setShowPicker(false);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    await addComment(Number(id), { text: newComment.trim() });
    setNewComment('');
    const res = await getComments(Number(id), 0, 50);
    setComments(res.content);
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
      setComments(comments.filter(c => c.id !== commentId));
      console.log("deleted");
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('Nie możesz usunąć tego komentarza – nie należy do Ciebie.');
      } else {
        console.error('Błąd usuwania komentarza:', err);
      }
    }
  };

  const handleDeletePhoto = async () => {
    try{
      await updateVisibility(Number(id), {visible: false});
      window.location.href = '/gallery';
      console.log("deleted");
    }catch (err:any) {
      if (err.response?.status === 403){
        alert('Nie możesz usunąć tego zdjęcia - brak Autoryzacji.')
      } else {
        console.error('Błąd usuwania zdjęcia:', err);
      }
    }
  }

  const handleEditDescription = async (text: string) => {
    try {
      await  updateDescription(Number(id), {description: text});
      console.log("updated");
    }catch (err:any) {
      if (err.response?.status === 403){
        alert('Nie możesz zmienić tego opisu - brak Autoryzacji.')
      } else {
        console.error('Błąd edycji opisu:', err);
      }
    }
  }




  return (
      <main className="photo-detail">
        <h1 className="photo-detail-title">Podgląd</h1>

        {/* Podgląd zdjęcia lub filmu */}
        <div className="media-container">
          {photo.isVideo ? (
              <video
                  src={`${API_URL}/photos/${photo.fileName}`}
                  controls
                  className="media"
              />
          ) : (
              <img
                  src={`${API_URL}/photos/${photo.fileName}`}
                  alt="Photo"
                  className="media"
              />
          )}
        </div>
        <div className="photo-info">
        <span className="photo-deviceName">{photo.deviceName}</span>
        <span className="photo-description">{photo.description}</span>
        </div>

        {(isThisDevice(photo.deviceId) || isAdmin()) && (
            <button className="delete-photo-btn" onClick={handleDeletePhoto}> Usuń Zdjęcie</button>
        )}
        {isThisDevice(photo.deviceId) && (
            <textarea className="update-description-input" placeholder="Dodaj opis..." onChange={(e) => handleEditDescription(e.target.value)}></textarea>
        )}

        {/* Sekcja reakcji pod zdjęciem/filmem */}
        <div className="reactions-container">
          {Object.entries(reactions).map(([emoji, count]) => (
              <div key={emoji} className="reaction">
                <span>{emoji}</span>
                <span className="reaction-count">{count}</span>
              </div>
          ))}
        </div>
        <div className="reaction-picker-container">
          {showPicker ? (
              <div className="emoji-palette">
                {Object.values(EMOJI_MAP).map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => handleAddReaction(emoji)}
                    >
                      {emoji}
                    </button>
                ))}
              </div>
          ) : (
              <button
                  onClick={() => setShowPicker(true)}
                  className="add-reaction-btn"
              >
                Dodaj reakcję
              </button>
          )}
        </div>

        {/* Sekcja komentarzy */}
        <section className="comments-section">
          <h2 className="comments-title">Komentarze</h2>
          {comments.length === 0 ? (
              <p className="no-comments-msg">Brak komentarzy</p>
          ) : (
              <ul className="comment-list">
                {comments.map(comment => (
                    <li key={comment.id} className="comment-item">
                      {/* Avatar z inicjałem */}
                      <div className="comment-avatar">
                        {comment.deviceName.charAt(0).toUpperCase()}
                      </div>
                      {/* Treść komentarza */}
                      <div className="comment-bubble">
                        <div className="comment-author">{comment.deviceName}</div>
                        <div>{comment.text}</div>
                        {(isThisDevice(comment.deviceId) || isAdmin()) && (
                        <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="delete-btn"
                            title="Usuń komentarz"
                        >
                          🗑️
                        </button>
                        )}
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
              className="comment-input"
          />
        </section>
      </main>
  );
};

export default PhotoDetailPage;
