import { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { type User as FirebaseUser } from 'firebase/auth'
import { AuthContextType, User } from '../types/auth.types'
import { firebaseAuthService } from '../services/firebaseAuthService'
import { auth } from '../services/firebase'
import { useSnackbar } from 'notistack'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await firebaseAuthService.getUserData(firebaseUser.uid)
        if (userData && userData.activo) {
          setUser({
            id: userData.uid,
            nombre: userData.nombre,
            email: userData.email,
            rol: userData.rol,
            activo: userData.activo,
            creadoEn: userData.creadoEn,
          })
        } else {
          await auth.signOut().catch(() => {})
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { userData } = await firebaseAuthService.login(email, password, rememberMe)
      if (userData) {
        setUser({
          id: userData.uid,
          nombre: userData.nombre,
          email: userData.email,
          rol: userData.rol,
          activo: userData.activo,
          creadoEn: userData.creadoEn,
        })
        enqueueSnackbar('Bienvenido de vuelta', { variant: 'success' })
      }
      return true
    } catch (error: any) {
      let msg = 'Credenciales incorrectas'
      if (error.code === 'auth/user-not-found') msg = 'Usuario no encontrado'
      else if (error.code === 'auth/wrong-password') msg = 'Contraseña incorrecta'
      else if (error.code === 'auth/invalid-email') msg = 'Correo inválido'
      else if (error.code === 'auth/user-disabled') msg = 'Tu cuenta ha sido deshabilitada. Contacta al administrador.'
      enqueueSnackbar(msg, { variant: 'error' })
      throw error
    }
  }

  const register = async (email: string, password: string, nombre: string, telefono?: string, direccion?: string) => {
    try {
      await firebaseAuthService.register(email, password, nombre, telefono, direccion)
      enqueueSnackbar('Registro exitoso. Ahora inicia sesión', { variant: 'success' })
      return true
    } catch (error: any) {
      let msg = 'Error al registrar'
      if (error.code === 'auth/email-already-in-use') msg = 'Este correo ya está registrado'
      else if (error.code === 'auth/weak-password') msg = 'Contraseña débil, usa al menos 6 caracteres'
      enqueueSnackbar(msg, { variant: 'error' })
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { userData } = await firebaseAuthService.signInWithGoogle()
      if (!userData) throw new Error('No se pudo obtener datos de usuario')

      setUser({
        id: userData.uid,
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol,
        activo: userData.activo,
        creadoEn: userData.creadoEn,
      })
      enqueueSnackbar('Inicio de sesión con Google exitoso', { variant: 'success' })
      return true
    } catch (error: any) {
      let msg = 'No se pudo iniciar sesión con Google'
      if (error.code === 'auth/user-disabled') msg = 'Tu cuenta ha sido deshabilitada. Contacta al administrador.'
      enqueueSnackbar(msg, { variant: 'error' })
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await firebaseAuthService.resetPassword(email)
      enqueueSnackbar('Correo de restablecimiento enviado', { variant: 'success' })
    } catch (error: any) {
      let msg = 'No se pudo enviar el correo de restablecimiento'
      if (error.code === 'auth/user-not-found') msg = 'Usuario no encontrado'
      else if (error.code === 'auth/invalid-email') msg = 'Correo inválido'
      enqueueSnackbar(msg, { variant: 'error' })
      throw error
    }
  }

  const signInWithFacebook = async () => {
    try {
      const { userData } = await firebaseAuthService.signInWithFacebook()
      if (!userData) throw new Error('No se pudo obtener datos de usuario')

      setUser({
        id: userData.uid,
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol,
        activo: userData.activo,
        creadoEn: userData.creadoEn,
      })
      enqueueSnackbar('Inicio de sesión con Facebook exitoso', { variant: 'success' })
      return true
    } catch (error: any) {
      let msg = 'No se pudo iniciar sesión con Facebook'
      if (error.code === 'auth/user-disabled') msg = 'Tu cuenta ha sido deshabilitada. Contacta al administrador.'
      enqueueSnackbar(msg, { variant: 'error' })
      throw error
    }
  }

  const refreshUserData = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return

    const userData = await firebaseAuthService.getUserData(currentUser.uid)
    if (userData) {
      setUser({
        id: userData.uid,
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol,
        activo: userData.activo,
        creadoEn: userData.creadoEn,
      })
    }
  }

  const logout = async () => {
    await firebaseAuthService.logout()
    setUser(null)
    enqueueSnackbar('Sesión cerrada', { variant: 'info' })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, signInWithGoogle, signInWithFacebook, resetPassword, refreshUserData, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}