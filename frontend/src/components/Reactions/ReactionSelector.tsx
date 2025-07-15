// src/components/Reactions/ReactionSelector.tsx
import React from 'react';
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


const ReactionSelector: React.FC<Props> = ({ photoId, onSelect, onClose, addReactionFn }) => {
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
        <div className="reaction-selector">
            {Object.keys(EMOJI_MAP).map(emoji => (
                <button
                    key={emoji}
                    aria-label={`Reakcja ${emoji}`}
                    onClick={e => {
                        e.stopPropagation();
                        handleSelect(emoji);
                    }}
                >
                    <span className="reaction-emoji">{emoji}</span>
                </button>
            ))}
        </div>
    );
};

export default ReactionSelector;
