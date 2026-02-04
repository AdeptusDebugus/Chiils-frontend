import React, { useState, useEffect } from 'react';
import { getWordBank, type Word } from '../../../services/lessonService';
import ConfirmModal from './ConfirmModal';
import './SelectWordsPopup.css';

const iconClose = "/assets/home/close.svg";
const iconCheckMark = "/assets/home/check-mark.svg";

interface SelectWordsPopupProps {
    setName: string;
    onClose: () => void;
    onSave: (wordIds: string[]) => void;
    initialWordIds?: string[];
    title?: string;
}

const SelectWordsPopup: React.FC<SelectWordsPopupProps> = ({
    setName,
    onClose,
    onSave,
    initialWordIds = [],
    title = "Create custom set"
}) => {
    const [allWords, setAllWords] = useState<Word[]>([]);
    const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set(initialWordIds));
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                setLoading(true);
                // We'll fetch a large batch for selection, or implement search/pagination if needed
                // For now, let's get the first 50 words from the bank
                const data = await getWordBank({ page: 0, size: 100 });
                setAllWords(data.content);
            } catch (e) {
                console.error('Failed to fetch word bank', e);
            } finally {
                setLoading(false);
            }
        };
        fetchWords();
    }, []);

    const toggleWord = (wordId: string) => {
        setSelectedWordIds(prev => {
            const next = new Set(prev);
            if (next.has(wordId)) next.delete(wordId);
            else next.add(wordId);
            return next;
        });
    };

    const selectedWords = allWords.filter(w => selectedWordIds.has(w.id));

    const handleSave = () => {
        onSave(Array.from(selectedWordIds));
    };

    const handleCloseAttempt = () => {
        const hasChanges = selectedWordIds.size !== initialWordIds.length ||
            !initialWordIds.every(id => selectedWordIds.has(id));

        if (hasChanges) {
            setShowConfirmModal(true);
        } else {
            onClose();
        }
    };

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="select-words-overlay">
            <div className="select-words-content">
                <header className="select-words-header">
                    <h2>{title}</h2>
                    <div className="header-actions">
                        <button onClick={handleSave} title="Save">
                            <img src={iconCheckMark} alt="Save" />
                        </button>
                        <button className="close-btn" onClick={handleCloseAttempt} title="Close">
                            <img src={iconClose} alt="Close" />
                        </button>
                    </div>
                </header>

                <div className="select-words-body">
                    <div className="words-column">
                        <h3>All words</h3>
                        <div className="words-list">
                            {loading ? (
                                <div className="loading">Loading words...</div>
                            ) : (
                                allWords.map(word => (
                                    <div
                                        key={word.id}
                                        className={`vocab-sidebar-card selection-mode ${selectedWordIds.has(word.id) ? 'selected' : ''}`}
                                        onClick={() => toggleWord(word.id)}
                                    >
                                        <div className="vocab-sidebar-content">
                                            <h3>{word.term} — {word.translation}</h3>
                                            <div className="time-code">
                                                <span className="time-link">{formatTime(word.time_code)}</span>
                                            </div>
                                            <p className="quote">«{word.quote}»</p>
                                            <p className="explanation">{word.translated_explanation}</p>
                                            {word.another_example && <p className="example">{word.another_example}</p>}
                                        </div>
                                        <div className="checkbox" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="words-column">
                        <h3>{setName}</h3>
                        <div className="words-list">
                            {selectedWords.length === 0 ? (
                                <div className="empty-selection">Select words from the left to add them to your set</div>
                            ) : (
                                selectedWords.map(word => (
                                    <div key={word.id} className="vocab-sidebar-card selected selection-mode">
                                        <div className="vocab-sidebar-content">
                                            <h3>{word.term} — {word.translation}</h3>
                                            <div className="time-code">
                                                <span className="time-link">{formatTime(word.time_code)}</span>
                                            </div>
                                            <p className="quote">«{word.quote}»</p>
                                            <p className="explanation">{word.translated_explanation}</p>
                                            {word.another_example && <p className="example">{word.another_example}</p>}
                                        </div>
                                        <div className="checkbox" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {showConfirmModal && (
                    <ConfirmModal
                        title="Save this word set or skip?"
                        onSecondary={onClose}
                        onPrimary={handleSave}
                        secondaryText="Skip"
                        primaryText="Save set"
                    />
                )}
            </div>
        </div>
    );
};

export default SelectWordsPopup;
