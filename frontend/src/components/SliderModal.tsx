import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPhotos } from '../api/photos';
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

const SliderModal: React.FC<SliderModalProps> = ({ startId, onClose }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [index, setIndex] = useState(0);
  const [heartKey, setHeartKey] = useState<number>(0);
  const lastTapRef = useRef<number>(0);
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

  if (items.length === 0) return null;

  const prev = () => setIndex(i => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex(i => (i === items.length - 1 ? 0 : i + 1));
  const current = items[index];

  const showHeart = () => {
    setHeartKey(Date.now());
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      showHeart();
    }
    lastTapRef.current = now;
  };

  const modal = (
    <div className="slider-modal-backdrop" onClick={onClose}>
      <div className="slider-modal" onClick={e => e.stopPropagation()}>
        <button className="nav-btn left" onClick={prev} aria-label="Poprzednie">
          <ChevronLeft size={32} />
        </button>
        <div className="media-wrapper" onClick={handleTap} onDoubleClick={showHeart}>
          {current.isVideo ? (
            <video src={current.src} controls className="slider-media" />
          ) : (
            <img src={current.src} className="slider-media" />
          )}
          {heartKey > 0 && (
            <span key={heartKey} className="double-tap-heart">❤️</span>
          )}
        </div>
        <button className="nav-btn right" onClick={next} aria-label="Następne">
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
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default SliderModal;
