import React, { useState } from 'react';
import ReactionSelector from '../Reactions/ReactionSelector';
import './GalleryItem.css';

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
        const timeout = setTimeout(() => setShowReactions(true), 400);
        setReactionTimeout(timeout);
    };

    const handleHoldEnd = () => {
        if (reactionTimeout) clearTimeout(reactionTimeout);
    };

    const renderMedia = () => {
        if (item.isVideo) {
            return (
                <div className="video-wrapper">
                    <video
                        src={item.src}
                        className="gallery-media"
                        preload="metadata"
                        muted
                        playsInline
                    />
                    <div className="play-overlay">
                        <span>▶</span>
                    </div>
                </div>
            );
        }
        return (
            <img
                src={item.src}
                alt="media"
                className="gallery-media"
            />
        );
    };

    return (
        <div
            className="gallery-item"
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

            <div className="info-bar">
                <div className="info-item">
                    <span>💬</span>
                    <span>{item.commentCount}</span>
                </div>
                {Object.entries(item.reactions).slice(0, 3).map(([emoji, count]) => (
                    <div key={emoji} className="info-item">
                        <span>{emoji}</span>
                        <span>{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GalleryItem;
