import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { type LessonLite, getUserLessonsLite } from '../../../services/lessonService.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { globalLessonMonitoring } from '../../../services/globalLessonMonitoring.ts';
import { lessonMonitoringService } from '../../../services/lessonMonitoringService.ts';
import {
    LANGUAGES, CEFR_LEVELS, SCENARIOS, GRAMMAR_TOPICS_BY_LEVEL, TOPICS,
    type CefrLevel
} from '../../../utils/filters.ts';
import { FilterDropdown, FilterPill } from '../FilterComponents.tsx';
import HomeLessonCard from './HomeLessonCard.tsx';
import './MyLessonsExpanded.css';

// Assets
const iconNavLeft = "/assets/home/expand-left.svg";
const iconNavRight = "/assets/home/expand-right.svg";
const iconClose = "/assets/home/close.svg";

interface MyLessonsExpandedProps {
    onClose: () => void;
    likedLessonIds: Set<string>;
    onToggleLike: (lessonId: string) => void;
    onAddToFolder: (lessonId: string) => void;
}

const MyLessonsExpanded: React.FC<MyLessonsExpandedProps> = ({
    onClose,
    likedLessonIds,
    onToggleLike,
    onAddToFolder
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lessons, setLessons] = useState<LessonLite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Grid Ref for scrolling
    const gridRef = useRef<HTMLDivElement>(null);

    // Filters
    const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
    const [selectedCefrLevels, setSelectedCefrLevels] = useState<string[]>([]);
    const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
    const [selectedGrammar, setSelectedGrammar] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    // Load Lessons
    useEffect(() => {
        if (!user?.email) return;

        (async () => {
            try {
                setLoading(true);
                // Fetch all/more lessons for the expanded view
                const data = await getUserLessonsLite({ page: 0, size: 50, sort: '-createdAt', email: user.email });
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
        const unsubscribe = globalLessonMonitoring.subscribe((lessonId) => {
            console.log('MyLessonsExpanded: Lesson ready, refreshing...', lessonId);
            (async () => {
                if (!user?.email) return;
                try {
                    const data = await getUserLessonsLite({ page: 0, size: 50, sort: '-createdAt', email: user.email });
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

    // Helpers
    const getLanguageLevel = (l: LessonLite): string => l.tags?.language_level || 'B1';
    const getGrammarTopics = (l: LessonLite): string[] => l.tags?.grammar_topics || [];
    const getTopics = (l: LessonLite): string[] => l.tags?.lexical_fields || [];

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

    // Filter Logic
    const availableGrammarTopics = selectedCefrLevels.length > 0
        ? Array.from(new Set(selectedCefrLevels.flatMap(level => GRAMMAR_TOPICS_BY_LEVEL[level as CefrLevel] || [])))
        : Object.values(GRAMMAR_TOPICS_BY_LEVEL).flat();

    const filteredLessons = lessons
        .map(lesson => {
            let score = 0;
            let matchesSearch = true;

            if (searchTerm) {
                const normalizedSearch = searchTerm.toLowerCase().trim();
                const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 0);

                if (searchWords.length > 0) {
                    matchesSearch = false;
                    let wordMatches = 0;

                    searchWords.forEach(searchWord => {
                        let fieldMatch = false;
                        // Check video title
                        if ((lesson.you_tube_title || '').toLowerCase().includes(searchWord)) { fieldMatch = true; score += 10; }
                        // Check lesson topic
                        if ((lesson.lesson_topic || '').toLowerCase().includes(searchWord)) { fieldMatch = true; score += 10; }
                        // Check theme
                        if ((lesson.tags?.lesson_theme || '').toLowerCase().includes(searchWord)) { fieldMatch = true; score += 8; }

                        if (fieldMatch) wordMatches++;
                    });

                    if (wordMatches === searchWords.length) matchesSearch = true;
                }
            }
            return { lesson, score, matchesSearch };
        })
        .filter(({ lesson: l, matchesSearch }) => {
            if (!matchesSearch) return false;
            if (selectedLanguage && (l.tags?.language || '').toLowerCase() !== selectedLanguage.toLowerCase()) return false;

            if (selectedCefrLevels.length > 0) {
                if (!selectedCefrLevels.includes(getLanguageLevel(l))) return false;
            }

            if (selectedScenarios.length > 0) {
                const theme = (l.tags?.lesson_theme || '');
                if (!selectedScenarios.some(s => theme.toLowerCase() === s.toLowerCase())) return false;
            }

            if (selectedGrammar.length > 0) {
                const lessonGrammar = l.tags?.grammar_topics || [];
                if (!selectedGrammar.some(g => lessonGrammar.includes(g))) return false;
            }

            if (selectedTopics.length > 0) {
                const lessonTopics = getTopics(l);
                if (!selectedTopics.some(t => lessonTopics.includes(t))) return false;
            }

            return true;
        })
        .sort((a, b) => b.score - a.score)
        .map(({ lesson }) => lesson);

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const toggleDropdown = (name: string) => {
        setActiveDropdown(prev => prev === name ? null : name);
    };

    // Toggle Handlers
    const handleCefrToggle = (level: string) => setSelectedCefrLevels(prev => prev.includes(level) ? [] : [level]);
    const handleScenarioToggle = (scenario: string) => setSelectedScenarios(prev => prev.includes(scenario) ? prev.filter(s => s !== scenario) : [...prev, scenario]);
    const handleGrammarToggle = (topic: string) => setSelectedGrammar(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
    const handleTopicToggle = (topic: string) => setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);

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
                    <h2>My Lessons</h2>
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
                    {/* Filters - Matching Open Library Layout */}
                    <div className="popup-filters-container">
                        <div className="popup-filters-left">
                            {/* Language */}
                            <div className="popup-filter-group">
                                <span className="popup-filter-group-label">Language</span>
                                <FilterDropdown
                                    label={selectedLanguage || "Select language"}
                                    isOpen={activeDropdown === 'language'}
                                    onToggle={() => toggleDropdown('language')}
                                    disabled
                                >
                                    <div className="filter-dropdown-content-inner">Only English available</div>
                                </FilterDropdown>
                            </div>

                            {/* CEFR Levels */}
                            <div className="popup-filter-group">
                                <span className="popup-filter-group-label">CEFR level</span>
                                <FilterDropdown
                                    label={selectedCefrLevels.length > 0 ? selectedCefrLevels.join(', ') : "Select CEFR level"}
                                    isOpen={activeDropdown === 'level'}
                                    onToggle={() => toggleDropdown('level')}
                                    activeCount={selectedCefrLevels.length}
                                    isDefault={selectedCefrLevels.length === 0}
                                    onClear={() => setSelectedCefrLevels([])}
                                >
                                    <div className="popup-filters-row">
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
                            <div className="popup-filter-group">
                                <span className="popup-filter-group-label">Scenario</span>
                                <FilterDropdown
                                    label={selectedScenarios.length > 0 ? selectedScenarios.join(', ') : "Select lesson scenario"}
                                    isOpen={activeDropdown === 'scenario'}
                                    onToggle={() => toggleDropdown('scenario')}
                                    activeCount={selectedScenarios.length}
                                    isDefault={selectedScenarios.length === 0}
                                    onClear={() => setSelectedScenarios([])}
                                >
                                    <div className="popup-filters-row">
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

                        <div className="popup-filters-right">
                            {/* Grammar */}
                            <div className="popup-filter-group" style={{ position: 'relative' }}>
                                {(!selectedLanguage || selectedCefrLevels.length === 0) && (
                                    <span className="popup-grammar-warning-text">
                                        Select a language and a CEFR level first
                                    </span>
                                )}
                                <span className="popup-filter-group-label">Grammar</span>
                                <FilterDropdown
                                    label={selectedGrammar.length > 0 ? selectedGrammar.join(', ') : "Choose grammar points"}
                                    isOpen={activeDropdown === 'grammar'}
                                    onToggle={() => toggleDropdown('grammar')}
                                    activeCount={selectedGrammar.length}
                                    isDefault={selectedGrammar.length === 0}
                                    disabled={!selectedLanguage || selectedCefrLevels.length === 0}
                                    onClear={() => setSelectedGrammar([])}
                                >
                                    <div className="popup-filters-row topics-grid">
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
                            <div className="popup-filter-group">
                                <span className="popup-filter-group-label">Topic</span>
                                <FilterDropdown
                                    label={selectedTopics.length > 0 ? selectedTopics.join(', ') : "Choose lesson topics"}
                                    isOpen={activeDropdown === 'topics'}
                                    onToggle={() => toggleDropdown('topics')}
                                    activeCount={selectedTopics.length}
                                    isDefault={selectedTopics.length === 0}
                                    onClear={() => setSelectedTopics([])}
                                >
                                    <div className="popup-filters-row topics-grid">
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

                    {/* Grid */}
                    <div className="popup-grid-container">
                        {loading ? (
                            <div>Loading...</div>
                        ) : filteredLessons.length === 0 ? (
                            <div>No lessons found.</div>
                        ) : (
                            <div className="popup-lessons-grid" ref={gridRef}>
                                {filteredLessons.map(lesson => (
                                    <HomeLessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                                        onAddToFolder={() => onAddToFolder(lesson.id)}
                                        onAddToFavorite={() => onToggleLike(lesson.id)}
                                        isLiked={likedLessonIds.has(lesson.id)}
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
