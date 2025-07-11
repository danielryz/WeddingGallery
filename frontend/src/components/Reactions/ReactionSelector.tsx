import React from 'react';
import { addReaction } from '../../api/reactions';

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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg px-3 py-2 flex space-x-2 z-50">
            {Object.keys(EMOJI_MAP).map((emoji) => (
                <button
                    key={emoji}
                    onClick={() => handleSelect(emoji)}
                    className="text-xl hover:scale-125 transition-transform"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

export default ReactionSelector;
