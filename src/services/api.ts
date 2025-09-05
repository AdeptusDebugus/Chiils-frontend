import axios from 'axios'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

export interface CreateLessonRequest {
  name: string
  order_number: string
  youtube_links: string[]
  email: string
  telegram: string
  language_level: string
  grammar_topics: string[]
}

export interface CreateLessonResponse {
  success: boolean
  message: string
  lesson_id?: string
}

export const createLesson = async (data: CreateLessonRequest): Promise<CreateLessonResponse> => {
  try {
    const response = await api.post<CreateLessonResponse>('/lessons/create-lesson', data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.message || 'Server error occurred')
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from server. Please check your connection.')
      } else {
        // Something else happened
        throw new Error('Request failed. Please try again.')
      }
    }
    throw new Error('An unexpected error occurred')
  }
}

export default api
