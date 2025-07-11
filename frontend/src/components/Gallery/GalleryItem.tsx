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
        const timeout = setTimeout(() => {
            setShowReactions(true);
        }, 400); // przytrzymanie 0.4s
        setReactionTimeout(timeout);
    };

    const handleHoldEnd = () => {
        if (reactionTimeout) clearTimeout(reactionTimeout);
    };

    const renderMedia = () => {
        if (item.isVideo) {
            return (
                <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                    <video
                        src={item.src}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                    />
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

            {showReactions && (
                <ReactionSelector
                    photoId={item.id}
                    onSelect={() => {}}
                    onClose={() => setShowReactions(false)}
                />
            )}

            {/* Dolny pasek: komentarze + reakcje */}
            <div className="absolute bottom-1 left-1 w-auto bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center space-x-3 backdrop-blur-sm">
                <div className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{item.commentCount}</span>
                </div>

                {item.reactions &&
                    Object.entries(item.reactions)
                        .slice(0, 3)
                        .map(([emoji, count]) => (
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
