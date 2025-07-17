// src/components/Reactions/ReactionSelector.tsx
import React, { useEffect, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { createPopper, type Instance } from '@popperjs/core';
import { addReaction } from '../../api/reactions';
import './ReactionSelector.css';

interface Props {
    photoId?: number;
    onSelect?: (emoji: string) => void;
    onClose: () => void;
    addReactionFn?: (emoji: string) => Promise<void>;
    triggerRef: React.RefObject<HTMLDivElement | null>;
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

const EMOJI_LABELS: Record<string, string> = {
    '❤️': 'Heart',
    '😂': 'Laugh',
    '😮': 'Wow',
    '😢': 'Sad',
    '😡': 'Angry',
    '👍': 'Like',
    '👎': 'Dislike',
};

const ReactionSelector: React.FC<Props> = ({
                                               photoId,
                                               onSelect,
                                               onClose,
                                               addReactionFn,
                                               triggerRef,
                                           }) => {
    const [popperEl, setPopperEl] = useState<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const popperInstance = useRef<Instance | null>(null);

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

    useEffect(() => {
        if (triggerRef.current && popperEl) {
            popperInstance.current = createPopper(
                triggerRef.current,
                popperEl,
                {
                    placement: 'bottom-start',
                    modifiers: [
                        { name: 'flip', options: { fallbackPlacements: ['bottom-end', 'top-start'] } } as any,
                        { name: 'preventOverflow', options: { padding: 8 } } as any,
                    ],
                }
            );
        }
        return () => {
            popperInstance.current?.destroy();
            popperInstance.current = null;
        };
    }, [triggerRef, popperEl]);

    return createPortal(
        <div
            ref={node => {
                setPopperEl(node);
                containerRef.current = node;
            }}
            className="reaction-selector"
            role="menu"
        >
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
        </div>,
        document.body
    ) as ReactElement;
};

export default ReactionSelector;
