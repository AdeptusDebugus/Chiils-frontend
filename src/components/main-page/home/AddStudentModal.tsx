import React, { useState } from 'react';
import './CreateFolderModal.css'; // Re-use styles if possible or CreateFolderModal.css handles general modal styles
import { addStudent } from '../../../services/studentService';

interface AddStudentModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await addStudent(email);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to add student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-folder-modal-overlay" onClick={onClose}>
            <div className="create-folder-modal" onClick={e => e.stopPropagation()}>
                <h2>Enter your student’s email</h2>
                {error && <div className="modal-error-message">{error}</div>}
                <form onSubmit={handleSubmit} noValidate>
                    <input
                        type="email"
                        placeholder="Student Email"
                        value={email}
                        onChange={e => {
                            setEmail(e.target.value);
                            if (error) setError(null);
                        }}
                        autoFocus
                        required
                        className="modal-input"
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Adding...' : 'Share'}
                        </button>
                    </div>
                    {/* Optional: Add cancel button if needed, but CreateFolderModal relies on overlay click or Escape usually, though it has no explicit cancel button in view */}
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;
