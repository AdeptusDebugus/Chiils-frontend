import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLikedLessons, unlikeLesson, type LikedLessonLite, type LessonLite } from '../../../services/lessonService.ts';
import { fetchYouTubeTitle } from '../../../utils/youtube.ts';
import HomeLessonCard from './HomeLessonCard.tsx';
import './FavoritesPopup.css';

// Assets
const iconClose = "/assets/home/close.svg";

interface FavoritesPopupProps {
    onClose: () => void;
    onAddToFolder: (lessonId: string) => void;
}

const FavoritesPopup: React.FC<FavoritesPopupProps> = ({ onClose, onAddToFolder }) => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<LikedLessonLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const gridRef = React.useRef<HTMLDivElement>(null);

    // Fetch liked lessons
    useEffect(() => {
        async function fetchFavorites() {
            try {
                setLoading(true);
                const data = await getLikedLessons();
                setLessons(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load favorites');
            } finally {
                setLoading(false);
            }
        }
        fetchFavorites();
    }, []);

    // Fetch YouTube titles for favorite lessons
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

    // Handle Unliking within the popup
    const handleUnlike = async (lessonId: string) => {
        // Optimistic update
        setLessons(prev => prev.filter(l => l.lesson_id !== lessonId));
        try {
            await unlikeLesson(lessonId);
            // Optionally notify parent to update stats, but for now we just manage local list
        } catch (e) {
            console.error('Failed to unlike', e);
            // Revert if needed, but for now simple optimistic is fine
        }
    };

    // Scroll Handler
    const handleScroll = (direction: 'left' | 'right') => {
        if (gridRef.current) {
            const scrollAmount = 340; // Approx card width + gap
            const currentLeft = gridRef.current.scrollLeft;
            const newScrollLeft = currentLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
            gridRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    // Convert LikedLessonLite to LessonLite for the card
    const mapToLessonLite = (liked: LikedLessonLite): LessonLite => {
        return {
            id: liked.lesson_id,
            youtube_url: liked.youtube_url,
            you_tube_title: liked.you_tube_title,
            lesson_topic: liked.lesson_topic,
            created_at: liked.created_at,
            tags: {
                ...liked.tags,
                lesson_theme: liked.tags?.lesson_theme || liked.lesson_topic || '',
            },
            duration: '10:00',
            status: (liked as any).status || 'ACTIVE'
        };
    };

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') handleScroll('left');
            else if (e.key === 'ArrowRight') handleScroll('right');
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="favorites-popup-overlay">
            <div className="favorites-popup-content">
                <div className="favorites-popup-header">
                    <h2>Favourites</h2>
                    <div className="favorites-popup-controls">
                        <button className="nav-arrow" onClick={() => handleScroll('left')}>
                            <img src="/assets/home/expand-left.svg" alt="Previous" />
                        </button>
                        <button className="nav-arrow" onClick={() => handleScroll('right')}>
                            <img src="/assets/home/expand-right.svg" alt="Next" />
                        </button>
                        <button className="close-btn" onClick={onClose}>
                            <img src={iconClose} alt="Close" />
                        </button>
                    </div>
                </div>

                <div className="favorites-popup-body">
                    {loading ? (
                        <div className="loading-state">Loading...</div>
                    ) : error ? (
                        <div className="error-state">{error}</div>
                    ) : lessons.length === 0 ? (
                        <div className="favorites-empty-state">No favorites yet.</div>
                    ) : (
                        <div className="favorites-grid-container" ref={gridRef}>
                            {/* We use a specific container for horizontal scroll */}
                            <div className="favorites-scroll-content">
                                {lessons.map(lesson => (
                                    <HomeLessonCard
                                        key={lesson.lesson_id}
                                        lesson={mapToLessonLite(lesson)}
                                        onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
                                        onAddToFolder={() => onAddToFolder(lesson.lesson_id)}
                                        onAddToFavorite={() => handleUnlike(lesson.lesson_id)} // Clicking filled heart unlikes it
                                        isLiked={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoritesPopup;
