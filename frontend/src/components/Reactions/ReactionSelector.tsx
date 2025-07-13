// src/components/Reactions/ReactionSelector.tsx
import React from 'react';
import { addReaction } from '../../api/reactions';
import './ReactionSelector.css';
import {
    Heart,
    Smile,
    Zap,
    Frown,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
} from 'lucide-react';

interface Props {
    photoId: number;
    onSelect: (emoji: string) => void;
    onClose: () => void;
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

// mapujemy unicode → komponent ikony
const ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
    '❤️': Heart,
    '😂': Smile,
    '😮': Zap,
    '😢': Frown,
    '😡': AlertCircle,
    '👍': ThumbsUp,
    '👎': ThumbsDown,
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
            {Object.keys(EMOJI_MAP).map(emoji => {
                const Icon = ICON_MAP[emoji];
                return (
                    <button
                        key={emoji}
                        aria-label={`Reakcja ${emoji}`}
                        onClick={() => handleSelect(emoji)}
                    >
                        <Icon size={24} />
                    </button>
                );
            })}
        </div>
    );
};

export default ReactionSelector;
