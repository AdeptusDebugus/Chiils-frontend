import React, { useState, useEffect } from 'react';
import { LessonLite } from '../../../services/lessonService.ts';
import { extractYouTubeId } from '../../../utils/youtube.ts';
import { capitalizeFirstLetter } from '../../../utils/text.ts';

interface HomeLessonCardProps {
    lesson: LessonLite;
    onClick: () => void;
    onAddToFolder?: (e: React.MouseEvent) => void;
    onAddToFavorite?: (e: React.MouseEvent) => void;
    onStop?: (e: React.MouseEvent) => void;
    isLiked?: boolean;
    showRemoveIcon?: boolean;
    showActions?: boolean;
}

const imgLessonThumbnail = "/assets/dashboard/lesson-thumbnail.jpg";
const iconFolder = "/assets/home/folder.svg";
const iconRemove = "/assets/home/remove-from-folder.svg";
const iconFavorites = "/assets/home/favorite.svg";
const iconStop = "/assets/home/close-circle.svg";

const HomeLessonCard: React.FC<HomeLessonCardProps> = ({
    lesson,
    onClick,
    onAddToFolder,
    onAddToFavorite,
    onStop,
    isLiked = false,
    showRemoveIcon = false,
    showActions = true
}) => {
    const isProcessing = lesson.status === 'PROCESSING' || lesson.status === 'PENDING';
    const [isStoppable, setIsStoppable] = useState(false);

    useEffect(() => {
        if (!isProcessing) return;

        const checkStoppable = () => {
            const createdAt = new Date(lesson.created_at).getTime();
            const now = new Date().getTime();
            const diffInS = (now - createdAt) / 1000;
            setIsStoppable(diffInS < 60);
        };

        checkStoppable();
        const interval = setInterval(checkStoppable, 1000);
        return () => clearInterval(interval);
    }, [lesson.created_at, isProcessing]);

    if (isProcessing) {
        return (
            <div className="home-lesson-card processing-stub" onClick={onClick}>
                <div className="lesson-thumbnail stub-thumbnail">
                    <div className="creating-lesson-banner">Creating lesson...</div>
                </div>
                <div className="home-lesson-info">
                    <h3>
                        {capitalizeFirstLetter(
                            (lesson.you_tube_title?.trim()
                                || lesson.tags?.lesson_theme
                                || lesson.lesson_topic
                                || 'Lesson') as string
                        )}
                    </h3>
                    {isStoppable && (
                        <div className="home-lesson-actions">
                            {/* Empty div to push the stop button to the bottom position (liked button position) */}
                            <div style={{ height: '24px' }}></div>
                            <button
                                className="action-btn stop-generation-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStop?.(e);
                                }}
                                title="Stop lesson generation"
                            >
                                <img src={iconStop} alt="Stop" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="home-lesson-card" onClick={onClick}>
            <div className="lesson-thumbnail">
                {lesson.youtube_url ? (
                    <img
                        src={`https://img.youtube.com/vi/${extractYouTubeId(lesson.youtube_url)}/mqdefault.jpg`}
                        alt={lesson.lesson_topic || 'Lesson'}
                        className="thumbnail-image"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== imgLessonThumbnail) {
                                target.src = imgLessonThumbnail;
                            }
                        }}
                    />
                ) : (
                    <img src={imgLessonThumbnail} alt="Lesson" className="thumbnail-image" />
                )}

                {lesson.duration ? (
                    <div className="duration-badge">{lesson.duration}</div>
                ) : (
                    <div className="duration-badge">10:00</div>
                )}

                {lesson.status === 'completed' && (
                    <div className="completion-badge">
                        <span className="check-icon">✓</span>
                    </div>
                )}
            </div>

            <div className="home-lesson-info">
                <h3>
                    {capitalizeFirstLetter(
                        (lesson.you_tube_title?.trim()
                            || lesson.tags?.lesson_theme
                            || lesson.lesson_topic
                            || 'Lesson') as string
                    )}
                </h3>

                {showActions && (
                    <div className="home-lesson-actions">
                        <button
                            className="action-btn add-to-folder"
                            aria-label={showRemoveIcon ? "Remove from Folder" : "Add to Folder"}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToFolder?.(e);
                            }}
                        >
                            <img src={showRemoveIcon ? iconRemove : iconFolder} alt={showRemoveIcon ? "Remove" : "Folder"} />
                        </button>
                        <button
                            className={`action-btn add-to-favorite ${isLiked ? 'liked' : ''}`}
                            aria-label={isLiked ? "Remove from Favorite" : "Add to Favorite"}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToFavorite?.(e);
                            }}
                            style={isLiked ? { backgroundColor: 'black' } : {}}
                        >
                            <img
                                src={iconFavorites}
                                alt="Favorite"
                                style={isLiked ? { filter: 'brightness(0) invert(1)' } : {}}
                            />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeLessonCard;
