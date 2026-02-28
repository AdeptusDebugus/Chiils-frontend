import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentHomePage.css';
// Import HomePage.css to reuse styles
import './HomePage.css';
import { useAuth } from '../../../contexts/AuthContext';
import { getSharedWordSets, getWordSetWords, type WordSet } from '../../../services/wordSetService';
import { getMyTeacher, type Student } from '../../../services/studentService';
import { getUserLessonsLite, getSharedLessons, type LessonLite, type Word } from '../../../services/lessonService';
import { paddleService } from '../../../services/paddleService';
import HomeLessonCard from './HomeLessonCard';
import WordSetsPopup from './WordSetsPopup';
import MyLessonsExpanded from './MyLessonsExpanded';

const iconWordSet = "/assets/home/star.svg";
const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";
const iconExpand = "/assets/home/fullscreen.svg";

// Helper to format word count
const getWordCountLabel = (count: number) => {
    if (count === 1) return '1 word';
    return `${count} words`;
};

const StudentHomePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State
    const [sharedSets, setSharedSets] = useState<WordSet[]>([]);
    const [sharedLessons, setSharedLessons] = useState<LessonLite[]>([]);
    const [teacher, setTeacher] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    // Word Bank State
    const [wordBankWords, setWordBankWords] = useState<Word[]>([]);
    const [isWordBankLoading, setIsWordBankLoading] = useState(false);

    const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

    const lessonsGridRef = useRef<HTMLDivElement>(null);
    const collectionsGridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setIsWordBankLoading(true);

                // 1. Fetch Shared Word Sets
                const sets = await getSharedWordSets();
                setSharedSets(sets);

                // 2. Fetch Words from all Shared Sets
                if (sets.length > 0) {
                    const allWordsPromises = sets.map(set => getWordSetWords(set.id));
                    const allWordsArrays = await Promise.all(allWordsPromises);

                    // Flatten and deduplicate by ID
                    const allWords = allWordsArrays.flat();
                    // Simple deduplication
                    const uniqueWordsMap = new Map();
                    allWords.forEach(w => uniqueWordsMap.set(w.id, w));
                    const uniqueWords = Array.from(uniqueWordsMap.values()) as Word[];

                    setWordBankWords(uniqueWords);
                } else {
                    setWordBankWords([]);
                }

                // 3. Fetch Teacher
                const myTeacher = await getMyTeacher();
                setTeacher(myTeacher);

                // 4. Fetch Shared Lessons (specifically shared with this student)
                const lessons = await getSharedLessons();
                setSharedLessons(lessons);
            } catch (error) {
                console.error('Failed to fetch student data', error);
            } finally {
                setLoading(false);
                setIsWordBankLoading(false);
            }
        };

        fetchData();
    }, []);


    const handleSetClick = (setId: string) => {
        navigate('/word-sets', { state: { selectedSetId: setId } });
    };

    const handleLessonClick = (lessonId: string) => {
        navigate(`/lesson/${lessonId}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleLessonScroll = (direction: 'left' | 'right') => {
        if (lessonsGridRef.current) {
            const { scrollLeft } = lessonsGridRef.current;
            const scrollAmount = 336; // 320px card + 16px gap
            const newScrollLeft = scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            lessonsGridRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const [isWordSetsPopupOpen, setIsWordSetsPopupOpen] = useState(false);
    const [isLessonsExpandedOpen, setIsLessonsExpandedOpen] = useState(false);

    const handleCollectionScroll = (direction: 'left' | 'right') => {
        if (collectionsGridRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = collectionsGridRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            collectionsGridRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const handleExpandClick = () => {
        setIsWordSetsPopupOpen(true);
    };

    return (
        <div className="dashboard-page student-homepage-layout">
            <header className="dashboard-header">
                <h1>Hello, {firstName}</h1>
                <div className="header-controls">
                    <button className="student-action-btn logout" onClick={handleLogout}>Log out</button>
                </div>
            </header>
            <main className="dashboard-main-content">
                {/* 1st Block: Shared Lessons */}
                <section className="my-lessons-section">
                    <div className="my-lessons-container">
                        <div className="section-header">
                            <h2>Shared Lessons</h2>
                            <div className="section-controls">
                                <button className="nav-arrow" onClick={() => handleLessonScroll('left')}>
                                    <img src={iconNavLeft} alt="Previous" />
                                </button>
                                <button className="nav-arrow" onClick={() => handleLessonScroll('right')}>
                                    <img src={iconNavRight} alt="Next" />
                                </button>
                                <button className="expand-btn" onClick={() => setIsLessonsExpandedOpen(true)}>
                                    <img src={iconExpand} alt="Expand" />
                                </button>
                            </div>
                        </div>

                        {loading && sharedLessons.length === 0 ? (
                            <div className="loading-state">Loading lessons...</div>
                        ) : sharedLessons.length > 0 ? (
                            <div className="home-lessons-grid" ref={lessonsGridRef}>
                                {sharedLessons.map(lesson => (
                                    <HomeLessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        onClick={() => handleLessonClick(lesson.id)}
                                        showActions={false}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">No lessons shared by your teacher yet.</div>
                        )}
                    </div>
                </section>

                {/* 2nd Block: Shared Word Sets */}
                <section className="collections-section">
                    <div className="collections-container">
                        <div className="section-header">
                            <h2>Shared Word Sets</h2>
                            <div className="section-controls">
                                <button className="nav-arrow" onClick={() => handleCollectionScroll('left')}>
                                    <img src={iconNavLeft} alt="Previous" />
                                </button>
                                <button className="nav-arrow" onClick={() => handleCollectionScroll('right')}>
                                    <img src={iconNavRight} alt="Next" />
                                </button>
                                <button className="expand-btn" onClick={handleExpandClick}>
                                    <img src={iconExpand} alt="Expand" />
                                </button>
                            </div>
                        </div>

                        {loading && sharedSets.length === 0 ? (
                            <div className="loading-state">Loading word sets...</div>
                        ) : sharedSets.length > 0 ? (
                            <div className="collections-content" ref={collectionsGridRef}>
                                {sharedSets.map(set => (
                                    <div
                                        key={set.id}
                                        className="collection-item"
                                        onClick={() => handleSetClick(set.id)}
                                    >
                                        <div className="collection-info">
                                            <h3>{set.name}</h3>
                                            <p>{getWordCountLabel(set.word_count)}</p>
                                        </div>
                                        <div className="collection-icon">
                                            <img src={iconWordSet} alt="Word Set" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">No word sets shared with you yet.</div>
                        )}
                    </div>
                </section>
            </main>

            {isWordSetsPopupOpen && (
                <WordSetsPopup
                    onClose={() => setIsWordSetsPopupOpen(false)}
                    onSetsUpdated={async () => {
                        const sets = await getSharedWordSets();
                        setSharedSets(sets);
                    }}
                />
            )}

            {isLessonsExpandedOpen && (
                <MyLessonsExpanded
                    onClose={() => setIsLessonsExpandedOpen(false)}
                    variant="student"
                />
            )}

            {/* Right Sidebar - Word Bank */}
            <aside className="sidebar-right">
                <div className="word-bank-section">
                    <div className="word-bank-title">
                        <h2>Word Bank</h2>
                    </div>
                    <div className="word-bank-list">
                        {isWordBankLoading ? (
                            <div className="word-bank-loading">Loading...</div>
                        ) : wordBankWords.length === 0 ? (
                            <div className="word-bank-empty">Your Word Bank is empty.</div>
                        ) : (
                            <>
                                {wordBankWords.map((word) => (
                                    <div key={word.id} className="vocab-sidebar-card">
                                        <div className="vocab-sidebar-content">
                                            <h3>{word.term} — {word.translation}</h3>
                                            <div className="time-code">
                                                <span
                                                    className="time-link"
                                                    onClick={() => navigate(`/lesson/${word.lesson_id}`)}
                                                    title="Open lesson"
                                                >
                                                    View lesson
                                                </span>
                                            </div>
                                            <p className="quote">«{word.quote}»</p>
                                            <p className="explanation">{word.translated_explanation}</p>
                                            {word.another_example && <p className="example">{word.another_example}</p>}
                                        </div>
                                    </div>
                                ))}


                            </>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default StudentHomePage;
