import axios from 'axios'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface CreateLessonRequest {
  name: string
  order_number: string
  youtube_links: string[]
  email: string
  telegram: string
  language_level: string
  grammar_topics: string[]
  language: string
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
