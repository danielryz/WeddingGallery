import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight, MessageSquare, Heart } from 'lucide-react';
import { getPhotos } from '../api/photos';
import { addReaction, getReactionCounts } from '../api/reactions';
import { getComments, addComment } from '../api/comments';
import type { CommentResponse } from '../types/comment';
import ReactionSelector from './Reactions/ReactionSelector';
import useLongPressReaction from '../hooks/useLongPressReaction';
import './SliderModal.css';

interface SliderModalProps {
  startId: number;
  onClose: () => void;
}

interface MediaItem {
  id: number;
  isVideo: boolean;
  src: string;
}

const EMOJI_MAP: Record<string, string> = {
  HEART: '❤️',
  LAUGH: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡',
  LIKE: '👍',
  DISLIKE: '👎',
};

const SliderModal: React.FC<SliderModalProps> = ({ startId, onClose }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [index, setIndex] = useState(0);
  const [heartKey, setHeartKey] = useState<number>(0);
  const lastTapRef = useRef<number>(0);
  const { show: showPicker, handlers, close, open } = useLongPressReaction();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showNav, setShowNav] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const fetchItems = useCallback(async () => {
    const res = await getPhotos(0, 100, 'uploadTime', 'desc');
    const mapped = res.content.map<MediaItem>(p => ({
      id: p.id,
      isVideo: p.isVideo ?? (p as { video?: boolean }).video ?? false,
      src: `${API_URL}/photos/${p.fileName}`,
    }));
    setItems(mapped);
    const idx = mapped.findIndex(p => p.id === startId);
    setIndex(idx >= 0 ? idx : 0);
  }, [API_URL, startId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const loadComments = useCallback(async (photoId: number) => {
    const res = await getComments(photoId, 0, 50);
    setComments(res.content);
  }, []);

  const loadReactions = useCallback(async (photoId: number) => {
    try {
      const counts = await getReactionCounts(photoId);
      const mapped = Object.fromEntries(
        counts.filter(r => EMOJI_MAP[r.type]).map(r => [EMOJI_MAP[r.type], r.count])
      );
      setReactions(mapped);
    } catch (err) {
      console.error('Error loading reactions:', err);
    }
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      loadComments(items[index].id);
      loadReactions(items[index].id);
    }
  }, [index, items, loadComments, loadReactions]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = original;
    };
  }, [onClose]);

  const navTimer = useRef<NodeJS.Timeout | null>(null);
  const resetNavTimer = () => {
    setShowNav(true);
    if (navTimer.current) clearTimeout(navTimer.current);
    navTimer.current = setTimeout(() => setShowNav(false), 3000);
  };

  useEffect(() => {
    resetNavTimer();
    const showHandler = () => resetNavTimer();
    document.addEventListener('mousemove', showHandler);
    document.addEventListener('touchstart', showHandler);
    return () => {
      document.removeEventListener('mousemove', showHandler);
      document.removeEventListener('touchstart', showHandler);
    };
  }, []);

  if (items.length === 0) return null;

  const prev = () => {
    resetNavTimer();
    setIndex(i => (i === 0 ? items.length - 1 : i - 1));
  };
  const next = () => {
    resetNavTimer();
    setIndex(i => (i === items.length - 1 ? 0 : i + 1));
  };
  const current = items[index];

  const showHeart = async () => {
    setHeartKey(Date.now());
    try {
      await addReaction(items[index].id, { type: 'HEART' });
      await loadReactions(items[index].id);
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  const handleTap = () => {
    if (showPicker) {
      lastTapRef.current = 0;
      return;
    }

    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      showHeart();
    }

    lastTapRef.current = now;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    resetNavTimer();
    handlers.onTouchStart?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    handlers.onTouchEnd?.(e);
    const endX = e.changedTouches[0].clientX;
    if (touchStartX.current !== null) {
      const delta = endX - touchStartX.current;
      if (Math.abs(delta) > 50) {
        if (delta > 0) {
          prev();
        } else {
          next();
        }
      }
    }
    touchStartX.current = null;
    handleTap();
  };


  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment(items[index].id, { text: newComment.trim() });
      setNewComment('');
      await loadComments(items[index].id);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const modal = (
    <div className="slider-modal-backdrop" onClick={onClose}>
      <div className="slider-modal" onClick={e => e.stopPropagation()}>
        <button
          className={`nav-btn left${showNav ? '' : ' hidden'}`}
          onClick={prev}
          aria-label="Poprzednie"
        >
          <ChevronLeft size={32} />
        </button>
        <div
          className="media-wrapper"
          onMouseDown={handlers.onMouseDown}
          onMouseUp={handlers.onMouseUp}
          onMouseLeave={handlers.onMouseLeave}
          onClick={handleTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {current.isVideo ? (
            <video src={current.src} controls className="slider-media" />
          ) : (
            <img src={current.src} className="slider-media" />
          )}
          {heartKey > 0 && (
            <span key={heartKey} className="double-tap-heart">❤️</span>
          )}
          {showPicker && (
            <ReactionSelector
              photoId={items[index].id}
              onSelect={() => loadReactions(items[index].id)}
              onClose={close}
            />
          )}
          <div className="action-bar">
            <div className="action-item" onClick={() => setShowComments(s => !s)}>
              <MessageSquare size={20} />
              <span>{comments.length}</span>
            </div>
            <div className="action-item" onClick={() => open()}>
              <Heart size={20} />
              <span>{Object.values(reactions).reduce((a, b) => a + b, 0)}</span>
            </div>
          </div>
        </div>
        <button
          className={`nav-btn right${showNav ? '' : ' hidden'}`}
          onClick={next}
          aria-label="Następne"
        >
          <ChevronRight size={32} />
        </button>
        <div className="thumbnail-strip">
          {items.map((p, i) => (
            <img
              key={p.id}
              src={p.src}
              className={`thumbnail ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        {showComments && (
          <section className="comments-section">
          <h2 className="comments-title">Komentarze</h2>
          {comments.length === 0 ? (
            <p className="no-comments-msg">Brak komentarzy</p>
          ) : (
            <ul className="comment-list">
              {comments.map(c => (
                <li key={c.id} className="comment-item">
                  <div className="comment-avatar">
                    {c.deviceName.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-bubble">
                    <div className="comment-author">{c.deviceName}</div>
                    <div>{c.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendComment();
              }
            }}
            placeholder="Dodaj komentarz…"
            rows={2}
            className="comment-input"
          />
          </section>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default SliderModal;
