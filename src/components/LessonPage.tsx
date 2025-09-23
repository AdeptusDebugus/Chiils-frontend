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
        return Array.from({ length: blanks }, () => '')
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
  }, [lesson])

  const normalize = (s: string | undefined | null): string => (s || '').trim().toLowerCase()
  const getLexicalAnswerType = (exerciseType: string): string | null => {
    const n = normalize(exerciseType)
    if (n.startsWith('вставь пропущенное')) return 'fillTheBlankAnswers'
    if (n.includes('ложь') || n.includes('правда')) return 'truOrFalseAnswers'
    if (n.startsWith('послушай и отметь слова')) return null
    return null
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
            {lesson.glossary.map((item, index) => (
              <div key={`${item.expression}-${index}`} className="vocabulary-item">
                <h3>📌 {item.expression}</h3>
                <div className="vocab-details">
                  <p className="quote"><strong>Цитата:</strong> <em>"{item.quote}"</em></p>
                  <p><strong>Перевод:</strong> {item.translation}</p>
                  <p><strong>Объяснение:</strong> {item.explanation}</p>
                  <p className="example"><strong>Пример:</strong> <em>{item.another_example}</em></p>
                  {item.time_code !== null && (
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
                        {item.time_code.toFixed(3)}s
                      </button>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="exercises-section">
          <div>
            <h2>📌 Лексические упражнения</h2>
            {lesson.lexical_exercises.map((block, blockIndex) => (
              <div key={`lex-${blockIndex}`}>
                <p><strong>Тип:</strong> {block.type}</p>
                {block.input && (
                  <div className="exercise-tip">
                    <span className="tip-icon">💡</span>
                    <p>{block.input}</p>
                  </div>
                )}
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
                              checked={!!lexicalChecks[blockIndex]?.[i]}
                              onChange={(e) => {
                                const checked = e.target.checked
                                setLexicalChecks((prev) => {
                                  const next = prev.map((arr) => [...arr])
                                  if (!next[blockIndex]) next[blockIndex] = []
                                  next[blockIndex][i] = checked
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
                  ) : (
                    block.examples.map((ex, i) => {
                      const parts = ex.split('______')
                      const blanks = (ex.match(/_{2,}/g) || []).length
                      if (lexicalAnswers[blockIndex] && lexicalAnswers[blockIndex][i] && lexicalAnswers[blockIndex][i].length !== blanks) {
                        const next = [...lexicalAnswers]
                        next[blockIndex] = [...(next[blockIndex] || [])]
                        next[blockIndex][i] = Array.from({ length: blanks }, (_, bi) => next[blockIndex][i]?.[bi] || '')
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
                                      value={lexicalAnswers[blockIndex]?.[i]?.[pi] ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        setLexicalAnswers((prev) => {
                                          const next = prev.map((b) => b.map((exArr) => [...exArr]))
                                          if (!next[blockIndex]) next[blockIndex] = []
                                          if (!next[blockIndex][i]) next[blockIndex][i] = []
                                          next[blockIndex][i][pi] = val
                                          return next
                                        })
                                      }}
                                      style={{
                                        width: `${Math.max(6, (lexicalAnswers[blockIndex]?.[i]?.[pi] ?? '').length + 1)}ch`,
                                        padding: '1px 6px',
                                        borderRadius: 4,
                                        border: '1px solid #e9e9e7',
                                        font: 'inherit',
                                      }}
                                      placeholder="слово"
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
                    if (grammarAnswers[blockIndex] && grammarAnswers[blockIndex][i] && grammarAnswers[blockIndex][i].length !== blanks) {
                      // adjust answers length if source changed
                      const newAnswers = [...grammarAnswers]
                      newAnswers[blockIndex] = [...(newAnswers[blockIndex] || [])]
                      newAnswers[blockIndex][i] = Array.from({ length: blanks }, (_, bi) => newAnswers[blockIndex][i]?.[bi] || '')
                      setGrammarAnswers(newAnswers)
                    }
                    return (
                      <div key={`gram-ex-${i}`} className="question">
                        <p style={{ display: 'flex', flexWrap: 'nowrap', gap: 6, alignItems: 'center', overflowX: 'auto' }}>
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
                                  }}
                                  style={{
                                    width: `${Math.max(6, (grammarAnswers[blockIndex]?.[i]?.[pi] ?? '').length + 1)}ch`,
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    border: '1px solid #e9e9e7',
                                    font: 'inherit',
                                  }}
                                  aria-label={`Заполнить пропуск ${pi + 1}`}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </p>
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
                              <li key={`ans-lex-${bi}-${i}`}><span>{ans}</span></li>
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
                      const ansBlock = lesson.grammar_answers?.[bi]
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
