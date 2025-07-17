import React from 'react';
import './ReactionSummary.css';

interface ReactionSummaryProps {
    reactions: Record<string, number>;
    className?: string;
}

const ReactionSummary: React.FC<ReactionSummaryProps> = ({ reactions, className }) => {
    const entries = Object.entries(reactions);
    if (entries.length === 0) return null;
    return (
        <div className={`reaction-summary${className ? ` ${className}` : ''}`}>
            {entries.map(([emoji, count]) => (
                <span key={emoji} className="reaction-item">
                    <span>{emoji}</span>
                    <span>{count}</span>
                </span>
            ))}
        </div>
    );
};

export default ReactionSummary;
