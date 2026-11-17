import axios, { type InternalAxiosRequestConfig } from 'axios'
import { store } from '../store/store'
import { logout, setToken } from '../store/authSlice'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string> | null = null

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitzone_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const excludedEndpoints = [
      '/auth/login',
      '/auth/refresh',
      '/auth/logout',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
    ]

    if (
      excludedEndpoints.some((endpoint) =>
        originalRequest.url?.startsWith(endpoint),
      ) ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshApi
          .post('/auth/refresh')
          .then((response) => {
            const newToken = response.data.data.token as string

            if (!newToken) {
              throw new Error('Refresh token response is invalid')
            }

            store.dispatch(setToken(newToken))
            localStorage.setItem('fitzone_token', newToken)

            return newToken
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const newToken = await refreshPromise

      originalRequest.headers.Authorization = `Bearer ${newToken}`

      return api(originalRequest)
    } catch (refreshError) {
      store.dispatch(logout())
      window.location.href = '/login'

      return Promise.reject(refreshError)
    }
  },
)

export default api
