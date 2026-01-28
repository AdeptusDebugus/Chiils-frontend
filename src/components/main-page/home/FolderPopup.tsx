import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFolderLessons, removeLessonFromFolder, type FolderLesson } from '../../../services/folderService.ts';
import { type LessonLite } from '../../../services/lessonService.ts';
import HomeLessonCard from './HomeLessonCard.tsx';
import './FolderPopup.css';

// Assets
const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";
const iconClose = "/assets/home/close.svg";

interface FolderPopupProps {
    folderId: number;
    folderName: string;
    onClose: () => void;
    likedLessonIds: Set<string>;
    onToggleLike: (e: React.MouseEvent, lessonId: string) => void;
    onAddToFolder: (lessonId: string) => void;
    onFolderUpdated?: () => void;
}

const FolderPopup: React.FC<FolderPopupProps> = ({
    folderId,
    folderName,
    onClose,
    likedLessonIds,
    onToggleLike,
    onAddToFolder,
    onFolderUpdated
}) => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<FolderLesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Fetch folder lessons
    useEffect(() => {
        async function fetchLessons() {
            try {
                setLoading(true);
                const data = await getFolderLessons(folderId);
                setLessons(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load folder lessons');
            } finally {
                setLoading(false);
            }
        }
        fetchLessons();
    }, [folderId]);

    // Handle removing lesson from this folder
    const handleRemoveFromFolder = async (lessonId: string) => {
        // Optimistic update
        setLessons(prev => prev.filter(l => l.lesson_id !== lessonId));
        try {
            await removeLessonFromFolder(folderId, lessonId);
            onFolderUpdated?.();
        } catch (e) {
            console.error('Failed to remove from folder', e);
            // Revert on error (refetch)
            const data = await getFolderLessons(folderId);
            setLessons(data);
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

    // Convert FolderLesson to LessonLite for the card
    const mapToLessonLite = (folderLesson: FolderLesson): LessonLite => {
        const topic = folderLesson.tags.lesson_theme || 'Untitled Lesson';
        return {
            id: folderLesson.lesson_id,
            youtube_url: folderLesson.youtube_url,
            // fallback if null
            lesson_topic: topic,
            created_at: folderLesson.created_at,
            tags: typeof folderLesson.tags === 'object' ? {
                ...folderLesson.tags,
                lesson_theme: folderLesson.tags?.lesson_theme || topic,
            } : {
                lesson_theme: topic,
                language: '',
                language_level: '',
                lexical_fields: [],
                style: '',
                grammar_topics: []
            },
            duration: '10:00',
            status: 'ACTIVE'
        };
    };

    // Close on escape and arrow navigation
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
        <div className="folder-popup-overlay">
            <div className="folder-popup-content">
                <div className="folder-popup-header">
                    <h2>{folderName}</h2>
                    <div className="folder-popup-controls">
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

                <div className="folder-popup-body">
                    {loading ? (
                        <div className="loading-state">Loading...</div>
                    ) : error ? (
                        <div className="error-state">{error}</div>
                    ) : lessons.length === 0 ? (
                        <div className="folder-empty-state">No lessons in this folder yet.</div>
                    ) : (
                        <div className="folder-grid-container" ref={gridRef}>
                            <div className="folder-scroll-content">
                                {lessons.map(lesson => (
                                    <HomeLessonCard
                                        key={lesson.lesson_id}
                                        lesson={mapToLessonLite(lesson)}
                                        onClick={() => navigate(`/lesson/${lesson.lesson_id}`)}
                                        onAddToFolder={() => handleRemoveFromFolder(lesson.lesson_id)}
                                        onAddToFavorite={(e) => onToggleLike(e, lesson.lesson_id)}
                                        isLiked={likedLessonIds.has(lesson.lesson_id)}
                                        showRemoveIcon={true}
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

export default FolderPopup;
