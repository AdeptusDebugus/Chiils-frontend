import React, { useState, useEffect } from 'react';
import './CreateFolderModal.css'; // Reuse existing styles
import { addStudent } from '../../../services/studentService';
import { shareLesson } from '../../../services/lessonService';

interface ShareLessonModalProps {
    onClose: () => void;
    onSuccess: () => void;
    lessonId: string;
}

const ShareLessonModal: React.FC<ShareLessonModalProps> = ({ onClose, onSuccess, lessonId }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

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

            // 1. Ensure student is added/linked to teacher
            const student = await addStudent(email);

            // 2. Share the lesson
            if (student.id) {
                await shareLesson(lessonId, student.id);
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to share lesson. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-folder-modal-overlay" onClick={onClose}>
            <div className="create-folder-modal" onClick={e => e.stopPropagation()}>
                <h2>Share Lesson</h2>
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
                            {loading ? 'Sharing...' : 'Share'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareLessonModal;
