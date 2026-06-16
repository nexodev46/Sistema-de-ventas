import api from './api'
import { auth } from './firebase'
import { firebaseAuthService } from './firebaseAuthService'
import { LoginResponse, User } from '../types/auth.types'

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Error en logout:', error)
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const currentUser = auth.currentUser
    if (!currentUser) return null

    const userData = await firebaseAuthService.getUserData(currentUser.uid)
    return userData ? {
      id: userData.uid,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol,
      activo: userData.activo,
      creadoEn: userData.creadoEn,
    } : null
  },

  validateToken: async (): Promise<boolean> => {
    try {
      await api.get('/auth/validate')
      return true
    } catch (error) {
      return false
    }
  },
}