// src/services/lessonService.ts
import api from './api'

// ===== History Types =====
export interface HistoryItem {
    lessonId: string
    youtubeUrl: string
    lessonTopic: string
    tags: string[]
    createdAt: string
    lastOpenedAt: string | null
    // Add compatible fields for LessonLite if needed for reuse, or map later
}

export interface HistoryResponse {
    recent: HistoryItem[]
    lastWeek: HistoryItem[]
    thisMonth: HistoryItem[]
}

// ===== Типы карточки (списка) =====
export interface Tags {
    lesson_theme: string
    language: string
    language_level: string
    lexical_fields: string[]
    style: string
    grammar_topics: string[]
}

export interface LessonLite {
    id: string
    youtube_url: string | null
    lesson_topic: string | null
    created_at: string
    tags?: Tags
    you_tube_title?: string // будем кэшировать заголовок YouTube на фронте
    duration?: string
    status?: string
}

// ===== Сырые типы полного урока (как приходит с бэка) =====
interface RawLexicalTrueFalseItem { sentence: string; answer: string }
interface RawLexicalListenItem { sentence: string; answer: string | null }
interface RawLexicalFillItem { sentence: string; answer: string } // одиночный ответ

interface RawLessonFull {
    id: string
    youtube_url: string | null
    lesson_topic: string | null
    tags: Tags
    grammar_topics?: string[] | null
    created_at: string
    data: {
        language?: string
        language_level?: string
        transcript_text?: string
        language_filter?: {
            target_language: string
            ignore_other_languages: boolean
        }
        tags?: Tags
        grammar_topics?: string[] | null
        glossary?: Array<{
            term: string
            quote: string
            translation_ru: string
            explanation_ru: string
            another_example: string
            time_code: number | null
        }>
        exercises?: {
            lexical?: {
                true_or_false?: {
                    phrases_paragraph?: string | null
                    note?: string | null
                    items: RawLexicalTrueFalseItem[]
                }
                listen_and_mark?: {
                    phrases_paragraph?: string | null
                    note?: string | null
                    items: RawLexicalListenItem[]
                }
                fill_in_the_blank?: {
                    phrases_paragraph?: string | null
                    note?: string | null
                    items: RawLexicalFillItem[]
                }
            }
            grammar?: Array<{
                topic: string
                instructions?: string
                items: Array<{ sentence: string; answer: string }>
            }>
        }
        quizlet?: string[]
        you_tube_url?: string
    }
}

// ===== Ожидаемая «фронтовая» схема для LessonPage =====
export interface LessonData {
    id: string
    you_tube_title?: string
    youtube_url: string | null
    lesson_topic: string | null
    tags: Tags
    created_at: string

    // для совместимости со старым кодом
    you_tube_url?: string | null

    glossary: Array<{
        expression: string
        translation: string
        quote: string
        explanation: string
        another_example: string
        time_code: number | null
    }>

    lexical_exercises: Array<{
        type: string
        examples: string[]
        input?: string | null
    }>
    lexical_answers?: Array<{
        type: 'truOrFalseAnswers' | 'fillTheBlankAnswers'
        answer: string[]
    }>

    grammar_exercises: Array<{
        type: string // topic
        input?: string
        examples: string[]
    }>
    grammar_answers?: Array<{
        type: string // grammar1Answers, grammar2Answers, ...
        answer: string[]
    }>

    quizlet: string[]
}

// ===== Маппер полного урока Raw -> LessonData =====
function mapRawToLesson(raw: RawLessonFull): LessonData {
    const ex = raw.data.exercises ?? {}
    const lex = ex.lexical ?? {}

    const lexical_exercises: LessonData['lexical_exercises'] = []
    const lexical_answers: NonNullable<LessonData['lexical_answers']> = []

    // True/False
    if (lex.true_or_false?.items?.length) {
        lexical_exercises.push({
            type: 'True or False',
            examples: lex.true_or_false.items.map(i => i.sentence),
            input: lex.true_or_false.note ?? null,
        })
        lexical_answers.push({
            type: 'truOrFalseAnswers',
            answer: lex.true_or_false.items.map(i => i.answer.trim()),
        })
    }

    // Listen and mark
    if (lex.listen_and_mark?.items?.length) {
        lexical_exercises.push({
            type: 'Послушай и отметь слова из списка',
            examples: lex.listen_and_mark.items.map(i => i.sentence),
            input: lex.listen_and_mark.note ?? null,
        })
    }

    // Fill-in-the-blank (одиночные ответы)
    if (lex.fill_in_the_blank?.items?.length) {
        lexical_exercises.push({
            type: 'Вставь пропущенное (fill-in-the-blank)',
            examples: lex.fill_in_the_blank.items.map(i =>
                i.sentence.includes('___') || i.sentence.includes('______')
                    ? i.sentence.replace(/___+/g, '______')
                    : i.sentence.replace(/(___+)/g, '______')
            ),
            input: lex.fill_in_the_blank.note ?? null,
        })
        lexical_answers.push({
            type: 'fillTheBlankAnswers',
            answer: lex.fill_in_the_blank.items.map(i => i.answer.trim()),
        })
    }

    // Грамматика
    const grammar_exercises: LessonData['grammar_exercises'] = []
    const grammar_answers: NonNullable<LessonData['grammar_answers']> = []

    if (ex.grammar?.length) {
        ex.grammar.forEach((g, idx) => {
            grammar_exercises.push({
                type: g.topic,
                input: g.instructions,
                examples: g.items.map(i =>
                    i.sentence.includes('___') || i.sentence.includes('______')
                        ? i.sentence.replace(/___+/g, '______')
                        : i.sentence.replace(/\(___*\)|_+/g, '______')
                ),
            })
            grammar_answers.push({
                type: `grammar${idx + 1}Answers`,
                answer: g.items.map(i => i.answer.trim()),
            })
        })
    }

    // Глоссарий
    const glossary = (raw.data.glossary ?? []).map(item => ({
        expression: item.term,
        translation: item.translation_ru,
        quote: item.quote,
        explanation: item.explanation_ru,
        another_example: item.another_example,
        time_code: item.time_code ?? null,
    }))

    const quizlet = raw.data.quizlet ?? []

    return {
        id: raw.id,
        youtube_url: raw.youtube_url,
        you_tube_url: raw.youtube_url, // fallback для старого кода
        lesson_topic: raw.lesson_topic,
        tags: raw.tags,
        created_at: raw.created_at,

        glossary,
        lexical_exercises,
        lexical_answers: lexical_answers.length ? lexical_answers : undefined,

        grammar_exercises,
        grammar_answers: grammar_answers.length ? grammar_answers : undefined,

        quizlet,
    }
}

// ===== API =====
export async function getLessonsLite(params: {
    page?: number
    size?: number
    sort?: string
} = {}): Promise<LessonLite[]> {
    const {
        page = 0, // бэкенд ждёт 0-based
        size = 24,
        sort = '-createdAt',
    } = params

    const res = await api.get<LessonLite[]>('/lessons/public-lessons', {
        params: { page, size, sort },
    })
    return res.data || []
}

export async function getUserLessonsLite(params: {
    page?: number
    size?: number
    sort?: string
    email?: string
} = {}): Promise<LessonLite[]> {
    const {
        page = 0,
        size = 24,
        sort = '-createdAt',
        email,
    } = params

    const res = await api.get<LessonLite[]>('/lessons/public-lessons', {
        params: { page, size, sort, email },
    })
    return res.data || []
}

export async function getLessonFull(id: string): Promise<LessonData> {
    const res = await api.get<RawLessonFull>(`/lessons/${id}`)
    return mapRawToLesson(res.data)
}

export async function openLesson(lessonId: string): Promise<void> {
    const token = localStorage.getItem('jwt_token')
    await api.post(`/history/lesson/${lessonId}/open`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
}

export async function getHistory(params: {
    statuses?: string[]
    access?: string
    page?: number
    size?: number
} = {}): Promise<HistoryResponse> {
    const {
        page = 0,
        size = 20,
    } = params

    // Only add params if they exist/are needed. The contract mentions status/access defaults.
    const token = localStorage.getItem('jwt_token')
    const res = await api.get<HistoryResponse>('/history', {
        params: { page, size },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return res.data
}

// ===== Likes API =====

export async function getLikedLessonIds(): Promise<string[]> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return []
    try {
        const res = await api.get<string[]>('/likes/ids', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return res.data
    } catch (e) {
        console.error('Failed to get liked ids', e)
        return []
    }
}

export interface LikedLessonLite {
    lesson_id: string
    youtube_url: string
    lesson_topic: string | null
    tags: Tags
    created_at: string
}

export async function getLikedLessons(): Promise<LikedLessonLite[]> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return []
    try {
        const res = await api.get<LikedLessonLite[]>('/likes', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return res.data
    } catch (e) {
        console.error('Failed to get liked lessons', e)
        return []
    }
}

export async function likeLesson(lessonId: string): Promise<void> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    await api.post(`/likes/${lessonId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export async function unlikeLesson(lessonId: string): Promise<void> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    await api.delete(`/likes/${lessonId}/like`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

export async function getTotalLikes(): Promise<number> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return 0
    // Contract says: GET /api/v1/likes/total
    // But backend response format isn't fully specified (number vs {total: number}).
    // Often "count" endpoints return a direct number or an object.
    // Let's assume it returns a number based on previous patterns or handle text.
    // If it returns JSON { count: 10 } or just 10.
    // Safest is to check response type.
    try {
        const res = await api.get<number | { total: number }>('/likes/total', {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (typeof res.data === 'number') return res.data
        if (typeof res.data === 'object' && res.data !== null && 'total' in res.data) return (res.data as any).total
        return 0
    } catch (e) {
        console.error('Failed to get total likes', e)
        return 0
    }
}

export async function getTotalHistory(): Promise<number> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return 0
    try {
        const res = await api.get<number | { total: number }>('/history/total', {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (typeof res.data === 'number') return res.data
        if (typeof res.data === 'object' && res.data !== null && 'total' in res.data) return (res.data as any).total
        return 0
    } catch (e) {
        console.error('Failed to get total history', e)
        return 0
    }
}

export async function addLessonWords(lessonId: string): Promise<void> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    try {
        await api.post('/words/add', null, {
            params: { lessonId },
            headers: { Authorization: `Bearer ${token}` }
        })
    } catch (e) {
        console.error('Failed to add lesson words to word bank', e)
    }
}

// ===== Word Bank API =====

export interface Word {
    id: string
    lesson_id: string
    term: string
    quote: string
    translation: string
    translated_explanation: string
    another_example: string
    time_code: number | null
}

export interface WordBankResponse {
    content: Word[]
    totalPages: number
    totalElements: number
    last: boolean
    first: boolean
    size: number
    number: number
    numberOfElements: number
    empty: boolean
}

export async function getWordBank(params: {
    page?: number
    size?: number
    sortBy?: string
    sortDir?: 'asc' | 'desc'
} = {}): Promise<WordBankResponse> {
    const {
        page = 0,
        size = 50,
        sortBy = 'createdAt',
        sortDir = 'desc'
    } = params

    const token = localStorage.getItem('jwt_token')
    const res = await api.get<WordBankResponse>('/words/bank', {
        params: { page, size, sortBy, sortDir },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return res.data
}

export async function shareLesson(lessonId: string, studentId: string): Promise<void> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    await api.post(`/lessons/${lessonId}/share`, null, {
        params: { studentId },
        headers: { Authorization: `Bearer ${token}` }
    })
}

export async function unshareLesson(lessonId: string, studentId: string): Promise<void> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    await api.delete(`/lessons/${lessonId}/unshare`, {
        params: { studentId },
        headers: { Authorization: `Bearer ${token}` }
    })
}

export async function getSharedUsers(lessonId: string): Promise<any[]> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return []
    try {
        const res = await api.get<any[]>(`/lessons/${lessonId}/shared-users`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return res.data
    } catch (e) {
        console.error('Failed to get shared users', e)
        return []
    }
}

export async function getSharedLessons(): Promise<LessonLite[]> {
    const token = localStorage.getItem('jwt_token')
    if (!token) return []
    try {
        const res = await api.get<LessonLite[]>('/lessons/shared', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return res.data
    } catch (e) {
        console.error('Failed to get shared lessons', e)
        return []
    }
}
