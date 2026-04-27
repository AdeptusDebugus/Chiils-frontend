import React, { useState, useEffect, useRef } from 'react';
import { getLessonFull, openLesson, addLessonWords, type LessonData } from '../../../services/lessonService.ts';
import { useParams } from 'react-router-dom';
import './LessonPage.css';
import { extractYouTubeId, fetchYouTubeTitle } from '../../../utils/youtube.ts';
import { capitalizeFirstLetter } from '../../../utils/text.ts';
import { useAuth } from '../../../contexts/AuthContext';

import SharedToSidebar from '../home/SharedToSidebar';
import AddStudentModal from '../home/AddStudentModal';
import BlockRenderer from './blocks/BlockRenderer';
import { PRESETS } from './blocks/presets';

const parseTimestampToSeconds = (ts: string | number | null): number | null => {
    if (ts === null || ts === undefined || ts === '') return null;
    if (typeof ts === 'number') return ts;
    const parts = ts.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    const n = Number(ts);
    return isNaN(n) ? null : n;
};

const formatTime = (ts: string | number | null): string => {
    const totalSeconds = parseTimestampToSeconds(ts);
    if (totalSeconds === null) return '';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const LessonPage: React.FC = () => {
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const playerRef = useRef<any>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    const { user, isAuthenticated } = useAuth();
    const isPreviewMode = !isAuthenticated || user?.plan == null;
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isManageStudentsModalOpen, setIsManageStudentsModalOpen] = useState(false);
    const [studentsRefreshKey, setStudentsRefreshKey] = useState(0);

    const [showQuizlet, setShowQuizlet] = useState<boolean>(false);
    const quizletRef = useRef<HTMLDivElement>(null);
    const titleCacheRef = useRef<Record<string, string>>({});

    const iconShared = "/assets/home/shared.svg";
    const iconExternal = "/assets/home/external.svg";

    const initPlayer = async (videoId: string) => {
        setIsPlayerReady(false);
        const { ensureYouTubeAPI } = await import('../../../utils/youtube.ts');
        await ensureYouTubeAPI();
        const w = window as any;

        // Reset the player instance if it already exists to avoid duplicate containers
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
            try {
                playerRef.current.destroy();
            } catch (e) {
                console.warn('Failed to destroy existing player', e);
            }
        }

        // Re-create the empty div as the target because YT.Player replaces it
        const container = document.querySelector('.video-embed');
        if (container) {
            container.innerHTML = '<div id="yt-player"></div>';
        }

        playerRef.current = new w.YT.Player('yt-player', {
            videoId,
            width: '100%',
            height: '100%',
            host: 'https://www.youtube-nocookie.com',
            playerVars: {
                rel: 0,
                modestbranding: 1,
                origin: window.location.origin,
                autoplay: 0,
            },
            events: {
                onReady: () => {
                    console.log('YouTube Player is ready');
                    setIsPlayerReady(true);
                },
                onError: (e: any) => console.error('YouTube Player Error:', e.data),
            }
        });
    };

    const seekTo = (seconds: number) => {
        if (playerRef.current && isPlayerReady && typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(seconds, true);
            playerRef.current.playVideo && playerRef.current.playVideo();
        } else {
            console.warn('Player not ready for seekTo');
        }
    };

    const scrollToPlayerAndSeek = (seconds: number) => {
        const el = document.querySelector('.video-section');
        if (el && typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Wait for smooth scroll to finish/start before seeking
        if (isPlayerReady) {
            seekTo(seconds);
        } else {
            const checkReady = setInterval(() => {
                if (isPlayerReady) {
                    seekTo(seconds);
                    clearInterval(checkReady);
                }
            }, 100);
            setTimeout(() => clearInterval(checkReady), 3000); // Timeout after 3s
        }
    };

    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                if (!id) {
                    setError('No lesson id provided');
                    setLesson(null);
                    return;
                }
                const full = await getLessonFull(id);
                setLesson(full);
                setError(null);
            } catch (err) {
                setError('Failed to load lesson');
                console.error('Error loading lesson:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    useEffect(() => {
        if (id && !isPreviewMode) {
            openLesson(id).catch(err => console.error('Failed to track lesson open', err));
            addLessonWords(id).catch(err => console.error('Failed to add lesson words', err));
        }
    }, [id, isPreviewMode]);

    useEffect(() => {
        if (!lesson) return;
        const youUrl = lesson.youtube_url || lesson.you_tube_url || '';
        const videoId = youUrl ? extractYouTubeId(youUrl) : null;
        if (videoId) initPlayer(videoId);
    }, [lesson]);

    useEffect(() => {
        if (!lesson || !lesson.youtube_url) return;
        const existing = lesson.you_tube_title?.trim();
        if (existing) return;

        const cached = titleCacheRef.current[lesson.youtube_url];
        if (cached) {
            setLesson(prev => (prev ? { ...prev, you_tube_title: cached } : prev));
            return;
        }

        let cancelled = false;
        (async () => {
            const t = await fetchYouTubeTitle(lesson.youtube_url!);
            if (cancelled || !t) return;
            titleCacheRef.current[lesson.youtube_url!] = t;
            setLesson(prev => (prev ? { ...prev, you_tube_title: t } : prev));
        })();

        return () => { cancelled = true; };
    }, [lesson]);

    const displayTitleRaw =
        lesson?.you_tube_title?.trim() ||
        lesson?.tags?.lesson_theme ||
        lesson?.lesson_topic ||
        'Lesson';
    const displayTitle = capitalizeFirstLetter(displayTitleRaw);

    useEffect(() => {
        if (!lesson) return;
        if (displayTitle) document.title = displayTitle;
    }, [lesson?.you_tube_title, lesson?.tags?.lesson_theme, lesson?.lesson_topic, displayTitle]);

    const handleToggleQuizlet = () => {
        const newState = !showQuizlet;
        setShowQuizlet(newState);
        if (newState) {
            // Wait for expansion animation/render
            setTimeout(() => {
                quizletRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const handleCopyQuizlet = () => {
        if (lesson?.word_bank?.quizlet_export) {
            navigator.clipboard.writeText(lesson.word_bank.quizlet_export)
                .then(() => {
                    console.log('Quizlet export copied to clipboard');
                })
                .catch(err => {
                    console.error('Failed to copy Quizlet export: ', err);
                });
        }
    };

    if (loading) {
        return (
            <div className="lesson-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading lesson...</p>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="lesson-page">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error || 'Lesson not found'}</p>
                </div>
            </div>
        );
    }

    const lessonTopicTitle = capitalizeFirstLetter(lesson.lesson_topic || '');
    const presetBlocks = lesson.preset_name ? PRESETS[lesson.preset_name] : [];

    return (
        <div className={`lesson-page ${isPreviewMode ? 'preview-mode' : ''}`}>
            <div className="page-title">
                <h1 className="page-title-text">{displayTitle}</h1>
            </div>
            <div className="lesson-layout">
                <div className="lesson-tags-panel">
                    <div className="lesson-tags-group">
                        {lesson.tags?.language && (
                            <div className="lesson-tag">{lesson.tags.language}</div>
                        )}
                        {lesson.tags?.language_level && (
                            <div className="lesson-tag">{lesson.tags.language_level}</div>
                        )}
                        {lesson.preset_name && (
                            <div className="lesson-tag">{capitalizeFirstLetter(lesson.preset_name)}</div>
                        )}
                    </div>
                    <div className="sidebar-actions">
                        {user?.role !== 'STUDENT' && (
                            <>
                                <button
                                    onClick={() => {
                                        if (!isPreviewMode) {
                                            setIsAddStudentModalOpen(true);
                                        }
                                    }}
                                    title="Add Student"
                                    disabled={isPreviewMode}
                                >
                                    <img src={iconExternal} alt="Open" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (!isPreviewMode) {
                                            setIsManageStudentsModalOpen(!isManageStudentsModalOpen);
                                        }
                                    }}
                                    className={isManageStudentsModalOpen ? 'active' : ''}
                                    title="Manage Students"
                                    disabled={isPreviewMode}
                                >
                                    <img src={iconShared} alt="Manage Students" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="main-content">
                    {lesson.lesson_topic && (
                        <div className="lesson-header">
                            <h1 className="lesson-title">{lessonTopicTitle}</h1>
                        </div>
                    )}


                    <div className="video-section">
                        <div className="video-embed">
                            <div id="yt-player"></div>
                        </div>
                    </div>

                    <div className="all-exercises-container">
                        {presetBlocks.map((block, idx) => (
                            <BlockRenderer
                                key={block.id}
                                block={block}
                                data={lesson.preset_data?.[block.id]}
                                index={idx}
                                grammarTopics={lesson.grammar_topics}
                                previewMode={isPreviewMode}
                            />
                        ))}
                    </div>


                </div>

                {/* Sidebar */}
                <aside className="lesson-sidebar">
                    <div className="vocabulary-sidebar">
                        <div className="vocabulary-header">
                            <h2>Word Bank</h2>
                        </div>

                        {isManageStudentsModalOpen && id && (
                            <SharedToSidebar
                                lessonId={id}
                                refreshKey={studentsRefreshKey}
                            />
                        )}

                        <div className="vocabulary-list">
                            {lesson.word_bank?.items.map((word, i) => {
                                const seconds = parseTimestampToSeconds(word.timestamp);
                                return (
                                    <div key={i} className="vocab-sidebar-card">
                                        <div className="vocab-sidebar-content">
                                            <h3>{word.expression}</h3>
                                            {seconds !== null && (
                                                <a
                                                    className="time-link"
                                                    onClick={() => scrollToPlayerAndSeek(seconds)}
                                                >
                                                    {formatTime(word.timestamp)}
                                                </a>
                                            )}
                                            <p className="quote">"{word.quote}"</p>
                                            <p className="explanation">{word.meaning}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {lesson.word_bank?.quizlet_export && (
                        <div className="quizlet-sidebar-block" ref={quizletRef}>
                            <div className="quizlet-sidebar-header">
                                <h2>Quizlet export</h2>
                                <button
                                    type="button"
                                    className="quizlet-toggle-btn"
                                    onClick={handleToggleQuizlet}
                                >
                                    {showQuizlet ? 'Hide' : 'Show'}
                                    <img 
                                        src={showQuizlet ? "/assets/lesson/expand_up.svg" : "/assets/lesson/expand_down.svg"} 
                                        alt="" 
                                    />
                                </button>
                            </div>

                            {showQuizlet && (
                                <div className="quizlet-sidebar-content">
                                    <ol className="quizlet-instructions-list">
                                        <li>Open Quizlet and click the “+” in the top-right corner.</li>
                                        <li>Choose “Flashcard set” and click “Import”</li>
                                        <li>Copy the text below and paste it into the import box.</li>
                                        <li>In settings, set the term/definition separator to “comma” and the card separator to “semicolon.”</li>
                                        <li>Tap “Import” in the bottom-right corner.</li>
                                    </ol>
                                    <div className="quizlet-export-container">
                                        <button 
                                            className="quizlet-copy-btn" 
                                            onClick={handleCopyQuizlet}
                                            title="Copy to clipboard"
                                        >
                                            <img src="/assets/lesson/copy.svg" alt="" />
                                        </button>
                                        <div className="quizlet-export-box">
                                            <p>{lesson.word_bank.quizlet_export}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </aside>
            </div>

            {isAddStudentModalOpen && id && (
                <AddStudentModal
                    onClose={() => setIsAddStudentModalOpen(false)}
                    lessonId={id}
                    onSuccess={() => {
                        setStudentsRefreshKey(prev => prev + 1);
                        setIsManageStudentsModalOpen(true);
                    }}
                />
            )}
        </div>
    );
};

export default LessonPage;
