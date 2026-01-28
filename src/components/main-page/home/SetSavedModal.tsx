import React from 'react';
import './SetSavedModal.css';

interface SetSavedModalProps {
    onClose: () => void;
    onViewInCollection: () => void;
}

const SetSavedModal: React.FC<SetSavedModalProps> = ({ onClose, onViewInCollection }) => {
    return (
        <div className="set-saved-modal-overlay">
            <div className="set-saved-modal">
                <h2>Set saved!</h2>
                <p>Find it in Collections and share it with your student.</p>
                <div className="set-saved-actions">
                    <button className="close-btn" onClick={onClose}>
                        Close
                    </button>
                    <button className="view-btn" onClick={onViewInCollection}>
                        View in collection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetSavedModal;
