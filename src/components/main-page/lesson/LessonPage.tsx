import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getLessonFull, openLesson, addLessonWords, type LessonData } from '../../../services/lessonService.ts';
import { useNavigate, useParams } from 'react-router-dom';
import './LessonPage.css';
import { extractYouTubeId, fetchYouTubeTitle } from '../../../utils/youtube.ts';
import { capitalizeFirstLetter } from '../../../utils/text.ts';
import { useAuth } from '../../../contexts/AuthContext';

import SharedToSidebar from '../home/SharedToSidebar';
import AddStudentModal from '../home/AddStudentModal';
import BlockRenderer from './blocks/BlockRenderer';
import { PRESETS } from './blocks/presets';
import MobileDesktopStub from '../../lending/MobileDesktopStub';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileStubOpen, setIsMobileStubOpen] = useState(false);

    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const isPreviewMode = !isAuthenticated || user?.plan == null && user?.role != "STUDENT";
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
        if (!isMobileMenuOpen && !isMobileStubOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setIsMobileStubOpen(false);
            }
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMobileMenuOpen, isMobileStubOpen]);

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
    const wordItems = lesson.word_bank?.items ?? [];
    const videoUrl = lesson.youtube_url || lesson.you_tube_url || '';
    const videoId = videoUrl ? extractYouTubeId(videoUrl) : null;
    const mobileTags = [
        lesson.tags?.language,
        lesson.tags?.language_level,
        lesson.grammar_topics?.[0],
        lesson.preset_name && capitalizeFirstLetter(lesson.preset_name)
    ].filter(Boolean).join(', ');
    const mobileExerciseSummaries = presetBlocks.map(block => ({
        title: block.static?.title?.replace(/^Exercise\s+\S+\s+[–—-]\s+/i, '') || capitalizeFirstLetter(block.type.replace(/_/g, ' ')),
        description: block.static?.instruction || ''
    }));

    const lessonMobileFooter = (
        <div className="lesson-mobile-footer">
            <div className="lesson-mobile-desktop-prompt">
                <div className="lesson-mobile-footer-inner">
                    Log in on desktop
                    <br />
                    to explore the full
                    <br />
                    version
                </div>
            </div>

            <div className="lesson-mobile-footer-panel">
                <div className="lesson-mobile-footer-inner">
                    <button type="button" className="lesson-mobile-get-started" onClick={() => setIsMobileStubOpen(true)}>
                        Get started &rarr;
                    </button>
                    <img src="/assets/chiils-black-logo.svg" alt="Chiils" className="lesson-mobile-footer-logo" />
                    <button
                        type="button"
                        className="lesson-mobile-footer-button"
                        onClick={() => window.open('https://tally.so/r/KYlp6V', '_blank', 'noopener,noreferrer')}
                    >
                        Contact support
                    </button>
                    <button
                        type="button"
                        className="lesson-mobile-footer-button"
                        onClick={() => { window.location.href = 'mailto:team@chiils.com'; }}
                    >
                        team@chiils.com
                    </button>
                    <div className="lesson-mobile-footer-links">
                        <a href="/privacypolicy">Privacy policy</a>
                        <a href="/termsofservice">Terms &amp; Conditions</a>
                        <a href="/refundpolicy">Refund policy</a>
                        <span>Copyright &copy; Koala Station DOO Beograd, {new Date().getFullYear()}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
        <div className={`lesson-page ${isPreviewMode ? 'preview-mode' : ''}`}>
            <div className="lesson-mobile-view">
                <div className="lesson-mobile-topbar">
                    <img src="/assets/chiils-black-logo.svg" alt="Chiils" className="lesson-mobile-logo" />
                    <button
                        className="lesson-mobile-menu-button"
                        type="button"
                        aria-label="Open navigation menu"
                        aria-expanded={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <img src="/assets/lending/burger.svg" alt="" aria-hidden="true" />
                    </button>
                </div>

                <button className="lesson-mobile-back" type="button" onClick={() => navigate('/open-library')}>
                    <img src="/assets/go-back.svg" alt="" aria-hidden="true" />
                    Open Library
                </button>

                <h1 className="lesson-mobile-title">{displayTitle}</h1>

                <div className="lesson-mobile-stats">
                    <div className="lesson-mobile-stat">
                        <span className="lesson-mobile-stat-icon check"></span>
                        {presetBlocks.length || 7} exercises
                    </div>
                    <div className="lesson-mobile-stat">
                        <span className="lesson-mobile-stat-icon words"></span>
                        {wordItems.length || 10} new words
                    </div>
                    <div className="lesson-mobile-stat">
                        <span className="lesson-mobile-stat-icon flag"></span>
                        {(lesson.grammar_topics?.length || 1)} grammar point
                    </div>
                </div>

                <div className="lesson-mobile-tags-line">
                    <span className="lesson-mobile-check-ring"></span>
                    <span>{mobileTags || 'English, B1'}</span>
                </div>

                <div className="lesson-mobile-video">
                    {videoId ? (
                        <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt={displayTitle} />
                    ) : (
                        <div className="lesson-mobile-video-placeholder"></div>
                    )}
                </div>

                <section className="lesson-mobile-words">
                    <h2>Words inside</h2>
                    <div className="lesson-mobile-section-line"></div>
                    <div className="lesson-mobile-word-strip">
                        {wordItems.slice(0, 4).map((word, index) => (
                            <div className="lesson-mobile-word-card" key={`${word.expression}-${index}`}>
                                <h3>{word.expression}</h3>
                                <p>{word.meaning}</p>
                                <p className="lesson-mobile-word-quote">"{word.quote}"</p>
                                {word.timestamp !== null && (
                                    <button type="button" onClick={() => {
                                        const seconds = parseTimestampToSeconds(word.timestamp);
                                        if (seconds !== null) scrollToPlayerAndSeek(seconds);
                                    }}>
                                        {formatTime(word.timestamp)}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="lesson-mobile-exercises">
                    <h2>Exercises inside</h2>
                    <div className="lesson-mobile-section-line"></div>
                    <div className="lesson-mobile-exercise-list">
                        {mobileExerciseSummaries.map((item, index) => (
                            <div className="lesson-mobile-exercise-item" key={`${item.title}-${index}`}>
                                <div>
                                    <span className="lesson-mobile-check-ring"></span>
                                    <h3>{item.title}</h3>
                                </div>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {isMobileMenuOpen && (
                    <div className="lesson-mobile-menu-overlay" role="dialog" aria-modal="true" aria-label="Mobile navigation">
                        <div className="lesson-mobile-menu-panel">
                            <div className="lesson-mobile-menu-top">
                                <img src="/assets/chiils-white-logo.svg" alt="Chiils" className="lesson-mobile-menu-logo" />
                                <button
                                    className="lesson-mobile-menu-close"
                                    type="button"
                                    aria-label="Close navigation menu"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    x
                                </button>
                            </div>
                            <nav className="lesson-mobile-menu-nav" aria-label="Mobile navigation links">
                                <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }}>Home</button>
                                <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/login', { state: { hideSignInLink: true } }); }}>Student log in</button>
                                <button type="button" onClick={() => { setIsMobileMenuOpen(false); navigate('/open-library'); }}>Open Library</button>
                                <button type="button" disabled aria-disabled="true">Log in / Sign up</button>
                                <p>Available on Desktop</p>
                            </nav>
                            <div className="lesson-mobile-menu-actions">
                                <button type="button" onClick={() => window.open('https://tally.so/r/KYlp6V', '_blank', 'noopener,noreferrer')}>Contact support</button>
                                <button type="button" onClick={() => { window.location.href = 'mailto:team@chiils.com'; }}>team@chiils.com</button>
                            </div>
                        </div>
                    </div>
                )}
                {isMobileStubOpen && (
                    <MobileDesktopStub
                        onBack={() => setIsMobileStubOpen(false)}
                        onContinue={() => {
                            setIsMobileStubOpen(false);
                            navigate('/');
                        }}
                    />
                )}
            </div>

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
                                <div className="lesson-share-buttons">
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
                                </div>
                                {isManageStudentsModalOpen && id && (
                                    <div className="lesson-shared-to-popover">
                                        <SharedToSidebar
                                            lessonId={id}
                                            refreshKey={studentsRefreshKey}
                                        />
                                    </div>
                                )}
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
        {createPortal(lessonMobileFooter, document.querySelector('.app.lesson-route') ?? document.body)}
        </>
    );
};

export default LessonPage;
