import React from 'react';
import { addReaction } from '../../api/reactions';
import './ReactionSelector.css';

interface Props {
    photoId: number;
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const EMOJI_MAP: Record<string, string> = {
    '❤️': 'HEART',
    '😂': 'LAUGH',
    '😮': 'WOW',
    '😢': 'SAD',
    '😡': 'ANGRY',
    '👍': 'LIKE',
    '👎': 'DISLIKE',
};

const ReactionSelector: React.FC<Props> = ({ photoId, onSelect, onClose }) => {
    const handleSelect = async (emoji: string) => {
        const type = EMOJI_MAP[emoji];
        if (!type) return;
        await addReaction(photoId, { type });
        onSelect(emoji);
        onClose();
    };

    return (
        <div className="reaction-selector">
            {Object.keys(EMOJI_MAP).map(emoji => (
                <button
                    key={emoji}
                    onClick={() => handleSelect(emoji)}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default ReactionSelector;
