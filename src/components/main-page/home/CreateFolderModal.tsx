import React, { useState, useEffect } from 'react';
import './CreateFolderModal.css';

interface CreateFolderModalProps {
    onClose: () => void;
    onSave: (name: string) => Promise<void> | void;
    existingNames?: string[];
    title?: string;
    initialValue?: string;
    placeholder?: string;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
    onClose,
    onSave,
    existingNames = [],
    title = "Please name your folder",
    initialValue = "",
    placeholder
}) => {
    const [folderName, setFolderName] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleSave = async () => {
        if (!folderName.trim()) {
            setError('Name cannot be empty');
            return;
        }

        const trimmedName = folderName.trim();
        if (existingNames.some(name => name.toLowerCase() === trimmedName.toLowerCase() && name.toLowerCase() !== initialValue.trim().toLowerCase())) {
            setError('This name already exists');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            await onSave(folderName.trim());
            onClose();
        } catch (e: any) {
            console.error('Failed to save', e);
            if (e.response?.status === 409) {
                setError('This name already exists');
            } else {
                setError('Failed to save');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="create-folder-modal-overlay" onClick={handleOverlayClick}>
            <div className="create-folder-modal">
                <h2>{title}</h2>

                {error && <div className="modal-error-message">{error}</div>}

                <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || (initialValue || "My custom folder 1")}
                    autoFocus
                    maxLength={50}
                    disabled={isSaving}
                />

                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
};

export default CreateFolderModal;
