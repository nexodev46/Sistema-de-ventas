export type UserRole = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'ALMACEN'

export interface User {
  id: string
  nombre: string
  email: string
  rol: UserRole
  activo: boolean
  creadoEn: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  register: (email: string, password: string, nombre: string, telefono?: string, direccion?: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  signInWithFacebook: () => Promise<boolean>
  refreshUserData: () => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}