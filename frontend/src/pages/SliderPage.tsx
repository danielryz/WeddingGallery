import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { getPhotos } from '../api/photos';
import { getReactionCounts } from '../api/reactions';
import { getComments, addComment } from '../api/comments';
import type { PhotoResponse } from '../types/photo';
import type { CommentResponse } from '../types/comment';
import ReactionSelector from '../components/Reactions/ReactionSelector';
import { Heart, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import './SliderPage.css';

const EMOJI_MAP: Record<string, string> = {
  HEART: '❤️',
  LAUGH: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡',
  LIKE: '👍',
  DISLIKE: '👎',
};

const SliderPage: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [index, setIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [expandedDesc, setExpandedDesc] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    (async () => {
      const res = await getPhotos(0, 100, 'uploadTime', 'desc');
      setPhotos(res.content);
    })();
  }, []);

  useEffect(() => {
    if (!photos[index]) return;
    const loadData = async () => {
      const counts = await getReactionCounts(photos[index].id);
      setReactions(
        Object.fromEntries(
          counts.filter(c => EMOJI_MAP[c.type]).map(c => [EMOJI_MAP[c.type], c.count]),
        ),
      );
      const comm = await getComments(photos[index].id, 0, 50);
      setComments(comm.content);
      setExpandedDesc(false);
    };
    loadData();
  }, [index, photos]);

  const handlers = useSwipeable({
    onSwipedLeft: () => next(),
    onSwipedRight: () => prev(),
    trackMouse: true,
  });

  const prev = () => setIndex(i => (i === 0 ? photos.length - 1 : i - 1));
  const next = () => setIndex(i => (i === photos.length - 1 ? 0 : i + 1));

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(photos[index].id, { text: newComment.trim() });
    const res = await getComments(photos[index].id, 0, 50);
    setComments(res.content);
    setNewComment('');
    setShowComments(true);
  };

  if (photos.length === 0) {
    return <p className="loading-text">Ładowanie...</p>;
  }

  const photo = photos[index];
  const desc = photo.description || '';
  const truncated = desc.length > 120 && !expandedDesc ? desc.slice(0, 120) + '…' : desc;

  return (
    <main className="slider-page">
      <div className="slider" {...handlers}>
        <button className="nav-btn left" onClick={prev} aria-label="Poprzednie">
          <ChevronLeft size={32} />
        </button>
        <div className="slide-content">
          {photo.isVideo ? (
            <video src={`${API_URL}/photos/${photo.fileName}`} controls className="slide-media" />
          ) : (
            <img src={`${API_URL}/photos/${photo.fileName}`} className="slide-media" />
          )}
          <div className="desc">
            <span>{truncated}</span>
            {desc.length > 120 && (
              <button className="more-btn" onClick={() => setExpandedDesc(e => !e)}>
                {expandedDesc ? 'Ukryj' : 'Więcej'}
              </button>
            )}
          </div>
          <div className="actions">
            <button className="icon-btn" onClick={() => setShowPicker(v => !v)}>
              <Heart size={24} />
            </button>
            <button className="icon-btn" onClick={() => setShowComments(v => !v)}>
              <MessageSquare size={24} />
            </button>
          </div>
          {Object.entries(reactions).length > 0 && (
            <div className="reactions-summary">
              {Object.entries(reactions).map(([e, c]) => (
                <span key={e} className="reaction-item">
                  {e} {c}
                </span>
              ))}
            </div>
          )}
          {showPicker && (
            <ReactionSelector
              photoId={photo.id}
              onSelect={() => {
                setShowPicker(false);
                getReactionCounts(photo.id).then(counts =>
                  setReactions(
                    Object.fromEntries(
                      counts
                        .filter(c => EMOJI_MAP[c.type])
                        .map(c => [EMOJI_MAP[c.type], c.count]),
                    ),
                  ),
                );
              }}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>
        <button className="nav-btn right" onClick={next} aria-label="Następne">
          <ChevronRight size={32} />
        </button>
      </div>

      {showComments && (
        <section className="comments">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <span className="comment-author">{c.deviceName}</span>
              <span>{c.text}</span>
            </div>
          ))}
          <textarea
            className="comment-input"
            rows={2}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddComment();
              }
            }}
            placeholder="Dodaj komentarz…"
          />
        </section>
      )}
    </main>
  );
};

export default SliderPage;
