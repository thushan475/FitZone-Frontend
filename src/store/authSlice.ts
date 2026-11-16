
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'
import type { LoginCredentials, LoginResponse, User } from '../types/auth.types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

export const loginUser = createAsyncThunk<
  LoginResponse['data'],
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<LoginResponse>(
        '/auth/login',
        credentials,
      )

      return response.data.data
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const apiError = error as {
          response?: { data?: { message?: string } }
        }

        return rejectWithValue(
          apiError.response?.data?.message || 'Login failed',
        )
      }

      return rejectWithValue('Unable to connect to the server')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Login failed'
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions

export default authSlice.reducer
