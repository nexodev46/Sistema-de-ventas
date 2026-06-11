import api from './api'
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

  getCurrentUser: (): User | null => {
    const token = localStorage.getItem('token')
    if (!token) return null
    
    try {
      // Decodificar token JWT para obtener info del usuario
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        id: payload.sub,
        nombre: payload.nombre,
        email: payload.email,
        rol: payload.rol,
        activo: true,
        creadoEn: new Date().toISOString(),
      }
    } catch (error) {
      return null
    }
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