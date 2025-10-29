
import React, { useState, useEffect } from 'react'
import { createLesson } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useNotification } from '../contexts/NotificationContext'
import { globalLessonMonitoring } from '../services/globalLessonMonitoring'
import './LessonOrderForm.css'

interface FormData {
  name: string
  email: string
  youtube_link: string
  language_level: string
  grammar_topics: string[]
  language: string
  grammar_topics_text?: string
}

interface FormErrors {
  [key: string]: string
}

const LessonOrderForm: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    youtube_link: '',
    language_level: 'B1',
    grammar_topics: [],
    language: 'english',
    grammar_topics_text: ''
  })

  // Autofill name and email from authenticated user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);



  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const languageLevels = [
    { value: 'A2', label: 'A2 - Elementary' },
    { value: 'B1', label: 'B1 - Intermediate' },
    { value: 'B2', label: 'B2 - Upper Intermediate' },
    { value: 'C1', label: 'C1 - Advanced' },
    { value: 'C2', label: 'C2 - Proficient' }
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.language_level || formData.language_level === '') {
      newErrors.language_level = 'Выберите уровень языка'
    }

    if (!formData.language || formData.language === '') {
      newErrors.language = 'Выберите язык'
    }

    if (!formData.grammar_topics_text || !formData.grammar_topics_text.trim()) {
      newErrors.grammar_topics_text = 'Укажите грамматические темы'
    }

    if (!formData.youtube_link.trim()) {
      newErrors.youtube_link = 'YouTube link is required'
    } else if (!formData.youtube_link.includes('youtube.com')) {
      newErrors.youtube_link = 'Please enter a valid YouTube link'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        language_level: formData.language_level,
        language: formData.language,
        youtube_link: formData.youtube_link,
        grammar_topics: formData.grammar_topics_text && formData.grammar_topics_text.trim()
          ? [formData.grammar_topics_text.trim()]
          : []
      }

      // Validate all required fields are present
      const requiredFields = ['name', 'email', 'language_level', 'language', 'youtube_link']
      const missingFields = requiredFields.filter(field => !requestData[field as keyof typeof requestData])
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      const response = await createLesson(requestData)

      console.log('Create lesson response:', response) // Детальное логирование ответа

      setSubmitStatus('success')
      setSubmitMessage('Ваш урок создан и обрабатывается! Мы уведомлим вас, когда он будет готов.')
      
      // Проверяем различные возможные форматы lesson_id
      const lessonId = response.lesson_id
      
      if (lessonId) {
        globalLessonMonitoring.startMonitoring(lessonId, requestData.name)
      }
      
      // Reset form (preserve name and email from user)
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        youtube_link: '',
        language_level: 'B1',
        grammar_topics: [],
        language: 'english',
        grammar_topics_text: ''
      })
    } catch (error) {
      setSubmitStatus('error')
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit your order. Please try again later.'
      setSubmitMessage(errorMessage)
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="lesson-builder-container">
      <div className="lesson-builder-header">
        <div className="lesson-builder-title">
          <h1>Lesson Builder</h1>
        </div>
        <p className="lesson-builder-description">
          Здесь можно создавать персонализированные уроки на основе видео и подкастов YouTube. Заполни поля и нажми «Create».
        </p>
        
      </div>

      {submitStatus === 'error' && (
        <div className="error-notification">
          <p>{submitMessage}</p>
        </div>
      )}

      <div className="lesson-form-container">
        {submitStatus === 'success' && (
          <div className="success-form-overlay">
            <div className="success-form-container">
              <h2 className="success-form-title">Готовим твой урок ⏳</h2>
              <p className="success-form-description">
                Обычно это занимает 10–15 минут. Когда урок будет готов, тебе придёт пуш-уведомление. Все готовые уроки попадают в Open Library.
              </p>
              <button 
                className="success-form-ok-button"
                onClick={() => setSubmitStatus('idle')}
              >
                OK
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="lesson-form">
          <div className="form-grid">
            {/* Name Field */}
            <div className="form-field">
              <label htmlFor="name" className="field-label">Имя и Фамилия</label>
              <div className="input-container">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Jane Smith"
                  className="form-input"
                />
              </div>
              {user?.name && (
                <p className="helper-text orange">Автоматически заполнено из профиля Google</p>
              )}
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            {/* Language Field */}
            <div className="form-field">
              <label htmlFor="language" className="field-label">Выбери язык обучения</label>
              <div className="select-container">
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="form-select"
                >
                  <option value="english">English</option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
              {errors.language && <p className="error-text">{errors.language}</p>}
            </div>

            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email" className="field-label">Твой email</label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@gmail.com"
                  className="form-input"
                />
              </div>
              {user?.email ? (
                <p className="helper-text orange">Автоматически заполнено из профиля Google</p>
              ) : (
                <p className="helper-text">Учебный модуль появится в твоем профиле - вкладка My Lessons</p>
              )}
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Language Level Field */}
            <div className="form-field">
              <label htmlFor="language_level" className="field-label">Выбери уровень</label>
              <div className="select-container">
                <select
                  id="language_level"
                  value={formData.language_level}
                  onChange={(e) => handleInputChange('language_level', e.target.value)}
                  className="form-select"
                >
                  {languageLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.value}
                    </option>
                  ))}
                </select>
                <div className="select-arrow">▼</div>
              </div>
              {errors.language_level && <p className="error-text">{errors.language_level}</p>}
            </div>

            {/* Grammar Topics Field */}
            <div className="form-field">
              <label htmlFor="grammar_topics_text" className="field-label">Укажи до 3-х грамматических тем</label>
              <div className="input-container">
                <input
                  id="grammar_topics_text"
                  type="text"
                  value={formData.grammar_topics_text || ''}
                  onChange={(e) => handleInputChange('grammar_topics_text', e.target.value)}
                  placeholder="Conditionals, Past Perfect, Prepositions"
                  className="form-input"
                />
              </div>
              {errors.grammar_topics_text && <p className="error-text">{errors.grammar_topics_text}</p>}
            </div>

            {/* YouTube Link Field */}
            <div className="form-field">
              <label className="field-label">Ссылка на материал Youtube</label>
              <div className="input-container">
                <input
                  type="url"
                  value={formData.youtube_link}
                  onChange={(e) => handleInputChange('youtube_link', e.target.value)}
                  placeholder="https://www.youtube.com/watch?..."
                  className="form-input"
                />
              </div>
              <p className="helper-text orange">Видео не должно превышать 120 минут</p>
              {errors.youtube_link && <p className="error-text">{errors.youtube_link}</p>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="create-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LessonOrderForm
