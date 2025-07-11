import React from 'react';

interface MediaItem {
    id: number;
    type: 'image' | 'video';
    src: string;        // URL do obrazka lub filmu (miniatury/pliku video)
    comments: number;   // liczba komentarzy do wyświetlenia
}

const GalleryItem: React.FC<{ item: MediaItem }> = ({ item }) => {
    return (
        <div className="relative aspect-square overflow-hidden rounded-lg shadow">
            {item.type === 'image' ? (
                <img src={item.src} alt="miniatura" className="w-full h-full object-cover" />
            ) : (
                <video src={item.src} className="w-full h-full object-cover" muted controls />
            )}
            {/* Ikona komentarza z liczbą w prawym dolnym rogu */}
            <div className="absolute bottom-1 right-1 bg-white/80 rounded-full px-2 py-0.5 text-xs text-gray-800 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5
                   6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234
                   2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112
                   c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023
                   3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0012
                   2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625
                   1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125
                   1.125 0 100 2.25 1.125 1.125 0 000-2.25z" />
                </svg>
                {item.comments}
            </div>
        </div>
    );
};

const GalleryGrid: React.FC<{ items: MediaItem[] }> = ({ items }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(media => (
            <GalleryItem key={media.id} item={media} />
        ))}
    </div>
);

export default GalleryGrid;
