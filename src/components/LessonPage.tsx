// src/components/LessonPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { getLessonFull, type LessonData } from '../services/lessonService';
import { useParams } from 'react-router-dom';
import './LessonPage.css';
import { extractYouTubeId, fetchYouTubeTitle } from '../utils/youtube';
import { capitalizeFirstLetter } from '../utils/text';

const calculateInputWidth = (text: string): number => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return Math.max(60, text.length * 12)
    context.font = '600 15.79px "TeX Gyre Heros", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif'
    const metrics = context.measureText(text)
    const width = metrics.width + 28
    return Math.max(60, Math.min(width, 250))
}

const sanitizeQuizletEntry = (text: string): string => {
    return text.replace(/^\s*\d+[.)\]:\-]*\s*/, '').trim()
}

const LessonPage: React.FC = () => {
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const playerRef = useRef<any>(null)

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
    const titleCacheRef = useRef<Record<string, string>>({})

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
        window.setTimeout(() => seekTo(seconds), 150)
    }

    // берём id урока из URL
    const { id } = useParams<{ id: string }>()

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                if (!id) {
                    setError('No lesson id provided')
                    setLesson(null)
                    return
                }
                const full = await getLessonFull(id)
                setLesson(full)
                setError(null)
            } catch (err) {
                setError('Failed to load lesson')
                console.error('Error loading lesson:', err)
            } finally {
                setLoading(false)
            }
        })()
    }, [id])

    useEffect(() => {
        if (!lesson) return
        const youUrl = lesson.youtube_url || lesson.you_tube_url || ''
        const videoId = youUrl ? extractYouTubeId(youUrl) : null
        if (videoId) initPlayer(videoId)

        const gInit = lesson.grammar_exercises.map(block =>
            block.examples.map(ex => {
                const blanks = (ex.match(/_{2,}/g) || []).length
                return blanks > 0 ? Array.from({ length: blanks }, () => '') : ['']
            })
        )
        setGrammarAnswers(gInit)

        const checksInit = lesson.lexical_exercises.map(block => block.examples.map(() => false))
        setLexicalChecks(checksInit)

        const tfInit = lesson.lexical_exercises.map(block => block.examples.map(() => null as 'true' | 'false' | null))
        setTrueFalseSelections(tfInit)

        const subG = lesson.grammar_exercises.map(block => block.examples.map(() => false))
        setSubmittedGrammar(subG)

        const subL = lesson.lexical_exercises.map(block => block.examples.map(() => false))
        setSubmittedLexical(subL)

        const wordsInit = lesson.lexical_exercises.map(block => {
            const type = (block.type || '').toLowerCase()
            if (type.includes('вставь пропущенное') || type.includes('fill-in-the-blank')) {
                const ansBlock = lesson.lexical_answers?.find(b => b.type === 'fillTheBlankAnswers')
                if (ansBlock?.answer) {
                    const allWords = ansBlock.answer.flatMap(a => a.split(',').map(x => x.trim()))
                    const unused = allWords.filter(w => !usedCorrectWords.includes(w.toLowerCase()))
                    const extra = [
                        'always','never','sometimes','often','usually','rarely',
                        'quickly','slowly','carefully','easily','hardly','barely',
                        'here','there','everywhere','nowhere','somewhere','anywhere',
                        'today','yesterday','tomorrow','tonight','morning','evening'
                    ]
                    const all = [...unused, ...extra.slice(0, Math.max(2, unused.length))]
                    return all.sort(() => Math.random() - 0.5)
                }
            }
            return []
        })
        setAvailableWords(wordsInit)

        const selectedWordsInit = lesson.lexical_exercises.map(block => block.examples.map(() => [] as string[]))
        setSelectedWords(selectedWordsInit)
    }, [lesson])

    // подтягиваем заголовок YouTube при необходимости
    useEffect(() => {
        if (!lesson || !lesson.youtube_url) return
        const existing = lesson.you_tube_title?.trim()
        if (existing) return

        const cached = titleCacheRef.current[lesson.youtube_url]
        if (cached) {
            setLesson(prev => (prev ? { ...prev, you_tube_title: cached } : prev))
            return
        }

        let cancelled = false
        ;(async () => {
            const t = await fetchYouTubeTitle(lesson.youtube_url!)
            if (cancelled || !t) return
            titleCacheRef.current[lesson.youtube_url!] = t
            setLesson(prev => (prev ? { ...prev, you_tube_title: t } : prev))
        })()

        return () => { cancelled = true }
    }, [lesson])

    const displayTitleRaw =
        lesson?.you_tube_title?.trim() ||
        lesson?.tags?.lesson_theme ||
        lesson?.lesson_topic ||
        'Lesson'
    const displayTitle = capitalizeFirstLetter(displayTitleRaw)

    useEffect(() => {
        if (!lesson) return
        if (displayTitle) document.title = displayTitle
    }, [lesson?.you_tube_title, lesson?.tags?.lesson_theme, lesson?.lesson_topic, displayTitle])

    const normalize = (s: string | undefined | null): string => (s || '').trim().toLowerCase()
    const getLexicalAnswerType = (exerciseType: string): string | null => {
        const n = normalize(exerciseType)
        if (n.startsWith('вставь пропущенное') || n.includes('fill-in-the-blank')) return 'fillTheBlankAnswers'
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
        return n.startsWith('вставь пропущенное') || n.includes('fill-in-the-blank')
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

    let exerciseCounter = 0
    const lessonTopicTitle = capitalizeFirstLetter(lesson.lesson_topic || '')

    return (
        <div className="lesson-page">
            <div className="page-title">
                <h1 className="page-title-text">{displayTitle}</h1>
            </div>
            <div className="lesson-layout">
                {/* Main content */}
                <div className="main-content">
                    {lesson.lesson_topic && (
                        <div className="lesson-header">
                            <h1 className="lesson-title">{lessonTopicTitle}</h1>
                        </div>
                    )}

                    <div className="video-section">
                        <div className="video-embed">
                            <div id="yt-player"></div>
                        </div>
                    </div>

                    {/* All Exercises */}
                    <div className="all-exercises-container">
                        {/* Lexical */}
                        {lesson.lexical_exercises && lesson.lexical_exercises.length > 0 &&
                            lesson.lexical_exercises
                                .map((block, originalIndex) => ({ block, originalIndex }))
                                .sort((a, b) => {
                                    const aIsListening = a.block.type?.toLowerCase().includes('послушай и отметь слова')
                                    const bIsListening = b.block.type?.toLowerCase().includes('послушай и отметь слова')
                                    if (aIsListening && !bIsListening) return -1
                                    if (!aIsListening && bIsListening) return 1
                                    return 0
                                })
                                .map(({ block, originalIndex }) => (
                                    <div key={`lex-${originalIndex}`} className="exercises-section">
                                        <h2>{`Exercise ${++exerciseCounter}`}</h2>
                                        <div className="exercise-questions">
                                            {block.type && block.type.trim().toLowerCase().startsWith('послушай и отметь слова') ? (
                                                <div>
                                                    <p className="instruction-text">Постарайся услышать новую лексику в видео. Помечай слова по мере того, как услышишь их в видео.</p>
                                                    <div className="question checkbox-list">
                                                        {(block.examples.length === 1
                                                                ? block.examples[0].split(/[,;\n]+/).map(w => w.trim()).filter(Boolean)
                                                                : block.examples
                                                        ).map((word, i) => (
                                                            <label key={`lex-check-${i}`} className="checkbox-label">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!lexicalChecks[originalIndex]?.[i]}
                                                                    onChange={(e) => {
                                                                        const checked = e.target.checked
                                                                        setLexicalChecks(prev => {
                                                                            const next = prev.map(arr => [...arr])
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
                                                (() => {
                                                    const allAnswersCorrect = block.examples.every((_, i) => {
                                                        const userSelection = trueFalseSelections[originalIndex]?.[i]
                                                        const ansType = getLexicalAnswerType(block.type)
                                                        const ansBlock = ansType ? lesson.lexical_answers?.find(b => b.type === ansType) : undefined
                                                        const correctAnswer = ansBlock?.answer?.[i]?.toLowerCase()
                                                        return userSelection === correctAnswer
                                                    })

                                                    const isExerciseSubmitted = submittedLexical[originalIndex]?.some(s => s) || false

                                                    return (
                                                        <div key={`true-false-exercise-${originalIndex}`} className="true-false-exercise">
                                                            <p className="true-false-instruction">
                                                                Прочитай предложения и выбери правильный ответ - True или False.
                                                            </p>
                                                            <div className="exercise-questions">
                                                                {block.examples.map((ex, i) => {
                                                                    const userSelection = trueFalseSelections[originalIndex]?.[i]
                                                                    const ansType = getLexicalAnswerType(block.type)
                                                                    const ansBlock = ansType ? lesson.lexical_answers?.find(b => b.type === ansType) : undefined
                                                                    const correctAnswer = ansBlock?.answer?.[i]?.toLowerCase()
                                                                    const isSubmitted = submittedLexical[originalIndex]?.[i] || false

                                                                    return (
                                                                        <div key={`lex-ex-${i}`} className="true-false-question">
                                                                            <p className="true-false-sentence">{i + 1}. {ex}</p>
                                                                            <div className="true-false-buttons">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const value = 'true' as 'true' | 'false'
                                                                                        setTrueFalseSelections(prev => {
                                                                                            const next = prev.map(arr => [...arr])
                                                                                            if (!next[originalIndex]) next[originalIndex] = []
                                                                                            next[originalIndex][i] = value
                                                                                            return next
                                                                                        })
                                                                                        if (isSubmitted) {
                                                                                            setSubmittedLexical(prev => {
                                                                                                const next = prev.map(arr => [...arr])
                                                                                                if (!next[originalIndex]) next[originalIndex] = []
                                                                                                next[originalIndex][i] = false
                                                                                                return next
                                                                                            })
                                                                                        }
                                                                                    }}
                                                                                    className={`true-false-btn true-btn ${userSelection === 'true' ? 'selected' : ''} ${
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
                                                                                        setTrueFalseSelections(prev => {
                                                                                            const next = prev.map(arr => [...arr])
                                                                                            if (!next[originalIndex]) next[originalIndex] = []
                                                                                            next[originalIndex][i] = value
                                                                                            return next
                                                                                        })
                                                                                        if (isSubmitted) {
                                                                                            setSubmittedLexical(prev => {
                                                                                                const next = prev.map(arr => [...arr])
                                                                                                if (!next[originalIndex]) next[originalIndex] = []
                                                                                                next[originalIndex][i] = false
                                                                                                return next
                                                                                            })
                                                                                        }
                                                                                    }}
                                                                                    className={`true-false-btn false-btn ${userSelection === 'false' ? 'selected' : ''} ${
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

                                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                <button
                                                                    type="button"
                                                                    className="exercise-check-button"
                                                                    onClick={() => {
                                                                        setSubmittedLexical(prev => {
                                                                            const next = prev.map(arr => [...arr])
                                                                            if (!next[originalIndex]) next[originalIndex] = []
                                                                            next[originalIndex] = next[originalIndex].map(() => true)
                                                                            return next
                                                                        })
                                                                    }}
                                                                >
                                                                    Check
                                                                </button>
                                                            </div>

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
                                                (() => {
                                                    const words = availableWords[originalIndex] || []
                                                    const allAnswersCorrect = block.examples.every((ex, i) => {
                                                        const blanks = (ex.match(/_{2,}/g) || []).length
                                                        const ansType = getLexicalAnswerType(block.type)
                                                        const ansBlock = ansType ? lesson.lexical_answers?.find(b => b.type === ansType) : undefined
                                                        const correctAnswers = ansBlock?.answer?.[i]?.split(',').map(a => a.trim().toLowerCase()) || []
                                                        const userSelections = selectedWords[originalIndex]?.[i] || []
                                                        return userSelections.length === blanks && userSelections.every((sel, idx) =>
                                                            correctAnswers[idx] && sel.toLowerCase().trim() === correctAnswers[idx]
                                                        )
                                                    })
                                                    const isExerciseSubmitted = submittedLexical[originalIndex]?.some(s => s) || false

                                                    return (
                                                        <div key={`lex-exercise-${originalIndex}`} className="fill-blank-exercise">
                                                            <p className="fill-blank-instruction">
                                                                Вставь пропущенное слово так, чтобы оно соответствовало контексту. Используй выражения ниже.
                                                            </p>

                                                            <div className="word-list-container">
                                                                {words.map((word, wi) => (
                                                                    <span key={`word-display-${wi}`} className="word-list-item">
                                    {word}{wi < words.length - 1 ? ', ' : '.'}
                                  </span>
                                                                ))}
                                                            </div>

                                                            <div className="exercise-questions">
                                                                {block.examples.map((ex, i) => {
                                                                    const blanks = (ex.match(/_{2,}/g) || []).length
                                                                    const ansType = getLexicalAnswerType(block.type)
                                                                    const ansBlock = ansType ? lesson.lexical_answers?.find(b => b.type === ansType) : undefined
                                                                    const correctAnswers = ansBlock?.answer?.[i]?.split(',').map(a => a.trim().toLowerCase()) || []
                                                                    const userSelections = selectedWords[originalIndex]?.[i] || []
                                                                    const isSubmitted = submittedLexical[originalIndex]?.[i] || false
                                                                    const wordCorrectness = userSelections.map((sel, idx) =>
                                                                        correctAnswers[idx] && sel.toLowerCase().trim() === correctAnswers[idx]
                                                                    )

                                                                    return (
                                                                        <div key={`lex-ex-${i}`} className="fill-blank-question">
                                                                            {blanks === 0 ? (
                                                                                <p className="fill-blank-sentence">{i + 1}. {ex}</p>
                                                                            ) : (
                                                                                <div>
                                                                                    <p className="fill-blank-sentence">
                                                                                        {i + 1}. {(() => {
                                                                                        const parts = ex.split('______')
                                                                                        const nodes: React.ReactNode[] = []
                                                                                        parts.forEach((part, pi) => {
                                                                                            if (part.trim()) nodes.push(<span key={`text-${pi}`}>{part}</span>)
                                                                                            if (pi < parts.length - 1) {
                                                                                                const sel = userSelections[pi] || ''
                                                                                                const ok = wordCorrectness[pi]
                                                                                                nodes.push(
                                                                                                    <input
                                                                                                        key={`input-${pi}`}
                                                                                                        type="text"
                                                                                                        value={sel}
                                                                                                        style={{ width: `${calculateInputWidth(sel)}px` }}
                                                                                                        onChange={(e) => {
                                                                                                            const val = e.target.value
                                                                                                            setSelectedWords(prev => {
                                                                                                                const next = prev.map(b => b.map(exArr => [...exArr]))
                                                                                                                if (!next[originalIndex]) next[originalIndex] = []
                                                                                                                if (!next[originalIndex][i]) next[originalIndex][i] = []
                                                                                                                next[originalIndex][i][pi] = val
                                                                                                                return next
                                                                                                            })
                                                                                                            if (isSubmitted) {
                                                                                                                setSubmittedLexical(prev => {
                                                                                                                    const next = prev.map(arr => [...arr])
                                                                                                                    if (!next[originalIndex]) next[originalIndex] = []
                                                                                                                    next[originalIndex][i] = false
                                                                                                                    return next
                                                                                                                })
                                                                                                            }
                                                                                                        }}
                                                                                                        className={`fill-blank-input ${isSubmitted ? (ok ? 'correct' : 'incorrect') : ''}`}
                                                                                                    />
                                                                                                )
                                                                                            }
                                                                                        })
                                                                                        return nodes
                                                                                    })()}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>

                                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                <button
                                                                    type="button"
                                                                    className="exercise-check-button"
                                                                    onClick={() => {
                                                                        setSubmittedLexical(prev => {
                                                                            const next = prev.map(arr => [...arr])
                                                                            if (!next[originalIndex]) next[originalIndex] = []
                                                                            next[originalIndex] = next[originalIndex].map(() => true)
                                                                            return next
                                                                        })
                                                                    }}
                                                                >
                                                                    Check
                                                                </button>
                                                            </div>

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

                        {/* Grammar */}
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

                                    <div className="grammar-exercise">
                                        {(() => {
                                            const allAnswersCorrect = block.examples.every((ex, i) => {
                                                const blanks = (ex.match(/_{2,}/g) || []).length
                                                const ansType = getGrammarAnswerType(blockIndex)
                                                const ansBlock = lesson.grammar_answers?.find(b => b.type === ansType)
                                                const raw = ansBlock?.answer?.[i] || ''
                                                const correctAnswers = raw.split(/[,;]/).map(a => a.trim().toLowerCase()).filter(Boolean)
                                                const user = grammarAnswers[blockIndex]?.[i] || []
                                                const allFilled = user.every(a => a.trim() !== '')
                                                return allFilled && user.length >= blanks && user.every((ans, idx) =>
                                                    correctAnswers[idx] && ans.toLowerCase().trim() === correctAnswers[idx]
                                                )
                                            })
                                            const isExerciseSubmitted = submittedGrammar[blockIndex]?.some(s => s) || false

                                            return (
                                                <>
                                                    <div className="exercise-questions">
                                                        {block.examples.map((ex, i) => {
                                                            const blanks = (ex.match(/_{2,}/g) || []).length
                                                            const hasBlanks = blanks > 0

                                                            if (grammarAnswers[blockIndex] && grammarAnswers[blockIndex][i] && grammarAnswers[blockIndex][i].length !== (hasBlanks ? blanks : 1)) {
                                                                const newAnswers = [...grammarAnswers]
                                                                newAnswers[blockIndex] = [...(newAnswers[blockIndex] || [])]
                                                                newAnswers[blockIndex][i] = hasBlanks
                                                                    ? Array.from({ length: blanks }, (_, bi) => newAnswers[blockIndex][i]?.[bi] || '')
                                                                    : ['']
                                                                setGrammarAnswers(newAnswers)
                                                            }

                                                            const ansType = getGrammarAnswerType(blockIndex)
                                                            const ansBlock = lesson.grammar_answers?.find(b => b.type === ansType)
                                                            const raw = ansBlock?.answer?.[i] || ''
                                                            const correctAnswers = raw.split(/[,;]/).map(a => a.trim().toLowerCase()).filter(Boolean)
                                                            const user = grammarAnswers[blockIndex]?.[i] || []
                                                            const allFilled = user.every(a => a.trim() !== '')
                                                            const isCorrect = allFilled && user.every((ans, idx) =>
                                                                correctAnswers[idx] && ans.toLowerCase().trim() === correctAnswers[idx]
                                                            )
                                                            const isSubmitted = submittedGrammar[blockIndex]?.[i] || false

                                                            return (
                                                                <div key={`gram-ex-${i}`} className="grammar-question">
                                                                    {hasBlanks ? (
                                                                        <div>
                                                                            <p className="grammar-sentence">
                                                                                {i + 1}. {(() => {
                                                                                const parts = ex.split('______')
                                                                                const nodes: React.ReactNode[] = []
                                                                                parts.forEach((part, pi) => {
                                                                                    if (part.trim()) nodes.push(<span key={`text-${pi}`}>{part}</span>)
                                                                                    if (pi < parts.length - 1) {
                                                                                        const userAns = user[pi] || ''
                                                                                        const ok = correctAnswers[pi] && userAns.toLowerCase().trim() === correctAnswers[pi]
                                                                                        nodes.push(
                                                                                            <input
                                                                                                key={`input-${pi}`}
                                                                                                type="text"
                                                                                                value={userAns}
                                                                                                style={{ width: `${calculateInputWidth(userAns)}px` }}
                                                                                                onChange={(e) => {
                                                                                                    const val = e.target.value
                                                                                                    setGrammarAnswers(prev => {
                                                                                                        const next = prev.map(b => b.map(exArr => [...exArr]))
                                                                                                        if (!next[blockIndex]) next[blockIndex] = []
                                                                                                        if (!next[blockIndex][i]) next[blockIndex][i] = []
                                                                                                        next[blockIndex][i][pi] = val
                                                                                                        return next
                                                                                                    })
                                                                                                    if (isSubmitted) {
                                                                                                        setSubmittedGrammar(prev => {
                                                                                                            const next = prev.map(arr => [...arr])
                                                                                                            if (!next[blockIndex]) next[blockIndex] = []
                                                                                                            next[blockIndex][i] = false
                                                                                                            return next
                                                                                                        })
                                                                                                    }
                                                                                                }}
                                                                                                className={`grammar-input ${isSubmitted ? (ok ? 'correct' : 'incorrect') : ''}`}
                                                                                            />
                                                                                        )
                                                                                    }
                                                                                })
                                                                                return nodes
                                                                            })()}
                                                                            </p>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <p className="grammar-sentence">{i + 1}. {ex}</p>
                                                                            <div style={{ marginTop: '10px' }}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={grammarAnswers[blockIndex]?.[i]?.[0] ?? ''}
                                                                                    onChange={(e) => {
                                                                                        const val = e.target.value
                                                                                        setGrammarAnswers(prev => {
                                                                                            const next = prev.map(b => b.map(exArr => [...exArr]))
                                                                                            if (!next[blockIndex]) next[blockIndex] = []
                                                                                            if (!next[blockIndex][i]) next[blockIndex][i] = ['']
                                                                                            next[blockIndex][i][0] = val
                                                                                            return next
                                                                                        })
                                                                                        if (isSubmitted) {
                                                                                            setSubmittedGrammar(prev => {
                                                                                                const next = prev.map(arr => [...arr])
                                                                                                if (!next[blockIndex]) next[blockIndex] = []
                                                                                                next[blockIndex][i] = false
                                                                                                return next
                                                                                            })
                                                                                        }
                                                                                    }}
                                                                                    placeholder="Введите ваш ответ здесь..."
                                                                                    className={`grammar-full-input ${isSubmitted ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                                                                                    aria-label="Введите полный ответ"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                        <button
                                                            type="button"
                                                            className="exercise-check-button"
                                                            onClick={() => {
                                                                setSubmittedGrammar(prev => {
                                                                    const next = prev.map(arr => [...arr])
                                                                    if (!next[blockIndex]) next[blockIndex] = []
                                                                    next[blockIndex] = next[blockIndex].map(() => true)
                                                                    return next
                                                                })
                                                            }}
                                                        >
                                                            Check
                                                        </button>
                                                    </div>

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

                    {/* Quizlet */}
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
                                        Открой Quizlet → «+» → «Flashcard set» → «Import». Вставь список ниже.
                                        Разделитель между словом и переводом — «comma», между карточками — «semicolon».
                                    </p>
                                    <div className="exercise-questions quizlet-questions">
                                        {lesson.quizlet.map((rawItem, i) => {
                                            const cleaned = sanitizeQuizletEntry(rawItem)
                                            if (!cleaned) return null
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

                    {/* Answers */}
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
                                            const ansBlock = ansType ? lesson.lexical_answers?.find(b => b.type === ansType) : undefined
                                            if (!ansBlock || !ansBlock.answer || ansBlock.answer.length === 0) return null
                                            return (
                                                <div key={`ans-lex-block-${bi}`} className="answer-block">
                                                    <p className="answer-type"><strong>Тип:</strong> {exBlock.type}</p>
                                                    <ol className="answer-list">
                                                        {ansBlock.answer.map((ans, i) => (
                                                            <li key={`ans-lex-${bi}-${i}`}><span>{ans}</span></li>
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
                                            const ansBlock = lesson.grammar_answers?.find(b => b.type === ansType)
                                            if (!ansBlock || !ansBlock.answer || ansBlock.answer.length === 0) return null
                                            return (
                                                <div key={`ans-gram-block-${bi}`} className="answer-block">
                                                    <p className="answer-type"><strong>Тип:</strong> {exBlock.type}</p>
                                                    <ol className="answer-list">
                                                        {ansBlock.answer.map((ans, i) => (
                                                            <li key={`ans-gram-${bi}-${i}`}><span>{ans}</span></li>
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

                {/* Vocabulary sidebar */}
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
