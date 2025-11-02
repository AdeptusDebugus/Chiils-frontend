// src/components/OpenLibrary.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLessonsLite, getUserLessonsLite, type LessonLite } from '../services/lessonService';
import { useAuth } from '../contexts/AuthContext';
import './OpenLibrary.css';
import { extractYouTubeId, fetchYouTubeTitle } from '../utils/youtube';
import { capitalizeFirstLetter } from '../utils/text';

const OpenLibrary: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lessons, setLessons] = useState<LessonLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const titleCacheRef = useRef<Record<string, string>>({});
    const [viewMode, setViewMode] = useState<'all' | 'my'>('all');

    // фильтры
    const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [selectedStyle, setSelectedStyle] = useState<string>('Neutral');

    // хелперы
    const getLanguageLevel = (l: LessonLite): string =>
        l.tags?.language_level || 'B1';
    const getGrammarTopics = (l: LessonLite): string[] =>
        l.tags?.grammar_topics || [];
    const getTopics = (l: LessonLite): string[] => l.tags?.lexical_fields || [];
    const getStyle = (l: LessonLite): string => l.tags?.style || 'neutral';

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                let data: LessonLite[];
                if (viewMode === 'my' && user?.email) {
                    data = await getUserLessonsLite({ page: 0, size: 24, sort: '-createdAt', email: user.email });
                } else {
                    data = await getLessonsLite({ page: 0, size: 24, sort: '-createdAt' });
                }
                setLessons(data ?? []);
                setError(null);
            } catch (e) {
                console.error(e);
                setError('Failed to load lessons');
            } finally {
                setLoading(false);
            }
        })();
    }, [viewMode, user?.email]);

    // подтягиваем заголовки youtube при необходимости
    useEffect(() => {
        const missing = lessons.filter(l => !l.you_tube_title && Boolean(l.youtube_url));
        if (missing.length === 0) return;

        let cancelled = false;
        (async () => {
            const resolved = new Map<string, string>();
            const toFetch = new Set<string>();

            missing.forEach(l => {
                const url = l.youtube_url!;
                const cached = titleCacheRef.current[url];
                if (cached) resolved.set(url, cached);
                else toFetch.add(url);
            });

            if (toFetch.size) {
                const results = await Promise.allSettled(
                    Array.from(toFetch).map(async url => ({ url, title: await fetchYouTubeTitle(url) }))
                );
                results.forEach(r => {
                    if (r.status === 'fulfilled' && r.value.title) {
                        titleCacheRef.current[r.value.url] = r.value.title!;
                        resolved.set(r.value.url, r.value.title!);
                    }
                });
            }

            if (cancelled || resolved.size === 0) return;

            setLessons(prev =>
                prev.map(l => {
                    if (l.you_tube_title || !l.youtube_url) return l;
                    const t = resolved.get(l.youtube_url);
                    return t ? { ...l, you_tube_title: t } : l;
                })
            );
        })();

        return () => { cancelled = true; };
    }, [lessons]);

    const filteredLessons = lessons
        .map(lesson => {
            // поиск
            let score = 0;
            let matchesSearch = true;

            if (searchTerm) {
                // Normalize search term: lowercase, trim, split into words
                const normalizedSearch = searchTerm.toLowerCase().trim();
                const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 0);

                if (searchWords.length > 0) {
                    matchesSearch = false;
                    let wordMatches = 0;

                    // For each search word, check all fields
                    searchWords.forEach(searchWord => {
                        const fieldMatches = {
                            videoTitle: false,
                            lessonTopic: false,
                            grammarTopics: false,
                            lexicalTopics: false,
                            language: false,
                            level: false
                        };

                        // Check video title (you_tube_title)
                        const videoTitle = (lesson.you_tube_title || '').toLowerCase();
                        if (videoTitle.includes(searchWord)) {
                            fieldMatches.videoTitle = true;
                            score += 10; // High score for title matches
                        }

                        // Check lesson topic
                        const lessonTopic = (lesson.lesson_topic || '').toLowerCase();
                        if (lessonTopic.includes(searchWord)) {
                            fieldMatches.lessonTopic = true;
                            score += 10;
                        }

                        // Check lesson theme
                        const lessonTheme = (lesson.tags?.lesson_theme || '').toLowerCase();
                        if (lessonTheme.includes(searchWord)) {
                            score += 8;
                        }

                        // Check grammar topics
                        const grammarMatches = (lesson.tags?.grammar_topics || []).filter(
                            t => t.toLowerCase().includes(searchWord)
                        );
                        if (grammarMatches.length > 0) {
                            fieldMatches.grammarTopics = true;
                            score += 8; // Medium-high score for grammar tags
                        }

                        // Check lexical topics
                        const lexicalMatches = (lesson.tags?.lexical_fields || []).filter(
                            t => t.toLowerCase().includes(searchWord)
                        );
                        if (lexicalMatches.length > 0) {
                            fieldMatches.lexicalTopics = true;
                            score += 8; // Medium-high score for lexical tags
                        }

                        // Check language
                        const language = (lesson.tags?.language || '').toLowerCase();
                        if (language.includes(searchWord)) {
                            fieldMatches.language = true;
                            score += 5;
                        }

                        // Check level
                        const level = getLanguageLevel(lesson).toLowerCase();
                        if (level.includes(searchWord)) {
                            fieldMatches.level = true;
                            score += 5;
                        }

                        // Check style
                        const style = (getStyle(lesson) || '').toLowerCase();
                        if (style.includes(searchWord)) {
                            score += 3;
                        }

                        // If any field matched this word, count it
                        const anyMatch = Object.values(fieldMatches).some(Boolean);
                        if (anyMatch) {
                            wordMatches++;
                        }
                    });

                    // All search words must match for the lesson to be included
                    matchesSearch = wordMatches === searchWords.length;
                }
            }

            return { lesson, score, matchesSearch };
        })
        .filter(({ lesson: filteredLesson, matchesSearch }) => {
            if (!matchesSearch) return false;

            // язык
            if (
                selectedLanguage &&
                (filteredLesson.tags?.language || '').toLowerCase() !== selectedLanguage.toLowerCase()
            ) return false;

            // уровень
            if (selectedLevels.length > 0) {
                const lvl = getLanguageLevel(filteredLesson);
                if (!selectedLevels.includes(lvl)) return false;
            }

            // темы
            if (selectedTopics.length > 0) {
                const topics = getTopics(filteredLesson);
                const has = selectedTopics.some(t =>
                    topics.some(lt => lt.toLowerCase().includes(t.toLowerCase()))
                );
                if (!has) return false;
            }

            // стиль
            if (selectedStyle && selectedStyle !== 'All') {
                const style = (getStyle(filteredLesson) || '').toLowerCase(); // бэк отдаёт "neutral"
                const want = selectedStyle.toLowerCase();
                if (want !== 'neutral' && !style.includes(want)) return false;
            }

            return true;
        })
        .sort((a, b) => b.score - a.score) // Sort by relevance score
        .map(({ lesson }) => lesson);

    const handleLevelToggle = (level: string) => {
        setSelectedLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);
    };
    const handleTopicToggle = (topic: string) => {
        setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
    };

    const handleLessonClick = (lessonId: string) => {
        navigate(`/lesson/${lessonId}`);
    };

    return (
        <div className="open-library-page">
            <div className="open-library-header">
                <h1>Open Library</h1>
                <p className="header-description">
                    Выбирай язык, уровень и тему — находи уроки, созданные на основе видео и подкастов YouTube. Если ищешь урок по конкретной грамматической теме — воспользуйся поиском.
                </p>
            </div>

            <div className="filters-section">
                <div className="filters-container">
                    <div className="filter-options-container">
                        <div className="filter-options-row">
                            <div className="filter-options-group">
                                <button
                                    className={`filter-option language-option ${selectedLanguage === 'English' ? 'active' : ''}`}
                                    onClick={() => setSelectedLanguage('English')}
                                >
                                    English
                                </button>
                            </div>

                            <div className="filter-options-group">
                                {['A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                                    <button
                                        key={level}
                                        className={`filter-option level-option ${selectedLevels.includes(level) ? 'active' : ''}`}
                                        onClick={() => handleLevelToggle(level)}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>

                            <div className="filter-options-group">
                                <div className="topic-options">
                                    {['Architecture', 'Art', 'Design', 'Everyday life', 'Fashion & Beauty', 'Food & Cooking', 'Health & Wellness', 'Marketing & Media', 'Nature & Environment', 'Relationships', 'Science & Education', 'Society & Politics', 'Tech & Startups', 'Travel'].map(topic => (
                                        <button
                                            key={topic}
                                            className={`filter-option topic-option ${selectedTopics.includes(topic) ? 'active' : ''}`}
                                            onClick={() => handleTopicToggle(topic)}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-options-group">
                                {['Casual / Slang', 'Neutral', 'Formal'].map(style => (
                                    <button
                                        key={style}
                                        className={`filter-option style-option ${selectedStyle === style ? 'active' : ''}`}
                                        onClick={() => setSelectedStyle(style)}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="open-library-content">
                <div className="main-content-container">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading lessons...</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <h2>Error</h2>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                    <div className="search-section">
                        <div className="search-header">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            {user && (
                                <button
                                    className={`my-lessons-button ${viewMode === 'my' ? 'active' : ''}`}
                                    onClick={() => setViewMode(viewMode === 'all' ? 'my' : 'all')}
                                >
                                    My Lessons
                                </button>
                            )}
                        </div>
                        <p className="search-description">
                            Здесь собраны все готовые уроки сервиса — можно искать по языку, уровню, теме, ключевым словам и грамматике.
                        </p>
                    </div>

                    <div className="lessons-grid">
                        {filteredLessons.map(lesson => (
                            <div
                                key={lesson.id}
                                className="lesson-card"
                                onClick={() => handleLessonClick(lesson.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleLessonClick(lesson.id);
                                    }
                                }}
                            >
                                <div className="lesson-thumbnail">
                                    {lesson.youtube_url && (
                                        <img
                                            src={`https://img.youtube.com/vi/${extractYouTubeId(lesson.youtube_url)}/maxresdefault.jpg`}
                                            alt={lesson.lesson_topic || 'Lesson thumbnail'}
                                            className="thumbnail-image"
                                        />
                                    )}
                                </div>

                                <div className="lesson-info">
                                    <div className="lesson-meta">
                                        <div className="lesson-tags">
                                            {getGrammarTopics(lesson).map((topic, i) => (
                                                <span key={i} className="tag grammar">{topic}</span>
                                            ))}
                                        </div>
                                        <span className="lesson-title">
                      {capitalizeFirstLetter(
                          (lesson.you_tube_title?.trim()
                              || lesson.tags?.lesson_theme
                              || lesson.lesson_topic
                              || 'Untitled Lesson') as string
                      )}
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredLessons.length === 0 && searchTerm && (
                        <div className="no-results">
                            <p>No lessons found matching "{searchTerm}"</p>
                        </div>
                    )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpenLibrary;
