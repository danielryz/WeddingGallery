import React, { useState } from 'react';
import ReactionSelector from '../Reactions/ReactionSelector';
import './GalleryItem.css';
import {MessageSquare, Heart} from 'lucide-react';


interface GalleryItemProps {
    item: {
        id: number;
        isVideo: boolean;
        src: string;
        commentCount: number;
        reactionCount: number;
        reactions: Record<string, number>;
    };
    onItemClick?: (id: number) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, onItemClick }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [reactionTimeout, setReactionTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleHoldStart = () => {
        // Po ~400ms przytrzymania pokażemy panel reakcji
        const timeout = setTimeout(() => setShowReactions(true), 400);
        setReactionTimeout(timeout);
    };

    const handleHoldEnd = () => {
        // Anuluj pokazanie panelu, jeśli puszczono przed upływem 400ms
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
        <div className="gallery-item-background">
        <div
            className="gallery-item"
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onClick={() => onItemClick?.(item.id)}
        >
            {renderMedia()}

            {/* Panel wyboru reakcji (po długim przytrzymaniu) */}
            {showReactions && (
                <ReactionSelector
                    photoId={item.id}
                    onSelect={() => { /* reakcja zostanie dodana w ReactionSelector */ }}
                    onClose={() => setShowReactions(false)}
                />
            )}

            {/* Licznik komentarzy – lewy dolny róg */}
            <div className="info-bar comment-bar">
                <div className="info-item">
                    <MessageSquare size={16} />
                    <span>{item.commentCount}</span>
                </div>
            </div>

            {/* Ikony reakcji – prawy dolny róg (widoczne tylko jeśli są reakcje) */}
            {Object.entries(item.reactions).length > 0 && (
                <div className="info-bar reactions-bar">
                        <div className="info-item">
                            <Heart size={16} />
                            <span>{item.reactionCount}</span>
                        </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default GalleryItem;
