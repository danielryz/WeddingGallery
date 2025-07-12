import React, { useState } from 'react';
import ReactionSelector from '../Reactions/ReactionSelector';

interface GalleryItemProps {
    item: {
        id: number;
        isVideo: boolean;
        src: string;
        commentCount: number;
        reactions: Record<string, number>;
    };
    onItemClick?: (id: number) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, onItemClick }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [reactionTimeout, setReactionTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleHoldStart = () => {
        // Po przytrzymaniu przez 400ms pokaż selektor emotikon
        const timeout = setTimeout(() => setShowReactions(true), 400);
        setReactionTimeout(timeout);
    };

    const handleHoldEnd = () => {
        // Anuluj pokazanie reakcji, jeśli przycisk został zwolniony wcześniej
        if (reactionTimeout) clearTimeout(reactionTimeout);
    };

    // Renderuj obraz lub miniaturę filmu
    const renderMedia = () => {
        if (item.isVideo) {
            return (
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                    <video
                        src={item.src}
                        className="w-full h-full object-cover"
                        preload="metadata" muted playsInline
                    />
                    {/* Ikona "play" na środku miniatury filmu */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-4xl drop-shadow">▶</span>
                    </div>
                </div>
            );
        }
        return (
            <img
                src={item.src}
                alt="media"
                className="w-full h-full object-cover rounded-lg"
            />
        );
    };

    return (
        <div
            className="relative cursor-pointer group aspect-square overflow-hidden rounded-lg"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onClick={() => onItemClick?.(item.id)}
        >
            {renderMedia()}

            {/* Selektor reakcji (emotikony) wyświetlany po przytrzymaniu */}
            {showReactions && (
                <ReactionSelector
                    photoId={item.id}
                    onSelect={() => {}}
                    onClose={() => setShowReactions(false)}
                />
            )}

            {/* Dolny pasek informacji: liczba komentarzy + skrótowe reakcje */}
            <div className="absolute bottom-1 left-1 px-2 py-1 text-xs text-white bg-black/60 backdrop-blur-sm
                      rounded flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{item.commentCount}</span>
                </div>
                {Object.entries(item.reactions).slice(0, 3).map(([emoji, count]) => (
                    <div key={emoji} className="flex items-center space-x-1">
                        <span>{emoji}</span>
                        <span>{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GalleryItem;
