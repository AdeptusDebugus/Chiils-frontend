import React, { useState, useEffect } from 'react';
import './CreateFolderModal.css'; // Re-use styles if possible or CreateFolderModal.css handles general modal styles
import { addStudent } from '../../../services/studentService';

interface AddStudentModalProps {
    onClose: () => void;
    onSuccess: () => void;
    wordSetId?: string; // Optional prop
    lessonId?: string; // Optional prop
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onSuccess, wordSetId, lessonId }) => {
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

            // Add student and get back the student object (which contains ID)
            const student = await addStudent(email);

            // If we have a wordSetId, share the set immediately
            if (wordSetId && student.id) {
                await import('../../../services/wordSetService').then(m => m.shareWordSet(wordSetId, student.id));
            }

            // If we have a lessonId, share the lesson immediately
            if (lessonId && student.id) {
                await import('../../../services/lessonService').then(m => m.shareLesson(lessonId, student.id));
            }

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
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;
