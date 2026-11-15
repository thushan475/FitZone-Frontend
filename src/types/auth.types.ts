
export type UserRole = 'ADMIN' | 'TRAINER' | 'MEMBER'

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: UserRole
  isActive: boolean
  specialization?: string
  experience?: number
  qualifications?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}
