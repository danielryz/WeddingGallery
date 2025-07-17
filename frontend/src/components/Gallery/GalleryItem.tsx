// src/components/GalleryItem/GalleryItem.tsx
import React, { useRef } from 'react';
import ReactionSelector from '../Reactions/ReactionSelector';
import useLongPressReaction from '../../hooks/useLongPressReaction';
import './GalleryItem.css';
import { MessageSquare, Heart } from 'lucide-react';

interface GalleryItemProps {
    item: {
        id: number;
        isVideo: boolean;
        src: string;
        commentCount: number;
        reactionCount: number;
        reactions: Record<string, number>;
        isVisibleForGuest: boolean;
        isWish: boolean;
    };
    onItemClick?: (id: number) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, onItemClick }) => {
    const { show: showReactions, handlers, close } = useLongPressReaction();

    const triggerRef = useRef<HTMLDivElement | null>(null);

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
        return <img src={item.src} alt="media" className="gallery-media" />;
    };

    return (
        <div className="gallery-item-background">
            <div
                className="gallery-item"
                ref={triggerRef}          // ⇐ teraz zgadza się typ: Ref<HTMLDivElement>
                {...handlers}
                onClick={() => {
                    if (showReactions) return;
                    onItemClick?.(item.id);
                }}
            >
                {renderMedia()}

                {showReactions && (
                    <ReactionSelector
                        triggerRef={triggerRef}
                        photoId={item.id}
                        onSelect={() => {}}
                        onClose={close}
                    />
                )}

                <div className="info-bar comment-bar">
                    <div className="info-item">
                        <MessageSquare size={16} />
                        <span>{item.commentCount}</span>
                    </div>
                </div>

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
