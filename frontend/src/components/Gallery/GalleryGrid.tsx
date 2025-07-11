import React from 'react';
import GalleryItem from './GalleryItem';

export interface GalleryItemData {
    id: number;
    isVideo: boolean;
    src: string;
    thumbnail?: string;
    commentCount: number;
    reactions: Record<string, number>;
}

interface GalleryGridProps {
    items: GalleryItemData[];
    onItemClick?: (id: number) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ items, onItemClick }) => {
    if (!items || items.length === 0) {
        return <p className="text-center text-brown mt-6">Brak zawartości w galerii.</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((item) => (
                <GalleryItem key={item.id} item={item} onItemClick={onItemClick} />
            ))}
        </div>
    );
};

export default GalleryGrid;
