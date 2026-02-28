import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WordSetsPage.css';
import {
    getWordSets,
    createWordSet,
    deleteWordSet,
    renameWordSet,
    getWordSetWords,
    addWordsToWordSet,
    removeWordFromWordSet,
    type WordSet
} from '../../../services/wordSetService';
import { type Word } from '../../../services/lessonService';
import { useAuth } from '../../../contexts/AuthContext';
import CreateFolderModal from './CreateFolderModal';
import SelectWordsPopup from './SelectWordsPopup';
import ConfirmModal from './ConfirmModal';
import SetSavedModal from './SetSavedModal';
import WordSetsPopup from './WordSetsPopup';
import LessonBuilderButton from '../lesson-builder/LessonBuilderButton.tsx';
import AddStudentModal from './AddStudentModal';
import SharedToSidebar from './SharedToSidebar';


const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";
const iconWordSets = "/assets/home/star.svg";
const iconPlus = "/assets/home/plus.svg";
const iconSpeaker = "/assets/home/volume.svg"; // Assuming this exists or using a fallback
const iconPlay = "/assets/home/play.svg";
const iconShuffle = "/assets/home/shuffle.svg";
const iconFullscreen = "/assets/home/fullscreen.svg";
const iconEdit = "/assets/home/edit.svg";
const iconExternal = "/assets/home/external.svg";
const iconShared = "/assets/home/shared.svg";
const iconStarFilled = "/assets/home/star-filled.svg";
const iconAsterisk = "/assets/home/asterisk.svg"; // For the top right button

const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const WordSetsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const location = useLocation();
    const setsRowRef = useRef<HTMLDivElement>(null);
    const isTransitioningRef = useRef(false);

    // Get initial state if passed via navigation
    const initialCreateMode = location.state?.initialCreateMode || false;

    const [wordSets, setWordSets] = useState<WordSet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Naming modal state
    const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'rename' | 'edit'>('create');
    const [selectedSet, setSelectedSet] = useState<WordSet | null>(null);
    const [tempSetName, setTempSetName] = useState<string>('');

    // Word selection state
    const [isSelectWordsOpen, setIsSelectWordsOpen] = useState(false);
    const [localIsInitialCreate, setLocalIsInitialCreate] = useState(initialCreateMode);

    // Detail view state
    const [activeSet, setActiveSet] = useState<WordSet | null>(null);
    const [activeSetWords, setActiveSetWords] = useState<Word[]>([]);
    const [isWordsLoading, setIsWordsLoading] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Menu state
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [deletingSetId, setDeletingSetId] = useState<string | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isWordSetsPopupOpen, setIsWordSetsPopupOpen] = useState(false);

    // Student Modal State
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isManageStudentsModalOpen, setIsManageStudentsModalOpen] = useState(false);
    const [studentsRefreshKey, setStudentsRefreshKey] = useState(0);

    // Fetch word sets on mount
    useEffect(() => {
        fetchSets();
        if (initialCreateMode) {
            openCreateModal();
        }
    }, [initialCreateMode]);

    // Handle selectedSetId from navigation
    useEffect(() => {
        if (!loading && wordSets.length > 0) {
            const selectedSetId = location.state?.selectedSetId;
            if (selectedSetId) {
                const found = wordSets.find(s => s.id === selectedSetId);
                if (found) {
                    setActiveSet(found);
                }
            }
        }
    }, [loading, wordSets, location.state]);

    const fetchSets = async () => {
        try {
            setLoading(true);
            const createdSets = await getWordSets();
            const sharedSets = await import('../../../services/wordSetService').then(m => m.getSharedWordSets());

            // Map shared sets to ensure they have unique IDs or flags if needed
            // For now assuming IDs are unique across all sets
            // We might want to distinguish them visually or by actions (e.g. can't delete shared set)
            // But for now, just merge.

            // Note: If user is STUDENT, createdSets might be empty, which is fine.
            setWordSets([...createdSets, ...sharedSets]);
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

    // Close on escape (only for modals/detail view)
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isSelectWordsOpen) {
                    setIsSelectWordsOpen(false);
                } else if (activeSet) {
                    setActiveSet(null);
                } else if (!isNamingModalOpen && !isSuccessModalOpen && !deletingSetId && !isAddStudentModalOpen && !isManageStudentsModalOpen) {
                    navigate('/home');
                } else if (isAddStudentModalOpen) {
                    setIsAddStudentModalOpen(false);
                } else if (isManageStudentsModalOpen) {
                    setIsManageStudentsModalOpen(false);
                }
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [navigate, activeSet, isNamingModalOpen, isSelectWordsOpen, isSuccessModalOpen, deletingSetId, isAddStudentModalOpen]);

    const handleCreateNameSubmit = async (name: string) => {
        setTempSetName(name);
        isTransitioningRef.current = true;
        setIsNamingModalOpen(false);
        setIsSelectWordsOpen(true);
    };

    const handleFinalSave = async (wordIds: string[]) => {
        try {
            if (modalMode === 'edit' && activeSet) {
                // To "edit", we sync the differences
                const currentIds = activeSetWords.map(w => w.id);
                const toAdd = wordIds.filter(id => !currentIds.includes(id));
                const toRemove = currentIds.filter(id => !wordIds.includes(id));

                if (toAdd.length > 0) {
                    await addWordsToWordSet(activeSet.id, toAdd);
                }
                if (toRemove.length > 0) {
                    await removeWordFromWordSet(activeSet.id, toRemove);
                }

                // Update local state and word list count
                const updatedWords = await getWordSetWords(activeSet.id);
                setActiveSetWords(updatedWords);
                setWordSets(prev => prev.map(s => s.id === activeSet.id ? { ...s, word_count: updatedWords.length } : s));
            } else {
                const newSet = await createWordSet(tempSetName);
                if (wordIds.length > 0) {
                    await addWordsToWordSet(newSet.id, wordIds);
                    newSet.word_count = wordIds.length;
                }
                setWordSets(prev => [...prev, newSet]);
                if (modalMode === 'create') setIsSuccessModalOpen(true);
                setTempSetName('');
            }
            setIsSelectWordsOpen(false);
            setLocalIsInitialCreate(false);
        } catch (e) {
            console.error('Failed to save set with words', e);
            setError('Failed to save word set');
        }
    };

    const handleRenameSet = async (name: string) => {
        if (!selectedSet) return;
        const updated = await renameWordSet(selectedSet.id, name);
        setWordSets(prev => prev.map(s => s.id === updated.id ? updated : s));
        if (activeSet?.id === updated.id) setActiveSet(updated);
        setIsNamingModalOpen(false);
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

    const openEditWordsModal = () => {
        if (!activeSet) return;
        setModalMode('edit');
        setTempSetName(activeSet.name);
        setIsSelectWordsOpen(true);
    };

    const openRenameModal = (e: React.MouseEvent, set: WordSet) => {
        e.stopPropagation();
        setModalMode('rename');
        setSelectedSet(set);
        setIsNamingModalOpen(true);
        setActiveMenu(null);
    };

    const handleCardNav = (direction: 'next' | 'prev') => {
        if (activeSetWords.length === 0) return;
        setIsFlipped(false);
        if (direction === 'next') {
            setCurrentCardIndex(prev => (prev + 1) % activeSetWords.length);
        } else {
            setCurrentCardIndex(prev => (prev - 1 + activeSetWords.length) % activeSetWords.length);
        }
    };

    const handleShuffle = () => {
        if (activeSetWords.length <= 1) return;

        const currentWordId = activeSetWords[currentCardIndex].id;
        let shuffled = [...activeSetWords].sort(() => Math.random() - 0.5);

        // If the first word is the same as the current one, swap it with a random one
        if (shuffled[0].id === currentWordId) {
            const swapIndex = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
            [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
        }

        setActiveSetWords(shuffled);
        setCurrentCardIndex(0);
        setIsFlipped(false);
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

    const handleTermClick = (index: number) => {
        setCurrentCardIndex(index);
        setIsFlipped(false);
    };

    const handleClose = () => {
        navigate('/home');
    };

    /* Better voice implementation will be added later
    const handleSpeak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9; // Slightly slower for better clarity
            window.speechSynthesis.speak(utterance);
        }
    };
    */

    const handleExpandClick = () => {
        setIsWordSetsPopupOpen(true);
    };

    const openAddStudentModal = () => {
        setIsAddStudentModalOpen(true);
    };

    const openManageStudentsModal = () => {
        setIsManageStudentsModalOpen(true);
    };

    return (
        <div className="word-sets-page">
            <header className="word-sets-header">
                <h1>{activeSet ? activeSet.name : 'Word sets'}</h1>
                <div className="header-controls">
                    {user?.role !== 'STUDENT' && <LessonBuilderButton />}
                </div>
            </header>

            <div className="word-sets-layout">
                {/* Main Study Area */}
                <div className="study-main-area">
                    {activeSet && activeSetWords.length > 0 ? (
                        <div className="flashcard-container">
                            <div
                                className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <div className="flashcard-inner">
                                    <div className="flashcard-front">
                                        {/* Hiding speaker-btn until better voice implementation is ready
                                        <button
                                            className="speaker-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSpeak(activeSetWords[currentCardIndex].term);
                                            }}
                                        >
                                            <img src={iconSpeaker} alt="Speak" />
                                        </button>
                                        */}
                                        <div className="flashcard-content">
                                            <h2 className="term">{activeSetWords[currentCardIndex].term}</h2>
                                            <p className="quote">«{activeSetWords[currentCardIndex].quote || activeSetWords[currentCardIndex].translation}»</p>
                                        </div>
                                    </div>
                                    <div className="flashcard-back">
                                        <div className="flashcard-content">
                                            <h2 className="term">{activeSetWords[currentCardIndex].translation}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flashcard-controls">
                                <div className="nav-group">
                                    <button onClick={() => handleCardNav('prev')}><img src={iconNavLeft} alt="Prev" /></button>
                                    <button onClick={() => handleCardNav('next')}><img src={iconNavRight} alt="Next" /></button>
                                </div>
                                <span className="progress">{currentCardIndex + 1} / {activeSetWords.length}</span>
                                <div className="action-group">
                                    <button><img src={iconPlay} alt="Play" /></button>
                                    <button onClick={handleShuffle}><img src={iconShuffle} alt="Shuffle" /></button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flashcard-placeholder">
                            <p>{loading ? 'Loading...' : 'Select a word set to start studying'}</p>
                        </div>
                    )}

                    <div className="collections-section">
                        {isWordSetsPopupOpen ? (
                            <WordSetsPopup
                                onClose={() => setIsWordSetsPopupOpen(false)}
                                onSetsUpdated={fetchSets}
                            />
                        ) : (
                            <div className="collections-container">
                                <div className="section-header">
                                    <h2>Word sets</h2>
                                    <div className="section-controls">
                                        <button className="nav-arrow" onClick={() => handleScroll('left')}>
                                            <img src={iconNavLeft} alt="Previous" />
                                        </button>
                                        <button className="nav-arrow" onClick={() => handleScroll('right')}>
                                            <img src={iconNavRight} alt="Next" />
                                        </button>
                                        <button className="expand-btn" onClick={handleExpandClick}>
                                            <img src={iconFullscreen} alt="Expand" />
                                        </button>
                                    </div>
                                </div>
                                <div className="collections-content" ref={setsRowRef}>
                                    {wordSets.map(set => (
                                        <div
                                            key={set.id}
                                            className={`collection-item ${activeSet?.id === set.id ? 'active' : ''}`}
                                            onClick={() => setActiveSet(set)}
                                        >
                                            <div className="collection-info">
                                                <h3>{set.name}</h3>
                                                <p>{set.word_count} words</p>
                                            </div>
                                            <div className="collection-icon-wrapper">
                                                <div className="collection-icon">
                                                    <img src={iconWordSets} alt={set.name} />
                                                </div>
                                                {user?.role !== 'STUDENT' && (
                                                    <button
                                                        className="folder-menu-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === set.id ? null : set.id);
                                                        }}
                                                    >⋯</button>
                                                )}
                                            </div>
                                            {activeMenu === set.id && (
                                                <div className="folder-menu">
                                                    <button onClick={(e) => openRenameModal(e, set)}>Rename</button>
                                                    <button onClick={(e) => handleDeleteClick(e, set.id)}>Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {user?.role !== 'STUDENT' && (
                                        <div className="collection-item add-set-item" onClick={openCreateModal}>
                                            <div className="collection-info">
                                                <h3>Add word set</h3>
                                            </div>
                                            <div className="collection-icon add-icon">
                                                <img src={iconPlus} alt="Add" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Terms Sidebar */}
                <aside className="terms-sidebar">
                    <div className="sidebar-header">
                        <h3>Terms in this set ({activeSetWords.length})</h3>
                        {user?.role !== 'STUDENT' && (
                            <div className="sidebar-actions">
                                <button onClick={openEditWordsModal}><img src={iconEdit} alt="Edit" /></button>
                                <button onClick={openAddStudentModal}><img src={iconExternal} alt="Open" /></button>
                                <button
                                    onClick={() => setIsManageStudentsModalOpen(!isManageStudentsModalOpen)}
                                    className={isManageStudentsModalOpen ? 'active' : ''}
                                >
                                    <img src={iconShared} alt="Manage Students" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="terms-list">
                        {isManageStudentsModalOpen && <SharedToSidebar key={studentsRefreshKey} />}
                        {isWordsLoading ? (
                            <div className="loading-state">Loading...</div>
                        ) : activeSetWords.map((word, index) => (
                            <div
                                key={word.id}
                                className={`vocab-sidebar-card ${currentCardIndex === index ? 'active' : ''}`}
                                onClick={() => handleTermClick(index)}
                            >
                                <div className="vocab-sidebar-content">
                                    <h3>{word.term} — {word.translation}</h3>
                                    <div className="time-code">
                                        <span
                                            className="time-link"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/lesson/${word.lesson_id}`);
                                            }}
                                            title="Open lesson"
                                        >
                                            {/* {formatTime(word.time_code)} */}
                                            View lesson
                                        </span>
                                    </div>
                                    <p className="quote">«{word.quote}»</p>
                                    <p className="explanation">{word.translated_explanation}</p>
                                    {word.another_example && <p className="example">{word.another_example}</p>}
                                </div>
                                <div className="color-indicator" />
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

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
                        if (localIsInitialCreate && !isTransitioningRef.current) navigate('/home');
                        isTransitioningRef.current = false;
                    }}
                    onSave={modalMode === 'create' ? handleCreateNameSubmit : handleRenameSet}
                    existingNames={wordSets.map(s => s.name)}
                    title={modalMode === 'create' ? "Name your word set" : "Rename word set"}
                    initialValue={selectedSet?.name || ""}
                    placeholder="My custom set 1"
                />
            )}

            {isSelectWordsOpen && (
                <SelectWordsPopup
                    setName={tempSetName}
                    title={modalMode === 'edit' ? "Edit word set" : "Create custom set"}
                    initialWordIds={modalMode === 'edit' ? activeSetWords.map(w => w.id) : []}
                    onClose={() => {
                        setIsSelectWordsOpen(false);
                        if (localIsInitialCreate) navigate('/home');
                    }}
                    onSave={handleFinalSave}
                />
            )}

            {isSuccessModalOpen && (
                <SetSavedModal
                    onClose={() => {
                        setIsSuccessModalOpen(false);
                        navigate('/home');
                    }}
                    onViewInCollection={() => {
                        setIsSuccessModalOpen(false);
                    }}
                />
            )}

            {isAddStudentModalOpen && (
                <AddStudentModal
                    onClose={() => setIsAddStudentModalOpen(false)}
                    onSuccess={() => {
                        setIsAddStudentModalOpen(false);
                        setStudentsRefreshKey(prev => prev + 1);
                    }}
                    wordSetId={activeSet?.id}
                />
            )}
        </div>
    );
};

export default WordSetsPage;
