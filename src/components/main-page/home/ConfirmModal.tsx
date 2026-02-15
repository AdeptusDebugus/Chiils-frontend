import React, { useEffect } from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    title: string;
    onSecondary: () => void;
    onPrimary: () => void;
    secondaryText: string;
    primaryText: string;
    variant?: 'danger' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title,
    onSecondary,
    onPrimary,
    secondaryText,
    primaryText,
    variant = 'primary'
}) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onSecondary();
        }
    };

    return (
        <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
            <div className="confirm-modal-content">
                <h2>{title}</h2>
                <div className="confirm-modal-actions">
                    <button className="confirm-modal-secondary-btn" onClick={onSecondary}>
                        {secondaryText}
                    </button>
                    <button
                        className={`confirm-modal-primary-btn ${variant === 'danger' ? 'danger' : ''}`}
                        onClick={onPrimary}
                    >
                        {primaryText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
