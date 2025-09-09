
import React, { useState } from 'react'
import { createLesson } from '../services/api'

interface FormData {
  name: string
  order_number: string
  email: string
  telegram: string
  youtube_links: string[]
  language_level: string
  grammar_topics: string[]
  language: string
  grammar_topics_text?: string
}

interface FormErrors {
  [key: string]: string
}

const LessonOrderForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    order_number: '',
    email: '',
    telegram: '',
    youtube_links: [''],
    language_level: '',
    grammar_topics: [],
    language: '',
    grammar_topics_text: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const languageLevels = [
    { value: 'A1', label: 'A1 - Beginner' },
    { value: 'A2', label: 'A2 - Elementary' },
    { value: 'B1', label: 'B1 - Intermediate' },
    { value: 'B2', label: 'B2 - Upper Intermediate' },
    { value: 'C1', label: 'C1 - Advanced' },
    { value: 'C2', label: 'C2 - Proficient' }
  ]

  // const commonGrammarTopics = [
  //   'Present Simple',
  //   'Present Continuous',
  //   'Present Perfect',
  //   'Past Simple',
  //   'Past Continuous',
  //   'Past Perfect',
  //   'Future Simple',
  //   'Future Continuous',
  //   'Future Perfect',
  //   'Conditional Sentences',
  //   'Passive Voice',
  //   'Reported Speech',
  //   'Modal Verbs',
  //   'Gerunds and Infinitives',
  //   'Relative Clauses',
  //   'Articles',
  //   'Prepositions',
  //   'Phrasal Verbs'
  // ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.order_number.trim()) {
      newErrors.order_number = 'Order number is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.telegram.trim()) {
      newErrors.telegram = 'Telegram username is required'
    } else if (!formData.telegram.startsWith('@')) {
      newErrors.telegram = 'Telegram username must start with @'
    }

    if (!formData.language_level) {
      newErrors.language_level = 'Please select your language level'
    }

    if (!formData.language) {
      newErrors.language = 'Please select language'
    }

    if (!formData.grammar_topics_text || !formData.grammar_topics_text.trim()) {
      newErrors.grammar_topics_text = 'Укажите грамматические темы'
    }

    const validYoutubeLinks = formData.youtube_links.filter(link => 
      link.trim() && link.includes('youtube.com')
    )

    if (validYoutubeLinks.length === 0) {
      newErrors.youtube_links = 'At least one valid YouTube link is required'
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

  const handleYoutubeLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.youtube_links]
    newLinks[index] = value
    setFormData(prev => ({
      ...prev,
      youtube_links: newLinks
    }))
  }

  // multi-select version removed in favor of three individual selects

  const addYoutubeLink = () => {
    setFormData(prev => {
      if (prev.youtube_links.length >= 3) return prev
      return {
        ...prev,
        youtube_links: [...prev.youtube_links, '']
      }
    })
  }

  // removed selects; using free text input instead

  const removeYoutubeLink = (index: number) => {
    if (formData.youtube_links.length > 1) {
      const newLinks = formData.youtube_links.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        youtube_links: newLinks
      }))
    }
  }

  // replaced by select-based handler

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const validYoutubeLinks = formData.youtube_links.filter(link => 
        link.trim() && link.includes('youtube.com')
      )

      await createLesson({
        ...formData,
        youtube_links: validYoutubeLinks,
        grammar_topics: formData.grammar_topics_text && formData.grammar_topics_text.trim()
          ? [formData.grammar_topics_text.trim()]
          : []
      })

      setSubmitStatus('success')
      setSubmitMessage('Your lesson order has been submitted successfully! We will contact you soon.')
      
      // Reset form
      setFormData({
        name: '',
        order_number: '',
        email: '',
        telegram: '',
        youtube_links: [''],
        language_level: '',
        grammar_topics: [],
        language: '',
        grammar_topics_text: ''
      })
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Failed to submit your order. Please try again later.')
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">Форма заказа Real Talk</h1>
        <p className="form-subtitle">Персональный урок иностранного языка</p>
      </div>

      <div className="form-content">
        <div className="form-description">
          <p>
            <strong>Real Talk</strong> — это AI-сервис для изучения живого и актуального языка, который превращает твои любимые видео и подкасты в персонализированные учебные модули.
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="success-message">
            {submitMessage}
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="error-message">
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Основная информация</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Как тебя зовут? *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Введите ваше имя"
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="order_number">Номер заказа *</label>
                <input
                  type="text"
                  id="order_number"
                  value={formData.order_number}
                  onChange={(e) => handleInputChange('order_number', e.target.value)}
                  placeholder="ORD-12345"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Отображается при оплате</small>
                {errors.order_number && <div className="error">{errors.order_number}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Твой email, привязанный к Notion *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Учебный модуль появится в твоем профиле - вкладка My Lessons</small>
                {errors.email && <div className="error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="telegram">Как тебя найти в Telegram? *</label>
                <input
                  type="text"
                  id="telegram"
                  value={formData.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  placeholder="@username"
                />
                {errors.telegram && <div className="error">{errors.telegram}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="language">Язык обучения *</label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                >
                  <option value="">Выберите язык</option>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                </select>
                {errors.language && <div className="error">{errors.language}</div>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Материалы для модуля</h3>
            
            <div className="form-group">
              <label>YouTube ссылки *</label>
              {formData.youtube_links.map((link, index) => (
                <div key={index} className="youtube-link-item">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleYoutubeLinkChange(index, e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {formData.youtube_links.length > 1 && (
                    <button
                      type="button"
                      className="remove-link"
                      onClick={() => removeYoutubeLink(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-link"
                onClick={addYoutubeLink}
                disabled={formData.youtube_links.length >= 3}
                style={formData.youtube_links.length >= 3 ? { background: '#e9ecef', color: '#6c757d', borderColor: '#dee2e6', cursor: 'not-allowed' } : undefined}
              >
                {formData.youtube_links.length >= 3 ? 'Maximum 3 links' : '+ Add YouTube Link'}
              </button>
              {errors.youtube_links && <div className="error">{errors.youtube_links}</div>}
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Настройки обучения</h3>
            
            <div className="form-group">
              <label htmlFor="language_level">Выберите уровень языка *</label>
              <select
                id="language_level"
                value={formData.language_level}
                onChange={(e) => handleInputChange('language_level', e.target.value)}
              >
                <option value="">Выберите уровень</option>
                {languageLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <small style={{ color: '#666', fontSize: '12px' }}>От этого ответа зависит сложность модуля</small>
              {errors.language_level && <div className="error">{errors.language_level}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="grammar_topics_text">Какие грамматические темы тебе интересны?</label>
              <input
                id="grammar_topics_text"
                type="text"
                value={formData.grammar_topics_text || ''}
                onChange={(e) => handleInputChange('grammar_topics_text', e.target.value)}
                placeholder="Например: Conditional Sentences, Passive Voice"
              />
              <small style={{ color: '#666', fontSize: '12px' }}>Можно перечислить через запятую</small>
              {errors.grammar_topics_text && <div className="error">{errors.grammar_topics_text}</div>}
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="loading"></span>}
            {isSubmitting ? 'Отправляем...' : 'Отправить заявку'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LessonOrderForm
