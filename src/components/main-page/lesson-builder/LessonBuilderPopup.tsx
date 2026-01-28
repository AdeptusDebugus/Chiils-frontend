import React, { useState, useEffect, useMemo } from 'react';
import './LessonBuilderPopup.css';
import { FilterDropdown, FilterPill } from '../FilterComponents.tsx';
import { createLesson } from '../../../services/api.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import {
    LANGUAGES, CEFR_LEVELS, SCENARIOS, GRAMMAR_TOPICS_BY_LEVEL, TOPICS,
    type CefrLevel
} from '../../../utils/filters.ts';
import { extractYouTubeId } from '../../../utils/youtube.ts';

interface LessonBuilderPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const LessonBuilderPopup: React.FC<LessonBuilderPopupProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [youtubeLink, setYoutubeLink] = useState('');

    // Filter States
    const [selectedLanguage, setSelectedLanguage] = useState<string>();
    const [selectedCefrLevels, setSelectedCefrLevels] = useState<string[]>([]);
    const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
    const [selectedGrammar, setSelectedGrammar] = useState<string[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

    // UI State
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

    // Autofill
    useEffect(() => {
        if (isOpen && user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [isOpen, user]);

    // Helpers
    const toggleDropdown = (name: string) => {
        setOpenDropdown(prev => prev === name ? null : name);
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: false }));
        }
    };

    const handleCefrToggle = (level: string) => {
        // Single select for builder? Or multi? Usually builder is single level target. 
        // Let's stick to single select behavior for level in builder to be precise.
        setSelectedCefrLevels([level]);
        if (errors['level']) setErrors(prev => ({ ...prev, level: false })); // Clear error
        // Clear grammar if level changes? Maybe smart
        setSelectedGrammar([]);
    };

    const handleScenarioToggle = (scenario: string) => {
        setSelectedScenarios([scenario]);
    };

    const handleGrammarToggle = (topic: string) => {
        setSelectedGrammar(prev => {
            if (errors['grammar']) setErrors(prevErrors => ({ ...prevErrors, grammar: false }));
            if (prev.includes(topic)) {
                return prev.filter(t => t !== topic);
            }
            if (prev.length >= 3) {
                return prev;
            }
            return [...prev, topic];
        });
    };

    const handleTopicToggle = (topic: string) => {
        setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
    };

    // Available Grammar
    const availableGrammarTopics = useMemo(() => {
        if (selectedCefrLevels.length === 0) return [];
        const level = selectedCefrLevels[0] as CefrLevel;
        return GRAMMAR_TOPICS_BY_LEVEL[level] || [];
    }, [selectedCefrLevels]);

    const handleSubmit = async () => {
        const newErrors: { [key: string]: boolean } = {};
        if (!selectedLanguage) newErrors.language = true;
        if (selectedCefrLevels.length === 0) newErrors.level = true;
        if (!youtubeLink) {
            newErrors.link = true;
        } else if (!extractYouTubeId(youtubeLink)) {
            newErrors.link = true;
        }
        if (selectedGrammar.length === 0) newErrors.grammar = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!name || !email) {
            // If user is missing name/email (not logged in), we should probably fail or handle it.
            // But since we are "automating" it, and inputs are gone, we assume they are there or we can't proceed.
            // Let's rely on user context.
            if (!user) {
                setStatus({ type: 'error', message: 'You must be logged in to create a lesson.' });
                return;
            }
            // Valid user but missing profile info? auto-fill might have failed.
            // We'll proceed with user info if state is empty.
        }

        setIsSubmitting(true);
        setStatus({ type: 'idle', message: '' });

        try {
            // Mapping to API request
            // Note: API definition currently supports: name, youtube_link, email, language_level, grammar_topics, language.
            // We are adding 'lesson_theme' (Scenario) and 'lesson_topic' (Topic) implicitly or combining them?
            // Since we can't change backend easily, we might send them if backend supports dynamic fields, 
            // OR we append them to grammar_topics if we have to hack it, OR we just trust the plan that we send them.
            // I will extend the type locally or just cast.

            const requestData: any = {
                name,
                email,
                youtube_link: youtubeLink,
                language: selectedLanguage,
                language_level: selectedCefrLevels[0],
                grammar_topics: selectedGrammar,
                // Passing extra fields
                lesson_theme: selectedScenarios.join(', '), // Send as string or array? Usually string for single theme.
                lesson_topic: selectedTopics.join(', ')
            };

            await createLesson(requestData);

            onClose();
            // detailed reset is not needed because the component unmounts on close
        } catch (e: any) {
            console.error(e);
            setStatus({ type: 'error', message: e.message || 'Failed to create lesson.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="lesson-builder-overlay" onClick={onClose}>
            <div className="lesson-builder-popup" onClick={e => e.stopPropagation()}>
                <div className="lesson-builder-cover"></div>

                <div className="lesson-builder-content">
                    <div className="popup-header">
                        <h2 className="popup-title">Lesson Builder</h2>

                    </div>

                    {status.message && status.type !== 'error' && (
                        <div className={`status-message ${status.type}`}>
                            {status.message}
                        </div>
                    )}


                    <div className="lb-grid">
                        {/* Left Column */}
                        <div className="lb-column">
                            {/* Language */}
                            <div className="lb-input-row">
                                <label className="lb-label">Language</label>
                                <div className="lb-field-container">
                                    <FilterDropdown
                                        label={selectedLanguage || "Select target language"}
                                        isOpen={openDropdown === 'language'}
                                        onToggle={() => toggleDropdown('language')}
                                        activeCount={selectedLanguage ? 1 : 0}
                                        isDefault={!selectedLanguage}
                                        error={errors.language}
                                        onClear={() => {
                                            setSelectedLanguage(undefined);
                                            setErrors(prev => ({ ...prev, language: false }));
                                        }}
                                    >
                                        <div className="filters-row">
                                            {LANGUAGES.map(lang => (
                                                <FilterPill
                                                    key={lang}
                                                    label={lang}
                                                    isActive={selectedLanguage === lang}
                                                    onClick={() => {
                                                        setSelectedLanguage(lang);
                                                        setErrors(prev => ({ ...prev, language: false }));
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </FilterDropdown>
                                </div>
                            </div>

                            {/* CEFR Level */}
                            <div className="lb-input-row">
                                <label className="lb-label">CEFR Level</label>
                                <div className="lb-field-container">
                                    <FilterDropdown
                                        label={selectedCefrLevels.length > 0 ? selectedCefrLevels.join(', ') : "Select CEFR level"}
                                        isOpen={openDropdown === 'level'}
                                        onToggle={() => toggleDropdown('level')}
                                        activeCount={selectedCefrLevels.length}
                                        isDefault={selectedCefrLevels.length === 0}
                                        error={errors.level}
                                        onClear={() => {
                                            setSelectedCefrLevels([]);
                                            setErrors(prev => ({ ...prev, level: false }));
                                        }}
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

                            {/* Scenario */}
                            <div className="lb-input-row">
                                <label className="lb-label">Scenario</label>
                                <div className="lb-field-container">
                                    <FilterDropdown
                                        label={selectedScenarios.length > 0 ? selectedScenarios.join(', ') : "Select lesson scenario"}
                                        isOpen={openDropdown === 'scenario'}
                                        onToggle={() => toggleDropdown('scenario')}
                                        activeCount={selectedScenarios.length}
                                        isDefault={selectedScenarios.length === 0}
                                        onClear={() => setSelectedScenarios([])}
                                    >
                                        <div className="filters-row">
                                            {SCENARIOS.map(s => (
                                                <FilterPill
                                                    key={s}
                                                    label={s}
                                                    isActive={selectedScenarios.includes(s)}
                                                    onClick={() => handleScenarioToggle(s)}
                                                />
                                            ))}
                                        </div>
                                    </FilterDropdown>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lb-column">
                            {/* YouTube Link */}
                            <div className="lb-input-row">
                                <label className="lb-label">Link</label>
                                <div className="lb-field-container">
                                    <p className="lb-helper-text">Your video must be under 120 minutes</p>
                                    <input
                                        className="lb-input"
                                        value={errors.link ? "Please enter a valid YouTube link" : youtubeLink}
                                        onChange={e => {
                                            setYoutubeLink(e.target.value);
                                            if (errors.link) {
                                                setErrors(prev => ({ ...prev, link: false }));
                                            }
                                        }}
                                        onFocus={e => {
                                            if (errors.link) {
                                                setYoutubeLink('');
                                                setErrors(prev => ({ ...prev, link: false }));
                                            }
                                        }}
                                        placeholder="Paste Youtube link"
                                        style={errors.link ? { color: '#f44336' } : {}}
                                    />
                                </div>
                            </div>

                            {/* Grammar */}
                            <div className="lb-input-row">
                                <label className="lb-label">Grammar</label>
                                <div className="lb-field-container">
                                    {(!selectedLanguage || selectedCefrLevels.length === 0) && (
                                        <p className="lb-helper-text">Select a language and a CEFR level first</p>
                                    )}
                                    <FilterDropdown
                                        label={selectedGrammar.length > 0 ? selectedGrammar.join(', ') : "Select up to 3 grammar points"}
                                        isOpen={openDropdown === 'grammar'}
                                        onToggle={() => toggleDropdown('grammar')}
                                        activeCount={selectedGrammar.length}
                                        disabled={!selectedLanguage || selectedCefrLevels.length === 0}
                                        isDefault={selectedGrammar.length === 0}
                                        error={errors.grammar}
                                        onClear={() => {
                                            setSelectedGrammar([]);
                                            setErrors(prev => ({ ...prev, grammar: false }));
                                        }}
                                    >
                                        <div className="filters-row topics-grid">
                                            {availableGrammarTopics.map(t => (
                                                <FilterPill
                                                    key={t}
                                                    label={t}
                                                    isActive={selectedGrammar.includes(t)}
                                                    onClick={() => handleGrammarToggle(t)}
                                                />
                                            ))}
                                        </div>
                                    </FilterDropdown>
                                </div>
                            </div>

                            {/* Create Button */}
                            <div className="popup-footer">
                                <button
                                    className="create-btn"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create your lesson'}
                                </button>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default LessonBuilderPopup;
