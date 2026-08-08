import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, type HistoryResponse, type HistoryItem } from '../../../services/lessonService.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { fetchYouTubeTitle } from '../../../utils/youtube.ts';
import HomeLessonCard from './HomeLessonCard.tsx';
import './HistoryPopup.css';

// Assets
const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";
const iconClose = "/assets/home/close.svg";

interface HistoryPopupProps {
    onClose: () => void;
    likedLessonIds: Set<string>;
    onToggleLike: (e: React.MouseEvent, lessonId: string) => void;
    onAddToFolder: (lessonId: string) => void;
}

const HistoryPopup: React.FC<HistoryPopupProps> = ({ onClose, likedLessonIds, onToggleLike, onAddToFolder }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState<HistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Refs for scrolling each row
    const yesterdayRef = useRef<HTMLDivElement>(null);
    const lastWeekRef = useRef<HTMLDivElement>(null);
    const thisMonthRef = useRef<HTMLDivElement>(null);

    // Load History if not provided
    useEffect(() => {
        if (data) return; // Already have data
        if (!user?.email) return;

        (async () => {
            try {
                setLoading(true);
                const res = await getHistory();
                setData(res);
                setError(null);
            } catch (e) {
                console.error(e);
                setError('Failed to load history');
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.email, data]);

    // Fetch YouTube titles for history items
    useEffect(() => {
        if (!data) return;

        const allItems = [...(data.recent || []), ...(data.lastWeek || []), ...(data.thisMonth || [])];
        const itemsToFetch = allItems.filter(item => {
            const anyItem = item as any;
            return !anyItem.you_tube_title && (anyItem.youtubeUrl || anyItem.youtube_url || anyItem.you_tube_url);
        });

        if (itemsToFetch.length === 0) return;

        const fetchTitles = async () => {
            let updated = false;
            const updateGroup = async (group: HistoryItem[]) => {
                return await Promise.all(group.map(async (item) => {
                    const anyItem = item as any;
                    const url = anyItem.youtubeUrl || anyItem.youtube_url || anyItem.you_tube_url;
                    if (!anyItem.you_tube_title && url) {
                        try {
                            const title = await fetchYouTubeTitle(url);
                            if (title) {
                                updated = true;
                                return { ...item, you_tube_title: title };
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                    return item;
                }));
            };

            const newRecent = await updateGroup(data.recent || []);
            const newLastWeek = await updateGroup(data.lastWeek || []);
            const newThisMonth = await updateGroup(data.thisMonth || []);

            if (updated) {
                setData({
                    recent: newRecent,
                    lastWeek: newLastWeek,
                    thisMonth: newThisMonth
                });
            }
        };

        fetchTitles();
    }, [data]);

    // Scroll Handler (scrolls all rows simultaneously)
    const handleScroll = (direction: 'left' | 'right') => {
        const scrollAmount = 340;
        const refs = [yesterdayRef, lastWeekRef, thisMonthRef];

        refs.forEach(ref => {
            if (ref.current) {
                const currentLeft = ref.current.scrollLeft;
                const newScrollLeft = currentLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
                ref.current.scrollTo({
                    left: newScrollLeft,
                    behavior: 'smooth'
                });
            }
        });
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handleScroll('left');
            } else if (e.key === 'ArrowRight') {
                handleScroll('right');
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Helper to render a group
    const renderGroup = (title: string, items: HistoryItem[] | undefined, ref: React.RefObject<HTMLDivElement>) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="history-group">
                <h3 className="history-group-title">{title}</h3>
                <div className="history-group-items" ref={ref}>
                    {items.map(item => {
                        const anyItem = item as any;

                        const id = anyItem.lessonId || anyItem.lesson_id || anyItem.id || anyItem._id || anyItem.lesson?.id || anyItem.lesson?._id;

                        // Check flat properties, nested lesson object, and tags
                        const topic = anyItem.lessonTopic || anyItem.lesson_topic || anyItem.topic || anyItem.title || anyItem.name || anyItem.lessonName
                            || anyItem.lesson?.topic || anyItem.lesson?.title || anyItem.lesson?.name || anyItem.lesson?.lesson_topic
                            || anyItem.tags?.lesson_theme || anyItem.tags?.title
                            || anyItem.youtubeTitle || anyItem.video_title;

                        const lessonLite: any = {
                            id: id,
                            youtube_url: anyItem.youtubeUrl || anyItem.youtube_url || anyItem.you_tube_url || anyItem.url,
                            you_tube_title: anyItem.you_tube_title,
                            lesson_topic: topic,
                            created_at: anyItem.createdAt || anyItem.created_at,
                            status: anyItem.status || 'ACTIVE',
                            tags: {
                                lesson_theme: topic,
                                ...(anyItem.tags && !Array.isArray(anyItem.tags) ? anyItem.tags : {})
                            }
                        };
                        return (
                            <HomeLessonCard
                                key={id}
                                lesson={lessonLite}
                                onClick={() => navigate(`/lesson/${id}`)}
                                onAddToFolder={() => onAddToFolder(id)}
                                onAddToFavorite={(e) => onToggleLike(e, id)}
                                isLiked={likedLessonIds.has(id)}
                            />
                        );
                    })}
                </div>
            </div>
        );
    };

    const hasData = data && (data.recent?.length > 0 || data.lastWeek?.length > 0 || data.thisMonth?.length > 0);

    return (
        <div className="history-popup-overlay">
            <div className="history-popup-content">
                <div className="popup-header">
                    <h2>History</h2>
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
                    <div className="popup-grid-container">
                        {loading ? (
                            <div className="loading-state">Loading...</div>
                        ) : error ? (
                            <div className="error-state">{error}</div>
                        ) : !hasData ? (
                            <div className="empty-state">No history found.</div>
                        ) : (
                            <div className="popup-lessons-grid history-grid">
                                {renderGroup('Recent', data?.recent, yesterdayRef)}
                                {renderGroup('Last Week', data?.lastWeek, lastWeekRef)}
                                {renderGroup('This Month', data?.thisMonth, thisMonthRef)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPopup;
