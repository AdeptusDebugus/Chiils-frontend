import axios from 'axios'

// Normalize base URL protocol to HTTPS when the site is served over HTTPS to avoid mixed content.
const rawApiBase = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}` : ''
const normalizedApiBase = (typeof window !== 'undefined' && window.location.protocol === 'https:')
  ? rawApiBase.replace(/^http:\/\//, 'https://')
  : rawApiBase

const API_BASE_URL = normalizedApiBase
  ? `${normalizedApiBase}/api/v1`
  : '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,// 10 seconds timeout
  withCredentials: true
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
  email: string
  youtubeLink: string
  language: string
  languageLevel: string
  grammarTopics: string[]
  preset: string
  segmentStartMin: number
  segmentEndMin: number
}

export interface CreateLessonResponse {
  success: boolean
  message: string
  lesson_id?: string
}

export interface LessonReadyResponse {
  success?: boolean
  message?: string
  is_ready?: boolean
  lesson_id?: string
  status?: string
}

export const createLesson = async (data: CreateLessonRequest): Promise<CreateLessonResponse> => {
  try {
    console.log('Sending createLesson request with data:', data)

    // Try different endpoint variations
    let response;
    response = await api.post<CreateLessonResponse>('/lessons/create-lesson', data)
    console.log('createLesson response:', response.data)
    return response.data
  } catch (error) {
    console.error('createLesson error:', error)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response.status, error.response.data)
        throw new Error(error.response.data?.message || `Server error: ${error.response.status}`)
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response from server - is backend running on port 8080?')
        throw new Error('No response from server. Please check your connection and ensure the backend is running on port 8080.')
      } else {
        // Something else happened
        console.error('Request setup error:', error.message)
        throw new Error('Request failed. Please try again.')
      }
    }
    throw new Error('An unexpected error occurred')
  }
}

export const checkLessonReady = async (lessonId: string): Promise<LessonReadyResponse> => {
  try {
    console.log('Checking lesson ready status for:', lessonId)

    const response = await api.get<any>(`/lessons/is-lesson-ready/${lessonId}`)

    console.log('checkLessonReady response:', response.data)

    // Handle both boolean and object responses
    const data = response.data
    const isReady = data === true || (typeof data === 'object' && data !== null && data.is_ready === true)
    const status = typeof data === 'object' && data !== null ? data.status : (isReady ? 'READY' : 'PROCESSING')

    const result: LessonReadyResponse = {
      success: true,
      is_ready: isReady,
      status: status,
      lesson_id: lessonId,
      message: status === 'ERROR' ? 'Lesson generation failed' : (isReady ? 'Lesson is ready' : 'Lesson is not ready')
    }

    console.log('checkLessonReady processed response:', result)
    return result
  } catch (error) {
    console.error('checkLessonReady error:', error)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response.status, error.response.data)
        throw new Error(error.response.data?.message || `Server error: ${error.response.status}`)
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response from server - is backend running on port 8080?')
        throw new Error('No response from server. Please check your connection and ensure the backend is running on port 8080.')
      } else {
        // Something else happened
        console.error('Request setup error:', error.message)
        throw new Error('Request failed. Please try again.')
      }
    }
    throw new Error('An unexpected error occurred')
  }
}

export default api
