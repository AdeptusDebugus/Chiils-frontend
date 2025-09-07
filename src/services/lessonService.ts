import api from './api'

export interface GlossaryItem {
  expression: string
  quote: string
  translation: string
  explanation: string
  example: string
  time_code: number | null
}

export interface ExerciseBlock {
  type: string
  input?: string | null
  examples: string[]
}

export interface PublicLesson {
  you_tube_url: string
  glossary: GlossaryItem[]
  lexical_exercises: ExerciseBlock[]
  grammar_exercises: ExerciseBlock[]
  quizlet: string[]
  answers: {
    lexical_exercises: string[]
    grammar_exercises: string[]
  }
}

export const lessonService = {
  async getPublicLessons(): Promise<PublicLesson[]> {
    const response = await api.get<PublicLesson[]>('/lessons/public-lessons')
    return response.data
  },
}

export type { PublicLesson as LessonData }


