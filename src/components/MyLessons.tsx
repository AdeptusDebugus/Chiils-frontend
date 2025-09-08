import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonService, LessonData } from '../services/lessonService'

const MyLessons: React.FC = () => {
  const [lessons, setLessons] = useState<LessonData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await lessonService.getPublicLessons()
        setLessons(data)
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
        <p className="lesson-description">Select a lesson to view details.</p>
      </div>

      <div className="exercises-section">
        {lessons.length === 0 && <p>No lessons available yet.</p>}
        <div className="exercise-questions">
          {lessons.map((l, idx) => (
            <div key={idx} className="question" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ marginBottom: 6 }}>
                  {idx + 1}. YouTube Lesson
                </p>
                <small style={{ color: '#7f8c8d' }}>{l.you_tube_url}</small>
              </div>
              <Link to={`/my-lessons/${idx}`} style={{ color: '#3498db', textDecoration: 'underline' }}>
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyLessons




