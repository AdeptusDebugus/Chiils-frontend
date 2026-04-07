import React, { useState, useEffect } from 'react';
import './BuilderNotification.css';

interface BuilderNotificationProps {
    onUndo: () => void;
    onClose: () => void;
    type?: 'success' | 'info' | 'error';
    message?: string; // Kept for backward compatibility if needed, but we use custom text now
}

const BuilderNotification: React.FC<BuilderNotificationProps> = ({ onUndo, onClose, type = 'info' }) => {
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (timeLeft <= 0) {
            onClose();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onClose]);

    // Format message based on type
    if (type !== 'info') {
        // Fallback for success/error if we use the same component
        return (
            <div className={`builder-notification ${type}`}>
                <div className="notification-text">Generation complete!</div>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
        );
    }

    return (
        <div className="builder-notification info">
            <p className="notification-text">
                You have <span className="underline">{timeLeft} second(s)</span> to undo the generation.
            </p>
            <div className="notification-actions">
                <span className="undo-btn" onClick={onUndo}>Undo</span>
                <img 
                    src="/assets/home/close-circle.svg" 
                    alt="Close" 
                    className="close-icon" 
                    onClick={onClose} 
                />
            </div>
        </div>
    );
};

export default BuilderNotification;
