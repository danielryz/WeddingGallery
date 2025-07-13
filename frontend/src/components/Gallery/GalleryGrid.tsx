import React from 'react';
import GalleryItem from './GalleryItem';
import './GalleryGrid.css';

export interface GalleryItemData {
    id: number;
    isVideo: boolean;
    src: string;
    thumbnail?: string;
    commentCount: number;
    reactionCount: number;
    reactions: Record<string, number>;
}

interface GalleryGridProps {
    items: GalleryItemData[];
    onItemClick?: (id: number) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ items, onItemClick }) => {
    if (!items || items.length === 0) {
        return <p className="empty-msg">Brak zawartości w galerii.</p>;
    }
    return (
            <div className="gallery-grid">
                {items.map(item => (
                    <GalleryItem key={item.id} item={item} onItemClick={onItemClick} />
                ))}
            </div>
    );
};

export default GalleryGrid;
