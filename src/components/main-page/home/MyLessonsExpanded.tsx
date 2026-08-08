import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { type LessonLite, getUserLessonsLite, getSharedLessons } from '../../../services/lessonService.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { globalLessonMonitoring } from '../../../services/globalLessonMonitoring.ts';
import { lessonMonitoringService } from '../../../services/lessonMonitoringService.ts';
import { fetchYouTubeTitle } from '../../../utils/youtube.ts';
import HomeLessonCard from './HomeLessonCard.tsx';
import NoResultsNotification from '../../common/NoResultsNotification.tsx';
import './MyLessonsExpanded.css';

// Assets
const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";
const iconClose = "/assets/home/close.svg";

interface MyLessonsExpandedProps {
    onClose: () => void;

    // Teacher/Default items (optional for Student view)
    likedLessonIds?: Set<string>;
    onToggleLike?: (lessonId: string) => void;
    onAddToFolder?: (lessonId: string) => void;

    // Mode
    variant?: 'default' | 'student';
}

const MyLessonsExpanded: React.FC<MyLessonsExpandedProps> = ({
    onClose,
    likedLessonIds = new Set(),
    onToggleLike,
    onAddToFolder,
    variant = 'default'
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lessons, setLessons] = useState<LessonLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Grid Ref for scrolling
    const gridRef = useRef<HTMLDivElement>(null);

    // Load Lessons
    useEffect(() => {
        if (!user?.email) return;

        (async () => {
            try {
                setLoading(true);
                // Fetch all/more lessons for the expanded view
                let data: LessonLite[] = [];

                if (variant === 'student') {
                    data = await getSharedLessons();
                } else {
                    data = await getUserLessonsLite({ page: 0, size: 50, sort: '-createdAt', email: user.email });
                }

                setLessons(data ?? []);

                // Start monitoring for processing lessons
                data.forEach(lesson => {
                    if ((lesson.status === 'PROCESSING' || lesson.status === 'PENDING') && !lessonMonitoringService.isMonitoring(lesson.id)) {
                        globalLessonMonitoring.startMonitoring(lesson.id, lesson.lesson_topic || 'Untitled');
                    }
                });

                setError(null);
            } catch (e) {
                console.error(e);
                setError('Failed to load lessons');
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.email]);

    // Subscribe to monitoring updates
    useEffect(() => {
        globalLessonMonitoring.setSilentMode(true);
        const unsubscribe = globalLessonMonitoring.subscribe((lessonId, lessonName) => {
            (async () => {
                if (!user?.email) return;
                try {
                    let data: LessonLite[] = [];
                    if (variant === 'student') {
                        data = await getSharedLessons();
                    } else {
                        data = await getUserLessonsLite({ page: 0, size: 50, sort: '-createdAt', email: user.email });
                    }
                    setLessons(data ?? []);
                } catch (e) {
                    console.error('Failed to refresh expanded lessons', e);
                }
            })();
        });
        return () => {
            unsubscribe();
            globalLessonMonitoring.setSilentMode(false);
        };
    }, [user?.email]);

    // Fetch YouTube titles for expanded lessons
    useEffect(() => {
        const lessonsToFetch = lessons.filter(l => !l.you_tube_title && l.youtube_url);
        if (lessonsToFetch.length === 0) return;

        const fetchTitles = async () => {
            let updated = false;
            const newLessons = await Promise.all(lessons.map(async (l) => {
                if (!l.you_tube_title && l.youtube_url) {
                    try {
                        const title = await fetchYouTubeTitle(l.youtube_url);
                        if (title) {
                            updated = true;
                            return { ...l, you_tube_title: title };
                        }
                    } catch (e) {
                        // ignore
                    }
                }
                return l;
            }));

            if (updated) {
                setLessons(newLessons);
            }
        };

        fetchTitles();
    }, [lessons]);

    // Scroll Handler
    const handleScroll = (direction: 'left' | 'right') => {
        if (gridRef.current) {
            const scrollAmount = 336; // Card width + gap
            const newScrollLeft = gridRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            gridRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="my-lessons-popup-overlay">
            <div className="my-lessons-popup-content">
                <div className="popup-header">
                    <h2>{variant === 'student' ? 'Shared Lessons' : 'My Lessons'}</h2>
                    <div className="popup-controls">
                        <button className="nav-arrow" onClick={() => handleScroll('left')}>
                            <img src={iconNavLeft} alt="Previous" />
                        </button>
                        <button className="nav-arrow" onClick={() => handleScroll('right')}>
                            <img src={iconNavRight} alt="Next" />
                        </button>
                        <button className="close-btn" onClick={onClose}>
                            <img src={iconClose} alt="Close" />
                        </button>
                    </div>
                </div>

                <div className="popup-body">
                    {/* Grid */}
                    <div className="popup-grid-container">
                        {loading ? (
                            <div>Loading...</div>
                        ) : lessons.length === 0 ? (
                            <NoResultsNotification />
                        ) : (
                            <div className="popup-lessons-grid" ref={gridRef}>
                                {lessons.map(lesson => (
                                    <HomeLessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                                        onAddToFolder={() => onAddToFolder?.(lesson.id)}
                                        onAddToFavorite={() => onToggleLike?.(lesson.id)}
                                        isLiked={likedLessonIds.has(lesson.id)}
                                        showActions={variant === 'default'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyLessonsExpanded;
