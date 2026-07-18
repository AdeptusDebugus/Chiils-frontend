// src/components/OpenLibrary.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLessonsLite, type LessonLite, deleteLesson } from '../../../services/lessonService.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import './OpenLibrary.css';
import { extractYouTubeId, fetchYouTubeTitle } from '../../../utils/youtube.ts';
import { capitalizeFirstLetter } from '../../../utils/text.ts';
import {
    LANGUAGES, CEFR_LEVELS, GRAMMAR_TOPICS_BY_LEVEL, TOPICS,
    type CefrLevel, type Topic, type GrammarTopic
} from '../../../utils/filters.ts';

// Helpers for Filters
import { FilterDropdown, FilterPill } from '../FilterComponents.tsx';
import LessonBuilderButton from '../lesson-builder/LessonBuilderButton.tsx';
import { useLessonBuilder } from "../../../contexts/LessonBuilderContext.tsx";
import BuilderNotification from '../home/BuilderNotification.tsx';
import { globalLessonMonitoring } from '../../../services/globalLessonMonitoring.ts';
import NoResultsNotification from '../../common/NoResultsNotification.tsx';
import MobileDesktopStub from '../../lending/MobileDesktopStub.tsx';

const imgChiilsBlackLogo = "/assets/chiils-black-logo.svg";
type MobileFilterPanel = 'language' | 'level' | 'grammar' | 'topic';

const OpenLibrary: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isMobileStubOpen, setIsMobileStubOpen] = useState(false);
    const [mobileFilterPanel, setMobileFilterPanel] = useState<MobileFilterPanel | null>(null);
    const [lessons, setLessons] = useState<LessonLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const titleCacheRef = useRef<Record<string, string>>({});

    // Helpers
    const getLanguageLevel = (l: LessonLite): string => l.tags?.language_level || 'B1';
    const getGrammarTopics = (l: LessonLite): string[] => l.tags?.grammar_topics || [];
    const getTopics = (l: LessonLite): string[] => l.tags?.lexical_fields || [];
    const normalizeFilterValue = (value: string): string => value.trim().toLowerCase();

    // Derived Grammar Options
    // Note: We need to use selectedCefrLevels from state, but state is defined below. 
    // I will move helpers above state or state above helpers. 
    // Actually, component structure is: imports -> component -> state -> effects -> helpers -> logic -> jsx.
    // I will put helpers here for now.

    // фильтры
    const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
    const [selectedCefrLevels, setSelectedCefrLevels] = useState<string[]>([]);
    const [selectedGrammar, setSelectedGrammar] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error', lessonId?: string } | null>(null);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        const mainContent = document.querySelector<HTMLElement>('.main-content');
        mainContent?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [location.key]);

    useEffect(() => {
        if (!isMobileMenuOpen && !isMobileFiltersOpen && !isMobileStubOpen) {
            return;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
                setIsMobileFiltersOpen(false);
                setIsMobileStubOpen(false);
                setMobileFilterPanel(null);
            }
        };

        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMobileMenuOpen, isMobileFiltersOpen, isMobileStubOpen]);

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


            // Grammar
            if (selectedGrammar.length > 0) {
                const lessonGrammar = getGrammarTopics(filteredLesson).map(normalizeFilterValue);
                // If lesson has ANY of the selected grammar topics? Or ALL?
                // Typically 'any' is better for filters unless strict.
                const has = selectedGrammar.some(g => lessonGrammar.includes(normalizeFilterValue(g)));
                if (!has) return false;
            }

            // Topics
            if (selectedTopics.length > 0) {
                const lessonTopics = getTopics(filteredLesson).map(normalizeFilterValue);
                const has = selectedTopics.some(t => lessonTopics.includes(normalizeFilterValue(t)));
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
        const handleLessonCreated = () => {
            (async () => {
                try {
                    const data = await getLessonsLite({ page: 0, size: 24, sort: '-createdAt' });
                    setLessons(data ?? []);
                } catch (e) {
                    console.error(e);
                }
            })();
        };

        const handleBuildingStarted = (e: any) => {
            const lessonName = e.detail?.name || 'New Lesson';
            const lessonId = e.detail?.lessonId;
            setNotification({
                message: `Building lesson "${lessonName}"...`,
                type: 'info',
                lessonId
            });
            // Building notification stays for 60 seconds
            setTimeout(() => setNotification(null), 60000);
        };

        window.addEventListener('lessonCreated', handleLessonCreated);
        window.addEventListener('lessonBuildingStarted', handleBuildingStarted);
        return () => {
            window.removeEventListener('lessonCreated', handleLessonCreated);
            window.removeEventListener('lessonBuildingStarted', handleBuildingStarted);
        };
    }, []);

    // Monitoring listener
    useEffect(() => {
        const unsubscribe = globalLessonMonitoring.subscribe((lessonId, lessonName) => {
            // Refresh first page
            (async () => {
                try {
                    const data = await getLessonsLite({ page: 0, size: 24, sort: '-createdAt' });
                    setLessons(data ?? []);

                    // Find if it failed or successed
                    const lesson = data.find(l => l.id === lessonId);
                    const isError = lesson?.status === 'ERROR';

                    setNotification({
                        message: isError
                            ? `Failed to create lesson "${lessonName || 'Untitled'}".`
                            : `Lesson "${lessonName || 'Untitled'}" is ready!`,
                        type: isError ? 'error' : 'success'
                    });
                    setTimeout(() => setNotification(null), 10000);
                } catch (e) {
                    console.error('Failed to refresh data after monitoring update', e);
                }
            })();
        });
        return () => unsubscribe();
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

    const mobileFilterSummary = [
        selectedLanguage || 'English',
        selectedCefrLevels[0] || 'B1',
        selectedGrammar[0] || 'Past Perfect...'
    ].join(', ');

    const handleMobileHome = () => {
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const handleMobileStudentLogin = () => {
        setIsMobileMenuOpen(false);
        navigate('/login', { state: { hideSignInLink: true } });
    };

    const handleMobileSupport = () => {
        window.open('https://tally.so/r/KYlp6V', '_blank', 'noopener,noreferrer');
    };

    const handleMobileEmail = () => {
        window.location.href = 'mailto:team@chiils.com';
    };

    const handleMobileResetFilters = () => {
        setSelectedLanguage('English');
        setSelectedCefrLevels([]);
        setSelectedGrammar([]);
        setSelectedTopics([]);
    };

    const handleMobileFilterBack = () => {
        if (mobileFilterPanel) {
            setMobileFilterPanel(null);
            return;
        }

        setIsMobileFiltersOpen(false);
    };

    const formatMobileValue = (value: string) => value.length > 28 ? `${value.slice(0, 26)}...` : value;

    const mobileFilterRows = [
        { key: 'language' as const, label: 'Language', value: selectedLanguage || 'English' },
        { key: 'level' as const, label: 'CEFR level', value: selectedCefrLevels[0] || 'B1' },
        { key: 'grammar' as const, label: 'Grammar', value: selectedGrammar.length > 0 ? selectedGrammar.join(', ') : 'Past Perfect, Reported Spee...' },
        { key: 'topic' as const, label: 'Topic', value: selectedTopics.length > 0 ? selectedTopics.join(', ') : 'Everyday life, Fashion & Be...' }
    ];

    const getMobilePanelTitle = () => {
        switch (mobileFilterPanel) {
            case 'language':
                return 'Language';
            case 'level':
                return 'CEFR level';
            case 'grammar':
                return 'Grammar';
            case 'topic':
                return 'Topic';
            default:
                return 'Filters';
        }
    };

    const getMobilePanelOptions = () => {
        switch (mobileFilterPanel) {
            case 'language':
                return LANGUAGES;
            case 'level':
                return CEFR_LEVELS;
            case 'grammar':
                return availableGrammarTopics;
            case 'topic':
                return TOPICS;
            default:
                return [];
        }
    };

    const isMobileOptionSelected = (option: string) => {
        switch (mobileFilterPanel) {
            case 'language':
                return selectedLanguage === option;
            case 'level':
                return selectedCefrLevels.includes(option);
            case 'grammar':
                return selectedGrammar.includes(option);
            case 'topic':
                return selectedTopics.includes(option);
            default:
                return false;
        }
    };

    const handleMobileOptionToggle = (option: string) => {
        switch (mobileFilterPanel) {
            case 'language':
                setSelectedLanguage(selectedLanguage === option ? '' : option);
                break;
            case 'level':
                handleCefrToggle(option);
                break;
            case 'grammar':
                handleGrammarToggle(option);
                break;
            case 'topic':
                handleTopicToggle(option);
                break;
            default:
                break;
        }
    };


    return (
        <div className="open-library-page">
            <div className="open-library-mobile-topbar" aria-label="Open Library mobile header">
                <img src={imgChiilsBlackLogo} alt="Chiils" className="open-library-mobile-logo" />
                <button
                    className="open-library-mobile-menu"
                    type="button"
                    aria-label="Open navigation menu"
                    aria-expanded={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <img src="/assets/lending/burger.svg" alt="" aria-hidden="true" />
                </button>
            </div>

            <div className="open-library-mobile-heading">
                <h1>Open Library</h1>
                <button className="open-library-mobile-filter" type="button" onClick={() => setIsMobileFiltersOpen(true)}>
                    <img className="open-library-mobile-filter-icon" src="/assets/open-library/filter.svg" alt="" aria-hidden="true" />
                    <span>{mobileFilterSummary}</span>
                </button>
                <div className="open-library-mobile-search">
                    <span className="open-library-mobile-search-icon" aria-hidden="true"></span>
                    <input
                        type="text"
                        placeholder="Search community lessons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search community lessons"
                    />
                </div>
            </div>

            <div className="open-library-header">
                <div>
                    <h1>Open Library</h1>
                    <p className="header-description">
                        All community-created lessons in one place — use tags to find what you need just in a few clicks.
                    </p>
                </div>
                <div className="header-controls">
                    {notification && (
                        <BuilderNotification
                            message={notification.message}
                            type={notification.type}
                            onClose={() => setNotification(null)}
                            onUndo={() => {
                                if (notification.lessonId) {
                                    (async () => {
                                        try {
                                            await deleteLesson(notification.lessonId!);
                                            const data = await getLessonsLite({ page: 0, size: 24, sort: '-createdAt' });
                                            setLessons(data ?? []);
                                        } catch (e) {
                                            console.error('Failed to undo lesson creation', e);
                                        }
                                    })();
                                }
                                setNotification(null);
                            }}
                        />
                    )}
                    {user?.role !== 'STUDENT' && <LessonBuilderButton />}
                </div>
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
                                                        (lesson.you_tube_title?.trim()
                                                            || lesson.tags?.lesson_theme
                                                            || lesson.lesson_topic
                                                            || 'Lesson') as string
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className="lesson-mobile-actions"
                                            aria-hidden="true"
                                            onClick={(event) => event.stopPropagation()}
                                        >
                                            <span className="lesson-mobile-folder"></span>
                                            <span className="lesson-mobile-favorite"></span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredLessons.length === 0 && (
                                <div className="no-results">
                                    <NoResultsNotification />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="open-library-mobile-footer">
                <div className="open-library-mobile-desktop-prompt">
                    Switch to desktop
                    <br />
                    to explore the full
                    <br />
                    version
                </div>
                <div className="open-library-mobile-footer-panel">
                    <button type="button" className="open-library-mobile-get-started" onClick={() => setIsMobileStubOpen(true)}>
                        Get started →
                    </button>
                    <img src={imgChiilsBlackLogo} alt="Chiils" className="open-library-mobile-footer-logo" />
                    <button
                        type="button"
                        className="open-library-mobile-footer-button"
                        onClick={() => window.open('https://tally.so/r/KYlp6V', '_blank', 'noopener,noreferrer')}
                    >
                        Contact support
                    </button>
                    <button
                        type="button"
                        className="open-library-mobile-footer-button"
                        onClick={() => { window.location.href = 'mailto:team@chiils.com'; }}
                    >
                        team@chiils.com
                    </button>
                    <div className="open-library-mobile-footer-links">
                        <p>Privacy policy</p>
                        <p>Terms &amp; Conditions</p>
                        <p>Refund policy</p>
                        <p>Copyright © Koala Station DOO Beograd, 2025</p>
                    </div>
                </div>
            </div>
            {isMobileFiltersOpen && (
                <div className="open-library-mobile-filters-screen" role="dialog" aria-modal="true" aria-label="Open Library filters">
                    <div className="open-library-mobile-topbar" aria-label="Open Library filters header">
                        <img src={imgChiilsBlackLogo} alt="Chiils" className="open-library-mobile-logo" />
                        <button
                            className="open-library-mobile-menu"
                            type="button"
                            aria-label="Open navigation menu"
                            aria-expanded={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <img src="/assets/lending/burger.svg" alt="" aria-hidden="true" />
                        </button>
                    </div>

                    <button className="open-library-mobile-filter-back" type="button" onClick={handleMobileFilterBack}>
                        <img src="/assets/go-back.svg" alt="" aria-hidden="true" />
                        {mobileFilterPanel ? 'Filters' : 'Open Library'}
                    </button>

                    <h1 className="open-library-mobile-filters-title">{getMobilePanelTitle()}</h1>

                    {mobileFilterPanel ? (
                        <div className={`open-library-mobile-option-list ${mobileFilterPanel === 'topic' ? 'topic-widget' : ''}`}>
                            {getMobilePanelOptions().map(option => {
                                const isSelected = isMobileOptionSelected(option);

                                return (
                                    <button
                                        className={`open-library-mobile-option-row ${isSelected ? 'selected' : ''}`}
                                        type="button"
                                        key={option}
                                        onClick={() => handleMobileOptionToggle(option)}
                                    >
                                        <span className="open-library-mobile-check" aria-hidden="true"></span>
                                        <span>{option}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="open-library-mobile-filter-list">
                            {mobileFilterRows.map(row => (
                                <button
                                    className="open-library-mobile-filter-row"
                                    type="button"
                                    key={row.label}
                                    onClick={() => setMobileFilterPanel(row.key)}
                                >
                                    <span className="open-library-mobile-filter-row-label">{row.label}</span>
                                    <span className="open-library-mobile-filter-row-value">{formatMobileValue(row.value)}</span>
                                    <span className="open-library-mobile-filter-row-arrow" aria-hidden="true"></span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="open-library-mobile-filter-actions">
                        <button type="button" onClick={() => {
                            if (mobileFilterPanel) {
                                setMobileFilterPanel(null);
                            } else {
                                setIsMobileFiltersOpen(false);
                            }
                        }}>Apply</button>
                        <button type="button" onClick={handleMobileResetFilters}>Reset all</button>
                    </div>

                    <div className="open-library-mobile-footer-panel open-library-mobile-filters-footer-panel">
                        <img src={imgChiilsBlackLogo} alt="Chiils" className="open-library-mobile-footer-logo" />
                        <button
                            type="button"
                            className="open-library-mobile-footer-button"
                            onClick={() => window.open('https://tally.so/r/KYlp6V', '_blank', 'noopener,noreferrer')}
                        >
                            Contact support
                        </button>
                        <button
                            type="button"
                            className="open-library-mobile-footer-button"
                            onClick={() => { window.location.href = 'mailto:team@chiils.com'; }}
                        >
                            team@chiils.com
                        </button>
                        <div className="open-library-mobile-footer-links">
                            <p>Privacy policy</p>
                            <p>Terms &amp; Conditions</p>
                            <p>Refund policy</p>
                            <p>Copyright © Koala Station DOO Beograd, 2025</p>
                        </div>
                    </div>
                </div>
            )}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay" role="dialog" aria-modal="true" aria-label="Mobile navigation">
                    <div className="mobile-menu-panel">
                        <div className="mobile-menu-top">
                            <img src="/assets/chiils-white-logo.svg" alt="Chiils" className="mobile-menu-logo" />
                            <button
                                className="mobile-menu-close"
                                type="button"
                                aria-label="Close navigation menu"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                x
                            </button>
                        </div>

                        <nav className="mobile-menu-nav" aria-label="Mobile navigation links">
                            <button type="button" onClick={handleMobileHome}>Home</button>
                            <button type="button" onClick={handleMobileStudentLogin}>Student log in</button>
                            <button type="button" disabled aria-disabled="true">Tools</button>
                            <button type="button" disabled aria-disabled="true">Pricing</button>
                            <button type="button" disabled aria-disabled="true">Questions &amp; Answers</button>
                            <button type="button" className="mobile-menu-nav-disabled-auth" disabled aria-disabled="true">
                                Log in / Sign up
                            </button>
                            <p className="mobile-menu-nav-disabled-note">Available on Desktop</p>
                        </nav>

                        <div className="mobile-menu-actions">
                            <button type="button" onClick={handleMobileSupport}>
                                Contact support
                            </button>
                            <button type="button" onClick={handleMobileEmail}>team@chiils.com</button>
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
        </div >
    );
};

export default OpenLibrary;
