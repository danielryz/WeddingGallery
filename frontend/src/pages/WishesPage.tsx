import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhotos } from '../api/photos';
import type { PhotoResponse } from '../types/photo';
import GalleryGrid, { type GalleryItemData } from '../components/Gallery/GalleryGrid';
import WishUploadForm from '../components/Wishes/WishUploadForm';
import './WishesPage.css';
import { isAdmin, isThisDevice } from '../utils/authUtils';

const WishesPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItemData[]>([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    (async () => {
      try {
        const page = await getPhotos(0, 100, 'uploadTime', 'desc');
        const wishes = page.content
          .filter((p: PhotoResponse) =>
            p.isWish && (p.isVisibleForGuest || isAdmin() || isThisDevice(p.deviceId))
          )
          .map((p: PhotoResponse) => ({
            id: p.id,
            isVideo: p.isVideo ?? false,
            src: `${API_URL}/photos/${p.fileName}`,
            commentCount: p.commentCount,
            reactionCount: p.reactionCount,
            reactions: {},
            isVisibleForGuest: p.isVisibleForGuest,
            isWish: p.isWish,
          }));
        setItems(wishes);
      } catch (err) {
        console.error('Błąd pobierania życzeń:', err);
      }
    })();
  }, [API_URL]);

  const handleItemClick = (id: number) => {
    navigate(`/photo/${id}`);
  };

  return (
    <main className="wishes-page">
      <h1 className="wishes-title">Życzenia</h1>
      <WishUploadForm />
      <GalleryGrid items={items} onItemClick={handleItemClick} />
    </main>
  );
};

export default WishesPage;
