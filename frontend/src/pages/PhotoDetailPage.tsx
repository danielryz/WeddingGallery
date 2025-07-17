// src/pages/PhotoDetailPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  getPhoto,
  updateDescription,
  updateVisibility,
  updateGuestVisibility
} from '../api/photos';
import { getReactionCounts } from '../api/reactions';
import { getComments, addComment, deleteComment } from '../api/comments';
import type { PhotoResponse } from '../types/photo';
import type { CommentResponse } from '../types/comment';
import './PhotoDetailPage.css';
import { isAdmin, isThisDevice } from '../utils/authUtils';
import { useAlerts } from '../components/alert/useAlerts';
import ConfirmModal from '../components/Confirm/ConfirmModal';
import useLongPressReaction from '../hooks/useLongPressReaction';
import ReactionSelector from '../components/Reactions/ReactionSelector';
import ReactionSummary from '../components/Reactions/ReactionSummary';
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
  const { show: showPicker, handlers, close } = useLongPressReaction();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showDeletePhotoConfirm, setShowDeletePhotoConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [descInput, setDescInput] = useState('');
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const showAlert = useAlerts();

  // ref dla głównego pickera reakcji
  const pickerTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await getPhoto(Number(id));
      setPhoto({
        ...res,
        isVideo: res.isVideo ?? (res as any).video ?? false,
      });
      setDescInput(res.description || '');
      const counts = await getReactionCounts(Number(id));
      const mapped = Object.fromEntries(
          counts.filter(r => EMOJI_MAP[r.type]).map(r => [EMOJI_MAP[r.type], r.count])
      );
      setReactions(mapped);
      const comm = await getComments(Number(id), 0, 50);
      setComments(comm.content);
    })();
  }, [id]);

  if (!photo) {
    return <p className="loading-text">Ładowanie...</p>;
  }

  const canView =
      isAdmin() ||
      isThisDevice(photo.deviceId) ||
      (photo.isVisibleForGuest && !photo.isWish);

  if (!canView) {
    return (
        <main className="photo-detail">
          <p className="no-access-msg">Ta treść jest niedostępna.</p>
        </main>
    );
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
    if (photo?.isWish) return;
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
    } catch (err: any) {
      if (err.response?.status === 403) {
        showAlert('Nie możesz usunąć tego komentarza – nie należy do Ciebie.', 'error');
      } else {
        showAlert('Błąd usuwania komentarza: ' + err, 'error');
      }
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await updateVisibility(Number(id), { visible: false });
      showAlert('Zdjęcie usunięte', 'success');
      window.location.href = '/gallery';
    } catch (err: any) {
      if (err.response?.status === 403) {
        showAlert('Nie możesz usunąć tego zdjęcia - brak autoryzacji.', 'error');
      } else {
        showAlert('Błąd usuwania zdjęcia: ' + err, 'error');
      }
    }
  };

  const handleEditDescription = async (text: string) => {
    try {
      await updateDescription(Number(id), { description: text });
      showAlert('Opis zaktualizowany', 'success');
      setPhoto(prev => prev ? { ...prev, description: text } : prev);
    } catch (err: any) {
      if (err.response?.status === 403) {
        showAlert('Nie możesz zmienić tego opisu - brak autoryzacji.', 'info');
      } else {
        showAlert('Błąd edycji opisu: ' + err, 'error');
      }
    }
  };

  const handleGuestVisibility = async (visible: boolean) => {
    try {
      await updateGuestVisibility(Number(id), { isVisibleForGuest: visible });
      setPhoto(prev => prev ? { ...prev, isVisibleForGuest: visible } : prev);
      showAlert('Widoczność zaktualizowana', 'success');
    } catch (err: any) {
      showAlert('Błąd zmiany widoczności: ' + err, 'error');
    }
  };

  // Komponent pojedynczego komentarza z własnym pickerem
  const CommentItem: React.FC<{ comment: CommentResponse }> = ({ comment }) => {
    const commentTriggerRef = useRef<HTMLDivElement>(null);

    return (
        <li className="pd-comment-item">
          <div className="pd-comment-avatar">
            {comment.deviceName.charAt(0).toUpperCase()}
          </div>
          {/* ref i handlers dla komentarza */}
          <div className="pd-comment-bubble" ref={commentTriggerRef}>
            <div className="pd-comment-author">{comment.deviceName}</div>
            <div>{comment.text}</div>
            {(isThisDevice(comment.deviceId) || isAdmin()) && (
                <button
                    onClick={() => setCommentToDelete(comment.id)}
                    className="pd-delete-btn"
                    title="Usuń komentarz"
                >
                  🗑️
                </button>
            )}
          </div>
        </li>
    );
  };

  return (
      <main className="photo-detail">
        <h1 className="photo-detail-title">Podgląd</h1>

        <div className="photo-frame">
          {/* media-container z ref i handlers */}
          <div className="media-container" ref={pickerTriggerRef} {...handlers}>
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
                <span className="photo-wish">🎁 Życzenia</span>
            )}
          </div>
          {(photo.isWish && (isThisDevice(photo.deviceId) || isAdmin())) && (
              <label className="visible-checkbox">
                <input
                    type="checkbox"
                    checked={photo.isVisibleForGuest}
                    onChange={e => handleGuestVisibility(e.target.checked)}
                />
                Widoczne dla gości
              </label>
          )}
        </div>

        <div className="photo-actions">
          {(isThisDevice(photo.deviceId) || isAdmin()) && (
              <button
                  className="btn btn-danger"
                  onClick={() => setShowDeletePhotoConfirm(true)}
              >
                Usuń Zdjęcie
              </button>
          )}
          {isThisDevice(photo.deviceId) && !editingDesc && (
              <button
                  className="btn btn-primary edit-desc-btn"
                  onClick={() => setEditingDesc(true)}
              >
                Edytuj opis
              </button>
          )}
        </div>

        {isThisDevice(photo.deviceId) && !editingDesc && (
            <p className="edit-hint">Kliknij "Edytuj opis", aby dodać opis do zdjęcia.</p>
        )}

        {isThisDevice(photo.deviceId) && editingDesc && (
            <div className="edit-desc-form">
          <textarea
              className="update-description-input"
              placeholder="Dodaj opis..."
              value={descInput}
              onChange={e => setDescInput(e.target.value)}
          />
              <div className="edit-desc-actions">
                <button
                    className="btn"
                    onClick={() => {
                      setEditingDesc(false);
                      setDescInput(photo.description || '');
                    }}
                >
                  Anuluj
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowEditConfirm(true)}
                >
                  Zapisz opis
                </button>
              </div>
            </div>
        )}

        {/* komentarze */}
        {!photo.isWish && (
        <section className="pd-comments-section">
          <h2 className="pd-comments-title">Komentarze</h2>
          {comments.length === 0 ? (
              <p className="pd-no-comments-msg">Brak komentarzy</p>
          ) : (
              <ul className="pd-comment-list">
                {comments.map(c => (
                    <CommentItem key={c.id} comment={c} />
                ))}
              </ul>
          )}
          <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={handleSendCommentEnter}
              placeholder="Dodaj komentarz…"
              rows={2}
              className="pd-comment-input"
          />
        </section>
        )}

        {/* podsumowanie reakcji */}
        <ReactionSummary reactions={reactions} className="center" />

        {/* główny picker reakcji */}
        {showPicker && (
            <ReactionSelector
                triggerRef={pickerTriggerRef}
                photoId={Number(id)}
                onSelect={refreshReactions}
                onClose={close}
            />
        )}

        {/* confirm modale */}
        {showDeletePhotoConfirm && (
            <ConfirmModal
                message="Czy na pewno usunąć zdjęcie?"
                onConfirm={async () => {
                  await handleDeletePhoto();
                  setShowDeletePhotoConfirm(false);
                }}
                onCancel={() => setShowDeletePhotoConfirm(false)}
            />
        )}
        {commentToDelete !== null && (
            <ConfirmModal
                message="Czy na pewno usunąć komentarz?"
                onConfirm={async () => {
                  await handleDeleteComment(commentToDelete);
                  setCommentToDelete(null);
                }}
                onCancel={() => setCommentToDelete(null)}
            />
        )}
        {showEditConfirm && (
            <ConfirmModal
                message="Czy na pewno zaktualizować opis?"
                onConfirm={async () => {
                  await handleEditDescription(descInput);
                  setShowEditConfirm(false);
                }}
                onCancel={() => setShowEditConfirm(false)}
            />
        )}
      </main>
  );
};

export default PhotoDetailPage;
