import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {getPhoto, updateDescription, updateVisibility} from '../api/photos';
import { getReactionCounts } from '../api/reactions';
import { getComments, addComment, deleteComment } from '../api/comments';
import type {PhotoResponse} from '../types/photo';
import type {CommentResponse} from '../types/comment';
import './PhotoDetailPage.css';
import {isAdmin, isThisDevice} from "../utils/authUtils.ts";
import { useAlerts } from "../components/alert/useAlerts"
import ConfirmModal from "../components/Confirm/ConfirmModal";
import useLongPressReaction from '../hooks/useLongPressReaction';
import ReactionSelector from '../components/Reactions/ReactionSelector';

const EMOJI_MAP: Record<string, string> = {
  HEART: '❤️', LAUGH: '😂', WOW: '😮', SAD: '😢',
  ANGRY: '😡', LIKE: '👍', DISLIKE: '👎',
};

const PhotoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<PhotoResponse | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const { show: showPicker, handlers, close } = useLongPressReaction();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showDeletePhotoConfirm, setShowDeletePhotoConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [descInput, setDescInput] = useState('');
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const showAlert = useAlerts();

  useEffect(() => {
    if (!id) return;
    const loadPhoto = async () => {
      const res = await getPhoto(Number(id));
      setPhoto({
        ...res,
        isVideo: res.isVideo ?? (res as { video?: boolean }).video ?? false,
      });
      setDescInput(res.description || '');
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

  const refreshReactions = async () => {
    const counts = await getReactionCounts(Number(id));
    const mapped = Object.fromEntries(
        counts.filter(r => EMOJI_MAP[r.type]).map(r => [EMOJI_MAP[r.type], r.count])
    );
    setReactions(mapped);
    close();
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
      showAlert('Komentarz usunięty', 'success');
  } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      if (e.response?.status === 403) {
        showAlert('Nie możesz usunąć tego komentarza – nie należy do Ciebie.', 'error');
      } else {
        showAlert('Bład usuwania komentarza: ' + err, 'error');
      }
    }
  };

  const handleDeletePhoto = async () => {
    try{
      await updateVisibility(Number(id), {visible: false});
      window.location.href = '/gallery';
      showAlert('Zdjęcie usunięte', 'success');
  }catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      if (e.response?.status === 403){
        showAlert('Nie możesz usunąć tego zdjęcia - brak Autoryzacji.', 'error');
      } else {
        showAlert('Błąd usuwania zdjęcia: ' + err, 'error');
      }
    }
  }

  const handleEditDescription = async (text: string) => {
    try {
      await  updateDescription(Number(id), {description: text});
      showAlert('Opis zaktualizowany', 'success');
      setPhoto(prev => prev ? { ...prev, description: text } : prev);
    }catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      if (e.response?.status === 403){
        showAlert('Nie możesz zmienić tego opisu - brak Autoryzacji.', 'error');
      } else {
        showAlert('Błąd edycji opisu: ' + err, 'error');
      }
    }
  }

  const CommentItem: React.FC<{ comment: CommentResponse }> = ({ comment }) => {
    const { show: showCommentPicker, handlers: commentHandlers, close: closeComment } = useLongPressReaction();
    return (
      <li className="comment-item">
        <div className="comment-avatar">
          {comment.deviceName.charAt(0).toUpperCase()}
        </div>
        <div className="comment-bubble" {...commentHandlers}>
          <div className="comment-author">{comment.deviceName}</div>
          <div>{comment.text}</div>
          {(isThisDevice(comment.deviceId) || isAdmin()) && (
            <button
              onClick={() => setCommentToDelete(comment.id)}
              className="delete-btn"
              title="Usuń komentarz"
            >
              🗑️
            </button>
          )}
          {showCommentPicker && (
            <ReactionSelector onClose={closeComment} addReactionFn={async () => {}} />
          )}
        </div>
      </li>
    );
  };




  return (
      <main className="photo-detail">
        <h1 className="photo-detail-title">Podgląd</h1>

        {/* Podgląd zdjęcia lub filmu */}
        <div className="photo-frame">
          <div className="media-container" {...handlers}>
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
            {!photo.isVisibleForGuest && (
                <span className="photo-visibility">Ukryte dla gości</span>
            )}
            {photo.isWish && (
                <span className="photo-wish">🎁</span>
            )}
          </div>
        </div>

        {(isThisDevice(photo.deviceId) || isAdmin()) && (
            <button className="btn btn-danger" onClick={() => setShowDeletePhotoConfirm(true)}> Usuń Zdjęcie</button>
        )}
        {isThisDevice(photo.deviceId) && (
            <>
            <textarea
                className="update-description-input"
                placeholder="Dodaj opis..."
                value={descInput}
                onChange={e => setDescInput(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => setShowEditConfirm(true)}>Zapisz opis</button>
            </>
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
        {showPicker && (
          <div className="reaction-picker-container">
            <ReactionSelector
              photoId={Number(id)}
              onSelect={refreshReactions}
              onClose={close}
            />
          </div>
        )}

        {/* Sekcja komentarzy */}
        <section className="comments-section">
          <h2 className="comments-title">Komentarze</h2>
          {comments.length === 0 ? (
              <p className="no-comments-msg">Brak komentarzy</p>
          ) : (
              <ul className="comment-list">
                {comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
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
        {showDeletePhotoConfirm && (
            <ConfirmModal
                message="Czy na pewno usunąć zdjęcie?"
                onConfirm={async () => { await handleDeletePhoto(); setShowDeletePhotoConfirm(false); }}
                onCancel={() => setShowDeletePhotoConfirm(false)}
            />
        )}
        {commentToDelete !== null && (
            <ConfirmModal
                message="Czy na pewno usunąć komentarz?"
                onConfirm={async () => { await handleDeleteComment(commentToDelete); setCommentToDelete(null); }}
                onCancel={() => setCommentToDelete(null)}
            />
        )}
        {showEditConfirm && (
            <ConfirmModal
                message="Czy na pewno zaktualizować opis?"
                onConfirm={async () => { await handleEditDescription(descInput); setShowEditConfirm(false); }}
                onCancel={() => setShowEditConfirm(false)}
            />
        )}
      </main>
  );
};

export default PhotoDetailPage;
