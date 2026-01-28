import React, { useState, useEffect, useRef } from 'react';
import './WordSetsPopup.css';
import {
    getWordSets,
    createWordSet,
    deleteWordSet,
    renameWordSet,
    getWordSetWords,
    addWordsToWordSet,
    type WordSet
} from '../../../services/wordSetService';
import { type Word } from '../../../services/lessonService';
import CreateFolderModal from './CreateFolderModal';
import SelectWordsPopup from './SelectWordsPopup';
import ConfirmModal from './ConfirmModal';
import SetSavedModal from './SetSavedModal';

const iconClose = "/assets/home/close-circle.svg";
const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";
const iconWordSets = "/assets/home/star.svg";
const iconPlus = "/assets/home/plus.svg";
const iconDelete = "/assets/home/remove-from-folder.svg"; // Reusing icon for delete

interface WordSetsPopupProps {
    onClose: () => void;
    initialCreateMode?: boolean;
}

const WordSetsPopup: React.FC<WordSetsPopupProps> = ({ onClose, initialCreateMode = false }) => {
    const setsRowRef = useRef<HTMLDivElement>(null);
    const isTransitioningRef = useRef(false);
    const [wordSets, setWordSets] = useState<WordSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Naming modal state
    const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'rename'>('create');
    const [selectedSet, setSelectedSet] = useState<WordSet | null>(null);
    const [tempSetName, setTempSetName] = useState<string>('');

    // Word selection state
    const [isSelectWordsOpen, setIsSelectWordsOpen] = useState(false);
    const [localIsInitialCreate, setLocalIsInitialCreate] = useState(initialCreateMode);

    // Detail view state
    const [activeSet, setActiveSet] = useState<WordSet | null>(null);
    const [activeSetWords, setActiveSetWords] = useState<Word[]>([]);
    const [isWordsLoading, setIsWordsLoading] = useState(false);

    // Menu state (matching CollectionsPopup)
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [deletingSetId, setDeletingSetId] = useState<string | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Fetch word sets on mount
    useEffect(() => {
        fetchSets();
        if (initialCreateMode) {
            openCreateModal();
        }
    }, [initialCreateMode]);

    const fetchSets = async () => {
        try {
            setLoading(true);
            const data = await getWordSets();
            setWordSets(data);
            setError(null);
        } catch (e) {
            console.error('Failed to fetch word sets', e);
            setError('Failed to load word sets');
        } finally {
            setLoading(false);
        }
    };

    // Detail view: fetch words when activeSet changes
    useEffect(() => {
        if (activeSet) {
            (async () => {
                try {
                    setIsWordsLoading(true);
                    const words = await getWordSetWords(activeSet.id);
                    setActiveSetWords(words);
                } catch (e) {
                    console.error('Failed to fetch words in set', e);
                } finally {
                    setIsWordsLoading(false);
                }
            })();
        } else {
            setActiveSetWords([]);
        }
    }, [activeSet]);

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isSelectWordsOpen) {
                    setIsSelectWordsOpen(false);
                } else if (activeSet) {
                    setActiveSet(null);
                } else if (!isNamingModalOpen) {
                    onClose();
                }
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose, activeSet, isNamingModalOpen, isSelectWordsOpen]);

    const handleCreateNameSubmit = async (name: string) => {
        setTempSetName(name);
        isTransitioningRef.current = true;
        setIsNamingModalOpen(false);
        setIsSelectWordsOpen(true);
    };

    const handleFinalSave = async (wordIds: string[]) => {
        try {
            const newSet = await createWordSet(tempSetName);
            if (wordIds.length > 0) {
                await addWordsToWordSet(newSet.id, wordIds);
                // Update the count locally or re-fetch
                newSet.word_count = wordIds.length;
            }
            setWordSets(prev => [...prev, newSet]);
            setIsSelectWordsOpen(false);
            setIsSuccessModalOpen(true);
            setTempSetName('');
            setLocalIsInitialCreate(false);
        } catch (e) {
            console.error('Failed to create set with words', e);
            setError('Failed to create word set');
        }
    };

    const handleRenameSet = async (name: string) => {
        if (!selectedSet) return;
        const updated = await renameWordSet(selectedSet.id, name);
        setWordSets(prev => prev.map(s => s.id === updated.id ? updated : s));
        if (activeSet?.id === updated.id) setActiveSet(updated);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeletingSetId(id);
        setActiveMenu(null);
    };

    const handleDeleteConfirm = async (id: string) => {
        try {
            await deleteWordSet(id);
            setWordSets(prev => prev.filter(s => s.id !== id));
            if (activeSet?.id === id) setActiveSet(null);
        } catch (e) {
            console.error('Failed to delete set', e);
        } finally {
            setDeletingSetId(null);
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedSet(null);
        setIsNamingModalOpen(true);
    };

    const openRenameModal = (e: React.MouseEvent, set: WordSet) => {
        e.stopPropagation();
        setModalMode('rename');
        setSelectedSet(set);
        setIsNamingModalOpen(true);
        setActiveMenu(null);
    };

    const handleScroll = (direction: 'left' | 'right') => {
        if (setsRowRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = setsRowRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            setsRowRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <>
            {(!localIsInitialCreate && !isSelectWordsOpen) && (
                <div className="word-sets-popup-overlay">
                    <div className="word-sets-popup-content">
                        <div className="word-sets-popup-header">
                            <h2>{activeSet ? activeSet.name : 'Word sets'}</h2>
                            <div className="word-sets-popup-controls">
                                {!activeSet && (
                                    <>
                                        <button className="nav-arrow" onClick={() => handleScroll('left')}>
                                            <img src={iconNavLeft} alt="Previous" />
                                        </button>
                                        <button className="nav-arrow" onClick={() => handleScroll('right')}>
                                            <img src={iconNavRight} alt="Next" />
                                        </button>
                                    </>
                                )}
                                <button className="close-btn" onClick={activeSet ? () => setActiveSet(null) : onClose}>
                                    <img src={iconClose} alt="Close" />
                                </button>
                            </div>
                        </div>

                        <div className="word-sets-popup-body">
                            {activeSet ? (
                                <div className="word-set-detail-view">
                                    {isWordsLoading ? (
                                        <div className="loading-state">Loading words...</div>
                                    ) : activeSetWords.length === 0 ? (
                                        <div className="empty-state">No words in this set yet.</div>
                                    ) : (
                                        <div className="words-grid">
                                            {activeSetWords.map(word => (
                                                <div key={word.id} className="vocab-sidebar-card">
                                                    <div className="vocab-sidebar-content">
                                                        <h3>{word.term}</h3>
                                                        <p className="translation">{word.translation}</p>
                                                        {word.quote && <p className="quote">"{word.quote}"</p>}
                                                        {word.translated_explanation && <p className="explanation">{word.translated_explanation}</p>}
                                                        {word.another_example && <p className="example">Ex: {word.another_example}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="word-sets-row">
                                    <h3 className="row-title">My sets</h3>
                                    <div className="word-sets-row-content" ref={setsRowRef}>
                                        {loading ? (
                                            <div className="loading-state">Loading...</div>
                                        ) : error ? (
                                            <div className="error-state">{error}</div>
                                        ) : (
                                            <>
                                                {wordSets.map(set => (
                                                    <div key={set.id} className="collection-item" onClick={() => setActiveSet(set)}>
                                                        <div className="collection-info">
                                                            <h3>{set.name}</h3>
                                                            <p>{set.word_count} words</p>
                                                        </div>
                                                        <div className="collection-icon-wrapper">
                                                            <div className="collection-icon">
                                                                <img src={iconWordSets} alt={set.name} />
                                                            </div>
                                                            <button
                                                                className="folder-menu-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenu(activeMenu === set.id ? null : set.id);
                                                                }}
                                                            >
                                                                ⋯
                                                            </button>
                                                            {activeMenu === set.id && (
                                                                <div className="folder-menu">
                                                                    <button onClick={(e) => openRenameModal(e, set)}>Rename</button>
                                                                    <button onClick={(e) => handleDeleteClick(e, set.id)}>Delete</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add Set Item */}
                                                <div className="collection-item add-set-item" onClick={openCreateModal}>
                                                    <div className="collection-info">
                                                        <h3>Add set</h3>
                                                    </div>
                                                    <div className="collection-icon add-icon">
                                                        <img src={iconPlus} alt="Add" />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {deletingSetId && (
                <ConfirmModal
                    title="Do you want to delete this word set?"
                    onSecondary={() => setDeletingSetId(null)}
                    onPrimary={() => handleDeleteConfirm(deletingSetId)}
                    secondaryText="Go back"
                    primaryText="Delete"
                    variant="danger"
                />
            )}

            {isNamingModalOpen && (
                <CreateFolderModal
                    onClose={() => {
                        setIsNamingModalOpen(false);
                        if (initialCreateMode && !isTransitioningRef.current) onClose();
                        isTransitioningRef.current = false;
                    }}
                    onSave={modalMode === 'create' ? handleCreateNameSubmit : handleRenameSet}
                    title={modalMode === 'create' ? "Name your word set" : "Rename word set"}
                    initialValue={selectedSet?.name || ""}
                    placeholder="My custom set 1"
                />
            )}

            {isSelectWordsOpen && (
                <SelectWordsPopup
                    setName={tempSetName}
                    onClose={() => {
                        setIsSelectWordsOpen(false);
                        if (localIsInitialCreate) onClose();
                    }}
                    onSave={handleFinalSave}
                />
            )}

            {isSuccessModalOpen && (
                <SetSavedModal
                    onClose={() => {
                        setIsSuccessModalOpen(false);
                        onClose();
                    }}
                    onViewInCollection={() => {
                        setIsSuccessModalOpen(false);
                    }}
                />
            )}
        </>
    );
};

export default WordSetsPopup;
