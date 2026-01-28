import React from 'react';
import './FolderNotification.css';

const iconClose = "/assets/home/close-circle.svg";

interface FolderNotificationProps {
    folderName: string;
    onUndo: () => void;
    onClose: () => void;
}

const FolderNotification: React.FC<FolderNotificationProps> = ({ folderName, onUndo, onClose }) => {
    return (
        <div className="folder-notification-pill">
            <div className="notification-text">
                Saved to <span className="folder-name-link">{folderName}</span>
            </div>
            <div className="notification-actions">
                <button className="undo-btn" onClick={onUndo}>Undo</button>
                <button className="close-notif-btn" onClick={onClose}>
                    <img src={iconClose} alt="Close" />
                </button>
            </div>
        </div>
    );
};

export default FolderNotification;
