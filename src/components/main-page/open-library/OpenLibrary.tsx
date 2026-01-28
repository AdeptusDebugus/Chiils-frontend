// src/components/OpenLibrary.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLessonsLite, type LessonLite } from '../../../services/lessonService.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import './OpenLibrary.css';
import { extractYouTubeId, fetchYouTubeTitle } from '../../../utils/youtube.ts';
import { capitalizeFirstLetter } from '../../../utils/text.ts';
import {
    LANGUAGES, CEFR_LEVELS, SCENARIOS, GRAMMAR_TOPICS_BY_LEVEL, TOPICS,
    type CefrLevel, type Scenario as ScenarioType, type Topic, type GrammarTopic
} from '../../../utils/filters.ts';

// Helpers for Filters
import { FilterDropdown, FilterPill } from '../FilterComponents.tsx';
import LessonBuilderButton from '../lesson-builder/LessonBuilderButton.tsx';
import {useLessonBuilder} from "../../../contexts/LessonBuilderContext.tsx";

const OpenLibrary: React.FC = () => {

    const navigate = useNavigate();
    const { user } = useAuth();
    const [lessons, setLessons] = useState<LessonLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const titleCacheRef = useRef<Record<string, string>>({});

    // Helpers
    const getLanguageLevel = (l: LessonLite): string => l.tags?.language_level || 'B1';
    const getGrammarTopics = (l: LessonLite): string[] => l.tags?.grammar_topics || [];
    const getTopics = (l: LessonLite): string[] => l.tags?.lexical_fields || [];

    // Derived Grammar Options
    // Note: We need to use selectedCefrLevels from state, but state is defined below. 
    // I will move helpers above state or state above helpers. 
    // Actually, component structure is: imports -> component -> state -> effects -> helpers -> logic -> jsx.
    // I will put helpers here for now.

    // фильтры
    const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
    const [selectedCefrLevels, setSelectedCefrLevels] = useState<string[]>([]);
    const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
    const [selectedGrammar, setSelectedGrammar] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    // Imports from utils (simulated inside component for tool use compliance, but in real code strict imports)
    // Actually, I should import them at the top. I will add imports in a separate edit or use fully qualified if I can? 
    // No, I need to add the import line at the top. 
    // I will replace the state initialization and the filteredLessons logic here.

    // Derived Grammar Options
    // We need to import constants. I'll assume they are imported. I will add the import statement in a separate replacement chunk at the top of the file.

    // Logic to get available grammar topics based on selected levels
    // If no levels selected, we show ALL (or maybe unique set of all). 
    // But since GRAMMAR_TOPICS_BY_LEVEL is in utils, I need to import it.

    // For now, let's update the Logic first.

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
                            score += 10;
                        }

                        // Check lesson topic
                        const lessonTopic = (lesson.lesson_topic || '').toLowerCase();
                        if (lessonTopic.includes(searchWord)) {
                            fieldMatches.lessonTopic = true;
                            score += 10;
                        }

                        // Check lesson theme (Scenario)
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
                            score += 8;
                        }

                        // Check lexical topics
                        const lexicalMatches = (lesson.tags?.lexical_fields || []).filter(
                            t => t.toLowerCase().includes(searchWord)
                        );
                        if (lexicalMatches.length > 0) {
                            fieldMatches.lexicalTopics = true;
                            score += 8;
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

            // Language
            if (
                selectedLanguage &&
                (filteredLesson.tags?.language || '').toLowerCase() !== selectedLanguage.toLowerCase()
            ) return false;

            // CEFR Levels
            if (selectedCefrLevels.length > 0) {
                const lvl = getLanguageLevel(filteredLesson);
                if (!selectedCefrLevels.includes(lvl)) return false;
            }

            // Scenario (lesson_theme)
            if (selectedScenarios.length > 0) {
                // assume lesson_theme holds the scenario
                const theme = (filteredLesson.tags?.lesson_theme || '');
                // It might need precise matching or normalization
                if (!selectedScenarios.some(s => theme.toLowerCase() === s.toLowerCase())) return false;
            }

            // Grammar
            if (selectedGrammar.length > 0) {
                const lessonGrammar = filteredLesson.tags?.grammar_topics || [];
                // If lesson has ANY of the selected grammar topics? Or ALL?
                // Typically 'any' is better for filters unless strict.
                const has = selectedGrammar.some(g => lessonGrammar.includes(g));
                if (!has) return false;
            }

            // Topics
            if (selectedTopics.length > 0) {
                const lessonTopics = getTopics(filteredLesson);
                const has = selectedTopics.some(t => lessonTopics.includes(t));
                if (!has) return false;
            }

            return true;
        })
        .sort((a, b) => b.score - a.score)
        .map(({ lesson }) => lesson);

    // Helpers for toggles
    const handleCefrToggle = (level: string) => {
        // Single select: If already selected, deselect it. If new, replace selection.
        setSelectedCefrLevels(prev => prev.includes(level) ? [] : [level]);
    };
    const handleScenarioToggle = (scenario: string) => {
        setSelectedScenarios(prev => prev.includes(scenario) ? prev.filter(s => s !== scenario) : [...prev, scenario]);
    };
    const handleGrammarToggle = (topic: string) => {
        setSelectedGrammar(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
    };
    const handleTopicToggle = (topic: string) => {
        setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
    };




    // Data handling effects
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getLessonsLite({ page: 0, size: 24, sort: '-createdAt' });
                setLessons(data ?? []);
                setError(null);
            } catch (e) {
                console.error(e);
                setError('Failed to load lessons');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

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

    const handleLessonClick = (lessonId: string) => {
        navigate(`/lesson/${lessonId}`);
    };



    // Filter Dropdown States
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [showSearchHelp, setShowSearchHelp] = useState(false);

    // Global Popup
    const { openLessonBuilder, isOpen } = useLessonBuilder();

    const toggleDropdown = (name: string) => {
        setOpenDropdown(prev => prev === name ? null : name);
    };

    // Calculate available grammar topics based on selected levels
    const availableGrammarTopics = React.useMemo(() => {
        if (selectedCefrLevels.length === 0) {
            // If no level selected, show all unique topics (or could show by level groups, but let's flatten for now)
            const all = new Set<string>();
            Object.values(GRAMMAR_TOPICS_BY_LEVEL).forEach(list => list.forEach(t => all.add(t)));
            return Array.from(all).sort();
        }
        const topics = new Set<string>();
        selectedCefrLevels.forEach(lvl => {
            // Need to cast or check if lvl is valid CefrLevel, but selectedCefrLevels is typed as string[] in state currently
            // We should cast it safely
            if (lvl in GRAMMAR_TOPICS_BY_LEVEL) {
                GRAMMAR_TOPICS_BY_LEVEL[lvl as CefrLevel].forEach(t => topics.add(t));
            }
        });
        return Array.from(topics).sort();
    }, [selectedCefrLevels]);


    return (
        <div className="open-library-page">
            <div className="open-library-header">
                <div>
                    <h1>Open Library</h1>
                    <p className="header-description">
                        All community-created lessons in one place — use tags to find what you need just in a few clicks.
                    </p>
                </div>
                <button className={`lesson-builder-button ${isOpen ? 'expanded' : ''}`} onClick={openLessonBuilder}>
                    <span className="button-text">Lesson Builder</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="106" height="104" viewBox="0 0 106 104" fill="none">
                        <g opacity="1">
                            <path d="M62.9046 92.9489C62.9046 98.5398 58.2804 103.073 52.5773 103.073C46.8742 103.073 42.25 98.5398 42.25 92.9489C42.25 87.358 52.5773 49.8926 52.5773 49.8926C52.5773 49.8926 62.9046 87.358 62.9046 92.9489Z" fill="black" />
                            <path d="M30.0041 87.9796C25.9693 91.935 19.432 91.935 15.3972 87.9796C11.3624 84.0242 11.3624 77.6155 15.3972 73.6601C19.432 69.7047 53.7596 50.3809 53.7596 50.3809C53.7596 50.3809 34.0389 84.0331 30.0131 87.9885L30.0041 87.9796Z" fill="black" />
                            <path d="M10.3273 61.6603C4.62417 61.6603 0 57.1271 0 51.5362C0 45.9453 4.62417 41.4121 10.3273 41.4121C16.0304 41.4121 54.2477 51.5362 54.2477 51.5362C54.2477 51.5362 16.0304 61.6603 10.3273 61.6603Z" fill="black" />
                            <path d="M15.3972 29.4111C11.3624 25.4557 11.3624 19.047 15.3972 15.0916C19.432 11.1361 25.9693 11.1361 30.0041 15.0916C34.0389 19.047 53.7505 52.6992 53.7505 52.6992C53.7505 52.6992 19.4229 33.3665 15.3881 29.42L15.3972 29.4111Z" fill="black" />
                            <path d="M42.2441 10.1241C42.2441 4.53318 46.8683 0 52.5714 0C58.2745 0 62.8987 4.53318 62.8987 10.1241C62.8987 15.715 52.5714 53.1804 52.5714 53.1804C52.5714 53.1804 42.2441 15.715 42.2441 10.1241Z" fill="black" />
                            <path d="M75.1382 15.0916C79.173 11.1361 85.7103 11.1361 89.7451 15.0916C93.7799 19.047 93.7799 25.4557 89.7451 29.4111C85.7103 33.3665 51.3828 52.6903 51.3828 52.6903C51.3828 52.6903 71.1034 19.0381 75.1291 15.0827L75.1382 15.0916Z" fill="black" />
                            <path d="M94.8228 41.4121C100.526 41.4121 105.15 45.9453 105.15 51.5362C105.15 57.1271 100.526 61.6603 94.8228 61.6603C89.1197 61.6603 50.9023 51.5362 50.9023 51.5362C50.9023 51.5362 89.1197 41.4121 94.8228 41.4121Z" fill="black" />
                            <path d="M89.7516 73.6592C93.7864 77.6146 93.7864 84.0233 89.7516 87.9787C85.7168 91.9341 79.1796 91.9341 75.1448 87.9787C71.11 84.0233 51.3984 50.3711 51.3984 50.3711C51.3984 50.3711 85.7259 69.7038 89.7607 73.6503L89.7516 73.6592Z" fill="black" />
                        </g>
                    </svg>
                </button>
            </div>

            <div className="filters-section">
                <div className="filters-container">
                    {/* LEFT GROUP: Language, CEFR, Scenario */}
                    <div className="filters-left">
                        {/* Language */}
                        <div className="filter-group">
                            <span className="filter-group-label">Language</span>
                            <FilterDropdown
                                label={selectedLanguage || "Select target language"}
                                isOpen={openDropdown === 'language'}
                                onToggle={() => toggleDropdown('language')}
                                activeCount={selectedLanguage !== 'English' ? 1 : 0}
                                isDefault={!selectedLanguage}
                                onClear={() => setSelectedLanguage('')}
                            >
                                <div className="filters-row">
                                    {LANGUAGES.map(lang => (
                                        <FilterPill
                                            key={lang}
                                            label={lang}
                                            isActive={selectedLanguage === lang}
                                            onClick={() => setSelectedLanguage(selectedLanguage === lang ? '' : lang)}
                                        />
                                    ))}
                                </div>
                            </FilterDropdown>
                        </div>

                        {/* CEFR Levels */}
                        <div className="filter-group">
                            <span className="filter-group-label">CEFR level</span>
                            <FilterDropdown
                                label={selectedCefrLevels.length > 0 ? selectedCefrLevels.join(', ') : "Select CEFR level"}
                                isOpen={openDropdown === 'level'}
                                onToggle={() => toggleDropdown('level')}
                                activeCount={selectedCefrLevels.length}
                                isDefault={selectedCefrLevels.length === 0}
                                onClear={() => setSelectedCefrLevels([])}
                            >
                                <div className="filters-row">
                                    {CEFR_LEVELS.map(level => (
                                        <FilterPill
                                            key={level}
                                            label={level}
                                            isActive={selectedCefrLevels.includes(level)}
                                            onClick={() => handleCefrToggle(level)}
                                        />
                                    ))}
                                </div>
                            </FilterDropdown>
                        </div>

                        {/* Scenario */}
                        <div className="filter-group">
                            <span className="filter-group-label">Scenario</span>
                            <FilterDropdown
                                label={selectedScenarios.length > 0 ? selectedScenarios.join(', ') : "Select lesson scenario"}
                                isOpen={openDropdown === 'scenario'}
                                onToggle={() => toggleDropdown('scenario')}
                                activeCount={selectedScenarios.length}
                                isDefault={selectedScenarios.length === 0}
                                onClear={() => setSelectedScenarios([])}
                            >
                                <div className="filters-row">
                                    {SCENARIOS.map(scenario => (
                                        <FilterPill
                                            key={scenario}
                                            label={scenario}
                                            isActive={selectedScenarios.includes(scenario)}
                                            onClick={() => handleScenarioToggle(scenario)}
                                        />
                                    ))}
                                </div>
                            </FilterDropdown>
                        </div>
                    </div>

                    {/* RIGHT GROUP: Grammar, Topic */}
                    <div className="filters-right">
                        {/* Grammar - Dependent on CEFR Level */}
                        <div className="filter-group" style={{ position: 'relative' }}>
                            {(!selectedLanguage || selectedCefrLevels.length === 0) && (
                                <span className="grammar-warning-text">
                                    Select a language and a CEFR level first
                                </span>
                            )}
                            <span className="filter-group-label">Grammar</span>
                            <FilterDropdown
                                label={selectedGrammar.length > 0 ? selectedGrammar.join(', ') : "Choose grammar points"}
                                isOpen={openDropdown === 'grammar'}
                                onToggle={() => toggleDropdown('grammar')}
                                activeCount={selectedGrammar.length}
                                isDefault={selectedGrammar.length === 0}
                                disabled={!selectedLanguage || selectedCefrLevels.length === 0}
                                onClear={() => setSelectedGrammar([])}
                            >
                                <div className="filters-row topics-grid">
                                    {availableGrammarTopics.map(topic => (
                                        <FilterPill
                                            key={topic}
                                            label={topic}
                                            isActive={selectedGrammar.includes(topic)}
                                            onClick={() => handleGrammarToggle(topic)}
                                        />
                                    ))}
                                    {availableGrammarTopics.length === 0 && (
                                        <p style={{ padding: '8px', color: '#999' }}>Select a level to see grammar topics</p>
                                    )}
                                </div>
                            </FilterDropdown>
                        </div>

                        {/* Topic */}
                        <div className="filter-group">
                            <span className="filter-group-label">Topic</span>
                            <FilterDropdown
                                label={selectedTopics.length > 0 ? selectedTopics.join(', ') : "Choose lesson topics"}
                                isOpen={openDropdown === 'topics'}
                                onToggle={() => toggleDropdown('topics')}
                                activeCount={selectedTopics.length}
                                isDefault={selectedTopics.length === 0}
                                onClear={() => setSelectedTopics([])}
                            >
                                <div className="filters-row topics-grid">
                                    {TOPICS.map(topic => (
                                        <FilterPill
                                            key={topic}
                                            label={topic}
                                            isActive={selectedTopics.includes(topic)}
                                            onClick={() => handleTopicToggle(topic)}
                                        />
                                    ))}
                                </div>
                            </FilterDropdown>
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
                                    <div className="search-input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="Search community lessons..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="search-input"
                                        />
                                        <span
                                            className="search-help-icon"
                                            onClick={() => setShowSearchHelp(prev => !prev)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            ?
                                        </span>
                                    </div>
                                </div>
                                {showSearchHelp && (
                                    <p className="search-description active">
                                        Search by title, topic, grammar, or any keyword.
                                    </p>
                                )}
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
                                                <span className="lesson-title">
                                                    {capitalizeFirstLetter(
                                                        (lesson.lesson_topic
                                                            || lesson.you_tube_title?.trim()
                                                            || lesson.tags?.lesson_theme
                                                            || 'Untitled Lesson') as string
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredLessons.length === 0 && (
                                <div className="no-results">
                                    <p>Seems like nothing matches your filters. Try adjusting them.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default OpenLibrary;
