import React, { useState, useEffect, useRef } from 'react';
import { lessonService, LessonData } from '../services/lessonService';
import { useParams } from 'react-router-dom';
import './LessonPage.css';

const toYouTubeEmbedUrl = (url: string): string => {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '')
      if (id) return `https://www.youtube.com/embed/${id}`
    }
    return url
  } catch {
    return url
  }
}

const extractYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '')
      if (id) return id
    }
    return null
  } catch {
    return null
  }
}

const LessonPage: React.FC = () => {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null)
  const [grammarAnswers, setGrammarAnswers] = useState<string[][][]>([])
  const [lexicalAnswers, setLexicalAnswers] = useState<string[][][]>([])
  const [lexicalChecks, setLexicalChecks] = useState<boolean[][]>([])
  const [trueFalseSelections, setTrueFalseSelections] = useState<('true' | 'false' | null)[][]>([])
  const [submittedGrammar, setSubmittedGrammar] = useState<boolean[][]>([])
  const [submittedLexical, setSubmittedLexical] = useState<boolean[][]>([])
  const [selectedWords, setSelectedWords] = useState<string[][][]>([])
  const [availableWords, setAvailableWords] = useState<string[][]>([])
  const [usedCorrectWords, setUsedCorrectWords] = useState<string[]>([])
  const [incorrectWords, setIncorrectWords] = useState<string[][][]>([])
  const [showAnswers, setShowAnswers] = useState<boolean>(false)
  const [showQuizlet, setShowQuizlet] = useState<boolean>(false)

  const ensureYouTubeAPI = (): Promise<void> => {
    return new Promise((resolve) => {
      const w = window as any
      if (w.YT && w.YT.Player) {
        resolve()
        return
      }
      const prev = document.getElementById('youtube-iframe-api') as HTMLScriptElement | null
      if (!prev) {
        const tag = document.createElement('script')
        tag.id = 'youtube-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
      ;(w as any).onYouTubeIframeAPIReady = () => resolve()
    })
  }

  const initPlayer = async (videoId: string) => {
    await ensureYouTubeAPI()
    const w = window as any
    playerRef.current = new w.YT.Player('yt-player', {
      videoId,
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
      },
    })
  }

  const seekTo = (seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true)
      playerRef.current.playVideo && playerRef.current.playVideo()
    }
  }

  const scrollToPlayerAndSeek = (seconds: number) => {
    const el = document.getElementById('yt-player')
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // Give the browser a moment to scroll, then seek
    window.setTimeout(() => seekTo(seconds), 150)
  }

  const { idx } = useParams<{ idx?: string }>()
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const lessons = await lessonService.getPublicLessons();
        if (!lessons || lessons.length === 0) {
          setError('No lessons available');
          setLesson(null);
        } else {
          const i = Math.max(0, Math.min(Number(idx ?? 0), lessons.length - 1))
          setLesson(lessons[i]);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load lesson');
        console.error('Error loading public lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [idx]);

  useEffect(() => {
    if (!lesson) return
    const id = extractYouTubeId(lesson.you_tube_url)
    if (id) {
      initPlayer(id)
    }
    // initialize grammar answers structure based on number of blanks in each example
    const initialized = lesson.grammar_exercises.map((block) =>
      block.examples.map((ex) => {
        const blanks = (ex.match(/_{2,}/g) || []).length
        // If no blanks, initialize with single empty string for full text input
        return blanks > 0 ? Array.from({ length: blanks }, () => '') : ['']
      })
    )
    setGrammarAnswers(initialized)
    // initialize lexical answers: inputs only for blanks (______)
    const lexInit = lesson.lexical_exercises.map((block) =>
      block.examples.map((ex) => {
        const blanks = (ex.match(/_{2,}/g) || []).length
        return Array.from({ length: blanks }, () => '')
      })
    )
    setLexicalAnswers(lexInit)

    // initialize checkbox selections for listening/marking words blocks
    const checksInit = lesson.lexical_exercises.map((block) =>
      block.examples.map(() => false)
    )
    setLexicalChecks(checksInit)

    // initialize true/false selections for true/false exercises
    const trueFalseInit = lesson.lexical_exercises.map((block) =>
      block.examples.map(() => null as 'true' | 'false' | null)
    )
    setTrueFalseSelections(trueFalseInit)

    // initialize submitted states for grammar exercises
    const submittedGrammarInit = lesson.grammar_exercises.map((block) =>
      block.examples.map(() => false)
    )
    setSubmittedGrammar(submittedGrammarInit)

    // initialize submitted states for lexical exercises
    const submittedLexicalInit = lesson.lexical_exercises.map((block) =>
      block.examples.map(() => false)
    )
    setSubmittedLexical(submittedLexicalInit)

    // initialize available words for fill-in-the-blank exercises (randomly mixed, excluding used correct words)
    const wordsInit = lesson.lexical_exercises.map((block) => {
      const ansType = getLexicalAnswerType(block.type)
      const ansBlock = ansType ? lesson.lexical_answers?.find((b) => b.type === ansType) : undefined
      if (ansBlock && ansBlock.answer) {
        // Get all correct answers and shuffle them, excluding already used correct words
        const allWords = ansBlock.answer.flatMap(answer => answer.split(',').map(a => a.trim()))
        const unusedWords = allWords.filter(word => !usedCorrectWords.includes(word.toLowerCase()))
        
        // Add some extra words to make it more challenging (distractors)
        const extraWords = [
          'always', 'never', 'sometimes', 'often', 'usually', 'rarely',
          'quickly', 'slowly', 'carefully', 'easily', 'hardly', 'barely',
          'here', 'there', 'everywhere', 'nowhere', 'somewhere', 'anywhere',
          'today', 'yesterday', 'tomorrow', 'tonight', 'morning', 'evening'
        ]
        
        // Combine correct answers with some random distractors
        const allOptions = [...unusedWords, ...extraWords.slice(0, Math.max(2, unusedWords.length))]
        
        // Shuffle all options to randomize order
        return allOptions.sort(() => Math.random() - 0.5)
      }
      return []
    })
    setAvailableWords(wordsInit)

    // initialize selected words for multiple choice
    const selectedWordsInit = lesson.lexical_exercises.map((block) =>
      block.examples.map(() => [])
    )
    setSelectedWords(selectedWordsInit)

    // initialize incorrect words for tracking
    const incorrectWordsInit = lesson.lexical_exercises.map((block) =>
      block.examples.map(() => [])
    )
    setIncorrectWords(incorrectWordsInit)
  }, [lesson])

  const normalize = (s: string | undefined | null): string => (s || '').trim().toLowerCase()
  
  const getLexicalAnswerType = (exerciseType: string): string | null => {
    const n = normalize(exerciseType)
    if (n.startsWith('вставь пропущенное')) return 'fillTheBlankAnswers'
    if (n.includes('false') || n.includes('true')) return 'truOrFalseAnswers'
    if (n.startsWith('послушай и отметь слова')) return null
    return null
  }
  
  const isTrueFalseExercise = (exerciseType: string): boolean => {
    const n = normalize(exerciseType)
    return n.includes('false') || n.includes('true')
  }

  const isFillInTheBlankExercise = (exerciseType: string): boolean => {
    const n = normalize(exerciseType)
    return n.startsWith('вставь пропущенное')
  }
  const getGrammarAnswerType = (index: number): string => `grammar${index + 1}Answers`

  if (loading) {
    return (
      <div className="lesson-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="lesson-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Lesson not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-page">
      <div className="lesson-content">
        {lesson.lesson_topic && (
          <div className="lesson-header" style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#37352f', marginBottom: 8 }}>{lesson.lesson_topic}</h1>
          </div>
        )}
        <div className="video-embed">
          <div id="yt-player" style={{ width: '100%', height: 420 }}></div>
        </div>

        <div className="vocabulary-section">
          <h2>Словарь</h2>
          <div className="vocabulary-grid">
            {lesson.glossary
              .filter(item => item.time_code !== null && item.time_code !== undefined)
              .sort((a, b) => (a.time_code || 0) - (b.time_code || 0))
              .map((item, index) => {
                const minutes = Math.floor((item.time_code || 0) / 60);
                const seconds = Math.floor((item.time_code || 0) % 60);
                const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                return (
              <div key={`${item.expression}-${index}`} className="vocabulary-item">
                <h3>📌 {item.expression}</h3>
                <div className="vocab-details">
                  <p className="quote"><strong>Цитата:</strong> <em>"{item.quote}"</em></p>
                  <p><strong>Перевод:</strong> {item.translation}</p>
                  <p><strong>Объяснение:</strong> {item.explanation}</p>
                  <p className="example"><strong>Пример:</strong> <em>{item.another_example}</em></p>
                    <p>
                      <strong>Тайм-код:</strong>{' '}
                      <button
                        onClick={() => scrollToPlayerAndSeek(item.time_code as number)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#37352f',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                          font: 'inherit',
                        }}
                        title="Перейти к времени"
                      >
                          {timeDisplay}
                      </button>
                    </p>
                </div>
              </div>
                );
              })}
          </div>
        </div>

        <div className="exercises-section">
          <div>
            <h2>📌 Лексические упражнения</h2>
            {lesson.lexical_exercises
              .map((block, originalIndex) => ({ block, originalIndex }))
              .sort((a, b) => {
                // Put "Послушай и отметь слова из списка" exercises first
                const aIsListening = a.block.type?.toLowerCase().includes('послушай и отметь слова');
                const bIsListening = b.block.type?.toLowerCase().includes('послушай и отметь слова');
                
                if (aIsListening && !bIsListening) return -1;
                if (!aIsListening && bIsListening) return 1;
                return 0;
              })
              .map(({ block, originalIndex }) => (
              <div key={`lex-${originalIndex}`}>
                <p><strong>Тип:</strong> {block.type}</p>
                <div className="exercise-questions">
                  {block.type && block.type.trim().toLowerCase().startsWith('послушай и отметь слова из списка') ? (
                    <div>
                      <div className="video-embed" style={{ marginBottom: 12 }}>
                        <iframe
                          src={toYouTubeEmbedUrl(lesson.you_tube_url)}
                          title="YouTube video player"
                          width="100%"
                          height="280"
                          style={{ border: 0, borderRadius: 6 }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p style={{ margin: '4px 0 6px' }}>Отметь слова:</p>
                      <div className="question" style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4, alignItems: 'flex-start', paddingLeft: 0, marginLeft: 0 }}>
                        {(block.examples.length === 1
                          ? block.examples[0].split(/[,;\n]+/).map((w) => w.trim()).filter(Boolean)
                          : block.examples
                        ).map((word, i) => (
                          <label key={`lex-check-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', font: 'inherit', fontSize: 'inherit', margin: 0, padding: 0, justifyContent: 'flex-start', whiteSpace: 'nowrap' }}>
                            <input
                              type="checkbox"
                              checked={!!lexicalChecks[originalIndex]?.[i]}
                              onChange={(e) => {
                                const checked = e.target.checked
                                setLexicalChecks((prev) => {
                                  const next = prev.map((arr) => [...arr])
                                  if (!next[originalIndex]) next[originalIndex] = []
                                  next[originalIndex][i] = checked
                                  return next
                                })
                              }}
                              style={{ margin: 0, verticalAlign: 'middle' }}
                            />
                            <span style={{ display: 'inline-block', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'left', lineHeight: 1.2 }}>{word}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : isTrueFalseExercise(block.type) ? (
                    // True/False exercise rendering
                    block.examples.map((ex, i) => {
                      const userSelection = trueFalseSelections[originalIndex]?.[i]
                      // Get the correct answer from the answer block
                      const ansType = getLexicalAnswerType(block.type)
                      const ansBlock = ansType ? lesson.lexical_answers?.find((b) => b.type === ansType) : undefined
                      const correctAnswer = ansBlock?.answer?.[i]?.toLowerCase()
                      const isCorrect = userSelection === correctAnswer
                      
                      return (
                        <div key={`lex-ex-${i}`} className="question" style={{
                          backgroundColor: userSelection 
                            ? (isCorrect ? '#d4edda' : '#f8d7da')
                            : '#f7f6f3',
                          borderColor: userSelection 
                            ? (isCorrect ? '#c3e6cb' : '#f5c6cb')
                            : '#e9e9e7',
                          borderWidth: userSelection ? '2px' : '1px'
                        }}>
                          <p style={{ 
                            color: userSelection 
                              ? (isCorrect ? '#155724' : '#721c24')
                              : '#37352f',
                            fontWeight: userSelection ? '600' : '500'
                          }}>
                            {i + 1}. {ex}
                            {userSelection && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}>
                                {isCorrect ? '✓' : '✗'}
                              </span>
                            )}
                          </p>
                          
                          <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            marginTop: '12px',
                            alignItems: 'center'
                          }}>
                            <button
                              type="button"
                              onClick={() => {
                                const value = 'true' as 'true' | 'false'
                                setTrueFalseSelections((prev) => {
                                  const next = prev.map((arr) => [...arr])
                                  if (!next[originalIndex]) next[originalIndex] = []
                                  next[originalIndex][i] = value
                                  return next
                                })
                              }}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '2px solid',
                                backgroundColor: userSelection === 'true' ? '#27ae60' : 'white',
                                borderColor: userSelection === 'true' ? '#27ae60' : '#27ae60',
                                color: userSelection === 'true' ? 'white' : '#27ae60',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseOver={(e) => {
                                if (userSelection !== 'true') {
                                  e.currentTarget.style.backgroundColor = '#27ae60'
                                  e.currentTarget.style.color = 'white'
                                }
                              }}
                              onMouseOut={(e) => {
                                if (userSelection !== 'true') {
                                  e.currentTarget.style.backgroundColor = 'white'
                                  e.currentTarget.style.color = '#27ae60'
                                }
                              }}
                            >
                              ✓ True
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                const value = 'false' as 'true' | 'false'
                                setTrueFalseSelections((prev) => {
                                  const next = prev.map((arr) => [...arr])
                                  if (!next[originalIndex]) next[originalIndex] = []
                                  next[originalIndex][i] = value
                                  return next
                                })
                              }}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '2px solid',
                                backgroundColor: userSelection === 'false' ? '#e74c3c' : 'white',
                                borderColor: userSelection === 'false' ? '#e74c3c' : '#e74c3c',
                                color: userSelection === 'false' ? 'white' : '#e74c3c',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseOver={(e) => {
                                if (userSelection !== 'false') {
                                  e.currentTarget.style.backgroundColor = '#e74c3c'
                                  e.currentTarget.style.color = 'white'
                                }
                              }}
                              onMouseOut={(e) => {
                                if (userSelection !== 'false') {
                                  e.currentTarget.style.backgroundColor = 'white'
                                  e.currentTarget.style.color = '#e74c3c'
                                }
                              }}
                            >
                              ✗ False
                            </button>
                          </div>
                          
                          {userSelection && (
                            <div style={{
                              marginTop: '8px',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              backgroundColor: isCorrect ? '#c3e6cb' : '#f5c6cb',
                              border: `1px solid ${isCorrect ? '#b8dacc' : '#f1b0b7'}`,
                              fontSize: '13px',
                              color: isCorrect ? '#155724' : '#721c24',
                              fontWeight: '500'
                            }}>
                              {isCorrect ? 'Правильно!' : 'Неправильно. Правильный ответ: ' + (correctAnswer === 'true' ? 'True' : 'False')}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : isFillInTheBlankExercise(block.type) ? (
                    // Fill-in-the-blank exercise rendering with multiple choice
                    (() => {
                      const words = availableWords[originalIndex] || []
                      return block.examples.map((ex, i) => {
                        const blanks = (ex.match(/_{2,}/g) || []).length

                        // Get correct answers for this exercise
                        const ansType = getLexicalAnswerType(block.type)
                        const ansBlock = ansType ? lesson.lexical_answers?.find((b) => b.type === ansType) : undefined
                        const correctAnswers = ansBlock?.answer?.[i]?.split(',').map(a => a.trim().toLowerCase()) || []
                        
                        // Check if all blanks are selected and compare with correct answers
                        const userSelections = selectedWords[originalIndex]?.[i] || []
                        const incorrectSelections = incorrectWords[originalIndex]?.[i] || []
                        const allSelected = userSelections.length === blanks
                        const isCorrect = allSelected && userSelections.every((selection, index) => 
                          correctAnswers[index] && selection.toLowerCase().trim() === correctAnswers[index]
                        )
                        const isSubmitted = submittedLexical[originalIndex]?.[i] || false
                        
                        // Check individual word correctness for immediate feedback
                        const wordCorrectness = userSelections.map((selection, index) => 
                          correctAnswers[index] && selection.toLowerCase().trim() === correctAnswers[index]
                        )

                        return (
                          <div key={`lex-ex-${i}`} className="question" style={{
                            backgroundColor: isSubmitted 
                              ? (isCorrect ? '#d4edda' : '#f8d7da')
                              : '#f7f6f3',
                            borderColor: isSubmitted 
                              ? (isCorrect ? '#c3e6cb' : '#f5c6cb')
                              : '#e9e9e7',
                            borderWidth: isSubmitted ? '2px' : '1px'
                          }}>
                            {blanks === 0 ? (
                              <p style={{ 
                                color: isSubmitted 
                                  ? (isCorrect ? '#155724' : '#721c24')
                                  : '#37352f',
                                fontWeight: isSubmitted ? '600' : '500'
                              }}>
                                {i + 1}. {ex}
                                {isSubmitted && (
                                  <span style={{ 
                                    marginLeft: '8px', 
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {isCorrect ? '✓' : '✗'}
                                  </span>
                                )}
                              </p>
                            ) : (
                              <div>
                                <p style={{ 
                                  color: isSubmitted 
                                    ? (isCorrect ? '#155724' : '#721c24')
                                    : '#37352f',
                                  fontWeight: isSubmitted ? '600' : '500',
                                  marginBottom: '12px'
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: `${i + 1}. ${(() => {
                                    // Insert selected words into the sentence with immediate feedback
                                    const parts = ex.split('______')
                                    let filledSentence = ''
                                    parts.forEach((part, partIndex) => {
                                      filledSentence += part
                                      if (partIndex < parts.length - 1) {
                                        const selectedWord = userSelections[partIndex] || '______'
                                        const isWordCorrect = wordCorrectness[partIndex]
                                        
                                        if (selectedWord !== '______') {
                                          if (isWordCorrect) {
                                            // Correct word - green styling
                                            filledSentence += ` <strong style="color: #28a745; background-color: #d4edda; padding: 2px 4px; border-radius: 3px;">${selectedWord}</strong>`
                                          } else {
                                            // Incorrect word - red styling
                                            filledSentence += ` <strong style="color: #dc3545; background-color: #f8d7da; padding: 2px 4px; border-radius: 3px;">${selectedWord}</strong>`
                                          }
                                        } else {
                                          filledSentence += ' ______'
                                        }
                                      }
                                    })
                                    return filledSentence
                                  })()}${isSubmitted ? ` <span style="margin-left: 8px; font-size: 16px; font-weight: bold; color: ${isCorrect ? '#155724' : '#721c24'}">${isCorrect ? '✓' : '✗'}</span>` : ''}`
                                }}>
                                </p>
                                
                                <div style={{ 
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '6px',
                                  marginBottom: '12px'
                                }}>
                                  {words.map((word, wordIndex) => {
                                    const isSelected = userSelections.includes(word)
                                    const isIncorrect = incorrectSelections.includes(word)
                                    const isUsed = usedCorrectWords.includes(word.toLowerCase())
                                    const isCompleted = allSelected && isCorrect
                                    
                                    return (
                                      <button
                                        key={`word-${wordIndex}`}
                                        type="button"
                                        disabled={isUsed || isIncorrect || isCompleted}
                                        onClick={() => {
                                          if (isUsed || isIncorrect || isCompleted) return
                                          
                                          // Check if this word is correct for any blank position
                                          const isWordCorrect = correctAnswers.some(correctAnswer => 
                                            correctAnswer && word.toLowerCase().trim() === correctAnswer
                                          )
                                          
                                          if (isWordCorrect) {
                                            // Correct word - add to selections and remove from pool
                                            setSelectedWords((prev) => {
                                              const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                              if (!next[originalIndex]) next[originalIndex] = []
                                              if (!next[originalIndex][i]) next[originalIndex][i] = []
                                              
                                              const currentSelections = next[originalIndex][i]
                                              if (currentSelections.length < blanks) {
                                                next[originalIndex][i] = [...currentSelections, word]
                                              }
                                              return next
                                            })
                                            
                                            // Remove correct word from available pool
                                            setAvailableWords(currentWords => 
                                              currentWords.map((blockWords, blockIdx) => {
                                                if (blockIdx === originalIndex) {
                                                  return blockWords.filter(w => w !== word)
                                                }
                                                return blockWords
                                              })
                                            )
                                            
                                            // Add to used correct words
                                            setUsedCorrectWords(prev => {
                                              if (!prev.includes(word.toLowerCase())) {
                                                return [...prev, word.toLowerCase()]
                                              }
                                              return prev
                                            })
                                            
                                            // Clear any red (incorrect) word when correct word is found
                                            setIncorrectWords((prev) => {
                                              const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                              if (!next[originalIndex]) next[originalIndex] = []
                                              next[originalIndex][i] = []
                                              return next
                                            })
                                            
                                            // Mark as submitted when correct word is selected
                                            setSubmittedLexical((prev) => {
                                              const next = prev.map((arr) => [...arr])
                                              if (!next[originalIndex]) next[originalIndex] = []
                                              next[originalIndex][i] = true
                                              return next
                                            })
                                          } else {
                                            // Incorrect word - clear previous incorrect word and add this one
                                            setIncorrectWords((prev) => {
                                              const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                              if (!next[originalIndex]) next[originalIndex] = []
                                              // Clear previous incorrect word for this exercise
                                              next[originalIndex][i] = [word]
                                              return next
                                            })
                                          }
                                        }}
                                        style={{
                                          padding: '6px 12px',
                                          borderRadius: '6px',
                                          border: '2px solid',
                                          backgroundColor: isSelected ? '#28a745' : isIncorrect ? '#dc3545' : isCompleted ? '#f8f9fa' : 'white',
                                          borderColor: isSelected ? '#28a745' : isIncorrect ? '#dc3545' : isCompleted ? '#dee2e6' : '#e9e9e7',
                                          color: isSelected ? 'white' : isIncorrect ? 'white' : isCompleted ? '#6c757d' : '#37352f',
                                          cursor: (isUsed || isIncorrect || isCompleted) ? 'not-allowed' : 'pointer',
                                          fontSize: '14px',
                                          fontWeight: '500',
                                          transition: 'all 0.2s ease',
                                          opacity: (isUsed || isCompleted) ? 0.5 : 1,
                                          textDecoration: isUsed ? 'line-through' : 'none'
                                        }}
                                        onMouseOver={(e) => {
                                          if (!isUsed && !isSelected && !isIncorrect && !isCompleted) {
                                            e.currentTarget.style.backgroundColor = '#f0f0f0'
                                            e.currentTarget.style.borderColor = '#37352f'
                                          }
                                        }}
                                        onMouseOut={(e) => {
                                          if (!isUsed && !isSelected && !isIncorrect && !isCompleted) {
                                            e.currentTarget.style.backgroundColor = 'white'
                                            e.currentTarget.style.borderColor = '#e9e9e7'
                                          }
                                        }}
                                      >
                                        {word}
                                      </button>
                                    )
                                  })}
                                </div>
                                
                                
                                {/* Display selected words as clickable chips for removal */}
                                {userSelections.length > 0 && (
                                  <div style={{ 
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px',
                                    marginBottom: '12px'
                                  }}>
                                    {userSelections.map((selectedWord, wordIndex) => (
                                      <button
                                        key={`selected-${wordIndex}`}
                                        type="button"
                                        onClick={() => {
                                          // Remove this specific word from selections
                                          setSelectedWords((prev) => {
                                            const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                            if (!next[originalIndex]) next[originalIndex] = []
                                            next[originalIndex][i] = userSelections.filter((_, idx) => idx !== wordIndex)
                                            return next
                                          })
                                          
                                          // Return the word to available pool
                                          setAvailableWords(currentWords => 
                                            currentWords.map((blockWords, blockIdx) => {
                                              if (blockIdx === originalIndex) {
                                                // Add back the word to the available pool if not already there
                                                if (!blockWords.includes(selectedWord)) {
                                                  return [...blockWords, selectedWord]
                                                }
                                              }
                                              return blockWords
                                            })
                                          )
                                          
                                          // Remove from used list if it was correct
                                          const isWordCorrect = correctAnswers[wordIndex] && selectedWord.toLowerCase().trim() === correctAnswers[wordIndex]
                                          if (isWordCorrect) {
                                            setUsedCorrectWords(prev => 
                                              prev.filter(usedWord => usedWord !== selectedWord.toLowerCase())
                                            )
                                          }
                                          
                                          // Reset submitted state when user removes a word
                                          if (isSubmitted) {
                                            setSubmittedLexical((prev) => {
                                              const next = prev.map((arr) => [...arr])
                                              if (!next[originalIndex]) next[originalIndex] = []
                                              next[originalIndex][i] = false
                                              return next
                                            })
                                          }
                                        }}
                                        style={{
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          border: '2px solid #28a745',
                                          backgroundColor: '#d4edda',
                                          color: '#155724',
                                          cursor: 'pointer',
                                          fontSize: '12px',
                                          fontWeight: '500',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.backgroundColor = '#28a745'
                                          e.currentTarget.style.color = 'white'
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.backgroundColor = '#d4edda'
                                          e.currentTarget.style.color = '#155724'
                                        }}
                                        title="Нажмите чтобы удалить"
                                      >
                                        {selectedWord} ×
                                      </button>
                                    ))}
                                  </div>
                                )}
                                
                                
                                
                                {isSubmitted && !isCorrect && (
                                  <div style={{
                                    marginTop: '8px',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    backgroundColor: '#f5c6cb',
                                    border: '1px solid #f1b0b7',
                                    fontSize: '13px',
                                    color: '#721c24',
                                    fontWeight: '500'
                                  }}>
                                    Неправильно. Попробуйте еще раз.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    })()
                  ) : (
                    // Regular exercise rendering (for other types)
                    block.examples.map((ex, i) => {
                      const parts = ex.split('______')
                      const blanks = (ex.match(/_{2,}/g) || []).length
                      if (lexicalAnswers[originalIndex] && lexicalAnswers[originalIndex][i] && lexicalAnswers[originalIndex][i].length !== blanks) {
                        const next = [...lexicalAnswers]
                        next[originalIndex] = [...(next[originalIndex] || [])]
                        next[originalIndex][i] = Array.from({ length: blanks }, (_, bi) => next[originalIndex][i]?.[bi] || '')
                        setLexicalAnswers(next)
                      }
                      return (
                        <div key={`lex-ex-${i}`} className="question">
                          {blanks === 0 ? (
                            <p>{i + 1}. {ex}</p>
                          ) : (
                            <p style={{ display: 'flex', flexWrap: 'nowrap', gap: 6, alignItems: 'center', overflowX: 'auto' }}>
                              <span>{i + 1}.&nbsp;</span>
                              {parts.map((part, pi) => (
                                <React.Fragment key={`lex-part-${pi}`}>
                                  <span>{part}</span>
                                  {pi < parts.length - 1 && (
                                    <input
                                      type="text"
                                      value={lexicalAnswers[originalIndex]?.[i]?.[pi] ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        setLexicalAnswers((prev) => {
                                          const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                          if (!next[originalIndex]) next[originalIndex] = []
                                          if (!next[originalIndex][i]) next[originalIndex][i] = []
                                          next[originalIndex][i][pi] = val
                                          return next
                                        })
                                      }}
                                      style={{
                                        width: `${Math.max(6, (lexicalAnswers[originalIndex]?.[i]?.[pi] ?? '').length + 1)}ch`,
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        border: '1px solid #e9e9e7',
                                        font: 'inherit',
                                      }}
                                      placeholder=""
                                      aria-label={`Заполнить пропуск ${pi + 1}`}
                                    />
                                  )}
                                </React.Fragment>
                              ))}
                            </p>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="exercise-divider"></div>
              </div>
            ))}
          </div>

          <div>
            <h2>📌 Грамматические упражнения</h2>
            {lesson.grammar_exercises.map((block, blockIndex) => (
              <div key={`gram-${blockIndex}`}>
                <p><strong>Тип:</strong> {block.type}</p>
                {block.input && (
                  <div className="exercise-tip">
                    <span className="tip-icon">💡</span>
                    <p>{block.input}</p>
                  </div>
                )}
                <div className="exercise-questions">
                  {block.examples.map((ex, i) => {
                    const parts = ex.split('______')
                    const blanks = (ex.match(/_{2,}/g) || []).length
                    const hasBlanks = blanks > 0
                    
                    if (grammarAnswers[blockIndex] && grammarAnswers[blockIndex][i] && grammarAnswers[blockIndex][i].length !== (hasBlanks ? blanks : 1)) {
                      // adjust answers length if source changed
                      const newAnswers = [...grammarAnswers]
                      newAnswers[blockIndex] = [...(newAnswers[blockIndex] || [])]
                      newAnswers[blockIndex][i] = hasBlanks 
                        ? Array.from({ length: blanks }, (_, bi) => newAnswers[blockIndex][i]?.[bi] || '')
                        : ['']
                      setGrammarAnswers(newAnswers)
                    }

                    // Get correct answers for this exercise
                    const ansType = getGrammarAnswerType(blockIndex)
                    const ansBlock = lesson.grammar_answers?.find((b) => b.type === ansType)
                    const rawAnswer = ansBlock?.answer?.[i] || ''
                    
                    // Parse correct answers - handle both comma and semicolon separated answers
                    const correctAnswers = rawAnswer
                      .split(/[,;]/)
                      .map(a => a.trim().toLowerCase())
                      .filter(a => a.length > 0)
                    
                    // Check if all blanks are filled and compare with correct answers
                    const userAnswers = grammarAnswers[blockIndex]?.[i] || []
                    const allFilled = userAnswers.every(answer => answer.trim() !== '')
                    const isCorrect = allFilled && userAnswers.every((answer, index) => 
                      correctAnswers[index] && answer.toLowerCase().trim() === correctAnswers[index]
                    )
                    const isSubmitted = submittedGrammar[blockIndex]?.[i] || false

                    return (
                      <div key={`gram-ex-${i}`} className="question" style={{
                        backgroundColor: isSubmitted 
                          ? (isCorrect ? '#d4edda' : '#f8d7da')
                          : '#f7f6f3',
                        borderColor: isSubmitted 
                          ? (isCorrect ? '#c3e6cb' : '#f5c6cb')
                          : '#e9e9e7',
                        borderWidth: isSubmitted ? '2px' : '1px'
                      }}>
                        {hasBlanks ? (
                          <div>
                            <p style={{ 
                              display: 'flex', 
                              flexWrap: 'nowrap', 
                              gap: 6, 
                              alignItems: 'center', 
                              overflowX: 'auto',
                              color: isSubmitted 
                                ? (isCorrect ? '#155724' : '#721c24')
                                : '#37352f',
                              fontWeight: isSubmitted ? '600' : '500'
                            }}>
                          <span>{i + 1}.&nbsp;</span>
                          {parts.map((part, pi) => (
                            <React.Fragment key={`part-${pi}`}>
                              <span>{part}</span>
                              {pi < parts.length - 1 && (
                                <input
                                  type="text"
                                  value={grammarAnswers[blockIndex]?.[i]?.[pi] ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setGrammarAnswers((prev) => {
                                      const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                      if (!next[blockIndex]) next[blockIndex] = []
                                      if (!next[blockIndex][i]) next[blockIndex][i] = []
                                      next[blockIndex][i][pi] = val
                                      return next
                                    })
                                        // Reset submitted state when user changes answer
                                        if (isSubmitted) {
                                          setSubmittedGrammar((prev) => {
                                            const next = prev.map((arr) => [...arr])
                                            if (!next[blockIndex]) next[blockIndex] = []
                                            next[blockIndex][i] = false
                                            return next
                                          })
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          // Mark as submitted when Enter is pressed
                                          setSubmittedGrammar((prev) => {
                                            const next = prev.map((arr) => [...arr])
                                            if (!next[blockIndex]) next[blockIndex] = []
                                            next[blockIndex][i] = true
                                            return next
                                          })
                                        }
                                  }}
                                  style={{
                                    width: `${Math.max(6, (grammarAnswers[blockIndex]?.[i]?.[pi] ?? '').length + 1)}ch`,
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    border: '1px solid #e9e9e7',
                                    font: 'inherit',
                                        backgroundColor: isSubmitted 
                                          ? (isCorrect ? '#c3e6cb' : '#f5c6cb')
                                          : 'white'
                                  }}
                                  aria-label={`Заполнить пропуск ${pi + 1}`}
                                />
                              )}
                            </React.Fragment>
                          ))}
                              {isSubmitted && (
                                <span style={{ 
                                  marginLeft: '8px', 
                                  fontSize: '16px',
                                  fontWeight: 'bold'
                                }}>
                                  {isCorrect ? '✓' : '✗'}
                                </span>
                              )}
                            </p>
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#666', 
                              marginTop: '4px',
                              textAlign: 'right'
                            }}>
                              Нажмите Enter для проверки ответа
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p style={{ 
                              color: isSubmitted 
                                ? (isCorrect ? '#155724' : '#721c24')
                                : '#37352f',
                              fontWeight: isSubmitted ? '600' : '500',
                              marginBottom: '12px'
                            }}>
                              {i + 1}. {ex}
                              {isSubmitted && (
                                <span style={{ 
                                  marginLeft: '8px', 
                                  fontSize: '16px',
                                  fontWeight: 'bold'
                                }}>
                                  {isCorrect ? '✓' : '✗'}
                                </span>
                              )}
                            </p>
                            
                            <div style={{ marginBottom: '12px' }}>
                              <input
                                type="text"
                                value={grammarAnswers[blockIndex]?.[i]?.[0] ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setGrammarAnswers((prev) => {
                                    const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                    if (!next[blockIndex]) next[blockIndex] = []
                                    if (!next[blockIndex][i]) next[blockIndex][i] = ['']
                                    next[blockIndex][i][0] = val
                                    return next
                                  })
                                  // Reset submitted state when user changes answer
                                  if (isSubmitted) {
                                    setSubmittedGrammar((prev) => {
                                      const next = prev.map((arr) => [...arr])
                                      if (!next[blockIndex]) next[blockIndex] = []
                                      next[blockIndex][i] = false
                                      return next
                                    })
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    // Mark as submitted when Enter is pressed
                                    setSubmittedGrammar((prev) => {
                                      const next = prev.map((arr) => [...arr])
                                      if (!next[blockIndex]) next[blockIndex] = []
                                      next[blockIndex][i] = true
                                      return next
                                    })
                                  }
                                }}
                                placeholder="Введите ваш ответ здесь..."
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #e9e9e7',
                                  font: 'inherit',
                                  fontSize: '14px',
                                  backgroundColor: isSubmitted 
                                    ? (isCorrect ? '#c3e6cb' : '#f5c6cb')
                                    : 'white'
                                }}
                                aria-label="Введите полный ответ"
                              />
                              <div style={{ 
                                fontSize: '12px', 
                                color: '#666', 
                                marginTop: '4px',
                                textAlign: 'right'
                              }}>
                                Нажмите Enter для проверки ответа
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {isSubmitted && (
                          <div style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            backgroundColor: isCorrect ? '#c3e6cb' : '#f5c6cb',
                            border: `1px solid ${isCorrect ? '#b8dacc' : '#f1b0b7'}`,
                            fontSize: '13px',
                            color: isCorrect ? '#155724' : '#721c24',
                            fontWeight: '500'
                          }}>
                            {isCorrect ? 'Правильно!' : `Неправильно. Правильный ответ: ${correctAnswers.join(', ')}`}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {blockIndex < lesson.grammar_exercises.length - 1 && (
                  <div className="exercise-divider"></div>
                )}
              </div>
            ))}
          </div>

          <div>
            <h2>📌 Quizlet</h2>
            <button
              onClick={() => setShowQuizlet((v) => !v)}
              style={{
                background: '#37352f',
                color: '#ffffff',
                border: '1px solid #37352f',
                borderRadius: 6,
                padding: '6px 10px',
                cursor: 'pointer',
                marginBottom: 8,
              }}
            >
              {showQuizlet ? 'Скрыть Quizlet' : 'Показать Quizlet'}
            </button>
            {showQuizlet && (
              <div className="exercise-questions">
                {lesson.quizlet.map((q, i) => (
                  <div key={`quizlet-${i}`} className="question">
                    <p>{i + 1}. {q}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="exercise-divider" style={{ marginTop: 16 }}></div>
          <div className="answers-section" style={{ marginTop: 12 }}>
            <button
              onClick={() => setShowAnswers((v) => !v)}
              style={{
                background: '#37352f',
                color: '#ffffff',
                border: '1px solid #37352f',
                borderRadius: 6,
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              {showAnswers ? 'Скрыть ответы' : 'Показать ответы'}
            </button>
            {showAnswers && (
              <div style={{ marginTop: 12 }}>
                {lesson.lexical_exercises && lesson.lexical_exercises.length > 0 ? (
                  <div style={{ marginBottom: 12 }}>
                    <h3>Ответы: Лексические упражнения</h3>
                    {lesson.lexical_exercises.map((exBlock, bi) => {
                      const ansType = getLexicalAnswerType(exBlock.type)
                      const ansBlock = ansType ? lesson.lexical_answers?.find((b) => b.type === ansType) : undefined
                      if (!ansBlock || !ansBlock.answer || ansBlock.answer.length === 0) return null
                      
                      return (
                        <div key={`ans-lex-block-${bi}`} style={{ marginBottom: 8 }}>
                          <p style={{ margin: '4px 0' }}><strong>Тип:</strong> {exBlock.type}</p>
                          <ol style={{ paddingLeft: 20, marginTop: 4 }}>
                            {ansBlock.answer.map((ans, i) => (
                              <li key={`ans-lex-${bi}-${i}`}>
                                <span>{ans}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
                {lesson.grammar_exercises && lesson.grammar_exercises.length > 0 ? (
                  <div>
                    <h3>Ответы: Грамматические упражнения</h3>
                    {lesson.grammar_exercises.map((exBlock, bi) => {
                      const ansType = getGrammarAnswerType(bi)
                      const ansBlock = lesson.grammar_answers?.find((b) => b.type === ansType)
                      if (!ansBlock || !ansBlock.answer || ansBlock.answer.length === 0) return null
                      return (
                        <div key={`ans-gram-block-${bi}`} style={{ marginBottom: 8 }}>
                          <p style={{ margin: '4px 0' }}><strong>Тип:</strong> {exBlock.type}</p>
                          <ol style={{ paddingLeft: 20, marginTop: 4 }}>
                            {ansBlock.answer.map((ans, i) => (
                              <li key={`ans-gram-${bi}-${i}`}><span>{ans}</span></li>
                            ))}
                          </ol>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
