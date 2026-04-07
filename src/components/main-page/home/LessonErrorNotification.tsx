import React from 'react';
import './LessonErrorNotification.css';

interface LessonErrorNotificationProps {
    onClose: () => void;
}

const LessonErrorNotification: React.FC<LessonErrorNotificationProps> = ({ onClose }) => {
    return (
        <div className="lesson-error-notification-overlay" onClick={onClose}>
            <div className="lesson-error-notification-card" onClick={e => e.stopPropagation()}>
                <div className="notification-content">
                    <h2>Oops...</h2>
                    <p>Something went wrong. Please try again or contact support.</p>
                </div>
                <button className="ok-button" onClick={onClose}>
                    <span>Ok, got it</span>
                </button>
            </div>
        </div>
    );
};

export default LessonErrorNotification;
