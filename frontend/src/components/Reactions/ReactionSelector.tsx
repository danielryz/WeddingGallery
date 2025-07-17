// src/components/Reactions/ReactionSelector.tsx
import React, { useEffect, useRef } from 'react';
import { addReaction } from '../../api/reactions';
import './ReactionSelector.css';

interface Props {
    photoId?: number;
    onSelect?: (emoji: string) => void;
    onClose: () => void;
    addReactionFn?: (emoji: string) => Promise<void>;
}

// mapujemy unicode → typ dla API
const EMOJI_MAP: Record<string, string> = {
    '❤️': 'HEART',
    '😂': 'LAUGH',
    '😮': 'WOW',
    '😢': 'SAD',
    '😡': 'ANGRY',
    '👍': 'LIKE',
    '👎': 'DISLIKE',
};

// Labels used for screen readers
const EMOJI_LABELS: Record<string, string> = {
    '❤️': 'Heart',
    '😂': 'Laugh',
    '😮': 'Wow',
    '😢': 'Sad',
    '😡': 'Angry',
    '👍': 'Like',
    '👎': 'Dislike',
};


const ReactionSelector: React.FC<Props> = ({ photoId, onSelect, onClose, addReactionFn }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        };
    }, [onClose]);

    const handleSelect = async (emoji: string) => {
        const type = EMOJI_MAP[emoji];
        if (!type) return;
        if (addReactionFn) {
            await addReactionFn(emoji);
        } else if (photoId !== undefined) {
            await addReaction(photoId, { type });
        }
        onSelect?.(emoji);
        onClose();
    };

    return (
        <div className="reaction-selector" ref={containerRef}>
            {Object.keys(EMOJI_MAP).map(emoji => (
                <button
                    key={emoji}
                    aria-label={`${EMOJI_LABELS[emoji]} reaction`}
                    onClick={e => {
                        e.stopPropagation();
                        handleSelect(emoji);
                    }}
                >
                    <span aria-hidden="true" className="reaction-emoji">{emoji}</span>
                    <span className="sr-only">{`${EMOJI_LABELS[emoji]} reaction`}</span>
                </button>
            ))}
        </div>
    );
};

export default ReactionSelector;
