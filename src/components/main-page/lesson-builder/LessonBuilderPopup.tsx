import React, { useState, useEffect, useMemo } from 'react';
import './LessonBuilderPopup.css';
import { FilterDropdown, FilterPill } from '../FilterComponents.tsx';
import { createLesson } from '../../../services/api.ts';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import {
    LANGUAGES, CEFR_LEVELS, PRESETS, GRAMMAR_TOPICS_BY_LEVEL,
    type CefrLevel
} from '../../../utils/filters.ts';
import { extractYouTubeId, fetchYouTubeDuration } from '../../../utils/youtube.ts';

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
    const [selectedPreset, setSelectedPreset] = useState<string>();
    const [selectedGrammar, setSelectedGrammar] = useState<string[]>([]);
    const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | undefined>(undefined);
    const [duration, setDuration] = useState<number | null>(null);
    const [isValidatingLink, setIsValidatingLink] = useState(false);

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

    // Fetch video duration and validate
    useEffect(() => {
        const videoId = extractYouTubeId(youtubeLink);
        if (videoId) {
            setIsValidatingLink(true);
            fetchYouTubeDuration(videoId).then(d => {
                setDuration(d);
                setIsValidatingLink(false);
                if (d && d > 3600) { // 60 minutes
                    setErrors(prev => ({ ...prev, link: true }));
                } else if (errors.link) {
                    setErrors(prev => ({ ...prev, link: false }));
                }
            }).catch(() => {
                setDuration(null);
                setIsValidatingLink(false);
            });
        } else {
            setDuration(null);
        }
    }, [youtubeLink]);

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

    useEffect(() => {
        setSelectedSegmentIndex(undefined);
    }, [duration]);

    const handlePresetToggle = (preset: string) => {
        setSelectedPreset(preset);
    };

    const handleGrammarToggle = (topic: string) => {
        if (errors['grammar']) setErrors(prevErrors => ({ ...prevErrors, grammar: false }));
        
        if (selectedGrammar.includes(topic)) {
            setSelectedGrammar([]);
        } else {
            setSelectedGrammar([topic]);
        }
    };

    const segments = useMemo(() => {
        if (!duration) return [];
        const segs = [];
        const fifteenMins = 15 * 60; // 900 seconds
        for (let i = 0; i < duration; i += fifteenMins) {
            const start = i;
            const end = Math.min(i + fifteenMins, duration);
            
            const formatMin = (s: number) => Math.floor(s / 60);
            
            segs.push({
                label: `${formatMin(start)} – ${formatMin(end)} min`,
                start,
                end
            });
        }
        return segs;
    }, [duration]);

    // Available Grammar
    const availableGrammarTopics = useMemo(() => {
        if (selectedCefrLevels.length === 0) return [];
        const level = selectedCefrLevels[0] as CefrLevel;
        return GRAMMAR_TOPICS_BY_LEVEL[level] || [];
    }, [selectedCefrLevels, selectedLanguage]);

    const handleSubmit = async () => {
        const newErrors: { [key: string]: boolean } = {};
        if (!selectedLanguage) newErrors.language = true;
        if (selectedCefrLevels.length === 0) newErrors.level = true;
        if (!selectedPreset) newErrors.preset = true;
        // Segment is now optional
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
            const selectedSegment = selectedSegmentIndex !== undefined ? segments[selectedSegmentIndex] : null;
            // Removed segment throw

            const requestData = {
                name,
                email,
                youtubeLink,
                language: selectedLanguage,
                languageLevel: selectedCefrLevels[0],
                grammarTopics: selectedGrammar,
                preset: selectedPreset === 'Claudia (classic, guided, balanced)' ? 'claudia' : (selectedPreset || ''),
                segmentStartMin: selectedSegment ? selectedSegment.start /60 : null,
                segmentEndMin: selectedSegment ? selectedSegment.end / 60 : null
            };

            const response = await createLesson(requestData as any);
            const lessonId = response.lesson_id;

            // Signal refresh for HomePage
            window.dispatchEvent(new CustomEvent('lessonCreated'));
            // Signal immediate building status for notification (60s duration with Undo)
            window.dispatchEvent(new CustomEvent('lessonBuildingStarted', { 
                detail: { 
                    name: name || youtubeLink || 'New Lesson',
                    lessonId: lessonId
                } 
            }));

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
                        <h1 className="popup-title">Lesson Builder</h1>

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
                            <div className="lb-input-row" style={{ zIndex: 30 }}>
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
                                            <FilterPill
                                                label="English"
                                                isActive={selectedLanguage === 'English'}
                                                onClick={() => {
                                                    setSelectedLanguage('English');
                                                    setOpenDropdown(null);
                                                    setErrors(prev => ({ ...prev, language: false }));
                                                }}
                                            />
                                        </div>
                                    </FilterDropdown>
                                </div>
                            </div>

                            {/* CEFR Level */}
                            <div className="lb-input-row" style={{ zIndex: 20 }}>
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

                            {/* Preset */}
                            <div className="lb-input-row" style={{ zIndex: 10 }}>
                                <label className="lb-label">Preset</label>
                                <div className="lb-field-container">
                                    <FilterDropdown
                                        label={selectedPreset || "Select a lesson type"}
                                        isOpen={openDropdown === 'preset'}
                                        onToggle={() => toggleDropdown('preset')}
                                        activeCount={selectedPreset ? 1 : 0}
                                        isDefault={!selectedPreset}
                                        error={errors.preset}
                                        onClear={() => setSelectedPreset(undefined)}
                                    >
                                        <div className="filters-row">
                                            {PRESETS.map(p => (
                                                <FilterPill
                                                    key={p}
                                                    label={p}
                                                    isActive={selectedPreset === p}
                                                    onClick={() => handlePresetToggle(p)}
                                                />
                                            ))}
                                        </div>
                                    </FilterDropdown>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="lb-column">
                            {/* Grammar */}
                            <div className="lb-input-row" style={{ zIndex: 30 }}>
                                <label className="lb-label">Grammar</label>
                                <div className="lb-field-container">
                                    {(!selectedLanguage || selectedCefrLevels.length === 0) && (
                                        <p className="lb-helper-text">Select a language and a CEFR level first</p>
                                    )}
                                    <FilterDropdown
                                        label={selectedGrammar.length > 0 ? selectedGrammar.join(', ') : "Select grammar topic"}
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

                            {/* YouTube Link */}
                            <div className="lb-input-row" style={{ zIndex: 20 }}>
                                <label className="lb-label">Link</label>
                                <div className="lb-field-container">
                                    <p className="lb-helper-text">Max length: 60 minutes</p>
                                    <input
                                        className={`lb-input ${errors.link ? 'has-error' : ''} ${isValidatingLink ? 'validating' : ''}`}
                                        value={errors.link && duration && duration > 3600 ? "Video is too long (max 60 min)" : (errors.link ? "Please enter a valid YouTube link" : youtubeLink)}
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
                                        disabled={isValidatingLink}
                                        placeholder={isValidatingLink ? "Checking video length..." : "Paste Youtube link"}
                                        style={errors.link ? { color: '#f44336' } : {}}
                                    />
                                </div>
                            </div>

                            {/* Segment */}
                            <div className="lb-input-row" style={{ zIndex: 10 }}>
                                <label className="lb-label">Segment</label>
                                <div className="lb-field-container">
                                    <FilterDropdown
                                        label={selectedSegmentIndex !== undefined ? segments[selectedSegmentIndex].label : "Select a segment"}
                                        isOpen={openDropdown === 'segment'}
                                        onToggle={() => toggleDropdown('segment')}
                                        activeCount={selectedSegmentIndex !== undefined ? 1 : 0}
                                        isDefault={selectedSegmentIndex === undefined}
                                        error={errors.segment}
                                        onClear={() => {
                                            setSelectedSegmentIndex(undefined);
                                            setErrors(prev => ({ ...prev, segment: false }));
                                        }}
                                    >
                                        <div className="filters-row">
                                            {segments.map((seg, idx) => (
                                                <FilterPill
                                                    key={idx}
                                                    label={seg.label}
                                                    isActive={selectedSegmentIndex === idx}
                                                    onClick={() => {
                                                        setSelectedSegmentIndex(idx);
                                                        setOpenDropdown(null);
                                                        setErrors(prev => ({ ...prev, segment: false }));
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </FilterDropdown>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="popup-footer">
                        <button
                            className="create-btn"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Hit it!'}
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default LessonBuilderPopup;
