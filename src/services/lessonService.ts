import api from './api'

export interface GlossaryItem {
  expression: string
  quote: string
  translation: string
  explanation: string
  another_example: string
  time_code: number | null
}

export interface ExerciseBlock {
  type: string
  input?: string | null
  examples: string[]
}

export interface AnswersBlock {
  type: string
  answer: string[]
}

export interface PublicLesson {
  lesson_topic: string
  you_tube_url: string
  tag?: string
  language?: string
  glossary: GlossaryItem[]
  lexical_exercises: ExerciseBlock[]
  grammar_exercises: ExerciseBlock[]
  quizlet: string[]
  lexical_answers?: AnswersBlock[]
  grammar_answers?: AnswersBlock[]
}

export const lessonService = {
  async getPublicLessons(): Promise<PublicLesson[]> {
    const response = await api.get<any[]>('/lessons/public-lessons')
    const rawLessons = response.data || []

    const toSixUnderscores = (s: string): string => s.replace(/_{2,}/g, '______')

    const lessons: PublicLesson[] = rawLessons.map((raw) => {
      // glossary transform
      const glossary: GlossaryItem[] = (raw.glossary || []).map((g: any) => ({
        expression: g.term ?? '',
        quote: g.quote ?? '',
        translation: g.translation_ru ?? '',
        explanation: g.explanation_ru ?? '',
        another_example: g.another_example ?? '',
        time_code: typeof g.time_code === 'number' ? g.time_code : null,
      }))

      // lexical exercises transform
      const lexical_exercises: ExerciseBlock[] = []
      const lexical_answers: AnswersBlock[] = []
      const lex = raw.exercises?.lexical || {}

      if (lex.true_or_false?.items?.length) {
        lexical_exercises.push({
          type: 'True / False',
          input: lex.true_or_false.note ?? null,
          examples: lex.true_or_false.items.map((it: any) => it.sentence ?? '').filter(Boolean),
        })
        lexical_answers.push({
          type: 'truOrFalseAnswers',
          answer: lex.true_or_false.items.map((it: any) => String(it.answer ?? '')).filter(Boolean),
        })
      }

      if (lex.listen_and_mark?.items?.length) {
        lexical_exercises.push({
          type: 'Послушай и отметь слова из списка',
          input: lex.listen_and_mark.note ?? null,
          examples: lex.listen_and_mark.items.map((it: any) => it.sentence ?? '').filter(Boolean),
        })
      }

      if (lex.fill_in_the_blank?.items?.length) {
        lexical_exercises.push({
          type: 'Вставь пропущенное слово',
          input: lex.fill_in_the_blank.phrases_pool ?? null,
          examples: lex.fill_in_the_blank.items
            .map((it: any) => (it.sentence ? toSixUnderscores(String(it.sentence)) : ''))
            .filter(Boolean),
        })
        lexical_answers.push({
          type: 'fillTheBlankAnswers',
          answer: lex.fill_in_the_blank.items.map((it: any) => String(it.answer ?? '')).filter(Boolean),
        })
      }

      // grammar exercises transform (dynamic)
      const grammar_exercises: ExerciseBlock[] = []
      const grammar_answers: AnswersBlock[] = []
      const gr = raw.exercises?.grammar || {}

      const formatTitle = (key: string): string => {
        const map: Record<string, string> = {
          articles: 'Артикли',
          past_perfect: 'Past Perfect',
          present_continuous: 'Present Continuous',
        }
        if (map[key]) return map[key]
        // Fallback: prettify key
        const pretty = String(key)
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (m) => m.toUpperCase())
        return pretty
      }

      const grammarKeys = Object.keys(gr)
      grammarKeys.forEach((key, idx) => {
        const block = gr[key]
        if (block?.items?.length) {
          grammar_exercises.push({
            type: formatTitle(key),
            input: block.instructions ?? null,
            examples: block.items
              .map((it: any) => (it.sentence ? toSixUnderscores(String(it.sentence)) : ''))
              .filter(Boolean),
          })
          grammar_answers.push({
            type: `grammar${idx + 1}Answers`,
            answer: block.items.map((it: any) => String(it.answer ?? '')).filter(Boolean),
          })
        }
      })

      const quizlet: string[] = Array.isArray(raw.quizlet) ? raw.quizlet.slice() : []

      const lesson: PublicLesson = {
        lesson_topic: raw.lesson_theme ?? raw.lesson_topic ?? '',
        you_tube_url: raw.you_tube_url ?? '',
        tag: raw.tag ?? raw.lesson_tag ?? '',
        language: raw.language ?? raw.lesson_language ?? '',
        glossary,
        lexical_exercises,
        grammar_exercises,
        quizlet,
        lexical_answers,
        grammar_answers,
      }
      return lesson
    })

    return lessons
  },
}

export type { PublicLesson as LessonData }


