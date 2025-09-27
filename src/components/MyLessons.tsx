import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonService, LessonData } from '../services/lessonService'

// Extended interface for lesson cards
interface LessonCardData extends LessonData {
  tag?: string
  language?: string
  grammar_topics?: string[]
}

const MyLessons: React.FC = () => {
  const [lessons, setLessons] = useState<LessonCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await lessonService.getPublicLessons()
        
        // Transform lessons to include card data
        const cardData: LessonCardData[] = data.map((lesson, index) => ({
          ...lesson,
          grammar_topics: lesson.grammar_exercises.map(ex => ex.type) // Extract grammar topics from exercises
        }))

        setLessons(cardData)
        setError(null)
      } catch (e) {
        setError('Failed to load lessons')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="lesson-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading lessons...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lesson-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lesson-page">
      <div className="lesson-header">
        <h1>My Lessons</h1>
        <p className="lesson-description">Select a lesson to start learning.</p>
      </div>

      <div className="lessons-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
        padding: '20px 0'
      }}>
        {lessons.length === 0 && (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px',
            color: '#666'
          }}>
            No lessons available yet.
          </div>
        )}
        
        {lessons.map((lesson, idx) => (
          <div key={idx} style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e9e9e7',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}>
            <Link to={`/my-lessons/${idx}`} style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'block'
            }}>
              {/* Tag */}
              <div style={{
                display: 'inline-block',
                backgroundColor: '#f0f0f0',
                color: '#666',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '16px'
              }}>
                {lesson.tag}
              </div>

              {/* Lesson Title */}
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#37352f',
                margin: '0 0 12px 0',
                lineHeight: '1.3'
              }}>
                {lesson.lesson_topic}
              </h3>

              {/* Language */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                color: '#666',
                fontSize: '14px'
              }}>
                <span style={{ 
                  marginRight: '8px',
                  fontSize: '16px'
                }}>🌐</span>
                <span>{lesson.language}</span>
              </div>

              {/* Grammar Topics */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#666',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Grammar Topics
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  {lesson.grammar_topics?.slice(0, 3).map((topic, topicIdx) => (
                    <span key={topicIdx} style={{
                      backgroundColor: '#e8f4fd',
                      color: '#1976d2',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {topic}
                    </span>
                  ))}
                  {lesson.grammar_topics && lesson.grammar_topics.length > 3 && (
                    <span style={{
                      backgroundColor: '#f5f5f5',
                      color: '#666',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      +{lesson.grammar_topics.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Open Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <span style={{
                  color: '#1976d2',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Start Lesson
                </span>
                <span style={{
                  color: '#1976d2',
                  fontSize: '16px'
                }}>
                  →
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyLessons









