import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonService, LessonData } from '../services/lessonService';
import './OpenLibrary.css';

const OpenLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('Neutral');

  // Helper functions (defined before they're used)
  const getLanguageLevel = (lesson: LessonData): string => {
    // Extract level from lesson data if available
    return 'B1'; // Default level, can be enhanced based on actual data structure
  };

  const getGrammarTopics = (lesson: LessonData): string[] => {
    // Extract grammar topics from lesson data
    return ['Present Perfect', 'Conditionals']; // Default topics, can be enhanced
  };

  const getTopics = (lesson: LessonData): string[] => {
    // Extract topics from lesson data
    return ['Architecture & Interior', 'Neutral']; // Default topics, can be enhanced
  };

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const publicLessons = await lessonService.getPublicLessons();
        setLessons(publicLessons || []);
        setError(null);
      } catch (err) {
        setError('Failed to load lessons');
        console.error('Error loading public lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const filteredLessons = lessons.filter(lesson => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const grammarTopics = getGrammarTopics(lesson);
      const topics = getTopics(lesson);
      const matchesSearch = (
        lesson.lesson_topic?.toLowerCase().includes(searchLower) ||
        lesson.language?.toLowerCase().includes(searchLower) ||
        lesson.tag?.toLowerCase().includes(searchLower) ||
        grammarTopics.some(topic => topic.toLowerCase().includes(searchLower)) ||
        topics.some(topic => topic.toLowerCase().includes(searchLower)) ||
        lesson.glossary?.some(item => 
          item.expression?.toLowerCase().includes(searchLower) ||
          item.translation?.toLowerCase().includes(searchLower)
        )
      );
      if (!matchesSearch) return false;
    }
    
    // Language filter
    if (selectedLanguage && lesson.language?.toLowerCase() !== selectedLanguage.toLowerCase()) {
      return false;
    }
    
    // Level filter
    if (selectedLevels.length > 0) {
      const lessonLevel = getLanguageLevel(lesson);
      if (!selectedLevels.includes(lessonLevel)) {
        return false;
      }
    }
    
    // Topic filter
    if (selectedTopics.length > 0) {
      const lessonTopics = getTopics(lesson);
      const hasMatchingTopic = selectedTopics.some(topic => 
        lessonTopics.some(lessonTopic => 
          lessonTopic.toLowerCase().includes(topic.toLowerCase())
        )
      );
      if (!hasMatchingTopic) {
        return false;
      }
    }
    
    // Style filter
    if (selectedStyle && selectedStyle !== 'All') {
      const lessonStyles = getTopics(lesson); // Using topics as style for now
      const hasMatchingStyle = lessonStyles.some(style => 
        style.toLowerCase().includes(selectedStyle.toLowerCase())
      );
      if (!hasMatchingStyle && selectedStyle !== 'Neutral') {
        return false;
      }
    }
    
    return true;
  });

  // Filter handlers
  const handleLevelToggle = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  // Navigation handler
  const handleLessonClick = (lessonIndex: number) => {
    navigate(`/lesson/${lessonIndex}`);
  };

  if (loading) {
    return (
      <div className="open-library-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="open-library-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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

          {/* Filter options rows */}
          <div className="filter-options-container">
            <div className="filter-options-row">
              {/* Language Column */}
              <div className="filter-options-group">
                <button 
                  className={`filter-option language-option ${selectedLanguage === 'English' ? 'active' : ''}`}
                  onClick={() => setSelectedLanguage('English')}
                >
                  English
                </button>
              </div>

              {/* Level Column */}
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

              {/* Topics Column */}
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

              {/* Style Column */}
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
          <div className="search-section">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <p className="search-description">
              Здесь собраны все готовые уроки сервиса — можно искать по языку, уровню, теме, ключевым словам и грамматике.
            </p>
          </div>

          <div className="lessons-grid">
            {filteredLessons.map((lesson, index) => (
              <div 
                key={`lesson-${index}`} 
                className="lesson-card"
                onClick={() => handleLessonClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLessonClick(index);
                  }
                }}
              >
                <div className="lesson-thumbnail">
                  {lesson.you_tube_url && (
                    <img
                      src={`https://img.youtube.com/vi/${extractYouTubeId(lesson.you_tube_url)}/maxresdefault.jpg`}
                      alt={lesson.lesson_topic || 'Lesson thumbnail'}
                      className="thumbnail-image"
                    />
                  )}
                </div>
                
                <div className="lesson-info">
                  <div className="lesson-meta">
                    <div className="lesson-tags">
                      <span className="tag language">{lesson.language || 'English'}</span>
                      <span className="tag level">{getLanguageLevel(lesson)}</span>
                      {getGrammarTopics(lesson).map((topic, i) => (
                        <span key={i} className="tag grammar">{topic}</span>
                      ))}
                    </div>
                    
                    <div className="lesson-topics">
                      {getTopics(lesson).map((topic, i) => (
                        <span key={i} className="topic-tag">{topic}</span>
                      ))}
                    </div>
                    <span className="lesson-title">
                    {lesson.lesson_topic || 'Untitled Lesson'}
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
        </div>
      </div>
    </div>
  );
};

const extractYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      if (id) return id;
    }
    return null;
  } catch {
    return null;
  }
};

export default OpenLibrary;
