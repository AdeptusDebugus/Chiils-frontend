import React, { useState, useEffect, useRef } from 'react';
import { lessonService, LessonData } from '../services/lessonService';
import { useParams } from 'react-router-dom';
import './LessonPage.css';


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

const calculateInputWidth = (text: string): number => {
  // Create a temporary canvas to measure text width
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return Math.max(60, text.length * 12)
  
  // Use bold font weight to account for when answers are shown as incorrect/correct
  context.font = '600 15.79px "TeX Gyre Heros", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif'
  const metrics = context.measureText(text)
  const width = metrics.width + 28 // Add extra padding (14px on each side) for bold text
  
  return Math.max(60, Math.min(width, 250)) // Min 60px, max 250px
}

const sanitizeQuizletEntry = (text: string): string => {
  return text.replace(/^\s*\d+[.)\]:\-]*\s*/, '').trim()
}

const LessonPage: React.FC = () => {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null)
  // Remove tab state since we're displaying all exercises sequentially
  const [grammarAnswers, setGrammarAnswers] = useState<string[][][]>([])
  const [lexicalChecks, setLexicalChecks] = useState<boolean[][]>([])
  const [trueFalseSelections, setTrueFalseSelections] = useState<('true' | 'false' | null)[][]>([])
  const [submittedGrammar, setSubmittedGrammar] = useState<boolean[][]>([])
  const [submittedLexical, setSubmittedLexical] = useState<boolean[][]>([])
  const [selectedWords, setSelectedWords] = useState<string[][][]>([])
  const [availableWords, setAvailableWords] = useState<string[][]>([])
  const [usedCorrectWords] = useState<string[]>([])
  const [showAnswers, setShowAnswers] = useState<boolean>(false)
  const [showQuizlet, setShowQuizlet] = useState<boolean>(false)

  // Sticky handled by CSS only

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
      width: '100%',
      height: '100%',
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

    // initialize incorrect words for tracking (not used in new design)
  }, [lesson])

  // Sidebar follows natural document flow; no sticky/fixed JS constraints

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

  // Sequential counter for exercise section headings
  let exerciseCounter = 0

  return (
    <div className="lesson-page">
      <div className="page-title">
        <h1 className="page-title-text">We Bought An Abandoned Chateau - 6 Years of Renovation In 25 Minutes</h1>
      </div>
      <div className="lesson-layout">
        {/* Main content area */}
        <div className="main-content">
          {lesson.lesson_topic && (
            <div className="lesson-header">
              <h1 className="lesson-title">{lesson.lesson_topic}</h1>
            </div>
          )}
          
          <div className="video-section">
            <div className="video-embed">
              <div id="yt-player"></div>
            </div>
          </div>



        {/* All Exercises Container */}
        <div className="all-exercises-container">
          {/* Lexical Exercises */}
          {lesson.lexical_exercises && lesson.lexical_exercises.length > 0 && 
          lesson.lexical_exercises
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
            <div key={`lex-${originalIndex}`} className="exercises-section">
              <h2>{`Exercise ${++exerciseCounter}`}</h2>
                <div className="exercise-questions">
                  {block.type && block.type.trim().toLowerCase().startsWith('послушай и отметь слова из списка') ? (
                    <div>
                      <p className="instruction-text">Постарайся услышать новую лексику в видео. Помечай слова по мере того, как услышишь их в видео.</p>

                      <div className="question checkbox-list">
                        {(block.examples.length === 1
                          ? block.examples[0].split(/[,;\n]+/).map((w) => w.trim()).filter(Boolean)
                          : block.examples
                        ).map((word, i) => (
                          <label key={`lex-check-${i}`} className="checkbox-label">
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
                            />
                            <span className="checkbox-box" aria-hidden="true"></span>
                            <span className="checkbox-text">{word}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : isTrueFalseExercise(block.type) ? (
                    // True/False exercise rendering with new design
                    (() => {
                      // Check if all answers are correct
                      const allAnswersCorrect = block.examples.every((_, i) => {
                        const userSelection = trueFalseSelections[originalIndex]?.[i]
                        const ansType = getLexicalAnswerType(block.type)
                        const ansBlock = ansType ? lesson.lexical_answers?.find((b) => b.type === ansType) : undefined
                        const correctAnswer = ansBlock?.answer?.[i]?.toLowerCase()
                        return userSelection === correctAnswer
                      })
                      
                      const isExerciseSubmitted = submittedLexical[originalIndex]?.some(submitted => submitted) || false

                      return (
                        <div key={`true-false-exercise-${originalIndex}`} className="true-false-exercise">
                          <p className="true-false-instruction">
                            Прочитай предложения и выбери правильный ответ - True или False.
                          </p>
                          
                          {/* Exercise Questions */}
                          <div className="exercise-questions">
                            {block.examples.map((ex, i) => {
                              const userSelection = trueFalseSelections[originalIndex]?.[i]
                              // Get the correct answer from the answer block
                              const ansType = getLexicalAnswerType(block.type)
                              const ansBlock = ansType ? lesson.lexical_answers?.find((b) => b.type === ansType) : undefined
                              const correctAnswer = ansBlock?.answer?.[i]?.toLowerCase()
                              const isCorrect = userSelection === correctAnswer
                              const isSubmitted = submittedLexical[originalIndex]?.[i] || false
                              
                              return (
                                <div key={`lex-ex-${i}`} className="true-false-question">
                                  <p className="true-false-sentence">
                                    {i + 1}. {ex}
                                  </p>
                                  
                                  <div className="true-false-buttons">
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
                                        
                                        // Reset submitted state when user changes answer
                                        if (isSubmitted) {
                                          setSubmittedLexical((prev) => {
                                            const next = prev.map((arr) => [...arr])
                                            if (!next[originalIndex]) next[originalIndex] = []
                                            next[originalIndex][i] = false
                                            return next
                                          })
                                        }
                                      }}
                                      className={`true-false-btn true-btn ${
                                        userSelection === 'true' ? 'selected' : ''
                                      } ${
                                        isSubmitted && userSelection === 'true'
                                          ? (correctAnswer === 'true' ? 'correct' : 'incorrect')
                                          : ''
                                      }`}
                                    >
                                      True
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
                                        
                                        // Reset submitted state when user changes answer
                                        if (isSubmitted) {
                                          setSubmittedLexical((prev) => {
                                            const next = prev.map((arr) => [...arr])
                                            if (!next[originalIndex]) next[originalIndex] = []
                                            next[originalIndex][i] = false
                                            return next
                                          })
                                        }
                                      }}
                                      className={`true-false-btn false-btn ${
                                        userSelection === 'false' ? 'selected' : ''
                                      } ${
                                        isSubmitted && userSelection === 'false'
                                          ? (correctAnswer === 'false' ? 'correct' : 'incorrect')
                                          : ''
                                      }`}
                                    >
                                      False
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Check Button - Exercise Level */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="exercise-check-button"
                              onClick={() => {
                                // Mark all sentences in this exercise as submitted
                                setSubmittedLexical((prev) => {
                                  const next = prev.map((arr) => [...arr])
                                  if (!next[originalIndex]) next[originalIndex] = []
                                  next[originalIndex] = next[originalIndex].map(() => true)
                                  return next
                                })
                              }}
                            >
                              Check
                            </button>
                          </div>
                          
                          {/* Exercise Level Feedback */}
                          {isExerciseSubmitted && !allAnswersCorrect && (
                            <div style={{
                              marginTop: '12px',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#f26430',
                              border: '1px solid #f1b0b7',
                              fontSize: '14px',
                              color: '#ffffff',
                              fontWeight: '500'
                            }}>
                              Неправильно. Попробуйте еще раз.
                            </div>
                          )}
                        </div>
                      )
                    })()
                  ) : isFillInTheBlankExercise(block.type) ? (
                    // Fill-in-the-blank exercise rendering with new Figma design
                    (() => {
                      const words = availableWords[originalIndex] || []
                      
                      // Check if all answers are correct
                      const allAnswersCorrect = block.examples.every((ex, i) => {
                        const blanks = (ex.match(/_{2,}/g) || []).length
                        const ansType = getLexicalAnswerType(block.type)
                        const ansBlock = ansType ? lesson.lexical_answers?.find((b) => b.type === ansType) : undefined
                        const correctAnswers = ansBlock?.answer?.[i]?.split(',').map(a => a.trim().toLowerCase()) || []
                        const userSelections = selectedWords[originalIndex]?.[i] || []
                        return userSelections.length === blanks && userSelections.every((selection, index) => 
                          correctAnswers[index] && selection.toLowerCase().trim() === correctAnswers[index]
                        )
                      })
                      
                      const isExerciseSubmitted = submittedLexical[originalIndex]?.some(submitted => submitted) || false

                      return (
                        <div key={`lex-exercise-${originalIndex}`} className="fill-blank-exercise">
                          <p className="fill-blank-instruction">
                            Вставь пропущенное слово так, чтобы оно соответствовало контектсту. Используй выражения ниже.
                          </p>
                          
                          {/* Word List Display */}
                          <div className="word-list-container">
                            {words.map((word, wordIndex) => (
                              <span key={`word-display-${wordIndex}`} className="word-list-item">
                                {word}{wordIndex < words.length - 1 ? ', ' : '.'}
                              </span>
                            ))}
                          </div>
                          
                          {/* Exercise Questions */}
                          <div className="exercise-questions">
                            {block.examples.map((ex, i) => {
                              const blanks = (ex.match(/_{2,}/g) || []).length

                              // Get correct answers for this exercise
                              const ansType = getLexicalAnswerType(block.type)
                              const ansBlock = ansType ? lesson.lexical_answers?.find((b) => b.type === ansType) : undefined
                              const correctAnswers = ansBlock?.answer?.[i]?.split(',').map(a => a.trim().toLowerCase()) || []
                              
                              // Check if all blanks are selected and compare with correct answers
                              const userSelections = selectedWords[originalIndex]?.[i] || []
                              const isSubmitted = submittedLexical[originalIndex]?.[i] || false
                              
                              // Check individual word correctness for immediate feedback
                              const wordCorrectness = userSelections.map((selection, index) => 
                                correctAnswers[index] && selection.toLowerCase().trim() === correctAnswers[index]
                              )

                              return (
                                <div key={`lex-ex-${i}`} className="fill-blank-question">
                                  {blanks === 0 ? (
                                    <p className="fill-blank-sentence">
                                      {i + 1}. {ex}
                                    </p>
                                  ) : (
                                    <div>
                                      <p className="fill-blank-sentence">
                                        {i + 1}. {(() => {
                                          // Create sentence with input fields
                                          const parts = ex.split('______')
                                          let sentenceElements: React.ReactNode[] = []
                                          
                                          parts.forEach((part, partIndex) => {
                                            if (part.trim()) {
                                              sentenceElements.push(
                                                <span key={`text-${partIndex}`}>{part}</span>
                                              )
                                            }
                                            if (partIndex < parts.length - 1) {
                                              const selectedWord = userSelections[partIndex] || ''
                                              const isWordCorrect = wordCorrectness[partIndex]
                                              
                                              sentenceElements.push(
                                                <input
                                                  key={`input-${partIndex}`}
                                                  type="text"
                                                  value={selectedWord}
                                                  style={{ width: `${calculateInputWidth(selectedWord)}px` }}
                                                  onChange={(e) => {
                                                    const value = e.target.value
                                                    setSelectedWords((prev) => {
                                                      const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                                      if (!next[originalIndex]) next[originalIndex] = []
                                                      if (!next[originalIndex][i]) next[originalIndex][i] = []
                                                      next[originalIndex][i][partIndex] = value
                                                      return next
                                                    })
                                                    
                                                    // Reset submitted state when user changes input
                                                    if (isSubmitted) {
                                                      setSubmittedLexical((prev) => {
                                                        const next = prev.map((arr) => [...arr])
                                                        if (!next[originalIndex]) next[originalIndex] = []
                                                        next[originalIndex][i] = false
                                                        return next
                                                      })
                                                    }
                                                  }}
                                                  className={`fill-blank-input ${
                                                    isSubmitted ? (isWordCorrect ? 'correct' : 'incorrect') : ''
                                                  }`}
                                                />
                                              )
                                            }
                                          })
                                          
                                          return sentenceElements
                                        })()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Check Button - Exercise Level */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="exercise-check-button"
                              onClick={() => {
                                // Mark all sentences in this exercise as submitted
                                setSubmittedLexical((prev) => {
                                  const next = prev.map((arr) => [...arr])
                                  if (!next[originalIndex]) next[originalIndex] = []
                                  next[originalIndex] = next[originalIndex].map(() => true)
                                  return next
                                })
                              }}
                            >
                              Check
                            </button>
                          </div>
                          
                          {/* Exercise Level Feedback */}
                          {isExerciseSubmitted && !allAnswersCorrect && (
                            <div style={{
                              marginTop: '12px',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#f26430',
                              border: '1px solid #f1b0b7',
                              fontSize: '14px',
                              color: '#ffffff',
                              fontWeight: '500'
                            }}>
                              Неправильно. Попробуйте еще раз.
                            </div>
                          )}
                        </div>
                      )
                    })()
                  ) : null}
                </div>
              </div>
          ))
        }

        {/* Grammar Exercises */}
        {lesson.grammar_exercises && lesson.grammar_exercises.length > 0 && 
          lesson.grammar_exercises.map((block, blockIndex) => (
            <div key={`gram-${blockIndex}`} className="exercises-section">
              <h2>{`Exercise ${++exerciseCounter}`}</h2>
                {block.input && (
                  <div className="exercise-tip">
                    <span className="tip-icon"></span>
                    <p>{block.input}</p>
                  </div>
                )}
                
                {/* Grammar Exercise with new design */}
                <div className="grammar-exercise">
                  
                  {/* Check if all answers are correct for this grammar block */}
                  {(() => {
                    const allAnswersCorrect = block.examples.every((ex, i) => {
                      const blanks = (ex.match(/_{2,}/g) || []).length
                      
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
                      return allFilled && userAnswers.length >= blanks && userAnswers.every((answer, index) => 
                        correctAnswers[index] && answer.toLowerCase().trim() === correctAnswers[index]
                      )
                    })
                    
                    const isExerciseSubmitted = submittedGrammar[blockIndex]?.some(submitted => submitted) || false

                    return (
                      <>
                        {/* Exercise Questions */}
                <div className="exercise-questions">
                  {block.examples.map((ex, i) => {
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
                              <div key={`gram-ex-${i}`} className="grammar-question">
                        {hasBlanks ? (
                          <div>
                                    <p className="grammar-sentence">
                                      {i + 1}. {(() => {
                                        // Create sentence with input fields
                                        const parts = ex.split('______')
                                        let sentenceElements: React.ReactNode[] = []
                                        
                                        parts.forEach((part, partIndex) => {
                                          if (part.trim()) {
                                            sentenceElements.push(
                                              <span key={`text-${partIndex}`}>{part}</span>
                                            )
                                          }
                                          if (partIndex < parts.length - 1) {
                                            const userAnswer = userAnswers[partIndex] || ''
                                            const isWordCorrect = correctAnswers[partIndex] && userAnswer.toLowerCase().trim() === correctAnswers[partIndex]
                                            
                                            sentenceElements.push(
                                <input
                                                key={`input-${partIndex}`}
                                  type="text"
                                                value={userAnswer}
                                                style={{ width: `${calculateInputWidth(userAnswer)}px` }}
                                  onChange={(e) => {
                                                  const value = e.target.value
                                    setGrammarAnswers((prev) => {
                                      const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                      if (!next[blockIndex]) next[blockIndex] = []
                                      if (!next[blockIndex][i]) next[blockIndex][i] = []
                                                    next[blockIndex][i][partIndex] = value
                                      return next
                                    })
                                                  
                                                  // Reset submitted state when user changes input
                                        if (isSubmitted) {
                                          setSubmittedGrammar((prev) => {
                                            const next = prev.map((arr) => [...arr])
                                            if (!next[blockIndex]) next[blockIndex] = []
                                            next[blockIndex][i] = false
                                            return next
                                          })
                                        }
                                      }}
                                                className={`grammar-input ${
                                                  isSubmitted ? (isWordCorrect ? 'correct' : 'incorrect') : ''
                                                }`}
                                              />
                                            )
                                          }
                                        })
                                        
                                        return sentenceElements
                                      })()}
                                    </p>
                          </div>
                        ) : (
                          <div>
                                    <p className="grammar-sentence">
                              {i + 1}. {ex}
                            </p>
                            
                                    <div style={{ marginTop: '10px' }}>
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
                                        placeholder="Введите ваш ответ здесь..."
                                        className={`grammar-full-input ${
                                          isSubmitted ? (isCorrect ? 'correct' : 'incorrect') : ''
                                        }`}
                                        aria-label="Введите полный ответ"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* Check Button - Exercise Level */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="exercise-check-button"
                            onClick={() => {
                              // Mark all sentences in this exercise as submitted
                                    setSubmittedGrammar((prev) => {
                                      const next = prev.map((arr) => [...arr])
                                      if (!next[blockIndex]) next[blockIndex] = []
                                next[blockIndex] = next[blockIndex].map(() => true)
                                      return next
                                    })
                            }}
                          >
                            Check
                          </button>
                              </div>
                        
                        {/* Exercise Level Feedback */}
                        {isExerciseSubmitted && !allAnswersCorrect && (
                          <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#f26430',
                            border: '1px solid #f1b0b7',
                            fontSize: '14px',
                            color: '#ffffff',
                            fontWeight: '500'
                          }}>
                            Неправильно. Попробуйте еще раз.
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
          ))
        }
        </div>

        {/* Quizlet Section */}
        {lesson.quizlet && lesson.quizlet.length > 0 && (
          <div className="exercises-section">
            <div className="answers-header">
              <h2>Quizlet</h2>
              <button 
                type="button"
                className="answers-toggle-btn"
                onClick={() => setShowQuizlet(!showQuizlet)}
              >
                {showQuizlet ? 'Hide Quizlet' : 'Show Quizlet'}
              </button>
            </div>
            
            {showQuizlet && (
              <div className="answers-content">
                <p className="quizlet-instructions">
                  Открой Quizlet и нажми на «+» в правом верхнем углу. Выбери «Flashcard set». Нажми «Import» и вставь список ниже в окно импорта. В настройках выбери разделитель между словом и переводом — «comma», а между карточками — «semicolon». Затем нажми «Import» в правом нижнем углу. Сет готов!
                </p>
                <div className="exercise-questions quizlet-questions">
                  {lesson.quizlet.map((rawItem, i) => {
                    const cleaned = sanitizeQuizletEntry(rawItem)
                    if (!cleaned) {
                      return null
                    }
                    return (
                      <div key={`quizlet-${i}`} className="question">
                        <p>{cleaned}</p>
                  </div>
                    )
                  })}
              </div>
            </div>
            )}
          </div>
        )}

        {/* Answers Section */}
          <div className="exercises-section">
          <div className="answers-header">
            <h2>Answers</h2>
            <button 
              type="button"
              className="answers-toggle-btn"
              onClick={() => setShowAnswers(!showAnswers)}
            >
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </button>
          </div>
          
          {showAnswers && (
            <div className="answers-content">
              {lesson.lexical_exercises && lesson.lexical_exercises.length > 0 && (
                <div className="answers-subsection">
                  <h3>Лексические упражнения</h3>
                    {lesson.lexical_exercises.map((exBlock, bi) => {
                      const ansType = getLexicalAnswerType(exBlock.type)
                      const ansBlock = ansType ? lesson.lexical_answers?.find((b) => b.type === ansType) : undefined
                      if (!ansBlock || !ansBlock.answer || ansBlock.answer.length === 0) return null
                      return (
                      <div key={`ans-lex-block-${bi}`} className="answer-block">
                        <p className="answer-type"><strong>Тип:</strong> {exBlock.type}</p>
                        <ol className="answer-list">
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
              )}
              
              {lesson.grammar_exercises && lesson.grammar_exercises.length > 0 && (
                <div className="answers-subsection">
                  <h3>Грамматические упражнения</h3>
                    {lesson.grammar_exercises.map((exBlock, bi) => {
                      const ansType = getGrammarAnswerType(bi)
                      const ansBlock = lesson.grammar_answers?.find((b) => b.type === ansType)
                      if (!ansBlock || !ansBlock.answer || ansBlock.answer.length === 0) return null
                      return (
                      <div key={`ans-gram-block-${bi}`} className="answer-block">
                        <p className="answer-type"><strong>Тип:</strong> {exBlock.type}</p>
                        <ol className="answer-list">
                            {ansBlock.answer.map((ans, i) => (
                            <li key={`ans-gram-${bi}-${i}`}>
                              <span>{ans}</span>
                            </li>
                            ))}
                          </ol>
                        </div>
                      )
                    })}
                  </div>
              )}
          </div>
        )}
        </div>
        </div>

        {/* Vocabulary sidebar column */}
          <div className="vocabulary-column">
          <div className="vocabulary-sidebar">
          <h2>Dictionary</h2>
            <div className="vocabulary-list">
              {lesson.glossary
                .filter(item => item.time_code !== null && item.time_code !== undefined)
                .sort((a, b) => (a.time_code || 0) - (b.time_code || 0))
                .map((item, index) => {
                  const minutes = Math.floor((item.time_code || 0) / 60);
                  const seconds = Math.floor((item.time_code || 0) % 60);
                  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                  
                  return (
                    <div key={`${item.expression}-${index}`} className="vocab-sidebar-card">
                      <div className="vocab-sidebar-content">
                        <h3>{item.expression} — {item.translation}</h3>
                        <div className="time-code">
                          <span className="time-link" onClick={() => scrollToPlayerAndSeek(item.time_code as number)}>
                            {timeDisplay}
                          </span>
                        </div>
                        <p className="quote">«{item.quote}»</p>
                        <p className="explanation">{item.explanation}</p>
                        <p className="example">{item.another_example}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          </div>
      </div>
    </div>
  );
};

export default LessonPage;
