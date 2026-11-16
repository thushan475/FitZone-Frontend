
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import authReducer, { logout, loginUser } from './authSlice'

const authListenerMiddleware = createListenerMiddleware()

authListenerMiddleware.startListening({
  actionCreator: loginUser.fulfilled,
  effect: async (action) => {
    localStorage.setItem('fitzone_token', action.payload.token)
    localStorage.setItem('fitzone_user', JSON.stringify(action.payload.user))
  },
})

authListenerMiddleware.startListening({
  actionCreator: logout,
  effect: async () => {
    localStorage.removeItem('fitzone_token')
    localStorage.removeItem('fitzone_user')
  },
})

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(authListenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
