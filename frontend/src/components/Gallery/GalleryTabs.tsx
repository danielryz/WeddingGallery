import React, { useState, useEffect } from 'react';
import GalleryGrid, {type GalleryItemData } from './GalleryGrid';
import { getPhotos } from '../../api/photos';
import { getReactionCounts } from '../../api/reactions';
import './GalleryTabs.css';

type MediaType = 'image' | 'video';

interface GalleryTabsProps {
    onItemClick?: (id: number) => void;
}

const GalleryTabs: React.FC<GalleryTabsProps> = ({ onItemClick }) => {
    const [activeTab, setActiveTab] = useState<MediaType>('image');
    const [items, setItems] = useState<GalleryItemData[]>([]);
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const EMOJI_MAP: Record<string, string> = {
        HEART: '❤️', LAUGH: '😂', WOW: '😮', SAD: '😢',
        ANGRY: '😡', LIKE: '👍', DISLIKE: '👎',
    };

    const fetchItems = async (type: MediaType) => {
        setLoading(true);
        try {
            const res = await getPhotos(0, 40, 'uploadTime', 'desc', type);
            const itemsWithReactions = await Promise.all(res.content.map(async item => {
                let reactions: Record<string, number> = {};
                try {
                    const counts = await getReactionCounts(item.id);
                    reactions = Object.fromEntries(
                        counts.filter(r => EMOJI_MAP[r.type]).map(r => [EMOJI_MAP[r.type], r.count])
                    );
                } catch (err) {
                    console.warn(`Brak reakcji dla photo ${item.id}`, err);
                }
                return {
                    id: item.id,
                    isVideo: item.isVideo ?? (item as { video?: boolean }).video ?? false,
                    src: `${API_URL}/photos/${item.fileName}`,
                    commentCount: item.commentCount,
                    reactions
                };
            }));
            setItems(itemsWithReactions);
        } catch (err) {
            console.error('Błąd pobierania galerii:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems(activeTab);
    }, [activeTab]);

    return (
        <div className="gallery-tabs">
            {/* Zakładki */}
            <div className="tabs-header">
                <button
                    className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
                    onClick={() => setActiveTab('image')}
                >
                    Zdjęcia
                </button>
                <button
                    className={`tab-button ${activeTab === 'video' ? 'active' : ''}`}
                    onClick={() => setActiveTab('video')}
                >
                    Filmy
                </button>
            </div>

            {/* Zawartość galerii */}
            {loading ? (
                <p className="loading-text">Ładowanie...</p>
            ) : (
                <GalleryGrid items={items} onItemClick={onItemClick} />
            )}
        </div>
    );
};

export default GalleryTabs;
